const fs = require('fs'); 
['support.js', 'scheduler.js', 'crm.js'].forEach(f => { 
  const file = 'C:/Users/Keisha/Documents/NEW EVO/apps/api/src/routes/' + f; 
  let content = fs.readFileSync(file, 'utf8'); 
  content = content.replace(/resend\.emails\.send/g, "require('resend').Resend(process.env.RESEND_API_KEY).emails.send"); 
  fs.writeFileSync(file, content); 
});
