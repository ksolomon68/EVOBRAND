const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');
const { notifyAdmins } = require('../utils/notifications');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_EMAIL || 'ks@evobrand.net';

// Ensure payment_status columns exist on contracts and support_tickets
const ensurePaymentColumns = async () => {
  try {
    await pool.query(
      "ALTER TABLE contracts ADD COLUMN payment_status ENUM('unpaid','paid') DEFAULT 'unpaid'"
    );
  } catch (e) {} // already exists
  try {
    // 'deposit_paid' sits between 'unpaid' and 'paid' for contracts billed
    // as a 50% upfront deposit + 50% final balance once work is complete.
    await pool.query(
      "ALTER TABLE contracts MODIFY COLUMN payment_status ENUM('unpaid','deposit_paid','paid') DEFAULT 'unpaid'"
    );
  } catch (e) {}
  try {
    await pool.query(
      "ALTER TABLE contracts ADD COLUMN stripe_session_id VARCHAR(255)"
    );
  } catch (e) {}
  try {
    // Set by an admin once the work tied to a split-payment contract is
    // done — unlocks the final-balance checkout for the client.
    await pool.query(
      "ALTER TABLE contracts ADD COLUMN final_payment_requested_at TIMESTAMP NULL"
    );
  } catch (e) {}
  try {
    await pool.query(
      "ALTER TABLE support_tickets ADD COLUMN stripe_session_id VARCHAR(255)"
    );
  } catch (e) {}
};

ensurePaymentColumns();

// A contract is split-pay if the admin set the explicit flag (upload flow)
// or chose the "50% upfront, 50% on delivery" payment structure in the
// contract builder — the same string already shown on the agreement itself.
const isSplitPayment = (contractData) =>
  contractData?.project?.paymentSplit === true ||
  contractData?.project?.payment === '50% upfront, 50% on delivery';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/create-checkout-session
