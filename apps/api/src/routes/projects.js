const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

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
             p.contract_id, c.title AS contract_title, p.created_at, p.updated_at
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

    rows = rows.map(r => ({
      ...r,
      milestones: typeof r.milestones === 'string' ? JSON.parse(r.milestones) : (r.milestones || []),
      schedules: schedules.filter(s => s.project_id === r.id),
    }));

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
