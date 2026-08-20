const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const multer = require('multer');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { parseScheduleDoc } = require('../utils/scheduleDocxParser');
const { sendEmail } = require('../utils/mailer');
const { getEmailTemplate } = require('../utils/emailTemplate');

const SCHEDULE_DOC_EXTENSIONS = ['.docx', '.doc', '.pdf'];

const docxUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = SCHEDULE_DOC_EXTENSIONS.some(ext => file.originalname.toLowerCase().endsWith(ext));
    if (ok) return cb(null, true);
    const err = new Error('Only .docx, .doc, or .pdf files are supported');
    err.status = 400;
    cb(err);
  },
});

const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS client_projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      client_email VARCHAR(255),
      client_user_id INT,
      milestones JSON NOT NULL DEFAULT ('[]'),
      status ENUM('active','completed','on_hold') DEFAULT 'active',
      created_by INT,
      contract_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  try {
    await pool.query('ALTER TABLE client_projects ADD COLUMN contract_id INT NULL');
  } catch (e) {} // Ignore if column already exists
};

// A project is "complete" once every milestone on it is done.
const deriveStatus = (milestones, fallback) => {
  if (!Array.isArray(milestones) || milestones.length === 0) return fallback || 'active';
  const allDone = milestones.every(m => m.status === 'done');
  if (allDone) return 'completed';
  return fallback === 'on_hold' ? 'on_hold' : 'active';
};

// POST /api/projects/parse-schedule-docx — admin uploads a schedule Word doc,
// gets back a suggested project name + milestones array (nothing is saved).
// The frontend stages this into the create/edit form so the admin can review
// and adjust before it's actually written to a project.
router.post('/parse-schedule-docx', authenticateToken, requireAdmin, docxUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await parseScheduleDoc(req.file.buffer, req.file.originalname);
    if (result.milestones.length === 0) {
      return res.status(422).json({ error: 'No milestone rows found in this document' });
    }
    res.json(result);
  } catch (err) {
    console.error('Parse schedule doc error:', err);
    res.status(400).json({ error: err.message || 'Could not read that document.' });
  }
});

