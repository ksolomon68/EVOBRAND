const pool = require('./src/db/connection');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const email = 'admin@evobrandconcepts.com';
    const password = 'password123';
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    await pool.query(
      'INSERT INTO users (email, password_hash, name, is_admin) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE is_admin = 1, password_hash = ?',
      [email, passwordHash, 'EVO Admin', passwordHash]
    );
    
    console.log(`Admin account created!\nEmail: ${email}\nPassword: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
