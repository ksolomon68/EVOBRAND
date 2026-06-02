const fs = require('fs');
const path = require('path');

async function run() {
  // Fetch existing lists
  const res = await fetch('https://evobrand.net/api/crm/lists');
  const lists = await res.json();
  console.log('Existing lists:', lists);

  const listMap = {};
  for (const l of lists) {
    listMap[l.name.toLowerCase()] = l.id;
  }

  // Parse file
  const filePath = path.resolve(__dirname, '../../mailster_export_2026-06-02-02-58-43.xls');
  const content = fs.readFileSync(filePath, 'utf8');

  const rowMatches = content.match(/<mailster:Row>[\s\S]*?<\/mailster:Row>/g);
  let importedCount = 0;

  for (const row of rowMatches) {
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
    if (status?.toLowerCase() !== 'subscribed') continue;

    const listNames = listsStr ? listsStr.split(',').map(s => s.trim()).filter(Boolean) : ['Newsletter'];

    for (const listName of listNames) {
      const lNameLower = listName.toLowerCase();
      let listId = listMap[lNameLower];
      
      // If list doesn't exist, we might just default to listId 1 for now if it exists
      if (!listId) {
        console.log(`List '${listName}' not found for ${email}. Using default list 1.`);
        listId = 1; 
      }

      const postRes = await fetch('https://evobrand.net/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, first_name: firstName, last_name: lastName, list_id: listId })
      });
      
      if (postRes.ok) {
        importedCount++;
      } else {
        console.error(`Failed to add ${email}:`, await postRes.text());
      }
    }
  }

  console.log(`Successfully imported ${importedCount} subscriptions via API.`);
}

run();
