const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ensureVideoSchema } = require('./schema');
const { updateCrontab } = require('../../scripts/video-crontab');
test('schema initialization is additive, awaited and shared by concurrent callers', async () => {
  const queries = [];
  const pool = {query: async sql => { queries.push(sql); }};
  await Promise.all([ensureVideoSchema(pool), ensureVideoSchema(pool)]);
  await ensureVideoSchema(pool);
  assert.equal(queries.length, 2);
  for (const sql of queries) assert.match(sql.trim(), /^CREATE TABLE IF NOT EXISTS crm_video/);
});
test('schema initialization retries after partial failure', async () => {
  let attempts = 0;
  const pool = {query: async () => { if (++attempts === 2) throw new Error('DB temporarily unavailable'); }};
  await assert.rejects(ensureVideoSchema(pool), /temporarily/);
  await ensureVideoSchema(pool);
  assert.equal(attempts, 4);
});
test('cron setup is repeatable, preserves existing jobs and quotes paths', () => {
  const old = 'MAILTO=admin@example.com\n0 2 * * * /backup.sh\n';
  const result = updateCrontab(old, '/home/agency name/EVOBRAND/apps/api');
  assert(result.startsWith(old));
  assert.equal(updateCrontab(result, '/home/agency name/EVOBRAND/apps/api'), result);
  assert(result.includes("'/home/agency name/EVOBRAND/apps/api/scripts/run-video-worker.sh'"));
  assert.throws(() => updateCrontab(old, '/home/bad%path'), /Unsupported/);
  assert.throws(() => updateCrontab(old, '/home/bad\npath'), /Unsupported/);
});
test('processing failures identify the stage and actionable reason without exposing paths', () => {
  const { processingError } = require('./errors');
  assert.match(processingError({stage:'Source inspection',tool:'FFprobe',code:'ENOENT'}), /Source inspection: FFprobe is not installed/);
  assert.match(processingError({stage:'MP4 conversion',stderr:'Error while opening encoder'}), /MP4 conversion: The video encoder could not start/);
  assert.match(processingError({signal:'SIGKILL'}), /resources/);
  assert.match(processingError({code:'ENOSPC'}), /storage is full/);
  assert.match(processingError({validation:true,message:'GIF start must be before the end of the video.'}), /GIF start/);
  assert(!processingError({message:'/private/path/secret',stderr:'/private/path/secret'}).includes('/private'));
});
