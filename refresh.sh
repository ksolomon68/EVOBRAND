#!/bin/bash
set -e

echo "=== EVOBRAND Hard Refresh ==="

# 1. Pull latest code
echo ""
echo "[1/4] Pulling latest code from main..."
git pull origin main

# 2. Install any new API dependencies
echo ""
echo "[2/4] Installing API dependencies..."
cd apps/api && npm install --omit=dev && cd ../..

# 3. Run DB migration to ensure all columns exist
echo ""
echo "[3/4] Running DB migration..."
node apps/api/src/db/init.js 2>/dev/null || node - <<'MIGRATE'
require('dotenv').config({ path: 'apps/api/.env' });
const pool = require('./apps/api/src/db/connection');
(async () => {
  const cols = [
    "ALTER TABLE users ADD COLUMN support_plan ENUM('basic','pro','elite') DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN reset_token_expires_at TIMESTAMP NULL DEFAULT NULL",
    "ALTER TABLE support_tickets ADD COLUMN attachment_url VARCHAR(500)",
  ];
  for (const sql of cols) {
    try { await pool.query(sql); console.log('Added: ' + sql.match(/ADD COLUMN (\w+)/)[1]); }
    catch (e) { if (e.code === 'ER_DUP_FIELDNAME') console.log('Already exists: ' + sql.match(/ADD COLUMN (\w+)/)[1]); else console.error('Migration error:', e.message); }
  }
  process.exit(0);
})();
MIGRATE

# 4. Restart the API server (cPanel Passenger: touch restart.txt)
echo ""
echo "[4/4] Restarting API server..."
if [ -f "apps/api/tmp/restart.txt" ]; then
  touch apps/api/tmp/restart.txt
  echo "Passenger restart triggered (tmp/restart.txt)."
elif [ -d "apps/api/tmp" ]; then
  touch apps/api/tmp/restart.txt
  echo "Passenger restart triggered (tmp/restart.txt)."
else
  mkdir -p apps/api/tmp
  touch apps/api/tmp/restart.txt
  echo "Passenger restart triggered (tmp/restart.txt created)."
fi

# If running with PM2, restart that too
if command -v pm2 &> /dev/null; then
  pm2 restart all 2>/dev/null && echo "PM2 processes restarted." || true
fi

echo ""
echo "=== Done! API server is refreshing. ==="
