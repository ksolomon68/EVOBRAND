
import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, TrendingUp, Clock, DollarSign, Star } from 'lucide-react';
import SEO from '@/components/SEO.jsx';

const OurWorkPage = () => {

  const portfolioItems = [
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
      id: 102,
      title: 'ChamberOS',
      category: 'SaaS Platform',
      industry: 'Business Solutions',
      image: '/projects/chamberos.png',
      metrics: { roi: '12+ Hours/Wk', timeSaved: '19 Modules', revenue: '$0 Setup' },
      description: 'Stop running your chamber on spreadsheets. The all-in-one platform built to automate dues, events, governance, advocacy, and member engagement.',
      link: 'https://evobrand.net/chamberos'
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
      description: 'Serving Only the Best. Premium CBD/Hemp Store with a focus on quality and customer education.'
    },
    {
      id: 12,
      title: 'Pivotal Voice',
      category: 'Web Development',
      industry: 'Government',
      image: '/projects/pivotal-voice.jpg',
      metrics: { roi: 'Engagement', timeSaved: 'Streamlined', revenue: 'N/A' },
      description: 'The comprehensive civic engagement platform connecting Ellis County residents with democracy.'
    },
    {
      id: 1,
      title: 'Breaking Silences',
      category: 'Web Development',
      industry: 'Community',
      image: '/projects/breaking-silences.jpg',
      metrics: { roi: 'N/A', timeSaved: 'High', revenue: 'N/A' },
      description: 'A secure platform featuring live debates, discussion forums, and groups for free speech.'
    },
    {
      id: 3,
      title: 'My Social Grid',
      category: 'Web Development',
      industry: 'Social Media',
      image: '/projects/my-social-grid.jpg',
      metrics: { roi: 'High', timeSaved: 'Real-time', revenue: 'Scalable' },
      description: 'Free speech social media platform for connecting, buying, selling, and learning.'
    },
    {
      id: 4,
      title: 'NTBHA',
      category: 'Web Development',
      industry: 'Healthcare',
      image: '/projects/ntbha.jpg',
      metrics: { roi: 'Impactful', timeSaved: '24/7', revenue: 'Non-profit' },
      description: 'North Texas Behavioral Health Authority website serving multiple counties with crisis resources.'
    },
    {
      id: 5,
      title: 'Pigment Cosmetics',
      category: 'E-commerce',
      industry: 'Retail',
      image: '/projects/pigment-cosmetics.jpg',
      metrics: { roi: 'Sales', timeSaved: 'Streamlined', revenue: 'Direct' },
      description: 'Professional cosmetics e-commerce site offering products, kits, and educational support.'
    },
    {
      id: 6,
      title: 'Esoteric Kings',
      category: 'Web Development',
      industry: 'Community',
      image: '/projects/esoteric-kings.jpg',
      metrics: { roi: 'Membership', timeSaved: 'Efficient', revenue: 'N/A' },
      description: 'Championing Honor, Integrity, and Personal Growth through the timeless principles of Freemasonry.'
    },
    {
      id: 7,
      title: 'NELA Sickle Cell Foundation',
      category: 'Web Development',
      industry: 'Healthcare',
      image: '/projects/nela-sickle-cell.jpg',
      metrics: { roi: 'Outreach', timeSaved: 'Managed', revenue: 'Donations' },
      description: 'Northeast Louisiana Sickle Cell Anemia Foundation - Making a Difference Today.'
    },
    {
      id: 8,
      title: 'Caltrans BizConnect',
      category: 'Web Development',
      industry: 'Government',
      image: '/projects/caltrans.jpg',
      metrics: { roi: 'Contracting', timeSaved: 'Process', revenue: 'Growth' },
      description: 'Statewide supportive services to help SBEs strengthen readiness for transportation contracting opportunities.'
    },
    {
      id: 9,
      title: 'Mid-Cities Links',
      category: 'Web Development',
      industry: 'Community',
      image: '/projects/mid-cities-links.jpg',
      metrics: { roi: 'Service', timeSaved: 'Organized', revenue: 'Fundraising' },
      description: 'Mid-Cities (TX) Chapter of The Links, Incorporated. Community service, leadership, and youth empowerment.'
    },
    {
      id: 10,
      title: 'Stiber Insurance Services',
      category: 'Web Development',
      industry: 'Insurance',
      image: '/projects/stiber-insurance.jpg',
      metrics: { roi: 'Quotes', timeSaved: 'Digital', revenue: 'Policy' },
      description: 'Protecting What Matters Most Since 1985. Homeowners, Flood, Commercial, and Life insurance.'
    }
  ];

  const newPortfolioItems = [
    {
      id: 16,
      title: 'Zarate for Ellis County',
      category: 'Web Development',
      industry: 'Political',
      image: '/projects/zarate-for-ellis-county.jpg',
      metrics: { roi: 'Voters', timeSaved: 'Communication', revenue: 'Campaign' },
      description: 'Jennifer Zarate for Ellis County District Clerk. Proven leadership and values.'
    },
    {
      id: 17,
      title: 'Cutting Edge',
      category: 'Web Development',
      industry: 'Beauty & Wellness',
      image: '/projects/cutting-edge.jpg',
      metrics: { roi: 'Reservations', timeSaved: 'Management', revenue: 'Growth' },
      description: 'Precise. Crafted. Modern techniques with classic service.'
    },
    {
      id: 18,
      title: 'The Star List',
      category: 'Web Development',
      industry: 'Entertainment',
      image: '/projects/the-star-list.jpg',
      metrics: { roi: 'Views', timeSaved: 'Curated', revenue: 'Ads' },
      description: 'The Ultimate Resource for Music-News and Entertainment Around the World!'
    }
  ];

  portfolioItems.push(...newPortfolioItems);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'TechCorp Inc.',
      role: 'CEO',
      image: 'https://images.unsplash.com/photo-1531497684310-0f15276c39ab',
      quote: 'EVOBRAND transformed our business with their AI solutions. We saw a 300% ROI in just 6 months.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      company: 'RetailPro',
      role: 'Marketing Director',
      image: 'https://images.unsplash.com/photo-1531497684310-0f15276c39ab',
      quote: 'The visual content creation service saved us thousands in production costs while improving quality.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      company: 'HealthFirst',
      role: 'Operations Manager',
      image: 'https://images.unsplash.com/photo-1531497684310-0f15276c39ab',
      quote: 'Their video production capabilities are outstanding. Professional results at a fraction of the cost.',
      rating: 5
    }
  ];

  return (
    <>
      <SEO 
        title="Our Work"
        description="Explore our portfolio of successful AI projects. See real results, case studies, and client testimonials from businesses we've transformed."
      />

      <div className="min-h-screen bg-[#0f1419]">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-[#1a2332] to-[#0f1419]">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Our <span className="text-[#22c8e5]">Work</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Real projects. Real results. See how we've helped businesses transform with AI.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="py-20 bg-[#0f1419]">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioItems.map((item, index) => (
                <motion.a
                  href={item.link || '#'}
                  target={item.link ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-[#1a2332] rounded-xl overflow-hidden cursor-pointer group block"
                >
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
                </motion.a>
              ))}
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
              className="inline-block px-8 py-4 bg-white text-[#1a2332] rounded-full font-bold hover:shadow-lg hover:bg-gray-100 transition-all"
            >
              Get Started Today
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default OurWorkPage;
