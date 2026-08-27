import React, { useState, useRef } from 'react';
import { Mail, Phone, MapPin, Clock, Facebook, Youtube, Linkedin, Instagram, Send, Loader2, CheckCircle2, AlertCircle, Upload, X } from 'lucide-react';
import SchedulerWidget from '@/components/scheduler/SchedulerWidget.jsx';
import SEO from '@/components/SEO.jsx';
import { PageHero, Reveal, TiltCard } from '@/components/motion/PageMotion.jsx';

const GOLD = '#22c8e5';
const NAVY = '#003258';
const BEIGE = '#ffffff';

const SERVICES = [
  'Custom AI Applications',
  'AI Visual Content Creation',
  'Intelligent Document Generation',
  'AI Video Production',
  'WordPress & Web Development',
  'General Inquiry',
];

const CONTACT_METHODS = [
  {
    icon: Phone,
    label: 'Phone',
    lines: [
      { text: '+1 214-531-4427', href: 'tel:+12145314427' },
      { text: 'Mobile: +1 469-360-2723', href: 'tel:+14693602723' },
    ],
  },
  {
    icon: Mail,
    label: 'Email',
    lines: [{ text: 'info@evobrand.net', href: 'mailto:info@evobrand.net' }],
  },
  {
    icon: MapPin,
    label: 'Location',
    lines: [{ text: 'Ellis County, Texas' }],
  },
  {
    icon: Clock,
    label: 'Office Hours',
    lines: [{ text: 'Mon – Fri' }, { text: '10:00 AM – 6:00 PM CST' }],
  },
];

// ─── Contact Form ─────────────────────────────────────────────────────────────

const CUSTOM_AI_SERVICE = 'Custom AI Applications';
const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5 MB, matches server-side multer limit

const emptyForm = { service: '', name: '', email: '', message: '', requirements: '', subscribeNewsletter: true, website: '' };

