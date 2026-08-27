import React, { useState, Component } from 'react';
import { motion } from 'framer-motion';
import { KineticHeadline, Reveal } from '@/components/motion/PageMotion.jsx';
import AccessibilityForm from '@/components/accessibility/AccessibilityForm';
import SEO from '@/components/SEO.jsx';
import AccessibilityResults from '@/components/accessibility/AccessibilityResults';
import { downloadAccessibilityPDF } from '@/components/accessibility/AccessibilityPDF';

class CheckerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[CheckerErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#04080f] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-4xl mb-4">⚠️</p>
            <h2 className="text-white text-xl font-bold mb-3">Something went wrong</h2>
            <p className="text-white/50 text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred while scanning your site.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); this.props.onReset?.(); }}
              className="px-6 py-3 bg-[#22C8E5] text-[#003258] rounded-2xl font-bold uppercase tracking-wider hover:bg-[#1db5d0] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : window.location.origin;

const ACCESSIBILITY_API_URL = `${API_BASE}/api/accessibility/check`;

const AccessibilityCheckerPage = () => {
  const [phase, setPhase] = useState('form'); // 'form' | 'loading' | 'results'
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [businessName, setBusinessName] = useState('');

  const resetChecker = () => {
    setPhase('form');
    setReport(null);
    setError(null);
  };

  const handleFormComplete = async (formData) => {
    setPhase('loading');
    setError(null);
    setBusinessName(formData.businessName || '');

    try {
      const res = await fetch(ACCESSIBILITY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setReport(data);
      setPhase('results');
      if (data.id) {
        window.history.replaceState(null, '', `/accessibility-checker/results/${data.id}`);
      }
    } catch (err) {
      console.error('Accessibility check error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setPhase('form');
    }
  };

  const handleDownloadPDF = () => {
    if (report) {
      downloadAccessibilityPDF(report, businessName || report.businessName || 'Your Business');
    }
  };

  return (
    <>
      <SEO
        title="Free Website Accessibility Checker | WCAG Scan & Report | EVOBRAND"
        description="Scan your website for WCAG 2.1 accessibility issues in under a minute. Real Lighthouse audit data, prioritized fixes, and a 90-day remediation plan — free."
        keywords="accessibility checker, WCAG checker, ADA compliance scan, website accessibility audit, free accessibility report, EVOBRAND accessibility"
        canonical="https://evobrand.net/accessibility-checker"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "EVOBRAND Accessibility Checker",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "description": "Free WCAG accessibility scanner that audits a website and produces a prioritized remediation report.",
          "provider": {
            "@type": "Organization",
            "name": "EVOBRAND Concepts LLC",
            "url": "https://evobrand.net"
          }
        }}
      />

      <CheckerErrorBoundary onReset={resetChecker}>
        {phase === 'loading' && <AccessibilityResults isLoading={true} report={null} />}

        {phase === 'results' && report && (
          <AccessibilityResults
            report={report}
            isLoading={false}
            onDownloadPDF={handleDownloadPDF}
          />
        )}

        {phase === 'form' && (
          <div className="min-h-screen bg-[#04080f]">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#003258]/80 to-transparent" />
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
                  backgroundSize: '56px 56px',
                  maskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black, transparent)',
                  WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black, transparent)',
                }}
              />
              <div className="relative container mx-auto px-4 pt-20 pb-16 text-center">
                <Reveal>
                  <span className="inline-block px-4 py-1.5 rounded-full bg-[#22C8E5]/10 border border-[#22C8E5]/20 text-[#22C8E5] text-[11px] font-bold tracking-[0.25em] uppercase mb-6">
                    AI-Powered · Free · Real WCAG Scan
                  </span>
                </Reveal>
                <KineticHeadline
                  lines={[
                    [{ t: 'Is' }, { t: 'Your' }, { t: 'Site' }],
                    [
                      { t: 'Accessible?', accent: true },
                    ],
                  ]}
                  className="text-4xl md:text-6xl font-bold text-white mb-4"
                />
                <Reveal delay={0.45}>
                  <p className="text-white/60 text-lg max-w-xl mx-auto">
                    Scan your website against WCAG 2.1 in under a minute. Real Lighthouse audit data, prioritized fixes, and a 90-day remediation plan.
                  </p>
                </Reveal>
              </div>
            </div>

            <div className="container mx-auto px-4 max-w-2xl pb-20">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  ⚠ {error}
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10"
              >
                <AccessibilityForm onComplete={handleFormComplete} />
              </motion.div>

              <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/30 text-xs">
                <span>🔒 Your data is private</span>
                <span>⚡ Results in seconds</span>
                <span>📧 Report emailed to you</span>
                <span>📞 No spam, ever</span>
              </div>
            </div>
          </div>
        )}
      </CheckerErrorBoundary>
    </>
  );
};

export default AccessibilityCheckerPage;
