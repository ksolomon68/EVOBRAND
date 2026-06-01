const { execSync } = require('child_process');
const fs = require('fs');

try {
  const stdout = execSync('npm install nodemailer --no-audit --no-fund', {
    cwd: __dirname,
    env: process.env,
    encoding: 'utf8'
  });
  fs.writeFileSync(__dirname + '/install.log', 'SUCCESS:\n' + stdout);
} catch (error) {
  fs.writeFileSync(__dirname + '/install.log', 'ERROR:\n' + error.message + '\nSTDERR:\n' + (error.stderr || '') + '\nSTDOUT:\n' + (error.stdout || ''));
}
