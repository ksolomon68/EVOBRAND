require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/db/connection');

async function createAdmin() {
  const email = 'ks@evobrand.net';
  const password = 'Password123!';
  const name = 'Keisha Solomon';

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      await pool.query('UPDATE users SET password_hash = ?, is_admin = 1 WHERE email = ?', [passwordHash, email]);
      console.log('Admin user updated successfully.');
    } else {
      await pool.query(
        'INSERT INTO users (email, password_hash, name, is_admin) VALUES (?, ?, ?, 1)',
        [email, passwordHash, name]
      );
      console.log('Admin user created successfully.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

createAdmin();
