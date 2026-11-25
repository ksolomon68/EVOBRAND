# Video email campaigns

## Architecture and migration plan

Inspection found React/Vite `CampaignBlockEditor.jsx` serializes blocks to `blocks_json` and HTML to `crm_campaigns.html_content`. `CampaignLivePreview.jsx` already provides desktop/mobile rendering through `/api/crm/preview-html`. `AdminCRMPanel.jsx` provides test sends via `/campaigns/:id/preview`. Express `routes/crm.js`, `utils/emailTemplate.js` and `utils/mailer.js` own campaign sends, redirects and unsubscribe links. MySQL uses `db/connection.js`; JWT authentication and live database admin checks live in `middleware/auth.js`. Existing attachments use publicly mounted `apps/api/uploads`; private originals must not use that location. `AdminAnalyticsPanel.jsx` is the existing dashboard integration point.

The implementation adds two independent tables without altering contacts, campaigns, subscriptions or existing event tables. New video blocks reuse the existing JSON field, HTML compiler, previews and sender. Old campaigns do not query the video tables. The video worker is separate from the HTTP process and uses a MySQL advisory lock to serialize processing across workers. A crashed worker's job is recovered when the lock becomes available, with a three-attempt crash ceiling; processing failures expose an explicit retry action.

## Deployment

1. Back up the database. Run `npm run video:migrate --prefix apps/api` with the existing database environment. The additive migration is repeatable. Video API requests and worker runs also await this same idempotent migration automatically, preventing queries against missing tables. Concurrent requests share one initialization; failures can retry.
2. Install system `ffmpeg` and `ffprobe` with libx264, AAC, GIF palette, and image support. No new npm dependencies were introduced.
3. Configure `VIDEO_STORAGE_DIR` to a persistent private directory outside all web/static roots. API and worker must share it and have write permission. The default is `apps/api/private-videos`, ignored by Git. Back it up with the database. Mount the same volume on every API instance. Original uploads are inaccessible through media routes; only ready derivatives are public by unguessable UUID.
4. Set `SITE_URL` to the public HTTPS origin forwarding `/api/*` to the API. Set the existing `JWT_SECRET`; video event tokens require it. Optional executable overrides are `FFMPEG_PATH` and `FFPROBE_PATH`.
5. cPanel deployment now runs `bash apps/api/scripts/setup-video-worker.sh` after restarting the API. It runs the migration, checks FFmpeg/FFprobe and required encoders, and installs one cron entry that processes a queued video every minute. Existing cron jobs are preserved; repeat deployments replace only the marked video-worker entry. The worker runs outside the web process, so it does not depend on website traffic. Overlapping runs are serialized by the existing MySQL advisory lock. Alternatively, run `npm run video:worker --prefix apps/api` under a process supervisor with automatic restart (choose one scheduling mode). Allow the API proxy uploads up to 250 MB with suitable request timeouts. Allow up to 30 minutes / 4K source video; processing commands have a ten-minute timeout.
6. Deploy the web build after the migration and API. Verify public JPEG/GIF/video URLs and MP4 range responses through the actual production proxy. No campaign or test emails are automatically sent by deployment.

Rollback: deploy the previous frontend/API and stop the worker. Preserve the additive tables and media; deleting them breaks already-sent email links. Do not drop tables as a routine rollback.

## Use

Add a Video block, set GIF start and duration (default three seconds), and upload MP4. Progress reports transfer bytes; queued/processing status is polled separately. Content signature is validated during upload and FFprobe validates streams, duration and dimensions in the worker. Select a previously processed video to reuse it. Set title, image alt text, GIF/JPEG, CTA label, alignment, width, background and corners. Height preserves the source aspect ratio. The cyan/navy defaults are #22c8e5 and #003258.

Save landing-page copy and CTA explicitly. Landing settings are shared by every campaign using that video. To use different copy for the same source, upload another video record. GIF timing is set per upload; failed jobs can retry with corrected timing. Ready assets are immutable so delivered emails retain their previews. Media deletion requires explicit confirmation and revokes landing/media routes immediately; cached derivatives may persist for five minutes. Analytics records remain. Sending a saved campaign checks that all its video assets are still ready.

Use the existing desktop/mobile live preview, save the draft, and use its existing Preview/test-email action. That action uses the configured admin address and existing delivery infrastructure. Never send a campaign merely to test rendering.

## Tracking and compatibility

Real campaign links retain the existing click redirect and add the campaign ID to the video landing URL. Video analytics count landing requests from campaign links as clicks; existing CRM click statistics remain untouched. Direct/test visits have campaign ID zero. Signed, expiring page tokens bound to the video, campaign and random page session validate playback events. A unique database key deduplicates each event type per page session. Visits are emitted when the page is visible; plays and 25/50/75/100 milestones come from HTML5 playback. Completion describes playback position (including seeking), not verified watch time. Refreshing creates a new session; these are not unique people or recipient-level attribution.

