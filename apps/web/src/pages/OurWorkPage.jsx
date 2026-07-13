
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, MotionConfig } from 'framer-motion';
import { Filter, TrendingUp, Clock, DollarSign, Star } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { PageHero, Reveal } from '@/components/motion/PageMotion.jsx';

gsap.registerPlugin(ScrollTrigger);

const OurWorkPage = () => {
  const reelRef = useRef(null);
  const reelTrackRef = useRef(null);
  const reelProgressRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const track = reelTrackRef.current;
      const section = reelRef.current;
      if (!track || !section) return;
      const getDistance = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (reelProgressRef.current) {
              reelProgressRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });
      return () => {
        if (tween.scrollTrigger) tween.scrollTrigger.kill();
        tween.kill();
      };
    });
    return () => mm.revert();
  }, []);


  const portfolioItems = [
    {
      id: 12,
      title: 'Pivotal Voice',
      category: 'Web Development',
      industry: 'Government',
      image: '/projects/pivotal-voice.jpg',
      highlights: ['Civic Engagement', 'Ellis County', 'Public Platform'],
      description: 'The comprehensive civic engagement platform connecting Ellis County residents with democracy.',
      link: 'https://pivotalvoice.org/'
    },
    {
      id: 102,
      title: 'Chamber Core',
      category: 'SaaS Platform',
      industry: 'Business Solutions',
      image: '/projects/chamberos.png',
      highlights: ['Saves 12+ Hrs/Wk', '19 Modules', '$0 Setup'],
      description: 'Stop running your chamber on spreadsheets. The all-in-one platform built to automate dues, events, governance, advocacy, and member engagement.',
      link: 'https://evobrand.net/chambercore'
    },
    {
      id: 103,
      title: 'PrimeReach',
      category: 'SaaS Platform',
      industry: 'Government',
      image: '/projects/primereach.png',
      highlights: ['White-Label', 'State DOT Ready', 'SBE Matching'],
      description: 'Connect your prime contractors with qualified small businesses. A turnkey, white-label government contracting platform built for transportation and infrastructure agencies.',
      link: 'https://primereachgov.com/'
    },
    {
      id: 104,
      title: 'VibeHyr',
      category: 'Web Development',
      industry: 'Education',
      image: '/projects/vibehyr.png',
      highlights: ['4 Core Courses', 'Daily Journaling', 'Community'],
      description: 'Build your reality. Where neuroscience meets Neville Goddard. Master your internal state through structured courses, daily journaling, and community.',
      link: 'https://vibehyr.com/'
    },
    {
      id: 11,
      title: 'True Releaf',
      category: 'E-commerce',
      industry: 'Retail',
      image: '/projects/true-releaf.jpg',
      highlights: ['Premium CBD/Hemp', 'Quality Focused', 'Customer Education'],
      description: 'Serving Only the Best. Premium CBD/Hemp Store with a focus on quality and customer education.',
      link: 'https://truereleafmonroe.com'
    },
    {
      id: 101,
      title: 'Common Ground Ministries',
      category: 'Web Development',
      industry: 'Non-profit',
      image: '/projects/cgm.png',
      highlights: ['Youth Mentorship', 'Faith-Based', 'Online Donations'],
      description: 'Where every child is celebrated for who they are. Serving at-risk children with faith, mentorship, and a safe place to grow.',
      link: 'https://evobrand.net/cgm/'
    },
    {
      id: 5,
      title: 'Pigment Cosmetics',
      category: 'E-commerce',
      industry: 'Retail',
      image: '/projects/pigment-cosmetics.jpg',
      highlights: ['Products & Kits', 'Pro Cosmetics', 'Education Support'],
      description: 'Professional cosmetics e-commerce site offering products, kits, and educational support.',
      link: 'https://pigmentcosmetics.com/'
    },
    {
      id: 7,
      title: 'NELA Sickle Cell Foundation',
      category: 'Web Development',
      industry: 'Healthcare',
      image: '/projects/nela-sickle-cell.jpg',
      highlights: ['Health Advocacy', 'Community Outreach', 'Online Donations'],
      description: 'Northeast Louisiana Sickle Cell Anemia Foundation - Making a Difference Today.',
      link: 'https://nelascaf.org/'
    },
    {
      id: 8,
      title: 'Caltrans BizConnect',
      category: 'Web Development',
      industry: 'Government',
      image: '/projects/caltrans.jpg',
      highlights: ['Statewide Program', 'SBE Support', 'Gov Contracting'],
      description: 'Statewide supportive services to help SBEs strengthen readiness for transportation contracting opportunities.',
      link: 'https://caltransbizconnect.org/'
    },
    {
      id: 9,
      title: 'Mid-Cities Links',
      category: 'Web Development',
      industry: 'Community',
      image: '/projects/mid-cities-links.jpg',
      highlights: ['Community Service', 'Youth Empowerment', 'Fundraising'],
      description: 'Mid-Cities (TX) Chapter of The Links, Incorporated. Community service, leadership, and youth empowerment.',
      link: 'https://evobrand.net/MidCityLinks'
    },
    {
      id: 10,
      title: 'Stiber Insurance Services',
      category: 'Web Development',
      industry: 'Insurance',
      image: '/projects/stiber-insurance.jpg',
      highlights: ['Since 1985', 'Online Quotes', 'Multi-Line Coverage'],
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
      highlights: ['Music & Entertainment', 'Curated Content', 'Global Reach'],
      description: 'The Ultimate Resource for Music-News and Entertainment Around the World!',
      link: 'https://thestarlist.com/'
    },
    {
      id: 19,
      title: 'Jewels of North Texas',
      category: 'Web Development',
      industry: 'Non-profit',
      image: '/projects/jewels-of-north-texas.jpg',
      highlights: ['11 Chapters', 'Debutante Gala', 'Legacy Event'],
      description: 'The inaugural debutante presentation by the 11 chapters of the Dallas Center of Excellence within Jack and Jill of America — celebrating young women of extraordinary character.',
      link: 'https://evobrandconcepts.com/jewels/'
    },
    {
      id: 20,
      title: 'HAMPCO, Inc.',
      category: 'Web Development',
      industry: 'Non-profit',
      image: '/projects/hampco.jpg',
      highlights: ['400K+ Served', '30+ Years', '35+ Programs'],
      description: 'Empowering Families. Building Stronger Communities. HAMPCO is dedicated to socioeconomic elevation, teen mentorship, healthcare outreach, and financial literacy across Northeast Louisiana.',
      link: 'https://hampcoinc.org'
    },
    {
      id: 21,
      title: 'PulseOps',
      category: 'Web Development',
      industry: 'Industrial IoT',
      image: '/projects/pulseops.jpg',
      highlights: ['99.97% Uptime', 'Real-Time Ops', '6× Faster MTTR'],
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

        {/* Featured reel — pinned horizontal showcase of flagship builds */}
        <section ref={reelRef} className="relative overflow-hidden bg-[#0f1419]">
          <div className="relative py-16 lg:py-0 lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
            <div className="container mx-auto px-4">
              <Reveal>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#22c8e5] mb-3">
                  Featured Work — The Reel
                </p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                  Flagship <span className="text-[#22c8e5]">Builds</span>
                </h2>
              </Reveal>
            </div>

            <div className="mt-10 overflow-hidden">
              <div
                ref={reelTrackRef}
                className="flex flex-col lg:flex-row gap-6 container mx-auto px-4 lg:max-w-none lg:w-max lg:mx-0 lg:pl-[max(1rem,calc((100vw-1168px)/2))] lg:pr-[max(1rem,calc((100vw-1168px)/2))]"
              >
                {[102, 103, 12, 21].map((id, i) => {
                  const item = portfolioItems.find((p) => p.id === id);
                  if (!item) return null;
                  return (
                    <a
                      key={id}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group lg:w-[620px] lg:shrink-0 rounded-2xl overflow-hidden border border-white/5 bg-[#141d2b] hover:border-[#22c8e5]/40 transition-colors block"
                    >
                      <div className="relative h-56 lg:h-72 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141d2b] via-transparent to-transparent" />
                        <span className="absolute top-4 left-4 text-[11px] font-bold tracking-[0.25em] text-[#22c8e5] bg-[#0f1419]/80 px-3 py-1.5 rounded-full border border-[#22c8e5]/20">
                          {String(i + 1).padStart(2, '0')} / 04
                        </span>
                      </div>
                      <div className="p-6 lg:p-8">
                        <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.highlights.map((h) => (
                            <span key={h} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#0f1419] border border-[#22c8e5]/15 text-[#22c8e5]">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>

              <div className="hidden lg:block container mx-auto px-4 mt-8">
                <div className="h-0.5 w-full rounded-full bg-white/10">
                  <div
                    ref={reelProgressRef}
                    className="h-full rounded-full bg-[#22c8e5]"
                    style={{ transform: 'scaleX(0)', transformOrigin: 'left', boxShadow: '0 0 8px rgba(34,200,229,0.5)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

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
                      {item.highlights && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.highlights.map((h) => (
                            <span
                              key={h}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#0f1419] border border-[#22c8e5]/15 text-[#22c8e5]"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
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
