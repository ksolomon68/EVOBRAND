const express = require('express');
const multer = require('multer');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const pool = require('../db/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { root } = require('../video/process');
const { automated, sign, verify, landing } = require('../video/public');
const router = express.Router();
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
const validId = id => /^[a-f0-9-]{36}$/.test(id);
const site = () => (process.env.SITE_URL || 'https://evobrandconcepts.com').replace(/\/$/, '');
const serialize = row => ({ ...row, landingUrl: `${site()}/api/videos/watch/${row.id}`, gifUrl: `${site()}/api/videos/media/${row.id}/preview.gif`, posterUrl: `${site()}/api/videos/media/${row.id}/poster.jpg` });
async function ready(id) {
  if (!validId(id)) return null;
  const [[row]] = await pool.query("SELECT * FROM crm_videos WHERE id=? AND status='ready'", [id]);
  return row;
}
async function record(video, campaign, session, type, bot) {
  await pool.query('INSERT IGNORE INTO crm_video_events (video_id,campaign_id,session_id,event_type,automated) VALUES (?,?,?,?,?,?)', [video, campaign, session, type, bot]);
}
router.get('/media/:id/:asset', wrap(async (req, res) => {
  if (!['preview.gif','poster.jpg','video.mp4'].includes(req.params.asset) || !await ready(req.params.id)) return res.sendStatus(404);
  res.set('X-Content-Type-Options','nosniff');
  res.set('Cache-Control','public, max-age=300');
  res.sendFile(path.join(root, req.params.id, req.params.asset));
}));
router.get('/watch/:id', wrap(async (req, res) => {
  const video = await ready(req.params.id);
  if (!video) return res.status(404).send('This video is unavailable.');
  const campaign = /^\d{1,10}$/.test(req.query.cid || '') ? Number(req.query.cid) : 0;
  const session = crypto.randomUUID(), bot = automated(req);
  if (!process.env.JWT_SECRET) return res.status(503).send('Video tracking configuration is unavailable.');
  const token = sign({video: video.id, campaign, session, bot, exp: Date.now() + 86400000});
  if (campaign && req.method !== 'HEAD') await record(video.id, campaign, session, 'click', bot);
  res.set('Cache-Control','no-store');
  res.set('Referrer-Policy','no-referrer');
  res.set('X-Content-Type-Options','nosniff');
  res.type('html').send(landing(video, `/api/videos/media/${video.id}`, token));
}));
router.post('/events/:id', wrap(async (req, res) => {
  const token = verify(req.body.token || '');
  if (!token || token.video !== req.params.id || !['visit','play','25','50','75','100'].includes(req.body.type)) return res.sendStatus(400);
  if (!await ready(token.video)) return res.sendStatus(404);
  await record(token.video, token.campaign, token.session, req.body.type, token.bot || automated(req));
  res.sendStatus(204);
}));
router.use(authenticateToken, requireAdmin);
router.get('/analytics', wrap(async (req, res) => {
  const [rows] = await pool.query(`SELECT v.id,v.title,e.campaign_id,e.event_type,e.automated,COUNT(*) AS total FROM crm_video_events e JOIN crm_videos v ON v.id=e.video_id GROUP BY v.id,v.title,e.campaign_id,e.event_type,e.automated ORDER BY v.title,e.campaign_id`);
  res.json(rows);
}));
router.get('/', wrap(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM crm_videos WHERE status <> 'deleted' ORDER BY created_at DESC LIMIT 200");
  res.json(rows.map(serialize));
}));
const storage = multer.diskStorage({
  destination(req, file, callback) {
    req.videoId = crypto.randomUUID();
    fs.mkdir(path.join(root, req.videoId), {recursive:true, mode:0o700}).then(() => callback(null, path.join(root, req.videoId)), callback);
  },
  filename(req, file, callback) { callback(null, 'source.mp4'); }
});
const upload = multer({ storage, limits:{fileSize:250 * 1024 * 1024, files:1, fields:8}, fileFilter(req,file,callback) {
  callback(null, /\.mp4$/i.test(file.originalname) && ['video/mp4','application/octet-stream'].includes(file.mimetype));
}}).single('file');
router.post('/', (req,res,next) => upload(req,res,async error => {
  try {
    if (error) throw error;
    if (!req.file) return res.status(400).json({error:'Choose an MP4 file up to 250 MB.'});
    const handle = await fs.open(req.file.path, 'r');
    const header = Buffer.alloc(12);
    try { await handle.read(header,0,12,0); } finally { await handle.close(); }
    const start = Number(req.body.gifStart || 0), duration = Number(req.body.gifDuration || 3);
    if (header.toString('ascii',4,8) !== 'ftyp' || !Number.isFinite(start) || start < 0 || start > 1800 || !Number.isFinite(duration) || duration < .5 || duration > 10) {
      await fs.rm(path.join(root,req.videoId),{recursive:true,force:true});
      return res.status(400).json({error:'Invalid MP4 or GIF range (duration 0.5–10 seconds).'});
    }
    await pool.query('INSERT INTO crm_videos (id,title,gif_start,gif_duration,created_by) VALUES (?,?,?,?,?)', [req.videoId, String(req.body.title || req.file.originalname).slice(0,200), start, duration, req.user.id]);
    res.status(202).json({id:req.videoId,status:'queued'});
  } catch (err) {
    if(req.videoId) await fs.rm(path.join(root,req.videoId),{recursive:true,force:true}).catch(()=>{});
    next(err);
  }
}));
router.patch('/:id', wrap(async (req,res) => {
  const {title,copy,ctaLabel,ctaUrl} = req.body;
  if (!validId(req.params.id) || !title || String(title).length > 200 || String(copy || '').length > 10000 || String(ctaLabel || '').length > 100 || String(ctaUrl || '').length > 2048) return res.sendStatus(400);
  if (ctaUrl) { try { if (!['https:','http:'].includes(new URL(ctaUrl).protocol)) return res.sendStatus(400); } catch { return res.sendStatus(400); } }
  const [result] = await pool.query('UPDATE crm_videos SET title=?,copy=?,cta_label=?,cta_url=? WHERE id=?', [title,copy || '',ctaLabel || '',ctaUrl || '',req.params.id]);
  res.sendStatus(result.affectedRows ? 204 : 404);
}));
router.post('/:id/retry', wrap(async (req,res) => {
  const start = Number(req.body.gifStart || 0), duration = Number(req.body.gifDuration || 3);
  if (!validId(req.params.id) || !Number.isFinite(start) || start < 0 || start > 1800 || !Number.isFinite(duration) || duration < .5 || duration > 10) return res.sendStatus(400);
  const [result] = await pool.query("UPDATE crm_videos SET status='queued',error=NULL,gif_start=?,gif_duration=? WHERE id=? AND status='failed'", [start,duration,req.params.id]);
  res.sendStatus(result.affectedRows ? 202 : 409);
}));
router.delete('/:id', wrap(async (req,res) => {
  if (!validId(req.params.id)) return res.sendStatus(400);
  const [result] = await pool.query("UPDATE crm_videos SET status='deleted' WHERE id=? AND status NOT IN ('queued','processing')", [req.params.id]);
  if (!result.affectedRows) return res.status(409).json({error:'Wait for processing to finish before deleting.'});
  await fs.rm(path.join(root,req.params.id),{recursive:true,force:true});
  res.sendStatus(204);
}));
module.exports = router;
