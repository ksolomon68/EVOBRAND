// Video links must point at the deployment serving /api/videos. Legacy SITE_URL
// also configures older CRM email flows and may still reference another site.
function videoOrigin() {
  const value = process.env.VIDEO_PUBLIC_ORIGIN || 'https://evobrand.net';
  const url = new URL(value);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VIDEO_PUBLIC_ORIGIN must be an HTTPS origin without a path (HTTP localhost is supported for development).');
  }
  return url.origin;
}
function videoUrls(id) {
  const base = `${videoOrigin()}/api/videos`;
  return { landingUrl: `${base}/watch/${id}`, gifUrl: `${base}/media/${id}/preview.gif`, posterUrl: `${base}/media/${id}/poster.jpg` };
}
module.exports = { videoOrigin, videoUrls };
