const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../db/connection');
const { sendEmail } = require('../utils/mailer');
const { addToLeadsIfNew } = require('../utils/crmHelpers');

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY || '';
const SITE_URL = process.env.APP_URL || 'https://evobrandconcepts.com';

if (!GEMINI_KEY) {
  console.warn('[Accessibility] GEMINI_API_KEY / GOOGLE_AI_API_KEY not set — reports will use scan-generated wording instead of AI-written summaries.');
}

// ─── WCAG reference data ──────────────────────────────────────────────────────
//
// Every number and citation in a report comes from the scan and these tables.
// The AI only rewrites summaries around them, so it can't invent a score,
// an issue or a success criterion.

const WCAG_CRITERIA = {
  '1.1.1': ['Non-text Content', 'A'],
  '1.2.2': ['Captions (Prerecorded)', 'A'],
  '1.3.1': ['Info and Relationships', 'A'],
  '1.3.5': ['Identify Input Purpose', 'AA'],
  '1.4.1': ['Use of Color', 'A'],
  '1.4.3': ['Contrast (Minimum)', 'AA'],
  '1.4.4': ['Resize Text', 'AA'],
  '2.2.1': ['Timing Adjustable', 'A'],
  '2.4.1': ['Bypass Blocks', 'A'],
  '2.4.2': ['Page Titled', 'A'],
  '2.4.4': ['Link Purpose (In Context)', 'A'],
  '2.5.3': ['Label in Name', 'A'],
  '2.5.8': ['Target Size (Minimum)', 'AA', '2.2'],
  '3.1.1': ['Language of Page', 'A'],
  '3.1.2': ['Language of Parts', 'AA'],
  '3.3.2': ['Labels or Instructions', 'A'],
  '4.1.2': ['Name, Role, Value', 'A'],
};

const PRINCIPLES = {
  1: { key: 'perceivable', label: 'Perceivable' },
  2: { key: 'operable', label: 'Operable' },
  3: { key: 'understandable', label: 'Understandable' },
  4: { key: 'robust', label: 'Robust' },
};

const BEST_PRACTICE = 'Best practice (not a WCAG requirement)';

