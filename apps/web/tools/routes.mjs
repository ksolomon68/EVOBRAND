// Single list of the public, indexable routes. Used by both
// generate-sitemap.mjs (sitemap.xml) and prerender.mjs (static HTML per route),
// so a page that is in the sitemap is always prerendered, and vice versa.
//
// Service and blog routes are derived from the data files, so adding a service
// or an article adds it to the sitemap and prerender automatically.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// [path, changefreq, priority]
const STATIC_ROUTES = [
  ['/', 'weekly', '1.0'],
  ['/services', 'monthly', '0.9'],
  ['/google-ad-grants', 'monthly', '0.8'],
  ['/how-it-works', 'monthly', '0.7'],
  ['/our-work', 'monthly', '0.8'],
  ['/our-work/videos', 'monthly', '0.6'],
  ['/resources', 'weekly', '0.8'],
  ['/about', 'monthly', '0.7'],
  ['/contact', 'monthly', '0.8'],
  ['/auditors', 'monthly', '0.8'],
  ['/auditor', 'monthly', '0.8'],
  ['/accessibility-checker', 'monthly', '0.8'],
  ['/maintenance-plans', 'monthly', '0.7'],
  ['/book-consultation', 'monthly', '0.8'],
  ['/free-demo-portal', 'monthly', '0.7'],
  ['/accessibility-statement', 'yearly', '0.3'],
];

// Read slugs with a regex rather than importing services.js, which pulls in
// React icon components that don't need to load in Node.
function serviceSlugs() {
  const src = fs.readFileSync(path.join(ROOT, 'src/data/services.js'), 'utf8');
  return [...src.matchAll(/^\s{4}slug:\s*'([^']+)'/gm)].map((m) => m[1]);
}

async function blogPosts() {
  const mod = await import(path.join(ROOT, 'src/data/blogPosts.js'));
  return mod.blogPosts;
}

export async function getRoutes() {
  const routes = STATIC_ROUTES.map(([p, changefreq, priority]) => ({ path: p, changefreq, priority }));
  for (const slug of serviceSlugs()) {
    routes.push({ path: `/services/${slug}`, changefreq: 'monthly', priority: '0.8' });
  }
  for (const post of await blogPosts()) {
    routes.push({ path: `/blog/${post.slug}`, changefreq: 'monthly', priority: '0.6', lastmod: post.date });
  }
  return routes;
}

export const SITE_URL = 'https://evobrand.net';
