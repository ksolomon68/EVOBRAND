
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Sparkles, Zap, FileText, Video, Code } from 'lucide-react';
import ScrubSection from '@/components/ScrubSection.jsx';
import PageBackgroundScrub from '@/components/PageBackgroundScrub.jsx';
import ScrollProgressRail from '@/components/ScrollProgressRail.jsx';
import {
  KineticHeadline,
  SectionMorphDivider,
} from '@/components/motion/PageMotion.jsx';
import VideoLibrarySection from '@/components/VideoLibrarySection.jsx';
import AuditorSection from '@/components/sections/AuditorSection.jsx';
import ServicesBuiltForScale from '@/components/sections/ServicesBuiltForScale.jsx';
import AICapabilities from '@/components/sections/AICapabilities.jsx';
import SchedulerWidget from '@/components/scheduler/SchedulerWidget.jsx';
import SEO from '@/components/SEO.jsx';
import DemoPortalCTASlideIn from '@/components/DemoPortalCTASlideIn.jsx';

/**
 * CountStat — number counts up while an SVG underline draws itself, both
 * driven by the same tween so they stay perfectly in sync. Triggers once
 * on scroll entry; renders final values under prefers-reduced-motion.
 */
const CountStat = ({ value, suffix, label, delay = 0 }) => {
  const rootRef = useRef(null);
  const numRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const numEl = numRef.current;
    const lineEl = lineRef.current;
    const rootEl = rootRef.current;
    if (!numEl || !lineEl || !rootEl) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      numEl.textContent = `${value}${suffix}`;
      lineEl.style.strokeDashoffset = '0';
      return;
    }

    lineEl.style.strokeDashoffset = '100';
    const state = { p: 0 };
    let tween = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        tween = gsap.to(state, {
          p: 1,
          duration: 1.6,
          delay,
          ease: 'power2.out',
          onUpdate: () => {
            numEl.textContent = `${Math.round(state.p * value)}${suffix}`;
            lineEl.style.strokeDashoffset = String(100 - state.p * 100);
          },
        });
      },
      { threshold: 0.6 }
    );
    io.observe(rootEl);
    return () => {
      io.disconnect();
      if (tween) tween.kill();
    };
  }, [value, suffix, delay]);

  return (
    <div ref={rootRef}>
      <p className="text-3xl font-bold text-white" aria-label={`${value}${suffix} ${label}`}>
        <span ref={numRef} aria-hidden="true">0{suffix}</span>
      </p>
      <svg
        viewBox="0 0 100 2"
        preserveAspectRatio="none"
        className="w-16 h-0.5 mx-auto my-2"
        aria-hidden="true"
      >
        <line
          ref={lineRef}
          x1="0"
          y1="1"
          x2="100"
          y2="1"
          pathLength="100"
          stroke="#22c8e5"
          strokeWidth="2"
          strokeDasharray="100"
          strokeDashoffset="100"
        />
      </svg>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
};

