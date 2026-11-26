const express=require('express');
const {authenticateToken,requireAdmin}=require('../middleware/auth');
const {campaignMessage}=require('../readiness/message');
const {authenticationChecks}=require('../readiness/dns');
const {probe}=require('../readiness/network');
const router=express.Router();
router.use(authenticateToken,requireAdmin);
router.post('/',async(req,res,next)=>{
  try {
    const {subject='',html_content='',resources=[],verifyLinks=false}=req.body;
    if(typeof subject!=='string'||typeof html_content!=='string'||html_content.length>200000||!Array.isArray(resources)||resources.length>100)return res.status(400).json({error:'Use a campaign below 200 KB and at most 100 links/images per check.'});
    if(resources.some(r=>!r||typeof r.url!=='string'||r.url.length>2048||!['link','image'].includes(r.kind)||typeof r.location!=='string'||r.location.length>200))return res.status(400).json({error:'Invalid resource check request.'});
    const from=process.env.RESEND_FROM_EMAIL||'info@evobrand.net';
    const senderValid=/^[^\s<>@]+@(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(from);
    const site=process.env.SITE_URL||'https://evobrandconcepts.com';
    const message=campaignMessage(subject,html_content,null,site,'readiness@example.invalid');
    const unsub=message.html.match(/href="(https?:[^"<>]+\/api\/newsletter\/unsubscribe\?email=[^"]+)"/i);
    let unsubscribeValid=false;try{unsubscribeValid=!!unsub&&new URL(unsub[1]).protocol==='https:';}catch{}
    const checks=[
      {id:'sender',status:senderValid?'pass':'fail',severity:'critical',label:`Sender address format: EVOBRAND <${from}>`,recommendation:senderValid?'':'Configure RESEND_FROM_EMAIL as a valid email address. Verify that address/domain with the sending provider.'},
      {id:'sender-verified',status:'unknown',severity:'advisory',label:'Sender ownership and delivered authentication not verified',recommendation:'Confirm the sender is verified with your provider. Send a test and inspect Authentication-Results for SPF/DKIM/DMARC pass and alignment.'},
      {id:'transport',status:process.env.SMTP_HOST||process.env.RESEND_API_KEY?'pass':'fail',severity:'critical',label:'Sending transport is configured',recommendation:process.env.SMTP_HOST||process.env.RESEND_API_KEY?'':'Configure SMTP or a Resend API key on the server before sending.'},
      {id:'unsubscribe',status:unsubscribeValid?'pass':'fail',severity:'critical',label:'Recipient-specific HTTPS unsubscribe link in outgoing template',recommendation:unsubscribeValid?'':'Restore the unsubscribe footer and configure SITE_URL as the public HTTPS API origin. This check does not call the unsubscribe endpoint.'},
      {id:'plain',status:message.text.trim()?'pass':'fail',severity:'advisory',label:'Plain-text alternative generated for campaign sends',recommendation:message.text.trim()?'':'Add readable text or descriptive image alt text.'},
      ...(await authenticationChecks(senderValid?from.split('@')[1]:''))
    ];
    const results=[];
    const unique=[...new Set(resources.map(r=>r.url))];
    if(verifyLinks){
      // Bounded network work, no GET fallback, no redirects to private hosts.
      for(let i=0;i<Math.min(unique.length,20);i+=4){
        const chunk=await Promise.all(unique.slice(i,Math.min(i+4,20)).map(async url=>({url,...await probe(url)})));results.push(...chunk);
      }
    }
    for(const [i,r] of resources.entries()){
      const result=results.find(x=>x.url===r.url);
      if(r.kind==='link')checks.push({id:`link-${i}`,status:result?.status||'unknown',severity:'advisory',label:`${r.location}: ${result?.message||'reachability not checked'}`,recommendation:result?.status==='pass'?'':'Correct a missing destination, or open it manually if automatic verification is unavailable. Use Check links & image sizes to test up to 20 unique public URLs.',details:[r.url]});
      if(r.kind==='image'){
        const tooLarge=result?.bytes>1000000;
        checks.push({id:`image-${i}`,status:result?.status==='fail'||tooLarge?'fail':result?.status==='pass'&&result.bytes?'pass':'unknown',severity:'advisory',label:`${r.location}: ${result?.status==='fail'?result.message:result?.bytes?`${Math.round(result.bytes/1000)} KB`:'file size not verified'}`,recommendation:tooLarge?'Compress or resize the image, or use JPEG instead of an animated GIF. Aim below 1 MB per image.':result?.status==='fail'?'Replace the missing image URL.':result?.bytes?'':'Run the image-size check or inspect the asset manually; some servers omit Content-Length.',details:[r.url]});
        if(!String(r.alt||'').trim())checks.push({id:`rendered-alt-${i}`,status:'fail',severity:'advisory',label:`${r.location}: missing alt text`,recommendation:'Add meaningful alt text to this image; decorative images can intentionally use empty alt text.'});
      }
    }
    res.json({checks,checkedAt:new Date().toISOString(),plainText:message.text,notice:'DNS publication and HEAD responses do not guarantee delivery, sender authentication, or inbox placement.'});
  }catch(error){next(error);}
});
module.exports=router;
