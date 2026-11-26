const dns=require('node:dns').promises;
const {timed}=require('./network');
async function txt(name,resolve=dns.resolveTxt){try{return {records:(await timed(resolve(name))).map(parts=>parts.join(''))};}catch(e){return {records:[],missing:['ENODATA','ENOTFOUND'].includes(e.code),error:e.code||'Lookup unavailable'};}}
const check=(id,status,label,recommendation)=>({id,status,severity:'advisory',label,recommendation:status==='pass'?'':recommendation});
async function authenticationChecks(domain,env=process.env,resolve=dns.resolveTxt) {
  if(!/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(domain||''))return [check('dns','unknown','DNS authentication not checked','Configure a valid sender domain first.')];
  const mailFrom=env.MAIL_FROM_DOMAIN || domain;
  const [spf,dmarc]=await Promise.all([txt(mailFrom,resolve),txt(`_dmarc.${domain}`,resolve)]);
  const spfRecords=spf.records.filter(s=>/^v=spf1(?:\s|$)/i.test(s));
  const spfOK=spfRecords.length===1&&!/(?:^|\s)\+?all(?:\s|$)/i.test(spfRecords[0]);
  const checks=[check('spf',spfOK?'pass':spf.error&&!spf.missing?'unknown':'fail',`SPF publication at ${mailFrom}${spfOK?' detected':''}`,'Publish exactly one SPF record authorizing your sending provider; never use +all. Configure MAIL_FROM_DOMAIN for a custom return-path. This check does not evaluate SPF lookups or confirm sending-IP authorization.')];
  const dmarcRecords=dmarc.records.filter(s=>/^v=DMARC1\s*;/i.test(s));
  const policy=dmarcRecords.length===1&&dmarcRecords[0].match(/(?:^|;)\s*p=(none|quarantine|reject)\s*(?:;|$)/i)?.[1];
  checks.push(check('dmarc',policy?'pass':dmarc.error&&!dmarc.missing?'unknown':dmarc.missing?'unknown':'fail',`DMARC at ${domain}${policy?` published (p=${policy})`:': not verified'}`,'Publish a valid DMARC policy or verify an inherited organizational-domain policy with your provider. Parent-domain inheritance and message alignment are not evaluated.'));
  const selectors=(env.DKIM_SELECTORS||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,5);
  if(!selectors.length)checks.push(check('dkim','unknown','DKIM: selector not configured','Set DKIM_SELECTORS to the selector(s) supplied by your email provider. Then recheck. A selector cannot be reliably inferred from the address.'));
  for(const selector of selectors){
    if(!/^[a-z0-9_-]+(?:\.[a-z0-9_-]+)*$/i.test(selector)){checks.push(check(`dkim-${selector}`,'fail','Invalid DKIM selector','Use the DNS selector supplied by your email provider.'));continue;}
    const result=await txt(`${selector}._domainkey.${domain}`,resolve);
    const keys=result.records.filter(s=>/(?:^|;)\s*p=[a-z0-9+/=]+\s*(?:;|$)/i.test(s));
    checks.push(check(`dkim-${selector}`,keys.length===1?'pass':result.error&&!result.missing?'unknown':'fail',`DKIM public key: ${selector}${keys.length===1?' detected':''}`,'Publish the provider’s DKIM TXT/CNAME record for this selector. Confirm the delivered message is signed and aligned; DNS presence alone cannot verify signing.'));
  }
  return checks;
}
module.exports={authenticationChecks};
