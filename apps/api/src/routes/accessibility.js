const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../db/connection');
const { sendEmail } = require('../utils/mailer');
const { addToLeadsIfNew } = require('../utils/crmHelpers');

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY || '';
const SITE_URL = process.env.APP_URL || 'https://evobrandconcepts.com';

if (!GEMINI_KEY) {
  console.warn('[Accessibility] GEMINI_API_KEY / GOOGLE_AI_API_KEY not set — reports will use the scan-only fallback instead of an AI-written report.');
}

// Maps common Lighthouse/axe-core accessibility audit ids to the WCAG 2.1
// success criterion they correspond to, so the report can cite something
// concrete instead of vague "accessibility issue" language.
const WCAG_MAP = {
  'image-alt': '1.1.1 Non-text Content (Level A)',
  'input-image-alt': '1.1.1 Non-text Content (Level A)',
  'object-alt': '1.1.1 Non-text Content (Level A)',
  'video-caption': '1.2.2 Captions — Prerecorded (Level A)',
  'heading-order': '1.3.1 Info and Relationships (Level A)',
  'list': '1.3.1 Info and Relationships (Level A)',
  'listitem': '1.3.1 Info and Relationships (Level A)',
  'definition-list': '1.3.1 Info and Relationships (Level A)',
  'color-contrast': '1.4.3 Contrast (Minimum) (Level AA)',
  'meta-viewport': '1.4.4 Resize Text (Level AA)',
  'link-name': '2.4.4 Link Purpose (In Context) (Level A)',
  'document-title': '2.4.2 Page Titled (Level A)',
  'skip-link': '2.4.1 Bypass Blocks (Level A)',
  'bypass': '2.4.1 Bypass Blocks (Level A)',
  'tabindex': '2.4.3 Focus Order (Level A)',
  'target-size': '2.5.8 Target Size (Minimum) (Level AA)',
  'html-has-lang': '3.1.1 Language of Page (Level A)',
  'html-lang-valid': '3.1.1 Language of Page (Level A)',
  'label': '4.1.2 Name, Role, Value (Level A)',
  'form-field-multiple-labels': '3.3.2 Labels or Instructions (Level A)',
  'button-name': '4.1.2 Name, Role, Value (Level A)',
  'select-name': '4.1.2 Name, Role, Value (Level A)',
  'frame-title': '4.1.2 Name, Role, Value (Level A)',
  'duplicate-id-active': '4.1.1 Parsing (Level A)',
  'duplicate-id-aria': '4.1.1 Parsing (Level A)',
  'aria-allowed-attr': '4.1.2 Name, Role, Value (Level A)',
  'aria-required-attr': '4.1.2 Name, Role, Value (Level A)',
  'aria-required-children': '4.1.2 Name, Role, Value (Level A)',
  'aria-required-parent': '4.1.2 Name, Role, Value (Level A)',
  'aria-roles': '4.1.2 Name, Role, Value (Level A)',
  'aria-valid-attr-value': '4.1.2 Name, Role, Value (Level A)',
  'aria-valid-attr': '4.1.2 Name, Role, Value (Level A)',
  'aria-hidden-body': '4.1.2 Name, Role, Value (Level A)',
  'aria-hidden-focus': '4.1.2 Name, Role, Value (Level A)',
};

// ─── Scan ─────────────────────────────────────────────────────────────────────

