const fs = require('fs');
process.on('uncaughtException', (err) => {
  const diagnostics = `Node Version: ${process.version}\n` +
                      `Current Dir: ${__dirname}\n` +
                      `CWD: ${process.cwd()}\n` +
                      `NODE_PATH: ${process.env.NODE_PATH}\n` +
                      `Search Paths: ${JSON.stringify(module.paths, null, 2)}\n\n` +
                      `Error Stack:\n${err.stack}`;
  fs.writeFileSync(__dirname + '/crash.log', diagnostics);
});
process.on('unhandledRejection', (err) => {
  const diagnostics = `Unhandled Rejection: ${err instanceof Error ? err.stack : err}`;
  fs.writeFileSync(__dirname + '/crash.log', diagnostics);
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
  res.status(200).json({ status: 'ok', message: 'EVOBRAND API is running v2' });
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
let supportRoutes, newsletterRoutes, schedulerRoutes, auditorRoutes, authRoutes, crmRoutes, contractRoutes, notificationRoutes, contactsRoutes;

const loadRoute = (name, path) => {
  try {
    return require(path);
  } catch (err) {
    console.error(`Error loading ${name} route:`, err.message);
    const diagnostics = `Error loading ${name}:\n${err.stack}`;
    fs.appendFileSync(__dirname + '/crash.log', diagnostics + '\n\n');
    return null;
  }
};

// Clear old crash log
try { fs.writeFileSync(__dirname + '/crash.log', ''); } catch (e) {}

supportRoutes = loadRoute('support', './routes/support');
newsletterRoutes = loadRoute('newsletter', './routes/newsletter');
authRoutes = loadRoute('auth', './routes/auth');
schedulerRoutes = loadRoute('scheduler', './routes/scheduler');
auditorRoutes = loadRoute('auditor', './routes/auditor');
crmRoutes = loadRoute('crm', './routes/crm');
contractRoutes = loadRoute('contracts', './routes/contracts');
notificationRoutes = loadRoute('notifications', './routes/notifications');
contactsRoutes = loadRoute('contacts', './routes/contacts');

app.get('/api/install', (req, res) => {
  try {
    const { execSync } = require('child_process');
    const output = execSync('npm install @google/generative-ai resend --no-audit --no-fund', { encoding: 'utf8', cwd: __dirname + '/..' });
    res.type('text/plain').send('Installed dependencies:\n' + output);
  } catch (err) {
    res.status(500).type('text/plain').send('Install failed:\n' + err.message + '\n' + (err.stdout || ''));
  }
});

app.get('/api/install-log', (req, res) => {
  try {
    const log = fs.readFileSync(__dirname + '/../install.log', 'utf8');
    res.type('text/plain').send(log);
  } catch (err) {
    res.status(200).send('No install log found: ' + err.message);
  }
});

app.get('/install-log', (req, res) => {
  try {
    const log = fs.readFileSync(__dirname + '/../install.log', 'utf8');
    res.type('text/plain').send(log);
  } catch (err) {
    res.status(200).send('No install log found: ' + err.message);
  }
});

// Mount routes if loaded
if (supportRoutes) app.use('/api/support', supportRoutes);
if (newsletterRoutes) app.use('/api/newsletter', newsletterRoutes);
if (crmRoutes) app.use('/api/crm', crmRoutes);
if (contactsRoutes) app.use('/api/contacts', contactsRoutes);
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
if (contactsRoutes) app.use('/contacts', contactsRoutes);
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
