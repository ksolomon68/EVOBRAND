// run-maintenance.js — EVOBRAND WordPress Maintenance System
// Main entry point. Run: node run-maintenance.js
// ─────────────────────────────────────────────────────────────────────────────

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

import { runMaintenanceCycle } from './services/wordpress.js';
import { generateReportHTML, saveReportHTML } from './services/report.js';
import { generatePDF, buildPDFPath } from './services/pdf.js';
import { sendMaintenanceReport } from './services/email.js';
import { slugify, formatDateSlug } from './utils/helpers.js';
import logger, { clientLogger } from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── CLI flags ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const REPORT_ONLY = args.includes('--report-only');
const SPECIFIC_CLIENT = args.find(
  (a) => a.startsWith('--client=')
)?.replace('--client=', '');

// ─── Load client configurations ───────────────────────────────────────────────
function loadClients() {
  const clientsPath = path.resolve(__dirname, 'clients/clients.json');

  if (!fs.existsSync(clientsPath)) {
    logger.error(`clients.json not found at: ${clientsPath}`);
    logger.error('Copy clients.json.example to clients/clients.json and configure your clients.');
    process.exit(1);
  }

  const clients = JSON.parse(fs.readFileSync(clientsPath, 'utf8'));

  // Filter by --client= flag if specified
  if (SPECIFIC_CLIENT) {
    const matched = clients.filter(
      (c) => c.id === SPECIFIC_CLIENT || slugify(c.name) === SPECIFIC_CLIENT
    );
    if (matched.length === 0) {
      logger.error(`No client found matching: "${SPECIFIC_CLIENT}"`);
      process.exit(1);
    }
    return matched;
  }

  // Only return enabled clients
  return clients.filter((c) => c.enabled !== false);
}

// ─── Process a single client ──────────────────────────────────────────────────
async function processClient(client) {
  const log = clientLogger(client.name);
  const dateSlug = formatDateSlug();
  const clientSlug = client.id || slugify(client.name);

  log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.info(`Starting maintenance for: ${chalk.bold(client.name)}`);

  const result = {
    client: client.name,
    status: 'unknown',
    updatedPlugins: 0,
    pdfPath: null,
    emailSent: false,
    error: null,
  };

  try {
    // ── Step 1: Run WordPress maintenance ──────────────────────────────────
    let maintenanceData;

    if (DRY_RUN || REPORT_ONLY) {
      log.info(
        DRY_RUN
          ? chalk.yellow('[DRY RUN] Skipping actual WordPress updates.')
          : chalk.blue('[REPORT ONLY] Generating report from mock data.')
      );

      // Use mock data for dry runs / report-only mode
      maintenanceData = {
        updatedPlugins: [
          {
            name: 'woocommerce',
            title: 'WooCommerce',
            oldVersion: '8.5.0',
            newVersion: '8.7.2',
            status: 'Updated',
          },
          {
            name: 'yoast-seo',
            title: 'Yoast SEO',
            oldVersion: '22.1',
            newVersion: '22.4',
            status: 'Updated',
          },
          {
            name: 'wordfence',
            title: 'Wordfence Security',
            oldVersion: '7.11.0',
            newVersion: '7.11.5',
            status: 'Updated',
          },
          {
            name: 'contact-form-7',
            title: 'Contact Form 7',
            oldVersion: '5.9.5',
            newVersion: '5.9.8',
            status: 'Updated',
          },
        ],
        allPlugins: Array(14).fill({}),
        status: 'success',
      };
    } else {
      maintenanceData = await runMaintenanceCycle(client);
    }

    if (maintenanceData.status === 'error') {
      throw new Error(maintenanceData.errorMessage || 'Maintenance cycle failed.');
    }

    result.status = 'success';
    result.updatedPlugins = maintenanceData.updatedPlugins.length;

    // ── Step 2: Generate HTML report ───────────────────────────────────────
    log.info('Generating HTML report...');
    const html = generateReportHTML({
      clientName: client.name,
      updatedPlugins: maintenanceData.updatedPlugins,
      allPlugins: maintenanceData.allPlugins,
      status: maintenanceData.status,
    });

    // Save HTML (as intermediate artifact)
    const htmlPath = path.resolve(
      __dirname,
      `reports/${clientSlug}-${dateSlug}.html`
    );
    saveReportHTML(html, htmlPath);

    // ── Step 3: Generate PDF ───────────────────────────────────────────────
    log.info('Generating PDF report...');
    const pdfPath = buildPDFPath(clientSlug, dateSlug);
    await generatePDF(html, pdfPath, client.name);
    result.pdfPath = pdfPath;

    // ── Step 4: Send Email ─────────────────────────────────────────────────
    if (client.email && !DRY_RUN) {
      await sendMaintenanceReport({
        clientName: client.name,
        toEmail: client.email,
        pdfPath,
        totalUpdated: maintenanceData.updatedPlugins.length,
        totalPlugins: maintenanceData.allPlugins.length,
      });
      result.emailSent = true;
    } else if (DRY_RUN) {
      log.info(chalk.yellow('[DRY RUN] Email skipped.'));
    } else {
      log.warn('No email address configured for this client — skipping delivery.');
    }

    log.info(chalk.green(`✓ Maintenance complete for ${client.name}.`));
    log.info(`  Updated plugins : ${result.updatedPlugins}`);
    log.info(`  PDF report      : ${pdfPath}`);
    log.info(`  Email sent      : ${result.emailSent}`);

  } catch (err) {
    result.status = 'error';
    result.error = err.message;
    log.error(`✗ Maintenance FAILED for ${client.name}: ${err.message}`);
    logger.error(err);
  }

  return result;
}

