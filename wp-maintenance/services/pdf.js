// services/pdf.js — Puppeteer A4 PDF export
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { clientLogger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.resolve(__dirname, '../reports');

/**
 * Generate a PDF from an HTML string using Puppeteer.
 *
 * @param {string} html         — Full HTML content to render
 * @param {string} outputPath   — Absolute path for the output PDF
 * @returns {Promise<string>}   — Resolved output path
 */
export async function generatePDF(html, outputPath, clientName = 'Client') {
  const log = clientLogger(clientName);

  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  log.info('Launching Puppeteer for PDF generation...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });

  try {
    const page = await browser.newPage();

    // Set viewport to A4 width at 96 DPI
    await page.setViewport({ width: 1240, height: 1754 });

    // Load HTML content — use data URI to enable font loading
    await page.setContent(html, {
      waitUntil: 'networkidle0',   // Wait for Google Fonts
      timeout: 30000,
    });

    // Optional: wait for fonts to be fully rendered
    await page.evaluateHandle('document.fonts.ready');

    // Generate A4 PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,      // Required for background colors/gradients
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
      preferCSSPageSize: true,
    });

    log.info(`✓ PDF generated: ${outputPath}`);
    return outputPath;

  } finally {
    await browser.close();
  }
}

/**
 * Build the canonical PDF output path for a client.
 *
 * @param {string} clientId   — Slug-safe client ID
 * @param {string} dateSlug   — e.g. "2026-04-30"
 * @returns {string}
 */
export function buildPDFPath(clientId, dateSlug) {
  return path.join(REPORTS_DIR, `${clientId}-${dateSlug}.pdf`);
}
