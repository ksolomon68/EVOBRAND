// First-party analytics tracker.
// The collect endpoint is /api/t — deliberately NOT /api/analytics, because
// EasyPrivacy-style ad-blocker filter lists block any request path containing
// "analytics", silently dropping beacons from visitors running content
// blockers. (The admin dashboard's read endpoints keep the old path.)
const COLLECT_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api/t'
  : `${window.location.origin}/api/t`;

function getSessionId() {
  const key = 'evo_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

/** Read UTM params from the current URL and cache them in sessionStorage so
 *  they persist across page navigations within the same session. */
function getUtmParams() {
  const stored = sessionStorage.getItem('evo_utm');
  const params = new URLSearchParams(window.location.search);
  const fromUrl = {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
  };
  // If current URL has UTM params, update the session cache
  if (fromUrl.utm_source || fromUrl.utm_medium || fromUrl.utm_campaign) {
    sessionStorage.setItem('evo_utm', JSON.stringify(fromUrl));
    return fromUrl;
  }
  // Otherwise use cached ones (so attribution persists across page hops)
  if (stored) {
    try { return JSON.parse(stored); } catch { /* ignore */ }
  }
  return { utm_source: '', utm_medium: '', utm_campaign: '' };
}

function buildPayload(path, title) {
  return {
    page_path: path,
    page_title: title,
    referrer: document.referrer,
    session_id: getSessionId(),
    screen_width: window.screen?.width || null,
    ...getUtmParams(),
  };
}

export function initAnalytics() {
  // no-op — tracking is handled via trackPageView calls
}

export function trackPageView(path, title) {
  try {
    const body = JSON.stringify(buildPayload(path, title));
    // fetch with keepalive is the modern, reliable alternative to sendBeacon
    // and properly handles CORS preflights for application/json.
    fetch(COLLECT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // silent fail — never block the user
  }
}

export function trackEvent(eventName, params = {}) {
  trackPageView(`/event/${eventName}`, JSON.stringify(params));
}

/**
 * Diagnostic used by the admin dashboard's "Send Test Hit" button.
 * Uses fetch (not sendBeacon) so the HTTP status is observable, and a
 * /dev/ path so test hits are excluded from reporting aggregates.
 * Returns { ok, status } — ok=true means the server recorded the hit.
 */
export async function sendTestHit() {
  try {
    const res = await fetch(COLLECT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload('/dev/test-ping', 'Analytics diagnostics test')),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  }
}
