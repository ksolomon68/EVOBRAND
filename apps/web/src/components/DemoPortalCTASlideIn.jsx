import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { usePrefersReducedMotion } from '@/components/motion/PageMotion.jsx';

const GOLD = '#22c8e5';
const NAVY = '#003258';
const DISMISS_KEY = 'evobrand_demo_cta_dismissed';
const SCROLL_THRESHOLD = 600;
const FALLBACK_DELAY_MS = 6000;

/**
 * DemoPortalCTASlideIn — bottom-left slide-in promoting the free custom
 * demo portal (/free-demo-portal). Appears once per session, after the
 * visitor scrolls past the hero (or after a short delay on short pages),
 * and stays dismissed for the rest of the session once closed or clicked.
 * Bottom-left, not bottom-right, to stay clear of the accessibility widget.
 */
export default function DemoPortalCTASlideIn() {
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setVisible(true);
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
    const onScroll = () => {
      if (window.scrollY > SCROLL_THRESHOLD) show();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const timer = setTimeout(show, FALLBACK_DELAY_MS);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="complementary"
          aria-label="Free custom demo portal offer"
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: -40, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -40 }}
          transition={{ duration: reduced ? 0.2 : 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 sm:w-80 z-40"
        >
          <div
            className="relative rounded-2xl border p-5 shadow-2xl backdrop-blur-md"
            style={{ background: 'rgba(15,20,25,0.95)', borderColor: 'rgba(34,200,229,0.25)' }}
          >
            <button
              onClick={dismiss}
              aria-label="Dismiss free demo portal offer"
              className="absolute top-3 right-3 rounded p-1 text-white/40 hover:text-white/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c8e5]"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 mb-2 pr-5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,200,229,0.12)' }}
                aria-hidden="true"
              >
                <Sparkles size={15} style={{ color: GOLD }} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>
                Free Demo Portal
              </p>
            </div>

            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Get a custom AI app portal built for your business — free, no obligation.
            </p>

            <Link
              to="/free-demo-portal"
              onClick={dismiss}
              className="block w-full text-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-90"
              style={{ background: GOLD, color: NAVY }}
            >
              Get My Free Demo
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