// ─── Run all clients ──────────────────────────────────────────────────────────
async function runAll() {
  const clients = loadClients();

  logger.info(chalk.bold.cyan('\n  ╔═══════════════════════════════════════╗'));
  logger.info(chalk.bold.cyan('  ║  EVOBRAND WordPress Maintenance       ║'));
  logger.info(chalk.bold.cyan('  ╚═══════════════════════════════════════╝\n'));
  logger.info(`  Mode     : ${DRY_RUN ? '🔵 Dry Run' : REPORT_ONLY ? '🟡 Report Only' : '🟢 Live'}`);
  logger.info(`  Clients  : ${clients.length}`);
  logger.info(`  Time     : ${new Date().toLocaleString()}\n`);

  const results = [];

  // Process clients sequentially to avoid SSH overload
  for (const client of clients) {
    const result = await processClient(client);
    results.push(result);
  }

  // ── Final summary ──────────────────────────────────────────────────────────
  const succeeded = results.filter((r) => r.status === 'success');
  const failed = results.filter((r) => r.status === 'error');

  logger.info('\n' + chalk.bold('━━━━━━━━━━━ MAINTENANCE SUMMARY ━━━━━━━━━━━'));
  logger.info(`  Total clients  : ${results.length}`);
  logger.info(`  ✓ Succeeded    : ${chalk.green(succeeded.length)}`);
  logger.info(`  ✗ Failed       : ${chalk.red(failed.length)}`);

  if (failed.length > 0) {
    logger.info('\n  Failed clients:');
    failed.forEach((r) => logger.error(`    • ${r.client}: ${r.error}`));
  }

  logger.info(chalk.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  return results;
}

// ─── Cron scheduling ─────────────────────────────────────────────────────────
function startCronMode() {
  const schedule = process.env.CRON_SCHEDULE || '0 2 * * 0'; // Default: Sunday 2AM

  if (!cron.validate(schedule)) {
    logger.error(`Invalid CRON_SCHEDULE: "${schedule}"`);
    process.exit(1);
  }

  logger.info(chalk.cyan(`Cron mode active — scheduled: "${schedule}"`));
  logger.info('Waiting for next scheduled run...\n');

  cron.schedule(schedule, async () => {
    logger.info('Cron trigger — starting maintenance run...');
    await runAll();
  });
}

// ─── Entrypoint ───────────────────────────────────────────────────────────────
if (process.env.CRON_ENABLED === 'true') {
  startCronMode();
} else {
  runAll().catch((err) => {
    logger.error('Fatal error in main process:', err);
    process.exit(1);
  });
}
