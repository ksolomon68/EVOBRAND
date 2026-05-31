const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Get all blackout dates
router.get('/blackout-dates', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blackout_dates');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching blackout dates:', error);
    res.status(500).json({ error: 'Failed to fetch blackout dates' });
  }
});

// Add blackout date
router.post('/blackout-dates', async (req, res) => {
  const { date, time, reason } = req.body;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO blackout_dates (date, time, reason) VALUES (?, ?, ?)',
      [date, time || null, reason]
    );
    res.json({ id: result.insertId, date, time, reason });
  } catch (error) {
    console.error('Error adding blackout date:', error);
    res.status(500).json({ error: 'Failed to add blackout date' });
  }
});

// Delete blackout date
router.delete('/blackout-dates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM blackout_dates WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting blackout date:', error);
    res.status(500).json({ error: 'Failed to delete blackout date' });
  }
});

// Get user meetings
router.get('/meetings/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM meetings WHERE user_id = ? ORDER BY date DESC, time DESC', [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Get booked time slots for a specific date
router.get('/booked-slots', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    const [rows] = await pool.query('SELECT time FROM meetings WHERE date = ? AND status != ?', [date, 'canceled']);
    res.json(rows.map(row => row.time));
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ error: 'Failed to fetch booked slots' });
  }
});

// Book a new appointment
router.post('/book', async (req, res) => {
  const { user_id, date, time, type, duration, notes } = req.body;
  
  if (!user_id || !date || !time || !type) {
    return res.status(400).json({ error: 'Missing required booking fields' });
  }

  try {
    // Generate a placeholder meet link for now (would integrate with Zoom/Google Meet API here)
    const meet_link = `https://meet.google.com/evobrand-${Math.random().toString(36).substring(7)}`;

    const [result] = await pool.query(
      'INSERT INTO meetings (user_id, date, time, type, duration, notes, meet_link, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, date, time, type, duration || 30, notes || '', meet_link, 'scheduled']
    );

    res.json({ success: true, meeting_id: result.insertId, meet_link });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Cancel a meeting
router.post('/meetings/:id/cancel', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE meetings SET status = ? WHERE id = ?', ['canceled', id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error canceling meeting:', error);
    res.status(500).json({ error: 'Failed to cancel meeting' });
  }
});

module.exports = router;
