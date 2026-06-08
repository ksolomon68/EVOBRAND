import React, { useState, useEffect, Component } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AuditForm from '@/components/auditor/AuditForm';
import SEO from '@/components/SEO.jsx';
import AuditResults from '@/components/auditor/AuditResults';
import { downloadAuditPDF } from '@/components/auditor/AuditPDF';

// Triggering auto-deploy via GitHub Actions
// Error boundary to prevent black screen on unhandled render errors
class AuditErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[AuditErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#04080f] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-4xl mb-4">⚠️</p>
            <h2 className="text-white text-xl font-bold mb-3">Something went wrong</h2>
            <p className="text-white/50 text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred while generating your audit.'}
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

const SUPABASE_FUNCTION_URL = `${API_BASE}/api/auditor/audit`;

const AuditorPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('form'); // 'form' | 'loading' | 'results'
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [hasWebsite, setHasWebsite] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');

  const resetAudit = () => {
    setPhase('form');
    setReport(null);
    setError(null);
  };

  // Load prefill from sessionStorage (from homepage AuditorSection)
  const prefillData = (() => {
    try {
      const stored = sessionStorage.getItem('evo_audit_prefill');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  })();

  const handleFormComplete = async (formData) => {
    setPhase('loading');
    setError(null);
    setHasWebsite(!!formData.websiteUrl?.trim());
    setBusinessName(formData.businessName || '');
    setContactEmail(formData.contactEmail || '');
    setContactName(formData.firstName || '');
    sessionStorage.removeItem('evo_audit_prefill');

    try {
      const res = await fetch(SUPABASE_FUNCTION_URL, {
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
      // Intentionally not navigating to /auditor/results/:id because backend doesn't persist audits yet
    } catch (err) {
      console.error('Audit error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setPhase('form');
    }
  };

  const handleDownloadPDF = () => {
    if (report) {
      downloadAuditPDF(report, businessName || report.businessName || 'Your Brand');
    }
  };

  return (
    <>
      <SEO
        title="Free AI Brand Audit Tool | Instant Score & Action Plan | EVOBRAND"
        description="Get a free AI-powered brand audit in under 4 minutes. Score your brand across SEO, design, accessibility, social, and digital presence. Instant report + personalized action plan. No sign-up required."
        keywords="free brand audit, AI brand audit, brand score, brand analysis tool, SEO audit, digital presence audit, EVOBRAND audit"
        canonical="https://evobrand.net/auditor"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "EVOBRAND AI Brand Auditor",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "description": "AI-powered brand audit tool that scores your brand across SEO, design, accessibility, and social presence in under 4 minutes.",
          "provider": {
            "@type": "Organization",
            "name": "EVOBRAND Concepts LLC",
            "url": "https://evobrand.net"
          }
        }}
      />

      <AuditErrorBoundary onReset={resetAudit}>
        {phase === 'loading' && <AuditResults isLoading={true} report={null} hasWebsite={hasWebsite} />}

        {phase === 'results' && report && (
          <AuditResults
            report={report}
            isLoading={false}
            onDownloadPDF={handleDownloadPDF}
            prefillEmail={contactEmail}
            prefillName={contactName}
          />
        )}

        {phase === 'form' && (
          <div className="min-h-screen bg-[#04080f]">
            {/* Hero header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#003258]/80 to-transparent" />
              <div className="relative container mx-auto px-4 pt-20 pb-16 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <span className="inline-block px-4 py-1.5 rounded-full bg-[#22C8E5]/10 border border-[#22C8E5]/20 text-[#22C8E5] text-sm tracking-widest uppercase mb-6">
                    AI-Powered · Free · Instant
                  </span>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    HOW STRONG IS YOUR BRAND?
                  </h1>
                  <p className="text-white/60 text-lg max-w-xl mx-auto">
                    Get an honest AI-generated brand score in under 4 minutes. 5-category breakdown. Personalized action plan. No fluff.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Form card */}
            <div className="container mx-auto px-4 max-w-2xl pb-20">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm ">
                  ⚠ {error}
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10"
              >
                <AuditForm onComplete={handleFormComplete} prefillData={prefillData} />
              </motion.div>

              {/* Trust signals */}
              <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/30 text-xs ">
                <span>🔒 Your data is private</span>
                <span>⚡ Results in seconds</span>
                <span>📧 Report emailed to you</span>
                <span>📞 No spam, ever</span>
              </div>
            </div>
          </div>
        )}
      </AuditErrorBoundary>
    </>
  );
};

export default AuditorPage;
