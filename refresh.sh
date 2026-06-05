#!/bin/bash
echo "=== EVOBRAND Hard Refresh ==="

# 1. Pull latest code
echo ""
echo "[1/3] Pulling latest code from main..."
git pull origin main

# 2. Find Node.js (cPanel installs it outside the default PATH)
echo ""
echo "[2/3] Running DB migration..."

NODE_BIN=""
for p in \
  /usr/local/bin/node \
  /usr/bin/node \
  /usr/local/lsws/lsphp*/bin/node \
  /opt/cpanel/ea-nodejs*/root/usr/bin/node; do
  if [ -x "$p" ] 2>/dev/null; then NODE_BIN="$p"; break; fi
done

# Also check nvm and cPanel nodevenv
if [ -z "$NODE_BIN" ]; then
  for p in \
    "$HOME"/.nvm/versions/node/*/bin/node \
    "$HOME"/nodevenv/*/*/bin/node; do
    if [ -x "$p" ] 2>/dev/null; then NODE_BIN="$p"; break; fi
  done
fi

if [ -n "$NODE_BIN" ]; then
  echo "Found Node at $NODE_BIN"
  "$NODE_BIN" -e "
    require('dotenv').config({ path: './apps/api/.env' });
    const pool = require('./apps/api/src/db/connection');
    const cols = [
      \"ALTER TABLE users ADD COLUMN support_plan ENUM('basic','pro','elite') DEFAULT NULL\",
      'ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL',
      'ALTER TABLE users ADD COLUMN reset_token_expires_at TIMESTAMP NULL DEFAULT NULL',
      'ALTER TABLE support_tickets ADD COLUMN attachment_url VARCHAR(500)',
    ];
    (async () => {
      for (const sql of cols) {
        const name = sql.match(/ADD COLUMN (\w+)/)[1];
        try { await pool.query(sql); console.log('  Added: ' + name); }
        catch (e) { console.log('  ' + (e.code === 'ER_DUP_FIELDNAME' ? 'Already exists' : 'Error: ' + e.message) + ': ' + name); }
      }
      process.exit(0);
    })();
  " || echo "  Migration script error — server will self-heal on first request."
else
  echo "  Node.js not in PATH — server will self-heal on first request."
fi

# 3. Restart (Passenger: touch tmp/restart.txt; also try PM2)
echo ""
echo "[3/3] Restarting server..."
mkdir -p tmp && touch tmp/restart.txt && echo "  Passenger restart triggered (tmp/restart.txt)."
command -v pm2 &>/dev/null && pm2 restart all 2>/dev/null && echo "  PM2 restarted." || true

echo ""
echo "=== Done! Wait 15 seconds then refresh your browser. ==="
echo "    DB migration runs automatically on first page load if needed."
