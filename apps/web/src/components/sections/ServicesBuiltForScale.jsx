import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Bot, Sparkles, Palette, Film, Accessibility } from 'lucide-react';

const ServicesBuiltForScale = () => {
  return (
    <section className="py-20 relative" style={{ background: 'linear-gradient(to bottom, rgba(10,10,15,0.86), rgba(13,13,24,0.88))' }}>
      <div className="container mx-auto px-4 lg:max-w-[1200px]">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-[#22c8e5] text-xs font-bold tracking-[0.15em] uppercase mb-4"
          >
            What We Do
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-white"
          >
            Services Built for Scale
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#8892a4] text-lg max-w-[600px] mx-auto leading-relaxed"
          >
            Web and mobile builds, AI-powered automation, brand identity, and accessibility compliance — every deliverable engineered to perform at enterprise and government scale.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="service-card"
          >
            <div className="service-icon">
              <div className="service-icon-bg" style={{ background: '#22c8e5' }}></div>
              <Code2 className="text-white relative" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">WordPress & Web Development</h3>
            <p className="text-[#8892a4] text-sm leading-relaxed">Custom WordPress builds, plugin configuration, e-commerce integration, and performance and security hardening — plus ongoing maintenance after launch.</p>

          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="service-card"
          >
            <div className="service-icon">
              <div className="service-icon-bg" style={{ background: '#22c8e5' }}></div>
              <Bot className="text-white relative" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">AI Integration & Automation</h3>
            <p className="text-[#8892a4] text-sm leading-relaxed">Custom LLM integrations, automated workflows, and AI-powered document processing deployed directly into your CRM, inbox, and internal systems.</p>

          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="service-card"
          >
            <div className="service-icon">
              <div className="service-icon-bg" style={{ background: '#22c8e5' }}></div>
              <Sparkles className="text-white relative" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">AI Content Creation</h3>
            <p className="text-[#8892a4] text-sm leading-relaxed">AI-generated product visuals, marketing graphics, and social content — matched to your brand's colors and style guide, delivered in days, not weeks.</p>

          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="service-card"
          >
            <div className="service-icon">
              <div className="service-icon-bg" style={{ background: '#22c8e5' }}></div>
              <Palette className="text-white relative" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Branding & Identity</h3>
            <p className="text-[#8892a4] text-sm leading-relaxed">Logo design, color systems, typography, and full brand guideline documentation — the foundational identity work behind every touchpoint you own.</p>

          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="service-card"
          >
            <div className="service-icon">
              <div className="service-icon-bg" style={{ background: '#22c8e5' }}></div>
              <Film className="text-white relative" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">AI Video & Motion Design</h3>
            <p className="text-[#8892a4] text-sm leading-relaxed">AI-assisted script and voiceover generation, explainer videos, social media motion graphics, and UI micro-interactions — produced end-to-end.</p>

          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="service-card"
          >
            <div className="service-icon">
              <div className="service-icon-bg" style={{ background: '#22c8e5' }}></div>
              <Accessibility className="text-white relative" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">WCAG Accessibility</h3>
            <p className="text-[#8892a4] text-sm leading-relaxed">Full accessibility audits, remediation, and ADA/Section 508 compliance documentation — critical for government contracts and enterprise procurement.</p>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ServicesBuiltForScale;
