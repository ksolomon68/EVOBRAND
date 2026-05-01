// utils/helpers.js — Shared utility functions

/**
 * Format a Date object to a human-readable string.
 * e.g. "April 30, 2026"
 */
export function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a Date object to a filesystem-safe slug.
 * e.g. "2026-04-30"
 */
export function formatDateSlug(date = new Date()) {
  return date.toISOString().split('T')[0];
}

/**
 * Slugify a string for use in file names.
 * e.g. "Acme Corp" → "acme-corp"
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Compare two semantic version strings.
 * Returns true if versionB is newer than versionA.
 */
export function isNewerVersion(versionA, versionB) {
  if (!versionA || !versionB) return false;
  const normalize = (v) =>
    v
      .replace(/[^0-9.]/g, '')
      .split('.')
      .map(Number);
  const a = normalize(versionA);
  const b = normalize(versionB);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (b[i] || 0) - (a[i] || 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
}

/**
 * Generate auto-recommendations based on update data.
 */
export function generateRecommendations(updatedPlugins, clientName) {
  const recs = [];

  if (updatedPlugins.length === 0) {
    recs.push('All plugins are already up to date — no action required.');
    recs.push('Consider scheduling quarterly security audits to maintain site integrity.');
    return recs;
  }

  if (updatedPlugins.length >= 5) {
    recs.push(
      `${updatedPlugins.length} plugins were updated simultaneously. We recommend staging environment testing before production deployments of this scale.`
    );
  }

  const hasWoo = updatedPlugins.some((p) =>
    p.name.toLowerCase().includes('woocommerce')
  );
  if (hasWoo) {
    recs.push(
      'WooCommerce was updated. Verify all checkout flows, payment gateways, and order processing are functioning correctly.'
    );
  }

  const hasSecurity = updatedPlugins.some((p) =>
    ['wordfence', 'ithemes', 'sucuri', 'jetpack'].some((s) =>
      p.name.toLowerCase().includes(s)
    )
  );
  if (hasSecurity) {
    recs.push(
      'A security plugin was updated. Confirm firewall rules and scan schedules remain configured as expected.'
    );
  }

  recs.push(
    `We recommend scheduling the next maintenance window within 30 days to keep ${clientName}'s site operating at peak performance.`
  );
  recs.push(
    'Enable automatic daily backups via your hosting provider or a plugin such as UpdraftPlus or Jetpack Backup.'
  );

  return recs;
}

/**
 * Sleep for a given number of milliseconds.
 */
export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
