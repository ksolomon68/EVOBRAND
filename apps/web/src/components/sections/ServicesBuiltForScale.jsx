import React from 'react';
import { motion } from 'framer-motion';

const ServicesBuiltForScale = () => {
  return (
    <section id="services" className="py-20 relative bg-gradient-to-b from-[#0a0a0f] to-[#0d0d18]">
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
            From intelligent automation to immersive brand experiences — every solution is engineered to perform at enterprise scale.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <motion.article 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="service-card"
          >
            <div className="service-icon">
              <div className="service-icon-bg" style={{ background: '#22c8e5' }}></div>
              <span>⚡</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Custom Application Development</h3>
            <p className="text-[#8892a4] text-sm leading-relaxed">Full-stack, cloud-native applications built for mission-critical workloads. Secure, scalable, and tailored to your operational requirements.</p>
            <div className="service-arrow text-[#22c8e5] text-sm font-semibold mt-5 flex items-center gap-1 transition-all">
              Learn more <span>→</span>
            </div>
          </motion.article>

          <motion.article 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="service-card"
          >
            <div className="service-icon">
              <div className="service-icon-bg" style={{ background: '#22c8e5' }}></div>
              <span>🤖</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">AI Integration & Automation</h3>
            <p className="text-[#8892a4] text-sm leading-relaxed">Deploy intelligent agents, automate workflows, and integrate large language models into your existing infrastructure with enterprise safeguards.</p>
            <div className="service-arrow text-[#22c8e5] text-sm font-semibold mt-5 flex items-center gap-1 transition-all">
              Learn more <span>→</span>
            </div>
          </motion.article>

          <motion.article 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="service-card"
          >
            <div className="service-icon">
              <div className="service-icon-bg" style={{ background: '#22c8e5' }}></div>
              <span>✨</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">AI Content Creation</h3>
            <p className="text-[#8892a4] text-sm leading-relaxed">Leverage generative AI to produce high-quality copy, imagery, and multimedia content at scale — aligned with your brand voice and compliance standards.</p>
            <div className="service-arrow text-[#22c8e5] text-sm font-semibold mt-5 flex items-center gap-1 transition-all">
              Learn more <span>→</span>
            </div>
          </motion.article>

          <motion.article 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="service-card"
          >
            <div className="service-icon">
              <div className="service-icon-bg" style={{ background: '#22c8e5' }}></div>
              <span>🎨</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Branding & Identity</h3>
            <p className="text-[#8892a4] text-sm leading-relaxed">Strategic brand systems that communicate authority and trust. Visual identity, design language, and brand guidelines built for lasting impact.</p>
            <div className="service-arrow text-[#22c8e5] text-sm font-semibold mt-5 flex items-center gap-1 transition-all">
              Learn more <span>→</span>
            </div>
          </motion.article>

          <motion.article 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="service-card"
          >
            <div className="service-icon">
              <div className="service-icon-bg" style={{ background: '#22c8e5' }}></div>
              <span>🎬</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Animation & Motion Design</h3>
            <p className="text-[#8892a4] text-sm leading-relaxed">Cinematic motion graphics, UI micro-interactions, and explainer animations that transform complex ideas into compelling visual narratives.</p>
            <div className="service-arrow text-[#22c8e5] text-sm font-semibold mt-5 flex items-center gap-1 transition-all">
              Learn more <span>→</span>
            </div>
          </motion.article>

          <motion.article 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="service-card"
          >
            <div className="service-icon">
              <div className="service-icon-bg" style={{ background: '#22c8e5' }}></div>
              <span>🛡️</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">WCAG Accessibility</h3>
            <p className="text-[#8892a4] text-sm leading-relaxed">Ensure your digital experiences are universally accessible. We audit, remediate, and maintain your platforms to meet and exceed WCAG standards.</p>
            <div className="service-arrow text-[#22c8e5] text-sm font-semibold mt-5 flex items-center gap-1 transition-all">
              Learn more <span>→</span>
            </div>
          </motion.article>

        </div>
      </div>
    </section>
  );
};

export default ServicesBuiltForScale;
