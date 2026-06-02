const pool = require('./src/db/connection');
const bcrypt = require('bcryptjs');

async function createDemoUsers() {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('shadow01', salt);

    // 1. Create/Update Admin demo account: ks@evobrand.net
    const adminEmail = 'ks@evobrand.net';
    const adminName = 'Keisha Solomon (Admin Demo)';
    const [existingAdmin] = await pool.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
    
    if (existingAdmin.length > 0) {
      await pool.query('UPDATE users SET is_admin = TRUE, password_hash = ?, name = ? WHERE email = ?', [passwordHash, adminName, adminEmail]);
      console.log(`Admin demo account (${adminEmail}) updated successfully with password 'shadow01'.`);
    } else {
      await pool.query(
        'INSERT INTO users (email, name, password_hash, is_admin) VALUES (?, ?, ?, TRUE)',
        [adminEmail, adminName, passwordHash]
      );
      console.log(`Admin demo account (${adminEmail}) created successfully with password 'shadow01'.`);
    }

    // 2. Create/Update Customer demo account: k.solomon@live.com
    const customerEmail = 'k.solomon@live.com';
    const customerName = 'Keisha Solomon (Customer Demo)';
    const [existingCustomer] = await pool.query('SELECT * FROM users WHERE email = ?', [customerEmail]);
    
    if (existingCustomer.length > 0) {
      await pool.query('UPDATE users SET is_admin = FALSE, password_hash = ?, name = ? WHERE email = ?', [passwordHash, customerName, customerEmail]);
      console.log(`Customer demo account (${customerEmail}) updated successfully with password 'shadow01'.`);
    } else {
      await pool.query(
        'INSERT INTO users (email, name, password_hash, is_admin) VALUES (?, ?, ?, FALSE)',
        [customerEmail, customerName, passwordHash]
      );
      console.log(`Customer demo account (${customerEmail}) created successfully with password 'shadow01'.`);
    }

  } catch (err) {
    console.error('Error creating demo accounts:', err.message);
  } finally {
    process.exit(0);
  }
}

createDemoUsers();
