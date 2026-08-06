
import React from 'react';
import { useState } from 'react';
import { Sparkles, Zap, FileText, Video, Code, Check, ArrowRight } from 'lucide-react';

import SEO from '@/components/SEO.jsx';
import PublicCheckoutModal from '@/components/PublicCheckoutModal.jsx';
import { PageHero } from '@/components/motion/PageMotion.jsx';
import ServiceDeck from '@/components/services/ServiceDeck.jsx';

const ServicesPage = () => {
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  const getPlanId = (serviceId, tier) => {
    const t = tier.toLowerCase().replace(' only', '');
    if (serviceId === 0) return `ai-${t}`;
    if (serviceId === 1) return `visual-${t}`;
    if (serviceId === 2) return `document-${t}`;
    if (serviceId === 3) return `video-${t}`;
    if (serviceId === 4) return `wordpress-${t}`;
    if (serviceId === 5) return `accessibility-${t}`;
    return '';
  };

  const services = [
    {
      id: 0,
      emoji: '🤖',
      shortName: 'AI Apps',
      icon: <Sparkles size={48} />,
      title: 'Custom AI Applications',
      description: 'Tailored AI solutions designed to solve your unique business challenges and drive measurable results.',
      features: [
        'Scalable Enterprise AI Architectures',
        'High-Performance Data Processing Pipelines',
        'Secure & Compliant Cloud Deployments',
        'Custom Large Language Model (LLM) Integration',
        'Microservices for AI Applications',
        'End-to-End Enterprise Solution Development'
      ],
      process: [
        { step: 'Discovery', description: 'Understanding your business needs and challenges' },
        { step: 'Strategy', description: 'Designing the optimal AI solution architecture' },
        { step: 'Development', description: 'Building and training custom AI models' },
        { step: 'Launch', description: 'Deploying and integrating into your systems' },
        { step: 'Optimize', description: 'Continuous monitoring and improvement' }
      ],
      pricing: [
        {
          tier: 'Starter',
          price: '$5,000',
          features: ['Basic AI Model', 'Up to 3 Features', '30 Days Support', 'Documentation'],
          cta: 'Get Started'
        },
        {
          tier: 'Professional',
          price: '$15,000',
          features: ['Advanced AI Models', 'Unlimited Features', '90 Days Support', 'Training & Documentation', 'API Integration'],
          cta: 'Most Popular',
          highlighted: true
        },
        {
          tier: 'Enterprise',
          price: 'Custom',
          features: ['Custom AI Solutions', 'Dedicated Team', 'Ongoing Support', 'Full Integration', 'SLA Guarantee'],
          cta: 'Contact Us'
        }
      ],
      caseStudy: {
        client: 'Tech Startup',
        challenge: 'Manual data processing taking 40 hours/week',
        solution: 'Custom AI automation pipeline',
        results: ['95% time reduction', '99.8% accuracy', '$120K annual savings']
      }
    },
    {
      id: 1,
      emoji: '🎨',
      shortName: 'Visual AI',
      icon: <Zap size={48} />,
      title: 'AI Visual Content Creation',
      description: 'Generate stunning visuals, graphics, and brand assets using cutting-edge AI technology.',
      features: [
        'AI-Generated Images & Graphics',
        'Brand Asset Creation',
        'Marketing Material Design',
        'Social Media Content',
        'Product Visualization',
        'Style Transfer & Enhancement'
      ],
      process: [
        { step: 'Discovery', description: 'Understanding your brand and visual needs' },
        { step: 'Strategy', description: 'Creating visual style guidelines' },
        { step: 'Development', description: 'Generating AI-powered visuals' },
        { step: 'Launch', description: 'Delivering final assets' },
        { step: 'Optimize', description: 'Refining based on feedback' }
      ],
      pricing: [
        {
          tier: 'Starter',
          price: '$2,000',
          features: ['50 AI Images', 'Basic Editing', '2 Revisions', 'Commercial License'],
          cta: 'Get Started'
        },
        {
          tier: 'Professional',
          price: '$5,000',
          features: ['200 AI Images', 'Advanced Editing', 'Unlimited Revisions', 'Brand Guidelines', 'Priority Support'],
          cta: 'Most Popular',
          highlighted: true
        },
        {
          tier: 'Enterprise',
          price: 'Custom',
          features: ['Unlimited Images', 'Dedicated Designer', 'Custom AI Models', 'Full Brand Suite', 'White Label'],
          cta: 'Contact Us'
        }
      ],
      caseStudy: {
        client: 'E-commerce Brand',
        challenge: 'High cost of product photography',
        solution: 'AI-generated product visuals',
        results: ['70% cost reduction', '5x faster production', '200+ assets/month']
      }
    },
    {
      id: 2,
      emoji: '📄',
      shortName: 'Doc Gen',
      icon: <FileText size={48} />,
      title: 'Intelligent Document Generation',
      description: 'Automate document creation with AI-powered templates and smart data integration.',
      features: [
        'Smart Document Templates',
        'Automated Data Integration',
        'Multi-format Export (PDF, DOCX, HTML)',
        'Version Control & Tracking',
        'Compliance & Security',
        'Batch Processing'
      ],
      process: [
        { step: 'Discovery', description: 'Analyzing your document workflows' },
        { step: 'Strategy', description: 'Designing template architecture' },
        { step: 'Development', description: 'Building intelligent templates' },
        { step: 'Launch', description: 'Deploying automation system' },
        { step: 'Optimize', description: 'Continuous template refinement' }
      ],
      pricing: [
        {
          tier: 'Starter',
          price: '$3,000',
          features: ['5 Document Templates', 'Basic Automation', '100 Docs/Month', 'Email Support'],
          cta: 'Get Started'
        },
        {
          tier: 'Professional',
          price: '$8,000',
          features: ['20 Templates', 'Advanced Automation', '1,000 Docs/Month', 'API Access', 'Priority Support'],
          cta: 'Most Popular',
          highlighted: true
        },
        {
          tier: 'Enterprise',
          price: 'Custom',
          features: ['Unlimited Templates', 'Custom Workflows', 'Unlimited Docs', 'Dedicated Support', 'SLA'],
          cta: 'Contact Us'
        }
      ],
      caseStudy: {
        client: 'Legal Firm',
        challenge: 'Manual contract generation taking hours',
        solution: 'AI-powered document automation',
        results: ['90% time savings', '100% accuracy', '500+ docs/month']
      }
    },
    {
      id: 3,
      emoji: '🎬',
      shortName: 'AI Video',
      icon: <Video size={48} />,
      title: 'AI Video Production',
      description: 'Create professional videos with AI-assisted scripting, editing, and production.',
      features: [
        'AI Script Generation',
        'Automated Video Editing',
        'AI Voiceover Synthesis',
        'Motion Graphics & Animation',
        'Multi-language Support',
        'Brand Consistency'
      ],
      process: [
        { step: 'Discovery', description: 'Understanding your video goals' },
        { step: 'Strategy', description: 'Planning content and style' },
        { step: 'Development', description: 'AI-assisted production' },
        { step: 'Launch', description: 'Final delivery and distribution' },
        { step: 'Optimize', description: 'Performance analysis and refinement' }
      ],
      pricing: [
        {
          tier: 'Starter',
          price: '$4,000',
          features: ['5 Videos/Month', 'Up to 2 Min Each', 'Basic Editing', 'Stock Footage'],
          cta: 'Get Started'
        },
        {
          tier: 'Professional',
          price: '$10,000',
          features: ['15 Videos/Month', 'Up to 5 Min Each', 'Advanced Editing', 'Custom Graphics', 'Voiceover'],
          cta: 'Most Popular',
          highlighted: true
        },
        {
          tier: 'Enterprise',
          price: 'Custom',
          features: ['Unlimited Videos', 'Any Length', 'Full Production', 'Dedicated Team', 'Rush Delivery'],
          cta: 'Contact Us'
        }
      ],
      caseStudy: {
        client: 'Marketing Agency',
        challenge: 'High video production costs',
        solution: 'AI-powered video creation',
        results: ['60% cost reduction', '3x faster delivery', '50+ videos/month']
      }
    },
    {
      id: 4,
      emoji: '💻',
      shortName: 'Web Dev',
      icon: <Code size={48} />,
      title: 'WordPress & Web Development',
      description: 'Professional web solutions and WordPress development for modern businesses.',
      features: [
        'Custom WordPress Setup',
        'Plugin Configuration',
        'E-commerce Solutions',
        'Performance Optimization',
        'Security Hardening',
        'Ongoing Maintenance'
      ],
      process: [
        { step: 'Discovery', description: 'Understanding your web requirements' },
        { step: 'Strategy', description: 'Planning site architecture' },
        { step: 'Development', description: 'Building your website' },
        { step: 'Launch', description: 'Deployment and testing' },
        { step: 'Optimize', description: 'Maintenance and updates' }
      ],
      pricing: [
        {
          tier: 'Starter',
          price: '$3,000',
          features: ['5-Page Website', 'Responsive Design', 'Basic SEO', '30 Days Support'],
          cta: 'Get Started'
        },
        {
          tier: 'Professional',
          price: '$8,000',
          features: ['15-Page Website', 'Custom Design', 'Advanced SEO', 'E-commerce', '90 Days Support'],
          cta: 'Most Popular',
          highlighted: true
        },
        {
          tier: 'Enterprise',
          price: 'Custom',
          features: ['Unlimited Pages', 'Custom Features', 'Full Integration', 'Dedicated Support', 'SLA'],
          cta: 'Contact Us'
        }
      ],
      maintenancePlans: [
        { tier: 'Basic', price: '$129/mo', features: ['Core & plugin updates', 'Security scans', 'Uptime monitoring', '2 support tickets/mo'] },
        { tier: 'Pro', price: '$299/mo', features: ['Everything in Basic', 'Unlimited tickets', '24-hr priority response', 'Performance optimization', '2 hrs minor edits/mo'], highlighted: true },
        { tier: 'Elite', price: '$749/mo', features: ['Everything in Pro', 'Same-day emergency response', '4 hrs dev work/mo', 'Dedicated account manager'] },
      ],
      caseStudy: {
        client: 'Retail Business',
        challenge: 'Outdated website with poor performance',
        solution: 'Modern WordPress rebuild',
        results: ['300% faster load time', '150% traffic increase', '80% bounce rate reduction']
      }
    },
    {
      id: 5,
      emoji: '♿',
      shortName: 'WCAG',
      icon: <Check size={48} />,
      title: 'WCAG Accessibility',
      description: 'Ensure your digital experiences are universally accessible. We audit, remediate, and maintain your platforms to meet and exceed WCAG standards.',
      features: [
        'Comprehensive Accessibility Audits',
        'WCAG 2.1 AA/AAA Remediation',
        'Screen Reader Optimization',
        'Keyboard Navigation Enhancements',
        'Color Contrast Adjustments',
        'Ongoing Compliance Monitoring'
      ],
      process: [
        { step: 'Audit', description: 'Deep scan of your digital properties' },
        { step: 'Report', description: 'Detailed compliance roadmap' },
        { step: 'Remediate', description: 'Fixing accessibility barriers' },
        { step: 'Test', description: 'Screen reader and manual testing' },
        { step: 'Certify', description: 'Providing compliance documentation' }
      ],
      pricing: [
        {
          tier: 'Audit Only',
          price: '$2,500',
          features: ['Full WCAG 2.1 Audit', 'Executive Summary', 'Detailed Defect Report', 'Remediation Roadmap'],
          cta: 'Get Started'
        },
        {
          tier: 'Remediation',
          price: '$7,500',
          features: ['Full Audit', 'Code Remediation', 'Screen Reader Testing', 'Accessibility Statement', '30 Days Support'],
          cta: 'Most Popular',
          highlighted: true
        },
        {
          tier: 'Enterprise',
          price: 'Custom',
          features: ['Continuous Monitoring', 'Dedicated Team', 'Legal Support', 'Training Sessions', 'SLA Guarantee'],
          cta: 'Contact Us'
        }
      ],
      caseStudy: {
        client: 'Global E-Commerce Brand',
        challenge: 'Legal pressure due to non-compliant website',
        solution: 'Full WCAG 2.1 AA remediation',
        results: ['100% Compliance Achieved', 'Zero Legal Issues', '15% Conversion Increase']
      }
    }
  ];

  return (
    <>
      <SEO
        title="AI Services & Pricing | Custom AI Apps, Video, Docs & More"
        description="Explore EVOBRAND's full suite of AI services: custom AI applications, visual content creation, intelligent document generation, AI video production, web development, and WCAG accessibility. Transparent pricing, proven results."
        keywords="AI services, custom AI development, AI video production, intelligent document generation, WCAG accessibility, AI visual content, web development Ellis County"
        canonical={`https://evobrand.net/services`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "AI Transformation Services",
          "provider": {
            "@type": "Organization",
            "name": "EVOBRAND Concepts LLC",
            "url": "https://evobrand.net"
          },
          "description": "Full suite of AI transformation services including custom applications, visual content, document generation, and video production.",
          "areaServed": "United States",
        }}
      />

      <div className="min-h-screen bg-[#0f1419]">
        {/* Hero */}
        <PageHero
          eyebrow="Custom AI · Visual · Video · Docs · Web · WCAG"
          lines={[[{ t: 'Our' }, { t: 'Services', accent: true }]]}
          sub="Explore our full suite of AI-powered solutions with transparent pricing and proven results."
        />

        {/* The immersive service deck */}
        <ServiceDeck
          services={services}
          getPlanId={getPlanId}
          onCheckout={setCheckoutPlan}
        />

        {/* Final CTA */}
        <section className="py-20 relative overflow-hidden bg-[#1a2332]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(34,200,229,0.12)_0%,transparent_70%)] pointer-events-none"></div>
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 mb-8">Let's discuss how we can transform your business with AI</p>
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-[#22c8e5] text-[#003258] rounded-2xl font-bold hover:shadow-lg hover:bg-opacity-90 transition-all"
            >
              Contact Us <ArrowRight className="ml-2" size={20} />
            </a>
          </div>
        </section>

        {/* Public Checkout Modal */}
        {checkoutPlan && (
          <PublicCheckoutModal
            planId={checkoutPlan.planId}
            planName={checkoutPlan.planName}
            price={checkoutPlan.price}
            type={checkoutPlan.type}
            onClose={() => setCheckoutPlan(null)}
          />
        )}
      </div>
    </>
  );
};

export default ServicesPage;