function ContactForm() {
  const [form, setForm] = useState(emptyForm);
  const [logo, setLogo] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef(null);

  const isCustomAiRequest = form.service === CUSTOM_AI_SERVICE;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (status === 'error') setStatus('idle');
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setStatus('error');
      setErrorMsg('Logo file is too large — please choose one under 5 MB.');
      e.target.value = '';
      return;
    }
    setLogo(file);
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('error');
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (isCustomAiRequest && !form.requirements.trim()) {
      setStatus('error');
      setErrorMsg('Please list your requirements for the demo portal.');
      return;
    }

    setStatus('loading');
    try {
      const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api/contacts/submit'
        : 'https://evobrandconcepts.com/api/contacts/submit';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const body = new FormData();
      body.append('name', form.name.trim());
      body.append('email', form.email.trim());
      body.append('subject', form.service || 'General Inquiry');
      body.append('message', form.message.trim());
      body.append('requirements', isCustomAiRequest ? form.requirements.trim() : '');
      body.append('subscribeNewsletter', form.subscribeNewsletter);
      body.append('website', form.website);
      if (isCustomAiRequest && logo) body.append('logo', logo);

      let response;
      try {
        response = await fetch(API_URL, {
          method: 'POST',
          signal: controller.signal,
          body,
        });
      } catch (fetchErr) {
        throw new Error(fetchErr.name === 'AbortError'
          ? 'Request timed out — please try again or email us directly.'
          : 'Unable to reach the server. Please email us directly.');
      } finally {
        clearTimeout(timer);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Send failed');
      }

      setStatus('success');
      setForm(emptyForm);
      setLogo(null);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to send your message. Please try again or email us directly.');
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 border placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-[#22c8e5] focus-visible:ring-offset-0';
  const inputStyle = { background: 'rgba(10,22,40,0.7)', color: BEIGE, borderColor: 'rgba(34,200,229,0.18)' };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ background: 'rgba(34,200,229,0.1)', border: `2px solid ${GOLD}` }}
        >
          <CheckCircle2 size={28} style={{ color: GOLD }} aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: BEIGE }}>Message Sent</h3>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
          We'll be in touch within 1 business day.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="text-xs font-bold uppercase tracking-widest rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
          style={{ color: 'rgba(34,200,229,0.6)' }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Contact form">
      {/* Honeypot — hidden from sighted/keyboard users, but present in the DOM
          for bots that auto-fill every field. Server rejects silently if set. */}
      <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input
          id="cf-website"
          name="website"
          type="text"
          value={form.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="cf-service" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: GOLD }}>
          Service Interest
        </label>
        <select
          id="cf-service"
          name="service"
          value={form.service}
          onChange={handleChange}
          className={inputClass}
          style={{ ...inputStyle, appearance: 'none' }}
        >
          <option value="">Select a service</option>
          {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="cf-name" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: GOLD }}>
          Full Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="cf-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          autoComplete="name"
          className={inputClass}
          style={inputStyle}
          placeholder="Your full name"
        />
      </div>

      <div>
        <label htmlFor="cf-email" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: GOLD }}>
          Email Address <span aria-hidden="true">*</span>
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
          className={inputClass}
          style={inputStyle}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="cf-message" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: GOLD }}>
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          required
          className={inputClass}
          style={inputStyle}
          placeholder="Tell us about your project or goals..."
        />
      </div>

      {isCustomAiRequest && (
        <div
          className="rounded-xl p-4 space-y-4"
          style={{ background: 'rgba(34,200,229,0.05)', border: '1px solid rgba(34,200,229,0.2)' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>
            Free Custom Demo Portal
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Tell us what you need and share your logo, and we'll build you a free customized demo portal for your business.
          </p>

          <div>
            <label htmlFor="cf-requirements" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: GOLD }}>
              Project Requirements <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="cf-requirements"
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              rows={4}
              required={isCustomAiRequest}
              className={inputClass}
              style={inputStyle}
              placeholder="List the features, pages, or workflows you'd like in your demo portal..."
            />
          </div>

          <div>
            <label htmlFor="cf-logo" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: GOLD }}>
              Business Logo <span className="normal-case font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>(optional, max 5MB)</span>
            </label>
            {logo ? (
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm"
                style={inputStyle}
              >
                <span className="truncate" style={{ color: BEIGE }}>{logo.name}</span>
                <button
                  type="button"
                  onClick={() => setLogo(null)}
                  aria-label="Remove selected logo"
                  className="ml-2 flex-shrink-0 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="cf-logo"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm cursor-pointer border border-dashed transition-colors hover:border-[#22c8e5]/50"
                style={{ ...inputStyle, color: 'rgba(255,255,255,0.5)' }}
              >
                <Upload size={15} aria-hidden="true" />
                <span>Upload logo (PNG, JPG, SVG, GIF, or WebP)</span>
              </label>
            )}
            <input
              id="cf-logo"
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
              onChange={handleLogoChange}
              className="sr-only"
            />
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 mt-4">
        <div className="flex items-center h-5">
          <input
            id="cf-newsletter"
            name="subscribeNewsletter"
            type="checkbox"
            checked={form.subscribeNewsletter}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-600 focus:ring-[#22c8e5] text-[#22c8e5]"
            style={{ background: 'rgba(10,22,40,0.7)', borderColor: 'rgba(34,200,229,0.3)' }}
          />
        </div>
        <label htmlFor="cf-newsletter" className="text-sm cursor-pointer" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Subscribe to EVOBRAND newsletter for AI insights and updates.
        </label>
      </div>

      {status === 'error' && (
        <div
          className="flex items-start gap-2 p-3 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
          role="alert"
        >
          <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-red-300 text-sm">{errorMsg}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5]"
        style={{ background: status === 'loading' ? 'rgba(34,200,229,0.5)' : GOLD, color: NAVY }}
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <Send size={15} aria-hidden="true" />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <>
      <SEO
        title="Book a Free AI Consultation | Contact EVOBRAND — Ellis County, TX"
        description="Ready to transform your business with AI? Contact EVOBRAND for a free 30-minute strategy call. Serving clients nationwide from Ellis County, TX. Call +1 214-531-4427 or email info@evobrand.net."
        keywords="contact EVOBRAND, AI consultation, book strategy call, Ellis County AI agency contact, free AI consultation"
        canonical="https://evobrand.net/contact"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact EVOBRAND",
          "url": "https://evobrand.net/contact",
          "description": "Book a free AI strategy consultation with EVOBRAND.",
          "mainEntity": {
            "@type": "Organization",
            "name": "EVOBRAND Concepts LLC",
            "telephone": "+12145314427",
            "email": "info@evobrand.net",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Ellis County",
              "addressRegion": "TX",
              "addressCountry": "US"
            }
          }
        }}
      />

      <div className="min-h-screen bg-[#0f1419]">
        {/* Hero */}
        <PageHero
          eyebrow="Get in Touch"
          lines={[[{ t: "Let's" }, { t: 'Connect', accent: true }]]}
          sub="Ready to transform your business with AI? Reach out for a free 30-minute consultation — no obligation."
        />

        {/* Contact method cards */}
        <section className="py-12 border-y" style={{ background: 'rgba(26,35,50,0.5)', borderColor: `rgba(34,200,229,0.08)` }}>
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CONTACT_METHODS.map(({ icon: Icon, label, lines }, index) => (
                <Reveal key={label} delay={index * 0.06}>
                  <TiltCard
                    className="h-full p-6 rounded-2xl text-center border transition-colors duration-300 hover:border-[#22c8e5]/30"
                    style={{ background: 'rgba(15,20,25,0.7)', borderColor: 'rgba(34,200,229,0.1)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ background: 'rgba(34,200,229,0.1)' }}
                      aria-hidden="true"
                    >
                      <Icon size={18} style={{ color: GOLD }} />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-2">{label}</h3>
                    {lines.map(({ text, href }) =>
                      href ? (
                        <a
                          key={text}
                          href={href}
                          className="block text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5] rounded"
                          style={{ color: 'rgba(255,255,255,0.55)' }}
                          onMouseEnter={(e) => (e.target.style.color = GOLD)}
                          onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.55)')}
                        >
                          {text}
                        </a>
                      ) : (
                        <p key={text} className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                          {text}
                        </p>
                      )
                    )}
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Main content: form + scheduler */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
              {/* Contact Form */}
              <Reveal
                className="rounded-2xl p-8 border"
                style={{ background: '#1a2332', borderColor: 'rgba(34,200,229,0.12)' }}
              >
                <div className="flex items-center gap-3 mb-7">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(34,200,229,0.1)' }}
                    aria-hidden="true"
                  >
                    <Mail size={15} style={{ color: GOLD }} />
                  </div>
                  <h2 className="text-base font-bold tracking-wide" style={{ color: BEIGE }}>
                    Send Us a Message
                  </h2>
                </div>
                <ContactForm />

                {/* What to expect */}
                <div className="mt-8 pt-7 border-t" style={{ borderColor: 'rgba(34,200,229,0.1)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(34,200,229,0.6)' }}>
                    What Happens Next
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      'We review your inquiry within 1 business day',
                      'A strategist reaches out to learn more',
                      'We propose a custom AI solution roadmap',
                      'You receive a detailed timeline & investment estimate',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                          style={{ background: 'rgba(34,200,229,0.15)', color: GOLD }}
                          aria-hidden="true"
                        >
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {/* Scheduler */}
              <Reveal delay={0.1}>
                <SchedulerWidget />
              </Reveal>
            </div>
          </div>
        </section>

        {/* Social */}
        <section className="py-12 border-t" style={{ borderColor: 'rgba(34,200,229,0.08)' }}>
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-5" style={{ color: 'rgba(34,200,229,0.5)' }}>
              Follow Our Journey
            </p>
            <div className="flex justify-center gap-6">
              {[
                { icon: Facebook, href: 'http://facebook.com/evobrandconcepts', label: 'Facebook' },
                { icon: Linkedin, href: 'https://www.linkedin.com/company/evobrand-concepts/', label: 'LinkedIn' },
                { icon: Instagram, href: 'https://www.instagram.com/evobrandconcepts', label: 'Instagram' },
                { icon: Youtube, href: 'https://www.youtube.com/channel/UC8z66n8_seQVY5PjBEDMM7w', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`EVOBRAND on ${label}`}
                  className="w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5] focus-visible:outline-offset-2"
                  style={{ borderColor: 'rgba(34,200,229,0.2)', color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; e.currentTarget.style.background = 'rgba(34,200,229,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(34,200,229,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
