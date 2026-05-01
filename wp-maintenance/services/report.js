// services/report.js — HTML report generator using Handlebars
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatDate, generateRecommendations } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.resolve(__dirname, '../templates/report.hbs');

// ─── Register Handlebars helpers ──────────────────────────────────────────────
Handlebars.registerHelper('if', function (condition, options) {
  return condition ? options.fn(this) : options.inverse(this);
});

// ─── Load & compile template (cached) ────────────────────────────────────────
let _compiledTemplate = null;

function getTemplate() {
  if (_compiledTemplate) return _compiledTemplate;

  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Report template not found at: ${TEMPLATE_PATH}`);
  }
  const src = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  _compiledTemplate = Handlebars.compile(src);
  return _compiledTemplate;
}

// ─── Generate HTML report ─────────────────────────────────────────────────────
/**
 * Generates an HTML string from the Handlebars template.
 *
 * @param {object} params
 * @param {string} params.clientName     — Display name of the client
 * @param {Array}  params.updatedPlugins — Plugins that were updated
 * @param {Array}  params.allPlugins     — Full plugin list (post-update)
 * @param {string} params.status         — 'success' | 'error'
 * @returns {string} Rendered HTML
 */
export function generateReportHTML({
  clientName,
  updatedPlugins = [],
  allPlugins = [],
  status = 'success',
}) {
  const template = getTemplate();

  const recommendations = generateRecommendations(updatedPlugins, clientName);
  const isHealthy = status === 'success';

  const data = {
    clientName,
    reportDate: formatDate(),
    totalUpdated: updatedPlugins.length,
    totalPlugins: allPlugins.length,
    hasUpdates: updatedPlugins.length > 0,
    isHealthy,
    status,
    updatedPlugins,
    recommendations,
  };

  logger.debug(`Rendering report for "${clientName}" — ${updatedPlugins.length} updates`);
  return template(data);
}

// ─── Save HTML to disk ────────────────────────────────────────────────────────
/**
 * Saves the rendered HTML report to a temp file and returns the path.
 */
export function saveReportHTML(html, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf8');
  logger.debug(`HTML report saved: ${outputPath}`);
  return outputPath;
}
