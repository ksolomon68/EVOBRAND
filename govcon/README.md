# EVOBRAND GovCon Intelligence

A private, local capture workspace for the November 9, 2026–February 6, 2027 plan.

This lives at `/govcon` in the EVOBRAND monorepo as a standalone app — it is
not part of the `apps/web` or `apps/api` workspaces, has no build step, and is
never bundled or deployed with the public site. The Studio Dashboard's
sidebar ("Operations → GovCon capture desk") and Overview page link out to
whatever URL this server is running on (`VITE_GOVCON_URL` in `apps/web`,
default `http://127.0.0.1:4173`); that link only resolves on the machine
where this server is actually running.

## Start on Windows

Install Node.js 24 if needed. Open PowerShell in this folder. Provision an administrator using a unique password of at least 16 characters.

```powershell
$env:GOVCON_PASSWORD = Read-Host 'New dashboard password' -MaskInput
try { node account.mjs your-email@example.com admin } finally { Remove-Item Env:GOVCON_PASSWORD }
node server.mjs
```

Open [Capture Desk](http://127.0.0.1:4173) and sign in. Stop the server with Ctrl+C. The server listens on the local computer only. Keep the data folder private using your operating system account permissions. Back up the SQLite database with the server stopped, including any SQLite sidecar files still present. Provisioning an existing email changes its role and password and revokes its sessions.

- **Admin** can read, edit, and batch import. The machine operator provisions accounts.
- **Editor** can read and edit capture records.
- **Viewer** can read records and history. All roles can sign out.
- Local sign-in uses salted scrypt hashes and expiring, revocable session tokens. The server checks access on writes and restricts cross-site form submissions.

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

1. **Shared internal workspace.** Move the domain model and views into a Next.js App Router app backed by managed PostgreSQL. Use an organization identity provider with OIDC and MFA, enforce application roles on the server, and serve through HTTPS with Secure cookies. Add membership provisioning, backups and a restore drill. Confirm the intended repository and identity provider first. [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication)
2. **USAspending award intake.** Use Award Search v2 and award detail endpoints. Store stable external award IDs, canonical record links, source timestamps and retrieval timestamps. Keep obligations, potential values and current vs. potential end dates in separate fields. Bring candidate rows into a review queue and reconcile later modifications before changing expiration alerts. [USAspending API endpoints](https://api.usaspending.gov/docs/endpoints)
3. **SAM.gov notice intake.** Use the official Opportunities Public API with a server-side API key. Start with targeted buying offices and notice types, paginate date windows, and deduplicate by notice ID. Track amendments and deadline changes while preserving internal notes and decisions. Use overlapping windows and monitor sync failures and quota use. [GSA Opportunities Public API](https://open.gsa.gov/api/get-opportunities-public-api/)
4. **Capture reporting.** Add dated KPI targets, submissions by response type, an outreach event log, effort tracking for the prime/sub split, and scheduled alerts after the team agrees on delivery channels. Keep source revisions separate from manual capture activity.
