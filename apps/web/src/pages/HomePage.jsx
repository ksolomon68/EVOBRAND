
import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Zap, FileText, Video, Code } from 'lucide-react';
import HeroAnimation from '@/components/HeroAnimation.jsx';
import VideoLibrarySection from '@/components/VideoLibrarySection.jsx';
import AuditorSection from '@/components/sections/AuditorSection.jsx';
import ServicesBuiltForScale from '@/components/sections/ServicesBuiltForScale.jsx';
import AICapabilities from '@/components/sections/AICapabilities.jsx';
import SchedulerWidget from '@/components/scheduler/SchedulerWidget.jsx';
import SEO from '@/components/SEO.jsx';

const HomePage = () => {
  const [typewriterText, setTypewriterText] = useState('');
  const fullText = 'Transform Your Business with AI-Powered Solutions';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTypewriterText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

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
      features: ['Custom Themes', 'Plugin Development', 'E-commerce', 'Maintenance'],
      emphasized: false
    }
  ];

  const heroRef = React.useRef(null);

  return (
    <>
      <SEO
        title="AI Solutions for Business Growth | Dallas, TX"
        description="EVOBRAND transforms businesses with custom AI applications, visual content creation, intelligent document generation, and AI video production. Dallas-based agency serving clients nationwide."
        keywords="AI solutions, custom AI applications, AI transformation, Dallas AI agency, AI automation, business AI, machine learning, intelligent automation"
        canonical="https://evobrand.net/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "EVOBRAND Concepts LLC",
          "description": "Dallas-based AI transformation agency delivering custom AI applications, visual content, and intelligent automation.",
          "url": "https://evobrand.net",
          "logo": "https://evobrand.net/logo.png",
          "image": "https://evobrand.net/og-image.png",
          "telephone": "",
          "email": "info@evobrand.net",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Dallas",
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

      <div className="min-h-screen bg-[#0f1419]">
        {/* Hero Section */}
        <section ref={heroRef} className="relative h-[200vh]">
          <div className="sticky top-0 h-screen overflow-hidden">

            <HeroAnimation scrollContainerRef={heroRef} />

            <div className="absolute inset-0 container mx-auto px-4 flex flex-col pt-32 lg:pt-48 relative z-10 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-3xl pointer-events-auto"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                  Your Partner in <span className="text-[#22c8e5]">AI Transformation</span>
                </h1>
                <p className="text-2xl md:text-3xl text-[#22c8e5] mb-6 h-20">
                  {typewriterText}<span className="animate-pulse">|</span>
                </p>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl">
                  Harness the power of AI to accelerate your business growth. We deliver custom AI solutions that drive real results.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/contact"
                    className="px-8 py-4 bg-[#22c8e5] text-[#003258] rounded-full font-bold hover:shadow-lg hover:shadow-[#22c8e5]/50 hover:bg-opacity-90 transition-all text-center"
                  >
                    Start Your AI Transformation
                  </Link>
                  <Link
                    to="/how-it-works"
                    className="px-8 py-4 border-2 border-[#22c8e5] text-[#22c8e5] rounded-full font-bold hover:bg-[#22c8e5] hover:text-[#003258] transition-all text-center"
                  >
                    See How It Works
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="bg-[#1a2332] py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-[#22c8e5]">10x</p>
                <p className="text-gray-400 text-sm">Faster Production</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#22c8e5]">80%</p>
                <p className="text-gray-400 text-sm">Cost Reduction</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#22c8e5]">5x</p>
                <p className="text-gray-400 text-sm">ROI Increase</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#22c8e5]">95%</p>
                <p className="text-gray-400 text-sm">Client Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <ServicesBuiltForScale />

        {/* AI Capabilities Section */}
        <AICapabilities />

        {/* Trust Section */}
        <section className="py-20 bg-[#1a2332]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Trusted by 600+ Businesses</h2>
              <p className="text-xl text-gray-400">Join industry leaders who trust EVOBRAND</p>
            </motion.div>



            {/* Live Stats */}
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-[#0f1419] p-6 rounded-xl">
                <p className="text-4xl font-bold text-[#22c8e5] mb-2">500+</p>
                <p className="text-gray-400">Projects Delivered</p>
              </div>
              <div className="bg-[#0f1419] p-6 rounded-xl">
                <p className="text-4xl font-bold text-[#22c8e5] mb-2">95%</p>
                <p className="text-gray-400">Client Retention</p>
              </div>
              <div className="bg-[#0f1419] p-6 rounded-xl">
                <p className="text-4xl font-bold text-[#22c8e5] mb-2">$2.5M+</p>
                <p className="text-gray-400">Saved for Clients</p>
              </div>
            </div>
          </div>
        </section>

        {/* Video Library Section */}
        <VideoLibrarySection />

        {/* Brand Auditor Section */}
        <AuditorSection />

        {/* Booking Section */}
        <section id="booking" className="py-20 bg-[#0d0d18]">
          <div className="container mx-auto px-4 max-w-xl">
            <div className="text-center mb-12">
              <p className="text-[#22c8e5] text-xs font-bold tracking-[0.25em] uppercase mb-3">Schedule a Meeting</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Book a Strategy Call</h2>
              <p className="text-[#8892a4] text-lg max-w-lg mx-auto">Select a date and time and let's start building your competitive advantage.</p>
            </div>
            <SchedulerWidget />
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-[#1a2332] to-[#22c8e5]">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Transform Your Business?</h2>
              <p className="text-xl text-white/90 mb-8">
                Schedule a free consultation and discover how AI can revolutionize your operations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="px-8 py-4 bg-[#22c8e5] text-[#003258] rounded-full font-bold hover:shadow-lg hover:bg-opacity-90 transition-all"
                >
                  Book Free Consultation
                </Link>
                <Link
                  to="/our-work"
                  className="px-8 py-4 border-2 border-[#22c8e5] text-[#22c8e5] rounded-full font-bold hover:bg-[#22c8e5] hover:text-[#003258] transition-all"
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
