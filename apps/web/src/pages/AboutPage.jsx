
import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, Users, Award, MapPin, Mail, Phone } from 'lucide-react';
import SEO from '@/components/SEO.jsx';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      title: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1531497684310-0f15276c39ab',
      bio: 'AI strategist with 15+ years in technology innovation and business transformation.'
    },
    {
      name: 'Michael Chen',
      title: 'CTO',
      image: 'https://images.unsplash.com/photo-1531497684310-0f15276c39ab',
      bio: 'Machine learning expert specializing in custom AI solutions and automation.'
    },
    {
      name: 'Emily Rodriguez',
      title: 'Head of Design',
      image: 'https://images.unsplash.com/photo-1531497684310-0f15276c39ab',
      bio: 'Creative director with expertise in AI-powered visual content and brand design.'
    },
    {
      name: 'Dr. James Wilson',
      title: 'AI Research Lead',
      image: 'https://images.unsplash.com/photo-1531497684310-0f15276c39ab',
      bio: 'PhD in Computer Science, focused on natural language processing and predictive analytics.'
    }
  ];

  const coreValues = [
    {
      icon: <Lightbulb size={40} />,
      title: 'Innovation',
      description: 'We push boundaries and explore cutting-edge AI technologies to deliver transformative solutions.'
    },
    {
      icon: <Target size={40} />,
      title: 'Transparency',
      description: 'Clear communication, honest timelines, and no hidden costs. You always know where your project stands.'
    },
    {
      icon: <Award size={40} />,
      title: 'Results-Driven',
      description: 'We measure success by your ROI. Every solution is designed to deliver measurable business value.'
    },
    {
      icon: <Users size={40} />,
      title: 'Human-in-the-Loop',
      description: 'AI augments human capability, not replaces it. We design solutions that empower your team.'
    }
  ];

  const awards = [
    { title: 'Best AI Innovation 2025', organization: 'Tech Excellence Awards' },
    { title: 'Top AI Agency 2025', organization: 'Business Insider' },
    { title: 'SOC 2 Type II Certified', organization: 'Security Compliance' },
    { title: 'GDPR Compliant', organization: 'EU Data Protection' }
  ];

  return (
    <>
      <SEO
        title="About EVOBRAND | AI Agency Founded in Dallas, TX"
        description="Since 1999, EVOBRAND has evolved from a creative agency to a leading AI transformation partner. Led by Keisha Solomon, we deliver custom AI solutions, visual content, and intelligent automation to businesses nationwide."
        keywords="about EVOBRAND, AI agency Dallas, Keisha Solomon, AI transformation, AI company Texas, custom AI solutions company"
        canonical="https://evobrand.net/about"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "EVOBRAND Concepts LLC",
          "url": "https://evobrand.net",
          "logo": "https://evobrand.net/logo.png",
          "foundingDate": "1999",
          "description": "Dallas-based AI transformation agency delivering custom AI applications, visual content, and intelligent automation.",
          "email": "info@evobrand.net",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Dallas",
            "addressRegion": "TX",
            "addressCountry": "US"
          },
          "founder": {
            "@type": "Person",
            "name": "Keisha Solomon",
            "jobTitle": "CEO & Founder"
          },
          "sameAs": ["https://evobrandconcepts.com"]
        }}
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
                AI Transformation Partner<br />
                <span className="text-[#22c8e5]">Not Just an Agency</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                We're on a mission to make AI accessible and impactful for businesses of all sizes
              </p>
            </motion.div>
          </div>
        </section>

        {/* Company Story */}
        <section className="py-20 bg-[#0f1419]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#1a2332] p-8 md:p-12 rounded-2xl"
              >
                <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    Founded in 1999, EVOBRAND began as a traditional creative agency, helping hundreds of businesses build their brands and digital presence over two decades of rapid technological change.
                  </p>
                  <p>
                    In 2024, we experienced our own evolution. We recognized that AI was no longer just a buzzword—it was a fundamental shift. However, we saw our clients struggling to harness its power due to complex implementations, high costs, and unclear ROI.
                  </p>
                  <p>
                    We decided to change that. Bringing together our deep branding expertise with cutting-edge AI specialists, we completely transformed our own process. Now, we help businesses navigate this exact same transformation, making AI accessible, practical, and highly profitable.
                  </p>
                  <p className="text-[#22c8e5] font-semibold">
                    Our legacy is built on decades of experience, but our future is driven by artificial intelligence. The AI revolution is here, and we're committed to ensuring your business doesn't just survive—it thrives.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-[#1a2332]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {coreValues.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#0f1419] p-6 rounded-xl text-center"
                >
                  <div className="text-[#22c8e5] mb-4 flex justify-center">{value.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                  <p className="text-gray-400 text-sm">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>



        {/* Awards & Certifications */}
        <section className="py-20 bg-[#1a2332]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Awards & Certifications</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {awards.map((award, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#0f1419] p-6 rounded-xl text-center"
                >
                  <Award className="text-[#ffc800] mx-auto mb-3" size={32} />
                  <h3 className="text-white font-bold mb-1">{award.title}</h3>
                  <p className="text-gray-400 text-sm">{award.organization}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>



        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-[#1a2332] to-[#22c8e5]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Join Our Success Story</h2>
            <p className="text-xl text-white/90 mb-8">Let's transform your business together</p>
            <a
              href="/contact"
              className="inline-block px-8 py-4 bg-[#22c8e5] text-[#003258] rounded-full font-bold hover:shadow-lg hover:bg-opacity-90 transition-all"
            >
              Get in Touch
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
