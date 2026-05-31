const pool = require('./src/db/connection');

async function migrate() {
  try {
    console.log('Adding password_hash column to users table...');
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN password_hash VARCHAR(255) NULL AFTER email;
    `);
    console.log('Migration successful.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists, skipping.');
    } else {
      console.error('Migration failed:', err.message);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
