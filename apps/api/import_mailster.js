require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./src/db/connection');

async function importSubscribers() {
  try {
    const filePath = path.resolve(__dirname, '../../mailster_export_2026-06-02-02-58-43.xls');
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract all rows
    const rowMatches = content.match(/<mailster:Row>[\s\S]*?<\/mailster:Row>/g);
    if (!rowMatches) {
      console.log('No rows found');
      process.exit(0);
    }

    let importedCount = 0;

    for (const row of rowMatches) {
      // Extract cell data
      const cells = [];
      const cellRegex = /<mailster:Data[^>]*>(.*?)<\/mailster:Data>/g;
      let match;
      while ((match = cellRegex.exec(row)) !== null) {
        cells.push(match[1]);
      }

      if (cells.length < 15) continue;

      const email = cells[1]?.trim();
      const firstName = cells[2]?.trim() || null;
      const lastName = cells[3]?.trim() || null;
      const status = cells[13]?.trim();
      const listsStr = cells[14]?.trim();

      if (!email || !email.includes('@')) continue;

      // Extract lists
      const listNames = listsStr ? listsStr.split(',').map(s => s.trim()).filter(Boolean) : ['Default List'];

      for (const listName of listNames) {
        // Find or create list
        let listId;
        const [existingLists] = await pool.query('SELECT id FROM crm_lists WHERE name = ?', [listName]);
        if (existingLists.length > 0) {
          listId = existingLists[0].id;
        } else {
          const [insertRes] = await pool.query('INSERT INTO crm_lists (name) VALUES (?)', [listName]);
          listId = insertRes.insertId;
        }

        // Insert or update contact
        const contactStatus = status?.toLowerCase() === 'subscribed' ? 'subscribed' : 'unsubscribed';
        await pool.query(
          'INSERT INTO crm_contacts (email, first_name, last_name, list_id, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), status = VALUES(status)',
          [email, firstName, lastName, listId, contactStatus]
        );
        importedCount++;
      }
    }

    console.log(`Successfully imported/updated ${importedCount} list memberships.`);
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importSubscribers();
