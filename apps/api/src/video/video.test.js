const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {execFile} = require('node:child_process');
const {promisify} = require('node:util');
const run = promisify(execFile);
process.env.JWT_SECRET = 'test-only-secret';
const {sign,verify,landing,automated} = require('./public');
test('event tokens reject tampering and expiry',()=>{
  const token=sign({video:'abc',exp:Date.now()+10000});
  assert.equal(verify(token).video,'abc');
  assert.equal(verify(token+'x'),null);
  assert.equal(verify(sign({exp:0})),null);
});
test('landing escapes campaign content and has mobile player and milestones',()=>{
  const html=landing({title:'<script>alert(1)</script>',copy:'<img src=x>',cta_url:'https://example.com',cta_label:'Go'},'/api/videos/media/test','token');
  assert(!html.includes('<script>alert(1)'));
  assert(html.includes('playsinline'));
  assert(html.includes('https://evobrand.net/logo.png'));
  assert(html.includes('<h1>&lt;script&gt;alert(1)&lt;/script&gt;</h1>'));
  assert(html.includes('player-shell'));
  assert(html.includes('max-width:100%'));
  assert(html.includes('[25,50,75]'));
  assert(html.includes("event('100')"));
  assert(html.includes('/api/videos/events/test'));
});
test('scanner and prefetch signals',()=>{
  assert(automated({get:key=>key==='user-agent'?'Proofpoint scanner':''}));
  assert(automated({get:key=>key==='purpose'?'prefetch':''}));
  assert(!automated({get:()=> 'Mozilla/5.0'}));
});
test('email HTML uses linked images, escaped copy, bounded dimensions and safe URLs',async()=>{
  const {videoEmailHtml}=await import('../../../web/src/components/admin/videoEmail.js');
  const block={videoId:'test',landingUrl:'https://example.com/watch/test',posterUrl:'https://example.com/poster.jpg',gifUrl:'https://example.com/preview.gif',title:'<evil>',width:99999,cta:'Watch'};
  const html=videoEmailHtml(block);
  assert(html.includes('role="presentation"'));assert(html.includes('width="600"'));assert(html.includes('&lt;evil&gt;'));assert(!html.includes('<video'));
  assert.equal(videoEmailHtml({...block,landingUrl:'javascript:alert(1)'}),'');
  assert(videoEmailHtml({...block,previewType:'jpeg'}).includes('src="https://example.com/poster.jpg"'));
});
test('real FFmpeg creates playable MP4, JPEG and sub-megabyte GIF and rejects invalid ranges', {timeout:120000}, async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'evobrand-video-'));
  process.env.VIDEO_STORAGE_DIR=root;
  const {processVideo}=require('./process');
  await fs.mkdir(path.join(root,'fixture'));
  try {
    await run('ffmpeg',['-v','error','-f','lavfi','-i','testsrc2=size=640x360:rate=24','-t','4','-c:v','libx264','-pix_fmt','yuv420p',path.join(root,'fixture/source.mp4')]);
    const result=await processVideo('fixture',.5,3);
    assert(result.bytes<1000000);
    for(const file of ['video.mp4','poster.jpg','preview.gif'])assert((await fs.stat(path.join(root,'fixture',file))).size>100);
    const {stdout}=await run('ffprobe',['-v','error','-show_format','-of','json',path.join(root,'fixture/preview.gif')]);
    assert(Math.abs(Number(JSON.parse(stdout).format.duration)-3)<.3);
    await assert.rejects(processVideo('fixture',10,3),/before the end/);
    console.log(`Fixture GIF: ${result.bytes} bytes`);
  } finally {await fs.rm(root,{recursive:true,force:true});}
});
test('send guard preserves old campaigns and rejects unavailable media',async()=>{
  const {unavailableVideo}=require('./campaign');
  const pool={query:async()=>[[{status:'deleted'}]]};
  assert.equal(await unavailableVideo(pool,{}),null);
  assert.equal(await unavailableVideo(pool,{blocks_json:'[{"type":"text"}]'}),null);
  assert.match(await unavailableVideo(pool,{blocks_json:[{type:'video'}]}),/Choose/);
  assert.match(await unavailableVideo(pool,{blocks_json:[{type:'video',videoId:'id'}]}),/unavailable/);
});
test('real email keeps unsubscribe and tracking, attributes video landing links',()=>{
  const {getEmailTemplate}=require('../utils/emailTemplate');
  const html=getEmailTemplate('Video','<a href="https://example.com/api/videos/watch/1234-abcd">Watch</a>',42,'https://example.com','test@example.com');
  assert(html.includes('cid=42'));
  assert(html.includes('1234-abcd%3Fcid%3D42'));
  assert(html.includes('/api/newsletter/unsubscribe?email=test%40example.com'));
});
