const {test}=require('node:test');const assert=require('node:assert/strict');const express=require('express');const jwt=require('jsonwebtoken');
test('readiness endpoint requires admin access, reports resource problems and never sends email',async()=>{
  process.env.JWT_SECRET='readiness-test-secret';
  const previous=process.env.RESEND_API_KEY;process.env.RESEND_API_KEY='fake-test';
  require.cache[require.resolve('../db/connection')]={exports:{query:async(sql,args)=>[[{is_admin:args[0]===1}]]}};
  require.cache[require.resolve('./dns')]={exports:{authenticationChecks:async()=>[{id:'dkim',status:'unknown',severity:'advisory',label:'DKIM selector unknown',recommendation:'Set selector.'}]}};
  let probes=0;
  require.cache[require.resolve('./network')]={exports:{probe:async url=>{probes++;return url.endsWith('missing')?{status:'fail',message:'HTTP 404: missing'}:{status:'pass',bytes:1500000,message:'HTTP 200'};}}};
  const app=express();app.use(express.json());app.use('/readiness',require('../routes/readiness'));
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  const url=`http://127.0.0.1:${server.address().port}/readiness`;
  const request=(id,body)=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(id?{Authorization:`Bearer ${jwt.sign({id},process.env.JWT_SECRET)}`}:{})},body:JSON.stringify(body)});
  try{
    assert.equal((await request(null,{})).status,401);assert.equal((await request(2,{})).status,403);
    const body={subject:'Thanksgiving',html_content:'<p>Hello</p>',resources:[{url:'https://example.com/image.jpg',kind:'image',location:'Image 1',alt:''},{url:'https://example.com/missing',kind:'link',location:'Link 2'}]};
    const automatic=await (await request(1,body)).json();assert.equal(probes,0);assert(automatic.plainText.includes('Unsubscribe'));assert(automatic.checks.some(c=>c.id==='dkim'&&c.status==='unknown'));
    const checked=await(await request(1,{...body,verifyLinks:true})).json();assert.equal(probes,2);
    assert(checked.checks.some(c=>c.id==='image-0'&&c.status==='fail'));assert(checked.checks.some(c=>c.id==='link-1'&&c.status==='fail'));
    assert.equal((await request(1,{resources:[{url:5}]})).status,400);
  }finally{await new Promise(resolve=>server.close(resolve));if(previous===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=previous;}
});
