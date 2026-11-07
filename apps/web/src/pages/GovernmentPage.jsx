import React, { useRef, useState } from 'react';
import {
  Accessibility, Check, Clapperboard, Code2, Copy, Download, FileText, Image, Landmark, Sparkles,
} from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { CtaBand, Faq, InnerHero, LinkCards, SplitSection, StepList, useStaggerReveal } from '@/components/inner/InnerKit.jsx';
import { ButtonLink } from '@/components/system/Section.jsx';

const PAGE_URL = 'https://evobrand.net/government';

// ── Vendor record ───────────────────────────────────────────────────────────
// Keep this in step with SAM.gov and NCTRCA. Any field left empty ('') is
// hidden on the page and left out of the copied vendor details.
const VENDOR = {
  legalName: 'EVOBRAND Concepts LLC',
  owner: 'Keisha Solomon, Founder',
  established: 'Founded 1999 · LLC since 2010',
  ownership: 'Woman-owned, minority-owned small business',
  location: 'Dallas–Fort Worth, Texas · Serving clients nationwide',
  uei: '', // SAM.gov Unique Entity ID, e.g. 'ABCD1234EFG5'
  cage: '', // CAGE code, e.g. '1A2B3'
  phone: '+1 214-531-4427',
  email: 'info@evobrand.net',
};

// From the NCTRCA certificates in public/docs. Update numbers, dates and
// files together when the certificates are renewed.
const CERTIFICATIONS = [
  { code: 'MBE', title: 'Minority Business Enterprise', number: 'BFMB79272N1027', file: '/docs/evobrand-nctrca-mbe-certificate.pdf' },
  { code: 'WBE', title: "Women's Business Enterprise", number: 'BFWB65235N1027', file: '/docs/evobrand-nctrca-wbe-certificate.pdf' },
  { code: 'SBE', title: 'Small Business Enterprise', number: 'BFSB13993N1027', file: '/docs/evobrand-nctrca-sbe-certificate.pdf' },
];
const CERTIFYING_AGENCY = 'North Central Texas Regional Certification Agency (NCTRCA)';
const CERT_ISSUED = 'October 9, 2025';
const CERT_EXPIRES = 'October 31, 2027';
const CAPABILITY_PROFILE = '/docs/evobrand-capabilities-profile.pdf';

// NAICS codes on the NCTRCA certificates (titles as printed there).
const NAICS = [
  { code: '512110', title: 'Video Production and Distribution' },
  { code: '518210', title: 'Computing Infrastructure Providers, Data Processing, Web Hosting, and Related Services' },
];

function vendorRows() {
  return [
    ['Legal name', VENDOR.legalName],
    ['Principal', VENDOR.owner],
    ['Business type', VENDOR.ownership],
    ['Certifications', `${CERTIFICATIONS.map((c) => `${c.code} ${c.number}`).join(', ')} · ${CERTIFYING_AGENCY} · expires ${CERT_EXPIRES}`],
    ['Certified NAICS', NAICS.map((n) => `${n.code} ${n.title}`).join('; ')],
    ['UEI', VENDOR.uei],
    ['CAGE', VENDOR.cage],
    ['Established', VENDOR.established],
    ['Location', VENDOR.location],
    ['Contact', `${VENDOR.phone} · ${VENDOR.email}`],
  ].filter(([, value]) => value);
}

