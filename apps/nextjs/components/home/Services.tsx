'use client';

import { motion } from 'framer-motion';
import {
  Code2,
  Brain,
  FileVideo,
  Palette,
  Sparkles,
  Shield,
} from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

const services = [
  {
    icon: Code2,
    title: 'Custom App Development',
    description:
      'Full-stack web and mobile applications built to exacting enterprise standards. We architect for scale, security, and longevity—from concept to FedRAMP-authorized production.',
    color: 'from-blue-500 to-blue-600',
    glow: 'hover:shadow-blue-500/20',
  },
  {
    icon: Brain,
    title: 'AI Integration',
    description:
      'Embed LLMs, RAG systems, and custom ML models directly into your operations. We turn cutting-edge AI capabilities into production-grade business value.',
    color: 'from-purple-500 to-purple-600',
    glow: 'hover:shadow-purple-500/20',
  },
  {
    icon: FileVideo,
    title: 'AI Content Creation',
    description:
      'Automated content pipelines powered by custom-trained models. Produce branded, compliant content at scale—from marketing copy to technical documentation.',
    color: 'from-cyan-500 to-cyan-600',
    glow: 'hover:shadow-cyan-500/20',
  },
  {
    icon: Palette,
    title: 'Brand Identity',
    description:
      'Strategic brand architecture for organizations that demand authority. Logo systems, design guidelines, and visual languages built for enterprise longevity.',
    color: 'from-pink-500 to-rose-600',
    glow: 'hover:shadow-pink-500/20',
  },
  {
    icon: Sparkles,
    title: 'Motion & Animation',
    description:
      'Cinematic UI animations, motion design systems, and interactive experiences that communicate sophistication and elevate your digital presence.',
    color: 'from-amber-500 to-orange-500',
    glow: 'hover:shadow-amber-500/20',
  },
  {
    icon: Shield,
    title: 'Government Solutions',
    description:
      'FedRAMP, FISMA, CMMC, and ITAR-compliant software solutions. We navigate the complexities of government procurement so your mission stays on track.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'hover:shadow-emerald-500/20',
  },
];

export default function Services() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="services" className="py-24 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
            What We Do
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Services Built for Scale
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From intelligent automation to immersive brand experiences — every solution is engineered
            to perform at enterprise scale.
          </p>
        </AnimatedSection>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                variants={cardVariants}
                className={`group relative rounded-2xl bg-white/5 border border-white/10 p-7 hover:border-white/20 transition-all duration-300 hover:shadow-xl ${service.glow} cursor-pointer`}
              >
                {/* Animated border gradient on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, rgba(0,102,255,0.05) 0%, transparent 60%)`,
                  }}
                />

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className="text-white" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
