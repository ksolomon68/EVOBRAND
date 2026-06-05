// routes/api.js — REST API for the CMS
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runMaintenanceCycle } from '../services/wordpress.js';
import { generateReportHTML, saveReportHTML } from '../services/report.js';
import { generatePDF, buildPDFPath } from '../services/pdf.js';
import { sendMaintenanceReport } from '../services/email.js';
import { slugify, formatDateSlug, formatDate } from '../utils/helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENTS_PATH = path.resolve(__dirname, '../clients/clients.json');
const REPORTS_DIR = path.resolve(__dirname, '../reports');
const LOGS_DIR = path.resolve(__dirname, '../logs');

const router = express.Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────
function readClients() {
  if (!fs.existsSync(CLIENTS_PATH)) return [];
  return JSON.parse(fs.readFileSync(CLIENTS_PATH, 'utf8'));
}

function writeClients(clients) {
  fs.writeFileSync(CLIENTS_PATH, JSON.stringify(clients, null, 2), 'utf8');
}

function emit(req, event, data) {
  const io = req.app.get('io');
  if (io) io.emit(event, data);
}

// ═══════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════
router.get('/dashboard', (req, res) => {
  const clients = readClients();
  const enabled = clients.filter(c => c.enabled !== false).length;

  // Count report files
  let reportCount = 0;
  if (fs.existsSync(REPORTS_DIR)) {
    reportCount = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.pdf')).length;
  }

  // Last log entry
  let lastRun = null;
  if (fs.existsSync(LOGS_DIR)) {
    const logs = fs.readdirSync(LOGS_DIR)
      .filter(f => f.startsWith('maintenance-'))
      .sort()
      .reverse();
    if (logs.length > 0) {
      lastRun = logs[0].replace('maintenance-', '').replace('.log', '');
    }
  }

  res.json({
    totalClients: clients.length,
    enabledClients: enabled,
    totalReports: reportCount,
    lastRun,
  });
});

// ═══════════════════════════════════════════════════════════════════════
// CLIENTS — CRUD
// ═══════════════════════════════════════════════════════════════════════
router.get('/clients', (req, res) => {
  res.json(readClients());
});

router.post('/clients', (req, res) => {
  const clients = readClients();
  const newClient = {
    id: req.body.id || slugify(req.body.name),
    name: req.body.name,
    email: req.body.email || '',
    enabled: req.body.enabled !== false,
    connection: req.body.connection || { type: 'local', sitePath: '' },
    wpcli: req.body.wpcli || 'wp',
  };

  // Check for duplicate ID
  if (clients.find(c => c.id === newClient.id)) {
    return res.status(409).json({ error: `Client ID "${newClient.id}" already exists.` });
  }

  clients.push(newClient);
  writeClients(clients);
  res.status(201).json(newClient);
});

router.put('/clients/:id', (req, res) => {
  const clients = readClients();
  const idx = clients.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Client not found' });

  clients[idx] = { ...clients[idx], ...req.body, id: req.params.id };
  writeClients(clients);
  res.json(clients[idx]);
});

router.delete('/clients/:id', (req, res) => {
  const clients = readClients();
  const filtered = clients.filter(c => c.id !== req.params.id);
  if (filtered.length === clients.length) return res.status(404).json({ error: 'Client not found' });
  writeClients(filtered);
  res.json({ success: true });
});

