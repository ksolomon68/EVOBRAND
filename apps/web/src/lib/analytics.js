const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

function loadScript() {
  if (!GA_ID || document.getElementById('ga-script')) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);
}

export function initAnalytics() {
  loadScript();
}

export function trackPageView(path, title) {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    send_to: GA_ID,
  });
}

export function trackEvent(eventName, params = {}) {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', eventName, { ...params, send_to: GA_ID });
}
