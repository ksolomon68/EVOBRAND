---
target: the EVOBRAND app (homepage-led)
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-06T23-54-18Z
slug: apps-web-src-pages-homepage-jsx
---
Method: dual-agent (A: a899739e872ef9de1 · B: a83f71b389d28a9eb)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Scheduler/contact forms have excellent loading/error states; hero image sequence has no loading state |
| 2 | Match System / Real World | 3 | CST stated explicitly, holiday-aware calendar; "Trusted by 600+ Businesses" remains an unverifiable claim |
| 3 | User Control and Freedom | 3 | Scheduler has clean step nav; demo-portal slide-in now dismisses with session memory — improved |
| 4 | Consistency and Standards | 3 | Cyan used consistently, but the color constant is still literally named `GOLD` across 3 files — cosmetic tech-debt, not user-visible |
| 5 | Error Prevention | 3 | Booking/contact forms disable submit until valid, disable booked slots, honeypot field present |
| 6 | Recognition Rather Than Recall | 3 | Scheduler step indicator is clear; header nav still surfaces 9 choices at once at the `xl` breakpoint |
| 7 | Flexibility and Efficiency | n/a | Persuade-mode marketing site |
| 8 | Aesthetic and Minimalist Design | 2 | Homepage still stacks 8+ full-bleed sections before the final CTA |
| 9 | Error Recovery | 3 | Contact/scheduler surface human-readable errors, not raw API codes |
| 10 | Help and Documentation | n/a | Not applicable to a marketing site |
| **Total** | | **23/32** | **Good (72%)** |

## Design Specificity Verdict

**Mixed, leaning improved.** `AICapabilities.jsx` (FedRAMP-Ready, NIST AI RMF, govCloud) and the scheduler's holiday-aware blackout logic remain genuinely specific to EVOBRAND — no generic template ships that. But the hero's service list and the "Trusted by 600+ Businesses" headline still read as swappable AI-agency copy with no logos or proof directly beneath it. The detector confirms the visual layer is no longer the dominant problem: the static CLI scan is now clean of card/border slop outside one legitimate PDF-export template hit, and the live anti-pattern counts dropped substantially across every page (see trend below). What's left is a content/proof gap, not a visual-sameness one.

## Overall Impression

The visual "sameness" problem from the first pass is largely resolved — cyan is now a deliberate accent, not wallpaper, and the site's real differentiators (FedRAMP/government positioning, the scheduler's engineering) come through more clearly. The remaining ceiling is structural: too many sections, too many parallel "free" offers (Brand Audit, Demo Portal, Consultation) competing for the same click, and one unsubstantiated trust claim sitting where proof should be.

## What's Working

- **SchedulerWidget.jsx** — real disabled-state logic (blackout dates, holidays, weekends, fully-booked days), accessible `aria-pressed`/`aria-label` throughout, and a well-staged 5-step flow with a genuine emotional peak at success (formatted confirmation + one-click "Add to Google Calendar").
- **ContactPage.jsx's form** — honeypot spam field, file-size validation with clear messaging, service-conditional fields, real network-timeout handling instead of a generic failure.
- **AICapabilities.jsx copy** — specific, technically fluent (FedRAMP, govCloud, NIST AI RMF) language that actually differentiates EVOBRAND from a template agency.

## Priority Issues

- **[P1] Three competing "free" offers run concurrently**: Free Brand Audit, Free Demo Portal slide-in, and Free Consultation all compete for the same first-time visitor with no signaled priority.
  **Why it matters**: Diffuses conversion intent exactly where the first critique found "too many CTAs" — the fix that reduced cyan-glow sameness didn't touch offer count.
  **Fix**: Pick one primary free offer per page context; demote the others to secondary/footer placement.
  **Suggested command**: `/impeccable distill`

- **[P1] Unsubstantiated trust claim**: "Trusted by 600+ Businesses" (HomePage.jsx) has no logos, testimonial, or case-study link beneath it.
  **Why it matters**: Sits in the section meant to build credibility but reads as filler next to the government-grade claims the rest of the page earns with specifics.
  **Fix**: Add real client logos/case-study links, or remove the specific number if it can't be substantiated today.
  **Suggested command**: `/impeccable clarify`

- **[P2] Header nav still exposes 9 choices at once**: 7 links + 2 CTA buttons simultaneously visible at the `xl` breakpoint.
  **Why it matters**: Chunking guideline (≤4/group) still fails; this is the redesign this session deliberately deferred (only the overflow bug was fixed, not the information architecture).
  **Fix**: Group secondary links under a menu, keep only the primary CTA + 3-4 top links inline.
  **Suggested command**: `/impeccable distill`

- **[P2] Redundant conversion paths on /contact**: the full contact form and the full scheduler widget sit side by side, asking visitors to pick between two multi-field flows for the same goal.
  **Fix**: Make one path primary, demote the other to a link/toggle.
  **Suggested command**: `/impeccable distill`

- **[P3] `GOLD` constant is actually cyan** (SchedulerWidget.jsx, ContactPage.jsx, DemoPortalCTASlideIn.jsx) — not user-visible, but signals a past rebrand left the token names stale, a real risk for future edits.
  **Suggested command**: `/impeccable harden` (or a plain rename pass)

## Persona Red Flags

**Jordan (first-timer)**: Scrolls past 6 service cards, then a second 5-item "capabilities" section — by the booking CTA, Jordan has processed ~15 distinct value propositions with no clear "start here" signal.

**Riley (stress-tester)**: `ConfirmForm` accepts any `type="email"`-valid string with no format check beyond the browser default — a typo'd domain sails through silently. Clicking "Back" mid-flow after selecting a time slot resets the selection with no confirmation.

**Casey (mobile)**: The demo-portal slide-in spans nearly full width low on the screen and can obscure whatever CTA the visitor scrolled to, requiring an extra dismiss tap.

## Minor Observations

- Footer newsletter signup duplicates the contact form's own newsletter checkbox — two email-capture surfaces with no distinct value proposition between them.
- The Brand Auditor is functionally a third top-of-funnel free offer, on top of the two already named above.
- `AuditPDF.jsx`'s font/border findings are inside a PDF-export template users never see interactively — real but lower-priority than live-page findings.
