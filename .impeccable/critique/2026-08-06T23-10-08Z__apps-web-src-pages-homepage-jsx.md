---
target: the EVOBRAND app (homepage-led)
total_score: 18
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 3
timestamp: 2026-08-06T23-10-08Z
slug: apps-web-src-pages-homepage-jsx
---
Method: dual-agent (A: a074d8e0e236f5cc1 · B: ae1a884319af0c0c3)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Auditor step indicator, booking wizard, and footer form all give clear feedback |
| 2 | Match System / Real World | 3 | Agency/gov-literate language; some AI jargon ("agentic," "RAG," "NIST AI RMF") outpaces a first-time SMB visitor |
| 3 | User Control and Freedom | 2 | No visible "back" in AuditorSection step 2; GSAP-pinned horizontal scroll in `AICapabilities.jsx` hijacks scroll direction on desktop |
| 4 | Consistency and Standards | 2 | Two conflicting stat blocks (10x/80%/5x/95% vs. 680+/975+/98%/26yrs); hero CTA links to `/audit`, router only defines `/auditor` |
| 5 | Error Prevention | 2 | Auditor validates before advancing, but newsletter form has no email-format check; detector found low-contrast and undersized text across pages |
| 6 | Recognition Rather Than Recall | 3 | Persistent nav and sticky header reduce recall burden |
| 7 | Flexibility and Efficiency | n/a | Persuade-mode marketing site — no power-user path expected |
| 8 | Aesthetic and Minimalist Design | 1 | 9 major homepage sections, 6+ distinct CTA destinations, detector logged 173 anti-pattern hits on the homepage alone (mostly `ai-color-palette` cyan-glow repetition) |
| 9 | Error Recovery | 2 | Auditor error is a plain-text "fill in all fields" with no field-level highlighting |
| 10 | Help and Documentation | n/a | Not applicable to a persuasive marketing site |
| **Total** | | **18/32** | **Acceptable (56%)** |

*Aesthetic score lowered from the design-review agent's initial 2 to 1 after weighing the detector's volume of findings (173/112/87/94 anti-patterns across home/services/about/contact) — this is a systemic, not incidental, pattern.*

## Design Specificity Verdict

**LLM assessment**: Genuinely EVOBRAND-authored at the copy and product layer — real proof points (Caltrans, SBE/WBE/MBE certification, Section 508, FedRAMP-Ready), proprietary product names (ChamberCore, Vibe Hyr, PrimeReach), and a working multi-step Brand Auditor tool plus a live booking calendar. This is well past a swapped-logo template. It slips toward category-interchangeable at the *visual* layer: emoji used as the icon system, and one accent color (`#22c8e5` cyan) applied uniformly to every card, button, glow, and stat — a look shared by countless 2025 AI-agency sites.

