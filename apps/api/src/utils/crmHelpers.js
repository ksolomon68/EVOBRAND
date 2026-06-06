const pool = require('../db/connection');

async function addToCustomersList(email, { firstName = null, lastName = null } = {}) {
  try {
    const [lists] = await pool.query(`SELECT id FROM crm_lists WHERE name = 'Customers' LIMIT 1`);
    if (!lists.length) return;
    const listId = lists[0].id;
    await pool.query(
      `INSERT INTO crm_contacts (email, first_name, last_name, list_id, status)
       VALUES (?, ?, ?, ?, 'subscribed')
       ON DUPLICATE KEY UPDATE status = 'subscribed'`,
      [email, firstName || null, lastName || null, listId]
    );
  } catch (err) {
    console.error('Failed to add to Customers CRM list:', err.message);
  }
}

module.exports = { addToCustomersList };
