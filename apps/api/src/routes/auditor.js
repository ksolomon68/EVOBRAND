const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../db/connection');
const { sendEmail } = require('../utils/mailer');
const { addToLeadsIfNew } = require('../utils/crmHelpers');

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
const SERPER_API_KEY = process.env.SERPER_API_KEY || '';
const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY || '';
const SITE_URL = process.env.APP_URL || 'https://evobrandconcepts.com';

if (!GEMINI_KEY) {
  console.warn('[Audit] GEMINI_API_KEY / GOOGLE_AI_API_KEY not set — reports will use the scan-only mock instead of an AI-written report.');
}

// ─── Internet Presence Scanner ───────────────────────────────────────────────

function stripTags(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractContent(html) {
  const headings = [
    ...[...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1])),
    ...[...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => stripTags(m[1])),
  ].filter(Boolean).slice(0, 6);

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyHtml = (bodyMatch ? bodyMatch[1] : html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ');

  const bodyText = stripTags(bodyHtml);
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;

  return { headings, contentSample: bodyText.slice(0, 1200), wordCount };
}

async function scanWebsite(url) {
  const start = Date.now();
  const result = {
    isLive: false, hasSSL: false, responseTimeMs: 0,
    title: '', metaDescription: '', hasGoogleAnalytics: false,
    hasOpenGraph: false, pagespeed: null,
    headings: [], contentSample: '', wordCount: 0,
  };

  try {
    const normalised = url.startsWith('http') ? url : `https://${url}`;
    result.hasSSL = normalised.startsWith('https://');

    const res = await fetch(normalised, {
      headers: { 'User-Agent': 'EVOBRAND-BrandAuditor/1.0' },
      signal: AbortSignal.timeout(8000),
    });

    result.responseTimeMs = Date.now() - start;
    result.isLive = res.ok;

    if (res.ok) {
      const html = await res.text();

      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      result.title = titleMatch ? titleMatch[1].trim() : '';

      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
      result.metaDescription = descMatch ? descMatch[1].trim() : '';

      result.hasGoogleAnalytics = /gtag|google-analytics|UA-\d|G-[A-Z0-9]/i.test(html);
      result.hasOpenGraph = /property=["']og:/i.test(html);

      const content = extractContent(html);
      result.headings = content.headings;
      result.contentSample = content.contentSample;
      result.wordCount = content.wordCount;
    }
  } catch (err) {
    result.responseTimeMs = Date.now() - start;
    console.error(`[Audit] Direct site fetch failed for ${url}:`, err.message);
  }

  try {
    const normalised = url.startsWith('http') ? url : `https://${url}`;
    let psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalised)}&strategy=mobile&category=performance&category=seo&category=accessibility`;
    if (PAGESPEED_API_KEY) psUrl += `&key=${PAGESPEED_API_KEY}`;
    const psRes = await fetch(psUrl, { signal: AbortSignal.timeout(25000) });
    if (!psRes.ok) {
      const bodyText = await psRes.text().catch(() => '');
      console.error(`[Audit] PageSpeed API returned ${psRes.status} for ${normalised}: ${bodyText.slice(0, 300)}`);
    }
    if (psRes.ok) {
      const ps = await psRes.json();
      if (ps.error) console.error(`[Audit] PageSpeed API error for ${normalised}:`, ps.error.message || ps.error);
      const cats = ps.lighthouseResult && ps.lighthouseResult.categories;
      result.pagespeed = {
        performance: Math.round(((cats && cats.performance && cats.performance.score) || 0) * 100),
        seo: Math.round(((cats && cats.seo && cats.seo.score) || 0) * 100),
        accessibility: Math.round(((cats && cats.accessibility && cats.accessibility.score) || 0) * 100),
      };
    }
  } catch (err) {
    console.error(`[Audit] PageSpeed scan threw for ${url}:`, err.message);
  }

  return result;
}

async function scanGooglePresence(businessName, industry) {
  const result = {
    appearsInSearch: false, topResultIsOwned: false,
    mentionCount: 0, hasReviews: false, knowledgePanel: false, snippets: [],
  };

  if (!SERPER_API_KEY || !businessName) return result;

  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `"${businessName}" ${industry || ''}`, num: 10 }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return result;
    const data = await res.json();

    const organic = data.organic || [];
    result.mentionCount = organic.length;
    result.appearsInSearch = organic.length > 0;
    result.knowledgePanel = !!data.knowledgeGraph;
    result.hasReviews = !!((data.knowledgeGraph && data.knowledgeGraph.rating) || organic.some((r) =>
      /review|star|rating/i.test(r.snippet || '')));
    result.snippets = organic.slice(0, 3).map((r) => `${r.title || ''}: ${r.snippet || ''}`).filter(Boolean);

    if (organic[0]) {
      const bName = businessName.toLowerCase().replace(/\s+/g, '');
      result.topResultIsOwned = (organic[0].link || '').toLowerCase().includes(bName)
        || (organic[0].title || '').toLowerCase().includes(businessName.toLowerCase());
    }
  } catch (_) { /* Serper optional */ }

  return result;
}

async function scanOnlinePresence(formData) {
  const { websiteUrl, businessName, industry, competitor, competitorUrl } = formData;
  const hasCompetitor = !!((competitor && competitor.trim()) || (competitorUrl && competitorUrl.trim()));

  const [website, search, competitorWebsite, competitorSearch] = await Promise.allSettled([
    websiteUrl && websiteUrl.trim() ? scanWebsite(websiteUrl.trim()) : Promise.resolve(null),
    scanGooglePresence(businessName, industry),
    hasCompetitor && competitorUrl && competitorUrl.trim() ? scanWebsite(competitorUrl.trim()) : Promise.resolve(null),
    hasCompetitor ? scanGooglePresence((competitor && competitor.trim()) || (competitorUrl && competitorUrl.trim()) || '', industry) : Promise.resolve(null),
  ]);

  return {
    website: website.status === 'fulfilled' ? website.value : null,
    search: search.status === 'fulfilled' ? search.value : null,
    competitor: hasCompetitor ? {
      name: (competitor && competitor.trim()) || (competitorUrl && competitorUrl.trim()) || 'Competitor',
      website: competitorWebsite.status === 'fulfilled' ? competitorWebsite.value : null,
      search: competitorSearch.status === 'fulfilled' ? competitorSearch.value : null,
    } : null,
  };
}

function buildPresenceContext(presence) {
  const lines = ['\n\n=== LIVE INTERNET SCAN RESULTS ==='];

  if (presence.website) {
    const w = presence.website;
    lines.push(`\nWEBSITE SCAN:`);
    lines.push(`  Live & accessible: ${w.isLive ? 'YES' : 'NO'}`);
    lines.push(`  SSL (HTTPS): ${w.hasSSL ? 'YES' : 'NO'}`);
    lines.push(`  Response time: ${w.responseTimeMs}ms ${w.responseTimeMs > 3000 ? '(SLOW)' : w.responseTimeMs > 1500 ? '(OK)' : '(FAST)'}`);
    lines.push(`  Page title: ${w.title || 'MISSING — critical SEO issue'}`);
    lines.push(`  Meta description: ${w.metaDescription || 'MISSING — impacts click-through rates'}`);
    lines.push(`  Google Analytics: ${w.hasGoogleAnalytics ? 'YES' : 'NOT DETECTED'}`);
    lines.push(`  Open Graph tags: ${w.hasOpenGraph ? 'YES' : 'NOT DETECTED'}`);
    if (w.pagespeed) {
      lines.push(`  PageSpeed (mobile):`);
      lines.push(`    Performance: ${w.pagespeed.performance}/100 ${w.pagespeed.performance < 50 ? '(POOR)' : w.pagespeed.performance < 75 ? '(NEEDS WORK)' : '(GOOD)'}`);
      lines.push(`    SEO: ${w.pagespeed.seo}/100 ${w.pagespeed.seo < 70 ? '(POOR)' : '(GOOD)'}`);
      lines.push(`    Accessibility: ${w.pagespeed.accessibility}/100`);
    }
    if (w.headings.length) {
      lines.push(`  Actual page headings found: ${w.headings.map((h) => `"${h}"`).join(', ')}`);
    }
    if (w.contentSample) {
      lines.push(`  Word count on homepage: ${w.wordCount} ${w.wordCount < 150 ? '(THIN — likely hurts SEO and looks unfinished)' : ''}`);
      lines.push(`  Actual homepage copy (verbatim excerpt, use this to critique real messaging/voice — do not invent messaging they don't have):`);
      lines.push(`    "${w.contentSample.slice(0, 900)}"`);
    }
  } else {
    lines.push(`\nWEBSITE SCAN: No website URL provided — cannot assess web presence directly.`);
  }

  if (presence.search) {
    const s = presence.search;
    lines.push(`\nGOOGLE SEARCH VISIBILITY:`);
    lines.push(`  Appears in search results: ${s.appearsInSearch ? 'YES' : 'NO'}`);
    lines.push(`  Top result appears owned: ${s.topResultIsOwned ? 'YES' : 'NO'}`);
    lines.push(`  Knowledge Panel: ${s.knowledgePanel ? 'YES (strong presence)' : 'NO'}`);
    lines.push(`  Reviews detected: ${s.hasReviews ? 'YES' : 'NO'}`);
    if (s.snippets.length) {
      lines.push(`  Search snippets found:`);
      s.snippets.forEach((sn) => lines.push(`    - ${sn.slice(0, 120)}`));
    }
  }

  if (presence.competitor) {
    const c = presence.competitor;
    lines.push(`\nCOMPETITOR SCAN — ${c.name}:`);
    if (c.website) {
      lines.push(`  Live: ${c.website.isLive ? 'YES' : 'NO'}  |  SSL: ${c.website.hasSSL ? 'YES' : 'NO'}  |  Response time: ${c.website.responseTimeMs}ms`);
      if (c.website.pagespeed) {
        lines.push(`  PageSpeed — Performance: ${c.website.pagespeed.performance}/100, SEO: ${c.website.pagespeed.seo}/100, Accessibility: ${c.website.pagespeed.accessibility}/100`);
      }
      lines.push(`  Title: ${c.website.title || 'MISSING'}`);
      if (c.website.headings.length) lines.push(`  Headings: ${c.website.headings.slice(0, 3).map((h) => `"${h}"`).join(', ')}`);
    } else {
      lines.push(`  No competitor URL provided — could not scan their site directly.`);
    }
    if (c.search) {
      lines.push(`  Appears in Google: ${c.search.appearsInSearch ? 'YES' : 'NO'}  |  Knowledge Panel: ${c.search.knowledgePanel ? 'YES' : 'NO'}  |  Reviews: ${c.search.hasReviews ? 'YES' : 'NO'}`);
    }
    lines.push(`  Use this to build a head-to-head comparison — be specific about where the client is ahead or behind THIS competitor, not generic industry advice.`);
  }

  lines.push(`\nIMPORTANT: Use this REAL scan data to calibrate your scores. Do NOT rely only on self-reported ratings. If the website is slow, missing meta tags, or not ranking — score those categories accordingly. If Google Analytics is missing, that's a gap. If no Knowledge Panel, that affects competitive position. Use the verbatim homepage copy to give a genuine, specific critique of their actual messaging — quote or paraphrase it directly rather than speaking generically.`);
  lines.push('=== END SCAN DATA ===');

  return lines.join('\n');
}

