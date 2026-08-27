import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Download, Calendar, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScoreCounter from '@/components/auditor/ScoreCounter';

const GRADE_COLORS = { A: '#22C8E5', B: '#4ade80', C: '#facc15', D: '#fb923c', F: '#f87171' };
const RISK_COLORS = { Low: '#4ade80', Moderate: '#facc15', High: '#fb923c', Critical: '#f87171' };
const SEVERITY_COLORS = {
  Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  Serious: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Minor: 'bg-white/10 text-white/50 border-white/15',
};

const SCAN_PHASES = [
  { icon: '🌐', label: 'Fetching your website...', sub: 'Checking availability & markup' },
  { icon: '🔍', label: 'Running Lighthouse accessibility audit...', sub: 'Checking against WCAG success criteria' },
  { icon: '🏗️', label: 'Analyzing page structure...', sub: 'Headings, landmarks, forms, ARIA' },
  { icon: '🧠', label: 'AI compiling your report...', sub: 'Prioritizing fixes by impact' },
];

const FilmGrain = () => (
  <div
    className="absolute inset-0 pointer-events-none z-0 opacity-[0.035]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '128px',
    }}
  />
);

const LoadingState = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((i) => Math.min(i + 1, SCAN_PHASES.length - 1));
    }, 2200);
    return () => clearInterval(interval);
  }, []);
  const phase = SCAN_PHASES[phaseIndex];

  return (
    <div className="fixed inset-0 z-50 bg-[#04080f] flex flex-col items-center justify-center">
      <FilmGrain />
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
        <motion.img
          src="/logo.png"
          alt="EVOBRAND"
          className="h-16 mb-10"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <div className="relative w-20 h-20 mb-8">
          <motion.div className="absolute inset-0 rounded-full border-2 border-[#22C8E5]/20" />
          <motion.div
            className="absolute inset-0 rounded-full border-t-2 border-[#22C8E5]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={phaseIndex}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center text-xl"
            >
              {phase.icon}
            </motion.div>
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={phaseIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <p className="text-white font-bold text-xl mb-1">{phase.label}</p>
            <p className="text-white/40 text-sm">{phase.sub}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center gap-2">
          {SCAN_PHASES.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                width: i === phaseIndex ? 20 : 6,
                height: 6,
                backgroundColor: i <= phaseIndex ? '#22C8E5' : 'rgba(255,255,255,0.1)',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <p className="text-white/20 text-xs mt-6 text-center">Live accessibility scan in progress — this takes ~15-20 seconds</p>
      </div>
    </div>
  );
};

const normalizeReport = (report) => {
  const pourEntries = report.pour && typeof report.pour === 'object' ? Object.values(report.pour) : [];
  return {
    ...report,
    overall_score: Number.isFinite(Number(report.overall_score)) ? Number(report.overall_score) : 0,
    grade: report.grade || 'C',
    risk_level: report.risk_level || 'Moderate',
    headline: report.headline || 'Your accessibility scan is complete.',
    pour: pourEntries.length > 0 ? pourEntries : [
      { label: 'Perceivable', score: 60, insight: 'Based on automated scan results.' },
      { label: 'Operable', score: 60, insight: 'Based on automated scan results.' },
      { label: 'Understandable', score: 60, insight: 'Based on automated scan results.' },
      { label: 'Robust', score: 60, insight: 'Based on automated scan results.' },
    ],
    critical_issues: Array.isArray(report.critical_issues) ? report.critical_issues : [],
    quick_wins: Array.isArray(report.quick_wins) ? report.quick_wins : [],
    roadmap: Array.isArray(report.roadmap) ? report.roadmap : [],
    disclaimer: report.disclaimer || 'This is an automated and heuristic scan, not a substitute for a full manual WCAG audit or legal advice.',
    cta: report.cta || 'Ready to make your site accessible to everyone?',
  };
};

const AccessibilityResults = ({ report, isLoading, onDownloadPDF }) => {
  if (isLoading) return <LoadingState />;
  if (!report) return null;

  const r = normalizeReport(report);
  const gradeColor = GRADE_COLORS[r.grade] || '#22C8E5';
  const riskColor = RISK_COLORS[r.risk_level] || '#facc15';

  return (
    <div className="min-h-screen bg-[#04080f] pt-8 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Score Hero */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 blur-3xl rounded-full opacity-30" style={{ background: '#22C8E5' }} />
            <div className="relative flex items-center justify-center gap-6">
              <span className="font-bold leading-none" style={{ fontSize: 'clamp(80px, 15vw, 140px)', color: '#22C8E5' }}>
                <ScoreCounter target={r.overall_score} duration={2.5} />
              </span>
              <div className="flex flex-col items-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center border-2 font-bold text-3xl"
                  style={{ borderColor: gradeColor, color: gradeColor, background: `${gradeColor}15` }}
                >
                  {r.grade}
                </div>
                <span className="text-white/40 text-xs mt-1">Grade</span>
              </div>
            </div>
          </div>
          <p className="text-white/40 text-sm uppercase tracking-widest mb-3">Accessibility Score</p>
          <div className="flex justify-center mb-4">
            <span
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest"
              style={{ background: `${riskColor}18`, color: riskColor, border: `1px solid ${riskColor}40` }}
            >
              <ShieldAlert size={13} />
              {r.risk_level} Risk
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white max-w-2xl mx-auto leading-tight">{r.headline}</h2>
        </motion.div>

        {/* POUR Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16"
        >
          {r.pour.map((cat, i) => (
            <div key={cat.label || i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">{cat.label}</span>
                <span className="font-bold text-[#22C8E5] text-xl">{cat.score}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mb-3 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#22C8E5]"
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.score}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-white/50 text-xs leading-relaxed">{cat.insight}</p>
            </div>
          ))}
        </motion.div>

        {/* Critical Issues */}
        {r.critical_issues.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-16"
          >
            <h3 className="font-bold text-white text-2xl md:text-3xl mb-6 flex items-center gap-3">
              <AlertTriangle size={26} className="text-orange-400" />
              Issues Found
            </h3>
            <div className="space-y-4">
              {r.critical_issues.map((issue, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.06 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                    <h4 className="font-bold text-white text-lg">{issue.title}</h4>
                    <span className={`text-xs px-2.5 py-1 rounded-2xl border font-semibold whitespace-nowrap ${SEVERITY_COLORS[issue.severity] || SEVERITY_COLORS.Moderate}`}>
                      {issue.severity}
                    </span>
                  </div>
                  {issue.wcag && (
                    <p className="text-[#22C8E5]/70 text-xs font-mono mb-3">WCAG {issue.wcag}</p>
                  )}
                  <p className="text-white/60 text-sm leading-relaxed mb-2">{issue.detail}</p>
                  <p className="text-white/40 text-sm leading-relaxed"><span className="text-white/60 font-semibold">Fix: </span>{issue.fix}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Wins */}
        {r.quick_wins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-16"
          >
            <h3 className="font-bold text-white text-xl mb-5 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-400" />
              Quick Wins
            </h3>
            <ul className="space-y-3">
              {r.quick_wins.map((w, i) => (
                <li key={i} className="flex items-start gap-3 text-white/70 text-sm leading-relaxed">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Roadmap */}
        {r.roadmap.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mb-16"
          >
            <h3 className="font-bold text-white text-2xl md:text-3xl mb-6">Your 90-Day Remediation Plan</h3>
            <div className="grid md:grid-cols-3 gap-5">
              {r.roadmap.map((phase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <p className="text-[#22C8E5] text-xs font-bold uppercase tracking-widest mb-2">{phase.phase}</p>
                  <h4 className="font-bold text-white text-lg mb-4">{phase.focus}</h4>
                  <ul className="space-y-2.5">
                    {phase.actions.map((a, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-white/60 text-sm leading-relaxed">
                        <span className="w-1.5 h-1.5 bg-[#22C8E5] rounded-full mt-1.5 flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="bg-gradient-to-br from-[#003258] to-[#022040] border border-[#22C8E5]/20 rounded-2xl p-8 md:p-10 text-center"
        >
          <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto leading-relaxed">{r.cta}</p>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-4 justify-center mb-6">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 bg-[#22C8E5] text-[#003258] rounded-2xl font-bold uppercase tracking-wider hover:bg-[#1db5d0] transition-colors"
            >
              <Calendar size={18} />
              Book a Free Strategy Call
            </Link>
            <button
              onClick={onDownloadPDF}
              className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 border border-[#22C8E5]/40 text-[#22C8E5] rounded-2xl font-bold uppercase tracking-wider hover:border-[#22C8E5] transition-colors cursor-pointer h-[56px]"
            >
              <Download size={18} />
              Download PDF Report
            </button>
          </div>
          <p className="text-white/30 text-xs max-w-xl mx-auto leading-relaxed mb-3">{r.disclaimer}</p>
          <p className="text-white/30 text-sm">Keisha Solomon · CEO, EVOBRAND Concepts · Ellis County, TX</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AccessibilityResults;
