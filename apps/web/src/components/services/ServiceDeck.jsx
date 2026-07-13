
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronUp, ChevronDown, X, ArrowRight, TrendingUp } from 'lucide-react';
import { Reveal, TechBackdrop, KineticHeadline, TiltCard } from '@/components/motion/PageMotion.jsx';

const CYAN = '#22c8e5';
const NAVY = '#003258';
const DARK = '#0f1419';
const MID = '#1a2332';

// ── Motion presets matching OurWork page ─────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
  transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] },
};

const slidePanel = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -40 },
  transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
};

// ── Mobile floating pill nav ──────────────────────────────────────────────────
function MobilePillNav({ services, active, onSelect }) {
  const scrollRef = useRef(null);
  const btnRefs = useRef([]);

  // Auto-scroll the pill into view when active changes
  useEffect(() => {
    const btn = btnRefs.current[active];
    const container = scrollRef.current;
    if (!btn || !container) return;
    const left = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
    container.scrollTo({ left, behavior: 'smooth' });
  }, [active]);

  return (
    <div className="md:hidden sticky top-[72px] z-40 w-full" style={{ background: 'rgba(15,20,25,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(34,200,229,0.12)' }}>
      {/* Pill scroll row */}
      <div ref={scrollRef} className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {services.map((s, i) => (
          <button
            key={s.id}
            ref={el => btnRefs.current[i] = el}
            onClick={() => onSelect(i)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
            style={{
              background: active === i ? CYAN : 'rgba(255,255,255,0.05)',
              color: active === i ? NAVY : 'rgba(255,255,255,0.6)',
              border: active === i ? 'none' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: active === i ? `0 0 20px rgba(34,200,229,0.35)` : 'none',
            }}
            aria-pressed={active === i}
          >
            <span className="text-base" aria-hidden="true">{s.emoji}</span>
            <span className="whitespace-nowrap">{s.shortName}</span>
          </button>
        ))}
      </div>
      {/* Dot progress indicator */}
      <div className="flex justify-center gap-1.5 pb-2" aria-hidden="true">
        {services.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: active === i ? 20 : 6,
              height: 4,
              background: active === i ? CYAN : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Desktop left sidebar nav ──────────────────────────────────────────────────
function DesktopSidebar({ services, active, onSelect }) {
  return (
    <aside className="hidden md:flex flex-col gap-1 w-64 lg:w-72 flex-shrink-0 sticky top-[88px] self-start max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4" style={{ color: 'rgba(34,200,229,0.6)' }}>
        Our Services
      </p>
      {services.map((s, i) => (
        <button
          key={s.id}
          onClick={() => onSelect(i)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
          style={{
            background: active === i ? 'rgba(34,200,229,0.1)' : 'transparent',
            borderLeft: active === i ? `3px solid ${CYAN}` : '3px solid transparent',
          }}
          aria-pressed={active === i}
        >
          <span
            className="text-xl flex-shrink-0 transition-transform duration-300"
            style={{ filter: active === i ? `drop-shadow(0 0 8px ${CYAN})` : 'none' }}
            aria-hidden="true"
          >
            {s.emoji}
          </span>
          <div className="min-w-0">
            <p
              className="text-sm font-bold truncate transition-colors duration-300"
              style={{ color: active === i ? CYAN : 'rgba(255,255,255,0.8)' }}
            >
              {s.title}
            </p>
            <p className="text-[11px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {String(i + 1).padStart(2, '0')} of {String(services.length).padStart(2, '0')}
            </p>
          </div>
          {active === i && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: CYAN, boxShadow: `0 0 8px ${CYAN}` }} />
          )}
        </button>
      ))}
    </aside>
  );
}

// ── Feature pill ─────────────────────────────────────────────────────────────
function FeaturePill({ feature, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 0.61, 0.36, 1] }}
      className="flex items-start gap-3 p-4 rounded-xl group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(34,200,229,0.12)' }}>
        <Check size={11} style={{ color: CYAN }} />
      </div>
      <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.82)' }}>{feature}</span>
    </motion.div>
  );
}

