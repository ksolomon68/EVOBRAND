# EVOBRAND GovCon Intelligence

A private capture workspace for the November 9, 2026–February 6, 2027 plan.

This lives at `/govcon` in the EVOBRAND monorepo as a standalone app — it is
not part of the `apps/web` or `apps/api` workspaces and has no build step. It
is deployed separately from the public site (see "Hosting on evobrand.net"
below) so the two never share a process, a database, or an outage. Access
control is entirely its own: a single login the machine operator provisions
(see below), independent of anything in `apps/web`'s auth. The Studio
Dashboard's sidebar ("Operations → GovCon capture desk") and Overview page
link out to whatever address this server is reachable at — `VITE_GOVCON_URL`,
baked into the production build as `https://govcon.evobrand.net`.

## Hosting on evobrand.net (cPanel)

This is a one-time setup, done once in cPanel by whoever owns that account:

1. **Create the subdomain.** cPanel → Domains → Create A New Domain →
   `govcon.evobrand.net`. Any document root is fine; the Node app below
   doesn't use it.
2. **Setup Node.js App.** cPanel → Setup Node.js App → Create Application.
   - Node.js version: the newest available (24.x if offered — this app uses
     `node:sqlite`, which needs Node ≥ 22.5; pick the highest version cPanel
     lists if 24 isn't there).
   - Application mode: Production.
   - Application root: `EVOBRAND/govcon` (relative to the account home —
     this is where `.cpanel.yml` rsyncs this folder on every deploy).
   - Application URL: the `govcon.evobrand.net` subdomain from step 1.
   - Application startup file: `server.mjs`.
   - Click Create.
3. **Set environment variables** on the app's Edit screen:
   - `PUBLIC_ORIGIN` = `https://govcon.evobrand.net`
   - Leave `PORT` as cPanel assigned it; leave `HOST` unset (defaults to
     `127.0.0.1`, which is correct — cPanel's reverse proxy talks to it
     locally and terminates the public HTTPS connection).
4. **Request SSL** for the subdomain if cPanel's AutoSSL hasn't already
   issued one (SSL/TLS Status → Run AutoSSL), then restart the Node app.
5. **Provision the admin account once**, using that same app's "Enter
   virtual environment" / app terminal in cPanel (so it uses the matching
   Node version and working directory):
   ```bash
   export GOVCON_PASSWORD='a unique password, 16+ characters'
   node account.mjs your-email@example.com admin
   unset GOVCON_PASSWORD
   ```
6. Restart the app once more. Open `https://govcon.evobrand.net` and sign in.

From then on, every push to `main` re-syncs this folder to
`EVOBRAND/govcon` on the server (via `.cpanel.yml`) and restarts the app —
no further manual steps, the same way `apps/api` already works. The
`data/` folder (the SQLite database) is excluded from that sync and is
never touched by a deploy; back it up directly on the server, with the app
stopped, including any SQLite sidecar files still present.

- **Admin** can read, edit, and batch import. The account owner provisions
  logins (step 5) for anyone else who should have access.
- **Editor** can read and edit capture records.
- **Viewer** can read records and history. All roles can sign out.
- Sign-in uses salted scrypt hashes and expiring, revocable session tokens,
  over HTTPS with a `Secure` session cookie once `PUBLIC_ORIGIN` is set to an
  `https://` address. The server checks access on writes and restricts
  cross-site form submissions by validating the `Host` and `Origin` headers
  against `PUBLIC_ORIGIN`. Provisioning an existing email changes its role
  and password and revokes its sessions.

## Running it locally instead

You can still run this on just your own machine rather than hosting it —
useful for trying changes before they reach `govcon.evobrand.net`. Install
Node.js 24 if needed, open a terminal in this folder, and:

```powershell
$env:GOVCON_PASSWORD = Read-Host 'New dashboard password' -MaskInput
try { node account.mjs your-email@example.com admin } finally { Remove-Item Env:GOVCON_PASSWORD }
node server.mjs
```

