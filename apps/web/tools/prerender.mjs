#!/usr/bin/env node
// Prerenders every public route (tools/routes.mjs) to static HTML after
// `vite build`, so search engines, AI crawlers and link previews get each
// page's real title, description, structured data and content without
// running JavaScript.
//
// Output, inside dist/apps/web:
//   index.html          the homepage, prerendered
//   _p/<route>.html     every other route, e.g. _p/services/web-development.html
//   404.html            the not-found page, served with a real 404 status
//   app.html            the original empty app shell, for client-only routes
//                       (portal, login, tool results)
// The matching rewrites live in public/.htaccess.
//
// Pages are rendered in a real browser with reduced motion, so entrance
// animations don't leave content hidden in the snapshot.

import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { getRoutes, SITE_URL } from './routes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(ROOT, '../../dist/apps/web');
const OUT_PAGES = path.join(DIST, '_p');
const PORT = 4789;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
};

const shellPath = path.join(DIST, 'index.html');
if (!fs.existsSync(shellPath)) throw new Error(`No build at ${DIST}. Run npm run build first.`);
const shell = fs.readFileSync(shellPath, 'utf8');
if (!shell.includes('<div id="root"></div>')) {
  throw new Error('dist index.html is not an empty app shell (already prerendered?). Rebuild first.');
}

// Static server over dist that always answers unknown paths with the empty
// shell, the way the SPA works in development. /api is not available here.
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url.startsWith('/api/')) { res.writeHead(503); return res.end(); }
  const file = path.join(DIST, url);
  if (file.startsWith(DIST) && fs.existsSync(file) && fs.statSync(file).isFile()) {
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    return fs.createReadStream(file).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': MIME['.html'] });
  res.end(shell);
});

function inject(html, { title, head, body }) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  // The page's own description replaces the sitewide default.
  if (/name="description"/.test(head)) out = out.replace(/\s*<meta name="description" data-default-meta[^>]*>/, '');
  out = out.replace('</head>', `${head}\n</head>`);
  return out.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function snapshot(page, route) {
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  // Wait for the page's own <SEO> tags (react-helmet) and for real content.
  await page.waitForFunction(
    () => document.querySelector('head [data-react-helmet]') && document.querySelector('#main-content')?.innerText.trim().length > 50,
    null,
    { timeout: 20000 },
  );
  await page.waitForTimeout(400);
  return page.evaluate(() => {
    const root = document.getElementById('root').cloneNode(true);
    // Drop anything that only makes sense live: inline scripts, canvases,
    // and aria-busy Suspense placeholders.
    root.querySelectorAll('script, canvas, [aria-busy="true"]').forEach((el) => el.remove());
    const head = [...document.head.querySelectorAll('[data-react-helmet]')].map((el) => el.outerHTML).join('\n');
    const description = document.querySelector('head meta[name="description"][data-react-helmet]')?.content || '';
    return { title: document.title, description, head, body: root.innerHTML };
  });
}

async function main() {
  const routes = await getRoutes();
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch();
  const context = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1366, height: 900 },
    userAgent: 'Mozilla/5.0 (compatible; EVOBRAND-prerender/1.0)',
  });
  // Don't record analytics page views or call third-party APIs while prerendering.
  await context.route(/googletagmanager|google-analytics|youtube\.com\/youtubei|\/api\//, (r) => r.abort());

  fs.rmSync(OUT_PAGES, { recursive: true, force: true });
  fs.writeFileSync(path.join(DIST, 'app.html'), shell);

  const page = await context.newPage();
  const failures = [];
  const llms = [];
  const jobs = [...routes.map((r) => r.path), '/__prerender-404__'];

  for (const route of jobs) {
    try {
      const snap = await snapshot(page, route);
      snap.title = escapeHtml(snap.title);
      const html = inject(shell, snap);
      let target;
      if (route === '/') target = path.join(DIST, 'index.html');
      else if (route === '/__prerender-404__') target = path.join(DIST, '404.html');
      else target = path.join(OUT_PAGES, `${route.replace(/^\//, '')}.html`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, html);
      if (!route.startsWith('/__')) llms.push({ route, title: snap.title, description: snap.description });
      console.log(`✓ ${route.padEnd(70)} ${(html.length / 1024).toFixed(0)} KB  ${snap.title.slice(0, 60)}`);
    } catch (err) {
      failures.push(route);
      console.error(`✗ ${route}: ${err.message.split('\n')[0]}`);
      // Still give the route a file, or .htaccess would answer it with a 404.
      if (route !== '/' && route !== '/__prerender-404__') {
        const target = path.join(OUT_PAGES, `${route.replace(/^\//, '')}.html`);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, shell);
      }
    }
  }

  await browser.close();
  server.close();

  // llms.txt: a plain index of the site for AI search tools, built from the
  // pages as actually rendered, so titles, descriptions and URLs are exact.
  const unescape = (t) => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const section = (label, test) => {
    const items = llms.filter((e) => test(e.route));
    return items.length ? `## ${label}\n${items.map((e) => `- [${unescape(e.title)}](${SITE_URL}${e.route === '/' ? '/' : e.route}): ${e.description}`).join('\n')}\n` : '';
  };
  const llmsTxt = [
    '# EVOBRAND Concepts',
    '',
    '> Senior-led digital agency in Dallas–Fort Worth, Texas, building websites, custom AI applications, document automation, AI video and WCAG accessibility for government agencies, nonprofits and businesses. SBE, WBE and MBE certified. Contact: info@evobrand.net, +1 214-531-4427.',
    '',
    section('Pages', (r) => !r.startsWith('/services/') && !r.startsWith('/blog/')),
    section('Services', (r) => r.startsWith('/services/')),
    section('Guides', (r) => r.startsWith('/blog/')),
  ].join('\n');
  fs.writeFileSync(path.join(DIST, 'llms.txt'), llmsTxt);

  if (failures.length) {
    // A failed route still works as a normal SPA page via app.html; fail the
    // build only if most routes broke, which means something is wrong overall.
    console.error(`\n${failures.length} route(s) not prerendered: ${failures.join(', ')}`);
    if (failures.length > jobs.length / 2) process.exit(1);
  }
  console.log(`\nPrerendered ${jobs.length - failures.length}/${jobs.length} routes.`);
}

main().catch((err) => { console.error(err); server.close(); process.exit(1); });
