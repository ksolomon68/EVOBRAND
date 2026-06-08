const pool = require('./connection');

async function initializeDatabase() {
  try {
    console.log('Initializing database tables...');

    // Create Users table with all required columns
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        password_hash VARCHAR(255),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns to users if upgrading from old schema
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`).catch(() => {});
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE`).catch(() => {});
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS support_plan ENUM('basic','pro','elite') DEFAULT NULL`).catch(() => {});

    // Create Contracts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status ENUM('draft', 'sent', 'signed', 'canceled') DEFAULT 'draft',
        amount DECIMAL(10,2) DEFAULT NULL,
        client_signature VARCHAR(255) DEFAULT NULL,
        client_signed_at TIMESTAMP NULL DEFAULT NULL,
        agency_signature VARCHAR(255) DEFAULT NULL,
        agency_signed_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'system',
        is_read BOOLEAN DEFAULT FALSE,
        link VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create SupportTickets table with all required columns
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
        priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        quoted_price DECIMAL(10,2) DEFAULT NULL,
        is_paid BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Add missing columns to support_tickets if upgrading from old schema
    await pool.query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal'`).catch(() => {});
    await pool.query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS quoted_price DECIMAL(10,2) DEFAULT NULL`).catch(() => {});
    await pool.query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE`).catch(() => {});
    await pool.query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS ticket_type VARCHAR(50) DEFAULT 'standard'`).catch(() => {});
    await pool.query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS plan_covered BOOLEAN DEFAULT FALSE`).catch(() => {});
    // Add pending status to enum if not already present
    await pool.query(`ALTER TABLE support_tickets MODIFY COLUMN status ENUM('open', 'in_progress', 'pending', 'resolved', 'closed') DEFAULT 'open'`).catch(() => {});

    // Create TicketReplies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ticket_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        sender_id INT,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create NewsletterSubscribers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create BlackoutDates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blackout_dates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        time VARCHAR(50),
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing time column if upgrading
    await pool.query(`ALTER TABLE blackout_dates ADD COLUMN IF NOT EXISTS time VARCHAR(50)`).catch(() => {});

    // Create Meetings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        date DATE NOT NULL,
        time VARCHAR(50) NOT NULL,
        duration INT DEFAULT 30,
        type ENUM('discovery', 'support', 'strategy', 'other') DEFAULT 'discovery',
        status ENUM('scheduled', 'completed', 'canceled') DEFAULT 'scheduled',
        meet_link VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create CRM Lists table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_lists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default lists if not exist
    await pool.query(`
      INSERT IGNORE INTO crm_lists (id, name) VALUES 
      (1, 'Newsletter'), 
      (2, 'Clients'), 
      (3, 'Leads')
    `);

    // Create CRM Contacts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        list_id INT NOT NULL,
        status ENUM('subscribed', 'unsubscribed') DEFAULT 'subscribed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_email_list (email, list_id),
        FOREIGN KEY (list_id) REFERENCES crm_lists(id) ON DELETE CASCADE
      )
    `);

    // Create CRM Campaigns table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        html_content LONGTEXT,
        list_id INT NOT NULL,
        status ENUM('draft', 'sent') DEFAULT 'draft',
        sent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (list_id) REFERENCES crm_lists(id) ON DELETE CASCADE
      )
    `);

    console.log('Database initialization complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
