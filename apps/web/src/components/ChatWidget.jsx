import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ── EVOBRAND color tokens to match the site ── */
const VARS = `
  .evo-chat {
    --bg:            #0d1724;
    --surface:       rgba(255,255,255,0.04);
    --surface-solid: #101b2b;
    --border:        rgba(255,255,255,0.09);
    --border-strong: rgba(255,255,255,0.16);
    --ink:           #f0f4f8;
    --ink-soft:      rgba(240,244,248,0.60);
    --accent:        #22c8e5;
    --accent-dark:   #1ba3c0;
    --accent-ink:    #003258;
    --accent-wash:   rgba(34,200,229,0.12);
    --accent-border: rgba(34,200,229,0.28);
    --whatsapp:      #25D366;
    --whatsapp-ink:  #06210F;
    --shadow:        rgba(0,0,0,0.50);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
`;

/* ── EVOBRAND-specific FAQ ── */
const QUESTIONS = [
  {
    q: 'What does EVOBRAND build?',
    a: 'EVOBRAND builds websites, custom applications, client portals, and AI-powered workflows for businesses and organizations. Everything is designed to make your business easier to run — and easier for customers to choose.',
  },
  {
    q: 'How much does a project cost?',
    a: "Every project is scoped individually based on your goals, timeline, and complexity. We don't do one-size-fits-all pricing. Book a free strategy call and we'll give you a clear picture within 24 hours.",
  },
  {
    q: 'Can you build a custom dashboard or portal?',
    a: 'Yes — that\'s a core strength. We\'ve built workforce portals, membership platforms, operations dashboards, and AI-assisted client portals. View live demos at evobrand.net/our-work.',
  },
  {
    q: 'Do you work with nonprofits and government agencies?',
    a: 'Absolutely. We have deep experience with nonprofits, chambers of commerce, workforce development programs, and government contracting platforms like PrimeReach and Caltrans BizConnect.',
  },
  {
    q: 'How do I get started?',
    a: "Book a strategy call at evobrand.net/book-consultation. We'll understand your goals, walk through your options, and give you a no-pressure roadmap. It's free and there's no commitment.",
  },
  {
    q: 'Do you offer AI and automation services?',
    a: 'Yes. We build custom AI workflows, document automation, AI-powered chatbots, and intelligent portals. If your team is doing repetitive tasks or losing time to manual processes, we can help fix that.',
  },
  {
    q: 'How long does a typical project take?',
    a: 'Simple websites typically launch in 2–4 weeks. Custom applications and portals range from 6–16 weeks depending on scope. We give you a clear timeline during scoping — no vague estimates.',
  },
  {
    q: "What's included in the client portal?",
    a: 'Every client gets access to a private portal where you can track project progress, review deliverables, sign agreements, and communicate with your project team — all in one place.',
  },
];

/* ── Icons ── */
const IconChat = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconWhatsApp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.1-1.34A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm0 18a7.9 7.9 0 0 1-4.03-1.1l-.29-.17-3 .79.8-2.92-.19-.3A7.94 7.94 0 1 1 12 20Zm4.36-5.96c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
  </svg>
);

const WHATSAPP_NUMBER = '12145314427';

