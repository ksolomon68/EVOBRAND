const pool = require('../db/connection');

/**
 * Creates a notification for a user
 * @param {number} userId - The user ID to notify
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} [link] - An optional link to navigate to when clicked
 * @param {string} [type='system'] - The type of notification (e.g. 'system', 'ticket', 'invoice')
 */
async function createNotification(userId, title, message, link = null, type = 'system') {
  try {
    if (!userId) return false;
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, link, type) VALUES (?, ?, ?, ?, ?)',
      [userId, title, message, link, type]
    );
    return true;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return false;
  }
}

/**
 * Notifies all admins
 */
async function notifyAdmins(title, message, link = null, type = 'system') {
  try {
    const [admins] = await pool.query('SELECT id FROM users WHERE is_admin = 1 OR is_admin = true');
    for (const admin of admins) {
      await createNotification(admin.id, title, message, link, type);
    }
    return true;
  } catch (error) {
    console.error('Failed to notify admins:', error);
    return false;
  }
}

module.exports = { createNotification, notifyAdmins };