**Deterministic scan**: The detector confirms this at scale rather than as a one-off impression. `ai-color-palette` ("cyan neon text on dark background," "cyan gradient background") was the single most frequent finding across all four pages checked, alongside `dark-glow` (zero-offset colored box-shadows in the same cyan/`#0057b8` blue). 8 CLI findings also surfaced in source: `overused-font` (Inter/Open Sans/Montserrat stacking, 4 instances), `border-accent-on-rounded` (3 instances, 1 likely false positive on a loading spinner), and `side-tab` (1 instance in the PDF export). Browser evidence additionally caught `undersized-ui-text` (several accessibility-widget labels at 9.9–10.6px, ironic given the site's Section 508 claims), `low-contrast` (worst pairs at 1.5:1 and 1.9:1), `text-overflow` (nav/footer links and a button overflowing containers by 23–67px), and `tight-leading`.

**Visual overlays**: Live-detector injection succeeded; no persistent human-facing overlay tab was kept open past the check (live-server was stopped per protocol). Findings above are read from the console evidence Assessment B captured live on `/`, `/services`, `/about`, and `/contact`.

## Overall Impression

EVOBRAND has real substance — verifiable government/enterprise credentials and a genuinely narrative hero — but the execution reaches for the same AI-agency visual shorthand (cyan glow, emoji icons, glassy cards) that hundreds of competitors also use, and the homepage asks for six-plus different next actions before a visitor has decided on one. The single biggest opportunity: let the credentials do more visual work than the color palette does, and cut the page down to one clear next step.

## What's Working

- **ScrubSection hero**: a scroll-synced 4-chapter narrative ("Before EVOBRAND, you had a website" → "Your brand. Fully evolved.") built on real proof points, not stock copy — genuinely above the category norm.
- **AuditorSection's 2-step inline form**: reduces commitment by asking easy questions first (business/industry/years) before harder ones, with a sample-score preview to set expectations — solid progressive disclosure.
- **Accessibility intent visible in code**: `aria-label`s and `sr-only` labels on auditor inputs, `prefers-reduced-motion` handled in `CountStat`/`StatCounter`/the slide-in — undercut somewhat by the undersized-text and low-contrast findings above, but the intent and scaffolding are real.

## Priority Issues

- **[P0] Dead hero CTA**: `ScrubSection.jsx:222` links "Free Brand Audit" to `/audit`; the router only registers `/auditor`. A first-time visitor's second hero click 404s.
  **Why it matters**: This is the top-of-funnel CTA on the site's flagship narrative section — the worst possible place for a broken link.
  **Fix**: Point the link at `/auditor` (or add an `/audit` redirect route).
  **Suggested command**: `/impeccable harden`

- **[P1] Conflicting trust stats**: The homepage stats banner (10x/80%/5x/95%) and `AICapabilities.jsx`'s stats (680+ clients/975+ projects/98%/26 years) present different, unreconciled numbers minutes apart in the same scroll.
  **Why it matters**: A skeptical enterprise/government buyer — exactly who "FedRAMP-Ready" and "Caltrans" claims are meant to attract — will notice the mismatch and it undercuts the credibility the copy is working hard to build.
  **Fix**: Reconcile into one stat set, or clearly differentiate what each block measures.
  **Suggested command**: `/impeccable clarify`

- **[P1] Systemic cyan-glow sameness**: Detector logged `ai-color-palette` and `dark-glow` as the top finding on every page checked (173 total anti-patterns on the homepage alone).
  **Why it matters**: This is the main thing pulling "authored for EVOBRAND" down toward "generic AI-agency template" — it's a volume problem, not a one-off.
  **Fix**: Reserve the cyan glow for 1-2 genuine emphasis moments per page instead of applying it to every card/button/stat.
  **Suggested command**: `/impeccable distill`

- **[P1] Emoji-as-iconography**: `ServicesBuiltForScale.jsx`, `AICapabilities.jsx`, and the Video Library titles lean on emoji (⚡🤖✨🎨🎬🛡️🔇🎭🌊🚀👑💙📦) in place of a real icon/illustration system.
  **Why it matters**: Reads as placeholder/unfinished next to "government-grade," "FedRAMP-Ready" positioning — a visible polish gap right where credibility matters most.
  **Fix**: Replace with a consistent icon set (Lucide is already a dependency).
  **Suggested command**: `/impeccable typeset`

- **[P2] Nav and CTA overload**: `Header.jsx` exposes 7 nav links + 2 buttons (9 choices) with no grouping; by the page bottom a visitor has seen 6+ distinct CTA destinations (services, book-consultation, our-work, auditor, free-demo-portal, contact), and the homepage itself runs 9 major sections.
  **Why it matters**: Cognitive-load checklist failed on chunking, one-thing-at-a-time, and minimal-choices — visitors are asked to decide "what's next" too many times before any single ask is resolved.
  **Fix**: Group secondary nav items, pick one primary CTA per section, cut redundant sections.
  **Suggested command**: `/impeccable distill`

## Persona Red Flags

**Jordan (First-Timer)**: Lands on the hero unsure whether "Free Brand Audit" or "See Our Work" is the right first click; the audit link 404s. Mid-scroll, the `DemoPortalCTASlideIn` popup interrupts the strongest narrative moment on the site (it fires at 600px scroll or 6s, landing inside the scroll-scrubbed hero chapters). By the bottom, four different offers (Explore Services / Get Started Today / Book a Strategy Call / Book Free Consultation) compete with no signaled "best next step." High abandonment risk.

**Casey (Mobile)**: `AICapabilities.jsx` correctly disables its horizontal pin-scroll on mobile — good adaptive behavior — but the page is still very long (500vh hero + 8 more sections). The booking widget's calendar grid will be cramped at 375px. Detector-confirmed `undersized-ui-text` (9.9–10.6px labels on the accessibility widget) and `text-overflow` (nav/footer links, a form button) will be worse on small screens, and the fixed-position demo slide-in risks overlapping the accessibility widget the code explicitly tried to avoid ("bottom-left, not bottom-right, to stay clear of the accessibility widget") — worth checking at narrow viewports since both are corner-anchored.

**Riley (Stress-Tester)**: Rapid double-clicking through the auditor's step transition, or resizing mid-pin-scroll in `AICapabilities.jsx`, targets a known-fragile class of GSAP ScrollTrigger bug (stale distance measurements) — `invalidateOnRefresh: true` is set but only mitigates, doesn't eliminate, this.

## Minor Observations

- `text-white/20` / `text-white/30` utility classes on dark backgrounds (e.g. "Free · Takes 4 minutes · No credit card") likely fail WCAG AA contrast — confirmed by the detector's `low-contrast` findings (worst pairs 1.5:1 and 1.9:1).
- Video Library titles stack trailing emoji (🔇🎭🌊🚀👑💙📦⚡) across a dozen entries — cute individually, noisy in aggregate for an enterprise-facing brand.
- "26 Years of Innovation" sits oddly next to modern-AI-agency and FedRAMP/gov-contractor claims — worth confirming the number is accurate, since an inflated tenure claim is a specific credibility risk when pursuing government contracts.
- `AuditPDF.jsx` and `index.css` both introduce extra font families (Inter, Open Sans, Montserrat as fallback) beyond the primary brand font — mostly low-stakes, but worth consolidating.
