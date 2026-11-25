const fs = require('node:fs/promises');
const path = require('node:path');
const pending = new WeakMap();
// Shared by deployment, the API and cron. A failure can be retried on the next
// request; concurrent requests await the same initialization rather than racing.
function ensureVideoSchema(pool) {
  if (!pending.has(pool)) {
    const migration = (async () => {
      const sql = await fs.readFile(path.join(__dirname, '../../migrations/20261125_video.sql'), 'utf8');
      for (const statement of sql.split(';').filter(s => s.trim())) await pool.query(statement);
    })().catch(error => { pending.delete(pool); throw error; });
    pending.set(pool, migration);
  }
  return pending.get(pool);
}
module.exports = { ensureVideoSchema };
