# EVOBRAND WordPress Maintenance System

> **A premium, one-click system that updates all WordPress sites, generates high-end branded PDF reports, and delivers them automatically by email.**

---

## Folder Structure

```
wp-maintenance/
├── run-maintenance.js        # Main entry point
├── package.json
├── .env.example              # Copy to .env and configure
│
├── clients/
│   └── clients.json          # Your client list (local + SSH)
│
├── services/
│   ├── wordpress.js          # WP-CLI integration (local & SSH)
│   ├── report.js             # Handlebars HTML report generator
│   ├── pdf.js                # Puppeteer A4 PDF export
│   └── email.js              # Nodemailer branded email delivery
│
├── templates/
│   └── report.hbs            # EVOBRAND branded HTML report template
│
├── utils/
│   ├── logger.js             # Winston daily-rotating logger
│   ├── ssh.js                # SSH command execution (node-ssh)
│   └── helpers.js            # Date, slugify, version compare, recommendations
│
├── reports/                  # Auto-created — generated PDFs & HTML reports
└── logs/                     # Auto-created — daily log files
```

---

## Prerequisites

| Requirement | Notes |
|---|---|
| **Node.js ≥ 18** | ES Modules required |
| **WP-CLI** | Must be installed on each WordPress server |
| **SMTP credentials** | Gmail App Password recommended |
| **SSH key pair** | For remote clients |

---

## Setup

### 1. Install dependencies

```bash
cd wp-maintenance
npm install
```

> Puppeteer will download a Chromium binary automatically (~170MB). This is required for PDF generation.

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your SMTP credentials:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@evobrand.net
SMTP_PASS=your-app-password
EMAIL_FROM_NAME=EVOBRAND
EMAIL_FROM_ADDRESS=info@evobrand.net
```

**Gmail users:** Generate an [App Password](https://myaccount.google.com/apppasswords) — do not use your main account password.

### 3. Configure clients

Edit `clients/clients.json`:

```jsonc
[
  {
    "id": "my-client",           // URL-safe identifier
    "name": "My Client Name",    // Display name in reports
    "email": "client@email.com", // Report delivery address
    "enabled": true,
    "connection": {
      "type": "local",           // "local" or "ssh"
      "sitePath": "/var/www/html/wordpress"
    },
    "wpcli": "wp"               // WP-CLI binary path
  }
]
```

**SSH Client Example:**
```jsonc
{
  "id": "remote-client",
  "name": "Remote Client",
  "email": "admin@remote.com",
  "enabled": true,
  "connection": {
    "type": "ssh",
    "host": "203.0.113.10",
    "port": 22,
    "username": "deploy",
    "privateKeyPath": "~/.ssh/id_rsa",
    "sitePath": "/var/www/html"
  },
  "wpcli": "/usr/local/bin/wp"
}
```

---

## Usage

### Run all enabled clients (live mode)
```bash
node run-maintenance.js
```

### Dry run (no actual updates, no emails — uses mock data)
```bash
node run-maintenance.js --dry-run
```

### Generate and email report only (skip WP updates)
```bash
node run-maintenance.js --report-only
```

### Target a specific client
```bash
node run-maintenance.js --client=acme-corp
```

### Enable cron scheduling

Set in `.env`:
```env
CRON_ENABLED=true
CRON_SCHEDULE=0 2 * * 0    # Every Sunday at 2:00 AM
```

Then run the process with a process manager:
```bash
# Using PM2 (recommended for production)
npm install -g pm2
pm2 start run-maintenance.js --name "wp-maintenance"
pm2 save
pm2 startup
```

---

## Reports & Logs

| Output | Location |
|---|---|
| PDF Reports | `reports/{client-id}-{date}.pdf` |
| HTML Reports | `reports/{client-id}-{date}.html` |
| Daily Logs | `logs/maintenance-{date}.log` |
| Error Logs | `logs/errors-{date}.log` |

---

## Report Contents

Each generated PDF includes:

- ✅ EVOBRAND branded header (deep blue + cyan)
- ✅ Client name, date, and preparer meta
- ✅ Summary cards: plugins updated, total plugins, site status
- ✅ Plugin update table: name, old → new version, "Updated" badge
- ✅ Auto-generated recommendations section
- ✅ Branded footer

---

## WP-CLI Verification

Test that WP-CLI is working on a server:

```bash
# Local
wp plugin list --format=json

# Remote (SSH into server first)
ssh user@host "wp plugin list --path=/var/www/html --format=json"
```

---

## Troubleshooting

### Puppeteer fails on Linux servers
```bash
# Install required Chromium dependencies
sudo apt-get install -y \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libxcomposite1 libxdamage1 libxrandr2 libgbm1 \
  libasound2 libpangocairo-1.0-0 libxss1
```

### Gmail authentication error
Use an **App Password**, not your account password.  
Enable 2FA → [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

### WP-CLI permission errors
Add `--allow-root` to your `wpcli` binary path in `clients.json`:
```json
"wpcli": "wp --allow-root"
```

---

## Brand Reference

| Token | Value |
|---|---|
| Primary (Cyan) | `#22c8e5` |
| Secondary (Deep Blue) | `#003258` |
| Background | `#f8f9fb` |
| Accent Gradient | `linear-gradient(90deg, #22c8e5, #003258)` |
| Typography | Inter (Google Fonts) |

---

*Built by EVOBRAND — Digital Strategy & Solutions*
