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
  try {
    navigator.sendBeacon(
      `${API_BASE}`,
      new Blob(
        [JSON.stringify({ page_path: path, page_title: title, referrer: document.referrer, session_id: getSessionId() })],
        { type: 'application/json' }
      )
    );
  } catch {
    // silent fail — never block the user
  }
}

export function trackEvent(eventName, params = {}) {
  trackPageView(`/event/${eventName}`, JSON.stringify(params));
}