// ── Pricing card ─────────────────────────────────────────────────────────────
function PricingCard({ plan, serviceId, getPlanId, onCheckout, index }) {
  const isCustom = plan.price === 'Custom';
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 0.61, 0.36, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className="relative rounded-2xl p-6 flex flex-col"
      style={{
        background: plan.highlighted
          ? `linear-gradient(135deg, rgba(34,200,229,0.12), rgba(34,200,229,0.04))`
          : 'rgba(255,255,255,0.03)',
        border: plan.highlighted ? `2px solid ${CYAN}` : '1px solid rgba(255,255,255,0.07)',
        boxShadow: plan.highlighted ? `0 8px 40px rgba(34,200,229,0.15)` : 'none',
      }}
    >
      {plan.highlighted && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
          style={{ background: CYAN, color: NAVY }}
        >
          Most Popular
        </div>
      )}

      <h3 className="text-base font-bold text-white mb-1">{plan.tier}</h3>
      <p className="text-3xl font-bold mb-1" style={{ color: CYAN }}>{plan.price}</p>
      {!isCustom && <p className="text-[11px] mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>one-time</p>}
      {isCustom && <p className="text-[11px] mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>tailored quote</p>}

      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((f, fi) => (
          <li key={fi} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <Check size={13} className="flex-shrink-0 mt-0.5" style={{ color: CYAN }} />
            {f}
          </li>
        ))}
      </ul>

      {isCustom ? (
        <a
          href="/contact"
          className="w-full py-3 rounded-xl text-sm font-bold text-center transition-all duration-250"
          style={{
            border: `1.5px solid ${CYAN}`,
            color: CYAN,
          }}
        >
          Contact Us
        </a>
      ) : (
        <button
          onClick={() => onCheckout({
            planId: getPlanId(serviceId, plan.tier),
            planName: `${plan.tier} Plan`,
            price: plan.price,
            type: 'one-time',
          })}
          className="w-full py-3 rounded-xl text-sm font-bold text-center transition-all duration-250"
          style={{
            background: plan.highlighted ? CYAN : 'rgba(34,200,229,0.1)',
            color: plan.highlighted ? NAVY : CYAN,
            border: plan.highlighted ? 'none' : `1.5px solid rgba(34,200,229,0.3)`,
          }}
        >
          {plan.cta}
        </button>
      )}
    </motion.div>
  );
}

// ── Maintenance plan card (WordPress sub-section) ────────────────────────────
function MaintenanceCard({ plan, onCheckout, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
      className="relative rounded-2xl p-6 flex flex-col"
      style={{
        background: plan.highlighted ? `linear-gradient(135deg, rgba(34,200,229,0.12), rgba(34,200,229,0.04))` : 'rgba(255,255,255,0.03)',
        border: plan.highlighted ? `2px solid ${CYAN}` : '1px solid rgba(255,255,255,0.07)',
        boxShadow: plan.highlighted ? `0 8px 40px rgba(34,200,229,0.15)` : 'none',
      }}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: CYAN, color: NAVY }}>
          Most Popular
        </div>
      )}
      <h3 className="text-base font-bold text-white mb-1">{plan.tier}</h3>
      <p className="text-3xl font-bold mb-1" style={{ color: CYAN }}>{plan.price}</p>
      <p className="text-[11px] mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>per month</p>
      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((f, fi) => (
          <li key={fi} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <Check size={13} className="flex-shrink-0 mt-0.5" style={{ color: CYAN }} />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => onCheckout({
          planId: `maintenance-${plan.tier.toLowerCase()}`,
          planName: `WordPress Maintenance - ${plan.tier}`,
          price: plan.price.split('/')[0],
          type: 'recurring',
        })}
        className="w-full py-3 rounded-xl text-sm font-bold text-center transition-all duration-250"
        style={{
          background: plan.highlighted ? CYAN : 'rgba(34,200,229,0.1)',
          color: plan.highlighted ? NAVY : CYAN,
          border: plan.highlighted ? 'none' : `1.5px solid rgba(34,200,229,0.3)`,
        }}
      >
        Get {plan.tier}
      </button>
    </motion.div>
  );
}

