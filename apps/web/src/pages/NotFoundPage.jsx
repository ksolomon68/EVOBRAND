import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, Sparkles } from 'lucide-react';
import SEO from '@/components/SEO.jsx';

/* ───── Floating particle component ───── */
function Particle({ delay, duration, x, y, size }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: 'radial-gradient(circle, rgba(34,200,229,0.4) 0%, transparent 70%)',
      }}
      animate={{
        y: [0, -40, 0],
        x: [0, 15, -15, 0],
        opacity: [0, 0.8, 0],
        scale: [0.5, 1.2, 0.5],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

/* ───── Glitch text effect ───── */
function GlitchText({ children }) {
  return (
    <span className="relative inline-block">
      {/* Shadow layers for the glitch */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 text-[#22c8e5] opacity-70 animate-glitch-1"
        style={{ clipPath: 'inset(20% 0 50% 0)' }}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 text-[#c9a84c] opacity-50 animate-glitch-2"
        style={{ clipPath: 'inset(60% 0 10% 0)' }}
      >
        {children}
      </span>
      {children}
    </span>
  );
}

/* ───── Animated scanning line ───── */
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(34,200,229,0.5), transparent)',
        boxShadow: '0 0 15px rgba(34,200,229,0.3)',
      }}
      animate={{ top: ['0%', '100%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
    />
  );
}

/* ───── ASCII art that reveals with a typewriter effect ───── */
const asciiFrames = [
  '> SCANNING ROUTE...',
  '> 404: RESOURCE NOT FOUND',
  '> INITIATING RECOVERY PROTOCOL...',
  '> READY.',
];

function TerminalOutput() {
  const [lines, setLines] = useState([]);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < asciiFrames.length) {
        setLines(prev => [...prev, asciiFrames[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <div className="font-mono text-xs sm:text-sm text-left max-w-md mx-auto mt-8 bg-black/40 border border-[#22c8e5]/20 rounded-lg p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        <span className="text-white/30 text-[10px] ml-2 tracking-wider uppercase">evobrand terminal</span>
      </div>
      {lines.filter(Boolean).map((line, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className={`${
            line?.includes('404') ? 'text-red-400' : line?.includes('READY') ? 'text-emerald-400' : 'text-[#22c8e5]/80'
          } leading-relaxed`}
        >
          {line}
        </motion.div>
      ))}
      <span className={`text-[#22c8e5] ${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
        █
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   404 NOT FOUND PAGE
   ═══════════════════════════════════════════ */
const NotFoundPage = () => {
  const location = useLocation();
  const containerRef = useRef(null);

  // Generate random particles on mount
  const particles = useRef(
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 3,
    }))
  ).current;

  return (
    <>
      <SEO
        title="404 — Page Not Found | EVOBRAND"
        description="The page you're looking for doesn't exist or has been moved."
      />

      <div
        ref={containerRef}
        className="relative min-h-screen bg-[#0b0f1a] overflow-hidden flex items-center justify-center"
      >
        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(34,200,229,0.06)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.04)_0%,transparent_65%)] pointer-events-none" />

        {/* Animated scan line */}
        <ScanLine />

        {/* Floating particles */}
        {particles.map(p => (
          <Particle key={p.id} {...p} />
        ))}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,200,229,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,200,229,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Main content */}
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          {/* Animated 404 number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15, duration: 0.8 }}
          >
            <h1
              className="text-[120px] sm:text-[160px] md:text-[200px] font-extrabold leading-none tracking-tighter select-none"
              style={{
                background: 'linear-gradient(135deg, #22c8e5 0%, #1a9ab5 40%, #c9a84c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 40px rgba(34,200,229,0.3))',
              }}
            >
              <GlitchText>404</GlitchText>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-[#22c8e5]/70 mb-4">
              Signal Lost
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              This page doesn't exist.
            </h2>
            <p className="text-base sm:text-lg text-white/50 max-w-lg mx-auto leading-relaxed">
              The route <code className="text-[#22c8e5]/80 bg-[#22c8e5]/10 px-2 py-0.5 rounded text-sm">{location.pathname}</code> couldn't be located. It may have been moved, renamed, or never existed.
            </p>
          </motion.div>

          {/* Terminal effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <TerminalOutput />
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <Link
              to="/"
              className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#22c8e5] text-[#003258] rounded-xl font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-[#22c8e5]/30 transition-all duration-300"
            >
              <Home size={16} className="group-hover:scale-110 transition-transform" />
              Back to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-white/15 text-white/70 rounded-xl font-bold text-sm tracking-wide hover:border-[#22c8e5]/40 hover:text-white transition-all duration-300"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
            <Link
              to="/contact"
              className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-[#c9a84c]/30 text-[#c9a84c]/80 rounded-xl font-bold text-sm tracking-wide hover:border-[#c9a84c]/60 hover:text-[#c9a84c] transition-all duration-300"
            >
              <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
              Contact Us
            </Link>
          </motion.div>

          {/* Quick links */}
          <motion.div
            className="mt-12 pt-8 border-t border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/25 mb-4">
              Popular Destinations
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { to: '/services', label: 'Services' },
                { to: '/our-work', label: 'Our Work' },
                { to: '/auditor', label: 'Brand Audit' },
                { to: '/client-portal', label: 'Client Portal' },
                { to: '/resources', label: 'Resources' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-xs text-white/35 hover:text-[#22c8e5] px-3 py-1.5 rounded-lg border border-white/5 hover:border-[#22c8e5]/20 transition-all duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Inline glitch keyframes ── */}
      <style>{`
        @keyframes glitch-1 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-3px, 2px); }
          40% { transform: translate(3px, -2px); }
          60% { transform: translate(-2px, -1px); }
          80% { transform: translate(2px, 1px); }
        }
        @keyframes glitch-2 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(3px, -2px); }
          40% { transform: translate(-3px, 2px); }
          60% { transform: translate(2px, 3px); }
          80% { transform: translate(-2px, -3px); }
        }
        .animate-glitch-1 { animation: glitch-1 3s infinite; }
        .animate-glitch-2 { animation: glitch-2 3s infinite 0.1s; }
      `}</style>
    </>
  );
};

export default NotFoundPage;
