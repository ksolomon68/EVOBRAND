require('dotenv').config();
const { ensureVideoSchema } = require('./schema');
const pool = require('../db/connection');
(async () => {
  try {
    await ensureVideoSchema(pool);
    console.log('Video tables ready. Existing CRM tables unchanged.');
  } catch(error) { console.error(error.message); process.exitCode=1; }
  finally { await pool.end(); }
})();
