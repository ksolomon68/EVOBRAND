# Campaign readiness and editor workspace

The existing React block editor, campaign JSON storage, email shell, recipient selection, unsubscribe behavior, SMTP/Resend infrastructure and brand colors are retained. No dependencies or database migrations are added.

## Workspace

Compose email and Preview & readiness are separate full-width tabs that retain the current draft and continue to update the preview. Block types form a wrapping toolbar above the canvas; design controls are above the canvas too. Text fields are taller. Use the grip handle to drag, the larger insertion gaps to drop, or the Move up/Move down buttons for keyboard/touch reordering. Editing text no longer drags the whole card.

## Scoring and copy review

`campaignReadiness.js` checks visible authored fields instead of serialized IDs, URLs and styling. Contextual heuristics flag promotional combinations such as claims/prizes plus urgency, not single words in isolation. Findings include the exact matched phrase, normalized visible-text character positions, field/block location, surrounding sentence and a recommendation. The brand sentence “We automate the mundane to free the human spirit.” is recognized, including inline formatting; additional promotional sentences in the same block are still assessed. These are explainable heuristics, not a statistical spam classifier or a promise about provider filtering.

Critical checks cover absent subject/content/audience, malformed destinations and missing media sources. Subject length, copy, alt text and CTA guidance are advisory. Buttons, linked images, video previews, event links and text links count as CTAs. Multiple CTAs are allowed. Newsletter and holiday modes do not require a CTA; promotion mode recommends one. Purpose is stored in existing block JSON (`readinessPurpose`) when blocks exist and is saved with the draft.

Score = passed assessed weight / all assessed weight, rounded to a percentage. Critical checks weigh 5; advisories weigh 1. Unknown checks are excluded and their count is displayed alongside the score. The score and findings recalculate with edits. Server responses are tied to the exact subject/content snapshot so older results do not certify newly edited content. Recommendations and unverified results do not introduce a new send-blocking workflow; existing save/send validation, subscribed-recipient filtering and video availability guards remain in force. A high score does not guarantee sending success, delivery or inbox placement.

## Technical checks

The new POST `/api/crm/readiness` (also `/crm/readiness` for Passenger) requires the existing JWT and database-backed admin check. No test or campaign email is sent by this endpoint. It renders the actual outgoing shell with a synthetic recipient to check its HTTPS unsubscribe link and show the generated plain-text alternative. It checks configured sender-address format and transport availability, but labels provider ownership and actual delivered authentication unverified.

SPF TXT publication is checked at `MAIL_FROM_DOMAIN` if configured, otherwise the visible sender domain. Duplicate SPF records and `+all` are flagged; full recursive SPF evaluation, sending-IP authorization and envelope alignment are not claimed. DMARC checks look for a direct policy; absent records remain unverified because parent-domain inheritance is not evaluated. DKIM requires `DKIM_SELECTORS` (comma-separated provider selectors, max five) and checks published public keys via DNS. CNAME-following depends on the DNS resolver. DNS timeouts remain unknown, not passes. These checks do not prove that outgoing messages are signed or aligned. A test message's Authentication-Results header is still the appropriate end-to-end confirmation.

Link reachability and image sizes are explicit, opt-in HEAD checks (up to 20 unique URLs, four at a time, five-second timeouts, three redirects). Private/local/reserved IPs, credentials, non-HTTP(S) schemes and nonstandard ports are rejected; DNS results are pinned per request and every redirect is revalidated. Unsubscribe, opt-out, campaign tracking and video landing/event URLs are skipped to avoid side effects and analytics pollution. No GET fallback is used. Other action URLs cannot be inferred universally; checks are opt-in for this reason. 404/410 is a broken-link advisory. Other failures, bot blocks, HEAD rejection or missing size headers stay unverified with manual-check instructions. Images over 1 MB get compression/JPEG guidance. Rendered image alt attributes are checked, including inline HTML; decorative images may intentionally have empty alt text.

`campaignMessage` generates HTML and a plain-text alternative from the same shell, retaining destinations and the recipient-specific unsubscribe link. Campaign and test sends pass both parts to SMTP and Resend; unrelated email callers retain their existing behavior. Text conversion targets this controlled template rather than implementing a general-purpose HTML parser.

## Landing page

The public video page now uses the existing official `/logo.png` asset, an EVOBRAND navy/cyan background, a prominent escaped title, an aspect-preserving player, campaign copy and a CTA. The editor has an explicit Video title on landing page field and Save landing page confirmation. Update an existing placeholder title there; email titles and shared public page titles can differ. Landing settings still apply to all campaigns reusing that media. Playback tracking and public URLs are preserved.

## Validation

Run `node --test apps/api/src/readiness/*.test.js apps/api/src/video/*.test.js` from the repository root. Tests cover copy contexts and locations, approved brand copy, CTA types/purpose, score changes, text email parts for both transports, DNS states, network destination protections, admin access, link/image results and the existing video suite. Browser checks use mocked API responses and verify full-width layout, retained draft state, reordering, contextual findings, title saving and mobile layout. They do not send real email or establish live DNS/provider configuration.

Final local validation: 23 automated tests passed, targeted frontend lint passed, and the production frontend build passed. Headless Chromium verified native drag reordering, arrow reordering, draft preservation between tabs, desktop/mobile layout, contextual copy findings, title saving and the official logo. Browser API responses and transport calls were mocked; live DNS, provider authentication and deployed rendering remain separate verification steps.
