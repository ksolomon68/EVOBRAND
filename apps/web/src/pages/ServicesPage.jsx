
import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, FileText, Video, Code, Check, ArrowRight } from 'lucide-react';

import SEO from '@/components/SEO.jsx';

const ServicesPage = () => {
  const [selectedService, setSelectedService] = useState(0);

  const services = [
    {
      id: 0,
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
      icon: <Code size={48} />,
      title: 'WordPress & Web Development',
      description: 'Professional web solutions and WordPress development for modern businesses.',
      features: [
        'Custom WordPress Themes',
        'Plugin Development',
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
      caseStudy: {
        client: 'Retail Business',
        challenge: 'Outdated website with poor performance',
        solution: 'Modern WordPress rebuild',
        results: ['300% faster load time', '150% traffic increase', '80% bounce rate reduction']
      }
    },
    {
      id: 5,
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

  const currentService = services[selectedService];

  return (
    <>
      <SEO
        title="AI Services & Pricing | Custom AI Apps, Video, Docs & More"
        description="Explore EVOBRAND's full suite of AI services: custom AI applications, visual content creation, intelligent document generation, AI video production, web development, and WCAG accessibility. Transparent pricing, proven results."
        keywords="AI services, custom AI development, AI video production, intelligent document generation, WCAG accessibility, AI visual content, web development Dallas"
        canonical={`https://evobrand.net/services`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": currentService.title,
          "provider": {
            "@type": "Organization",
            "name": "EVOBRAND Concepts LLC",
            "url": "https://evobrand.net"
          },
          "description": currentService.description,
          "areaServed": "United States",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "AI Services",
            "itemListElement": currentService.pricing.map((p, i) => ({
              "@type": "Offer",
              "name": p.tier,
              "price": p.price,
              "priceCurrency": "USD"
            }))
          }
        }}
      />

      <div className="min-h-screen bg-[#0f1419]">
        {/* Service Navigation */}
        <section className="bg-[#1a2332] py-6 sticky top-20 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4 pb-2">
              {services.map((service, index) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(index)}
                  className={`px-6 py-3 rounded-full font-bold transition-all ${selectedService === index
                      ? 'bg-[#22c8e5] text-[#003258] shadow-[0_0_15px_rgba(34,200,229,0.3)]'
                      : 'bg-[#0f1419] text-gray-400 hover:text-white border border-white/5'
                    }`}
                >
                  {service.title}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Service Hero */}
        <section className="py-20 bg-gradient-to-br from-[#1a2332] to-[#0f1419]">
          <div className="container mx-auto px-4">
            <motion.div
              key={selectedService}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="text-[#22c8e5] mb-6 flex justify-center">{currentService.icon}</div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{currentService.title}</h1>
              <p className="text-xl text-gray-400">{currentService.description}</p>
            </motion.div>
          </div>
        </section>

        {/* Bento Dashboard */}
        <section className="py-12 bg-[#0f1419]">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Main Feature Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-2 bg-[#1a2332] rounded-3xl p-8 border border-white/5 flex flex-col"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-[#22c8e5]/10 rounded-xl flex items-center justify-center text-[#22c8e5]">
                    <Check size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">What You Get</h2>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 flex-grow">
                  {currentService.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 bg-[#0f1419] p-4 rounded-2xl border border-white/5">
                      <Check className="text-[#22c8e5] flex-shrink-0 mt-0.5" size={18} />
                      <span className="text-gray-300 text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right Column - Stacked Boxes */}
              <div className="flex flex-col gap-6">
                
                {/* Pricing Box */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-[#22c8e5]/10 to-[#1a2332] rounded-3xl p-8 border border-[#22c8e5]/20 flex-1 flex flex-col justify-center"
                >
                  <h3 className="text-lg font-bold text-white mb-2">Investment</h3>
                  <p className="text-sm text-gray-400 mb-6">Starting from</p>
                  <p className="text-4xl font-bold text-[#22c8e5] mb-6">
                    {currentService.pricing[0].price}
                  </p>
                  <a href="#pricing-full" className="w-full py-3 bg-[#22c8e5] text-[#003258] rounded-xl font-bold hover:shadow-lg hover:shadow-[#22c8e5]/20 transition-all text-center block">
                    View Full Pricing
                  </a>
                </motion.div>

                {/* Case Study Highlight Box */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[#1a2332] rounded-3xl p-8 border border-white/5 flex-1"
                >
                  <h3 className="text-lg font-bold text-white mb-4">Success Metric</h3>
                  <div className="bg-[#0f1419] p-4 rounded-2xl border border-white/5 mb-4">
                    <p className="text-[#22c8e5] font-bold text-xl mb-1">{currentService.caseStudy.results[0]}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{currentService.caseStudy.client}</p>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{currentService.caseStudy.solution}</p>
                </motion.div>

              </div>
            </div>

            {/* Horizontal Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-[#1a2332] rounded-3xl p-8 border border-white/5 relative z-0"
            >
              <h2 className="text-xl font-bold text-white mb-8">Implementation Process</h2>
              <div className="flex flex-col md:flex-row justify-between relative">
                {/* Connecting Line */}
                <div className="absolute top-6 left-12 right-12 h-0.5 bg-[#22c8e5]/20 hidden md:block -z-10"></div>
                
                {currentService.process.map((step, index) => (
                  <div key={index} className="flex flex-col items-center text-center relative max-w-[180px] mb-8 md:mb-0 group">
                    <div className="w-12 h-12 bg-[#0f1419] border-2 border-[#22c8e5] rounded-full flex items-center justify-center text-[#22c8e5] font-bold mb-4 group-hover:bg-[#22c8e5] group-hover:text-[#003258] transition-colors shadow-[0_0_15px_rgba(34,200,229,0.2)]">
                      {index + 1}
                    </div>
                    <h3 className="text-white font-bold mb-2">{step.step}</h3>
                    <p className="text-sm text-gray-400 leading-tight">{step.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Full Pricing Reference */}
        <section id="pricing-full" className="py-20 bg-[#0f1419]">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Comprehensive Pricing</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {currentService.pricing.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-[#1a2332] p-8 rounded-3xl ${plan.highlighted ? 'border-2 border-[#22c8e5] transform scale-105 shadow-xl shadow-[#22c8e5]/10' : 'border border-white/5'
                    }`}
                >
                  <h3 className="text-xl font-bold text-white mb-2">{plan.tier}</h3>
                  <p className="text-3xl font-bold text-[#22c8e5] mb-6">{plan.price}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-gray-300">
                        <Check className="text-[#22c8e5] flex-shrink-0 mt-1" size={16} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="/contact" className={`w-full py-3 rounded-full font-bold transition-all text-center block ${plan.highlighted
                      ? 'bg-[#22c8e5] text-[#003258] hover:shadow-lg hover:bg-opacity-90'
                      : 'border-2 border-[#22c8e5] text-[#22c8e5] hover:bg-[#22c8e5] hover:text-[#003258]'
                    }`}>
                    {plan.cta}
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-[#1a2332] to-[#22c8e5]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 mb-8">Let's discuss how we can help transform your business</p>
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-[#22c8e5] text-[#003258] rounded-full font-bold hover:shadow-lg hover:bg-opacity-90 transition-all"
            >
              Contact Us <ArrowRight className="ml-2" size={20} />
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default ServicesPage;
