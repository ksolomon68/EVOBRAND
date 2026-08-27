import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SERPER_API_KEY = Deno.env.get("SERPER_API_KEY") ?? "";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://evobrand.net";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─── Internet Presence Scanner ───────────────────────────────────────────────

interface WebsiteScanResult {
  isLive: boolean;
  hasSSL: boolean;
  responseTimeMs: number;
  title: string;
  metaDescription: string;
  hasGoogleAnalytics: boolean;
  hasOpenGraph: boolean;
  pagespeed: { performance: number; seo: number; accessibility: number } | null;
  headings: string[];
  contentSample: string;
  wordCount: number;
}

function stripTags(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractContent(html: string): { headings: string[]; contentSample: string; wordCount: number } {
  const headings = [
    ...[...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1])),
    ...[...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => stripTags(m[1])),
  ].filter(Boolean).slice(0, 6);

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyHtml = (bodyMatch?.[1] ?? html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ");

  const bodyText = stripTags(bodyHtml);
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;

  return { headings, contentSample: bodyText.slice(0, 1200), wordCount };
}

interface SearchScanResult {
  appearsInSearch: boolean;
  topResultIsOwned: boolean;
  mentionCount: number;
  hasReviews: boolean;
  knowledgePanel: boolean;
  snippets: string[];
}

interface CompetitorPresence {
  name: string;
  website: WebsiteScanResult | null;
  search: SearchScanResult | null;
}

interface PresenceData {
  website: WebsiteScanResult | null;
  search: SearchScanResult | null;
  competitor: CompetitorPresence | null;
  scannedAt: string;
}

