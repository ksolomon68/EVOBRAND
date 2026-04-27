import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'evobrand-a11y';

const defaultSettings = {
  highContrast: false,
  darkMode: false,
  invertColors: false,
  largeFonts: false,
  dyslexiaFont: false,
  highlightLinks: false,
  stopAnimations: false,
  bigCursor: false,
};

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : { ...defaultSettings };
  } catch {
    return { ...defaultSettings };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch { }
}

function applySettings(settings) {
  const root = document.documentElement;
  root.style.filter = [
    settings.highContrast ? 'contrast(1.5)' : '',
    settings.invertColors ? 'invert(1) hue-rotate(180deg)' : '',
  ].filter(Boolean).join(' ');

  root.style.fontSize = settings.largeFonts ? '120%' : '';

  document.body.style.fontFamily = settings.dyslexiaFont
    ? '"OpenDyslexic", "Comic Sans MS", cursive'
    : '';

  document.body.classList.toggle('a11y-dark', settings.darkMode);
  document.body.classList.toggle('a11y-highlight-links', settings.highlightLinks);
  document.body.classList.toggle('a11y-stop-animations', settings.stopAnimations);
  document.body.classList.toggle('a11y-big-cursor', settings.bigCursor);
}

// Inject global styles once
const styleId = 'a11y-widget-styles';
if (!document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    body.a11y-dark { background: #111 !important; color: #f0f0f0 !important; }
    body.a11y-highlight-links a { outline: 3px solid #ff0 !important; text-decoration: underline !important; }
    body.a11y-stop-animations *, body.a11y-stop-animations *::before, body.a11y-stop-animations *::after {
      animation: none !important; transition: none !important;
    }
    body.a11y-big-cursor, body.a11y-big-cursor * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M5 3l19 13-8 1-4 9z' fill='%23000' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") 5 3, auto !important; }
  `;
  document.head.appendChild(style);
}

const features = [
  { key: 'highContrast', label: 'High Contrast', icon: '◑' },
  { key: 'darkMode', label: 'Dark Mode', icon: '🌙' },
  { key: 'invertColors', label: 'Invert Colors', icon: '⬤' },
  { key: 'largeFonts', label: 'Large Text', icon: 'A+' },
  { key: 'dyslexiaFont', label: 'Dyslexia Font', icon: 'Aa' },
  { key: 'highlightLinks', label: 'Highlight Links', icon: '🔗' },
  { key: 'stopAnimations', label: 'Stop Animations', icon: '⏸' },
  { key: 'bigCursor', label: 'Large Cursor', icon: '↖' },
];

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    applySettings(settings);
    saveSettings(settings);
  }, [settings]);

  function toggle(key) {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function reset() {
    setSettings({ ...defaultSettings });
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Accessibility options"
        title="Accessibility options"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #22c8e5, #1ba3c0)',
          color: '#111',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
        }}
      >
        ♿
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Accessibility settings"
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '24px',
            zIndex: 99998,
            width: '280px',
            background: '#1a1a1a',
            border: '1px solid #22c8e5',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #22c8e5, #1ba3c0)',
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontWeight: 700, color: '#111', fontSize: '15px' }}>
              ♿ Accessibility
            </span>
            <button
              onClick={reset}
              style={{
                background: 'rgba(0,0,0,0.15)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                color: '#111',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Reset
            </button>
          </div>

          {/* Options grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            padding: '14px',
          }}>
            {features.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => toggle(key)}
                aria-pressed={settings[key]}
                style={{
                  background: settings[key]
                    ? 'rgba(34,200,229,0.12)'
                    : '#2a2a2a',
                  border: settings[key] ? '1.5px solid #22c8e5' : '1.5px solid #444',
                  borderRadius: '10px',
                  padding: '10px 8px',
                  cursor: 'pointer',
                  color: settings[key] ? '#22c8e5' : '#aaa',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          <div style={{
            textAlign: 'center',
            padding: '0 14px 12px',
            fontSize: '11px',
            color: '#555',
          }}>
            Settings are saved automatically
          </div>
        </div>
      )}
    </>
  );
}
