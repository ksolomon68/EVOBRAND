const dns=require('node:dns').promises;
const net=require('node:net');
const http=require('node:http');
const https=require('node:https');
const blocked=new net.BlockList();
for(const [ip,prefix] of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.88.99.0',24],['192.168.0.0',16],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',3]])blocked.addSubnet(ip,prefix,'ipv4');
const globalV6=new net.BlockList();globalV6.addSubnet('2000::',3,'ipv6');
const blockedV6=new net.BlockList();for(const [ip,prefix] of [['2001::',23],['2001:db8::',32],['2002::',16],['3fff::',20]])blockedV6.addSubnet(ip,prefix,'ipv6');
function publicIP(ip) {const family=net.isIP(ip);return family===4?!blocked.check(ip,'ipv4'):family===6&&globalV6.check(ip,'ipv6')&&!blockedV6.check(ip,'ipv6');}
async function timed(promise,ms=5000) {let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Lookup timed out')),ms);})]);}finally{clearTimeout(timer);}}
function safeURL(value) {
  const u=new URL(value);
  if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.port && !['80','443'].includes(u.port))throw new Error('Only public HTTP(S) URLs on standard ports can be checked.');
  // Do not trigger unsubscribe/actions or manufacture analytics during checking.
  if(/unsubscribe|opt[-_]?out|\/track(?:\/|\?|$)|\/videos\/(watch|events)\//i.test(u.pathname+u.search))throw new Error('Skipped action/tracking URL. Verify this destination with a test email.');
  return u;
}
async function probe(value,depth=0,lookup=dns.lookup) {
  try {
    const u=safeURL(value),hostname=u.hostname.replace(/^\[|\]$/g,'');
    const ips=net.isIP(hostname)?[{address:hostname,family:net.isIP(hostname)}]:await timed(lookup(hostname,{all:true,verbatim:true}));
    if(!ips.length||ips.some(ip=>!publicIP(ip.address)))throw new Error('Private, local or reserved addresses are not checked.');
    const chosen=ips[0];
    const result=await new Promise((resolve,reject)=>{
      const request=(u.protocol==='https:'?https:http).request(u,{method:'HEAD',headers:{'User-Agent':'EVOBRAND-Campaign-Readiness/1.0','Accept-Encoding':'identity'},lookup:(host,options,callback)=>options?.all?callback(null,[chosen]):callback(null,chosen.address,chosen.family)},response=>{
        const result={code:response.statusCode,location:response.headers.location,bytes:Number(response.headers['content-length'])||null,type:response.headers['content-type']||''};response.resume();resolve(result);
      });
      const timer=setTimeout(()=>request.destroy(new Error('Request timed out')),5000);
      request.on('close',()=>clearTimeout(timer));request.on('error',reject);request.end();
    });
    if(result.code>=300&&result.code<400&&result.location){if(depth>=3)throw new Error('Too many redirects.');return probe(new URL(result.location,u).href,depth+1,lookup);}
    if([404,410].includes(result.code))return {status:'fail',message:`HTTP ${result.code}: destination is missing.`,...result};
    if(result.code>=200&&result.code<300)return {status:'pass',message:`HTTP ${result.code}: reachable by HEAD.`,...result};
    return {status:'unknown',message:`HTTP ${result.code}: could not verify. Open it manually; some sites block automated checks.`,...result};
  } catch(error){return {status:'unknown',message:error.message.includes('getaddrinfo')?'DNS lookup failed. Verify the domain and try again.':error.message};}
}
module.exports={publicIP,safeURL,probe,timed};
