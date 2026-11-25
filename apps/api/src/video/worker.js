require('dotenv').config();
const pool = require('../db/connection');
const { processVideo } = require('./process');
const { ensureVideoSchema } = require('./schema');
async function tick() {
  await ensureVideoSchema(pool);
  const connection = await pool.getConnection();
  try {
    const [[lock]] = await connection.query("SELECT GET_LOCK('evobrand_video_worker', 0) AS acquired");
    if (!lock.acquired) return;
    // The advisory lock is held through processing. A dead worker releases it automatically.
    await connection.query("UPDATE crm_videos SET status=IF(attempts >= 3, 'failed', 'queued'), error='Worker interrupted; retry if processing does not resume.' WHERE status='processing'");
    const [[job]] = await connection.query("SELECT * FROM crm_videos WHERE status='queued' ORDER BY created_at LIMIT 1");
    if (!job) return;
    await connection.query("UPDATE crm_videos SET status='processing', attempts=attempts+1 WHERE id=?", [job.id]);
    try {
      const result = await processVideo(job.id, job.gif_start, job.gif_duration);
      await connection.query("UPDATE crm_videos SET status='ready', duration=?, gif_bytes=?, error=NULL WHERE id=?", [result.duration, result.bytes, job.id]);
    } catch (error) {
      console.error('Video processing failed', job.id, error.message);
      await connection.query("UPDATE crm_videos SET status='failed', error=? WHERE id=?", ['Processing failed. Check the MP4, GIF range, and server FFmpeg installation, then retry.', job.id]);
    }
  } finally {
    await connection.query("SELECT RELEASE_LOCK('evobrand_video_worker')").catch(() => {});
    connection.release();
  }
}
async function loop() {
  try { await tick(); } catch (error) { console.error('Video worker:', error.message); }
  setTimeout(loop, 3000);
}
if (require.main === module) {
  if (process.argv.includes('--once')) {
    tick().catch(error => { console.error('Video worker:', error.message); process.exitCode = 1; }).finally(() => pool.end());
  } else loop();
}
module.exports = { tick };
