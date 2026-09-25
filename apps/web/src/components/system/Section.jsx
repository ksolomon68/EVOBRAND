import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useHeadlineReveal, useLedgerReveal } from '@/components/system/motionHooks.js';

/**
 * Section rhythm used across the marketing pages:
 * short label, two-part headline with an emphasized second half,
 * supporting copy, then proof (children).
 */

export function Eyebrow({ children, className = '', ...rest }) {
  return <p className={`evo-eyebrow ${className}`} {...rest}>{children}</p>;
}

export function SectionHeading({
  label,
  lead,
  emphasis,
  intro,
  as: Heading = 'h2',
  display = false,
  reveal = true,
  id,
  className = '',
  children,
}) {
  const rootRef = useRef(null);
  useHeadlineReveal(rootRef, reveal);
  return (
    <div ref={rootRef} className={`grid gap-space-m ${className}`}>
      {label && <Eyebrow data-reveal-extra>{label}</Eyebrow>}
      <Heading
        id={id}
        data-reveal-heading
        className={`evo-heading ${display ? 'evo-heading--display' : ''}`}
      >
        <span data-reveal-lead className="block">{lead}</span>
        {emphasis && (
          <>
            {' '}
            <em data-reveal-emphasis>{emphasis}</em>
          </>
        )}
      </Heading>
      {intro && <p className="evo-intro" data-reveal-extra>{intro}</p>}
      {children && <div data-reveal-extra>{children}</div>}
    </div>
  );
}

// Full class names written out so Tailwind keeps them in the build.
const TONES = {
  ink: 'evo-block--ink',
  deep: 'evo-block--deep',
  slate: 'evo-block--slate',
  navy: 'evo-block--navy',
};

export function Section({
  id,
  tone = 'ink',
  label,
  lead,
  emphasis,
  intro,
  children,
  className = '',
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={lead ? headingId : undefined}
      className={`evo-block ${TONES[tone] || TONES.ink} ${className}`}
    >
      <div className="evo-container">
        {lead && (
          <SectionHeading
            id={headingId}
            label={label}
            lead={lead}
            emphasis={emphasis}
            intro={intro}
          />
        )}
        {children && <div className={lead ? 'mt-space-xl' : ''}>{children}</div>}
      </div>
    </section>
  );
}

/**
 * Credential ledger: proof points set like an official record.
 * items: [{ value: '1999', label: 'Established' }, { value: 25, suffix: '+ years', label: 'In operation', count: true }]
 * Items with `count: true` must have a numeric value; they tick up when revealed.
 */
export function ProofLedger({ items, reveal = true, className = '' }) {
  const rootRef = useRef(null);
  useLedgerReveal(rootRef, reveal);
  return (
    <dl ref={rootRef} className={`evo-ledger ${className}`}>
      {items.map((item) => {
        const digits = String(item.value).length;
        return (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>
              <span className="evo-mask">
                <span className="evo-mask-inner">
                  {item.count ? (
                    <>
                      <span
                        className="evo-count"
                        style={{ minWidth: `${digits}ch` }}
                        data-count-to={item.value}
                      >
                        {item.value}
                      </span>
                      {item.suffix}
                    </>
                  ) : (
                    item.value
                  )}
                </span>
              </span>
            </dd>
            <span className="evo-ledger-rule" aria-hidden="true" />
          </div>
        );
      })}
    </dl>
  );
}

// Full class names written out so Tailwind keeps them in the build.
const BUTTON_VARIANTS = {
  primary: 'evo-btn evo-btn--primary',
  secondary: 'evo-btn evo-btn--secondary',
};

/** Internal routes use the router; everything else is a plain link. */
export function ButtonLink({ to, variant = 'primary', children, className = '', ...rest }) {
  const classes = `${BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary} ${className}`;
  // Same-page anchors go through the router too, so ScrollToTop can glide there.
  if ((to.startsWith('/') && !to.startsWith('//')) || to.startsWith('#')) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={to} className={classes} {...rest}>
      {children}
    </a>
  );
}
