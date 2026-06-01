require('dotenv').config();
const fs = require('fs');
const pool = require('../src/db/connection');

async function importMailster() {
  const filePath = '../../mailster_export_2026-06-01-04-52-04.xls';
  const listId = 1; // Newsletter list

  try {
    console.log('Reading file...');
    const xmlData = fs.readFileSync(filePath, 'utf8');

    console.log('Parsing XML...');
    // Extract rows
    const rowRegex = /<mailster:Row>([\s\S]*?)<\/mailster:Row>/g;
    const cellRegex = /<mailster:Data[^>]*>([\s\S]*?)<\/mailster:Data>/g;

    let match;
    let importedCount = 0;
    
    // Skip the first row if it contains headers, but based on the file preview, 
    // the first row contains data (ID 1, herbertdmfg@yahoo.com).
    
    while ((match = rowRegex.exec(xmlData)) !== null) {
      const rowContent = match[1];
      
      const cells = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        cells.push(cellMatch[1].trim());
      }

      if (cells.length >= 2) {
        // cells[0] is ID
        const email = cells[1];
        const firstName = cells[2] || null;
        const lastName = cells[3] || null;

        if (email) {
          try {
            await pool.query(
              'INSERT INTO crm_contacts (email, first_name, last_name, list_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), status = "subscribed"',
              [email, firstName, lastName, listId]
            );
            importedCount++;
            if (importedCount % 10 === 0) {
              console.log(`Imported ${importedCount} contacts...`);
            }
          } catch (err) {
            console.error(`Failed to import ${email}:`, err.message);
          }
        }
      }
    }

    console.log(`\nImport complete! Successfully imported ${importedCount} contacts.`);
  } catch (err) {
    console.error('Error during import:', err);
  } finally {
    pool.end();
  }
}

importMailster();