// Lighthouse accessibility audits (axe-core rules): the WCAG criterion each
// one tests and axe-core's default impact. `sc: null` marks axe best-practice
// rules, which are worth fixing but are not WCAG failures.
const RULES = {
  'accesskeys': { sc: null, impact: 'Serious' },
  'aria-allowed-attr': { sc: '4.1.2', impact: 'Critical' },
  'aria-allowed-role': { sc: null, impact: 'Minor' },
  'aria-command-name': { sc: '4.1.2', impact: 'Serious' },
  'aria-conditional-attr': { sc: '4.1.2', impact: 'Serious' },
  'aria-deprecated-role': { sc: '4.1.2', impact: 'Minor' },
  'aria-dialog-name': { sc: null, impact: 'Serious' },
  'aria-hidden-body': { sc: '4.1.2', impact: 'Critical' },
  'aria-hidden-focus': { sc: '4.1.2', impact: 'Serious' },
  'aria-input-field-name': { sc: '4.1.2', impact: 'Serious' },
  'aria-meter-name': { sc: '1.1.1', impact: 'Serious' },
  'aria-progressbar-name': { sc: '1.1.1', impact: 'Serious' },
  'aria-prohibited-attr': { sc: '4.1.2', impact: 'Serious' },
  'aria-required-attr': { sc: '4.1.2', impact: 'Critical' },
  'aria-required-children': { sc: '1.3.1', impact: 'Critical' },
  'aria-required-parent': { sc: '1.3.1', impact: 'Critical' },
  'aria-roles': { sc: '4.1.2', impact: 'Critical' },
  'aria-text': { sc: null, impact: 'Serious' },
  'aria-toggle-field-name': { sc: '4.1.2', impact: 'Serious' },
  'aria-tooltip-name': { sc: '4.1.2', impact: 'Serious' },
  'aria-treeitem-name': { sc: null, impact: 'Serious' },
  'aria-valid-attr-value': { sc: '4.1.2', impact: 'Critical' },
  'aria-valid-attr': { sc: '4.1.2', impact: 'Critical' },
  'autocomplete-valid': { sc: '1.3.5', impact: 'Serious' },
  'button-name': { sc: '4.1.2', impact: 'Critical' },
  'bypass': { sc: '2.4.1', impact: 'Serious' },
  'color-contrast': { sc: '1.4.3', impact: 'Serious' },
  'definition-list': { sc: '1.3.1', impact: 'Serious' },
  'dlitem': { sc: '1.3.1', impact: 'Serious' },
  'document-title': { sc: '2.4.2', impact: 'Serious' },
  'duplicate-id-aria': { sc: '4.1.2', impact: 'Critical' },
  'empty-heading': { sc: null, impact: 'Minor' },
  'form-field-multiple-labels': { sc: '3.3.2', impact: 'Moderate' },
  'frame-title': { sc: '4.1.2', impact: 'Serious' },
  'frame-title-unique': { sc: '4.1.2', impact: 'Serious' },
  'heading-order': { sc: null, impact: 'Moderate' },
  'html-has-lang': { sc: '3.1.1', impact: 'Serious' },
  'html-lang-valid': { sc: '3.1.1', impact: 'Serious' },
  'html-xml-lang-mismatch': { sc: '3.1.1', impact: 'Moderate' },
  'identical-links-same-purpose': { sc: null, impact: 'Minor' },
  'image-alt': { sc: '1.1.1', impact: 'Critical' },
  'image-redundant-alt': { sc: null, impact: 'Minor' },
  'input-button-name': { sc: '4.1.2', impact: 'Critical' },
  'input-image-alt': { sc: '1.1.1', impact: 'Critical' },
  'label': { sc: '4.1.2', impact: 'Critical' },
  'label-content-name-mismatch': { sc: '2.5.3', impact: 'Serious' },
  'landmark-one-main': { sc: null, impact: 'Moderate' },
  'link-in-text-block': { sc: '1.4.1', impact: 'Serious' },
  'link-name': { sc: '2.4.4', impact: 'Serious' },
  'list': { sc: '1.3.1', impact: 'Serious' },
  'listitem': { sc: '1.3.1', impact: 'Serious' },
  'meta-refresh': { sc: '2.2.1', impact: 'Critical' },
  'meta-viewport': { sc: '1.4.4', impact: 'Critical' },
  'nested-interactive': { sc: '4.1.2', impact: 'Serious' },
  'object-alt': { sc: '1.1.1', impact: 'Serious' },
  'role-img-alt': { sc: '1.1.1', impact: 'Serious' },
  'select-name': { sc: '4.1.2', impact: 'Critical' },
  'skip-link': { sc: null, impact: 'Moderate' },
  'svg-img-alt': { sc: '1.1.1', impact: 'Serious' },
  'tabindex': { sc: null, impact: 'Serious' },
  'table-duplicate-name': { sc: null, impact: 'Minor' },
  'table-fake-caption': { sc: '1.3.1', impact: 'Serious' },
  'target-size': { sc: '2.5.8', impact: 'Serious' },
  'td-has-header': { sc: '1.3.1', impact: 'Critical' },
  'td-headers-attr': { sc: '1.3.1', impact: 'Serious' },
  'th-has-data-cells': { sc: '1.3.1', impact: 'Serious' },
  'valid-lang': { sc: '3.1.2', impact: 'Serious' },
  'video-caption': { sc: '1.2.2', impact: 'Critical' },
};

// Plain-language fixes for the most common failures. Anything else falls back
// to Lighthouse's own guidance.
const FIXES = {
  'image-alt': 'Add alt text that describes each meaningful image, and alt="" to purely decorative ones.',
  'input-image-alt': 'Give each image button an alt attribute that says what the button does.',
  'color-contrast': 'Darken or lighten the flagged text or its background until normal text reaches a 4.5:1 contrast ratio (3:1 for large text).',
  'label': 'Connect each form field to a visible <label for="..."> or give it an aria-label.',
  'button-name': 'Give every button visible text or an aria-label that says what it does. Icon-only buttons need an aria-label.',
  'link-name': 'Make sure every link has text a screen reader can announce. For icon or image links, add an aria-label or alt text.',
  'html-has-lang': 'Add a lang attribute to the <html> tag, for example <html lang="en">.',
  'html-lang-valid': 'Use a valid language code in the <html lang> attribute, for example "en" or "en-US".',
  'document-title': 'Add a descriptive <title> to the page.',
  'meta-viewport': 'Remove user-scalable=no from the viewport meta tag and set maximum-scale to at least 5 (or remove it).',
  'heading-order': 'Use heading levels in order (H1, then H2, then H3) without skipping levels.',
  'bypass': 'Add a "Skip to main content" link, or wrap the main content in a <main> landmark, so keyboard users can skip the navigation.',
  'list': 'Make sure <ul> and <ol> elements contain only <li> (and <script> or <template>) elements.',
  'listitem': 'Place every <li> inside a <ul> or <ol>.',
  'select-name': 'Connect each dropdown to a <label> or give it an aria-label.',
  'frame-title': 'Give each <iframe> a title attribute that describes its content.',
  'video-caption': 'Add a captions track to every video with spoken content.',
  'tabindex': 'Remove positive tabindex values so focus follows the page order. Use tabindex="0" or "-1" only.',
  'target-size': 'Make tap targets at least 24×24 CSS pixels, or leave enough space around smaller ones.',
  'link-in-text-block': 'Underline links inside paragraphs, or give them a 3:1 contrast with the surrounding text plus a non-color cue.',
  'label-content-name-mismatch': 'Make each control\'s accessible name start with the text that is visible on it.',
  'aria-hidden-focus': 'Remove focusable elements from inside aria-hidden="true" containers, or make them unfocusable.',
  'duplicate-id-aria': 'Give every element referenced by ARIA (aria-labelledby, aria-describedby, for) a unique id.',
  'aria-allowed-attr': 'Remove ARIA attributes that are not allowed on the element\'s role.',
  'aria-required-attr': 'Add the ARIA attributes each role requires, for example aria-checked on role="checkbox".',
  'aria-valid-attr-value': 'Correct ARIA attribute values so they match what the attribute accepts.',
  'aria-valid-attr': 'Fix misspelled or invalid ARIA attribute names.',
  'aria-roles': 'Use only valid ARIA role values.',
  'nested-interactive': 'Don\'t put links or buttons inside other links or buttons.',
  'landmark-one-main': 'Wrap the page\'s primary content in a single <main> element.',
  'td-has-header': 'Mark header cells with <th> (and a scope attribute) so every data cell in the table has a header.',
  'th-has-data-cells': 'Make sure every <th> header cell describes at least one data cell, or change it to a <td>.',
  'td-headers-attr': 'Point each cell\'s headers attribute only at <th> cells in the same table.',
};

