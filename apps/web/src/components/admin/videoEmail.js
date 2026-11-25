const escape = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = value => { try { return ['https:', 'http:'].includes(new URL(value).protocol) ? escape(value) : ''; } catch { return ''; } };
export function videoEmailHtml(block) {
  if (!block.videoId || !url(block.landingUrl) || !url(block.posterUrl)) return '';
  const width = Math.max(160, Math.min(600, Number(block.width) || 560));
  const align = ['left','center','right'].includes(block.align) ? block.align : 'center';
  const radius = Math.max(0,Math.min(40,Number(block.radius) || 0));
  const color = /^#[a-f0-9]{6}$/i.test(block.background) ? block.background : '#003258';
  const image = block.previewType === 'jpeg' ? block.posterUrl : block.gifUrl;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${align}" bgcolor="${color}" style="padding:16px;background:${color}"><table role="presentation" width="${width}" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:${width}px"><tr><td align="${align}" style="font:24px Arial,sans-serif;color:#ffffff;padding:0 0 12px">${escape(block.title)}</td></tr><tr><td><a href="${url(block.landingUrl)}"><img src="${url(image)}" width="${width}" border="0" alt="${escape(block.alt || 'Play video: ' + block.title)}" style="display:block;width:100%;max-width:${width}px;height:auto;border:0;border-radius:${radius}px" /></a></td></tr><tr><td align="${align}" style="padding:16px"><a href="${url(block.landingUrl)}" style="font:bold 16px Arial,sans-serif;color:#003258;background:#22c8e5;border:12px solid #22c8e5;display:inline-block;text-decoration:none">${escape(block.cta || 'Watch video')}</a></td></tr></table></td></tr></table>`;
}
