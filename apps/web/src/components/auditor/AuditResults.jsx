import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, TrendingUp, AlertTriangle, Download, Calendar } from 'lucide-react';
import ScoreCounter from './ScoreCounter';
import ScoreRadar from './ScoreRadar';
import { Link } from 'react-router-dom';

const SCAN_PHASES = [
  { icon: '🌐', label: 'Fetching your website...', sub: 'Checking availability, SSL & metadata' },
  { icon: '⚡', label: 'Running PageSpeed analysis...', sub: 'Performance, SEO & accessibility scores' },
  { icon: '🔍', label: 'Scanning Google presence...', sub: 'Search visibility & brand mentions' },
  { icon: '📊', label: 'Analyzing competitive position...', sub: 'Industry benchmarks & gaps' },
  { icon: '🧠', label: 'AI scoring your brand...', sub: 'Claude synthesizing all data points' },
  { icon: '📋', label: 'Building your report...', sub: 'Personalizing recommendations' },
];

const GRADE_COLORS = {
  A: '#22C8E5',
  B: '#4ade80',
  C: '#facc15',
  D: '#fb923c',
  F: '#f87171',
};

const IMPACT_COLORS = {
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

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

const LoadingState = ({ hasWebsite }) => {
  const [phaseIndex, setPhaseIndex] = useState(hasWebsite ? 0 : 4);

  useEffect(() => {
    const phases = hasWebsite ? SCAN_PHASES : SCAN_PHASES.slice(4);
    const interval = setInterval(() => {
      setPhaseIndex((i) => {
        const max = hasWebsite ? SCAN_PHASES.length : SCAN_PHASES.length;
        return Math.min(i + 1, max - 1);
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [hasWebsite]);

  const phases = hasWebsite ? SCAN_PHASES : SCAN_PHASES.slice(4);
  const relativeIndex = hasWebsite ? phaseIndex : phaseIndex - 4;
  const currentPhase = SCAN_PHASES[phaseIndex] || SCAN_PHASES[SCAN_PHASES.length - 1];

  return (
    <div className="fixed inset-0 z-50 bg-[#04080f] flex flex-col items-center justify-center">
      <FilmGrain />
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
        {/* Logo */}
        <motion.img
          src="/logo.png"
          alt="EVOBRAND"
          className="h-16 mb-10"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        {/* Spinner ring */}
        <div className="relative w-20 h-20 mb-8">
          <motion.div className="absolute inset-0 rounded-full border-2 border-[#22C8E5]/20" />
          <motion.div
            className="absolute inset-0 rounded-full border-t-2 border-[#22C8E5]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-t-2 border-[#22C8E5]/40"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          {/* Phase icon in center */}
          <AnimatePresence mode="wait">
            <motion.div
              key={phaseIndex}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center text-xl"
            >
              {currentPhase.icon}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Phase label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phaseIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <p className="text-white font-bold text-xl mb-1">
              {currentPhase.label}
            </p>
            <p className="text-white/40 text-sm">
              {currentPhase.sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Step dots */}
        {hasWebsite && (
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
        )}

        {hasWebsite && (
          <p className="text-white/20 text-xs mt-6 text-center">
            Live internet scan in progress — this takes ~15 seconds
          </p>
        )}
      </div>
    </div>
  );
};

const ScoreHero = ({ report }) => {
  const gradeColor = GRADE_COLORS[report.grade] || '#22C8E5';
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="text-center mb-16"
    >
      <div className="relative inline-block mb-6">
        {/* Glow behind score */}
        <div
          className="absolute inset-0 blur-3xl rounded-full opacity-30"
          style={{ background: '#22C8E5' }}
        />
        <div className="relative flex items-center justify-center gap-6">
          <span
            className="font-bold leading-none"
            style={{ fontSize: 'clamp(80px, 15vw, 140px)', color: '#22C8E5' }}
          >
            <ScoreCounter target={report.overall_score} duration={2.5} />
          </span>
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-2 font-bold text-3xl"
              style={{ borderColor: gradeColor, color: gradeColor, background: `${gradeColor}15` }}
            >
              {report.grade}
            </div>
            <span className="text-white/40 text-xs mt-1 ">Grade</span>
          </div>
        </div>
      </div>
      <p className="text-white/40 text-sm uppercase tracking-widest mb-4">Overall Brand Score</p>
      <h2 className="text-2xl md:text-3xl font-bold text-white max-w-2xl mx-auto leading-tight">
        {report.headline}
      </h2>
    </motion.div>
  );
};

const CategoryCard = ({ cat, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-bold text-white text-lg">{cat.label}</h3>
      <span className="font-bold text-[#22C8E5] text-2xl">{cat.score}</span>
    </div>
    <div className="w-full h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-[#22C8E5]"
        initial={{ width: 0 }}
        animate={{ width: `${cat.score}%` }}
        transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
      />
    </div>
    <p className="text-white/50 text-sm leading-relaxed">{cat.insight}</p>
  </motion.div>
);

const RecommendationCard = ({ rec, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 border-t-2"
    style={{ borderTopColor: '#22C8E5' }}
  >
    <div className="flex items-start justify-between mb-4">
      <span className="font-bold text-[#22C8E5]/30 text-5xl leading-none">
        {String(rec.priority).padStart(2, '0')}
      </span>
      <div className="flex gap-2 flex-wrap justify-end">
        <span className={`text-xs px-2 py-1 rounded-2xl border font-semibold ${IMPACT_COLORS[rec.impact]}`}>
          {rec.impact} Impact
        </span>
        <span className="text-xs px-2 py-1 rounded-2xl border border-white/10 text-white/40 ">
          {rec.effort} Effort
        </span>
      </div>
    </div>
    <h3 className="font-bold text-white text-xl mb-3">{rec.title}</h3>
    <p className="text-white/60 text-sm leading-relaxed">{rec.detail}</p>
  </motion.div>
);

const normalizeRecs = (raw) => {
  let arr = raw;
  if (!arr) return [];
  // Handle object-shaped recommendations: { "1": {...}, "2": {...} }
  if (!Array.isArray(arr) && typeof arr === 'object') {
    arr = Object.values(arr);
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((r) => r && typeof r === 'object')
    .map((r, i) => ({
      priority: r.priority ?? (i + 1),
      impact: r.impact || r.impact_level || r.impactLevel || 'Medium',
      effort: r.effort || r.effort_level || r.effortLevel || 'Medium',
      title: r.title || r.name || r.recommendation || r.action || r.summary || `Recommendation ${i + 1}`,
      detail: r.detail || r.description || r.details || r.body || '',
    }));
};

const normalizeReport = (report) => {
  console.log('[AuditResults] raw report:', JSON.stringify(report).slice(0, 400));
  const rawScore = report.overall_score ?? report.overallScore ?? report.score;
  return {
    ...report,
    overall_score: Number.isFinite(Number(rawScore)) ? Number(rawScore) : 0,
    grade: report.grade || 'C',
    headline: report.headline || report.summary || '',
    strengths: Array.isArray(report.strengths) ? report.strengths : [],
    gaps: Array.isArray(report.gaps) ? report.gaps : [],
    recommendations: normalizeRecs(report.recommendations),
    categories: report.categories && !Array.isArray(report.categories)
      ? report.categories
      : Array.isArray(report.categories)
        ? Object.fromEntries(report.categories.map((c, i) => [`cat${i}`, c]))
        : {},
    cta: report.cta || '',
  };
};

const AuditResults = ({ report, onDownloadPDF, isLoading, hasWebsite }) => {
  if (isLoading) return <LoadingState hasWebsite={hasWebsite} />;
  if (!report) return null;

  const normalized = normalizeReport(report);
  const categories = normalized.categories ? Object.values(normalized.categories) : [];

  const handleDownloadPDF = async () => {
    if (onDownloadPDF) onDownloadPDF();
  };

  return (
    <div className="min-h-screen bg-[#04080f] pt-8 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Score Hero */}
        <ScoreHero report={normalized} />

        {/* Radar + Categories Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col"
          >
            <h3 className="font-bold text-white text-xl mb-4 text-center">Brand Radar</h3>
            <ScoreRadar categories={normalized.categories} />
          </motion.div>

          {/* Category breakdown */}
          <div className="flex flex-col gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white text-base">{cat.label}</span>
                  <span className="font-bold text-[#22C8E5]">{cat.score}/100</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#22C8E5]"
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.score}%` }}
                    transition={{ duration: 0.9, delay: 0.5 + i * 0.08, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Strengths & Gaps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="grid md:grid-cols-2 gap-6 mb-16"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white text-xl mb-5 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-400" />
              What's Working
            </h3>
            <ul className="space-y-3">
              {normalized.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-white/70 text-sm leading-relaxed">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white text-xl mb-5 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#22C8E5]" />
              Where to Grow
            </h3>
            <ul className="space-y-3">
              {normalized.gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-3 text-white/70 text-sm leading-relaxed">
                  <ArrowRight size={14} className="text-[#22C8E5] mt-1 flex-shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mb-16"
        >
          <h3 className="font-bold text-white text-2xl md:text-3xl mb-6">
            Your Action Plan
          </h3>
          <div className="grid md:grid-cols-3 gap-5">
            {normalized.recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} delay={1.2 + i * 0.1} />
            ))}
          </div>
        </motion.div>

        {/* CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.5 }}
          className="bg-gradient-to-br from-[#003258] to-[#022040] border border-[#22C8E5]/20 rounded-2xl p-8 md:p-10 text-center"
        >
          <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto leading-relaxed">
            {normalized.cta}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-4 justify-center mb-6">
            <div className="flex flex-col items-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 bg-[#22C8E5] text-[#003258] rounded-2xl font-bold uppercase tracking-wider hover:bg-[#1db5d0] transition-colors"
                id="audit-book-call-btn"
              >
                <Calendar size={18} />
                Book a Free Strategy Call
              </Link>
            </div>
            <div className="flex flex-col items-center">
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 border border-[#22C8E5]/40 text-[#22C8E5] rounded-2xl font-bold uppercase tracking-wider hover:border-[#22C8E5] transition-colors cursor-pointer h-[56px]"
                id="audit-download-pdf-btn"
              >
                <Download size={18} />
                Download PDF Report
              </button>
            </div>
          </div>
          <p className="text-white/30 text-sm ">
            Keisha Solomon · CEO, EVOBRAND Concepts · Dallas, TX
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuditResults;
