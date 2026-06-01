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
let supportRoutes, newsletterRoutes, schedulerRoutes, auditorRoutes, authRoutes, crmRoutes, contractRoutes, notificationRoutes;
try {
  supportRoutes = require('./routes/support');
  newsletterRoutes = require('./routes/newsletter');
  authRoutes = require('./routes/auth');
  schedulerRoutes = require('./routes/scheduler');
  auditorRoutes = require('./routes/auditor');
  crmRoutes = require('./routes/crm');
  contractRoutes = require('./routes/contracts');
  notificationRoutes = require('./routes/notifications');
} catch (err) {
  console.error('Error loading routes:', err.message);
  fs.writeFileSync(__dirname + '/crash.log', err.stack);
}

app.get('/api/install-log', (req, res) => {
  try {
    const log = fs.readFileSync(__dirname + '/install.log', 'utf8');
    res.type('text/plain').send(log);
  } catch (err) {
    res.status(200).send('No install log found: ' + err.message);
  }
});

// Mount routes if loaded
if (supportRoutes) app.use('/api/support', supportRoutes);
if (newsletterRoutes) app.use('/api/newsletter', newsletterRoutes);
if (authRoutes) app.use('/api/auth', authRoutes);
if (schedulerRoutes) app.use('/api/scheduler', schedulerRoutes);
if (auditorRoutes) app.use('/api/auditor', auditorRoutes);
if (crmRoutes) app.use('/api/crm', crmRoutes);
if (contractRoutes) app.use('/api/contracts', contractRoutes);
if (notificationRoutes) app.use('/api/notifications', notificationRoutes);

// cPanel Passenger often strips the Application URL prefix from requests.
// We mount them at the root as well so they work on the live server.
if (supportRoutes) app.use('/support', supportRoutes);
if (newsletterRoutes) app.use('/newsletter', newsletterRoutes);
if (authRoutes) app.use('/auth', authRoutes);
if (schedulerRoutes) app.use('/scheduler', schedulerRoutes);
if (auditorRoutes) app.use('/auditor', auditorRoutes);
if (crmRoutes) app.use('/crm', crmRoutes);
if (contractRoutes) app.use('/contracts', contractRoutes);
if (notificationRoutes) app.use('/notifications', notificationRoutes);

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