router.patch('/clients/:id/toggle', (req, res) => {
  const clients = readClients();
  const client = clients.find(c => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  client.enabled = !client.enabled;
  writeClients(clients);
  res.json({ id: client.id, enabled: client.enabled });
});

// ═══════════════════════════════════════════════════════════════════════
// MAINTENANCE JOBS — Run per client or all
// ═══════════════════════════════════════════════════════════════════════
const activeJobs = new Map(); // clientId → { status, startedAt }

router.get('/jobs', (req, res) => {
  const jobs = [...activeJobs.entries()].map(([id, job]) => ({ id, ...job }));
  res.json(jobs);
});

async function runJobForClient(client, options = {}, io) {
  const { dryRun = false, reportOnly = false, sendEmail = true } = options;
  const clientId = client.id;
  const dateSlug = formatDateSlug();
  const clientSlug = slugify(client.name);

  activeJobs.set(clientId, { status: 'running', startedAt: new Date().toISOString() });

  const log = (msg, level = 'info') => {
    const line = `[${client.name}] ${msg}`;
    console.log(line);
    if (io) io.emit('job:log', { clientId, level, message: msg, timestamp: new Date().toISOString() });
  };

  try {
    log('Starting maintenance cycle...');

    let maintenanceData;
    if (dryRun || reportOnly) {
      log(dryRun ? '[DRY RUN] Using mock data.' : '[REPORT ONLY] Using mock data.');
      maintenanceData = {
        updatedPlugins: [
          { name: 'woocommerce', title: 'WooCommerce', oldVersion: '8.5.0', newVersion: '8.7.2', status: 'Updated' },
          { name: 'yoast-seo', title: 'Yoast SEO', oldVersion: '22.1', newVersion: '22.4', status: 'Updated' },
          { name: 'wordfence', title: 'Wordfence Security', oldVersion: '7.11.0', newVersion: '7.11.5', status: 'Updated' },
        ],
        allPlugins: Array(12).fill({}),
        status: 'success',
      };
    } else {
      maintenanceData = await runMaintenanceCycle(client);
    }

    if (maintenanceData.status === 'error') throw new Error(maintenanceData.errorMessage);

    log(`✓ ${maintenanceData.updatedPlugins.length} plugin(s) updated`);

    // Generate HTML report
    log('Generating HTML report...');
    const { generateReportHTML: genHTML } = await import('../services/report.js');
    const html = genHTML({
      clientName: client.name,
      updatedPlugins: maintenanceData.updatedPlugins,
      allPlugins: maintenanceData.allPlugins,
      status: maintenanceData.status,
    });

    const htmlPath = path.resolve(REPORTS_DIR, `${clientSlug}-${dateSlug}.html`);
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(htmlPath, html, 'utf8');

    // Generate PDF
    log('Generating PDF...');
    const { generatePDF: genPDF, buildPDFPath: buildPath } = await import('../services/pdf.js');
    const pdfPath = buildPath(clientSlug, dateSlug);
    await genPDF(html, pdfPath, client.name);
    log(`✓ PDF ready: ${path.basename(pdfPath)}`);

    // Send email
    if (sendEmail && client.email && !dryRun) {
      log(`Sending report to ${client.email}...`);
      const { sendMaintenanceReport: sendEmail2 } = await import('../services/email.js');
      await sendEmail2({
        clientName: client.name,
        toEmail: client.email,
        pdfPath,
        totalUpdated: maintenanceData.updatedPlugins.length,
        totalPlugins: maintenanceData.allPlugins.length,
      });
      log('✓ Email delivered.');
    }

    activeJobs.set(clientId, {
      status: 'success',
      startedAt: activeJobs.get(clientId)?.startedAt,
      completedAt: new Date().toISOString(),
      updatedPlugins: maintenanceData.updatedPlugins.length,
      pdfPath: path.basename(pdfPath),
    });

    if (io) io.emit('job:complete', { clientId, status: 'success', updatedPlugins: maintenanceData.updatedPlugins.length });
    return { success: true };

  } catch (err) {
    log(`✗ Error: ${err.message}`, 'error');
    activeJobs.set(clientId, {
      status: 'error',
      startedAt: activeJobs.get(clientId)?.startedAt,
      completedAt: new Date().toISOString(),
      error: err.message,
    });
    if (io) io.emit('job:complete', { clientId, status: 'error', error: err.message });
    return { success: false, error: err.message };
  }
}

router.post('/jobs/run/:clientId', async (req, res) => {
  const clients = readClients();
  const client = clients.find(c => c.id === req.params.clientId);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  if (activeJobs.get(client.id)?.status === 'running') {
    return res.status(409).json({ error: 'A job is already running for this client.' });
  }

  // Respond immediately, run async
  res.json({ success: true, message: `Maintenance started for ${client.name}` });

  const io = req.app.get('io');
  runJobForClient(client, req.body, io);
});

router.post('/jobs/run-all', async (req, res) => {
  const clients = readClients().filter(c => c.enabled !== false);
  if (clients.length === 0) return res.status(400).json({ error: 'No enabled clients found.' });

  res.json({ success: true, message: `Starting maintenance for ${clients.length} client(s)` });

  const io = req.app.get('io');
  for (const client of clients) {
    await runJobForClient(client, req.body, io);
  }
});

// ═══════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════
router.get('/reports', (req, res) => {
  if (!fs.existsSync(REPORTS_DIR)) return res.json([]);

  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.endsWith('.pdf'))
    .map(f => {
      const stat = fs.statSync(path.join(REPORTS_DIR, f));
      const parts = f.replace('.pdf', '').split('-');
      const date = parts.slice(-3).join('-');
      const clientId = parts.slice(0, -3).join('-');
      return {
        filename: f,
        clientId,
        date,
        size: stat.size,
        createdAt: stat.birthtime,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(files);
});

router.get('/reports/download/:filename', (req, res) => {
  const filePath = path.join(REPORTS_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Report not found' });
  res.download(filePath);
});

router.delete('/reports/:filename', (req, res) => {
  const filePath = path.join(REPORTS_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  fs.unlinkSync(filePath);
  // Also remove HTML counterpart
  const htmlPath = filePath.replace('.pdf', '.html');
  if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════════════
// LOGS
// ═══════════════════════════════════════════════════════════════════════
router.get('/logs', (req, res) => {
  if (!fs.existsSync(LOGS_DIR)) return res.json([]);

  const files = fs.readdirSync(LOGS_DIR)
    .filter(f => f.endsWith('.log'))
    .map(f => {
      const stat = fs.statSync(path.join(LOGS_DIR, f));
      return { filename: f, size: stat.size, modified: stat.mtime };
    })
    .sort((a, b) => new Date(b.modified) - new Date(a.modified));

  res.json(files);
});

router.get('/logs/:filename', (req, res) => {
  const filePath = path.join(LOGS_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Log not found' });

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n').slice(-500); // Last 500 lines
  res.json({ filename: req.params.filename, lines });
});

// ═══════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════
router.get('/settings', (req, res) => {
  res.json({
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: process.env.SMTP_PORT || '587',
      user: process.env.SMTP_USER || '',
      fromName: process.env.EMAIL_FROM_NAME || 'EVOBRAND',
      fromAddress: process.env.EMAIL_FROM_ADDRESS || '',
    },
    cron: {
      enabled: process.env.CRON_ENABLED === 'true',
      schedule: process.env.CRON_SCHEDULE || '0 2 * * 0',
    },
    wpcli: {
      bin: process.env.WPCLI_BIN || 'wp',
    },
  });
});

export default router;
