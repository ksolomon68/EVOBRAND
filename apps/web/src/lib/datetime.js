// The API returns naive "YYYY-MM-DD HH:MM:SS" strings (the DB session runs in
// UTC) with no timezone marker. `new Date()` parses that shape as local browser
// time rather than UTC, which shifts every timestamp by the viewer's offset.
// Mark it explicitly UTC before converting.
export function parseServerDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  const s = String(dateStr);
  if (/Z|[+-]\d\d:?\d\d$/.test(s)) return new Date(s);
  if (/^\d{4}-\d\d-\d\d$/.test(s)) return new Date(`${s}T12:00:00Z`);
  return new Date(`${s.replace(' ', 'T')}Z`);
}

// America/Chicago auto-handles CST/CDT (UTC-6 / UTC-5) across DST, this is
// what visitors mean by "CST" in everyday use.
export function formatCST(dateStr, options) {
  const d = parseServerDate(dateStr);
  if (!d || Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    ...(options || {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }),
  });
}
