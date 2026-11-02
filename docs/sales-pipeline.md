# Audit to Client

Admins can open **Sales pipeline** under **Relationships** in the client portal.
The board tracks one contact and opportunity per normalized email address through
New lead, Consultation booked, Proposal sent, Contract signed, Won, and Lost.
Admins can change stages manually. Consultation bookings and signed service
agreements also advance active leads automatically. Payments do not change stages.

## Booking and contract synchronization

- Saved Discovery and Strategy bookings advance a New lead to Consultation booked.
  Support/Other bookings and canceled consultations do not advance sales.
- Signed service agreements advance New, Consultation, or Proposal leads to
  Contract signed. Signing a mutual NDA does not advance sales.
- New contacts are created when needed, using the email on the saved user or
  contract record. Matching does not rely on a supplied booking-notification email.
- Automations never move a card backward or reopen Won/Lost. Existing deal values,
  next actions, follow-up dates, and contact details are preserved. Review the
  next action after a booking/signature and adjust it if necessary.
- Each source event records an automatic activity, including whether the stage
  advanced or was preserved. Retries and concurrent deliveries do not duplicate
  that activity. Later manual stage changes are not overwritten by replaying an
  already processed event.
- Startup reconciles persisted bookings and signatures that have not been
  processed, including historical records. Source synchronization failures are
  logged without failing the successful booking/signature, and retried on the
  next API startup. Invalid source emails need correction in the source record.
- Cancellations do not move stages backward. No onboarding projects, payments,
  or follow-up emails are created by sales synchronization.

## Contact capture and history

- New brand audits, accessibility checks, and website inquiries create a contact
  with a next action and a reminder for the following Central calendar day.
- Existing persisted audits are imported at API startup. Importing is repeatable
  and preserves existing names, deal values, stages, reminders, and notes.
- Repeated submissions share the same contact. Email is its identity and cannot
  be edited in this version. Separate deals for one contact are not supported.
- Adding a sales contact does not change email subscription status or mailing lists.
- Contact history combines sales notes and changes with audits, inquiries,
  meetings, contracts, and projects matched by normalized email. Source entries
  show their current status and original creation date; they are not a historical
  log of every change made in other modules. Campaign delivery and payment events
  are not included in this version.

## Follow-ups and email drafts

Set a next action, date, and USD deal value in **Edit contact**. Dates use
America/Chicago calendar days. Today and overdue reminders appear in the board's
due filter and in the studio overview's **Needs Attention** section. Reminders
are in-app; no background notifications or email sequences are scheduled.

To complete a follow-up, write an activity note and select **Complete follow-up**.
This records the activity and clears its reminder and next action. Set the next
date in the contact editor. Won and Lost also clear reminders; reopening allows
a new date to be scheduled.

Three editable templates cover audit follow-up, post-consultation next steps,
and proposal check-in. Templates personalize the name, business, and booking
URL. Review the draft, replace any bracketed guidance, and open it in an email
app or copy it. No email is sent or logged by opening/copying a draft. Record
completed outreach manually in the contact history.

## API and storage

All `/api/sales` endpoints require a valid bearer token and current admin status
in the users table. The existing Passenger-compatible `/sales` alias has the same
authorization. Startup creates `sales_leads`, `sales_activities`, and
`sales_sync_events` without
modifying existing CRM tables. Updates and their activity log entries use a
transaction and lock the contact row.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/sales` | Contacts, stages, and email templates |
| POST | `/api/sales` | Create a contact; duplicate email returns 409 |
| GET | `/api/sales/:id` | Contact and combined history |
| PATCH | `/api/sales/:id` | Edit contact, stage, value, or follow-up |
| POST | `/api/sales/:id/activities` | Add `note` or complete `follow_up` |

The API validates calendar dates, stage names, lengths, email identity, and USD
amounts. Closing a lead clears reminders. Source integration failures are logged
without failing the original public audit or inquiry response. A later startup
recovers persisted audit contacts through the import; historical inquiries are
not imported automatically.

## Validation

From the repository root with Node 20.19.1:

```sh
node --test --test-reporter=spec apps/api/tests/*.test.js
npm run lint
```

The integration suite requires a **new, empty, disposable database** with a name
starting with `evobrand_sales_test_`, and a database account with permission to
create tables in it. Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME and
JWT_SECRET through your normal local environment configuration. Do not use a
production database. The suite creates fixtures and exercises the real database,
HTTP routes, authorization, import, deduplication, activity log, and reminder
lifecycle. Delete the disposable database after the run.

```sh
node --test --test-reporter=spec apps/api/tests/integration/sales.js
```

The usual frontend build writes tracked generated outputs. The cloud setup helper
`bash /workspace/.evobrand-setup/build.sh` builds outside the checkout and runs
the metadata generator in a scratch directory, preserving those files.