function VendorSheet() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const text = vendorRows().map(([k, v]) => `${k}: ${v}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="vendor-sheet">
      <dl className="vendor-sheet__list">
        <div className="vendor-sheet__row">
          <dt>Legal name</dt>
          <dd>{VENDOR.legalName}</dd>
        </div>
        <div className="vendor-sheet__row">
          <dt>Business type</dt>
          <dd>{VENDOR.ownership}</dd>
        </div>
        <div className="vendor-sheet__row">
          <dt>Certifications</dt>
          <dd>
            <ul className="vendor-sheet__certs">
              {CERTIFICATIONS.map((c) => (
                <li key={c.code} className="vendor-sheet__cert">
                  <strong>{c.code}</strong>
                  <span>
                    {c.title}
                    <span className="vendor-sheet__certline">
                      <span className="vendor-sheet__num">No. {c.number}</span>
                      <a href={c.file} target="_blank" rel="noopener noreferrer" data-cta={`gov-cert-${c.code.toLowerCase()}`}>
                        View certificate<span className="sr-only"> ({c.code}, PDF, opens in a new tab)</span>
                      </a>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <span className="vendor-sheet__note">Certified by the {CERTIFYING_AGENCY}. Issued {CERT_ISSUED}, expires {CERT_EXPIRES}.</span>
          </dd>
        </div>
        <div className="vendor-sheet__row">
          <dt>Certified NAICS</dt>
          <dd>
            <ul className="vendor-sheet__naics">
              {NAICS.map((n) => (
                <li key={n.code}><strong>{n.code}</strong> {n.title}</li>
              ))}
            </ul>
          </dd>
        </div>
        {VENDOR.uei && (
          <div className="vendor-sheet__row">
            <dt>SAM.gov UEI</dt>
            <dd><code>{VENDOR.uei}</code></dd>
          </div>
        )}
        {VENDOR.cage && (
          <div className="vendor-sheet__row">
            <dt>CAGE code</dt>
            <dd><code>{VENDOR.cage}</code></dd>
          </div>
        )}
        <div className="vendor-sheet__row">
          <dt>Principal</dt>
          <dd>{VENDOR.owner}</dd>
        </div>
        <div className="vendor-sheet__row">
          <dt>Established</dt>
          <dd>{VENDOR.established}</dd>
        </div>
        <div className="vendor-sheet__row">
          <dt>Location</dt>
          <dd>{VENDOR.location}</dd>
        </div>
        <div className="vendor-sheet__row">
          <dt>Procurement contact</dt>
          <dd>
            <a href={`tel:${VENDOR.phone.replace(/[^+\d]/g, '')}`}>{VENDOR.phone}</a><br />
            <a href={`mailto:${VENDOR.email}?subject=Procurement%20inquiry`}>{VENDOR.email}</a>
          </dd>
        </div>
      </dl>
      <div className="vendor-sheet__actions">
        <a className="evo-btn evo-btn--primary" href={CAPABILITY_PROFILE} download data-cta="gov-download-profile">
          <Download size={16} aria-hidden="true" /> Download capabilities profile <span className="vendor-sheet__meta">PDF</span>
        </a>
        <button type="button" className="evo-btn evo-btn--secondary" onClick={copy} data-cta="gov-copy-vendor">
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy vendor details'}
        </button>
        <span className="sr-only" role="status" aria-live="polite">{copied ? 'Vendor details copied to clipboard' : ''}</span>
      </div>
    </div>
  );
}

const CAPABILITIES = [
  { to: '/services/wcag-accessibility', icon: Accessibility, meta: 'Accessibility', title: 'WCAG 2.1 AA accessibility', body: 'Audits, remediation, accessible PDFs and conformance reports for ADA Title II and Section 508.', cta: 'Accessibility services' },
  { to: '/services/web-development', icon: Code2, meta: 'NAICS 518210', title: 'Websites, portals and hosting', body: 'Agency websites, resident and vendor portals, hosting and content systems your staff can run.', cta: 'Web development' },
  { to: '/services/custom-ai-applications', icon: Sparkles, meta: 'Applications', title: 'Custom applications and AI', body: 'Case tracking, intake, dashboards and AI assistants built around your processes and policies.', cta: 'Custom applications' },
  { to: '/services/document-generation', icon: FileText, meta: 'NAICS 518210', title: 'Document automation and data processing', body: 'Permits, letters, reports and notices generated from your data, consistent and accessible.', cta: 'Document generation' },
  { to: '/services/ai-video-production', icon: Clapperboard, meta: 'NAICS 512110', title: 'Video production', body: 'Explainers, public announcements and training video, captioned and ready to publish.', cta: 'Video production' },
  { to: '/services/ai-visual-content', icon: Image, meta: 'Communications', title: 'Brand and visual design', body: 'Program branding, campaign graphics and print or digital materials for public outreach.', cta: 'Visual content' },
];

const PLATFORMS = [
  { title: 'Government contracting platform', body: 'PrimeReach: a white-label platform that connects prime contractors with qualified small businesses, built for transportation and infrastructure agencies with SBE matching.' },
  { title: 'Certification agency portal', body: 'A regional certification portal and pipeline CRM concept covering applicant workflows, review stages, outreach campaigns and agency reporting.' },
  { title: 'Contractor and bid hub', body: 'A member hub and procurement portal concept that connects contractors with active bid opportunities, mentorship pairings and partner networks.' },
  { title: 'Membership and civic operations', body: 'ChamberCore: an all-in-one platform that runs chambers of commerce, covering dues, events, governance, advocacy and member engagement.' },
];

const STEPS = [
  { meta: 'Week 1', title: 'Capability briefing', body: 'A 30-minute call or written response covering your requirement, our fit, and the vendor details your office needs.' },
  { meta: 'Quote or response', title: 'Fixed scope, written down', body: 'For informal quotes we return a priced scope with deliverables and milestones. For RFQs and RFPs we respond to your format and evaluation criteria.' },
  { meta: 'Delivery', title: 'One lead from start to finish', body: 'The person who scopes the work leads it, with scheduled check-ins and a shared project view.' },
  { meta: 'Close-out', title: 'Documentation you can keep', body: 'You keep the source files and admin access, your staff get trained to run what we built, and accessibility work comes with conformance documentation (an ACR on request) so it stands up after launch.' },
];

const FAQS = [
  { q: 'Is EVOBRAND a certified small, woman-owned and minority-owned business?', a: 'Yes. EVOBRAND Concepts LLC is certified as a Small Business Enterprise (SBE), Women’s Business Enterprise (WBE) and Minority Business Enterprise (MBE) by the North Central Texas Regional Certification Agency (NCTRCA). Certificate numbers are MBE BFMB79272N1027, WBE BFWB65235N1027 and SBE BFSB13993N1027, valid through October 31, 2027. Copies are linked on this page, and you can confirm current status with NCTRCA.' },
  { q: 'Can you subcontract to help a prime meet SBE, WBE or MBE goals?', a: 'Yes. We can team with a prime contractor as a certified subcontractor for the digital, web, accessibility and video scope of a project. Contact us with the solicitation number and the scope you want to assign.' },
  { q: 'Which NAICS codes are you certified under?', a: 'Our NCTRCA certifications cover NAICS 512110 (Video Production and Distribution) and 518210 (Computing Infrastructure Providers, Data Processing, Web Hosting, and Related Services). Ask us if your solicitation lists a different code; our capabilities profile explains how our services align.' },
  { q: 'What does the ADA Title II rule require, and when?', a: 'The Department of Justice’s 2024 rule requires state and local government websites and mobile apps to meet WCAG 2.1 Level AA. In April 2026 the DOJ extended the compliance dates by one year: April 26, 2027 for entities serving 50,000 people or more, and April 26, 2028 for smaller entities and special districts. The DOJ has signaled it may propose further changes, so confirm the current dates on ADA.gov.' },
  { q: 'Do you provide accessibility conformance documentation?', a: 'Yes. Accessibility work can include a written audit listing the WCAG 2.1 criteria tested, a remediation log, and an accessibility conformance report (ACR) for your records.' },
  { q: 'Do you only work with agencies in Texas?', a: 'No. We are based in the Dallas–Fort Worth area and work with public-sector, nonprofit and business clients nationwide, remotely or on site.' },
];

function PlatformList() {
  const ref = useRef(null);
  useStaggerReveal(ref);
  return (
    <ul ref={ref} className="value-grid">
      {PLATFORMS.map((p) => (
        <li key={p.title} data-reveal-item>
          <span className="mega-link__icon" aria-hidden="true"><Landmark size={20} strokeWidth={1.6} /></span>
          <h3>{p.title}</h3>
          <p>{p.body}</p>
        </li>
      ))}
    </ul>
  );
}

export default function GovernmentPage() {
  return (
    <>
      <SEO
        title="Government Web, Accessibility & AI | SBE, WBE, MBE Certified | EVOBRAND"
        description="EVOBRAND Concepts is an NCTRCA-certified SBE, WBE and MBE in Dallas–Fort Worth. Websites, WCAG 2.1 AA accessibility for ADA Title II, custom applications and video for public agencies. NAICS 512110 and 518210."
        canonical={PAGE_URL}
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Service',
              name: 'Digital services for government agencies',
              serviceType: 'Government web development, WCAG accessibility, custom applications and video production',
              url: PAGE_URL,
              provider: { '@id': 'https://evobrand.net/#organization' },
              areaServed: [{ '@type': 'State', name: 'Texas' }, { '@type': 'Country', name: 'United States' }],
              audience: { '@type': 'Audience', audienceType: 'Government agencies, public entities and prime contractors' },
            },
            {
              '@type': 'FAQPage',
              mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
            },
          ],
        }}
      />

      <InnerHero
        crumbs={[{ label: 'Government & procurement' }]}
        label="Government & procurement"
        lead="Certified, accountable"
        emphasis="digital work for public agencies."
        intro="Websites, WCAG 2.1 AA accessibility, custom applications and video for state and local government, and for the prime contractors who serve them. SBE, WBE and MBE certified."
        actions={[
          { to: '/book-consultation', label: 'Book a capability briefing', cta: 'gov-hero-briefing' },
          { to: '#vendor-details', label: 'Vendor details & downloads', cta: 'gov-hero-vendor' },
        ]}
        facts={[
          { label: 'Certified', value: 'SBE · WBE · MBE' },
          { label: 'Certifier', value: 'NCTRCA' },
          { label: 'NAICS', value: '512110 · 518210' },
          { label: 'Since', value: '1999' },
        ]}
        jumps={[
          { href: '#vendor-details', label: 'Vendor details' },
          { href: '#capabilities', label: 'Capabilities' },
          { href: '#ada-title-ii', label: 'ADA Title II' },
          { href: '#experience', label: 'Experience' },
          { href: '#working-with-us', label: 'Working with us' },
          { href: '#faq', label: 'FAQ' },
        ]}
      />

      <SplitSection
        id="vendor-details"
        label="Vendor quick reference"
        lead="Everything procurement"
        emphasis="asks for first."
        intro="Copy these details straight into a vendor form, bid tabulation or subcontractor plan."
      >
        <VendorSheet />
      </SplitSection>

      <SplitSection
        id="capabilities"
        tone="navy"
        label="Capabilities"
        lead="What we deliver"
        emphasis="for the public sector."
        intro="What we deliver for agencies and the primes who serve them. Our certified NAICS codes are 512110 and 518210."
      >
        <LinkCards columns={2} items={CAPABILITIES} />
      </SplitSection>

      <SplitSection
        id="ada-title-ii"
        label="ADA Title II"
        lead="The accessibility deadline"
        emphasis="is now on the calendar."
        aside={(
          <p className="vendor-sheet__note">
            Dates as of the DOJ’s April 2026 interim final rule. Confirm current requirements on{' '}
            <a href="https://www.ada.gov/resources/2024-03-08-web-rule/" target="_blank" rel="noopener noreferrer">ADA.gov<span className="sr-only"> (opens in a new tab)</span></a>.
          </p>
        )}
      >
        <div className="inner-prose">
          <p>
            The Department of Justice’s 2024 rule under Title II of the ADA requires state and local government
            websites, online documents and mobile apps to meet <strong>WCAG 2.1 Level AA</strong>.
          </p>
          <p>
            Public entities serving <strong>50,000 people or more</strong> must comply by <strong>April 26, 2027</strong>.
            Smaller governments and special districts, such as school, water, transit and fire districts, have until{' '}
            <strong>April 26, 2028</strong>.
          </p>
          <p>
            Our accessibility work covers the whole surface the rule reaches: the website, the PDFs and forms
            residents rely on, embedded video and third-party tools. You get a prioritized remediation plan and the
            documentation to show your progress.
          </p>
        </div>
        <div className="vendor-sheet__actions">
          <ButtonLink to="/accessibility-checker" data-cta="gov-ada-checker">Run a free accessibility scan</ButtonLink>
          <ButtonLink to="/services/wcag-accessibility" variant="secondary" data-cta="gov-ada-service">Accessibility services</ButtonLink>
        </div>
      </SplitSection>

      <SplitSection
        id="experience"
        tone="navy"
        label="Experience"
        lead="Platforms built for"
        emphasis="contracting and certification."
        intro="EVOBRAND has built software for the people who run public procurement and supplier diversity programs."
        aside={(
          <ButtonLink to="/our-work" variant="secondary" data-cta="gov-experience-work">See the work</ButtonLink>
        )}
      >
        <PlatformList />
      </SplitSection>

      <SplitSection
        id="working-with-us"
        label="Working with us"
        lead="From first call"
        emphasis="to close-out."
        intro="As a prime on small purchases, or as a certified subcontractor on larger awards."
        aside={(
          <ul className="inner-ticks">
            <li>Prime contractor on direct and informal purchases</li>
            <li>Certified subcontractor for SBE, WBE and MBE participation goals</li>
          </ul>
        )}
      >
        <StepList steps={STEPS} />
      </SplitSection>

      <SplitSection id="faq" tone="navy" label="FAQ" lead="Questions procurement" emphasis="teams ask us.">
        <Faq items={FAQS} />
      </SplitSection>

      <CtaBand
        label="Procurement inquiries"
        lead="Have a solicitation"
        emphasis="or a requirement?"
        intro="Send the solicitation number or a short description of the need. We will confirm fit, answer vendor questions and respond on your timeline."
        primary={{ to: '/book-consultation', label: 'Book a capability briefing', cta: 'gov-band-briefing' }}
        secondary={{ to: '/contact', label: 'Send the details', cta: 'gov-band-contact' }}
      />
    </>
  );
}
