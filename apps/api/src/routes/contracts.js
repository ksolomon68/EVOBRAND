const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contracts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_user_id INT,
      client_email VARCHAR(255),
      title VARCHAR(255) NOT NULL,
      contract_data JSON NOT NULL,
      status ENUM('draft', 'sent', 'signed') DEFAULT 'sent',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (client_user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
};

// @route POST /api/contracts — admin saves a contract and associates it with a client
router.post('/', requireAdmin, async (req, res) => {
  const { title, clientEmail, contractData } = req.body;
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

    const [result] = await pool.query(
      'INSERT INTO contracts (title, client_email, client_user_id, contract_data, created_by, status) VALUES (?, ?, ?, ?, ?, ?)',
      [title, clientEmail || null, clientUserId, JSON.stringify(contractData), req.user.id, 'sent']
    );

    res.status(201).json({ message: 'Contract saved', id: result.insertId });
  } catch (error) {
    console.error('Save contract error:', error);
    res.status(500).json({ error: 'Server error saving contract' });
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
        'SELECT id, title, client_email, status, created_at FROM contracts WHERE client_user_id = ? OR client_email = ? ORDER BY created_at DESC',
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
router.put('/:id/status', requireAdmin, async (req, res) => {
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

module.exports = router;
