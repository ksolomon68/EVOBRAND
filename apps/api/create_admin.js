const pool = require('./src/db/connection');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const email = 'ks@evobrand.net';
    const name = 'Keisha Solomon';
    const password = 'Password123!';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await pool.query('UPDATE users SET is_admin = TRUE, password_hash = ? WHERE email = ?', [passwordHash, email]);
      console.log('User already existed. Updated to Admin with new password.');
    } else {
      await pool.query(
        'INSERT INTO users (email, name, password_hash, is_admin) VALUES (?, ?, ?, TRUE)',
        [email, name, passwordHash]
      );
      console.log('Created new Admin user successfully.');
    }

  } catch (err) {
    console.error('Error creating admin:', err.message);
  } finally {
    process.exit(0);
  }
}

createAdmin();
