import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Mail, Phone, MapPin, Clock, Facebook, Youtube, Linkedin, Instagram, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase.js';
import SchedulerWidget from '@/components/scheduler/SchedulerWidget.jsx';
import SEO from '@/components/SEO.jsx';

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
    lines: [{ text: 'Dallas, Texas' }],
  },
  {
    icon: Clock,
    label: 'Office Hours',
    lines: [{ text: 'Mon – Fri' }, { text: '10:00 AM – 6:00 PM CST' }],
  },
];

// ─── Contact Form ─────────────────────────────────────────────────────────────

function ContactForm() {
  const [form, setForm] = useState({ service: '', name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('error');
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setStatus('loading');
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          service: form.service,
          message: form.message.trim(),
        },
      });

      if (error || data?.error) throw new Error(data?.error ?? error?.message ?? 'Send failed');

      setStatus('success');
      setForm({ service: '', name: '', email: '', message: '' });
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
        className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c8e5]"
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
  const heroRef = useRef(null);
  const methodsRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      heroRef.current?.children,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
    if (methodsRef.current) {
      gsap.fromTo(
        methodsRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: methodsRef.current, start: 'top 85%' },
        }
      );
    }
  }, []);

  return (
    <>
      <SEO 
        title="Contact Us"
        description="Schedule a free AI consultation with EVOBRAND. Learn how our custom AI solutions can transform your business. Dallas based experts."
      />

      <div className="min-h-screen" style={{ background: NAVY }}>
        {/* Hero */}
        <section className="py-24" style={{ background: `linear-gradient(135deg, #0D1E35 0%, ${NAVY} 100%)` }}>
          <div className="container mx-auto px-4 text-center">
            <div ref={heroRef}>
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>
                Get in Touch
              </p>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-5">
                Let's <span style={{ color: GOLD }}>Connect</span>
              </h1>
              <div className="w-12 h-0.5 mx-auto mb-6" style={{ background: GOLD }} aria-hidden="true" />
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Ready to transform your business with AI? Reach out for a free 30-minute consultation — no obligation.
              </p>
            </div>
          </div>
        </section>

        {/* Contact method cards */}
        <section className="py-12 border-y" style={{ background: 'rgba(13,30,53,0.6)', borderColor: `rgba(34,200,229,0.08)` }}>
          <div className="container mx-auto px-4">
            <div ref={methodsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CONTACT_METHODS.map(({ icon: Icon, label, lines }) => (
                <div
                  key={label}
                  className="p-6 rounded-2xl text-center border transition-all duration-300 hover:border-[#22c8e5]/30"
                  style={{ background: 'rgba(10,22,40,0.6)', borderColor: 'rgba(34,200,229,0.1)' }}
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main content: form + scheduler */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
              {/* Contact Form */}
              <div
                className="rounded-2xl p-8 border"
                style={{ background: 'rgba(13,30,53,0.7)', borderColor: 'rgba(34,200,229,0.12)', backdropFilter: 'blur(10px)' }}
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
              </div>

              {/* Scheduler */}
              <div>
                <SchedulerWidget />
              </div>
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
