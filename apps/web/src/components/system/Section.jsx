import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Section rhythm used across the marketing pages:
 * short label, two-part headline with an emphasized second half,
 * supporting copy, then proof (children).
 */

export function Eyebrow({ children, className = '' }) {
  return <p className={`evo-eyebrow ${className}`}>{children}</p>;
}

export function SectionHeading({
  label,
  lead,
  emphasis,
  intro,
  as: Heading = 'h2',
  display = false,
  id,
  className = '',
}) {
  return (
    <div className={`grid gap-space-m ${className}`}>
      {label && <Eyebrow>{label}</Eyebrow>}
      <Heading id={id} className={`evo-heading ${display ? 'evo-heading--display' : ''}`}>
        {lead}
        {emphasis && (
          <>
            {' '}
            <em>{emphasis}</em>
          </>
        )}
      </Heading>
      {intro && <p className="evo-intro">{intro}</p>}
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
 * items: [{ value: '1999', label: 'Established' }, ...]
 */
export function ProofLedger({ items, className = '' }) {
  return (
    <dl className={`evo-ledger ${className}`}>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
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
  if (to.startsWith('/') && !to.startsWith('//')) {
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