// ─── AI Report Generation ────────────────────────────────────────────────────

function buildPrompt(data, presence) {
  const consistencyMap = {
    none: 'No real brand standards',
    some: 'Some guidelines but not always followed',
    mostly: 'Consistent but could be stronger',
    dialed: 'Brand is dialed in and consistent',
  };

  const presenceContext = buildPresenceContext(presence);

  return `You are an expert brand strategist with 15 years of experience working with EVOBRAND Concepts (Ellis County, TX, CEO: Keisha Solomon). You generate brand audit reports that are honest, data-driven, and actionable — never generic templated advice.

You will receive BOTH self-reported data AND live internet scan results. The live scan data is ground truth — prioritize it when scoring. When a homepage copy excerpt is included, critique their ACTUAL messaging specifically (quote or paraphrase real phrases) rather than giving generic advice — this is what makes the report feel personal instead of templated.

Business Name: ${data.businessName}
Industry: ${data.industry}
Years in business: ${data.years || 'Not specified'}
Biggest challenges: ${(data.challenges || []).join(', ') || 'Not specified'}
Self-reported digital ratings (1-5): ${JSON.stringify(data.digital || {})}
Target audience: ${data.audience || 'Not specified'}
Avg client value: ${data.clientValue || 'Not specified'}
Main competitor: ${data.competitor || 'Not provided'}
Brand consistency: ${consistencyMap[data.consistency] || data.consistency || 'Not specified'}
${presenceContext}

Calculate an honest "overall_score" out of 100 and a "grade" (A, B, C, D, or F).

Respond ONLY with a valid JSON object — no markdown, no preamble — matching this exact schema:
{
  "overall_score": number,
  "grade": "A|B|C|D|F",
  "headline": "one punchy honest sentence about their brand situation",
  "categories": {
    "visual_identity": { "label": "Visual Identity", "score": number, "insight": "2 sentences" },
    "digital_presence": { "label": "Digital Presence", "score": number, "insight": "2 sentences citing real scan data if available" },
    "brand_clarity": { "label": "Brand Clarity", "score": number, "insight": "2 sentences, reference their actual homepage copy/headings if provided" },
    "audience_alignment": { "label": "Audience Alignment", "score": number, "insight": "2 sentences" },
    "competitive_position": { "label": "Competitive Position", "score": number, "insight": "2 sentences citing search data if available" }
  },
  "strengths": ["3 specific strengths, grounded in real data/copy where possible"],
  "gaps": ["3 specific gaps, reference real data or actual copy where possible"],
  "recommendations": [
    { "priority": 1, "impact": "High|Medium|Low", "effort": "High|Medium|Low", "title": "action title", "detail": "2-3 sentences, specific to this business", "roi_note": "one sentence tying this fix to their stated avg client value or lead volume in realistic, directional terms — no fabricated precise stats" },
    { "priority": 2, "impact": "", "effort": "", "title": "", "detail": "", "roi_note": "" },
    { "priority": 3, "impact": "", "effort": "", "title": "", "detail": "", "roi_note": "" }
  ],
  "roadmap": [
    { "phase": "Days 1-30", "focus": "short theme", "actions": ["3 concrete, specific actions for this business"] },
    { "phase": "Days 31-60", "focus": "short theme", "actions": ["3 actions"] },
    { "phase": "Days 61-90", "focus": "short theme", "actions": ["3 actions"] }
  ],
  "competitive_comparison": {
    "available": true only if competitor scan data was provided above, otherwise false,
    "competitor_name": "string, empty if not available",
    "summary": "1-2 sentence honest comparison of the two brands' online position",
    "rows": [
      { "factor": "e.g. Website Speed, SEO, Search Visibility, Messaging Clarity, Reviews/Trust", "you": "short assessment", "them": "short assessment", "edge": "you|them|tie" }
    ]
  },
  "cta": "personalized sentence inviting them to book a call with Keisha"
}
If no competitor data was provided, still return the "competitive_comparison" key with "available": false and empty "rows".`;
}

