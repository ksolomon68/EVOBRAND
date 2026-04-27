import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AuditForm from '@/components/auditor/AuditForm';
import SEO from '@/components/SEO.jsx';
import AuditResults from '@/components/auditor/AuditResults';
import { downloadAuditPDF } from '@/components/auditor/AuditPDF';

const SUPABASE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/brand-audit`;

const AuditorPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('form'); // 'form' | 'loading' | 'results'
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [hasWebsite, setHasWebsite] = useState(false);

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

      // Navigate to results page with audit ID
      if (data.id) {
        navigate(`/auditor/results/${data.id}`, { replace: true });
      }
    } catch (err) {
      console.error('Audit error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setPhase('form');
    }
  };

  const handleDownloadPDF = () => {
    if (report) {
      downloadAuditPDF(report, report.businessName || 'Your Brand');
    }
  };

  return (
    <>
      <SEO 
        title="Free Brand Audit"
        description="Get an AI-powered brand audit in 4 minutes. Free. No fluff. Instant score, 5-category breakdown, and a personalized action plan from EVOBRAND."
      />

      {phase === 'loading' && <AuditResults isLoading={true} report={null} hasWebsite={hasWebsite} />}

      {phase === 'results' && report && (
        <AuditResults
          report={report}
          isLoading={false}
          onDownloadPDF={handleDownloadPDF}
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
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#22C8E5]/10 border border-[#22C8E5]/20 text-[#22C8E5] text-sm font-[Rajdhani] tracking-widest uppercase mb-6">
                  AI-Powered · Free · Instant
                </span>
                <h1 className="text-4xl md:text-6xl font-[Rajdhani] font-bold text-white mb-4">
                  HOW STRONG IS YOUR BRAND?
                </h1>
                <p className="text-white/60 font-[Source_Sans_3] text-lg max-w-xl mx-auto">
                  Get an honest AI-generated brand score in under 4 minutes. 5-category breakdown. Personalized action plan. No fluff.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Form card */}
          <div className="container mx-auto px-4 max-w-2xl pb-20">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-[Source_Sans_3]">
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
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/30 text-xs font-[Source_Sans_3]">
              <span>🔒 Your data is private</span>
              <span>⚡ Results in seconds</span>
              <span>📧 Report emailed to you</span>
              <span>📞 No spam, ever</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuditorPage;
