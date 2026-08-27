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

// Stamped once at process startup so /api/health reflects the actual
// running build/boot, not the time of each request.
const API_VERSION = 'v4';
const BOOTED_AT = new Date().toISOString();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded ticket attachments as static files.
// In production the frontend (static public_html) and this API are
// deployed separately — cPanel's proxy only forwards /api/* traffic to
// this Node app. Anything requested at bare /uploads/* hits the static
// frontend host instead (404, file doesn't exist there), so uploads must
// be reachable under /api/uploads. Also mounted at bare /uploads for local
// dev and in case Passenger strips the /api prefix before routing here.
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads');
if (!require('fs').existsSync(uploadsDir)) require('fs').mkdirSync(uploadsDir, { recursive: true });
app.use('/api/uploads', express.static(uploadsDir));
app.use('/uploads', express.static(uploadsDir));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: `EVOBRAND API is running ${API_VERSION}`, booted_at: BOOTED_AT, resend_from: process.env.RESEND_FROM_EMAIL || 'info@evobrand.net' });
});

app.get('/api/diag', (req, res) => {
  const routes = [];
  app._router.stack.forEach(layer => {
    if (layer.handle && layer.handle.stack) {
      layer.handle.stack.forEach(r => {
        if (r.route) routes.push(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${layer.regexp} ${r.route.path}`);
      });
    }
    if (layer.route) routes.push(`${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
  });
  const crmFile = (() => { try { return require('fs').readFileSync(__dirname + '/routes/crm.js', 'utf8').includes("router.delete('/campaigns/:id'") ? 'HAS_DELETE_ROUTE' : 'MISSING_DELETE_ROUTE'; } catch(e) { return e.message; } })();
  res.json({ crmFile, routeCount: routes.length, crmRoutes: routes.filter(r => r.includes('crm') || r.includes('campaign') || r.includes('track')) });
});

app.get('/api/db-health', async (req, res) => {
  const pool = require('./db/connection');
  const envCheck = {
    DB_HOST:     process.env.DB_HOST     ? '✓ set' : '✗ MISSING',
    DB_USER:     process.env.DB_USER     ? '✓ set' : '✗ MISSING',
    DB_PASSWORD: process.env.DB_PASSWORD ? '✓ set' : '✗ MISSING',
    DB_NAME:     process.env.DB_NAME     ? '✓ set' : '✗ MISSING',
    DB_PORT:     process.env.DB_PORT     ? `✓ ${process.env.DB_PORT}` : '(default 3306)',
  };
  try {
    const conn = await pool.getConnection();
    const [tables] = await conn.query(`SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name`);
    const counts = {};
    for (const t of ['meetings', 'blackout_dates', 'users']) {
      try {
        const [[row]] = await conn.query(`SELECT COUNT(*) as n FROM \`${t}\``);
        counts[t] = row.n;
      } catch (e) {
        counts[t] = `ERROR: ${e.message}`;
      }
    }
    conn.release();
    res.json({ status: 'connected', env: envCheck, tables: tables.map(t => t.table_name), record_counts: counts });
  } catch (err) {
    res.status(500).json({ status: 'failed', error: err.message, env: envCheck });
  }
});

app.get('/api/crash', (req, res) => {
  try {
    const log = fs.readFileSync(__dirname + '/crash.log', 'utf8');
    res.type('text/plain').send(log);
  } catch (err) {
    res.status(200).send('No crash log found. App is running fine! ' + err.message);
  }
});

// Every route builds its own Resend client with a 're_placeholder' fallback,
// so a missing/invalid RESEND_API_KEY silently no-ops every transactional
// email in the app instead of erroring loudly. This checks the live key
// against Resend's API so a bad key or unverified sending domain shows up
// without needing production shell/log access.
app.get('/api/email-health', async (req, res) => {
  const key = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@evobrand.net';
  const fromDomain = fromEmail.split('@')[1];

  if (!key || key === 're_placeholder') {
    return res.json({
      configured: false,
      fromEmail,
      reason: 'RESEND_API_KEY is not set (or is the placeholder) in this environment — every transactional email (contact form, tickets, auth, etc.) is silently failing.',
    });
  }

  try {
    const { Resend } = require('resend');
    const { data, error } = await new Resend(key).domains.list();
    if (error) {
      return res.json({ configured: true, apiKeyValid: false, fromEmail, error: error.message || error });
    }
    const domains = (data?.data || []).map(d => ({ name: d.name, status: d.status }));
    const matching = domains.find(d => d.name === fromDomain);
    res.json({
      configured: true,
      apiKeyValid: true,
      fromEmail,
      fromDomain,
      domainFound: !!matching,
      domainStatus: matching ? matching.status : 'not found in this Resend account — sends from this domain will fail',
      allDomains: domains,
    });
  } catch (err) {
    res.json({ configured: true, apiKeyValid: false, fromEmail, error: err.message });
  }
});

// Import Routes
let supportRoutes, newsletterRoutes, schedulerRoutes, auditorRoutes, accessibilityRoutes, authRoutes, crmRoutes, contractRoutes, notificationRoutes, contactsRoutes, paymentsRoutes, analyticsRoutes, schedulesRoutes, projectsRoutes;

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
accessibilityRoutes = loadRoute('accessibility', './routes/accessibility');
crmRoutes = loadRoute('crm', './routes/crm');
contractRoutes = loadRoute('contracts', './routes/contracts');
notificationRoutes = loadRoute('notifications', './routes/notifications');
contactsRoutes = loadRoute('contacts', './routes/contacts');
paymentsRoutes = loadRoute('payments', './routes/payments');
analyticsRoutes = loadRoute('analytics', './routes/analytics');
schedulesRoutes = loadRoute('schedules', './routes/schedules');
projectsRoutes = loadRoute('projects', './routes/projects');

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
if (accessibilityRoutes) app.use('/api/accessibility', accessibilityRoutes);
if (contractRoutes) app.use('/api/contracts', contractRoutes);
if (notificationRoutes) app.use('/api/notifications', notificationRoutes);
if (paymentsRoutes) app.use('/api/payments', paymentsRoutes);
if (analyticsRoutes) app.use('/api/analytics', analyticsRoutes);
if (schedulesRoutes) app.use('/api/schedules', schedulesRoutes);
if (projectsRoutes) app.use('/api/projects', projectsRoutes);
// Ad-blocker-safe alias for the tracking endpoint — EasyPrivacy-style
// filter lists block request paths containing "analytics", which silently
// drops pageview beacons from visitors running content blockers.
if (analyticsRoutes) app.use('/api/t', analyticsRoutes);

// cPanel Passenger often strips the Application URL prefix from requests.
// We mount them at the root as well so they work on the live server.
if (supportRoutes) app.use('/support', supportRoutes);
if (newsletterRoutes) app.use('/newsletter', newsletterRoutes);
if (authRoutes) app.use('/auth', authRoutes);
if (schedulerRoutes) app.use('/scheduler', schedulerRoutes);
if (auditorRoutes) app.use('/auditor', auditorRoutes);
if (accessibilityRoutes) app.use('/accessibility', accessibilityRoutes);
if (crmRoutes) app.use('/crm', crmRoutes);
if (contactsRoutes) app.use('/contacts', contactsRoutes);
if (contractRoutes) app.use('/contracts', contractRoutes);
if (notificationRoutes) app.use('/notifications', notificationRoutes);
if (paymentsRoutes) app.use('/payments', paymentsRoutes);
if (analyticsRoutes) app.use('/analytics', analyticsRoutes);
if (analyticsRoutes) app.use('/t', analyticsRoutes);
if (schedulesRoutes) app.use('/schedules', schedulesRoutes);
if (projectsRoutes) app.use('/projects', projectsRoutes);

// Catch-all JSON 404 for unmatched /api/* requests — most commonly hit when a
// route module failed to load (see loadRoute() above and crash.log), so the
// whole route group is silently unmounted. Without this, Express falls back
// to its default HTML 404 page, which breaks every frontend fetch() expecting
// res.json() the same way an unhandled error would.
app.use('/api', (req, res) => {
  res.status(404).json({ error: `No API route for ${req.method} ${req.originalUrl}. Check crash.log for a route that failed to load.` });
});

// Catch-all JSON error handler — must be registered after every route. Without
// this, an error thrown in middleware (e.g. multer rejecting a file type/size
// before a route handler even runs) falls through to Express's default HTML
// error page, which breaks every frontend fetch() call expecting res.json().
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const multer = require('multer');
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

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

// Run every 6 hours: notify clients + admins of milestones due within 3 days
setInterval(async () => {
  try {
    const pool = require('./db/connection');
    const [projects] = await pool.query(
      `SELECT id, name, client_user_id, milestones FROM client_projects WHERE status != 'completed'`
    );
    if (projects.length === 0) return;

    const [admins] = await pool.query('SELECT id FROM users WHERE is_admin = 1');

    for (const project of projects) {
      const milestones = typeof project.milestones === 'string'
        ? JSON.parse(project.milestones)
        : (project.milestones || []);

      let changed = false;
      const dueSoon = [];

      const updated = milestones.map(m => {
        if (m.status === 'done' || !m.due_date || m.reminded) return m;
        const dueDate = new Date(`${m.due_date}T00:00:00`);
        const threshold = new Date();
        threshold.setDate(threshold.getDate() + 3);
        if (dueDate <= threshold) {
          dueSoon.push(m);
          changed = true;
          return { ...m, reminded: true };
        }
        return m;
      });

      if (!changed) continue;

      for (const m of dueSoon) {
        const title = 'Milestone due soon';
        const message = `"${m.name || 'Milestone'}" on project "${project.name}" is due ${m.due_date}.`;

        if (project.client_user_id) {
          await pool.query(
            'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
            [project.client_user_id, title, message, 'milestone', '#my-projects']
          );
        }
        for (const admin of admins) {
          await pool.query(
            'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
            [admin.id, title, message, 'milestone', '#project-tracker']
          );
        }
      }

      await pool.query('UPDATE client_projects SET milestones = ? WHERE id = ?', [JSON.stringify(updated), project.id]);
    }
  } catch (err) {
    console.error('Error sending milestone reminders:', err);
  }
}, 6 * 60 * 60 * 1000);

// Initialize DB tables on startup, then start server
const { initializeDatabase } = require('./db/init');
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database initialization failed — server will not start:', err.message);
    process.exit(1);
  });
