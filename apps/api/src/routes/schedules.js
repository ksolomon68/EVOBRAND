const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const schedulesDir = path.join(__dirname, '../../uploads/schedules');
if (!fs.existsSync(schedulesDir)) fs.mkdirSync(schedulesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, schedulesDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.csv', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error('File type not allowed. Accepted: PDF, Word, Excel, images.'));
  },
});

const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      client_email VARCHAR(255),
      client_user_id INT,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_size INT,
      mime_type VARCHAR(100),
      uploaded_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// POST /api/schedules/upload
router.post('/upload', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { title, description, clientEmail } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    await ensureTable();
    let clientUserId = null;
    if (clientEmail) {
      const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [clientEmail]);
      if (rows.length > 0) clientUserId = rows[0].id;
    }
    const [result] = await pool.query(
      `INSERT INTO project_schedules
        (title, description, client_email, client_user_id, filename, original_name, file_size, mime_type, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || '', clientEmail || null, clientUserId,
       req.file.filename, req.file.originalname, req.file.size, req.file.mimetype, req.user.id]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    try { fs.unlinkSync(req.file.path); } catch (_) {}
    console.error('Schedule upload error:', err);
    res.status(500).json({ error: 'Failed to save schedule' });
  }
});

// GET /api/schedules
router.get('/', authenticateToken, async (req, res) => {
  try {
    await ensureTable();
    let rows;
    if (req.user.is_admin) {
      [rows] = await pool.query(`
        SELECT id, title, description, client_email, original_name, file_size, mime_type, created_at
        FROM project_schedules ORDER BY created_at DESC
      `);
    } else {
      [rows] = await pool.query(`
        SELECT id, title, description, client_email, original_name, file_size, mime_type, created_at
        FROM project_schedules
        WHERE client_user_id = ? OR client_email = ?
        ORDER BY created_at DESC
      `, [req.user.id, req.user.email]);
    }
    res.json({ schedules: rows });
  } catch (err) {
    console.error('List schedules error:', err);
    res.status(500).json({ error: 'Failed to list schedules' });
  }
});

// GET /api/schedules/:id/download
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    await ensureTable();
    const [rows] = await pool.query('SELECT * FROM project_schedules WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
    const schedule = rows[0];
    if (!req.user.is_admin && schedule.client_user_id !== req.user.id && schedule.client_email !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const filePath = path.join(schedulesDir, schedule.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on server' });
    res.setHeader('Content-Disposition', `attachment; filename="${schedule.original_name}"`);
    res.setHeader('Content-Type', schedule.mime_type || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('Schedule download error:', err);
    res.status(500).json({ error: 'Failed to download schedule' });
  }
});

// DELETE /api/schedules/:id
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await ensureTable();
    const [rows] = await pool.query('SELECT * FROM project_schedules WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    try { fs.unlinkSync(path.join(schedulesDir, rows[0].filename)); } catch (_) {}
    await pool.query('DELETE FROM project_schedules WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete schedule error:', err);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

module.exports = router;
