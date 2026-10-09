const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Load the real route with external integrations stubbed: no database,
// network requests or client emails are needed to exercise report logic.
function load(fetch = async () => { throw new Error('Unexpected network call'); }) {
  const context = {
    require: (name) => name === 'express' ? { Router: () => ({ post() {}, get() {} }) } : {},
    module: { exports: {} }, process: { env: {} }, console: { error() {} },
    fetch, AbortSignal, Date, URL,
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/routes/accessibility.js'), 'utf8') +
    '\nmodule.exports = { buildReport, staticHeuristics, generateReport, scanLighthouseAccessibility };', context);
  return context.module.exports;
}

const scan = (audits = [], score = 100) => ({
  url: 'https://example.com', lighthouse: { fetched: true, score, audits, meta: null }, heuristics: null,
});
const audit = (id, score, weight = 3, mode = 'binary') => ({ id, title: id, description: 'Observed finding', score, weight, mode, examples: [] });

test('only completed binary failures become findings; unweighted checks remain visible', () => {
  const r = load().buildReport(scan([
    audit('color-contrast', 0), audit('image-alt', 1), audit('heading-order', 0, 0),
    audit('label', null, 3, 'error'), audit('keyboard', null, 0, 'manual'),
  ], 75));
  assert.equal(r.overall_score, 75);
  assert.equal(r.critical_issues.length, 2);
  assert.equal(r.critical_issues.find((i) => i.id === 'heading-order').wcag_failure, false);
  assert.equal(r.pour.perceivable.passed, 1);
  assert.equal(r.pour.perceivable.total, 2);
  assert.equal(r.scan_meta.checks_not_completed[0], 'label');
  assert.equal(r.scan_meta.manual_checks[0], 'keyboard');
  assert.equal(r.risk_level, null);
  assert.ok(r.evobrand_support.some((s) => s.includes('color')));
});

test('a perfect score still requires manual review and does not assert conformance', async () => {
  const r = await load().generateReport({}, scan([audit('image-alt', 1)]));
  assert.equal(r.remediation_priority, 'Manual review needed');
  assert.equal(r.critical_issues.length, 0);
  assert.match(r.disclaimer, /not a site-wide WCAG conformance assessment/);
  assert.ok(r.evobrand_support.some((s) => s.includes('manually')));
});

test('limited and failed scans never fabricate scores or confirmed findings', () => {
  const api = load();
  const base = { url: 'https://example.com', lighthouse: { fetched: false, score: null, audits: [], meta: null } };
  const limited = api.buildReport({ ...base, heuristics: api.staticHeuristics('<html><body><img src="x"></body></html>') });
  assert.equal(limited.overall_score, null);
  assert.ok(limited.critical_issues.every((i) => i.verification_required));
  assert.ok(limited.evobrand_support.length);
  const failed = api.buildReport({ ...base, heuristics: null });
  assert.equal(failed.status, 'failed');
  assert.equal(failed.overall_score, null);
  assert.equal(failed.critical_issues.length, 0);
});

test('raw HTML ignores comments and script markup, preserves app-shell detection', () => {
  const api = load();
  const h = api.staticHeuristics('<html lang="en"><title>Page</title><body><p>Content</p><!-- <img src="fake"> --><script>const markup = "<img>";</script><img alt="" src="decorative"><input aria-label=""></body></html>');
  assert.equal(h.imgCount, 1);
  assert.equal(h.imgsMissingAlt, 0);
  assert.equal(h.fieldsMissingLabel, 1);
  assert.equal(api.staticHeuristics('<html lang=""><body></body></html>').hasLang, false);
  assert.equal(api.staticHeuristics('<html lang="en"><body><div id="root"></div><SCRIPT src="app.js"></SCRIPT></body></html>').clientRendered, true);
});

test('WCAG 2.2 target-size mapping is distinct from best practices', () => {
  const r = load().buildReport(scan([audit('target-size', 0), audit('heading-order', 0, 0)]));
  assert.match(r.critical_issues.find((i) => i.id === 'target-size').wcag, /2.5.8.*Level AA, WCAG 2.2/);
  assert.match(r.critical_issues.find((i) => i.id === 'heading-order').wcag, /not a WCAG requirement/);
});

test('Lighthouse runtime errors and invalid scores are rejected rather than reported', async () => {
  for (const result of [
    { runtimeError: { code: 'NO_FCP' }, categories: { accessibility: { score: 0 } } },
    { categories: { accessibility: { score: 1.5 } } },
  ]) {
    const api = load(async () => ({ ok: true, json: async () => ({ lighthouseResult: result }) }));
    const r = await api.scanLighthouseAccessibility('https://example.com');
    assert.equal(r.fetched, false);
    assert.equal(r.score, null);
  }
});

test('PDF shows evidence limits and tailored support, escapes markup, and preserves missing scores', () => {
  const context = { window: { location: { origin: 'https://example.com' } } };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, '../../web/src/components/accessibility/AccessibilityPDF.jsx'), 'utf8');
  vm.runInContext(source.slice(0, source.indexOf('export const downloadAccessibilityPDF')), context);
  const report = load().buildReport(scan([audit('color-contrast', 0)], 80));
  report.critical_issues[0].examples = ['<script>alert(1)</script>'];
  const html = context.buildPrintHTML(report, 'Example <Brand>', 'October 8, 2026');
  assert.match(html, /How EVOBRAND Can Help/);
  assert.match(html, /Remediation Priority/);
  assert.doesNotMatch(html, /Risk Level/);
  assert.match(html, /not a site-wide WCAG conformance assessment/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /https:\/\/evobrandconcepts.com\/book-consultation/);
  const limited = load().buildReport({ url: 'https://example.com', lighthouse: { fetched: false, score: null, audits: [], meta: null }, heuristics: { hasLang: false, clientRendered: true } });
  const limitedHtml = context.buildPrintHTML(limited, 'Example', 'October 8, 2026');
  assert.match(limitedHtml, /Not scored/);
  assert.match(limitedHtml, /Potential issue from raw HTML/);
  assert.doesNotMatch(limitedHtml, /class="big-score"/);
});
