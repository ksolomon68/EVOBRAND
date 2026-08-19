const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { addToCustomersList } = require('../utils/crmHelpers');
const { getEmailTemplate } = require('../utils/emailTemplate');
const { sendEmail } = require('../utils/mailer');


const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contracts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_user_id INT,
      client_email VARCHAR(255),
      title VARCHAR(255) NOT NULL,
      contract_data JSON NOT NULL,
      status ENUM('draft', 'sent', 'signed', 'canceled') DEFAULT 'sent',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      client_signature VARCHAR(255),
      client_signed_at TIMESTAMP NULL,
      FOREIGN KEY (client_user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  try {
    await pool.query('ALTER TABLE contracts ADD COLUMN client_user_id INT');
  } catch (e) {}
  try {
    await pool.query('ALTER TABLE contracts ADD COLUMN client_email VARCHAR(255)');
  } catch (e) {}
  try {
    await pool.query('ALTER TABLE contracts ADD COLUMN contract_data JSON');
  } catch (e) {}
  try {
    await pool.query('ALTER TABLE contracts ADD COLUMN created_by INT');
  } catch (e) {}
  try {
    await pool.query('ALTER TABLE contracts MODIFY COLUMN content TEXT NULL');
  } catch (e) {}
  try {
    await pool.query('ALTER TABLE contracts ADD COLUMN client_signature VARCHAR(255)');
  } catch (e) {} // Ignore if column already exists
  try {
    await pool.query('ALTER TABLE contracts ADD COLUMN client_signed_at TIMESTAMP NULL');
  } catch (e) {} // Ignore if column already exists
};

// @route POST /api/contracts — admin saves a contract and associates it with a client
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { title, clientEmail, contractData, status } = req.body;
  if (!title || !contractData) {
    return res.status(400).json({ error: 'Title and contract data are required' });
  }

  try {
    await ensureTable();

    // Look up client user by email
    let clientUserId = null;
    if (clientEmail) {
      const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [clientEmail]);
      if (users.length > 0) clientUserId = users[0].id;
    }

    const contractStatus = status || 'sent';
    const [result] = await pool.query(
      'INSERT INTO contracts (title, client_email, client_user_id, contract_data, created_by, status) VALUES (?, ?, ?, ?, ?, ?)',
      [title, clientEmail || null, clientUserId, JSON.stringify(contractData), req.user.id, contractStatus]
    );

    // Send email notification to client and copy to admin
    if (contractStatus !== 'draft' && clientEmail && clientEmail.includes('@')) {
      try {
        const clientInfo = contractData.clientInfo || {};
        const project = contractData.project || {};
        const repName = clientInfo.repName || 'Representative';
        const companyName = clientInfo.companyName || 'Client';

        const emailBody = `
          <p>Hi ${repName},</p>
          <p>A new Services Agreement (<strong>${title}</strong>) has been prepared and sent to you by <strong>EVOBRAND Concepts LLC</strong>.</p>
          <p><strong>Agreement Summary:</strong></p>
          <ul>
            <li><strong>Client Company:</strong> ${companyName}</li>
            <li><strong>Estimated Completion:</strong> ${project.completion || 'N/A'}</li>
            <li><strong>Governing State:</strong> ${project.state || 'N/A'}</li>
          </ul>
          <p>Please log in to your EVOBRAND Client Portal to review and sign the agreement electronically:</p>
          <p><a href="https://evobrandconcepts.com/login" style="color: #22c8e5; font-weight: bold; text-decoration: none;">Go to Client Portal</a></p>
          <p>If you don't have an active password yet, you can set one using the <strong>Forgot Password</strong> link on the login page.</p>
        `;

        await sendEmail({
          from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
          to: [clientEmail, 'ks@evobrand.net'],
          subject: `New Contract Prepared: ${title}`,
          html: getEmailTemplate(`New Agreement Prepared`, emailBody)
        });
      } catch (emailErr) {
        console.error('Failed to send contract notification email:', emailErr);
      }
    }

    res.status(201).json({ message: 'Contract saved', id: result.insertId });
  } catch (error) {
    console.error('Save contract error:', error);
    res.status(500).json({ error: 'Server error saving contract' });
  }
});

