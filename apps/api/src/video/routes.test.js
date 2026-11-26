const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const express = require('express');
const jwt = require('jsonwebtoken');
test('HTTP API enforces admin permissions, upload validation, public boundaries and event tokens',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'video-api-'));
  process.env.VIDEO_STORAGE_DIR=root;process.env.JWT_SECRET='route-test-secret';
  const id='12345678-1234-1234-1234-123456789abc';
  const row={id,status:'ready',title:'Thanksgiving test fixture',copy:'Hello',cta_url:''};
  const queries=[];
  let failTracking=false;
  const pool={query:async(sql,args)=>{
    queries.push([sql,args]);
    if (sql.startsWith('INSERT IGNORE')) {
      const formatted = require('mysql2').format(sql, args);
      assert(!/\?\s*\)/.test(formatted), 'Tracking SQL contains an unbound placeholder');
      assert.equal(args.length, 5);
      if (failTracking) throw Object.assign(new Error('Simulated tracking outage'), {code:'ER_TEST_OUTAGE'});
    }
    if(sql.includes('is_admin'))return [[{is_admin:args[0]===1}]];
    if(sql.includes("status='ready'"))return [[args[0]===id?row:undefined].filter(Boolean)];
    if(sql.startsWith('SELECT *'))return [[row]];
    return [{affectedRows:1}];
  }};
  require.cache[require.resolve('../db/connection')]={exports:pool};
  const app=express();app.use(express.json());app.use('/api/videos',require('../routes/videos'));
  app.use((err,req,res,next)=>res.status(400).json({error:err.message}));
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  const base=`http://127.0.0.1:${server.address().port}/api/videos`;
  const auth=id=>({Authorization:`Bearer ${jwt.sign({id},process.env.JWT_SECRET)}`});
  try {
    assert.equal((await fetch(base)).status,401);
    assert.equal((await fetch(base,{headers:auth(2)})).status,403);
    assert.equal((await fetch(base,{headers:auth(1)})).status,200);
    assert.equal((await fetch(base+'/analytics')).status,401);
    assert.equal((await fetch(base+`/media/${id}/source.mp4`)).status,404);
    assert.equal((await fetch(base+'/media/invalid/video.mp4')).status,404);
    failTracking=true;
    const degraded=await fetch(base+`/watch/${id}?cid=9`);
    assert.equal(degraded.status,200);assert((await degraded.text()).includes('<video'));
    failTracking=false;
    const countBeforeHead=queries.filter(([sql])=>sql.startsWith('INSERT IGNORE')).length;
    assert.equal((await fetch(base+`/watch/${id}?cid=9`,{method:'HEAD'})).status,200);
    assert.equal(queries.filter(([sql])=>sql.startsWith('INSERT IGNORE')).length,countBeforeHead);
    const page=await fetch(base+`/watch/${id}?cid=9`,{headers:{'User-Agent':'Proofpoint scanner'}});
    assert.equal(page.status,200);const html=await page.text();
    const token=JSON.parse(html.match(/token:("[^"]+")/)[1]);
    const tracked=queries.find(([sql,args])=>sql.startsWith('INSERT IGNORE')&&args[3]==='click'&&args[4]===true);
    assert.equal(tracked[1][4],true);
    const event=body=>fetch(base+`/events/${id}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    assert.equal((await event({token,type:'25'})).status,204);
    assert.equal((await event({token:token+'x',type:'play'})).status,400);
    assert.equal((await event({token,type:'invented'})).status,400);
    const bad=new FormData();bad.append('file',new Blob(['not an mp4'],{type:'video/mp4'}),'fake.mp4');
    assert.equal((await fetch(base,{method:'POST',headers:auth(1),body:bad})).status,400);
    const valid=new FormData();valid.append('file',new Blob([Buffer.from([0,0,0,24]),'ftypisom0000'],{type:'video/mp4'}),'fixture.mp4');
    // Signature validation queues the file; ffprobe performs full stream validation in the worker.
    const uploaded=await fetch(base,{method:'POST',headers:auth(1),body:valid});
    assert.equal(uploaded.status,202);assert.equal((await uploaded.json()).status,'queued');
    assert.equal((await fetch(base+`/${id}`,{method:'PATCH',headers:{...auth(1),'Content-Type':'application/json'},body:JSON.stringify({title:'Test',ctaUrl:'javascript:alert(1)'})})).status,400);
  } finally { await new Promise(resolve=>server.close(resolve));await fs.rm(root,{recursive:true,force:true}); }
});
