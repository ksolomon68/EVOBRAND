const fs = require('fs');
process.on('uncaughtException', (err) => {
  fs.writeFileSync(__dirname + '/crash.log', err.stack);
});
process.on('unhandledRejection', (err) => {
  fs.writeFileSync(__dirname + '/crash.log', err.stack);
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'EVOBRAND API is running' });
});

app.get('/api/crash', (req, res) => {
  try {
    const log = fs.readFileSync(__dirname + '/crash.log', 'utf8');
    res.type('text/plain').send(log);
  } catch (err) {
    res.status(200).send('No crash log found. App is running fine! ' + err.message);
  }
});

// Import Routes
const supportRoutes = require('./routes/support');
const newsletterRoutes = require('./routes/newsletter');
const schedulerRoutes = require('./routes/scheduler');
const auditorRoutes = require('./routes/auditor');
const authRoutes = require('./routes/auth');
const crmRoutes = require('./routes/crm');
const contractRoutes = require('./routes/contracts');
const notificationRoutes = require('./routes/notifications');

// TEMPORARY ADMIN ROUTE - trigger database initialization
app.get('/api/admin/init-db', (req, res) => {
  res.send('Initializing database... The server will automatically restart if successful.');
  require('./db/init.js'); 
});

app.use('/api/support', supportRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/auditor', auditorRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/notifications', notificationRoutes);

// cPanel Passenger often strips the Application URL prefix from requests.
// We mount them at the root as well so they work on the live server.
app.use('/support', supportRoutes);
app.use('/newsletter', newsletterRoutes);
app.use('/auth', authRoutes);
app.use('/scheduler', schedulerRoutes);
app.use('/auditor', auditorRoutes);
app.use('/crm', crmRoutes);
app.use('/contracts', contractRoutes);
app.use('/notifications', notificationRoutes);

// Scheduled Tasks
// Run every 6 hours to auto-close inactive tickets
setInterval(async () => {
  try {
    const pool = require('./db/connection');
    const [result] = await pool.query(`
      UPDATE support_tickets 
      SET status = 'closed' 
      WHERE status NOT IN ('closed', 'resolved') 
      AND updated_at < DATE_SUB(NOW(), INTERVAL 5 DAY)
    `);
    if (result.affectedRows > 0) {
      console.log(`Auto-closed ${result.affectedRows} inactive ticket(s).`);
    }
  } catch (err) {
    console.error('Error auto-closing tickets:', err);
  }
}, 6 * 60 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
