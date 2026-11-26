const {getEmailTemplate}=require('../utils/emailTemplate');
function decode(s) {
  return s.replace(/&(?:amp|lt|gt|quot|apos|nbsp|bull|copy);|&#(?:x[0-9a-f]+|\d+);/gi, entity=>{
    const names={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' ','&bull;':'•','&copy;':'©'};
    if(names[entity.toLowerCase()])return names[entity.toLowerCase()];
    const code=entity[2].toLowerCase()==='x'?parseInt(entity.slice(3,-1),16):Number(entity.slice(2,-1));
    return code<=0x10ffff?String.fromCodePoint(code):'';
  });
}
function htmlToText(html) {
  return decode(String(html).replace(/<(script|style|head)\b[^>]*>[\s\S]*?<\/\1>/gi,'')
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,(_,url,label)=>`${label} (${url})`)
    .replace(/<img\b[^>]*alt=["']([^"']*)["'][^>]*>/gi,(_,alt)=>alt)
    .replace(/<\/?(?:p|div|h[1-6]|tr|li|br)\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,''))
    .replace(/[ \t]+/g,' ').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
function campaignMessage(subject,content,id,site,email,accent,font) {
  const html=getEmailTemplate(subject,content,id,site,email,accent,font);
  return {html,text:htmlToText(html)};
}
module.exports={htmlToText,campaignMessage};
