const pool = require('./src/db/connection');

async function migrate() {
  try {
    console.log('Starting advanced support system migration...');
    
    // Add is_admin to users
    try {
      await pool.query('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;');
      console.log('Added is_admin to users.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('is_admin column already exists.');
      else throw e;
    }

    // Add priority, quoted_price, is_paid to support_tickets
    try {
      await pool.query("ALTER TABLE support_tickets ADD COLUMN priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal';");
      console.log('Added priority to support_tickets.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('priority column already exists.');
      else throw e;
    }

    try {
      await pool.query('ALTER TABLE support_tickets ADD COLUMN quoted_price DECIMAL(10, 2) DEFAULT 0.00;');
      console.log('Added quoted_price to support_tickets.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('quoted_price column already exists.');
      else throw e;
    }

    try {
      await pool.query('ALTER TABLE support_tickets ADD COLUMN is_paid BOOLEAN DEFAULT FALSE;');
      console.log('Added is_paid to support_tickets.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('is_paid column already exists.');
      else throw e;
    }

    // Create ticket_replies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ticket_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        sender_id INT, -- NULL if sent by admin/system
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log('Created ticket_replies table.');

    // Make the first user an admin (Keisha)
    await pool.query('UPDATE users SET is_admin = TRUE ORDER BY id ASC LIMIT 1;');
    console.log('Set first user as admin.');

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
