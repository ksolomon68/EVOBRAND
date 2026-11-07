#!/usr/bin/env node
// Writes public/sitemap.xml from tools/routes.mjs. Runs as part of `npm run build`.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRoutes, SITE_URL } from './routes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const routes = await getRoutes();

const urls = routes.map((r) => [
  '  <url>',
  `    <loc>${SITE_URL}${r.path === '/' ? '/' : r.path}</loc>`,
  r.lastmod ? `    <lastmod>${r.lastmod}</lastmod>` : null,
  `    <changefreq>${r.changefreq}</changefreq>`,
  `    <priority>${r.priority}</priority>`,
  '  </url>',
].filter(Boolean).join('\n'));

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, 'public/sitemap.xml'), xml);
console.log(`sitemap.xml: ${routes.length} URLs`);
