const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let changed = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/font-\[Rajdhani\]\s?/g, '')
    .replace(/font-\[Source_Sans_3\]\s?/g, '')
    // Clean up empty classNames
    .replace(/className\s*=\s*['"]\s*['"]/g, '');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changed++;
    console.log('Fixed', file);
  }
});

console.log('Total files changed:', changed);