async function scanWebsite(url: string): Promise<WebsiteScanResult> {
  const start = Date.now();
  const result: WebsiteScanResult = {
    isLive: false, hasSSL: false, responseTimeMs: 0,
    title: "", metaDescription: "", hasGoogleAnalytics: false,
    hasOpenGraph: false, pagespeed: null,
    headings: [], contentSample: "", wordCount: 0,
  };

  try {
    const normalised = url.startsWith("http") ? url : `https://${url}`;
    result.hasSSL = normalised.startsWith("https://");

    const res = await fetch(normalised, {
      headers: { "User-Agent": "EVOBRAND-BrandAuditor/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    result.responseTimeMs = Date.now() - start;
    result.isLive = res.ok;

    if (res.ok) {
      const html = await res.text();

      // Title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      result.title = titleMatch?.[1]?.trim() ?? "";

      // Meta description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
        ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
      result.metaDescription = descMatch?.[1]?.trim() ?? "";

      // Analytics & OG
      result.hasGoogleAnalytics = /gtag|google-analytics|UA-\d|G-[A-Z0-9]/i.test(html);
      result.hasOpenGraph = /property=["']og:/i.test(html);

      // Real page content — headings & body copy, for genuine messaging critique
      const content = extractContent(html);
      result.headings = content.headings;
      result.contentSample = content.contentSample;
      result.wordCount = content.wordCount;
    }
  } catch (_) {
    result.responseTimeMs = Date.now() - start;
  }

  // PageSpeed Insights (free, no key needed for basic)
  try {
    const normalised = url.startsWith("http") ? url : `https://${url}`;
    const psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalised)}&strategy=mobile&category=performance&category=seo&category=accessibility`;
    const psRes = await fetch(psUrl, { signal: AbortSignal.timeout(12000) });
    if (psRes.ok) {
      const ps = await psRes.json();
      const cats = ps.lighthouseResult?.categories;
      result.pagespeed = {
        performance: Math.round((cats?.performance?.score ?? 0) * 100),
        seo: Math.round((cats?.seo?.score ?? 0) * 100),
        accessibility: Math.round((cats?.accessibility?.score ?? 0) * 100),
      };
    }
  } catch (_) { /* PageSpeed optional */ }

  return result;
}

async function scanGooglePresence(businessName: string, industry: string): Promise<SearchScanResult> {
  const result: SearchScanResult = {
    appearsInSearch: false, topResultIsOwned: false,
    mentionCount: 0, hasReviews: false, knowledgePanel: false, snippets: [],
  };

  if (!SERPER_API_KEY) return result;

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: `"${businessName}" ${industry}`, num: 10 }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return result;
    const data = await res.json();

    const organic = data.organic ?? [];
    result.mentionCount = organic.length;
    result.appearsInSearch = organic.length > 0;
    result.knowledgePanel = !!data.knowledgeGraph;
    result.hasReviews = !!(data.knowledgeGraph?.rating || organic.some((r: {snippet?: string}) =>
      /review|star|rating/i.test(r.snippet ?? "")));
    result.snippets = organic.slice(0, 3).map((r: {title?: string; snippet?: string}) =>
      `${r.title ?? ""}: ${r.snippet ?? ""}`).filter(Boolean);

    // Check if top result looks like their own site
    if (organic[0]) {
      const bName = businessName.toLowerCase().replace(/\s+/g, "");
      result.topResultIsOwned = (organic[0].link ?? "").toLowerCase().includes(bName)
        || (organic[0].title ?? "").toLowerCase().includes(businessName.toLowerCase());
    }
  } catch (_) { /* Serper optional */ }

  return result;
}

async function scanOnlinePresence(formData: Record<string, unknown>): Promise<PresenceData> {
  const { websiteUrl, businessName, industry, competitor, competitorUrl } = formData as {
    websiteUrl: string; businessName: string; industry: string;
    competitor?: string; competitorUrl?: string;
  };

  const hasCompetitor = !!(competitor?.trim() || competitorUrl?.trim());

  const [website, search, competitorWebsite, competitorSearch] = await Promise.allSettled([
    websiteUrl?.trim() ? scanWebsite(websiteUrl.trim()) : Promise.resolve(null),
    scanGooglePresence(businessName, industry),
    hasCompetitor && competitorUrl?.trim() ? scanWebsite(competitorUrl.trim()) : Promise.resolve(null),
    hasCompetitor ? scanGooglePresence(competitor?.trim() || competitorUrl?.trim() || "", industry) : Promise.resolve(null),
  ]);

  return {
    website: website.status === "fulfilled" ? website.value : null,
    search: search.status === "fulfilled" ? search.value : null,
    competitor: hasCompetitor ? {
      name: competitor?.trim() || competitorUrl?.trim() || "Competitor",
      website: competitorWebsite.status === "fulfilled" ? competitorWebsite.value : null,
      search: competitorSearch.status === "fulfilled" ? competitorSearch.value : null,
    } : null,
    scannedAt: new Date().toISOString(),
  };
}

// ─── Anthropic ───────────────────────────────────────────────────────────────

function buildPresenceContext(presence: PresenceData): string {
  const lines: string[] = ["\n\n=== LIVE INTERNET SCAN RESULTS ==="];

  if (presence.website) {
    const w = presence.website;
    lines.push(`\nWEBSITE SCAN:`);
    lines.push(`  Live & accessible: ${w.isLive ? "YES" : "NO"}`);
    lines.push(`  SSL (HTTPS): ${w.hasSSL ? "YES" : "NO"}`);
    lines.push(`  Response time: ${w.responseTimeMs}ms ${w.responseTimeMs > 3000 ? "(SLOW)" : w.responseTimeMs > 1500 ? "(OK)" : "(FAST)"}`);
    lines.push(`  Page title: ${w.title || "MISSING — critical SEO issue"}`);
    lines.push(`  Meta description: ${w.metaDescription || "MISSING — impacts click-through rates"}`);
    lines.push(`  Google Analytics: ${w.hasGoogleAnalytics ? "YES" : "NOT DETECTED"}`);
    lines.push(`  Open Graph tags: ${w.hasOpenGraph ? "YES" : "NOT DETECTED"}`);
    if (w.pagespeed) {
      lines.push(`  PageSpeed (mobile):`);
      lines.push(`    Performance: ${w.pagespeed.performance}/100 ${w.pagespeed.performance < 50 ? "(POOR)" : w.pagespeed.performance < 75 ? "(NEEDS WORK)" : "(GOOD)"}`);
      lines.push(`    SEO: ${w.pagespeed.seo}/100 ${w.pagespeed.seo < 70 ? "(POOR)" : "(GOOD)"}`);
      lines.push(`    Accessibility: ${w.pagespeed.accessibility}/100`);
    }
    if (w.headings.length) {
      lines.push(`  Actual page headings found: ${w.headings.map((h) => `"${h}"`).join(", ")}`);
    }
    if (w.contentSample) {
      lines.push(`  Word count on homepage: ${w.wordCount} ${w.wordCount < 150 ? "(THIN — likely hurts SEO and looks unfinished)" : ""}`);
      lines.push(`  Actual homepage copy (verbatim excerpt, use this to critique real messaging/voice — do not invent messaging they don't have):`);
      lines.push(`    "${w.contentSample.slice(0, 900)}"`);
    }
  } else {
    lines.push(`\nWEBSITE SCAN: No website URL provided — cannot assess web presence directly.`);
  }

  if (presence.search) {
    const s = presence.search;
    lines.push(`\nGOOGLE SEARCH VISIBILITY:`);
    lines.push(`  Appears in search results: ${s.appearsInSearch ? "YES" : "NO"}`);
    lines.push(`  Top result appears owned: ${s.topResultIsOwned ? "YES" : "NO"}`);
    lines.push(`  Knowledge Panel: ${s.knowledgePanel ? "YES (strong presence)" : "NO"}`);
    lines.push(`  Reviews detected: ${s.hasReviews ? "YES" : "NO"}`);
    if (s.snippets.length) {
      lines.push(`  Search snippets found:`);
      s.snippets.forEach((sn) => lines.push(`    - ${sn.slice(0, 120)}`));
    }
  }

  if (presence.competitor) {
    const c = presence.competitor;
    lines.push(`\nCOMPETITOR SCAN — ${c.name}:`);
    if (c.website) {
      lines.push(`  Live: ${c.website.isLive ? "YES" : "NO"}  |  SSL: ${c.website.hasSSL ? "YES" : "NO"}  |  Response time: ${c.website.responseTimeMs}ms`);
      if (c.website.pagespeed) {
        lines.push(`  PageSpeed — Performance: ${c.website.pagespeed.performance}/100, SEO: ${c.website.pagespeed.seo}/100, Accessibility: ${c.website.pagespeed.accessibility}/100`);
      }
      lines.push(`  Title: ${c.website.title || "MISSING"}`);
      if (c.website.headings.length) lines.push(`  Headings: ${c.website.headings.slice(0, 3).map((h) => `"${h}"`).join(", ")}`);
    } else {
      lines.push(`  No competitor URL provided — could not scan their site directly.`);
    }
    if (c.search) {
      lines.push(`  Appears in Google: ${c.search.appearsInSearch ? "YES" : "NO"}  |  Knowledge Panel: ${c.search.knowledgePanel ? "YES" : "NO"}  |  Reviews: ${c.search.hasReviews ? "YES" : "NO"}`);
    }
    lines.push(`  Use this to build a head-to-head comparison — be specific about where the client is ahead or behind THIS competitor, not generic industry advice.`);
  }

  lines.push(`\nIMPORTANT: Use this REAL scan data to calibrate your scores. Do NOT rely only on self-reported ratings. If the website is slow, missing meta tags, or not ranking — score those categories accordingly. If Google Analytics is missing, that's a gap. If no Knowledge Panel, that affects competitive position. Use the verbatim homepage copy to give a genuine, specific critique of their actual messaging — quote or paraphrase it directly rather than speaking generically.`);
  lines.push("=== END SCAN DATA ===");

  return lines.join("\n");
}

async function callAnthropic(
  formData: Record<string, unknown>,
  presence: PresenceData,
): Promise<Record<string, unknown>> {
  const {
    businessName, industry, years, challenges, digital,
    audience, clientValue, competitor, consistency,
  } = formData as {
    businessName: string; industry: string; years: string;
    challenges: string[]; digital: Record<string, number>;
    audience: string; clientValue: string; competitor: string; consistency: string;
  };

  const consistencyMap: Record<string, string> = {
    none: "No real brand standards",
    some: "Some guidelines but not always followed",
    mostly: "Consistent but could be stronger",
    dialed: "Brand is dialed in and consistent",
  };

  const systemPrompt = `You are an expert brand strategist with 15 years of experience working with EVOBRAND Concepts (Dallas, TX, CEO: Keisha Solomon). You generate brand audit reports that are honest, data-driven, and actionable.

You will receive BOTH self-reported data AND live internet scan results. The live scan data is ground truth — prioritize it when scoring. If their website is slow or missing SEO tags, reflect that. If they don't appear in Google search, score digital presence accordingly. When a homepage copy excerpt is included, critique their ACTUAL messaging specifically (quote or paraphrase real phrases) rather than giving generic advice — this is what makes the report feel personal instead of templated.

Return a JSON object ONLY — no markdown, no preamble.

Exact structure:
{
  "overall_score": <0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "headline": <one punchy honest sentence about their brand situation>,
  "categories": {
    "visual_identity": { "score": <0-100>, "label": "Visual Identity", "insight": <2 sentences based on available data> },
    "digital_presence": { "score": <0-100>, "label": "Digital Presence", "insight": <2 sentences citing real scan data if available> },
    "brand_clarity": { "score": <0-100>, "label": "Brand Clarity", "insight": <2 sentences, reference their actual homepage copy/headings if provided> },
    "audience_alignment": { "score": <0-100>, "label": "Audience Alignment", "insight": <2 sentences> },
    "competitive_position": { "score": <0-100>, "label": "Competitive Position", "insight": <2 sentences citing search data if available> }
  },
  "strengths": [<3 specific strengths, grounded in real data/copy where possible>],
  "gaps": [<3 specific gaps, reference real data or actual copy where possible>],
  "recommendations": [
    { "priority": 1, "title": <action title>, "detail": <2-3 sentences, specific to this business — reference their real copy, competitor, or scan data>, "impact": <"High"|"Medium"|"Low">, "effort": <"High"|"Medium"|"Low">, "roi_note": <one sentence tying this fix to their stated avg client value or lead volume in realistic, directional terms — no fabricated precise stats> },
    { "priority": 2, "title": "", "detail": "", "impact": "", "effort": "", "roi_note": "" },
    { "priority": 3, "title": "", "detail": "", "impact": "", "effort": "", "roi_note": "" }
  ],
  "roadmap": [
    { "phase": "Days 1-30", "focus": <short theme, e.g. "Fix the leaks">, "actions": [<3 concrete, specific actions for this business>] },
    { "phase": "Days 31-60", "focus": <short theme>, "actions": [<3 actions>] },
    { "phase": "Days 61-90", "focus": <short theme>, "actions": [<3 actions>] }
  ],
  "competitive_comparison": {
    "available": <true only if competitor scan data was provided in the scan results, otherwise false>,
    "competitor_name": <string, "" if not available>,
    "summary": <1-2 sentence honest comparison of the two brands' online position>,
    "rows": [
      { "factor": <e.g. "Website Speed", "SEO", "Search Visibility", "Messaging Clarity", "Reviews/Trust">, "you": <short assessment>, "them": <short assessment>, "edge": <"you"|"them"|"tie"> }
    ]
  },
  "cta": <personalized sentence inviting them to book a call with Keisha>
}
If no competitor data was provided, still return the "competitive_comparison" key with "available": false and empty "rows".`;

  const presenceContext = buildPresenceContext(presence);

  const userMessage = `Business: ${businessName}
Industry: ${industry}
Years in business: ${years}
Biggest challenges: ${(challenges || []).join(", ")}
Self-reported digital ratings (1-5):
  Website: ${digital?.website ?? 3}  |  Social: ${digital?.social ?? 3}  |  Google: ${digital?.google ?? 3}  |  Content: ${digital?.content ?? 3}  |  Email: ${digital?.email ?? 3}
Target audience: ${audience || "Not specified"}
Avg client value: ${clientValue || "Not specified"}
Main competitor: ${competitor || "Not provided"}
Brand consistency: ${consistencyMap[consistency] ?? consistency}
${presenceContext}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 3200,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic error: ${res.status} — ${await res.text()}`);

  const aiResponse = await res.json();
  const rawText = aiResponse.content?.[0]?.text ?? "{}";
  const cleaned = rawText.replace(/```json\n?|```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Failed to parse AI response as JSON");
  }
}

// ─── Email ────────────────────────────────────────────────────────────────────

async function sendEmails(
  formData: Record<string, unknown>,
  report: Record<string, unknown>,
  auditId: string,
  presence: PresenceData,
) {
  if (!RESEND_API_KEY) return;

  const { firstName, contactEmail, businessName, phone, wantsCall } = formData as {
    firstName: string; contactEmail: string; businessName: string;
    phone: string; wantsCall: boolean;
  };

  const resultsUrl = `${SITE_URL}/auditor/results/${auditId}`;
  const recs = (report.recommendations as Array<{ title: string; detail: string }> ?? []).slice(0, 3);

  const scanBadge = presence.website?.isLive
    ? `<span style="background:#22C8E5;color:#003258;font-size:10px;padding:2px 8px;border-radius:20px;font-weight:700;margin-left:8px;">LIVE SCAN ✓</span>`
    : "";

  const prospectHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#04080f;color:#fff;margin:0;padding:0;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <p style="color:#22C8E5;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0 0 24px;">EVOBRAND CONCEPTS</p>
  <h1 style="color:#22C8E5;font-size:28px;margin-bottom:8px;">Your Brand Audit is Ready, ${firstName}.${scanBadge}</h1>
  <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;margin-bottom:24px;">${report.headline}</p>
  <div style="background:#003258;border-radius:16px;padding:32px;text-align:center;margin-bottom:28px;">
    <p style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">OVERALL BRAND SCORE</p>
    <p style="color:#22C8E5;font-size:72px;font-weight:bold;margin:0;line-height:1;">${report.overall_score}</p>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:8px 0 0;">Grade: <strong style="color:#22C8E5;">${report.grade}</strong></p>
  </div>
  ${presence.website?.pagespeed ? `
  <div style="background:rgba(34,200,229,0.05);border:1px solid rgba(34,200,229,0.15);border-radius:12px;padding:20px;margin-bottom:28px;">
    <p style="color:#22C8E5;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">LIVE WEBSITE SCAN RESULTS</p>
    <div style="display:flex;justify-content:space-between;">
      <div style="text-align:center;"><p style="color:#22C8E5;font-size:28px;font-weight:bold;margin:0;">${presence.website.pagespeed.performance}</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:4px 0 0;">Performance</p></div>
      <div style="text-align:center;"><p style="color:#22C8E5;font-size:28px;font-weight:bold;margin:0;">${presence.website.pagespeed.seo}</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:4px 0 0;">SEO Score</p></div>
      <div style="text-align:center;"><p style="color:#22C8E5;font-size:28px;font-weight:bold;margin:0;">${presence.website.pagespeed.accessibility}</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:4px 0 0;">Accessibility</p></div>
    </div>
  </div>` : ""}
  <h2 style="color:#fff;font-size:18px;margin-bottom:14px;">Top 3 Recommendations</h2>
  ${recs.map((r) => `<div style="background:rgba(255,255,255,0.04);border-left:3px solid #22C8E5;border-radius:8px;padding:14px;margin-bottom:10px;"><p style="color:#22C8E5;font-weight:bold;margin:0 0 6px;">${r.title}</p><p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0;">${r.detail}</p></div>`).join("")}
  <div style="text-align:center;margin:28px 0;">
    <a href="${resultsUrl}" style="display:inline-block;background:#22C8E5;color:#003258;padding:14px 32px;border-radius:12px;font-weight:bold;text-decoration:none;font-size:15px;text-transform:uppercase;letter-spacing:1px;">View Full Report →</a>
  </div>
  <div style="border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:22px;text-align:center;">
    <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;margin:0 0 14px;">${report.cta}</p>
    <a href="${SITE_URL}/contact" style="display:inline-block;border:2px solid #22C8E5;color:#22C8E5;padding:10px 24px;border-radius:10px;font-weight:bold;text-decoration:none;font-size:13px;">Book a Free Strategy Call</a>
  </div>
  <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center;margin-top:28px;">Keisha Solomon · CEO, EVOBRAND Concepts · Dallas, TX · evobrand.net</p>
</div></body></html>`;

  const keishaHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;padding:32px 20px;">
<div style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;">
  <h1 style="color:#003258;font-size:22px;margin:0 0 20px;">New Brand Audit${presence.website?.isLive ? " 🌐 Live Scan" : ""}</h1>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;width:38%;">Business</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;font-weight:700;">${businessName}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Email</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${contactEmail}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Phone</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${phone || "—"}</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Score</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#22C8E5;font-weight:700;font-size:20px;">${report.overall_score}/100 (${report.grade})</td></tr>
    <tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Wants Call</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;font-weight:700;">${wantsCall ? "✅ YES" : "No"}</td></tr>
    ${presence.website ? `<tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Website Live</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${presence.website.isLive ? "✅ Yes" : "❌ No"}</td></tr>` : ""}
    ${presence.website?.pagespeed ? `<tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">PageSpeed SEO</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${presence.website.pagespeed.seo}/100</td></tr>` : ""}
    ${presence.search ? `<tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Google Presence</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${presence.search.appearsInSearch ? "✅ Found" : "❌ Not found"}</td></tr>` : ""}
    ${presence.competitor ? `<tr><td style="padding:9px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Competitor Scanned</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;">${presence.competitor.name}</td></tr>` : ""}
  </table>
  <p style="margin:16px 0 6px;color:#374151;font-size:13px;"><a href="${resultsUrl}" style="color:#22C8E5;">View Client Report →</a></p>
  <p style="margin:0;color:#374151;font-size:13px;"><a href="https://supabase.com/dashboard/project/hllrpfnfusvaiwjknjge/editor" style="color:#22C8E5;">View in Supabase →</a></p>
</div></body></html>`;

  const send = (to: string, subject: string, html: string) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: "EVOBRAND <info@evobrand.net>", to: [to], subject, html }),
    });

  await Promise.allSettled([
    send(contactEmail, `Your EVOBRAND Brand Audit — ${businessName}`, prospectHtml),
    send("info@evobrand.net", `New Audit: ${businessName} scored ${report.overall_score}/100`, keishaHtml),
  ]);
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

  try {
    const formData = await req.json();
    if (!formData.businessName || !formData.contactEmail) {
      return new Response(JSON.stringify({ error: "Business name and email required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Scan internet presence in parallel with form processing
    const presence = await scanOnlinePresence(formData);

    // 2. Generate AI report with real scan data
    const report = await callAnthropic(formData, presence);

    // 3. Save to Supabase
    const { data: savedAudit, error: dbErr } = await supabase
      .from("brand_audits")
      .insert({
        business_name: formData.businessName,
        industry: formData.industry,
        email: formData.contactEmail,
        first_name: formData.firstName,
        phone: formData.phone || null,
        wants_call: formData.wantsCall || false,
        form_answers: formData,
        overall_score: report.overall_score,
        grade: report.grade,
        full_report: { ...report, presence_scan: presence },
        status: "completed",
      })
      .select("id")
      .single();

    if (dbErr) console.error("DB error:", dbErr);
    const auditId = savedAudit?.id ?? null;

    // 4. Send emails
    if (auditId) await sendEmails(formData, report, auditId, presence);

    return new Response(
      JSON.stringify({ ...report, id: auditId, businessName: formData.businessName, presence }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
