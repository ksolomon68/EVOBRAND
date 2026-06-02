const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Ensure payment_status columns exist on contracts and support_tickets
const ensurePaymentColumns = async () => {
  try {
    await pool.query(
      "ALTER TABLE contracts ADD COLUMN payment_status ENUM('unpaid','paid') DEFAULT 'unpaid'"
    );
  } catch (e) {} // already exists
  try {
    await pool.query(
      "ALTER TABLE contracts ADD COLUMN stripe_session_id VARCHAR(255)"
    );
  } catch (e) {}
  try {
    await pool.query(
      "ALTER TABLE support_tickets ADD COLUMN stripe_session_id VARCHAR(255)"
    );
  } catch (e) {}
};

ensurePaymentColumns();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/create-checkout-session
// Body: { type: 'contract' | 'ticket', id: number, amount: number, description: string }
// Returns: { url } — the Stripe Checkout hosted page URL
// ─────────────────────────────────────────────────────────────────────────────
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  const { type, id, amount, description } = req.body;

  if (!type || !id || !amount || amount <= 0) {
    return res.status(400).json({ error: 'type, id, and a positive amount are required' });
  }

  if (!['contract', 'ticket'].includes(type)) {
    return res.status(400).json({ error: 'type must be "contract" or "ticket"' });
  }

  const amountCents = Math.round(parseFloat(amount) * 100);
  if (isNaN(amountCents) || amountCents < 50) {
    return res.status(400).json({ error: 'Amount must be at least $0.50' });
  }

  // Verify ownership
  try {
    if (type === 'contract') {
      const [rows] = await pool.query('SELECT * FROM contracts WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Contract not found' });
      const contract = rows[0];
      if (contract.client_user_id !== req.user.id && contract.client_email !== req.user.email) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else {
      const [rows] = await pool.query('SELECT * FROM support_tickets WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
      const ticket = rows[0];
      if (ticket.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
  } catch (err) {
    console.error('Payment auth check error:', err);
    return res.status(500).json({ error: 'Server error verifying access' });
  }

  const origin = process.env.APP_URL || 'https://evobrandconcepts.com';
  const successUrl = `${origin}/client-portal?payment=success&type=${type}&id=${id}`;
  const cancelUrl  = `${origin}/client-portal?payment=cancelled`;

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
              name: description || (type === 'contract' ? `Contract #${id}` : `Support Ticket #${id}`),
              description: `EVOBRAND Concepts LLC — ${type === 'contract' ? 'Contract' : 'Ticket'} payment`,
              images: [`${origin}/logo.png`],
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: { type, id: String(id), userId: String(req.user.id) },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // Store session id so we can verify it later
    if (type === 'contract') {
      await pool.query('UPDATE contracts SET stripe_session_id = ? WHERE id = ?', [session.id, id]);
    } else {
      await pool.query('UPDATE support_tickets SET stripe_session_id = ? WHERE id = ?', [session.id, id]);
    }

    res.json({ url: session.url, sessionId: session.id });
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
      await pool.query(
        "UPDATE contracts SET payment_status = 'paid' WHERE id = ? AND stripe_session_id = ?",
        [id, sessionId]
      );
    } else {
      await pool.query(
        "UPDATE support_tickets SET is_paid = 1 WHERE id = ? AND stripe_session_id = ?",
        [id, sessionId]
      );
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

module.exports = router;