function normalizeAiReport(raw) {
  const rawScore = raw.overall_score ?? raw.overallScore ?? raw.score ?? 0;
  return {
    overall_score: Number.isFinite(Number(rawScore)) ? Number(rawScore) : 0,
    grade: raw.grade || 'C',
    headline: raw.headline || raw.summary || '',
    categories: (() => {
      const cats = raw.categories;
      if (!cats) return {};
      if (Array.isArray(cats)) {
        const obj = {};
        cats.forEach((c, i) => { obj[`cat${i}`] = c; });
        return obj;
      }
      return cats;
    })(),
    strengths: raw.strengths || raw.positives || [],
    gaps: raw.gaps || raw.weaknesses || raw.areas_for_improvement || [],
    recommendations: (() => {
      let recs = raw.recommendations;
      if (!recs) return [];
      if (!Array.isArray(recs) && typeof recs === 'object') recs = Object.values(recs);
      if (!Array.isArray(recs)) return [];
      return recs.map((r, i) => {
        if (!r || typeof r !== 'object') return null;
        return {
          priority: r.priority ?? (i + 1),
          impact: r.impact || r.impact_level || r.impactLevel || 'Medium',
          effort: r.effort || r.effort_level || r.effortLevel || 'Medium',
          title: r.title || r.name || r.recommendation || r.action || r.summary || `Recommendation ${i + 1}`,
          detail: r.detail || r.description || r.details || r.body || '',
          roi_note: r.roi_note || r.roiNote || '',
        };
      }).filter(Boolean);
    })(),
    roadmap: Array.isArray(raw.roadmap)
      ? raw.roadmap.filter((p) => p && (p.phase || p.focus)).map((p) => ({
          phase: p.phase || '',
          focus: p.focus || '',
          actions: Array.isArray(p.actions) ? p.actions.filter(Boolean) : [],
        }))
      : [],
    competitive_comparison: (raw.competitive_comparison && typeof raw.competitive_comparison === 'object')
      ? {
          available: !!raw.competitive_comparison.available,
          competitor_name: raw.competitive_comparison.competitor_name || '',
          summary: raw.competitive_comparison.summary || '',
          rows: Array.isArray(raw.competitive_comparison.rows) ? raw.competitive_comparison.rows : [],
        }
      : { available: false, competitor_name: '', summary: '', rows: [] },
    cta: raw.cta || raw.call_to_action || '',
  };
}