const SEVERITY_RANK = { Critical: 0, Serious: 1, Moderate: 2, Minor: 3 };

function citation(sc) {
  if (!sc) return BEST_PRACTICE;
  const [name, level, version] = WCAG_CRITERIA[sc] || [];
  if (!name) return sc;
  return `${sc} ${name} (Level ${level}${version ? `, WCAG ${version}` : ''})`;
}

function principleOf(sc) {
  return sc ? PRINCIPLES[sc.charAt(0)] || null : null;
}

// ─── Scan ─────────────────────────────────────────────────────────────────────

function normaliseUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function visibleText(html) {
  const body = (html.match(/<body\b[\s\S]*$/i) || [html])[0];
  return body
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Checks we can make from the raw HTML the server returns. These only feed the
// report when Lighthouse couldn't run, and the body-content checks are skipped
// for JavaScript-rendered pages, whose raw HTML is an empty shell (checking it
// would report missing headings and images that do exist once the page loads).
function staticHeuristics(html) {
  const htmlTag = (html.match(/<html\b[^>]*>/i) || [''])[0];
  const hasLang = /\slang\s*=\s*["']?[a-z]{2,3}(-[a-z0-9]+)*["']?/i.test(htmlTag);

  const viewportTag = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((m) => m[0])
    .find((t) => /name\s*=\s*["']?viewport/i.test(t)) || '';
  const viewportContent = ((viewportTag.match(/content\s*=\s*["']([^"']*)["']/i) || [])[1] || '').toLowerCase();
  const maxScale = parseFloat((viewportContent.match(/maximum-scale\s*=\s*([\d.]+)/) || [])[1]);
  const zoomDisabled = /user-scalable\s*=\s*(no|0)\b/.test(viewportContent)
    || (Number.isFinite(maxScale) && maxScale < 2);

  // A JS app shell: almost no text in the HTML, plus a script bundle or an
  // empty mount point. Short static pages have little text but no bundle.
  const clientRendered = visibleText(html).length < 200
    && (/<script\b[^>]*\bsrc=/i.test(html) || /<div\b[^>]*\bid=["'](root|app|__next|__nuxt)["'][^>]*>\s*<\/div>/i.test(html));
  if (clientRendered) return { clientRendered, hasLang, zoomDisabled };

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const imgsMissingAlt = imgTags.filter((t) => !/\salt(\s*=|[\s/>])/i.test(t)
    && !/\srole\s*=\s*["']?(presentation|none)/i.test(t)
    && !/\saria-hidden\s*=\s*["']?true/i.test(t)).length;

  // Inputs are labelled by <label for>, by being wrapped in a <label>, or by
  // aria-label / aria-labelledby / title.
  const labelFor = new Set([...html.matchAll(/<label\b[^>]*\bfor\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]));
  const wrapped = new Set([...html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)]
    .flatMap((m) => m[1].match(/<(input|select|textarea)\b[^>]*>/gi) || []));
  const fields = (html.match(/<(input|select|textarea)\b[^>]*>/gi) || [])
    .filter((t) => !/type\s*=\s*["']?(hidden|submit|button|reset|image)\b/i.test(t));
  const fieldsMissingLabel = fields.filter((t) => {
    if (wrapped.has(t)) return false;
    if (/\s(aria-label|aria-labelledby|title)\s*=/i.test(t)) return false;
    const id = (t.match(/\sid\s*=\s*["']([^"']+)["']/i) || [])[1];
    return !(id && labelFor.has(id));
  }).length;

  const hasTitle = /<title\b[^>]*>\s*[^<\s][^<]*<\/title>/i.test(html);

  return {
    clientRendered,
    hasLang,
    zoomDisabled,
    hasTitle,
    imgCount: imgTags.length,
    imgsMissingAlt,
    fieldCount: fields.length,
    fieldsMissingLabel,
  };
}

async function scanLighthouseAccessibility(url) {
  const result = { fetched: false, score: null, audits: [], meta: null };
  try {
    let psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=accessibility&locale=en`;
    if (PAGESPEED_API_KEY) psUrl += `&key=${PAGESPEED_API_KEY}`;
    // Lighthouse regularly needs 20–40 seconds for a real page.
    const res = await fetch(psUrl, { signal: AbortSignal.timeout(50000) });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => '');
      console.error(`[Accessibility] PageSpeed API returned ${res.status} for ${url}: ${bodyText.slice(0, 300)}`);
      return result;
    }
    const data = await res.json();
    const lh = data.lighthouseResult;
    const category = lh && lh.categories && lh.categories.accessibility;
    // A runtime error means Lighthouse scored an error page (or nothing), not
    // the site, so its numbers would be misleading.
    if (data.error || !lh || lh.runtimeError || !category || typeof category.score !== 'number') {
      const reason = (data.error && data.error.message) || (lh && lh.runtimeError && lh.runtimeError.code) || 'no accessibility score';
      console.error(`[Accessibility] PageSpeed could not score ${url}: ${reason}`);
      return result;
    }

    result.fetched = true;
    result.score = Math.round(category.score * 100);
    result.meta = {
      finalUrl: lh.finalDisplayedUrl || lh.finalUrl || url,
      fetchTime: lh.fetchTime || null,
      lighthouseVersion: lh.lighthouseVersion || null,
    };
    result.audits = (category.auditRefs || [])
      .map((ref) => {
        const a = lh.audits[ref.id];
        if (!a) return null;
        const items = (a.details && Array.isArray(a.details.items)) ? a.details.items : [];
        return {
          id: a.id,
          weight: ref.weight || 0,
          mode: a.scoreDisplayMode,
          score: a.score,
          // Lighthouse text is Markdown: drop the backticks and "Learn more" links.
          title: (a.title || '').replace(/`/g, ''),
          description: (a.description || '').replace(/\s*\[[^\]]*\]\([^)]*\)\.?/g, '').replace(/`/g, '').trim(),
          affectedCount: items.length || null,
          examples: items.slice(0, 3)
            .map((it) => it.node && (it.node.snippet || it.node.selector))
            .filter(Boolean)
            .map((s) => String(s).slice(0, 200)),
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.error(`[Accessibility] PageSpeed scan threw for ${url}:`, err.message);
  }
  return result;
}

async function scanAccessibility(rawUrl) {
  const url = normaliseUrl(rawUrl);
  let html = '';
  let isLive = false;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'EVOBRAND-AccessibilityChecker/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    isLive = res.ok;
    if (res.ok) html = await res.text();
  } catch (err) {
    console.error(`[Accessibility] Direct site fetch failed for ${url} (Lighthouse may still succeed):`, err.message);
  }

  const lighthouse = await scanLighthouseAccessibility(url);
  return { url, isLive: isLive || lighthouse.fetched, lighthouse, heuristics: html ? staticHeuristics(html) : null };
}

// ─── Findings ─────────────────────────────────────────────────────────────────

function lighthouseFindings(lighthouse) {
  const checked = lighthouse.audits.filter((a) => a.mode === 'binary' && typeof a.score === 'number');
  // Lighthouse gives some checks zero weight. They are still real failures, so
  // they are listed, but pass counts use weighted checks to match the score.
  const scored = checked.filter((a) => a.weight > 0);
  const failing = checked.filter((a) => a.score < 1);

  const issues = failing.map((a) => {
    const rule = RULES[a.id] || {};
    const count = a.affectedCount ? `${a.affectedCount} element${a.affectedCount === 1 ? '' : 's'} on this page failed. ` : '';
    const unweighted = a.weight > 0 ? '' : ' Lighthouse doesn\'t count this check in its score.';
    return {
      id: a.id,
      title: a.title,
      wcag: a.id in RULES ? citation(rule.sc) : '',
      wcag_failure: !!rule.sc,
      severity: rule.impact || 'Moderate',
      detail: `${count}${a.description}${unweighted}`.trim(),
      fix: FIXES[a.id] || 'Correct each flagged element, then re-run the scan to confirm the check passes.',
      examples: a.examples,
    };
  }).sort((x, y) => (SEVERITY_RANK[x.severity] - SEVERITY_RANK[y.severity])
    || (Number(y.wcag_failure) - Number(x.wcag_failure)));

  // Score each POUR principle the way Lighthouse scores the whole category:
  // the weighted share of applicable checks that passed.
  const pour = {};
  Object.values(PRINCIPLES).forEach(({ key, label }) => {
    const inPrinciple = scored.filter((a) => {
      const p = principleOf((RULES[a.id] || {}).sc);
      return p && p.key === key;
    });
    const weight = inPrinciple.reduce((sum, a) => sum + a.weight, 0);
    const failed = inPrinciple.filter((a) => a.score < 1);
    pour[key] = {
      label,
      score: weight > 0 ? Math.round(inPrinciple.reduce((sum, a) => sum + a.weight * a.score, 0) / weight * 100) : null,
      passed: inPrinciple.length - failed.length,
      total: inPrinciple.length,
      insight: inPrinciple.length === 0
        ? 'None of the automated checks for this principle applied to this page.'
        : failed.length === 0
          ? `Passed all ${inPrinciple.length} automated checks for this principle.`
          : `Passed ${inPrinciple.length - failed.length} of ${inPrinciple.length} automated checks. Failing: ${failed.map((a) => a.title.replace(/\.$/, '')).join('; ')}.`,
    };
  });

  return { issues, pour };
}

// Used only when Lighthouse couldn't run. It reports what the raw HTML shows,
// with no score: a handful of HTML checks can't support a number out of 100.
function heuristicFindings(h) {
  const issues = [];
  if (!h.hasLang) {
    issues.push({ id: 'html-has-lang', title: 'Page is missing an <html lang> attribute', wcag: citation('3.1.1'), wcag_failure: true, severity: 'Serious', detail: 'Screen readers can\'t choose the right pronunciation without a declared page language.', fix: FIXES['html-has-lang'] });
  }
  if (h.zoomDisabled) {
    issues.push({ id: 'meta-viewport', title: 'Pinch-zoom is disabled', wcag: citation('1.4.4'), wcag_failure: true, severity: 'Critical', detail: 'Low-vision visitors on phones can\'t zoom in to read the page.', fix: FIXES['meta-viewport'] });
  }
  if (!h.clientRendered) {
    if (!h.hasTitle) {
      issues.push({ id: 'document-title', title: 'Page has no <title>', wcag: citation('2.4.2'), wcag_failure: true, severity: 'Serious', detail: 'Screen reader users hear the title first; without one they can\'t tell pages or tabs apart.', fix: FIXES['document-title'] });
    }
    if (h.imgsMissingAlt > 0) {
      issues.push({ id: 'image-alt', title: `${h.imgsMissingAlt} image${h.imgsMissingAlt === 1 ? '' : 's'} missing an alt attribute`, wcag: citation('1.1.1'), wcag_failure: true, severity: 'Critical', detail: 'Screen reader users get no description of these images, or hear the file name instead.', fix: FIXES['image-alt'] });
    }
    if (h.fieldsMissingLabel > 0) {
      issues.push({ id: 'label', title: `${h.fieldsMissingLabel} form field${h.fieldsMissingLabel === 1 ? '' : 's'} without a label`, wcag: citation('4.1.2'), wcag_failure: true, severity: 'Critical', detail: 'Screen reader and voice-control users can\'t tell what these fields are for.', fix: FIXES['label'] });
    }
  }
  return issues.sort((x, y) => SEVERITY_RANK[x.severity] - SEVERITY_RANK[y.severity]);
}

// ─── Report ───────────────────────────────────────────────────────────────────

function gradeFor(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// How exposed the page looks to complaints, from confirmed WCAG failures only.
function riskFor(score, issues) {
  const wcag = issues.filter((i) => i.wcag_failure);
  if (wcag.length === 0) return 'Low';
  if (score < 70 || wcag.filter((i) => i.severity === 'Critical').length >= 2) return 'High';
  return 'Moderate';
}

const DISCLAIMER = 'This report is based on an automated scan of one page. Automated tools catch only part of WCAG 2.1 AA, so a manual review with a keyboard and screen reader is still needed to confirm compliance. This is not legal advice.';

function roadmapFor(issues) {
  const urgent = issues.filter((i) => i.severity === 'Critical' || i.severity === 'Serious');
  const rest = issues.filter((i) => !urgent.includes(i));
  const titles = (list) => list.slice(0, 3).map((i) => `Fix: ${i.title.replace(/\.$/, '')}`);
  const phases = [];
  if (urgent.length) phases.push({ focus: 'Critical and serious failures', actions: titles(urgent) });
  if (rest.length) phases.push({ focus: 'Remaining issues', actions: titles(rest) });
  phases.push({
    focus: 'Manual testing',
    actions: [
      'Scan every key page template, not just this one',
      'Test every page and form using only a keyboard',
      'Test with a screen reader (NVDA, VoiceOver or JAWS)',
    ],
  });
  const windows = ['Days 1-30', 'Days 31-60', 'Days 61-90'];
  return phases.map((p, i) => ({ phase: windows[i], ...p }));
}

function buildReport(scan) {
  const lh = scan.lighthouse;
  const scanMeta = {
    requested_url: scan.url,
    scanned_url: lh.meta ? lh.meta.finalUrl : scan.url,
    basis: lh.fetched ? 'lighthouse' : scan.heuristics ? 'html' : 'none',
    device: 'mobile',
    pages: 1,
    scanned_at: (lh.meta && lh.meta.fetchTime) || new Date().toISOString(),
    lighthouse_version: lh.meta ? lh.meta.lighthouseVersion : null,
  };

  if (lh.fetched) {
    const { issues, pour } = lighthouseFindings(lh);
    const wcagCount = issues.filter((i) => i.wcag_failure).length;
    const found = `${issues.length} failing check${issues.length === 1 ? '' : 's'}`;
    return {
      status: 'complete',
      overall_score: lh.score,
      grade: gradeFor(lh.score),
      risk_level: riskFor(lh.score, issues),
      headline: issues.length === 0
        ? `Google Lighthouse scored this page ${lh.score}/100 and found no failing automated checks.`
        : `Google Lighthouse scored this page ${lh.score}/100 and found ${found}, ${wcagCount === issues.length ? (issues.length === 1 ? 'a WCAG failure' : 'all WCAG failures') : `${wcagCount} of them WCAG failures`}.`,
      pour,
      critical_issues: issues,
      quick_wins: [...new Set(issues.map((i) => i.fix))].slice(0, 5),
      roadmap: roadmapFor(issues),
      disclaimer: DISCLAIMER,
      cta: issues.length ? 'Want help fixing these? Book a free strategy call with Keisha.' : 'Want a manual review to confirm the rest? Book a free strategy call with Keisha.',
      scan_meta: scanMeta,
    };
  }

  const unscored = (insight) => Object.fromEntries(Object.values(PRINCIPLES)
    .map(({ key, label }) => [key, { label, score: null, insight }]));

  if (scan.heuristics) {
    const issues = heuristicFindings(scan.heuristics);
    return {
      status: 'limited',
      overall_score: null,
      grade: null,
      risk_level: null,
      headline: scan.heuristics.clientRendered
        ? 'Google Lighthouse couldn\'t scan this page, and it builds its content with JavaScript, so only the page setup could be checked. No score was given.'
        : 'Google Lighthouse couldn\'t scan this page, so this report covers only basic HTML checks. No score was given.',
      pour: unscored('Not measured: the full Lighthouse scan did not complete.'),
      critical_issues: issues,
      quick_wins: issues.map((i) => i.fix).slice(0, 5),
      roadmap: roadmapFor(issues),
      disclaimer: `This limited report comes from the page's raw HTML only. ${DISCLAIMER}`,
      cta: 'Want a complete review? Book a free strategy call with Keisha.',
      scan_meta: scanMeta,
    };
  }

  return {
    status: 'failed',
    overall_score: null,
    grade: null,
    risk_level: null,
    headline: 'We couldn\'t scan this site. The URL may be wrong, the site may be down, or it may block automated requests.',
    pour: unscored('No data: the scan could not reach the page.'),
    critical_issues: [],
    quick_wins: [],
    roadmap: [],
    disclaimer: 'No data was collected, so this is not an assessment of the site. Check that the URL is correct and publicly reachable, then try again.',
    cta: 'Want a person to take a look instead? Book a free strategy call with Keisha.',
    scan_meta: scanMeta,
  };
}

// The AI may reword the summaries, never the facts: scores, grade, risk,
// issues and citations always come from buildReport.
function buildPrompt(data, report) {
  const facts = {
    score: report.overall_score,
    grade: report.grade,
    principles: Object.fromEntries(Object.entries(report.pour).map(([k, v]) => [k, { score: v.score, passed: v.passed, total: v.total }])),
    issues: report.critical_issues.map((i) => ({ title: i.title, wcag: i.wcag, severity: i.severity, detail: i.detail, fix: i.fix })),
  };
  return `You are an accessibility specialist at EVOBRAND Concepts writing the summary text for an automated accessibility report. Write plainly and precisely. Never add issues, numbers or WCAG criteria that are not in the data, never claim the site is or isn't compliant, and never give legal advice.

Business: ${data.businessName}
Industry: ${data.industry || 'Not specified'}
Page scanned: ${report.scan_meta.scanned_url} (one page, mobile, Google Lighthouse)

Scan data (authoritative, do not change it):
${JSON.stringify(facts, null, 2)}

Respond ONLY with a JSON object, no markdown:
{
  "headline": "one sentence summarizing the result, using only the numbers above",
  "insights": { "perceivable": "1-2 sentences", "operable": "1-2 sentences", "understandable": "1-2 sentences", "robust": "1-2 sentences" },
  "quick_wins": ["3-5 low-effort fixes, each tied to an issue above"],
  "roadmap": [ { "phase": "Days 1-30", "focus": "short theme", "actions": ["3 actions"] }, { "phase": "Days 31-60", "focus": "...", "actions": ["..."] }, { "phase": "Days 61-90", "focus": "...", "actions": ["3 actions, including keyboard and screen reader testing"] } ],
  "cta": "one sentence inviting them to book a call with Keisha about remediation"
}
For a principle with a null score, say it wasn't measured.`;
}

const isText = (v) => typeof v === 'string' && v.trim().length > 0;

async function generateReport(data, scan) {
  const report = buildReport(scan);
  if (!GEMINI_KEY || report.status !== 'complete') return report;
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, generationConfig: { responseMimeType: 'application/json' } });
    const result = await model.generateContent(buildPrompt(data, report));
    const ai = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());

    if (isText(ai.headline)) report.headline = ai.headline.trim();
    if (isText(ai.cta)) report.cta = ai.cta.trim();
    if (ai.insights && typeof ai.insights === 'object') {
      Object.keys(report.pour).forEach((k) => {
        if (isText(ai.insights[k])) report.pour[k].insight = ai.insights[k].trim();
      });
    }
    if (Array.isArray(ai.quick_wins) && ai.quick_wins.filter(isText).length) {
      report.quick_wins = ai.quick_wins.filter(isText).slice(0, 5);
    }
    if (Array.isArray(ai.roadmap)) {
      const roadmap = ai.roadmap
        .filter((p) => p && isText(p.phase) && Array.isArray(p.actions))
        .map((p) => ({ phase: p.phase, focus: isText(p.focus) ? p.focus : '', actions: p.actions.filter(isText) }));
      if (roadmap.length) report.roadmap = roadmap;
    }
  } catch (err) {
    console.error(`[Accessibility] ${GEMINI_MODEL} summary failed, using scan-generated wording:`, err.message);
  }
  return report;
}

// ─── Email ────────────────────────────────────────────────────────────────────

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function sendReportEmails(data, report, id) {
  const resultsUrl = `${SITE_URL}/accessibility-checker/results/${id}`;
  const fromAddr = `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`;
  const riskColor = { Low: '#4ade80', Moderate: '#facc15', High: '#fb923c', Critical: '#f87171' }[report.risk_level] || '#facc15';
  const scored = report.overall_score !== null;
  const scoreText = scored ? `${report.overall_score}/100 (${report.grade})` : 'Not scored';
  const e = escapeHtml;

  const clientHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#04080f;color:#fff;margin:0;padding:0;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <p style="color:#22C8E5;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0 0 24px;">EVOBRAND CONCEPTS</p>
  <h1 style="color:#22C8E5;font-size:28px;margin-bottom:8px;">Your Accessibility Report is Ready${data.firstName ? `, ${e(data.firstName)}` : ''}.</h1>
  <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;margin-bottom:24px;">${e(report.headline)}</p>
  ${scored ? `<div style="background:#003258;border-radius:16px;padding:32px;text-align:center;margin-bottom:16px;">
    <p style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">ACCESSIBILITY SCORE</p>
    <p style="color:#22C8E5;font-size:72px;font-weight:bold;margin:0;line-height:1;">${report.overall_score}</p>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:8px 0 0;">Grade: <strong style="color:#22C8E5;">${e(report.grade)}</strong> · Google Lighthouse, mobile</p>
  </div>
  <div style="text-align:center;margin-bottom:28px;">
    <span style="display:inline-block;background:${riskColor}22;color:${riskColor};font-size:12px;font-weight:700;padding:6px 16px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;">${e(report.risk_level)} Risk</span>
  </div>` : ''}
  <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 20px;">Page scanned: ${e(report.scan_meta.scanned_url)}</p>
  ${report.critical_issues.length ? `<h2 style="color:#fff;font-size:18px;margin-bottom:14px;">Top Issues Found</h2>
  ${report.critical_issues.slice(0, 3).map((i) => `<div style="background:rgba(255,255,255,0.04);border-left:3px solid #22C8E5;border-radius:8px;padding:14px;margin-bottom:10px;"><p style="color:#22C8E5;font-weight:bold;margin:0 0 6px;">${e(i.title)}</p><p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0;">${e(i.detail)}</p></div>`).join('')}` : ''}
  <div style="text-align:center;margin:28px 0;">
    <a href="${resultsUrl}" style="display:inline-block;background:#22C8E5;color:#003258;padding:14px 32px;border-radius:12px;font-weight:bold;text-decoration:none;font-size:15px;text-transform:uppercase;letter-spacing:1px;">View Full Report →</a>
  </div>
  <div style="border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:22px;text-align:center;">
    <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;margin:0 0 14px;">${e(report.cta)}</p>
    <a href="${SITE_URL}/contact" style="display:inline-block;border:2px solid #22C8E5;color:#22C8E5;padding:10px 24px;border-radius:10px;font-weight:bold;text-decoration:none;font-size:13px;">Book a Free Strategy Call</a>
  </div>
  <p style="color:rgba(255,255,255,0.25);font-size:11px;text-align:center;margin-top:24px;line-height:1.6;">${e(report.disclaimer)}</p>
  <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center;margin-top:12px;">Keisha Solomon · CEO, EVOBRAND Concepts · Ellis County, TX · evobrand.net</p>
</div></body></html>`;

  const adminHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;padding:32px 20px;">
<div style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;">
  <h1 style="color:#003258;font-size:22px;margin:0 0 20px;">New Accessibility Check</h1>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;width:38%;">Business</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;font-weight:700;">${e(data.businessName)}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Website</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${e(data.websiteUrl)}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Email</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${e(data.contactEmail)}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Scan</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${e(report.status)}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Score</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#22C8E5;font-weight:700;font-size:20px;">${e(scoreText)}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Risk Level</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;font-weight:700;">${e(report.risk_level || 'Not assessed')}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Wants Call</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;font-weight:700;">${data.wantsCall ? '✅ YES' : 'No'}</td></tr>
  </table>
  <p style="margin:16px 0 6px;color:#374151;font-size:13px;"><a href="${resultsUrl}" style="color:#22C8E5;">View Client Report →</a></p>
</div></body></html>`;

  await Promise.allSettled([
    sendEmail({ from: fromAddr, to: data.contactEmail, subject: `Your EVOBRAND Accessibility Report — ${data.businessName}`, html: clientHtml }),
    sendEmail({ from: fromAddr, to: [process.env.ADMIN_EMAIL || 'ks@evobrand.net', 'ksolomon68@gmail.com'], subject: `New Accessibility Check: ${data.businessName} — ${scoreText}`, html: adminHtml }),
  ]);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// @route POST /api/accessibility/check
// @desc  Scan a website for accessibility issues and generate a WCAG-based report
router.post('/check', async (req, res) => {
  const data = req.body;

  if (!data.businessName || !data.websiteUrl || !data.contactEmail) {
    return res.status(400).json({ error: 'Business name, website URL, and email are required' });
  }

  try {
    const scan = await scanAccessibility(data.websiteUrl.trim());
    const report = await generateReport(data, scan);

    let checkId = `a11y-${Date.now()}`;
    try {
      const [result] = await pool.query(
        `INSERT INTO accessibility_audits
          (business_name, website_url, industry, email, first_name, phone, wants_call, form_answers, overall_score, grade, risk_level, full_report, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.businessName,
          data.websiteUrl,
          data.industry || null,
          data.contactEmail,
          data.firstName || null,
          data.phone || null,
          !!data.wantsCall,
          JSON.stringify(data),
          report.overall_score,
          report.grade,
          report.risk_level,
          JSON.stringify({ ...report, scan }),
          report.status === 'failed' ? 'failed' : 'completed',
        ]
      );
      checkId = String(result.insertId);
    } catch (dbErr) {
      console.error('[Accessibility] Failed to persist check to MySQL:', dbErr.message);
    }

    try {
      await addToLeadsIfNew(data.contactEmail, { firstName: (data.firstName || '').trim() || null, lastName: null });
    } catch (crmErr) {
      console.error('[Accessibility] Failed to sync lead to CRM:', crmErr.message);
    }

    sendReportEmails(data, report, checkId).catch((err) =>
      console.error('[Accessibility] Failed to send report emails:', err.message)
    );

    res.json({ ...report, id: checkId, businessName: data.businessName, websiteUrl: data.websiteUrl, scan });
  } catch (error) {
    console.error('Error generating accessibility report:', error);
    res.status(500).json({ error: 'Failed to generate accessibility report' });
  }
});

// @route GET /api/accessibility/check/:id
// @desc  Fetch a previously generated accessibility report by id
router.get('/check/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM accessibility_audits WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Report not found' });

    const row = rows[0];
    const fullReport = typeof row.full_report === 'string' ? JSON.parse(row.full_report) : row.full_report;

    res.json({ ...fullReport, id: row.id, businessName: row.business_name, websiteUrl: row.website_url });
  } catch (error) {
    console.error('Error fetching accessibility report:', error);
    res.status(500).json({ error: 'Failed to load accessibility report' });
  }
});


module.exports = router;
