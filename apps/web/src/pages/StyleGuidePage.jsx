import React from 'react';
import SEO from '@/components/SEO.jsx';
import { Section, SectionHeading, ProofLedger, ButtonLink, Eyebrow } from '@/components/system/Section.jsx';

// Internal reference for the design system. Not linked from the site and not indexed.

const COLORS = [
  { name: 'Ink 900', token: '--ink-900', hex: '#0f1419', use: 'Page background' },
  { name: 'Ink 950', token: '--ink-950', hex: '#04080f', use: 'Footer, deep bands' },
  { name: 'Slate 800', token: '--slate-800', hex: '#1a2332', use: 'Surfaces, alternating sections' },
  { name: 'Navy 700', token: '--navy-700', hex: '#003258', use: 'Proof and credential bands, text on cyan' },
  { name: 'Cyan 400', token: '--cyan-400', hex: '#22c8e5', use: 'Accent, primary buttons, emphasis' },
  { name: 'Paper', token: '--paper', hex: '#f5f8fb', use: 'Primary text' },
  { name: 'Mist', token: '--mist', hex: '#b3c1cf', use: 'Secondary text' },
  { name: 'Fog', token: '--fog', hex: '#8892a4', use: 'Tertiary text, ink and slate only' },
];

const STEPS = ['5', '4', '3', '2', '1', '0', '-1', '-2'];

export default function StyleGuidePage() {
  return (
    <>
      <SEO title="Style guide" noindex canonical="https://evobrand.net/style-guide" />

      <Section tone="ink">
        <SectionHeading
          as="h1"
          display
          label="Design system"
          lead="Proof before promises."
          emphasis="Senior-led since 1999."
          intro="The section rhythm in one block: a short label, a two-part headline with an emphasized second half, supporting copy, then proof."
        >
          <div className="mt-space-s flex flex-wrap gap-space-s">
            <ButtonLink to="/contact">Start a project</ButtonLink>
            <ButtonLink to="/our-work" variant="secondary">See the work</ButtonLink>
          </div>
        </SectionHeading>
      </Section>

      <Section
        tone="navy"
        label="Credential ledger"
        lead="The record,"
        emphasis="not the pitch."
        intro="Proof points set like an official filing. On scroll, the rules draw, values rise into place and counts tick up. Nothing moves under reduced motion."
      >
        {/* Example values use confirmed facts only. */}
        <ProofLedger
          items={[
            { value: '1999', label: 'Established' },
            { value: 25, suffix: '+ years', label: 'In operation', count: true },
            { value: 'SBE · WBE · MBE', label: 'Certified' },
            { value: 'Public · Private · Nonprofit', label: 'Client sectors' },
          ]}
        />
      </Section>

      <Section tone="slate" label="Color" lead="Palette" emphasis="from the existing brand.">
        <ul className="grid gap-space-s sm:grid-cols-2 lg:grid-cols-4">
          {COLORS.map((c) => (
            <li key={c.token} className="rounded-xl border border-evo-rule overflow-hidden">
              <div className="h-20" style={{ background: c.hex }} />
              <div className="p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="text-step--1 text-evo-mist">{c.hex} · <code>{c.token}</code></p>
                <p className="text-step--1 text-evo-mist mt-1">{c.use}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="ink" label="Type" lead="Newsreader, Public Sans," emphasis="Glacial Indifference.">
        <div className="grid gap-space-m">
          {STEPS.map((s) => (
            <div key={s} className="grid gap-1 border-b border-evo-rule pb-space-s">
              <Eyebrow>{`--step-${s}`}</Eyebrow>
              <p
                style={{
                  fontSize: `var(--step-${s})`,
                  fontFamily: Number(s) >= 3 ? 'var(--font-display)' : 'var(--font-sans)',
                  lineHeight: 1.2,
                }}
              >
                Websites and platforms for public programs
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
