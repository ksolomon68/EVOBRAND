import React, { useRef, useState } from 'react';
import { Sparkles, ListChecks, Upload, X, Send, Loader2, CheckCircle2, AlertCircle, Palette, Rocket, ShieldCheck } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { PageHero, Reveal, TiltCard } from '@/components/motion/PageMotion.jsx';

const GOLD = '#22c8e5';
const NAVY = '#003258';
const BEIGE = '#ffffff';
const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5 MB, matches server-side multer limit

const BENEFITS = [
  {
    icon: Sparkles,
    title: 'Built For Your Business',
    text: "No generic template — your demo portal is shaped around the requirements you send us.",
  },
  {
    icon: Palette,
    title: 'Your Branding',
    text: 'Upload your logo and we’ll style the portal to match your business identity.',
  },
  {
    icon: ShieldCheck,
    title: 'No Obligation',
    text: "It's free to request and free to review. Decide if it's a fit once you see it live.",
  },
];

const STEPS = [
  { step: '01', title: 'Tell Us What You Need', text: 'Share your requirements and, if you have one, your logo.' },
  { step: '02', title: 'We Build Your Demo', text: 'Our team designs a live, working portal shaped around your business.' },
  { step: '03', title: 'You Review, Free', text: "We walk you through it. No cost, no pressure, no commitment." },
];

function DemoPortalForm() {
  const [form, setForm] = useState({ name: '', business: '', email: '', phone: '', requirements: '', website: '' });
  const [logo, setLogo] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
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
    if (!form.name.trim() || !form.business.trim() || !form.email.trim() || !form.requirements.trim()) {
      setStatus('error');
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setStatus('loading');
    try {
      const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api/contacts/submit'
        : 'https://evobrandconcepts.com/api/contacts/submit';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const message = `Business Name: ${form.business.trim()}${form.phone.trim() ? `\nPhone: ${form.phone.trim()}` : ''}\n\nRequesting a free custom demo portal.`;

      const body = new FormData();
      body.append('name', form.name.trim());
      body.append('email', form.email.trim());
      body.append('subject', 'Custom AI Applications');
      body.append('message', message);
      body.append('requirements', form.requirements.trim());
      body.append('subscribeNewsletter', false);
      body.append('website', form.website);
      if (logo) body.append('logo', logo);

      let response;
      try {
        response = await fetch(API_URL, { method: 'POST', signal: controller.signal, body });
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
      setForm({ name: '', business: '', email: '', phone: '', requirements: '', website: '' });
      setLogo(null);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to send your request. Please try again or email us directly.');
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
        <h3 className="text-xl font-bold mb-2" style={{ color: BEIGE }}>Request Received</h3>
        <p className="text-sm mb-6 max-w-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Thanks! We'll review your requirements and reach out within 1 business day to walk you through your free demo portal.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="text-xs font-bold uppercase tracking-widest rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
          style={{ color: 'rgba(34,200,229,0.6)' }}
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Free demo portal request form">
      {/* Honeypot — hidden from sighted/keyboard users, but present in the DOM
          for bots that auto-fill every field. Server rejects silently if set. */}
      <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
        <label htmlFor="dp-website">Website</label>
        <input
          id="dp-website"
          name="website"
          type="text"
          value={form.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dp-name" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: GOLD }}>
            Full Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="dp-name"
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
          <label htmlFor="dp-business" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: GOLD }}>
            Business Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="dp-business"
            name="business"
            type="text"
            value={form.business}
            onChange={handleChange}
            required
            autoComplete="organization"
            className={inputClass}
            style={inputStyle}
            placeholder="Your business name"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dp-email" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: GOLD }}>
            Email Address <span aria-hidden="true">*</span>
          </label>
          <input
            id="dp-email"
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
          <label htmlFor="dp-phone" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: GOLD }}>
            Phone <span className="normal-case font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>(optional)</span>
          </label>
          <input
            id="dp-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            autoComplete="tel"
            className={inputClass}
            style={inputStyle}
            placeholder="(555) 555-5555"
          />
        </div>
      </div>

      <div>
        <label htmlFor="dp-requirements" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: GOLD }}>
          Project Requirements <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="dp-requirements"
          name="requirements"
          value={form.requirements}
          onChange={handleChange}
          rows={5}
          required
          className={inputClass}
          style={inputStyle}
          placeholder="List the features, pages, or workflows you'd like in your demo portal..."
        />
      </div>

      <div>
        <label htmlFor="dp-logo" className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: GOLD }}>
          Business Logo <span className="normal-case font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>(optional, max 5MB)</span>
        </label>
        {logo ? (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm" style={inputStyle}>
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
            htmlFor="dp-logo"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm cursor-pointer border border-dashed transition-colors hover:border-[#22c8e5]/50"
            style={{ ...inputStyle, color: 'rgba(255,255,255,0.5)' }}
          >
            <Upload size={15} aria-hidden="true" />
            <span>Upload logo (PNG, JPG, SVG, GIF, or WebP)</span>
          </label>
        )}
        <input
          id="dp-logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
          onChange={handleLogoChange}
          className="sr-only"
        />
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
            <span>Request My Free Demo Portal</span>
          </>
        )}
      </button>
    </form>
  );
}

