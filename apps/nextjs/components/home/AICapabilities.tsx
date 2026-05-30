'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Brain } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

const capabilities = [
  { label: 'LLM Integration & Fine-tuning', description: 'GPT-4, Claude, Llama, custom models' },
  { label: 'RAG Systems & Knowledge Bases', description: 'Semantic search across enterprise data' },
  { label: 'Workflow Automation', description: 'End-to-end process orchestration with AI' },
  { label: 'Predictive Analytics', description: 'ML-powered forecasting and anomaly detection' },
  { label: 'Natural Language Processing', description: 'Document parsing, classification, extraction' },
  { label: 'Computer Vision', description: 'Object detection, OCR, visual inspection' },
];

const stats = [
  { value: 50, suffix: '+', label: 'Projects Delivered' },
  { value: 98, suffix: '%', label: 'Client Retention Rate' },
  { value: 2, prefix: '$', suffix: 'B+', label: 'in Contracts Supported' },
  { value: 12, suffix: '+', label: 'Government Clients' },
];

function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  isInView,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  isInView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

export default function AICapabilities() {
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });

  return (
    <section id="ai-capabilities" className="py-24 bg-gradient-to-b from-[#0a0a0f] to-[#0d0d18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
            <Brain size={12} />
            AI Capabilities
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Enterprise AI. Production-Ready.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We don&apos;t just integrate AI — we architect intelligent systems that transform how your organization operates.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Capability list */}
          <AnimatedSection direction="left">
            <div className="space-y-4">
              {capabilities.map((cap, idx) => (
                <motion.div
                  key={cap.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-500/30 transition-colors">
                    <Check size={12} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{cap.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{cap.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>

          {/* Right: Stats + visual */}
          <AnimatedSection direction="right">
            <div ref={statsRef} className="grid grid-cols-2 gap-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#0066ff] to-[#00d4ff] bg-clip-text text-transparent mb-2">
                    <AnimatedCounter
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      isInView={statsInView}
                    />
                  </div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Visual element */}
            <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(99,102,241,0.4) 0%, transparent 70%)',
                }}
              />
              <div className="relative">
                <p className="text-xs text-purple-400 font-medium mb-3 uppercase tracking-wider">
                  AI Stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'OpenAI GPT-4',
                    'Anthropic Claude',
                    'Meta Llama',
                    'LangChain',
                    'Pinecone',
                    'Weaviate',
                    'TensorFlow',
                    'PyTorch',
                    'Hugging Face',
                    'AWS Bedrock',
                    'Azure OpenAI',
                    'Vertex AI',
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