// @route PUT /api/contracts/:id — admin updates a contract and resends notification
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { title, clientEmail, contractData, status } = req.body;
  if (!title || !contractData) {
    return res.status(400).json({ error: 'Title and contract data are required' });
  }

  try {
    await ensureTable();

    // Look up client user by email
    let clientUserId = null;
    if (clientEmail) {
      const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [clientEmail]);
      if (users.length > 0) clientUserId = users[0].id;
    }

    // Update contract in database
    const contractStatus = status || 'sent';
    await pool.query(
      'UPDATE contracts SET title = ?, client_email = ?, client_user_id = ?, contract_data = ?, status = ? WHERE id = ?',
      [title, clientEmail || null, clientUserId, JSON.stringify(contractData), contractStatus, req.params.id]
    );

    // Send email notification to the updated client email and copy to admin
    if (contractStatus !== 'draft' && clientEmail && clientEmail.includes('@')) {
      try {
        const clientInfo = contractData.clientInfo || {};
        const project = contractData.project || {};
        const repName = clientInfo.repName || 'Representative';
        const companyName = clientInfo.companyName || 'Client';

        const emailBody = `
          <p>Hi ${repName},</p>
          <p>The Services Agreement (<strong>${title}</strong>) has been updated and resent to you by <strong>EVOBRAND Concepts LLC</strong>.</p>
          <p><strong>Agreement Summary:</strong></p>
          <ul>
            <li><strong>Client Company:</strong> ${companyName}</li>
            <li><strong>Estimated Completion:</strong> ${project.completion || 'N/A'}</li>
            <li><strong>Governing State:</strong> ${project.state || 'N/A'}</li>
          </ul>
          <p>Please log in to your EVOBRAND Client Portal to review and sign the updated agreement electronically:</p>
          <p><a href="https://evobrandconcepts.com/login" style="color: #22c8e5; font-weight: bold; text-decoration: none;">Go to Client Portal</a></p>
          <p>If you don't have an active password yet, you can set one using the <strong>Forgot Password</strong> link on the login page.</p>
        `;

        await sendEmail({
          from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
          to: [clientEmail, 'ks@evobrand.net'],
          subject: `Updated Contract Prepared: ${title}`,
          html: getEmailTemplate(`Agreement Updated`, emailBody)
        });
      } catch (emailErr) {
        console.error('Failed to send updated contract notification email:', emailErr);
      }
    }

    res.json({ message: 'Contract updated and resent successfully' });
  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({ error: 'Server error updating contract' });
  }
});

// @route GET /api/contracts — admin: all contracts; client: their own
router.get('/', authenticateToken, async (req, res) => {
  try {
    await ensureTable();

    let rows;
    if (req.user.is_admin) {
      [rows] = await pool.query(
        'SELECT id, title, client_email, status, created_at FROM contracts ORDER BY created_at DESC'
      );
    } else {
      [rows] = await pool.query(
        'SELECT id, title, client_email, status, created_at FROM contracts WHERE (client_user_id = ? OR client_email = ?) AND status != \'draft\' ORDER BY created_at DESC',
        [req.user.id, req.user.email]
      );
    }

    res.json({ contracts: rows });
  } catch (error) {
    console.error('List contracts error:', error);
    res.status(500).json({ error: 'Server error fetching contracts' });
  }
});

// @route GET /api/contracts/:id — get one contract with full data
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    await ensureTable();

    const [rows] = await pool.query('SELECT * FROM contracts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Contract not found' });

    const contract = rows[0];
    if (!req.user.is_admin && contract.client_user_id !== req.user.id && contract.client_email !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ contract });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ error: 'Server error fetching contract' });
  }
});

// @route PUT /api/contracts/:id/status — admin updates status
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!['draft', 'sent', 'signed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    await pool.query('UPDATE contracts SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating status' });
  }
});

// @route POST /api/contracts/:id/sign — client signs contract
router.post('/:id/sign', authenticateToken, async (req, res) => {
  const { signature } = req.body;
  if (!signature || signature.trim().length === 0) {
    return res.status(400).json({ error: 'Signature is required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM contracts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Contract not found' });
    
    const contract = rows[0];
    if (contract.client_user_id !== req.user.id && contract.client_email !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (contract.status === 'signed') {
      return res.status(400).json({ error: 'Contract is already signed' });
    }

    await pool.query(
      'UPDATE contracts SET status = "signed", client_signature = ?, client_signed_at = NOW() WHERE id = ?',
      [signature.trim(), req.params.id]
    );

    // Auto-add signer to Customers CRM list
    const nameParts = (req.user.name || '').split(' ');
    await addToCustomersList(req.user.email, { firstName: nameParts[0], lastName: nameParts.slice(1).join(' ') || null });

    try {
        await sendEmail({
          from: `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`,
          to: ['info@evobrand.net', 'ksolomon68@gmail.com'],
          subject: `Contract Signed: ${contract.title}`,
          html: `
            <div style="font-family: sans-serif; color: #333;">
              <h2>Contract Signed</h2>
              <p><strong>${req.user.name || req.user.email || 'A client'}</strong> has successfully signed the contract: <strong>${contract.title}</strong>.</p>
              <p><strong>Signature string:</strong> ${signature.trim()}</p>
              <p>Log in to your admin dashboard to view the signed contract.</p>
            </div>
          `
        });
    } catch (emailErr) {
      console.error('Failed to send contract signed email:', emailErr);
    }

    res.json({ success: true, message: 'Contract signed successfully' });
  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({ error: 'Server error signing contract' });
  }
});

// @route DELETE /api/contracts/:id — admin deletes a contract
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM contracts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Contract not found' });

    // Unlink any project schedule pointing at this contract so it doesn't
    // dangle — client_projects.contract_id has no DB-level FK to enforce this.
    try {
      await pool.query('UPDATE client_projects SET contract_id = NULL WHERE contract_id = ?', [req.params.id]);
    } catch (e) {} // Ignore if client_projects table doesn't exist yet

    await pool.query('DELETE FROM contracts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete contract error:', error);
    res.status(500).json({ error: 'Server error deleting contract' });
  }
});

module.exports = router;