// Body: { type: 'contract' | 'ticket', id: number, amount: number, description: string }
// For contracts, the amount actually charged is always computed here from the
// contract's own stored fee and payment state — the client-supplied `amount`
// is only used (as before) for tickets, where there is no stored fee to check it against.
// Returns: { url } — the Stripe Checkout hosted page URL
// ─────────────────────────────────────────────────────────────────────────────
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  const { type, id, amount, description } = req.body;

  if (!type || !id) {
    return res.status(400).json({ error: 'type and id are required' });
  }

  if (!['contract', 'ticket'].includes(type)) {
    return res.status(400).json({ error: 'type must be "contract" or "ticket"' });
  }

  let amountCents;
  let stage = 'full';
  let contract = null;

  try {
    if (type === 'contract') {
      const [rows] = await pool.query('SELECT * FROM contracts WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Contract not found' });
      contract = rows[0];
      if (contract.client_user_id !== req.user.id && contract.client_email !== req.user.email) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const contractData = typeof contract.contract_data === 'string'
        ? JSON.parse(contract.contract_data)
        : contract.contract_data;
      const feeCents = Math.round((Number(contractData?.project?.fee) || 0) * 100);
      if (isNaN(feeCents) || feeCents < 50) {
        return res.status(400).json({ error: 'This contract has no amount due' });
      }

      if (isSplitPayment(contractData)) {
        const depositCents = Math.round(feeCents / 2);
        const finalCents = feeCents - depositCents;
        if (!contract.payment_status || contract.payment_status === 'unpaid') {
          amountCents = depositCents;
          stage = 'deposit';
        } else if (contract.payment_status === 'deposit_paid') {
          if (!contract.final_payment_requested_at) {
            return res.status(403).json({ error: "The remaining balance unlocks once EVOBRAND marks this contract's work complete." });
          }
          amountCents = finalCents;
          stage = 'final';
        } else {
          return res.status(400).json({ error: 'This contract is already fully paid' });
        }
      } else {
        if (contract.payment_status === 'paid') {
          return res.status(400).json({ error: 'This contract is already fully paid' });
        }
        amountCents = feeCents;
        stage = 'full';
      }
    } else {
      const [rows] = await pool.query('SELECT * FROM support_tickets WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
      const ticket = rows[0];
      if (ticket.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'A positive amount is required' });
      }
      amountCents = Math.round(parseFloat(amount) * 100);
      if (isNaN(amountCents) || amountCents < 50) {
        return res.status(400).json({ error: 'Amount must be at least $0.50' });
      }
    }
  } catch (err) {
    console.error('Payment auth check error:', err);
    return res.status(500).json({ error: 'Server error verifying access' });
  }

  const origin = process.env.APP_URL || 'https://evobrandconcepts.com';
  const successUrl = `${origin}/client-portal?payment=success&type=${type}&id=${id}`;
  const cancelUrl  = `${origin}/client-portal?payment=cancelled`;

  const baseName = description || (type === 'contract' ? `Contract #${id}` : `Support Ticket #${id}`);
  const stageSuffix = stage === 'deposit' ? ' — 50% Deposit' : stage === 'final' ? ' — Final Balance' : '';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${baseName}${stageSuffix}`,
              description: `EVOBRAND Concepts LLC — ${type === 'contract' ? 'Contract' : 'Ticket'} payment`,
              images: [`${origin}/logo.png`],
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: { type, id: String(id), userId: String(req.user.id), stage },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // Store session id so we can verify it later
    if (type === 'contract') {
      await pool.query('UPDATE contracts SET stripe_session_id = ? WHERE id = ?', [session.id, id]);
    } else {
      await pool.query('UPDATE support_tickets SET stripe_session_id = ? WHERE id = ?', [session.id, id]);
    }

    res.json({ url: session.url, sessionId: session.id, stage });
  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ error: 'Failed to create payment session', details: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/verify-session?sessionId=cs_xxx&type=contract&id=1
// Called after Stripe redirects back — marks the record as paid if session succeeded
// ─────────────────────────────────────────────────────────────────────────────
router.get('/verify-session', authenticateToken, async (req, res) => {
  const { sessionId, type, id } = req.query;

  if (!sessionId || !type || !id) {
    return res.status(400).json({ error: 'sessionId, type, and id are required' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed', status: session.payment_status });
    }

    // Mark as paid in the DB
    if (type === 'contract') {
      const stage = session.metadata?.stage;
      const newStatus = stage === 'deposit' ? 'deposit_paid' : 'paid';
      const [result] = await pool.query(
        'UPDATE contracts SET payment_status = ? WHERE id = ? AND stripe_session_id = ?',
        [newStatus, id, sessionId]
      );

      // Notify admins the first time this session lands (re-verifies on a
      // refreshed success page shouldn't re-fire the email/notification).
      if (result.affectedRows > 0) {
        const [rows] = await pool.query('SELECT title FROM contracts WHERE id = ?', [id]);
        const contractTitle = rows[0]?.title || `Contract #${id}`;
        const amountPaid = typeof session.amount_total === 'number' ? (session.amount_total / 100).toFixed(2) : '';
        const label = stage === 'deposit' ? '50% deposit' : stage === 'final' ? 'final balance' : 'full balance';

        await notifyAdmins(
          'Contract Payment Received',
          `${req.user.name || req.user.email || 'A client'} paid the ${label} ($${amountPaid}) on contract: ${contractTitle}`,
          '/client-portal',
          'contract'
        ).catch(err => console.error('Contract payment admin notification failed:', err));

        sendEmail({
          from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
          to: ADMIN_NOTIFY_EMAIL,
          subject: `Payment Received: ${contractTitle}`,
          html: getEmailTemplate('Payment Received', `<p><strong>${req.user.name || req.user.email || 'A client'}</strong> just paid the <strong>${label}</strong> of <strong>$${amountPaid}</strong> on contract: ${contractTitle}.</p>`)
        }).catch(err => console.error('Contract payment admin email failed:', err));
      }
    } else {
      const [result] = await pool.query(
        "UPDATE support_tickets SET is_paid = 1 WHERE id = ? AND stripe_session_id = ?",
        [id, sessionId]
      );

      // Alert admins the first time this session marks the ticket paid —
      // affectedRows is 0 on a re-verify of an already-paid ticket, so this
      // fires once per payment rather than on every polling call.
      if (result.affectedRows > 0) {
        const [rows] = await pool.query(
          'SELECT t.subject, u.name AS user_name, u.email AS user_email FROM support_tickets t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = ?',
          [id]
        );
        const ticket = rows[0] || {};
        const amountPaid = typeof session.amount_total === 'number' ? (session.amount_total / 100).toFixed(2) : '';

        await notifyAdmins(
          'Ticket Payment Received',
          `${ticket.user_name || ticket.user_email || 'A client'} paid $${amountPaid} for ticket #${id}: ${ticket.subject || ''}`,
          '/client-portal',
          'ticket'
        );

        sendEmail({
          from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
          to: ADMIN_NOTIFY_EMAIL,
          subject: `Payment Received: Ticket #${id}`,
          html: getEmailTemplate('Payment Received', `<p><strong>${ticket.user_name || ticket.user_email || 'A client'}</strong> just paid <strong>$${amountPaid}</strong> for ticket #${id}: ${ticket.subject || ''}.</p>
               <p>The ticket has been marked as <strong>Paid</strong> in the client portal.</p>`)
        }).catch(err => console.error('Ticket payment admin email failed:', err));
      }
    }

    res.json({ success: true, paymentStatus: session.payment_status });
  } catch (err) {
    console.error('Stripe verify error:', err);
    res.status(500).json({ error: 'Failed to verify payment', details: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/publishable-key
// Safe endpoint for the frontend to fetch the publishable key
// ─────────────────────────────────────────────────────────────────────────────
router.get('/publishable-key', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Predefined plans map
const PUBLIC_PLANS = {
  'ai-starter': { name: 'AI Applications - Starter Plan', price: 5000, type: 'one-time' },
  'ai-professional': { name: 'AI Applications - Professional Plan', price: 15000, type: 'one-time' },
  'visual-starter': { name: 'AI Visual Content - Starter Plan', price: 2000, type: 'one-time' },
  'visual-professional': { name: 'AI Visual Content - Professional Plan', price: 5000, type: 'one-time' },
  'document-starter': { name: 'Document Generation - Starter Plan', price: 3000, type: 'one-time' },
  'document-professional': { name: 'Document Generation - Professional Plan', price: 8000, type: 'one-time' },
  'video-starter': { name: 'AI Video Production - Starter Plan', price: 4000, type: 'one-time' },
  'video-professional': { name: 'AI Video Production - Professional Plan', price: 10000, type: 'one-time' },
  'wordpress-starter': { name: 'WordPress Development - Starter Plan', price: 3000, type: 'one-time' },
  'wordpress-professional': { name: 'WordPress Development - Professional Plan', price: 8000, type: 'one-time' },
  'accessibility-audit': { name: 'WCAG Accessibility - Audit Only', price: 2500, type: 'one-time' },
  'accessibility-remediation': { name: 'WCAG Accessibility - Remediation', price: 7500, type: 'one-time' },
  'maintenance-basic': { name: 'WordPress Maintenance - Basic Plan', price: 129, type: 'recurring' },
  'maintenance-pro': { name: 'WordPress Maintenance - Pro Plan', price: 299, type: 'recurring' },
  'maintenance-elite': { name: 'WordPress Maintenance - Elite Plan', price: 749, type: 'recurring' }
};

const { sendEmail } = require('../utils/mailer');
const { getEmailTemplate } = require('../utils/emailTemplate');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Annual billing pays 10 months' rate for 12 months of service (2 months
// free) — matches the discount shown on the public maintenance-plans page.
const ANNUAL_MONTHS_CHARGED = 10;

router.post('/public-checkout', async (req, res) => {
  const { planId, email, name, interval } = req.body;

  if (!planId || !email || !name) {
    return res.status(400).json({ error: 'planId, email, and name are required' });
  }

  const plan = PUBLIC_PLANS[planId];
  if (!plan) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  // The client only requests month vs. year — price is always computed here
  // from PUBLIC_PLANS, never taken from the request body.
  const billingInterval = plan.type === 'recurring' && interval === 'year' ? 'year' : 'month';
  const isAnnual = plan.type === 'recurring' && billingInterval === 'year';
  const amountCents = isAnnual ? plan.price * ANNUAL_MONTHS_CHARGED * 100 : plan.price * 100;
  const displayName = isAnnual ? `${plan.name} (Annual)` : plan.name;
  const origin = process.env.APP_URL || 'https://evobrandconcepts.com';

  // URL to redirect client on success
  const successUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&planId=${planId}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;
  const cancelUrl = `${origin}/services`;

  try {
    const sessionData = {
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: displayName,
              description: `EVOBRAND Concepts LLC — ${displayName} Purchase`,
              images: [`${origin}/logo.png`],
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planId,
        clientName: name,
        clientEmail: email,
        isPublic: 'true',
        billingInterval,
      }
    };

    if (plan.type === 'recurring') {
      sessionData.mode = 'subscription';
      sessionData.line_items[0].price_data.recurring = { interval: billingInterval };
    } else {
      sessionData.mode = 'payment';
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe public session error:', err);
    res.status(500).json({ error: 'Failed to create payment session', details: err.message });
  }
});

router.post('/verify-public-session', async (req, res) => {
  const { sessionId, planId, email, name } = req.body;

  if (!sessionId || !planId || !email || !name) {
    return res.status(400).json({ error: 'sessionId, planId, email, and name are required' });
  }

  const plan = PUBLIC_PLANS[planId];
  if (!plan) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed', status: session.payment_status });
    }

    // Read back what was actually charged/billed from the session itself
    // (set server-side at checkout creation) rather than re-deriving it from
    // the flat PUBLIC_PLANS price, which would misreport annual purchases.
    const billingInterval = session.metadata?.billingInterval === 'year' ? 'year' : 'month';
    const paidAmount = typeof session.amount_total === 'number' ? session.amount_total / 100 : plan.price;
    const billingSuffix = plan.type === 'recurring' ? (billingInterval === 'year' ? '/yr' : '/mo') : '';

    // 1. Find or create user
    let user;
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    let isNewUser = false;
    let rawPassword = '';
    
    if (existing.length > 0) {
      user = existing[0];
      // If it's a recurring maintenance plan, update their support plan
      if (plan.type === 'recurring') {
        const supportPlanType = planId.replace('maintenance-', ''); // 'basic', 'pro', or 'elite'
        await pool.query('UPDATE users SET support_plan = ? WHERE id = ?', [supportPlanType, user.id]);
      }
    } else {
      isNewUser = true;
      rawPassword = crypto.randomBytes(8).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(rawPassword, salt);
      
      const supportPlanType = plan.type === 'recurring' ? planId.replace('maintenance-', '') : null;
      
      const [insertResult] = await pool.query(
        'INSERT INTO users (email, name, password_hash, support_plan, is_admin) VALUES (?, ?, ?, ?, FALSE)',
        [email, name, passwordHash, supportPlanType]
      );
      
      user = {
        id: insertResult.insertId,
        email,
        name,
        support_plan: supportPlanType
      };
    }

    // 2. Create support ticket as order record
    const ticketSubject = `Order Confirmed: ${plan.name}`;
    const ticketMessage = `Thank you for your purchase!\n\nOrder Details:\n- Item: ${plan.name}\n- Price: $${paidAmount}${billingSuffix}\n- Status: Paid (Stripe Session: ${sessionId})\n\nOur team has been notified and will be in touch shortly to get started.`;

    const [ticketResult] = await pool.query(
      'INSERT INTO support_tickets (user_id, subject, message, status, priority, quoted_price, is_paid, stripe_session_id, ticket_type) VALUES (?, ?, ?, "open", "normal", ?, TRUE, ?, "order")',
      [user.id, ticketSubject, ticketMessage, paidAmount, sessionId]
    );

    // 3. Send welcome / purchase confirmation emails
    // To Client
    try {
      let emailBody = `<p>Hi ${name},</p>
        <p>Thank you for purchasing the <strong>${plan.name}</strong>!</p>
        <p>Your payment of <strong>$${paidAmount}${billingSuffix}</strong> was processed successfully.</p>`;
        
      if (isNewUser) {
        emailBody += `<p>An account has been created for you in the EVOBRAND Client Portal.</p>
          <p>We have also provisioned your assigned service plan.</p>
          <p>To access your account, submit tickets, and manage contracts, please visit the portal and use the <strong>Forgot Password</strong> link to set your secure password.</p>
          <p><a href="https://evobrandconcepts.com/login" style="color: #22c8e5; font-weight: bold; text-decoration: none;">Go to Client Portal</a></p>`;
      } else {
        emailBody += `<p>You can track the progress of your order in the Client Portal under your support tickets.</p>
          <p><a href="https://evobrandconcepts.com/client-portal" style="color: #22c8e5; font-weight: bold; text-decoration: none;">Go to Client Portal</a></p>`;
      }

      await sendEmail({
        from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
        to: email,
        subject: `Your EVOBRAND Order Confirmation`,
        html: getEmailTemplate(`Order Confirmed - ${plan.name}`, emailBody)
      });
    } catch (emailErr) {
      console.error('Client order confirmation email failed:', emailErr);
    }

    // To Admin
    try {
      await sendEmail({
        from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
        to: 'info@evobrand.net',
        subject: `New Public Sale: ${plan.name}`,
        html: getEmailTemplate(`New Order Received`, 
          `<p>A new purchase has been completed via the public checkout.</p>
           <p><strong>Customer Details:</strong></p>
           <ul>
             <li>Name: ${name}</li>
             <li>Email: ${email}</li>
             <li>Status: ${isNewUser ? 'New Account Created' : 'Existing User'}</li>
           </ul>
           <p><strong>Order Details:</strong></p>
           <ul>
             <li>Item: ${plan.name}</li>
             <li>Amount: $${paidAmount}${billingSuffix}</li>
             <li>Stripe Session: ${sessionId}</li>
           </ul>
           <p>A support ticket/order tracking ticket has been created inside the client portal.</p>`)
      });
    } catch (emailErr) {
      console.error('Admin notification email failed:', emailErr);
    }

    res.json({ success: true, isNewUser });
  } catch (err) {
    console.error('Public verify session error:', err);
    res.status(500).json({ error: 'Failed to verify session', details: err.message });
  }
});

module.exports = router;

