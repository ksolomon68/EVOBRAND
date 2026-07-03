const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api/analytics'
  : `${window.location.origin}/api/analytics`;

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

export function initAnalytics() {
  // no-op — tracking is handled via trackPageView calls
}

export function trackPageView(path, title) {
  try {
    const utms = getUtmParams();
    const payload = {
      page_path: path,
      page_title: title,
      referrer: document.referrer,
      session_id: getSessionId(),
      screen_width: window.screen?.width || null,
      ...utms,
    };
    navigator.sendBeacon(
      `${API_BASE}`,
      new Blob([JSON.stringify(payload)], { type: 'application/json' })
    );
  } catch {
    // silent fail — never block the user
  }
}

export function trackEvent(eventName, params = {}) {
  trackPageView(`/event/${eventName}`, JSON.stringify(params));
}
