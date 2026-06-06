import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SERVICES = [
  {
    icon: '⚡',
    title: 'Custom Application Development',
    desc: 'Full-stack, cloud-native applications built for mission-critical workloads. Secure, scalable, and tailored to your operational requirements.',
  },
  {
    icon: '🤖',
    title: 'AI Integration & Automation',
    desc: 'Deploy intelligent agents, automate workflows, and integrate large language models into your existing infrastructure with enterprise safeguards.',
  },
  {
    icon: '✨',
    title: 'AI Content Creation',
    desc: 'Leverage generative AI to produce high-quality copy, imagery, and multimedia content at scale — aligned with your brand voice and compliance standards.',
  },
  {
    icon: '🎨',
    title: 'Branding & Identity',
    desc: 'Strategic brand systems that communicate authority and trust. Visual identity, design language, and brand guidelines built for lasting impact.',
  },
  {
    icon: '🎬',
    title: 'Animation & Motion Design',
    desc: 'Cinematic motion graphics, UI micro-interactions, and explainer animations that transform complex ideas into compelling visual narratives.',
  },
  {
    icon: '🛡️',
    title: 'WCAG Accessibility',
    desc: 'Ensure your digital experiences are universally accessible. We audit, remediate, and maintain your platforms to meet and exceed WCAG standards.',
  },
];

const ServiceCard = ({ icon, title, desc }) => (
  <div className="service-card">
    <div className="service-icon">
      <div className="service-icon-bg" style={{ background: '#22c8e5' }}></div>
      <span>{icon}</span>
    </div>
    <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
    <p className="text-[#8892a4] text-sm leading-relaxed">{desc}</p>
  </div>
);

const ServicesBuiltForScale = () => {
  const sectionRef = useRef(null);

  useGSAP(() => {
    gsap.from('.svc-head', {
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.12,
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Simple staggered fade-up entrance for the cards.
    gsap.from('.service-card', {
      scrollTrigger: { trigger: '.svc-grid', start: 'top 85%' },
      y: 40,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.1,
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="services" className="py-20 relative bg-gradient-to-b from-[#0a0a0f] to-[#0d0d18]">
      <div className="container mx-auto px-4 lg:max-w-[1200px]">
        <div className="text-center mb-16">
          <span className="svc-head inline-block text-[#22c8e5] text-xs font-bold tracking-[0.15em] uppercase mb-4">
            What We Do
          </span>
          <h2 className="svc-head text-3xl md:text-5xl font-bold mb-4 text-white">
            Services Built for Scale
          </h2>
          <p className="svc-head text-[#8892a4] text-lg max-w-[600px] mx-auto leading-relaxed">
            From intelligent automation to immersive brand experiences — every solution is engineered to perform at enterprise scale.
          </p>
        </div>

        <div className="svc-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <ServiceCard key={s.title} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesBuiltForScale;
