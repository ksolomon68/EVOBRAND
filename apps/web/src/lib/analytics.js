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

export function initAnalytics() {
  // no-op — tracking is handled via trackPageView calls
}

export function trackPageView(path, title) {
  const payload = JSON.stringify({
    page_path: path,
    page_title: title,
    referrer: document.referrer,
    session_id: getSessionId(),
  });

  // keepalive fetch survives SPA route changes; sendBeacon as fallback for page unload
  if (typeof fetch !== 'undefined') {
    fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(err => console.warn('[analytics] track failed:', err.message));
  } else {
    try {
      navigator.sendBeacon(API_BASE, new Blob([payload], { type: 'application/json' }));
    } catch {
      // silent fail
    }
  }
}

export function trackEvent(eventName, params = {}) {
  trackPageView(`/event/${eventName}`, JSON.stringify(params));
}