const HomePage = () => {
  const services = [
    {
      icon: <Sparkles size={40} />,
      title: 'Custom AI Applications',
      description: 'Tailored AI solutions that solve your unique business challenges',
      features: ['Machine Learning Models', 'Natural Language Processing', 'Predictive Analytics', 'Automation Workflows'],
      emphasized: true
    },
    {
      icon: <Zap size={40} />,
      title: 'AI Visual Content Creation',
      description: 'Generate stunning visuals and graphics powered by AI',
      features: ['AI-Generated Images', 'Brand Assets', 'Marketing Materials', 'Social Media Content'],
      emphasized: true
    },
    {
      icon: <FileText size={40} />,
      title: 'Intelligent Document Generation',
      description: 'Automate document creation with AI-powered templates',
      features: ['Smart Templates', 'Data Integration', 'Multi-format Export', 'Version Control'],
      emphasized: true
    },
    {
      icon: <Video size={40} />,
      title: 'AI Video Production',
      description: 'Create professional videos with AI assistance',
      features: ['Script Generation', 'Video Editing', 'Voiceover Synthesis', 'Animation'],
      emphasized: true
    },
    {
      icon: <Code size={40} />,
      title: 'WordPress & Web Development',
      description: 'Professional web solutions and WordPress development',
      features: ['Custom WordPress Setup', 'Plugin Configuration', 'E-commerce', 'Maintenance'],
      emphasized: false
    }
  ];

  return (
    <>
      <DemoPortalCTASlideIn />
      <SEO
        title="AI Solutions for Business Growth | Ellis County, TX"
        description="EVOBRAND transforms businesses with custom AI applications, visual content creation, intelligent document generation, and AI video production. Ellis County-based agency serving clients nationwide."
        keywords="AI solutions, custom AI applications, AI transformation, Ellis County AI agency, AI automation, business AI, machine learning, intelligent automation"
        canonical="https://evobrand.net/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "EVOBRAND Concepts LLC",
          "description": "Ellis County-based AI transformation agency delivering custom AI applications, visual content, and intelligent automation.",
          "url": "https://evobrand.net",
          "logo": "https://evobrand.net/logo.png",
          "image": "https://evobrand.net/og-image.png",
          "telephone": "",
          "email": "info@evobrand.net",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Ellis County",
            "addressRegion": "TX",
            "addressCountry": "US"
          },
          "areaServed": "United States",
          "serviceType": ["Custom AI Applications", "AI Visual Content", "AI Video Production", "Web Development", "Intelligent Document Generation"],
          "sameAs": ["https://evobrandconcepts.com"],
          "priceRange": "$$",
          "openingHours": "Mo-Fr 10:00-18:00"
        }}
      />

      <div className="min-h-screen">
        {/* Page-wide scroll-driven background film */}
        <PageBackgroundScrub />

        {/* Chapter progress rail (desktop) */}
        <ScrollProgressRail />

        {/* Hero + scroll-synced image sequence */}
        <div id="story">
          <ScrubSection />
        </div>

        <SectionMorphDivider from="transparent" to="rgba(26,35,50,0.88)" />

        {/* Stats Banner */}
        <section className="py-8" style={{ background: 'rgba(26,35,50,0.88)' }}>
          <div className="container mx-auto px-4">
            <p className="text-center text-xs md:text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">
              Results our clients see
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <CountStat value={10} suffix="x" label="Faster Production" />
              <CountStat value={80} suffix="%" label="Cost Reduction" delay={0.12} />
              <CountStat value={5} suffix="x" label="ROI Increase" delay={0.24} />
              <CountStat value={95} suffix="%" label="Client Satisfaction" delay={0.36} />
            </div>
          </div>
        </section>

        <SectionMorphDivider from="rgba(26,35,50,0.88)" to="rgba(10,10,15,0.86)" />

        {/* Services Section */}
        <div id="services">
          <ServicesBuiltForScale />
        </div>

        {/* AI Capabilities Section */}
        <div id="capabilities">
          <AICapabilities />
        </div>

        {/* Trust Section */}
        <section id="trust-section" className="py-20" style={{ background: 'rgba(26,35,50,0.88)' }}>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Trusted by 600+ Businesses</h2>
              <p className="text-xl text-gray-400 mb-8">Join industry leaders who trust EVOBRAND</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/services"
                  className="px-8 py-4 bg-[#22c8e5] text-[#003258] rounded-2xl font-bold hover:shadow-lg hover:shadow-[#22c8e5]/50 hover:bg-opacity-90 transition-all text-center"
                >
                  Explore Our Services
                </Link>
                <Link
                  to="/book-consultation"
                  className="px-8 py-4 border-2 border-white/30 text-white rounded-2xl font-bold hover:border-white/60 hover:bg-white/5 transition-all text-center"
                >
                  Get Started Today
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <SectionMorphDivider from="rgba(26,35,50,0.88)" to="rgba(7,10,14,0.88)" />

        {/* Video Library Section */}
        <div id="work">
          <VideoLibrarySection />
        </div>

        {/* Brand Auditor Section */}
        <AuditorSection />

        {/* Booking Section */}
        <section id="booking" className="py-20 relative z-10" style={{ background: 'rgba(13,13,24,0.88)' }}>
          <div className="container mx-auto px-4 max-w-xl">
            <div className="text-center mb-12">
              <p className="text-white/50 text-xs font-bold tracking-[0.25em] uppercase mb-3">Schedule a Meeting</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Book a Strategy Call</h2>
              <p className="text-[#8892a4] text-lg max-w-lg mx-auto">Select a date and time and let's start building your competitive advantage.</p>
            </div>
            <SchedulerWidget />
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 relative overflow-hidden bg-[#1a2332]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(34,200,229,0.12)_0%,transparent_70%)] pointer-events-none"></div>
          <div className="container mx-auto px-4 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Bookend: mirrors the hero's kinetic reveal, reversed */}
              <KineticHeadline
                as="h2"
                direction="rtl"
                startOnView
                delay={0.1}
                lines={[
                  [{ t: 'Ready' }, { t: 'to' }, { t: 'Transform' }],
                  [{ t: 'Your' }, { t: 'Business?' }],
                ]}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              />
              <p className="text-xl text-white/90 mb-8">
                Schedule a free consultation and discover how AI can revolutionize your operations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/book-consultation"
                  className="px-8 py-4 bg-[#22c8e5] text-[#003258] rounded-2xl font-bold hover:shadow-lg hover:bg-opacity-90 transition-all"
                >
                  Book Free Consultation
                </Link>
                <Link
                  to="/our-work"
                  className="px-8 py-4 border-2 border-white text-white rounded-2xl font-bold hover:bg-white hover:text-[#1a2332] transition-all"
                >
                  Explore Our Work
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