export default function FreeDemoPortalPage() {
  return (
    <>
      <SEO
        title="Free Custom Demo Portal | Custom AI Applications — EVOBRAND"
        description="Get a free, custom-built demo portal for your business. Share your requirements and logo, and EVOBRAND will build a live demo tailored to you — no cost, no obligation."
        keywords="free demo portal, custom AI application demo, custom portal request, EVOBRAND demo portal, free AI app demo"
        canonical="https://evobrand.net/free-demo-portal"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Custom AI Application Demo Portal",
          "provider": {
            "@type": "Organization",
            "name": "EVOBRAND Concepts LLC",
            "url": "https://evobrand.net"
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Free custom demo portal request for Custom AI Applications"
          }
        }}
      />

      <div className="min-h-screen bg-[#0f1419]">
        <PageHero
          eyebrow="Custom AI Applications"
          lines={[[{ t: 'Your' }, { t: 'Free' }, { t: 'Demo', accent: true }, { t: 'Portal', accent: true }]]}
          sub="Tell us what you need and share your logo — we'll build a live, customized demo portal for your business. Free to request, free to review."
        />

        {/* Benefits */}
        <section className="py-12 border-y" style={{ background: 'rgba(26,35,50,0.5)', borderColor: 'rgba(34,200,229,0.08)' }}>
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-3 gap-4">
              {BENEFITS.map(({ icon: Icon, title, text }, index) => (
                <Reveal key={title} delay={index * 0.08}>
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
                    <h3 className="text-white font-bold text-sm mb-2">{title}</h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{text}</p>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works + Form */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
              {/* How it works */}
              <Reveal>
                <div className="flex items-center gap-3 mb-7">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(34,200,229,0.1)' }}
                    aria-hidden="true"
                  >
                    <Rocket size={15} style={{ color: GOLD }} />
                  </div>
                  <h2 className="text-base font-bold tracking-wide" style={{ color: BEIGE }}>
                    How It Works
                  </h2>
                </div>

                <div className="space-y-6">
                  {STEPS.map(({ step, title, text }) => (
                    <div key={step} className="flex gap-4">
                      <span
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'rgba(34,200,229,0.1)', color: GOLD }}
                        aria-hidden="true"
                      >
                        {step}
                      </span>
                      <div>
                        <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-8 p-5 rounded-2xl border flex gap-3"
                  style={{ background: 'rgba(34,200,229,0.05)', borderColor: 'rgba(34,200,229,0.15)' }}
                >
                  <ListChecks size={18} style={{ color: GOLD }} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    The more detail you give us about your requirements — features, pages, workflows, integrations — the closer your demo will be to what you actually need.
                  </p>
                </div>
              </Reveal>

              {/* Form */}
              <Reveal
                delay={0.1}
                className="rounded-2xl p-8 border"
                style={{ background: '#1a2332', borderColor: 'rgba(34,200,229,0.12)' }}
              >
                <div className="flex items-center gap-3 mb-7">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(34,200,229,0.1)' }}
                    aria-hidden="true"
                  >
                    <Sparkles size={15} style={{ color: GOLD }} />
                  </div>
                  <h2 className="text-base font-bold tracking-wide" style={{ color: BEIGE }}>
                    Request Your Free Demo Portal
                  </h2>
                </div>
                <DemoPortalForm />
              </Reveal>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