Open [Capture Desk](http://127.0.0.1:4173) and sign in (set `VITE_GOVCON_URL=http://127.0.0.1:4173` in `apps/web/.env` so the dashboard link points here instead). Stop the server with Ctrl+C. Without `PUBLIC_ORIGIN` set, the server listens on the local computer only — keep the data folder private using your operating system account permissions.

## Capture workflow

1. Add a sourced award with its incumbent and current performance end date. Enter the amount only if you can record its basis, such as obligations. Treat the expiration as a research lead.
2. Add a sourced notice or a teaming lead. Choose prime or subcontract, assign an owner, and record the response deadline with its published time zone. The dashboard displays deadlines in Central Time.
3. Link a partner and document proposed roles, work package, estimated workshare and estimated EVOBRAND dollars separately. The initial CodeRed record reflects a prospective relationship.
4. Score offer fit (25%), past experience (20%), customer access (15%), team (15%), capacity (15%) and economics (10%). These weights are MVP defaults. The plan's thresholds are 80+ pursue, 65–79 conditional, and below 65 decline or monitor. Eligibility, security and schedule gates can block a pursuit. Record rationale and corrective actions with the decision.
5. Link outreach tasks to a notice, award, contact or partner. Check the overview for outstanding dates and review the history for prior decisions.

Start federal research with FHWA and FTA for transportation, then GSA, DHS and VA for modernization. The four service offers from the plan are available in the opportunity form. The overview reports current workspace totals and shows the plan's 40/60 prime-to-teaming effort target. It does not measure hours or historical KPI attainment. Alerts are in-app and include past-due records.

## Schema and import

[Schema](schema.sql) defines users, sessions, records and activity. [Model](model.mjs) defines the allowed fields, enums and server-side validation. Records have an ID, kind, title, optional source URL and external ID, optional parent, and UTC creation and edit timestamps. The per-kind payload holds capture fields. Each write stores an activity snapshot in the same transaction. The local timestamps describe workspace entry and edits.

Admin import accepts a JSON array with 1–250 flat objects. Use the same keys as the model plus kind, title, source, externalId and optional parent. A linked partner or parent requires an existing record ID from its detail page URL. Reusing the same kind, source URL and external ID rejects the batch. Each row is validated before the batch commits. For example, the following schema-only example would create a placeholder partner if submitted.

```json
[
  {"kind":"partners","title":"Partner organization","status":"Prospective"}
]
```

## Team hosting and official data roadmap

Hosting at `govcon.evobrand.net` (above) covers single-user access from any
machine. The item below is specifically about adding more users with their
own logins and roles — not needed just to reach this from anywhere.

1. **Multi-user shared workspace.** Move the domain model and views into a Next.js App Router app backed by managed PostgreSQL. Use an organization identity provider with OIDC and MFA, enforce application roles on the server, and serve through HTTPS with Secure cookies. Add membership provisioning, backups and a restore drill. Confirm the intended repository and identity provider first. [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication)
2. **USAspending award intake.** Use Award Search v2 and award detail endpoints. Store stable external award IDs, canonical record links, source timestamps and retrieval timestamps. Keep obligations, potential values and current vs. potential end dates in separate fields. Bring candidate rows into a review queue and reconcile later modifications before changing expiration alerts. [USAspending API endpoints](https://api.usaspending.gov/docs/endpoints)
3. **SAM.gov notice intake.** Use the official Opportunities Public API with a server-side API key. Start with targeted buying offices and notice types, paginate date windows, and deduplicate by notice ID. Track amendments and deadline changes while preserving internal notes and decisions. Use overlapping windows and monitor sync failures and quota use. [GSA Opportunities Public API](https://open.gsa.gov/api/get-opportunities-public-api/)
4. **Capture reporting.** Add dated KPI targets, submissions by response type, an outreach event log, effort tracking for the prime/sub split, and scheduled alerts after the team agrees on delivery channels. Keep source revisions separate from manual capture activity.
