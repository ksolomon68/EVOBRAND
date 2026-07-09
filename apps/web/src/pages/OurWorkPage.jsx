
import React from 'react';
import { useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { Filter, TrendingUp, Clock, DollarSign, Star } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { PageHero, Reveal } from '@/components/motion/PageMotion.jsx';

const OurWorkPage = () => {

  const portfolioItems = [
    {
      id: 12,
      title: 'Pivotal Voice',
      category: 'Web Development',
      industry: 'Government',
      image: '/projects/pivotal-voice.jpg',
      metrics: { roi: 'Engagement', timeSaved: 'Streamlined', revenue: 'N/A' },
      description: 'The comprehensive civic engagement platform connecting Ellis County residents with democracy.',
      link: 'https://pivotalvoice.org/'
    },
    {
      id: 102,
      title: 'Chamber Core',
      category: 'SaaS Platform',
      industry: 'Business Solutions',
      image: '/projects/chamberos.png',
      metrics: { roi: '12+ Hours/Wk', timeSaved: '19 Modules', revenue: '$0 Setup' },
      description: 'Stop running your chamber on spreadsheets. The all-in-one platform built to automate dues, events, governance, advocacy, and member engagement.',
      link: 'https://evobrand.net/chambercore'
    },
    {
      id: 103,
      title: 'PrimeReach',
      category: 'SaaS Platform',
      industry: 'Government',
      image: '/projects/primereach.png',
      metrics: { roi: 'SBE Readiness', timeSaved: 'White-Label', revenue: 'State-DOT' },
      description: 'Connect your prime contractors with qualified small businesses. A turnkey, white-label government contracting platform built for transportation and infrastructure agencies.',
      link: 'https://primereachgov.com/'
    },
    {
      id: 104,
      title: 'VibeHyr',
      category: 'Web Development',
      industry: 'Education',
      image: '/projects/vibehyr.png',
      metrics: { roi: '4 Core Courses', timeSaved: 'Reality Potential', revenue: '3 Tiers' },
      description: 'Build your reality. Where neuroscience meets Neville Goddard. Master your internal state through structured courses, daily journaling, and community.',
      link: 'https://vibehyr.com/'
    },
    {
      id: 11,
      title: 'True Releaf',
      category: 'E-commerce',
      industry: 'Retail',
      image: '/projects/true-releaf.jpg',
      metrics: { roi: 'Growth', timeSaved: 'Efficient', revenue: 'Sales' },
      description: 'Serving Only the Best. Premium CBD/Hemp Store with a focus on quality and customer education.',
      link: 'https://truereleafmonroe.com'
    },
    {
      id: 101,
      title: 'Common Ground Ministries',
      category: 'Web Development',
      industry: 'Non-profit',
      image: '/projects/cgm.png',
      metrics: { roi: 'Community', timeSaved: 'Outreach', revenue: 'Donations' },
      description: 'Where every child is celebrated for who they are. Serving at-risk children with faith, mentorship, and a safe place to grow.',
      link: 'https://evobrand.net/cgm/'
    },
    {
      id: 5,
      title: 'Pigment Cosmetics',
      category: 'E-commerce',
      industry: 'Retail',
      image: '/projects/pigment-cosmetics.jpg',
      metrics: { roi: 'Sales', timeSaved: 'Streamlined', revenue: 'Direct' },
      description: 'Professional cosmetics e-commerce site offering products, kits, and educational support.',
      link: 'https://pigmentcosmetics.com/'
    },
    {
      id: 7,
      title: 'NELA Sickle Cell Foundation',
      category: 'Web Development',
      industry: 'Healthcare',
      image: '/projects/nela-sickle-cell.jpg',
      metrics: { roi: 'Outreach', timeSaved: 'Managed', revenue: 'Donations' },
      description: 'Northeast Louisiana Sickle Cell Anemia Foundation - Making a Difference Today.',
      link: 'https://nelascaf.org/'
    },
    {
      id: 8,
      title: 'Caltrans BizConnect',
      category: 'Web Development',
      industry: 'Government',
      image: '/projects/caltrans.jpg',
      metrics: { roi: 'Contracting', timeSaved: 'Process', revenue: 'Growth' },
      description: 'Statewide supportive services to help SBEs strengthen readiness for transportation contracting opportunities.',
      link: 'https://caltransbizconnect.org/'
    },
    {
      id: 9,
      title: 'Mid-Cities Links',
      category: 'Web Development',
      industry: 'Community',
      image: '/projects/mid-cities-links.jpg',
      metrics: { roi: 'Service', timeSaved: 'Organized', revenue: 'Fundraising' },
      description: 'Mid-Cities (TX) Chapter of The Links, Incorporated. Community service, leadership, and youth empowerment.',
      link: 'https://evobrand.net/MidCityLinks'
    },
    {
      id: 10,
      title: 'Stiber Insurance Services',
      category: 'Web Development',
      industry: 'Insurance',
      image: '/projects/stiber-insurance.jpg',
      metrics: { roi: 'Quotes', timeSaved: 'Digital', revenue: 'Policy' },
      description: 'Protecting What Matters Most Since 1985. Homeowners, Flood, Commercial, and Life insurance.',
      link: 'https://stiberinsuranceservices.com/'
    }
  ];

  const newPortfolioItems = [
    {
      id: 18,
      title: 'The Star List',
      category: 'Web Development',
      industry: 'Entertainment',
      image: '/projects/the-star-list.jpg',
      metrics: { roi: 'Views', timeSaved: 'Curated', revenue: 'Ads' },
      description: 'The Ultimate Resource for Music-News and Entertainment Around the World!',
      link: 'https://thestarlist.com/'
    },
    {
      id: 19,
      title: 'Jewels of North Texas',
      category: 'Web Development',
      industry: 'Non-profit',
      image: '/projects/jewels-of-north-texas.jpg',
      metrics: { roi: 'Legacy', timeSaved: 'Excellence', revenue: 'Community' },
      description: 'The inaugural debutante presentation by the 11 chapters of the Dallas Center of Excellence within Jack and Jill of America — celebrating young women of extraordinary character.',
      link: 'https://evobrandconcepts.com/jewels/'
    },
    {
      id: 20,
      title: 'HAMPCO, Inc.',
      category: 'Web Development',
      industry: 'Non-profit',
      image: '/projects/hampco.jpg',
      metrics: { roi: '400K+', timeSaved: '30+ Yrs', revenue: '35+ Programs' },
      description: 'Empowering Families. Building Stronger Communities. HAMPCO is dedicated to socioeconomic elevation, teen mentorship, healthcare outreach, and financial literacy across Northeast Louisiana.',
      link: 'https://hampcoinc.org'
    },
    {
      id: 21,
      title: 'PulseOps',
      category: 'Web Development',
      industry: 'Industrial IoT',
      image: '/projects/pulseops.jpg',
      metrics: { roi: '99.97%', timeSaved: '47ms', revenue: '6× MTTR' },
      description: 'Zero Downtime Starts Here. PulseOps unifies operational technology and IT infrastructure into a single real-time command surface for industrial teams.',
      link: 'https://evobrandconcepts.com/html/pulseops.html'
    }
  ];

  portfolioItems.push(...newPortfolioItems);

  const testimonials = [
    {
      name: 'Marcus T.',
      company: 'Civic Initiative',
      role: 'Project Director',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
      quote: 'Keisha and the EVOBRAND team were exactly what we needed. They took a complex set of requirements for our public portal and built a platform our community actually loves using. The communication was stellar from day one.',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      company: 'Growth Partners',
      role: 'Founder',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      quote: "We struggled for months trying to piece together a coherent brand identity. EVOBRAND stepped in, mapped out a clear strategy, and completely overhauled our web presence. Our conversion rate has literally doubled since the relaunch.",
      rating: 5
    },
    {
      name: 'David S.',
      company: 'B2B Solutions Group',
      role: 'Operations Lead',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      quote: 'Finding an agency that actually understands both complex backend systems and high-end design is rare. EVOBRAND delivered a custom web application that replaced three legacy tools we were using. We couldn\'t be happier with the result.',
      rating: 5
    }
  ];

  return (
    <>
      <SEO
        title="AI Portfolio & Case Studies | Client Work | EVOBRAND"
        description="Browse EVOBRAND's portfolio: 500+ projects across web development, SaaS platforms, government contracting, healthcare, e-commerce, and AI-powered solutions. Real clients, real results."
        keywords="EVOBRAND portfolio, AI case studies, web development portfolio, Ellis County web design, SaaS development, government contracting platform"
        canonical="https://evobrand.net/our-work"
      />

      <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#0f1419]">
        {/* Hero */}
        <PageHero
          eyebrow="Web · SaaS · Government · Nonprofit"
          lines={[[{ t: 'Our' }, { t: 'Work', accent: true }]]}
          sub="Real projects. Real results. See how we've helped businesses transform with AI."
        />

        {/* Portfolio Grid */}
        <section className="py-20 bg-[#0f1419]">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioItems.map((item, index) => {
                const cardProps = {
                  key: item.id,
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: '-40px' },
                  transition: { delay: (index % 3) * 0.08, duration: 0.5 },
                  whileHover: { y: -10 },
                  className: `bg-[#1a2332] rounded-xl overflow-hidden group block border border-white/5 hover:border-[#22c8e5]/30 transition-colors ${item.link ? 'cursor-pointer' : 'cursor-default'}`,
                };
                const inner = (
                  <>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-[#22c8e5] text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {item.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-[#0f1419] p-2 rounded text-center">
                          <p className="text-xs text-gray-500">ROI</p>
                          <p className="text-[#22c8e5] font-bold">{item.metrics.roi}</p>
                        </div>
                        <div className="bg-[#0f1419] p-2 rounded text-center">
                          <p className="text-xs text-gray-500">Time Saved</p>
                          <p className="text-[#22c8e5] font-bold">{item.metrics.timeSaved}</p>
                        </div>
                        <div className="bg-[#0f1419] p-2 rounded text-center">
                          <p className="text-xs text-gray-500">Revenue</p>
                          <p className="text-[#22c8e5] font-bold">{item.metrics.revenue}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{item.industry}</span>
                    </div>
                  </>
                );
                return item.link ? (
                  <motion.a {...cardProps} href={item.link} target="_blank" rel="noopener noreferrer">
                    {inner}
                  </motion.a>
                ) : (
                  <motion.div {...cardProps}>
                    {inner}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-[#1a2332]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Client Testimonials</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#0f1419] p-6 rounded-xl"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                      <p className="text-sm text-[#22c8e5]">{testimonial.company}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="text-[#ffc800] fill-current" size={16} />
                    ))}
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-[#1a2332] to-[#22c8e5]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Start Your Project</h2>
            <p className="text-xl text-white/90 mb-8">Join our growing list of successful clients</p>
            <a
              href="/contact"
              className="inline-block px-8 py-4 bg-white text-[#1a2332] rounded-2xl font-bold hover:shadow-lg hover:bg-gray-100 transition-all"
            >
              Get Started Today
            </a>
          </div>
        </section>
      </div>
      </MotionConfig>
    </>
  );
};

export default OurWorkPage;
