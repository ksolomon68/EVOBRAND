require('dotenv').config();
const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../db/connection');
(async () => {
  try {
    const sql = await fs.readFile(path.join(__dirname,'../../migrations/20261125_video.sql'),'utf8');
    for (const statement of sql.split(';').filter(s=>s.trim())) await pool.query(statement);
    console.log('Video tables ready. Existing CRM tables unchanged.');
  } catch(error) { console.error(error.message); process.exitCode=1; }
  finally { await pool.end(); }
})();
