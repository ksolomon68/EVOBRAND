
import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Lightbulb, Code, Rocket, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import ProcessVisualizer from '@/components/ProcessVisualizer.jsx';
import SEO from '@/components/SEO.jsx';
import {
  PageHero,
  Reveal,
  TiltCard,
} from '@/components/motion/PageMotion.jsx';

const HowItWorksPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const processSteps = [
    {
      week: 'Week 1',
      phase: 'Discovery & Strategy',
      icon: <Search size={40} />,
      description: 'We dive deep into understanding your business, challenges, and goals.',
      activities: [
        'Initial consultation and needs assessment',
        'Business process analysis',
        'Goal setting and KPI definition',
        'Technology stack evaluation',
        'Project roadmap creation'
      ]
    },
    {
      week: 'Week 2-6',
      phase: 'Development & Creation',
      icon: <Code size={40} />,
      description: 'Our team builds your custom AI solution with regular check-ins and updates.',
      activities: [
        'AI model development and training',
        'Custom feature implementation',
        'Integration with existing systems',
        'Quality assurance testing',
        'Regular progress updates'
      ]
    },
    {
      week: 'Week 6-7',
      phase: 'Testing & Launch',
      icon: <Rocket size={40} />,
      description: 'Rigorous testing ensures everything works perfectly before going live.',
      activities: [
        'Comprehensive system testing',
        'User acceptance testing',
        'Performance optimization',
        'Deployment to production',
        'Team training and handoff'
      ]
    },
    {
      week: 'Ongoing',
      phase: 'Support & Optimization',
      icon: <TrendingUp size={40} />,
      description: 'Continuous monitoring and improvements to maximize your ROI.',
      activities: [
        'Performance monitoring',
        'Regular updates and improvements',
        'Technical support',
        'Feature enhancements',
        'Quarterly strategy reviews'
      ]
    }
  ];

  const serviceTimelines = [
    { service: 'Custom AI Applications', timeline: '6-12 weeks', complexity: 'High' },
    { service: 'AI Visual Content Creation', timeline: '2-4 weeks', complexity: 'Medium' },
    { service: 'Intelligent Document Generation', timeline: '4-8 weeks', complexity: 'Medium' },
    { service: 'AI Video Production', timeline: '3-6 weeks', complexity: 'Medium' },
    { service: 'WordPress & Web Development', timeline: '4-8 weeks', complexity: 'Low-Medium' },
    { service: 'WCAG Accessibility', timeline: '2-6 weeks', complexity: 'Medium' }
  ];

  const faqs = [
    {
      question: 'How long does a typical project take?',
      answer: 'Project timelines vary based on complexity and scope. Simple projects like visual content creation can be completed in 2-4 weeks, while complex custom AI applications may take 6-12 weeks. We provide detailed timelines during the discovery phase.'
    },
    {
      question: 'What happens during the discovery phase?',
      answer: 'During discovery, we conduct in-depth consultations to understand your business needs, analyze your current processes, define clear goals and KPIs, evaluate your technology stack, and create a comprehensive project roadmap. This ensures we build exactly what you need.'
    },
    {
      question: 'Can I make changes during development?',
      answer: 'Yes! We use an agile approach with regular check-ins and updates. Minor adjustments can be made throughout development. Major scope changes may affect timeline and budget, which we\'ll discuss transparently.'
    },
    {
      question: 'What kind of support do you provide after launch?',
      answer: 'We offer ongoing support including performance monitoring, regular updates, technical assistance, feature enhancements, and quarterly strategy reviews. Support packages are customized based on your needs.'
    },
    {
      question: 'Do you provide training for our team?',
      answer: 'Absolutely! We provide comprehensive training during the handoff phase, including documentation, video tutorials, and live training sessions. We ensure your team is confident using the new system.'
    },
    {
      question: 'How do you ensure project success?',
      answer: 'We follow a proven process with clear milestones, regular communication, quality assurance testing, and performance metrics. Our 95% client satisfaction rate speaks to our commitment to delivering results.'
    }
  ];

  return (
    <>
      <SEO
        title="How Our AI Process Works | Discovery to Launch | EVOBRAND"
        description="EVOBRAND's 4-phase AI delivery process: Discovery & Strategy, Development, Testing & Launch, and ongoing Optimization. Timelines from 2–12 weeks. Proven results for businesses nationwide."
        keywords="AI implementation process, AI project timeline, how AI works, AI development agency, AI strategy, EVOBRAND process"
        canonical="https://evobrand.net/how-it-works"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How EVOBRAND Delivers AI Solutions",
          "description": "EVOBRAND's proven 4-step process for AI transformation.",
          "step": [
            { "@type": "HowToStep", "name": "Discovery & Strategy", "text": "Deep dive into your business needs, goals, and technology stack." },
            { "@type": "HowToStep", "name": "Development & Creation", "text": "Build your custom AI solution with weekly progress updates." },
            { "@type": "HowToStep", "name": "Testing & Launch", "text": "Rigorous QA and deployment to production." },
            { "@type": "HowToStep", "name": "Support & Optimization", "text": "Continuous monitoring, updates, and quarterly strategy reviews." }
          ]
        }}
      />

      <div className="min-h-screen bg-[#0f1419]">
        {/* Hero */}
        <PageHero
          eyebrow="Discovery → Launch → Beyond"
          lines={[
            [{ t: 'Our' }, { t: 'Proven' }, { t: 'Process', accent: true }],
          ]}
          sub="From concept to creation, we follow a structured approach that ensures your AI transformation is successful, on-time, and delivers measurable results."
        />

        {/* Process Timeline */}
        <section className="py-20 bg-[#0f1419]">
          <div className="container mx-auto px-4">
            <Reveal>
              <h2 className="text-3xl font-bold text-white mb-12 text-center">Step-by-Step Process</h2>
            </Reveal>
            {/* Cinematic scene stack — each phase slides over the previous */}
            <div className="max-w-4xl mx-auto">
              {processSteps.map((step, index) => (
                <div
                  key={index}
                  className="sticky mb-[14vh] last:mb-0"
                  style={{ top: `calc(96px + ${index * 20}px)`, zIndex: index + 1 }}
                >
                  <div className="rounded-2xl border border-[#22c8e5]/20 bg-[#141d2b] p-7 md:p-10 shadow-2xl shadow-black/60">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="flex-shrink-0 w-14 h-14 bg-[#22c8e5] rounded-full flex items-center justify-center text-[#003258] shadow-[0_0_20px_rgba(34,200,229,0.4)]">
                        {step.icon}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#22c8e5] mb-1">
                          {String(index + 1).padStart(2, '0')} / {String(processSteps.length).padStart(2, '0')} — {step.week}
                        </p>
                        <h3 className="text-2xl md:text-3xl font-bold text-white">{step.phase}</h3>
                      </div>
                    </div>
                    <p className="text-gray-400 mb-6">{step.description}</p>
                    <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
                      {step.activities.map((activity, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-gray-300">
                          <span className="w-1.5 h-1.5 bg-[#22c8e5] rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-sm">{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Timelines */}
        <section className="py-20 bg-[#1a2332]">
          <div className="container mx-auto px-4">
            <Reveal>
              <h2 className="text-3xl font-bold text-white mb-12 text-center">Estimated Timelines by Service</h2>
            </Reveal>
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
              {serviceTimelines.map((item, index) => (
                <Reveal key={index} delay={index * 0.06}>
                  <TiltCard className="h-full bg-[#0f1419] p-6 rounded-xl border border-white/5 transition-colors hover:border-[#22c8e5]/25">
                    <h3 className="text-lg font-bold text-white mb-2">{item.service}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Timeline</p>
                        <p className="text-[#22c8e5] font-semibold">{item.timeline}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Complexity</p>
                        <p className="text-gray-300 font-semibold">{item.complexity}</p>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#0f1419]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-16">Visual Process Flow</h2>
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto text-left">
              <motion.div 
                className="space-y-8"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-[#1a2332] p-8 rounded-2xl border border-gray-800 hover:border-[#22c8e5]/50 transition-all">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <span className="w-8 h-8 bg-[#22c8e5] rounded-lg flex items-center justify-center text-[#1a2332] text-sm mr-3">∞</span>
                    The Operational Loop
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Our process isn't just a straight line—it's a continuous optimization loop. Each phase feeds data back into the central core, allowing our AI to learn and adapt to your business in real-time.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0f1419] rounded-xl">
                      <p className="text-[#22c8e5] font-bold">Unified</p>
                      <p className="text-xs text-gray-500">Centralized strategy</p>
                    </div>
                    <div className="p-4 bg-[#0f1419] rounded-xl">
                      <p className="text-[#22c8e5] font-bold">Iterative</p>
                      <p className="text-xs text-gray-500">Constant improvement</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-500 italic text-sm px-4">
                  * Scroll to see the node connection protocol in action.
                </p>
              </motion.div>

              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ProcessVisualizer />
                {/* Decorative overlay text for the visualizer */}
                <div className="absolute top-4 left-4 font-mono text-[10px] text-[#22c8e5]/40 uppercase tracking-widest">
                  System.Protocol.Active
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-[#1a2332]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#0f1419] rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#1a2332] transition-colors"
                  >
                    <span className="text-lg font-semibold text-white">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="text-[#22c8e5] flex-shrink-0" size={24} />
                    ) : (
                      <ChevronDown className="text-[#22c8e5] flex-shrink-0" size={24} />
                    )}
                  </button>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-gray-400">{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-[#1a2332] to-[#22c8e5]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl text-white/90 mb-8">Let's discuss your project and create a custom roadmap</p>
            <a
              href="/contact"
              className="inline-block px-8 py-4 bg-[#22c8e5] text-[#003258] rounded-2xl font-bold hover:shadow-lg hover:bg-opacity-90 transition-all"
            >
              Schedule Free Consultation
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default HowItWorksPage;
