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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

// POST /api/projects — admin creates a project tracker
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { name, description, clientEmail, milestones } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });

  try {
    await ensureTable();

    let clientUserId = null;
    if (clientEmail) {
      const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [clientEmail]);
      if (rows.length > 0) clientUserId = rows[0].id;
    }

    const [result] = await pool.query(
      `INSERT INTO client_projects (name, description, client_email, client_user_id, milestones, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || '', clientEmail || null, clientUserId,
       JSON.stringify(milestones || []), req.user.id]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET /api/projects — list all (admin) or own (client)
router.get('/', authenticateToken, async (req, res) => {
  try {
    await ensureTable();

    let rows;
    if (req.user.is_admin) {
      [rows] = await pool.query(`
        SELECT id, name, description, client_email, milestones, status, created_at, updated_at
        FROM client_projects ORDER BY updated_at DESC
      `);
    } else {
      [rows] = await pool.query(`
        SELECT id, name, description, client_email, milestones, status, created_at, updated_at
        FROM client_projects
        WHERE client_user_id = ? OR client_email = ?
        ORDER BY updated_at DESC
      `, [req.user.id, req.user.email]);
    }

    // Parse milestones JSON if stored as string
    rows = rows.map(r => ({
      ...r,
      milestones: typeof r.milestones === 'string' ? JSON.parse(r.milestones) : (r.milestones || []),
    }));

    res.json({ projects: rows });
  } catch (err) {
    console.error('List projects error:', err);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

// PUT /api/projects/:id — admin updates project (name, description, status, milestones)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { name, description, milestones, status } = req.body;

  try {
    await ensureTable();

    const [rows] = await pool.query('SELECT id FROM client_projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });

    const fields = [];
    const values = [];

    if (name !== undefined)        { fields.push('name = ?');        values.push(name); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (milestones !== undefined)  { fields.push('milestones = ?');  values.push(JSON.stringify(milestones)); }
    if (status !== undefined)      { fields.push('status = ?');      values.push(status); }

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
