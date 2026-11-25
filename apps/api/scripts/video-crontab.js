const fs = require('node:fs');
const marker = '# EVOBRAND_VIDEO_WORKER';
function updateCrontab(existing, directory) {
  // Cron treats percent and line breaks specially, even inside shell quotes.
  if (/[\r\n%]/.test(directory) || !directory.startsWith('/')) throw new Error('Unsupported cron application path');
  const quote = value => "'" + value.replace(/'/g, "'\\''") + "'";
  const lines = existing.split('\n').filter(line => !line.trimEnd().endsWith(marker));
  while (lines.length && !lines.at(-1)) lines.pop();
  lines.push(`* * * * * /bin/bash ${quote(directory + '/scripts/run-video-worker.sh')} >> ${quote(directory + '/video-worker.log')} 2>&1 ${marker}`);
  return lines.join('\n') + '\n';
}
if (require.main === module) {
  const [file, directory] = process.argv.slice(2);
  fs.writeFileSync(file, updateCrontab(fs.readFileSync(file, 'utf8'), directory));
}
module.exports = { updateCrontab };