// ── Mobile pricing drawer ─────────────────────────────────────────────────────
function PricingDrawer({ service, isOpen, onClose, getPlanId, onCheckout }) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 md:hidden"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-3xl overflow-y-auto"
            style={{
              background: 'rgba(18,24,36,0.97)',
              backdropFilter: 'blur(20px)',
              border: `1.5px solid rgba(34,200,229,0.2)`,
              maxHeight: '85vh',
            }}
            role="dialog"
            aria-label={`${service.title} pricing`}
          >
            {/* Handle + header */}
            <div className="sticky top-0 z-10 px-6 pt-4 pb-4" style={{ background: 'rgba(18,24,36,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-0.5" style={{ color: CYAN }}>Pricing</p>
                  <h3 className="text-lg font-bold text-white">{service.title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                  aria-label="Close pricing"
                >
                  <X size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                </button>
              </div>
            </div>

            <div className="px-6 py-6 space-y-4">
              {service.pricing.map((plan, i) => (
                <PricingCard
                  key={plan.tier}
                  plan={plan}
                  serviceId={service.id}
                  getPlanId={getPlanId}
                  onCheckout={(p) => { onCheckout(p); onClose(); }}
                  index={i}
                />
              ))}

              {/* Maintenance sub-section for WordPress */}
              {service.maintenancePlans && (
                <div className="pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1" style={{ background: 'rgba(34,200,229,0.2)' }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: CYAN }}>Ongoing Care</span>
                    <div className="h-px flex-1" style={{ background: 'rgba(34,200,229,0.2)' }} />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">WordPress Maintenance Plans</p>
                  <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>Keep your site fast, secure, and always up to date.</p>
                  {service.maintenancePlans.map((plan, i) => (
                    <div key={plan.tier} className="mb-3">
                      <MaintenanceCard
                        plan={plan}
                        onCheckout={(p) => { onCheckout(p); onClose(); }}
                        index={i}
                      />
                    </div>
                  ))}
                  <a
                    href="/maintenance-plans"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold mt-2"
                    style={{ color: CYAN, border: `1.5px solid rgba(34,200,229,0.2)` }}
                  >
                    View Full Plan Details <ArrowRight size={14} />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Case study banner ─────────────────────────────────────────────────────────
function CaseStudyBanner({ caseStudy }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="mt-8 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
      style={{ background: 'rgba(34,200,229,0.06)', border: '1px solid rgba(34,200,229,0.18)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,200,229,0.12)' }}>
        <TrendingUp size={18} style={{ color: CYAN }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: CYAN }}>{caseStudy.client} — Case Result</p>
        <p className="text-sm font-semibold text-white mb-1">{caseStudy.solution}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {caseStudy.results.map((r) => (
            <span
              key={r}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(34,200,229,0.12)', border: '1px solid rgba(34,200,229,0.2)', color: CYAN }}
            >
              {r}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main ServiceDeck ──────────────────────────────────────────────────────────
export default function ServiceDeck({ services, getPlanId, onCheckout }) {
  const [active, setActive] = useState(0);
  const [pricingOpen, setPricingOpen] = useState(false);
  const currentService = services[active];

  const handleSelect = useCallback((i) => {
    setActive(i);
    setPricingOpen(false);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: DARK }}>
      {/* Mobile pill nav */}
      <MobilePillNav services={services} active={active} onSelect={handleSelect} />

      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="flex gap-10 lg:gap-14">
          {/* Desktop sidebar */}
          <DesktopSidebar services={services} active={active} onSelect={handleSelect} />

          {/* Main content panel */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={active} {...slidePanel}>

                {/* Service header */}
                <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 mb-6" style={{ background: MID, border: '1px solid rgba(255,255,255,0.06)' }}>
                  {/* Faint tech backdrop */}
                  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <TechBackdrop density={20} />
                    <div
                      className="absolute -top-24 -right-24 w-72 h-72 rounded-full"
                      style={{ background: 'radial-gradient(circle, rgba(34,200,229,0.08) 0%, transparent 70%)' }}
                    />
                  </div>

                  <div className="relative">
                    <div className="flex items-start gap-4 mb-6">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
                        style={{ background: 'rgba(34,200,229,0.1)', border: '1px solid rgba(34,200,229,0.2)', boxShadow: `0 0 24px rgba(34,200,229,0.15)` }}
                        aria-hidden="true"
                      >
                        {currentService.emoji}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: CYAN }}>
                          {String(active + 1).padStart(2, '0')} — of {String(services.length).padStart(2, '0')} Services
                        </p>
                        <KineticHeadline
                          as="h2"
                          replayKey={active}
                          delay={0.05}
                          lines={[
                            currentService.title.split(' ').map((word, i, arr) => ({
                              t: word,
                              accent: i === arr.length - 1,
                            })),
                          ]}
                          className="text-2xl md:text-4xl font-bold text-white leading-tight"
                        />
                      </div>
                    </div>
                    <p className="text-base md:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      {currentService.description}
                    </p>
                  </div>
                </div>

                {/* Features grid */}
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4" style={{ color: 'rgba(34,200,229,0.7)' }}>
                    What's included
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentService.features.map((f, i) => (
                      <FeaturePill key={f} feature={f} index={i} />
                    ))}
                  </div>
                </div>

                {/* Process timeline (horizontal on desktop, vertical on mobile) */}
                <div className="mb-6 rounded-2xl p-6 md:p-8" style={{ background: MID, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-6" style={{ color: 'rgba(34,200,229,0.7)' }}>
                    Implementation Process
                  </p>
                  <div className="relative flex flex-col md:flex-row gap-6 md:gap-0 md:justify-between">
                    {/* Connecting line (desktop) */}
                    <div
                      className="hidden md:block absolute top-6 left-10 right-10 h-px"
                      style={{ background: 'rgba(34,200,229,0.15)' }}
                      aria-hidden="true"
                    />
                    {currentService.process.map((step, i) => (
                      <motion.div
                        key={step.step}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                        className="flex md:flex-col items-center md:items-center gap-4 md:gap-3 md:text-center md:flex-1 relative"
                      >
                        <div
                          className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all"
                          style={{
                            background: DARK,
                            borderColor: CYAN,
                            color: CYAN,
                            boxShadow: `0 0 12px rgba(34,200,229,0.18)`,
                          }}
                        >
                          {i + 1}
                        </div>
                        <div className="md:px-1">
                          <p className="text-sm font-bold text-white">{step.step}</p>
                          <p className="text-xs mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>{step.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Case study banner */}
                <CaseStudyBanner caseStudy={currentService.caseStudy} />

                {/* Mobile: "View Pricing" sticky button */}
                <div className="md:hidden mt-8 sticky bottom-6 z-30">
                  <button
                    onClick={() => setPricingOpen(true)}
                    className="w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"
                    style={{
                      background: CYAN,
                      color: NAVY,
                      boxShadow: `0 8px 32px rgba(34,200,229,0.4)`,
                    }}
                  >
                    View Pricing
                    <ChevronUp size={16} />
                  </button>
                </div>

                {/* Desktop: inline pricing section */}
                <div className="hidden md:block mt-10">
                  <div className="flex items-center gap-4 mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: 'rgba(34,200,229,0.7)' }}>
                      Pricing
                    </p>
                    <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  </div>

                  <div className="grid md:grid-cols-3 gap-5">
                    {currentService.pricing.map((plan, i) => (
                      <PricingCard
                        key={plan.tier}
                        plan={plan}
                        serviceId={currentService.id}
                        getPlanId={getPlanId}
                        onCheckout={onCheckout}
                        index={i}
                      />
                    ))}
                  </div>

                  {/* WordPress maintenance sub-section */}
                  {currentService.maintenancePlans && (
                    <div className="mt-12">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1" style={{ background: 'rgba(34,200,229,0.15)' }} />
                        <span
                          className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.25em]"
                          style={{ background: 'rgba(34,200,229,0.07)', border: '1px solid rgba(34,200,229,0.2)', color: CYAN }}
                        >
                          Ongoing Care
                        </span>
                        <div className="h-px flex-1" style={{ background: 'rgba(34,200,229,0.15)' }} />
                      </div>

                      <Reveal>
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold text-white mb-2">WordPress Maintenance Plans</h3>
                          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            Keep your site secure, fast, and always up to date. Never worry about updates, hacks, or downtime again.
                          </p>
                        </div>
                      </Reveal>

                      <div className="grid md:grid-cols-3 gap-5 mb-6">
                        {currentService.maintenancePlans.map((plan, i) => (
                          <MaintenanceCard key={plan.tier} plan={plan} onCheckout={onCheckout} index={i} />
                        ))}
                      </div>

                      <div className="text-center">
                        <a
                          href="/maintenance-plans"
                          className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold transition-all"
                          style={{ border: `1.5px solid rgba(34,200,229,0.25)`, color: CYAN }}
                        >
                          View Full Plan Details <ArrowRight size={14} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile pricing drawer */}
      <PricingDrawer
        service={currentService}
        isOpen={pricingOpen}
        onClose={() => setPricingOpen(false)}
        getPlanId={getPlanId}
        onCheckout={onCheckout}
      />
    </div>
  );
}
