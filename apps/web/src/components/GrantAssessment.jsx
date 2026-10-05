import React, { useRef, useState } from 'react';
import { ButtonLink } from '@/components/system/Section.jsx';
import { assessGrantReadiness, WEBSITE_CHECKS } from '@/lib/grantReadiness.js';
import { trackEvent } from '@/lib/analytics.js';

const YES_NO = [['yes', 'Yes'], ['no', 'No'], ['unknown', 'Not sure']];
const QUESTIONS = [
  ['country', 'Where is your nonprofit registered?', [['us', 'United States'], ['other', 'Outside the United States']]],
  ['registration', 'Does your organization have IRS 501(c)(3) recognition?', YES_NO],
  ['type', 'Which best describes your organization?', [['charity', 'Independent charitable nonprofit'], ['excluded', 'Government, hospital/healthcare organization, school or university'], ['arm', 'Separate charitable or philanthropic arm / foundation'], ['other', 'Other / not sure']]],
  ['nonprofits', 'Do you have an approved Google for Nonprofits account?', YES_NO],
  ['grant', 'What is your current Ad Grant status?', [['none', 'Not yet applied'], ['pending', 'Application in progress'], ['active', 'Active grant'], ['suspended', 'Suspended or deactivated'], ['unknown', 'Not sure']]],
  ['objective', 'What is your primary mission goal?', ['Donations', 'Volunteers', 'Program enrollment', 'Event registrations', 'Membership', 'Newsletter / email subscribers', 'Community awareness', 'Other mission-related conversions'].map(v => [v, v])],
];
function Select({ id, label, options, values, set }) {
  return <label className="grant-field" htmlFor={`grant-${id}`}><span>{label}</span><select id={`grant-${id}`} required value={values[id] || ''} onChange={e => set(p => ({ ...p, [id]: e.target.value }))}><option value="" disabled>Select an answer</option>{options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}</select></label>;
}
export default function GrantAssessment() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const resultsRef = useRef(null);
  function calculate(e) {
    e.preventDefault();
    const report = assessGrantReadiness(answers);
    setResult(report); setStatus('idle');
    trackEvent('grant_assessment_complete', { score: report.score, eligibility: report.eligibility });
    requestAnimationFrame(() => {
      resultsRef.current?.focus({ preventScroll: true });
      resultsRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }
  async function submitLead(e) {
    e.preventDefault();
    const fields = new FormData(e.currentTarget);
    setStatus('loading'); setError('');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const base = ['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'http://localhost:5000' : 'https://evobrandconcepts.com';
      const response = await fetch(`${base}/api/contacts/submit`, { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        name: fields.get('name').trim(), email: fields.get('email').trim(), website: fields.get('website'),
        subject: 'Google Ad Grants for Nonprofits', subscribeNewsletter: false,
        message: `Please contact me about Google Ad Grant readiness.\nOrganization: ${fields.get('organization')}\nWebsite: ${fields.get('url')}\nSelf-reported assessment: ${JSON.stringify({ answers, result })}`,
      }) });
      if (!response.ok) throw new Error(response.status === 429 ? 'Too many requests. Please try again later.' : 'Your request could not be saved. Please try again.');
      setStatus('success'); trackEvent('grant_consultation_request');
    } catch (err) { setStatus('error'); setError(err.name === 'AbortError' ? 'The request timed out. Please try again or contact info@evobrand.net.' : `${err.message} You can also contact info@evobrand.net.`); }
    finally { clearTimeout(timer); }
  }
  if (result) return <div ref={resultsRef} tabIndex={-1} className="grant-results">
    <p className="phase__meta">Your preliminary readiness snapshot</p>
    <h3 className="grant-score">{result.score}<span> / 100</span></h3>
    <p>Planning score based on your answers. This is not Google approval, a compliance certification or a live website scan. Unknown answers receive no points.</p>
    <dl className="grant-summary">{[['Grant Eligibility', result.eligibility], ['Website Readiness', result.website], ['Tracking Readiness', result.tracking]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <h3>Recommended next steps</h3>
    <ul className="grant-next">{result.next.map(n => <li key={n.title}><h4>{n.title}</h4><p>{n.body}</p>{n.to.startsWith('https') ? <a href={n.to} target="_blank" rel="noopener noreferrer">Review Google’s guidance ↗</a> : <ButtonLink to={n.to} variant="secondary">Explore this next step</ButtonLink>}</li>)}</ul>
    <ButtonLink to="/book-consultation" data-cta="grant-results-book">Book a consultation</ButtonLink>
    <div className="grant-lead"><h3>Talk through your results with EVOBRAND</h3><p>Send your answers and website URL to our team for a personal review. Your URL is shared with our team; it is not automatically scanned.</p>
      {status === 'success' ? <p role="status">Your request has been saved. EVOBRAND will follow up using the email you provided.</p> : <form onSubmit={submitLead}>
        <div className="grant-fields">{[['organization', 'Organization', 'text'], ['name', 'Your name', 'text'], ['email', 'Email', 'email'], ['url', 'Website URL (optional)', 'url']].map(([id, label, type]) => <label key={id} className="grant-field" htmlFor={`lead-${id}`}><span>{label}</span><input id={`lead-${id}`} name={id} type={type} required={id !== 'url'} maxLength={255} autoComplete={id === 'name' ? 'name' : id === 'email' ? 'email' : id === 'organization' ? 'organization' : 'url'} /></label>)}</div>
        <label className="grant-honeypot" aria-hidden="true">Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <label className="grant-consent"><input type="checkbox" required /> I agree that EVOBRAND may contact me about this assessment and consultation request.</label>
        {status === 'error' && <p role="alert">{error}</p>}
        <button className="evo-btn evo-btn--primary" disabled={status === 'loading'}>{status === 'loading' ? 'Sending…' : 'Request a readiness consultation'}</button>
      </form>}
    </div>
    <button className="evo-btn evo-btn--secondary" onClick={() => { setResult(null); setStatus('idle'); }}>Edit my answers</button>
  </div>;
  return <form onSubmit={calculate} className="grant-assessment">
    <p>Free, with no email required to see your results. Answer based on what you know today. This preliminary screen focuses on U.S. nonprofits; other countries and special registration arrangements need individual review.</p>
    <fieldset><legend>01 · Organization & mission</legend><div className="grant-fields">{QUESTIONS.map(([id, label, options]) => <Select key={id} {...{ id, label, options }} values={answers} set={setAnswers} />)}</div></fieldset>
    <fieldset><legend>02 · Website readiness</legend><div className="grant-fields">{WEBSITE_CHECKS.map(([id, label]) => <Select key={id} {...{ id, label }} options={YES_NO} values={answers} set={setAnswers} />)}</div></fieldset>
    <fieldset><legend>03 · Measurement & follow-up</legend><div className="grant-fields">{[['analytics', 'Is GA4 configured on your website?'], ['conversions', 'Are meaningful completed actions tracked in Google Ads?'], ['followup', 'Do inquiries reach your team or CRM with a clear follow-up process?']].map(([id, label]) => <Select key={id} {...{ id, label }} options={YES_NO} values={answers} set={setAnswers} />)}</div></fieldset>
    <button className="evo-btn evo-btn--primary" data-cta="grant-assessment-score">See my readiness results</button>
  </form>;
}