// POST /api/projects — admin creates a project schedule, optionally linked to a contract
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { name, description, clientEmail, milestones, contractId } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });

  try {
    await ensureTable();

    let finalClientEmail = clientEmail || null;
    let clientUserId = null;

    if (contractId) {
      const [contractRows] = await pool.query(
        'SELECT client_email, client_user_id FROM contracts WHERE id = ?', [contractId]
      );
      if (contractRows.length === 0) return res.status(400).json({ error: 'Linked contract not found' });
      finalClientEmail = contractRows[0].client_email || finalClientEmail;
      clientUserId = contractRows[0].client_user_id || null;
    }

    if (!clientUserId && finalClientEmail) {
      const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [finalClientEmail]);
      if (rows.length > 0) clientUserId = rows[0].id;
    }

    const initialMilestones = milestones || [];
    const [result] = await pool.query(
      `INSERT INTO client_projects (name, description, client_email, client_user_id, milestones, created_by, contract_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || '', finalClientEmail, clientUserId,
       JSON.stringify(initialMilestones), req.user.id, contractId || null, deriveStatus(initialMilestones)]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET /api/projects — list all (admin) or own (client), with linked contract + attached files
router.get('/', authenticateToken, async (req, res) => {
  try {
    await ensureTable();

    const baseSelect = `
      SELECT p.id, p.name, p.description, p.client_email, p.milestones, p.status,
             p.contract_id, c.title AS contract_title, c.payment_status AS contract_payment_status,
             c.contract_data AS contract_data, p.created_at, p.updated_at
      FROM client_projects p
      LEFT JOIN contracts c ON c.id = p.contract_id
    `;

    let rows;
    if (req.user.is_admin) {
      [rows] = await pool.query(`${baseSelect} ORDER BY p.updated_at DESC`);
    } else {
      [rows] = await pool.query(
        `${baseSelect} WHERE p.client_user_id = ? OR p.client_email = ? ORDER BY p.updated_at DESC`,
        [req.user.id, req.user.email]
      );
    }

    let schedules = [];
    if (rows.length > 0) {
      const [scheduleRows] = await pool.query(
        `SELECT id, project_id, title, original_name, file_size, mime_type, created_at
         FROM project_schedules WHERE project_id IN (?)`,
        [rows.map(r => r.id)]
      ).catch(() => [[]]);
      schedules = scheduleRows || [];
    }

    rows = rows.map(r => {
      let fee = 0;
      if (r.contract_data) {
        try {
          const cData = typeof r.contract_data === 'string' ? JSON.parse(r.contract_data) : r.contract_data;
          fee = parseFloat(cData?.project?.fee || '0');
        } catch (e) {}
      }
      return {
        ...r,
        contract_fee: fee,
        contract_payment_status: r.contract_payment_status || 'unpaid',
        milestones: typeof r.milestones === 'string' ? JSON.parse(r.milestones) : (r.milestones || []),
        schedules: schedules.filter(s => s.project_id === r.id),
      };
    });

    res.json({ projects: rows });
  } catch (err) {
    console.error('List projects error:', err);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

// PUT /api/projects/:id
// Admin can update name/description/status/milestones/contract.
// The owning client may update only their own milestones (checking items off).
router.put('/:id', authenticateToken, async (req, res) => {
  const { name, description, milestones, status, contractId } = req.body;

  try {
    await ensureTable();

    const [rows] = await pool.query('SELECT * FROM client_projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const project = rows[0];

    const isOwner = project.client_user_id === req.user.id || project.client_email === req.user.email;
    if (!req.user.is_admin && !isOwner) return res.status(403).json({ error: 'Access denied' });

    if (!req.user.is_admin && (name !== undefined || description !== undefined || status !== undefined || contractId !== undefined)) {
      return res.status(403).json({ error: 'Clients may only update milestone completion' });
    }

    const fields = [];
    const values = [];

    if (req.user.is_admin) {
      if (name !== undefined)        { fields.push('name = ?');        values.push(name); }
      if (description !== undefined) { fields.push('description = ?'); values.push(description); }
      if (contractId !== undefined)  { fields.push('contract_id = ?'); values.push(contractId || null); }
    }

    if (milestones !== undefined) {
      fields.push('milestones = ?');
      values.push(JSON.stringify(milestones));
      const currentStatus = req.user.is_admin && status !== undefined ? status : project.status;
      fields.push('status = ?');
      values.push(deriveStatus(milestones, currentStatus));
    } else if (req.user.is_admin && status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }

    if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update' });

    values.push(req.params.id);
    await pool.query(`UPDATE client_projects SET ${fields.join(', ')} WHERE id = ?`, values);

    // ── Milestone update notifications ──────────────────────────────────────
    // Only fire when milestones were part of this update and the project has
    // a client email address to notify.
    if (milestones !== undefined && project.client_email) {
      try {
        const prevMilestones = typeof project.milestones === 'string'
          ? JSON.parse(project.milestones)
          : (project.milestones || []);

        const oldStatus = project.status;
        const newStatus = deriveStatus(milestones, req.user.is_admin && status !== undefined ? status : project.status);

        // Find which milestones actually changed status
        const changed = milestones.filter((m, i) => {
          const prev = prevMilestones.find(p => p.id === m.id) || prevMilestones[i];
          return prev && prev.status !== m.status;
        });

        if (changed.length > 0) {
          const projectName = name || project.name;
          const FROM = `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`;
          const ADMIN_TO = [process.env.ADMIN_EMAIL || 'ks@evobrand.net', 'ksolomon68@gmail.com'];

          const statusLabel = s => s === 'done' ? '✅ Complete' : s === 'in_progress' ? '🔄 In Progress' : '⏳ Pending';

          // Generate dynamic Stripe payment button if project is newly completed and has an unpaid contract
          let paymentButtonHtml = '';
          if (oldStatus !== 'completed' && newStatus === 'completed' && project.contract_id) {
            const [contractRows] = await pool.query(
              'SELECT title, payment_status, contract_data FROM contracts WHERE id = ?',
              [project.contract_id]
            );
            if (contractRows.length > 0 && contractRows[0].payment_status !== 'paid') {
              try {
                const contract = contractRows[0];
                const cData = typeof contract.contract_data === 'string'
                  ? JSON.parse(contract.contract_data)
                  : contract.contract_data;
                const fee = parseFloat(cData?.project?.fee || '0');
                if (fee > 0) {
                  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
                  const origin = process.env.APP_URL || 'https://evobrandconcepts.com';
                  const amountCents = Math.round(fee * 100);

                  const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    mode: 'payment',
                    customer_email: project.client_email,
                    line_items: [
                      {
                        price_data: {
                          currency: 'usd',
                          product_data: {
                            name: contract.title || `Contract #${project.contract_id}`,
                            description: `EVOBRAND Concepts LLC — Contract final payment`,
                            images: [`${origin}/logo.png`],
                          },
                          unit_amount: amountCents,
                        },
                        quantity: 1,
                      },
                    ],
                    metadata: { type: 'contract', id: String(project.contract_id), userId: String(project.client_user_id || '') },
                    success_url: `${origin}/client-portal?payment=success&type=contract&id=${project.contract_id}&sessionId={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${origin}/client-portal?payment=cancelled`,
                  });

                  // Store the session ID in the contract
                  await pool.query('UPDATE contracts SET stripe_session_id = ? WHERE id = ?', [session.id, project.contract_id]);

                  paymentButtonHtml = `
                    <div style="margin: 24px 0; padding: 20px; background: rgba(34, 200, 229, 0.05); border: 1px solid rgba(34, 200, 229, 0.2); border-radius: 8px; text-align: center;">
                      <p style="margin: 0 0 12px 0; color: #22c8e5; font-size: 15px; font-weight: bold; uppercase; tracking-wider;">
                        Project Completed!
                      </p>
                      <p style="margin: 0 0 16px 0; color: #E8DDD0; font-size: 14px;">
                        The balance of <strong>$${fee.toFixed(2)}</strong> is now due. Please use the button below to pay securely via Stripe.
                      </p>
                      <a href="${session.url}" style="display: inline-block; background-color: #22c8e5; color: #003258; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase;">Pay Contract Balance</a>
                    </div>
                  `;
                }
              } catch (stripeErr) {
                console.error('[projects] Failed to generate completion payment session:', stripeErr);
              }
            }
          }

          // Full milestone list for the email body
          const milestoneRows = milestones.map(m =>
            `<tr>
              <td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);color:#e8eaf0;">${m.title || m.name || 'Milestone'}</td>
              <td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:center;color:#e8eaf0;">${statusLabel(m.status)}</td>
              <td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(232,221,208,0.5);">${m.due_date || m.dueDate || ''}</td>
            </tr>`
          ).join('');

          const changedList = changed.map(m =>
            `<li><strong>${m.title || m.name || 'Milestone'}</strong> → ${statusLabel(m.status)}</li>`
          ).join('');

          const clientBody = `
            <p>Hi there,</p>
            <p>A milestone on your project <strong>${projectName}</strong> has been updated:</p>
            <ul style="margin:12px 0;padding-left:20px;">${changedList}</ul>
            <table style="width:100%;border-collapse:collapse;margin-top:16px;">
              <thead>
                <tr style="background:rgba(34,200,229,0.1);">
                  <th style="padding:8px 12px;text-align:left;color:#22c8e5;font-size:12px;text-transform:uppercase;">Milestone</th>
                  <th style="padding:8px 12px;text-align:center;color:#22c8e5;font-size:12px;text-transform:uppercase;">Status</th>
                  <th style="padding:8px 12px;text-align:left;color:#22c8e5;font-size:12px;text-transform:uppercase;">Due</th>
                </tr>
              </thead>
              <tbody>${milestoneRows}</tbody>
            </table>
            ${paymentButtonHtml}
            <p style="margin-top:20px;">Log in to your client portal to view the full project details.</p>
            <p><a href="https://evobrandconcepts.com/portal" style="color:#22c8e5;font-weight:bold;">Go to Client Portal →</a></p>
          `;

          const adminBody = `
            <p>Milestone update on project <strong>${projectName}</strong> (client: ${project.client_email}):</p>
            <ul style="margin:12px 0;padding-left:20px;">${changedList}</ul>
            <table style="width:100%;border-collapse:collapse;margin-top:16px;">
              <thead>
                <tr style="background:rgba(34,200,229,0.1);">
                  <th style="padding:8px 12px;text-align:left;color:#22c8e5;font-size:12px;text-transform:uppercase;">Milestone</th>
                  <th style="padding:8px 12px;text-align:center;color:#22c8e5;font-size:12px;text-transform:uppercase;">Status</th>
                  <th style="padding:8px 12px;text-align:left;color:#22c8e5;font-size:12px;text-transform:uppercase;">Due</th>
                </tr>
              </thead>
              <tbody>${milestoneRows}</tbody>
            </table>
          `;

          // Send to client and admin in parallel
          await Promise.allSettled([
            sendEmail({
              from: FROM,
              to: project.client_email,
              subject: `Project Update: ${projectName}`,
              html: getEmailTemplate(`Project Update: ${projectName}`, clientBody),
            }),
            sendEmail({
              from: FROM,
              to: ADMIN_TO,
              subject: `[Admin] Milestone Update — ${projectName}`,
              html: getEmailTemplate(`Milestone Update — ${projectName}`, adminBody),
            }),
          ]);

          console.log(`[projects] Milestone notification sent for project ${req.params.id} (${changed.length} changes)`);
        }
      } catch (emailErr) {
        // Never let email failure block the API response
        console.error('[projects] Milestone email failed:', emailErr.message);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await ensureTable();
    const [rows] = await pool.query('SELECT id FROM client_projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    await pool.query('DELETE FROM client_projects WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