Known scanner user agents and prefetch headers mark activity as suspected automation, which the dashboard displays separately. Undetected scanners remain in unflagged counts; human activity is not guaranteed. Public metrics can be manipulated by clients and should not be used as a security or billing signal.

Email HTML uses presentation tables, inline styles, bounded image widths, descriptive alt text and a text CTA. It does not embed video. The centered play cue is burned into the JPEG and every GIF frame, so Outlook versions displaying only the first frame still have a usable preview. Gmail, Apple Mail and mobile clients can follow the same HTTPS landing links. Actual rendering must still be checked in real clients; a browser preview is not email-client certification. GIF optimization progressively reduces dimensions, frame rate and palette until below 1 MB where practical; the UI recommends JPEG if the budget is exceeded.

## Validation

`npm run test:video --prefix apps/api` covers actual FFmpeg transformations and invalid range rejection, email safety and tracking/unsubscribe preservation, event signatures, scanner signals, send guards, authenticated HTTP routes, upload validation and public media boundaries. HTTP tests use a database double, not a live MySQL server. `npm run build --prefix apps/web` verifies integration.

A synthetic four-second 640×360 source generated a three-second GIF of 364,779 bytes during validation. The subsequently supplied Thanksgiving asset `1125(1).mp4` (25.867 seconds, 1080×1920 HEVC/AAC, 23,052,762 bytes) was processed with the production processing module using seconds 0–3. Its GIF is 493,633 bytes (240×426, 15 frames, exactly three seconds); the full H.264/AAC MP4 is 8,836,679 bytes. The JPEG play overlay was visually checked, and the optimized MP4 passed full decoding and fast-start atom-order verification. Local test artifacts are in `/workspace/video-campaign-test/thanksgiving`; they have not been published or registered in a live CRM database. No live database configuration was available, so migration execution, worker/database integration, actual delivery and Gmail/Outlook/Apple Mail device checks remain deployment acceptance steps.

Validation limitations: Playwright Chromium installation was blocked by the environment's outbound policy (`cdn.playwright.dev`: HTTP 403, Domain forbidden), so browser interaction checks could not run. Targeted frontend lint and the production build passed; the build retains its existing large-chunk warning.

Authentication inspection: new video management and analytics routes use both the existing JWT middleware and database-backed `requireAdmin`. The inspected legacy CRM router is mounted without those middleware checks in this repository; this implementation does not change its existing access behavior. Deployment should verify whether the hosting layer supplies the intended protection for those legacy routes.


### cPanel worker troubleshooting

The setup script requires the host to provide FFmpeg/FFprobe and `crontab`. It does not install OS packages or download an unverified executable. If preflight fails, ask hosting support to install FFmpeg with libx264/AAC/GIF/MJPEG support, or configure absolute `FFMPEG_PATH` and `FFPROBE_PATH` values in `apps/api/.env`, then rerun `bash "$HOME/EVOBRAND/apps/api/scripts/setup-video-worker.sh"`. The database migration runs before preflight, so missing binaries do not prevent creation of the tables. The deployed API also initializes the schema before video requests. Database credentials must allow CREATE TABLE, matching the existing CRM initialization model.

Check `crontab -l` for `EVOBRAND_VIDEO_WORKER`. Worker errors are logged outside the public web root in `apps/api/video-worker.log`. Each cron invocation processes at most one job; larger queues may take several minutes. Failed jobs remain available for explicit retry. To disable this mode, remove only the cron line ending with `# EVOBRAND_VIDEO_WORKER`. cPanel setup, hosting binaries and database privileges still require verification on the live server; local tests cannot establish their availability.


### Shared-host encoder failures

The initial live worker reached FFmpeg but failed to open libx264. Decoder thread settings do not limit encoder threads. The processing command now separately caps decoder/encoder threads at two, filter threads at one, and x264 lookahead threads at one. Web output fits within 1280×1280 (portrait 1080×1920 becomes 720×1280), keeping its aspect ratio and avoiding upscaling. Preflight also performs an actual short H.264 encode; it no longer relies only on an encoder listing. These changes reduce shared-host resource demands, but the original log alone cannot prove the hosting limit responsible. Retry the failed record after deployment; stage-specific errors and the server log now preserve the next failure reason if one remains.

The revised command was retested on the uploaded 25.867-second Thanksgiving source: full conversion succeeded at 720×1280, with the three-second GIF still 493,633 bytes. All 12 automated tests, the local H.264 preflight, targeted frontend lint and production frontend build passed. Live-host retry remains the verification of whether the encoder resource change resolves its failure.