function buildMockReport(data) {
  const digitalValues = Object.values(data.digital || {});
  const digitalAvg = digitalValues.length > 0
    ? digitalValues.reduce((a, b) => a + b, 0) / digitalValues.length
    : 3;

  let overall_score = Math.round((digitalAvg / 5) * 100);
  if (data.consistency === 'none') overall_score -= 15;
  if (data.consistency === 'some') overall_score -= 5;
  if (data.consistency === 'dialed') overall_score += 10;
  overall_score = Math.max(20, Math.min(98, overall_score));

  let grade = 'C';
  if (overall_score >= 90) grade = 'A';
  else if (overall_score >= 80) grade = 'B';
  else if (overall_score >= 70) grade = 'C';
  else if (overall_score >= 60) grade = 'D';
  else grade = 'F';

  return {
    overall_score,
    grade,
    headline: `Solid foundation in ${data.industry}, but consistency needs work.`,
    categories: {
      visual: { label: 'Visual Identity', score: Math.min(100, overall_score + 5), insight: 'Needs a unified style guide.' },
      messaging: { label: 'Messaging', score: Math.max(0, overall_score - 5), insight: 'Target audience needs more clarity.' },
      digital: { label: 'Digital Presence', score: overall_score, insight: 'Website performance is average.' },
    },
    strengths: ['Industry experience', 'Clear understanding of challenges'],
    gaps: (Array.isArray(data.challenges) && data.challenges.length > 0)
      ? data.challenges
      : ['Inconsistent visual identity', 'Limited digital presence', 'Undefined target audience'],
    recommendations: [
      { priority: 1, impact: 'High', effort: 'Medium', title: 'Develop Brand Guidelines', detail: 'Create a unified document to ensure visual consistency across all platforms.', roi_note: '' },
      { priority: 2, impact: 'Medium', effort: 'Low', title: 'Refresh Website Messaging', detail: 'Update your copy to target your specific audience more directly.', roi_note: '' },
      { priority: 3, impact: 'Medium', effort: 'High', title: 'Consistent Content Strategy', detail: 'Implement a cohesive content calendar for your social channels.', roi_note: '' },
    ],
    roadmap: [],
    competitive_comparison: { available: false, competitor_name: '', summary: '', rows: [] },
    cta: 'Ready to elevate your brand to the next level?',
  };
}