function stripTags(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function staticHeuristics(html) {
  const htmlTagMatch = html.match(/<html\b[^>]*>/i);
  const hasLang = !!(htmlTagMatch && /\blang=["'][a-zA-Z-]+["']/.test(htmlTagMatch[0]));

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const imgsMissingAlt = imgTags.filter((t) => !/\balt=/i.test(t)).length;

  const inputTags = (html.match(/<input\b[^>]*>/gi) || [])
    .filter((t) => !/type=["'](hidden|submit|button|image)["']/i.test(t));
  const idsWithLabelFor = new Set(
    [...html.matchAll(/<label\b[^>]*\bfor=["']([^"']+)["']/gi)].map((m) => m[1])
  );
  const inputsMissingLabel = inputTags.filter((t) => {
    const idMatch = t.match(/\bid=["']([^"']+)["']/i);
    const hasAriaLabel = /\baria-label(led-?by)?=/i.test(t);
    return !hasAriaLabel && !(idMatch && idsWithLabelFor.has(idMatch[1]));
  }).length;

  const hasSkipLink = /href=["']#(main|content|main-content)["']/i.test(html)
    || /skip to (main )?content/i.test(html);

  const landmarkCount = (html.match(/<(nav|main|header|footer)\b/gi) || []).length
    + (html.match(/role=["'](navigation|main|banner|contentinfo)["']/gi) || []).length;

  const headingLevels = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  const hasH1 = headingLevels.includes(1);
  const multipleH1 = headingLevels.filter((l) => l === 1).length > 1;
  let headingsSkipLevel = false;
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) { headingsSkipLevel = true; break; }
  }

  const hasViewportZoomDisabled = /<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*user-scalable=no/i.test(html)
    || /<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*maximum-scale=1(\.0)?["']/i.test(html);

  return {
    hasLang,
    imgCount: imgTags.length,
    imgsMissingAlt,
    inputCount: inputTags.length,
    inputsMissingLabel,
    hasSkipLink,
    landmarkCount,
    hasH1,
    multipleH1,
    headingsSkipLevel,
    hasViewportZoomDisabled,
  };
}

async function scanLighthouseAccessibility(url) {
  const result = { score: null, failingAudits: [], fetched: false };
  try {
    const normalised = url.startsWith('http') ? url : `https://${url}`;
    let psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalised)}&strategy=mobile&category=accessibility`;
    if (PAGESPEED_API_KEY) psUrl += `&key=${PAGESPEED_API_KEY}`;
    const res = await fetch(psUrl, { signal: AbortSignal.timeout(25000) });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => '');
      console.error(`[Accessibility] PageSpeed API returned ${res.status} for ${normalised}: ${bodyText.slice(0, 300)}`);
      return result;
    }
    const data = await res.json();
    if (data.error) {
      console.error(`[Accessibility] PageSpeed API error for ${normalised}:`, data.error.message || data.error);
      return result;
    }
    const category = data.lighthouseResult && data.lighthouseResult.categories && data.lighthouseResult.categories.accessibility;
    const audits = (data.lighthouseResult && data.lighthouseResult.audits) || {};
    if (!category) {
      console.error(`[Accessibility] PageSpeed response for ${normalised} had no accessibility category`);
      return result;
    }

    result.fetched = true;
    result.score = Math.round((category.score || 0) * 100);

    const refs = category.auditRefs || [];
    result.failingAudits = refs
      .map((ref) => audits[ref.id])
      .filter((a) => a && a.score === 0 && a.scoreDisplayMode !== 'notApplicable')
      .map((a) => ({
        id: a.id,
        title: a.title,
        description: (a.description || '').replace(/\[.*?\]\(.*?\)/g, '').trim(),
        affectedCount: (a.details && Array.isArray(a.details.items)) ? a.details.items.length : null,
        wcag: WCAG_MAP[a.id] || null,
      }));
  } catch (err) {
    console.error(`[Accessibility] PageSpeed scan threw for ${url}:`, err.message);
  }
  return result;
}

async function scanAccessibility(url) {
  const normalised = url.startsWith('http') ? url : `https://${url}`;
  let html = '';
  let isLive = false;
  try {
    const res = await fetch(normalised, {
      headers: { 'User-Agent': 'EVOBRAND-AccessibilityChecker/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    isLive = res.ok;
    if (res.ok) html = await res.text();
  } catch (err) {
    console.error(`[Accessibility] Direct site fetch failed for ${normalised} (Lighthouse scan may still succeed independently):`, err.message);
  }

  const [lighthouse, heuristics] = await Promise.all([
    scanLighthouseAccessibility(url),
    Promise.resolve(html ? staticHeuristics(html) : null),
  ]);

  return { isLive, lighthouse, heuristics };
}

function buildScanContext(scan) {
  const lines = ['\n\n=== LIVE ACCESSIBILITY SCAN RESULTS ==='];

  lines.push(`\nSITE REACHABLE: ${scan.isLive ? 'YES' : 'NO'}`);

  if (scan.lighthouse.fetched) {
    lines.push(`\nGOOGLE LIGHTHOUSE ACCESSIBILITY SCORE: ${scan.lighthouse.score}/100`);
    if (scan.lighthouse.failingAudits.length) {
      lines.push(`FAILING AUDITS (real, machine-detected — use these as your primary evidence):`);
      scan.lighthouse.failingAudits.forEach((a) => {
        lines.push(`  - [${a.id}] ${a.title}${a.wcag ? ` — WCAG ${a.wcag}` : ''}${a.affectedCount ? ` — ${a.affectedCount} element(s) affected` : ''}`);
        lines.push(`    ${a.description}`);
      });
    } else {
      lines.push(`No failing automated audits detected — this only covers what automated tools can catch (~30-40% of WCAG); manual review is still recommended.`);
    }
  } else {
    lines.push(`\nGOOGLE LIGHTHOUSE: Could not complete an automated scan for this URL.`);
  }

  if (scan.heuristics) {
    const h = scan.heuristics;
    lines.push(`\nSTATIC HTML CHECKS:`);
    lines.push(`  <html lang> attribute present: ${h.hasLang ? 'YES' : 'NO — fails WCAG 3.1.1'}`);
    lines.push(`  Images: ${h.imgCount} total, ${h.imgsMissingAlt} missing alt text`);
    lines.push(`  Form inputs: ${h.inputCount} total, ${h.inputsMissingLabel} missing an associated label`);
    lines.push(`  Skip-to-content link: ${h.hasSkipLink ? 'YES' : 'NOT DETECTED'}`);
    lines.push(`  Landmark regions (nav/main/header/footer or ARIA equivalents): ${h.landmarkCount}`);
    lines.push(`  H1 present: ${h.hasH1 ? 'YES' : 'NO'}${h.multipleH1 ? '  (multiple H1s found — should be one per page)' : ''}`);
    lines.push(`  Heading levels skip (e.g. H2 straight to H4): ${h.headingsSkipLevel ? 'YES — fails WCAG 1.3.1' : 'NO'}`);
    lines.push(`  Pinch-zoom disabled via viewport meta tag: ${h.hasViewportZoomDisabled ? 'YES — fails WCAG 1.4.4' : 'NO'}`);
  }

  lines.push(`\nIMPORTANT: Base your findings on this REAL scan data — do not invent issues that weren't detected, and do not claim compliance/non-compliance with certainty beyond what automated + static checks can show. Automated tools only catch a subset of WCAG failures (missing alt text, contrast, labels, structure) — always note that a full manual/assistive-technology audit is the only way to confirm complete WCAG 2.1 AA compliance.`);
  lines.push('=== END SCAN DATA ===');

  return lines.join('\n');
}

// ─── AI Report ────────────────────────────────────────────────────────────────

function buildPrompt(data, scan) {
  const scanContext = buildScanContext(scan);

  return `You are an accessibility compliance specialist at EVOBRAND Concepts (Ellis County, TX, CEO: Keisha Solomon), which builds ADA/WCAG-compliant websites for small businesses. You write honest, evidence-based accessibility reports — never inventing findings, and never making absolute legal claims (you are not a lawyer and this is not legal advice).

Business Name: ${data.businessName}
Website: ${data.websiteUrl}
Industry: ${data.industry || 'Not specified'}
${scanContext}

Calculate an honest "overall_score" out of 100, weighted mainly on the Lighthouse accessibility score when available, adjusted using the static checks. Assign a "grade" (A-F) and a "risk_level" ("Low", "Moderate", "High", or "Critical") describing how exposed this site likely is to accessibility complaints/lawsuits — be measured, not alarmist, and always pair it with the disclaimer that this is not legal advice.

Respond ONLY with a valid JSON object — no markdown, no preamble — matching this exact schema:
{
  "overall_score": number,
  "grade": "A|B|C|D|F",
  "risk_level": "Low|Moderate|High|Critical",
  "headline": "one honest sentence summarizing their accessibility state",
  "pour": {
    "perceivable": { "label": "Perceivable", "score": number, "insight": "2 sentences — can users perceive all content (alt text, contrast, captions)?" },
    "operable": { "label": "Operable", "score": number, "insight": "2 sentences — can users operate everything via keyboard/assistive tech?" },
    "understandable": { "label": "Understandable", "score": number, "insight": "2 sentences — is content and navigation predictable/clear?" },
    "robust": { "label": "Robust", "score": number, "insight": "2 sentences — does markup work reliably with assistive technology (valid ARIA, parsing)?" }
  },
  "critical_issues": [
    { "title": "specific issue found in the scan", "wcag": "WCAG success criterion cited from the scan data, or empty string if none applies", "severity": "Critical|Serious|Moderate|Minor", "detail": "1-2 sentences on real user impact", "fix": "1-2 sentences on how to fix it" }
  ],
  "quick_wins": ["3-5 concrete, low-effort fixes drawn directly from the scan data"],
  "roadmap": [
    { "phase": "Days 1-30", "focus": "short theme", "actions": ["3 concrete actions"] },
    { "phase": "Days 31-60", "focus": "short theme", "actions": ["3 actions"] },
    { "phase": "Days 61-90", "focus": "short theme", "actions": ["3 actions, including manual/assistive-tech testing"] }
  ],
  "disclaimer": "a sentence noting this is an automated + heuristic scan, not a substitute for a full manual WCAG audit or legal advice",
  "cta": "personalized sentence inviting them to book a call with Keisha about accessibility remediation"
}
List between 3 and 8 items in "critical_issues", drawn only from real findings in the scan data above — do not fabricate issues.`;
}

function normalizeReport(raw) {
  const rawScore = raw.overall_score ?? raw.score ?? 0;
  return {
    overall_score: Number.isFinite(Number(rawScore)) ? Number(rawScore) : 0,
    grade: raw.grade || 'C',
    risk_level: raw.risk_level || 'Moderate',
    headline: raw.headline || '',
    pour: raw.pour && typeof raw.pour === 'object' ? raw.pour : {},
    critical_issues: Array.isArray(raw.critical_issues) ? raw.critical_issues.map((i) => ({
      title: i.title || 'Accessibility issue',
      wcag: i.wcag || '',
      severity: i.severity || 'Moderate',
      detail: i.detail || '',
      fix: i.fix || '',
    })) : [],
    quick_wins: Array.isArray(raw.quick_wins) ? raw.quick_wins : [],
    roadmap: Array.isArray(raw.roadmap) ? raw.roadmap.filter((p) => p && (p.phase || p.focus)).map((p) => ({
      phase: p.phase || '',
      focus: p.focus || '',
      actions: Array.isArray(p.actions) ? p.actions.filter(Boolean) : [],
    })) : [],
    disclaimer: raw.disclaimer || 'This is an automated and heuristic scan, not a substitute for a full manual WCAG audit or legal advice.',
    cta: raw.cta || 'Ready to make your site accessible to everyone?',
  };
}

// Turns the static HTML heuristics into real findings + a real score, so the
// scan-only fallback still has something honest to say when Lighthouse can't
// be reached (rather than a hardcoded, made-up 60/D that looks precise but
// isn't grounded in anything).
function heuristicFindings(h) {
  if (!h) return null;
  let score = 100;
  const issues = [];

  if (!h.hasLang) {
    score -= 10;
    issues.push({ title: 'Page is missing an <html lang> attribute', wcag: '3.1.1 Language of Page (Level A)', severity: 'Serious', detail: 'Screen readers can\'t reliably choose the right pronunciation/voice without a declared page language.', fix: 'Add a lang attribute (e.g. lang="en") to the <html> tag.' });
  }
  if (h.imgsMissingAlt > 0) {
    score -= Math.min(25, h.imgsMissingAlt * 4);
    issues.push({ title: `${h.imgsMissingAlt} image(s) missing alt text`, wcag: '1.1.1 Non-text Content (Level A)', severity: 'Serious', detail: 'Screen reader users get no description of these images, or hear the filename instead.', fix: 'Add descriptive alt text to every meaningful image, or alt="" for purely decorative ones.' });
  }
  if (h.inputsMissingLabel > 0) {
    score -= Math.min(25, h.inputsMissingLabel * 5);
    issues.push({ title: `${h.inputsMissingLabel} form field(s) missing a label`, wcag: '4.1.2 Name, Role, Value (Level A)', severity: 'Serious', detail: 'Screen reader and voice-control users can\'t tell what these fields are for.', fix: 'Associate each input with a <label for="..."> or an aria-label.' });
  }
  if (h.headingsSkipLevel) {
    score -= 8;
    issues.push({ title: 'Heading levels skip (e.g. H2 straight to H4)', wcag: '1.3.1 Info and Relationships (Level A)', severity: 'Moderate', detail: 'Assistive tech users navigate by heading structure — skipped levels break that outline.', fix: 'Use heading levels in order, without skipping.' });
  }
  if (!h.hasH1) {
    score -= 5;
    issues.push({ title: 'Page has no H1', wcag: '1.3.1 Info and Relationships (Level A)', severity: 'Moderate', detail: 'An H1 gives assistive tech users an immediate sense of the page\'s topic.', fix: 'Add a single, descriptive H1 to the page.' });
  } else if (h.multipleH1) {
    issues.push({ title: 'Multiple H1s found on the page', wcag: '1.3.1 Info and Relationships (Level A)', severity: 'Minor', detail: 'Multiple top-level headings can confuse the page outline assistive tech relies on.', fix: 'Use one H1 per page for the main title.' });
  }
  if (h.hasViewportZoomDisabled) {
    score -= 10;
    issues.push({ title: 'Pinch-zoom is disabled', wcag: '1.4.4 Resize Text (Level AA)', severity: 'Serious', detail: 'Low-vision users who rely on zooming to read content are blocked from doing so.', fix: 'Remove user-scalable=no and maximum-scale=1 from the viewport meta tag.' });
  }
  if (!h.hasSkipLink) {
    score -= 5;
    issues.push({ title: 'No skip-to-content link detected', wcag: '2.4.1 Bypass Blocks (Level A)', severity: 'Minor', detail: 'Keyboard users have to tab through the entire header/nav on every page.', fix: 'Add a "Skip to main content" link as the first focusable element.' });
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}

function buildMockReport(data, scan) {
  const heuristics = heuristicFindings(scan.heuristics);
  const hasAnyData = scan.lighthouse.fetched || !!heuristics;

  let score;
  let issues;
  if (scan.lighthouse.fetched) {
    score = scan.lighthouse.score;
    issues = (scan.lighthouse.failingAudits || []).slice(0, 6).map((a) => ({
      title: a.title,
      wcag: a.wcag || '',
      severity: 'Serious',
      detail: a.description,
      fix: 'Review and remediate the flagged elements to meet the cited WCAG success criterion.',
    }));
    // Lighthouse doesn't catch everything our static checks do (e.g. duplicate
    // H1s) — fold those in too rather than dropping that signal on the floor.
    if (heuristics) issues = issues.concat(heuristics.issues).slice(0, 6);
  } else if (heuristics) {
    score = heuristics.score;
    issues = heuristics.issues.slice(0, 6);
  } else {
    score = null;
    issues = [];
  }

  if (!hasAnyData) {
    return {
      overall_score: 0,
      grade: 'F',
      risk_level: 'Moderate',
      headline: 'We couldn\'t complete an automated scan of this site — the URL may be unreachable, blocking automated requests, or took too long to respond.',
      pour: {
        perceivable: { label: 'Perceivable', score: 0, insight: 'No data — scan could not complete.' },
        operable: { label: 'Operable', score: 0, insight: 'No data — scan could not complete.' },
        understandable: { label: 'Understandable', score: 0, insight: 'No data — scan could not complete.' },
        robust: { label: 'Robust', score: 0, insight: 'No data — scan could not complete.' },
      },
      critical_issues: [],
      quick_wins: [],
      roadmap: [],
      disclaimer: 'This scan could not reach the site to gather any data. Double-check the URL is correct and publicly accessible, then try again — or contact us for a manual review.',
      cta: 'Want a human to take a look instead? Book a free strategy call with Keisha.',
    };
  }

  let grade = 'C';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return {
    overall_score: score,
    grade,
    risk_level: score < 60 ? 'High' : score < 80 ? 'Moderate' : 'Low',
    headline: issues.length > 0
      ? `Automated scan found ${issues.length} issue area(s) to address.`
      : 'No automated issues detected — automated tools only catch a subset of WCAG, so a manual review is still worthwhile.',
    pour: {
      perceivable: { label: 'Perceivable', score, insight: 'Based on automated scan results.' },
      operable: { label: 'Operable', score, insight: 'Based on automated scan results.' },
      understandable: { label: 'Understandable', score, insight: 'Based on automated scan results.' },
      robust: { label: 'Robust', score, insight: 'Based on automated scan results.' },
    },
    critical_issues: issues,
    quick_wins: issues.slice(0, 3).map((i) => i.title),
    roadmap: [],
    disclaimer: 'This is an automated and heuristic scan, not a substitute for a full manual WCAG audit or legal advice.',
    cta: 'Ready to make your site accessible to everyone?',
  };
}

async function generateReport(data, scan) {
  if (!GEMINI_KEY) return buildMockReport(data, scan);
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(buildPrompt(data, scan));
    const text = result.response.text();
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return normalizeReport(JSON.parse(cleaned));
  } catch (err) {
    console.error('[Accessibility] Gemini generation failed, falling back to scan-only report:', err.message);
    return buildMockReport(data, scan);
  }
}

// ─── Email ────────────────────────────────────────────────────────────────────

async function sendReportEmails(data, report, id) {
  const resultsUrl = `${SITE_URL}/accessibility-checker/results/${id}`;
  const fromAddr = `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`;
  const riskColor = { Low: '#4ade80', Moderate: '#facc15', High: '#fb923c', Critical: '#f87171' }[report.risk_level] || '#facc15';

  const clientHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#04080f;color:#fff;margin:0;padding:0;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <p style="color:#22C8E5;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0 0 24px;">EVOBRAND CONCEPTS</p>
  <h1 style="color:#22C8E5;font-size:28px;margin-bottom:8px;">Your Accessibility Report is Ready, ${data.firstName || ''}.</h1>
  <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;margin-bottom:24px;">${report.headline}</p>
  <div style="background:#003258;border-radius:16px;padding:32px;text-align:center;margin-bottom:16px;">
    <p style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">ACCESSIBILITY SCORE</p>
    <p style="color:#22C8E5;font-size:72px;font-weight:bold;margin:0;line-height:1;">${report.overall_score}</p>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:8px 0 0;">Grade: <strong style="color:#22C8E5;">${report.grade}</strong></p>
  </div>
  <div style="text-align:center;margin-bottom:28px;">
    <span style="display:inline-block;background:${riskColor}22;color:${riskColor};font-size:12px;font-weight:700;padding:6px 16px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;">${report.risk_level} Risk</span>
  </div>
  <h2 style="color:#fff;font-size:18px;margin-bottom:14px;">Top Issues Found</h2>
  ${(report.critical_issues || []).slice(0, 3).map((i) => `<div style="background:rgba(255,255,255,0.04);border-left:3px solid #22C8E5;border-radius:8px;padding:14px;margin-bottom:10px;"><p style="color:#22C8E5;font-weight:bold;margin:0 0 6px;">${i.title}</p><p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0;">${i.detail}</p></div>`).join('')}
  <div style="text-align:center;margin:28px 0;">
    <a href="${resultsUrl}" style="display:inline-block;background:#22C8E5;color:#003258;padding:14px 32px;border-radius:12px;font-weight:bold;text-decoration:none;font-size:15px;text-transform:uppercase;letter-spacing:1px;">View Full Report →</a>
  </div>
  <div style="border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:22px;text-align:center;">
    <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;margin:0 0 14px;">${report.cta}</p>
    <a href="${SITE_URL}/contact" style="display:inline-block;border:2px solid #22C8E5;color:#22C8E5;padding:10px 24px;border-radius:10px;font-weight:bold;text-decoration:none;font-size:13px;">Book a Free Strategy Call</a>
  </div>
  <p style="color:rgba(255,255,255,0.25);font-size:11px;text-align:center;margin-top:24px;line-height:1.6;">${report.disclaimer}</p>
  <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center;margin-top:12px;">Keisha Solomon · CEO, EVOBRAND Concepts · Ellis County, TX · evobrand.net</p>
</div></body></html>`;

  const adminHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;padding:32px 20px;">
<div style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;">
  <h1 style="color:#003258;font-size:22px;margin:0 0 20px;">New Accessibility Check</h1>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;width:38%;">Business</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;font-weight:700;">${data.businessName}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Website</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${data.websiteUrl}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Email</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${data.contactEmail}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Score</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#22C8E5;font-weight:700;font-size:20px;">${report.overall_score}/100 (${report.grade})</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Risk Level</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;font-weight:700;">${report.risk_level}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Wants Call</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;font-weight:700;">${data.wantsCall ? '✅ YES' : 'No'}</td></tr>
  </table>
  <p style="margin:16px 0 6px;color:#374151;font-size:13px;"><a href="${resultsUrl}" style="color:#22C8E5;">View Client Report →</a></p>
</div></body></html>`;

  await Promise.allSettled([
    sendEmail({ from: fromAddr, to: data.contactEmail, subject: `Your EVOBRAND Accessibility Report — ${data.businessName}`, html: clientHtml }),
    sendEmail({ from: fromAddr, to: [process.env.ADMIN_EMAIL || 'ks@evobrand.net', 'ksolomon68@gmail.com'], subject: `New Accessibility Check: ${data.businessName} scored ${report.overall_score}/100`, html: adminHtml }),
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
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
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