/* ── Message types ── */
const VIEW = { GREET: 'greet', ANSWER: 'answer', HANDOFF: 'handoff' };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(VIEW.GREET);
  const [active, setActive] = useState(null); // current answered question
  const [resolved, setResolved] = useState(false);
  const bodyRef = useRef(null);

  // Inject CSS vars once
  useEffect(() => {
    if (document.getElementById('evo-chat-vars')) return;
    const style = document.createElement('style');
    style.id = 'evo-chat-vars';
    style.textContent = VARS;
    document.head.appendChild(style);
  }, []);

  // Scroll to bottom whenever view/content changes
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [view, active, resolved, open]);

  const handleOpen = () => {
    setOpen(true);
    setView(VIEW.GREET);
    setResolved(false);
    setActive(null);
  };

  const handleAnswer = useCallback((item) => {
    setActive(item);
    setResolved(false);
    setView(VIEW.ANSWER);
  }, []);

  const handleResolved = () => setResolved(true);
  const handleHandoff = () => setView(VIEW.HANDOFF);
  const handleBack = () => { setView(VIEW.GREET); setActive(null); setResolved(false); };

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'm on the EVOBRAND site and need help beyond what the assistant could answer.")}`;

  return (
    <div className="evo-chat" style={{ position: 'fixed', bottom: 20, right: 24, zIndex: 99997, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>

      {/* ── Panel ── */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="EVOBRAND Assistant"
          style={{
            width: 368,
            maxWidth: 'calc(100vw - 40px)',
            height: 520,
            maxHeight: '72vh',
            background: 'var(--surface-solid)',
            border: '1px solid var(--border-strong)',
            borderRadius: 16,
            boxShadow: '0 20px 50px var(--shadow)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid var(--border)',
            color: 'var(--ink)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            {/* Avatar */}
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--accent-wash)',
              border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)', flexShrink: 0,
            }}>
              <IconChat />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.96rem', fontFamily: "'Playfair Display', Georgia, serif" }}>
                EVOBRAND Assistant
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                Online now
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer', padding: 4, display: 'flex' }}
            >
              <IconClose />
            </button>
          </div>

          {/* Body */}
          <div
            ref={bodyRef}
            style={{
              flex: 1, overflowY: 'auto', padding: 16,
              display: 'flex', flexDirection: 'column', gap: 12,
              background: 'var(--bg)',
            }}
          >
            {/* ── Greet view ── */}
            {view === VIEW.GREET && (
              <>
                <BotMsg>
                  Hi, I'm the EVOBRAND Assistant. I can answer questions about our services, process, and past work — or connect you directly with our team.
                </BotMsg>
                <Chips>
                  {QUESTIONS.map((item) => (
                    <Chip key={item.q} onClick={() => handleAnswer(item)}>{item.q}</Chip>
                  ))}
                  <Chip escalate onClick={handleHandoff}>Talk to a real person</Chip>
                </Chips>
              </>
            )}

            {/* ── Answer view ── */}
            {view === VIEW.ANSWER && active && (
              <>
                <UserMsg>{active.q}</UserMsg>
                <BotMsg>{active.a}</BotMsg>
                {!resolved ? (
                  <Chips>
                    <Chip onClick={handleResolved}>That answered it ✓</Chip>
                    <Chip onClick={handleBack}>Ask something else</Chip>
                    <Chip escalate onClick={handleHandoff}>Talk to a real person</Chip>
                  </Chips>
                ) : (
                  <BotMsg>
                    Glad that helped. Feel free to ask anything else — or{' '}
                    <a href="/book-consultation" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                      book a strategy call
                    </a>{' '}
                    when you're ready.
                  </BotMsg>
                )}
              </>
            )}

            {/* ── Handoff view ── */}
            {view === VIEW.HANDOFF && (
              <>
                <BotMsg>
                  No problem — let's get you to a real person on our team. You can reach us on WhatsApp or book a call directly.
                </BotMsg>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--ink)' }}>
                    Reach our team
                  </div>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                    We'll pick up where the chat left off. No repeating yourself.
                  </p>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', padding: '10px 18px',
                      border: 'none', cursor: 'pointer', textDecoration: 'none',
                      background: 'var(--whatsapp)', color: 'var(--whatsapp-ink)',
                    }}
                  >
                    <IconWhatsApp /> Message us on WhatsApp
                  </a>
                  <a
                    href="/book-consultation"
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', padding: '10px 18px',
                      border: '1.5px solid var(--accent-border)', cursor: 'pointer', textDecoration: 'none',
                      background: 'var(--accent-wash)', color: 'var(--accent)',
                    }}
                  >
                    Book a free strategy call
                  </a>
                </div>
                <button
                  onClick={handleBack}
                  style={{
                    background: 'none', border: 'none', color: 'var(--accent)', fontFamily: 'inherit',
                    fontSize: '0.84rem', textDecoration: 'underline', cursor: 'pointer',
                    alignSelf: 'flex-start', padding: 0,
                  }}
                >
                  ← Back to chat
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '8px 16px', borderTop: '1px solid var(--border)',
            fontSize: '0.72rem', color: 'var(--ink-soft)', textAlign: 'center',
          }}>
            EVOBRAND Concepts · <a href="https://evobrand.net" style={{ color: 'var(--accent)', textDecoration: 'none' }}>evobrand.net</a>
          </div>
        </div>
      )}

      {/* ── Launcher button ── */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        aria-label={open ? 'Close EVOBRAND Assistant' : 'Open EVOBRAND Assistant'}
        aria-expanded={open}
        style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
          border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(34,200,229,0.45)',
          transition: 'transform 0.2s, background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? <IconClose /> : <IconChat />}
      </button>
    </div>
  );
}

/* ── Tiny sub-components ── */
function BotMsg({ children }) {
  return (
    <div style={{
      maxWidth: '84%', padding: '10px 13px', borderRadius: 12,
      fontSize: '0.89rem', lineHeight: 1.55,
      alignSelf: 'flex-start',
      background: 'var(--surface)', border: '1px solid var(--border)',
      color: 'var(--ink)', borderBottomLeftRadius: 4,
    }}>
      {children}
    </div>
  );
}

function UserMsg({ children }) {
  return (
    <div style={{
      maxWidth: '84%', padding: '10px 13px', borderRadius: 12,
      fontSize: '0.89rem', lineHeight: 1.55,
      alignSelf: 'flex-end',
      background: 'var(--accent)', color: 'var(--accent-ink)',
      fontWeight: 600, borderBottomRightRadius: 4,
    }}>
      {children}
    </div>
  );
}

function Chips({ children }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignSelf: 'stretch' }}>
      {children}
    </div>
  );
}

function Chip({ children, onClick, escalate }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600,
        padding: '7px 13px', borderRadius: 999,
        border: `1.5px solid ${escalate ? 'var(--whatsapp)' : 'var(--border-strong)'}`,
        background: 'transparent',
        color: escalate ? 'var(--whatsapp)' : 'var(--ink)',
        cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = escalate ? 'rgba(37,211,102,0.1)' : 'var(--surface)';
        if (!escalate) e.currentTarget.style.borderColor = 'var(--accent-border)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        if (!escalate) e.currentTarget.style.borderColor = 'var(--border-strong)';
      }}
    >
      {children}
    </button>
  );
}
