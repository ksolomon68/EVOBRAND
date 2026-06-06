import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const StatCounter = ({ target, label, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (inView) {
      if (prefersReducedMotion) {
        setCount(target);
        return;
      }
      let start = 0;
      const duration = 2000;
      const increment = target / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [inView, target, prefersReducedMotion]);

  return (
    <div ref={ref} className="stat-box bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 text-center">
      <div className="stat-number text-4xl font-extrabold text-[#22c8e5]">
        {count}{suffix}
      </div>
      <div className="stat-label text-[#8892a4] text-sm mt-1">{label}</div>
    </div>
  );
};

const AICapabilities = () => {
  return (
    <section id="ai" className="py-20 bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(34,200,229,0.06)_0%,transparent_70%)] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 lg:max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-[#22c8e5] text-xs font-bold tracking-[0.15em] uppercase mb-4">
              AI Capabilities
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white leading-tight">
              Intelligence at the Core of Everything We Build
            </h2>
            <p className="text-[#8892a4] text-lg max-w-[600px] leading-relaxed">
              We don't bolt AI on after the fact. Every system we architect is designed from the ground up to harness machine intelligence — securely, responsibly, and at scale.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mt-12">
              <StatCounter target={680} label="Clients Served" suffix="+" />
              <StatCounter target={975} label="Projects Delivered" suffix="+" />
              <StatCounter target={98} label="Client Retention" suffix="%" />
              <StatCounter target={26} label="Years of Innovation" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-4"
          >
            <div className="ai-feature flex items-start gap-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 transition-colors hover:border-[rgba(34,200,229,0.4)]">
              <div className="w-10 h-10 min-w-[40px] rounded-lg bg-[rgba(34,200,229,0.15)] flex items-center justify-center text-lg">🔒</div>
              <div>
                <h4 className="text-white text-[0.95rem] font-semibold mb-1">FedRAMP-Ready AI Deployments</h4>
                <p className="text-[#8892a4] text-[0.85rem]">On-premise, air-gapped, and govCloud AI solutions meeting the strictest federal security mandates.</p>
              </div>
            </div>

            <div className="ai-feature flex items-start gap-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 transition-colors hover:border-[rgba(34,200,229,0.4)]">
              <div className="w-10 h-10 min-w-[40px] rounded-lg bg-[rgba(34,200,229,0.15)] flex items-center justify-center text-lg">⚙️</div>
              <div>
                <h4 className="text-white text-[0.95rem] font-semibold mb-1">Agentic Workflow Automation</h4>
                <p className="text-[#8892a4] text-[0.85rem]">Multi-agent orchestration systems that autonomously handle complex, multi-step enterprise workflows.</p>
              </div>
            </div>

            <div className="ai-feature flex items-start gap-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 transition-colors hover:border-[rgba(34,200,229,0.4)]">
              <div className="w-10 h-10 min-w-[40px] rounded-lg bg-[rgba(34,200,229,0.15)] flex items-center justify-center text-lg">📡</div>
              <div>
                <h4 className="text-white text-[0.95rem] font-semibold mb-1">Real-Time Intelligence Pipelines</h4>
                <p className="text-[#8892a4] text-[0.85rem]">Streaming data architectures with embedded ML inference for sub-second decision support.</p>
              </div>
            </div>

            <div className="ai-feature flex items-start gap-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 transition-colors hover:border-[rgba(34,200,229,0.4)]">
              <div className="w-10 h-10 min-w-[40px] rounded-lg bg-[rgba(34,200,229,0.15)] flex items-center justify-center text-lg">🧬</div>
              <div>
                <h4 className="text-white text-[0.95rem] font-semibold mb-1">Custom Model Fine-Tuning</h4>
                <p className="text-[#8892a4] text-[0.85rem]">Domain-specific LLM fine-tuning and RAG implementations trained on your proprietary data and context.</p>
              </div>
            </div>

            <div className="ai-feature flex items-start gap-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 transition-colors hover:border-[rgba(34,200,229,0.4)]">
              <div className="w-10 h-10 min-w-[40px] rounded-lg bg-[rgba(34,200,229,0.15)] flex items-center justify-center text-lg">📋</div>
              <div>
                <h4 className="text-white text-[0.95rem] font-semibold mb-1">AI Governance & Compliance</h4>
                <p className="text-[#8892a4] text-[0.85rem]">Explainable AI frameworks, audit trails, and responsible AI guardrails aligned with NIST AI RMF.</p>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AICapabilities;
