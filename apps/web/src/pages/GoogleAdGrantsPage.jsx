import React from 'react';
import { HeartHandshake, Rocket, Gauge } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { CtaBand, Faq, InnerHero, LinkCards, SplitSection, StepList } from '@/components/inner/InnerKit.jsx';
import GrantAssessment from '@/components/GrantAssessment.jsx';
import '@/styles/grants.css';

const ASSESS = '/google-ad-grants#assessment';
const CERTIFICATIONS = [
  { name: 'Content Marketing', achievement: '8hv281vm', slug: 'content-marketing-certified', badge: '354c6b4c21904f49a4cf6e1af9975860' },
  { name: 'Digital Advertising', achievement: '8lbf3g96', slug: 'digital-advertising-certified', badge: '854607ec4ec14c2783621b78802798ee' },
  { name: 'Digital Marketing', achievement: 'kd7mydbn', slug: 'digital-marketing-certified', badge: '4a2d8da396a34945a03704e6cab1cc99' },
];
const FAQ = [
  { q: 'What is the Google Ad Grant?', a: 'Google Ad Grants gives eligible nonprofits access to up to $10,000 per month in Google Search advertising to help people discover their mission. It is an advertising benefit, not a cash grant.' },
  { q: 'How much advertising does Google provide?', a: 'The program offers up to $10,000 USD per month in Google Search advertising. Actual use depends on search demand, campaign eligibility and performance. Full monthly utilization is not guaranteed.' },
  { q: 'Who is eligible?', a: 'Organizations must meet Google for Nonprofits requirements in their country, complete nonprofit verification and meet Ad Grants website and program policies. In the U.S., IRS recognition as a 501(c)(3) organization is generally required. Government entities, hospitals or healthcare organizations, and schools or universities are excluded; separate charitable or philanthropic arms may qualify. Special registration arrangements need review.' },
  { q: 'Does Google give the nonprofit cash?', a: 'No. The benefit covers eligible Search advertising within the program. It cannot be withdrawn as cash and does not pay EVOBRAND service fees.' },
  { q: 'Can EVOBRAND guarantee approval?', a: 'No. Google determines eligibility and approval. We help you understand the requirements, prepare and navigate activation. We cannot guarantee approval, advertising utilization, traffic, donations or other results.' },
  { q: 'What happens if our website is not ready?', a: 'We identify the gaps and prioritize the changes needed for a secure, useful website and a clear path to action. Website, landing-page or accessibility support is recommended only where a review identifies a need, with scope agreed before work begins.' },
  { q: 'Can EVOBRAND manage an existing Google Ad Grant?', a: 'Yes. Our Growth service can review an existing account, strengthen mission-focused campaigns and improve measurement. Suspended accounts first need a review of the issues and Google’s reactivation requirements.' },
  { q: 'Can you help measure donations, volunteers and registrations?', a: 'Yes. We can configure and test meaningful conversions in GA4 and Google Ads, then report completed actions. Measurement depends on your website, donation platform, consent settings and integrations; we review those limitations with you.' },
];
export default function GoogleAdGrantsPage() {
  return <>
    <SEO title="Google Ad Grants for Nonprofits | EVOBRAND Concepts" description="Turn up to $10,000 per month in Google Search advertising into measurable mission impact. Assess readiness, launch campaigns and grow with EVOBRAND." canonical="https://evobrand.net/google-ad-grants" structuredData={{ '@context': 'https://schema.org', '@type': 'Service', name: 'Google Ad Grants for Nonprofits', serviceType: 'Nonprofit digital strategy and Google Ad Grant support', provider: { '@type': 'Organization', name: 'EVOBRAND Concepts' }, url: 'https://evobrand.net/google-ad-grants' }} />
    <InnerHero crumbs={[{ label: 'Services', to: '/services' }, { label: 'Google Ad Grants' }]} label="Google Ad Grants for Nonprofits" lead="Turn search into" emphasis="measurable mission impact." intro="Turn up to $10,000/month in Google advertising into measurable mission impact. EVOBRAND helps eligible nonprofits navigate Google Ad Grants and connect campaigns, websites, tracking and follow-up to donors, volunteers and program participants." actions={[{ to: ASSESS, label: "Check Your Nonprofit’s Eligibility", cta: 'grant-hero-assess' }, { to: '/book-consultation', label: 'Talk With EVOBRAND', cta: 'grant-hero-talk' }]} facts={[{ label: 'The opportunity', value: 'Up to $10,000 per month in Google Search advertising' }, { label: 'The purpose', value: 'More people taking action for your mission' }, { label: 'The starting point', value: 'A free readiness assessment' }]} jumps={[{ href: '#journey', label: 'How it works' }, { href: '#offering', label: 'Services' }, { href: '#assessment', label: 'Check readiness' }, { href: '#questions', label: 'FAQ' }]} />
    <SplitSection id="opportunity" label="A clearer starting point" lead="An opportunity your team" emphasis="can put to work." intro="Small and midsized nonprofit teams often have limited time and no dedicated digital marketing department. We simplify the next step.">
      <StepList steps={[{ title: 'Discover the grant', body: 'You may not know the program exists or whether your organization qualifies. Start with a practical eligibility and readiness screen.' }, { title: 'Activate what you already have', body: 'An existing grant needs relevant campaigns, useful destination pages and a clear path for supporters to act.' }, { title: 'Make the whole journey work', body: 'Search traffic needs a website and measurement system that connect attention to donations, volunteer inquiries and registrations.' }]} />
    </SplitSection>
    <SplitSection id="journey" tone="slate" label="From readiness to impact" lead="Five steps." emphasis="One connected journey."><StepList steps={[
      { title: 'Assess', body: 'Determine basic eligibility, Google for Nonprofits status, website readiness and your primary mission goal.' },
      { title: 'Prepare', body: 'Resolve website, landing-page, tracking or conversion gaps where needed, with priorities based on your actual situation.' },
      { title: 'Launch', body: 'Support activation and build mission-focused campaigns around relevant searches and meaningful actions.' },
      { title: 'Grow', body: 'Monitor campaigns, review search terms, test ads and improve the supporter journey.' },
      { title: 'Measure', body: 'Connect campaign performance to completed actions and explain what those outcomes mean for your mission.' },
    ]} /></SplitSection>
    <SplitSection id="offering" label="Three stages of support" lead="Start where you are." emphasis="Build from there."><LinkCards items={[
      { to: ASSESS, icon: Gauge, meta: '01 · Free preliminary assessment', title: 'Google Ad Grant Readiness', body: 'Eligibility, account status, website and tracking readiness, conversion opportunities and a practical next-step plan.', cta: 'Check readiness' },
      { to: '/book-consultation', icon: Rocket, meta: '02 · One-time implementation', title: 'Google Ad Grant Launch', body: 'Application and activation guidance, account architecture, keyword and search-intent research, campaigns, ad copy, GA4 and Google Ads conversions, landing-page recommendations and dashboard setup.', cta: 'Discuss your launch' },
      { to: '/book-consultation', icon: HeartHandshake, meta: '03 · Ongoing monthly support', title: 'Google Ad Grant Growth', body: 'Campaign and compliance monitoring, search-term analysis, keyword and negative-keyword management, ad testing, expansion, conversion optimization, landing-page recommendations, analytics and mission-impact reporting.', cta: 'Discuss ongoing support' },
    ]} /></SplitSection>
    <SplitSection id="ecosystem" tone="deep" label="Why EVOBRAND" lead="Connect the campaign" emphasis="to the whole experience." intro="Advertising + Web Technology + UX + Analytics + Automation + AI. We can support the full conversion journey, from a search to a completed mission action.">
      <p className="grant-prose">A campaign may need clearer content, a better donation funnel, an accessible mobile experience, a dedicated landing page or reliable tracking. We can also connect CRM workflows and use AI automation to support timely follow-up. Recommendations start with observed or reported gaps and your organization’s priorities.</p>
      <LinkCards columns={2} items={[{ to: '/services/web-development', title: 'Website & conversion experience', body: 'Make mission actions clear and easy to complete.' }, { to: '/services/custom-ai-applications', title: 'Connected workflows & AI', body: 'Support the people and processes behind each inquiry.' }]} />
    </SplitSection>
    <SplitSection id="impact" label="Measure what matters" lead="Count the actions." emphasis="Understand the impact." intro="Reporting should help your leadership team make decisions about the mission, beyond advertising activity.">
      <ul className="grant-outcomes">{['Donors', 'Volunteer inquiries', 'Program participants', 'Event registrations', 'Members & email supporters', 'Community awareness'].map(v => <li key={v}>{v}</li>)}</ul>
      <p className="grant-prose">Reports connect mission-aligned visits to completed actions, highlight where supporters drop off and recommend the next improvement. Awareness is considered alongside engagement and mission goals. These are reporting goals, not promised results.</p>
    </SplitSection>
    <SplitSection id="javon" tone="slate" label="Meet your service lead" lead="Meet" emphasis="Javon Solomon." intro="Javon helps lead EVOBRAND’s Google Ad Grants service and holds HubSpot certifications in Content Marketing, Digital Marketing and Digital Advertising. He brings a foundation in content, campaign strategy and digital advertising to helping nonprofits connect their online presence to meaningful mission outcomes.">
      <figure className="grant-javon-portrait"><img src="/team/javon-solomon.png" alt="Javon Solomon seated at his desk" width="1145" height="1374" loading="lazy" decoding="async" /></figure>
      <ul className="grant-certifications" aria-label="Javon’s HubSpot certifications">
        {CERTIFICATIONS.map(cert => <li key={cert.slug}><a href={`https://app-na2.hubspot.com/academy/achievements/${cert.achievement}/en/1/javon-solomon/${cert.slug}`} target="_blank" rel="noopener noreferrer"><img src={`/team/${cert.badge}.png`} alt="" loading="lazy" decoding="async" /><span>HubSpot Certified<br /><strong>{cert.name}</strong></span><span className="grant-certification-link">View credential ↗</span></a></li>)}
      </ul>
    </SplitSection>
    <CtaBand label="Your next step" lead="See if your nonprofit" emphasis="is ready." intro="Get a preliminary eligibility result, website and tracking readiness, a 0–100 planning score and recommendations based on your answers." primary={{ to: ASSESS, label: 'See If Your Nonprofit Is Ready', cta: 'grant-band-assess' }} secondary={{ to: '/book-consultation', label: 'Talk With EVOBRAND', cta: 'grant-band-talk' }} />
    <section id="assessment" className="evo-block evo-block--ink grant-section" aria-labelledby="grant-assessment-heading"><div className="evo-container"><p className="phase__meta">Google Ad Grant Readiness Assessment</p><h2 id="grant-assessment-heading" className="grant-title">A practical first look at your readiness.</h2><GrantAssessment /></div></section>
    <SplitSection id="questions" tone="slate" label="Frequently asked questions" lead="Understand the program." emphasis="Choose your next step."><Faq items={FAQ} /><p className="grant-prose">EVOBRAND is an independent service provider and is not affiliated with or endorsed by Google. Program policies can change. Review <a href="https://www.google.com/grants/faq/" target="_blank" rel="noopener noreferrer">Google’s Ad Grants FAQ</a>, <a href="https://support.google.com/nonprofits/answer/3215869?hl=en" target="_blank" rel="noopener noreferrer">eligibility guidelines</a> and <a href="https://support.google.com/nonprofits/answer/1657899?hl=en" target="_blank" rel="noopener noreferrer">website policy</a>. Guidance reviewed October 5, 2026.</p></SplitSection>
  </>;
}