async function generateReport(data, presence) {
  if (!GEMINI_KEY) return buildMockReport(data);

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(buildPrompt(data, presence));
    const text = result.response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const raw = JSON.parse(cleanedText);
    return normalizeAiReport(raw);
  } catch (err) {
    console.error('[Audit] Gemini generation failed, falling back to mock:', err.message);
    return buildMockReport(data);
  }
}

// ─── Email ────────────────────────────────────────────────────────────────────

async function sendAuditEmails(data, report, auditId, presence) {
  const resultsUrl = `${SITE_URL}/auditor/results/${auditId}`;
  const recs = (report.recommendations || []).slice(0, 3);
  const fromAddr = `"EVOBRAND" <${process.env.RESEND_FROM_EMAIL || 'info@evobrand.net'}>`;

  const scanBadge = presence.website && presence.website.isLive
    ? `<span style="background:#22C8E5;color:#003258;font-size:10px;padding:2px 8px;border-radius:20px;font-weight:700;margin-left:8px;">LIVE SCAN ✓</span>`
    : '';

  const clientHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#04080f;color:#fff;margin:0;padding:0;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <p style="color:#22C8E5;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0 0 24px;">EVOBRAND CONCEPTS</p>
  <h1 style="color:#22C8E5;font-size:28px;margin-bottom:8px;">Your Brand Audit is Ready, ${data.firstName || ''}.${scanBadge}</h1>
  <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;margin-bottom:24px;">${report.headline}</p>
  <div style="background:#003258;border-radius:16px;padding:32px;text-align:center;margin-bottom:28px;">
    <p style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">OVERALL BRAND SCORE</p>
    <p style="color:#22C8E5;font-size:72px;font-weight:bold;margin:0;line-height:1;">${report.overall_score}</p>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:8px 0 0;">Grade: <strong style="color:#22C8E5;">${report.grade}</strong></p>
  </div>
  <h2 style="color:#fff;font-size:18px;margin-bottom:14px;">Top 3 Recommendations</h2>
  ${recs.map((r) => `<div style="background:rgba(255,255,255,0.04);border-left:3px solid #22C8E5;border-radius:8px;padding:14px;margin-bottom:10px;"><p style="color:#22C8E5;font-weight:bold;margin:0 0 6px;">${r.title}</p><p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0;">${r.detail}</p></div>`).join('')}
  <div style="text-align:center;margin:28px 0;">
    <a href="${resultsUrl}" style="display:inline-block;background:#22C8E5;color:#003258;padding:14px 32px;border-radius:12px;font-weight:bold;text-decoration:none;font-size:15px;text-transform:uppercase;letter-spacing:1px;">View Full Report →</a>
  </div>
  <div style="border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:22px;text-align:center;">
    <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;margin:0 0 14px;">${report.cta}</p>
    <a href="${SITE_URL}/contact" style="display:inline-block;border:2px solid #22C8E5;color:#22C8E5;padding:10px 24px;border-radius:10px;font-weight:bold;text-decoration:none;font-size:13px;">Book a Free Strategy Call</a>
  </div>
  <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center;margin-top:28px;">Keisha Solomon · CEO, EVOBRAND Concepts · Ellis County, TX · evobrand.net</p>
</div></body></html>`;

  const adminHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;padding:32px 20px;">
<div style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;">
  <h1 style="color:#003258;font-size:22px;margin:0 0 20px;">New Brand Audit${presence.website && presence.website.isLive ? ' 🌐 Live Scan' : ''}</h1>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;width:38%;">Business</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;font-weight:700;">${data.businessName}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Email</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${data.contactEmail}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Phone</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${data.phone || '—'}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Score</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#22C8E5;font-weight:700;font-size:20px;">${report.overall_score}/100 (${report.grade})</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Wants Call</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;font-weight:700;">${data.wantsCall ? '✅ YES' : 'No'}</td></tr>
    ${presence.competitor ? `<tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Competitor Scanned</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${presence.competitor.name}</td></tr>` : ''}
  </table>
  <p style="margin:16px 0 6px;color:#374151;font-size:13px;"><a href="${resultsUrl}" style="color:#22C8E5;">View Client Report →</a></p>
</div></body></html>`;

  await Promise.allSettled([
    sendEmail({ from: fromAddr, to: data.contactEmail, subject: `Your EVOBRAND Brand Audit — ${data.businessName}`, html: clientHtml }),
    sendEmail({ from: fromAddr, to: [process.env.ADMIN_EMAIL || 'ks@evobrand.net', 'ksolomon68@gmail.com'], subject: `New Audit: ${data.businessName} scored ${report.overall_score}/100`, html: adminHtml }),
  ]);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// @route POST /api/auditor/audit
// @desc  Generate a brand audit report (live scan + AI), persist it, email it
router.post('/audit', async (req, res) => {
  const data = req.body;

  if (!data.businessName || !data.industry || !data.contactEmail) {
    return res.status(400).json({ error: 'Missing required audit fields' });
  }

  try {
    const presence = await scanOnlinePresence(data);
    const report = await generateReport(data, presence);

    let auditId = `audit-${Date.now()}`;
    try {
      const [result] = await pool.query(
        `INSERT INTO brand_audits
          (business_name, industry, email, first_name, phone, wants_call, form_answers, overall_score, grade, full_report, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
        [
          data.businessName,
          data.industry || null,
          data.contactEmail,
          data.firstName || null,
          data.phone || null,
          !!data.wantsCall,
          JSON.stringify(data),
          report.overall_score,
          report.grade,
          JSON.stringify({ ...report, presence_scan: presence }),
        ]
      );
      auditId = String(result.insertId);
    } catch (dbErr) {
      console.error('[Audit] Failed to persist audit to MySQL:', dbErr.message);
    }

    try {
      await addToLeadsIfNew(data.contactEmail, { firstName: (data.firstName || '').trim() || null, lastName: null });
    } catch (crmErr) {
      console.error('[Audit] Failed to sync lead to CRM:', crmErr.message);
    }

    sendAuditEmails(data, report, auditId, presence).catch((err) =>
      console.error('[Audit] Failed to send audit emails:', err.message)
    );

    if (data.wantsCall) {
      console.log(`[Audit] ${data.contactEmail} requested a strategy call!`);
    }

    res.json({ ...report, id: auditId, businessName: data.businessName, presence });
  } catch (error) {
    console.error('Error generating audit:', error);
    res.status(500).json({ error: 'Failed to generate brand audit' });
  }
});

// @route GET /api/auditor/audit/:id
// @desc  Fetch a previously generated audit report by id
router.get('/audit/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM brand_audits WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Audit not found' });

    const row = rows[0];
    const fullReport = typeof row.full_report === 'string' ? JSON.parse(row.full_report) : row.full_report;

    res.json({ ...fullReport, id: row.id, businessName: row.business_name });
  } catch (error) {
    console.error('Error fetching audit:', error);
    res.status(500).json({ error: 'Failed to load audit report' });
  }
});

module.exports = router;
