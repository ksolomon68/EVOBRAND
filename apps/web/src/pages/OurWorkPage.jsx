
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, MotionConfig } from 'framer-motion';
import { Filter, TrendingUp, Clock, DollarSign, Star, ExternalLink, LayoutDashboard } from 'lucide-react';
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


  const flagshipItems = [
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
      id: 104,
      title: 'VibeHyr',
      category: 'Web Development',
      industry: 'Education',
      image: '/projects/vibehyr.png',
      highlights: ['4 Core Courses', 'Daily Journaling', 'Community'],
      description: 'Build your reality. Where neuroscience meets Neville Goddard. Master your internal state through structured courses, daily journaling, and community.',
      link: 'https://vibehyr.com/'
    }
  ];

  const dashboardDemos = [
    {
      id: 300,
      title: 'EVOCORE',
      subtitle: 'Dual-Screen Simulator',
      category: 'Dashboard Demo',
      industry: 'SaaS / Operations',
      image: '/projects/evocore.jpeg',
      highlights: ['Interactive Prototype', 'Mobile Crew App', 'Admin Portal', 'Real-Time Sync'],
      description: 'Interactive simulator showing how the Mobile Crew App and Admin Portal sync in real-time.',
      link: 'https://evobrandconcepts.com/evocore/'
    },
    {
      id: 301,
      title: 'Who Wanna Pho',
      subtitle: 'Operations Hub & Management',
      category: 'Dashboard Demo',
      industry: 'Hospitality / Operations',
      image: '/projects/whowannapho.png',
      highlights: ['Shift Coverage', 'Reservations', 'Hookah Tracking', 'Revenue Analytics'],
      description: 'All-in-one operations hub featuring live reservations, staff shift coverage, hookah tracking, kitchen display system, and automated revenue analytics.',
      link: 'https://evobrandconcepts.com/whowannapho/'
    },
    {
      id: 302,
      title: 'Bull Headed Security',
      subtitle: 'Officer Portal & Admin Console',
      category: 'Dashboard Demo',
      industry: 'Workforce & Security',
      image: '/projects/bhs1.png',
      highlights: ['Officer Portal', 'Admin Console', 'Duty Status & Timesheets', 'Incident Queue'],
      description: 'Dual-portal workforce management system for field officers to clock in, complete checklists, log tickets, and leadership to oversee site coverage.',
      link: 'https://evobrandconcepts.com/bhs1/'
    },
    {
      id: 303,
      title: 'The Walls Project',
      subtitle: 'Community Reactivation Hub',
      category: 'Dashboard Demo',
      industry: 'Non-Profit / Community',
      image: '/projects/walls1.png',
      highlights: ['Public Art', 'Urban Farming', 'Youth Culture', 'Walls Connect'],
      description: 'Dynamic platform driving community reactivation across 3 states — unifying public art initiatives, urban agriculture, youth culture programs, and neighborhood impact.',
      link: 'https://evobrandconcepts.com/walls1/'
    },
    {
      id: 304,
      title: 'Renaissance Rehabilitation',
      subtitle: 'Healthcare & Staff Portal',
      category: 'Dashboard Demo',
      industry: 'Healthcare & Operations',
      image: '/projects/rehab.png',
      highlights: ['24/7 Admissions', 'Public Site & Staff Portal', '6 Care Programs', 'Resident Care'],
      description: 'Integrated healthcare and admissions portal providing 24/7 resident intake, care program management, staff portal access, and interdisciplinary workflow coordination.',
      link: 'https://evobrandconcepts.com/rehab/'
    },
    {
      id: 305,
      title: 'RBCA Workforce Portal',
      subtitle: 'Second Chance & Community Hub',
      category: 'Dashboard Demo',
      industry: 'Workforce & Education',
      image: '/projects/rbca-portal.png',
      highlights: ['Participant Database', 'Cohort Lifecycle', 'Grad Readiness', 'Stipend Tracker'],
      description: 'All-in-one workforce operations hub tracking 5-week program lifecycles, participant databases, contractor networks, stipend disbursements, and job placement analytics.',
      link: 'https://evobrandconcepts.com/rbca1/rbca-portal.html'
    },
    {
      id: 306,
      title: 'DFW Urban League Governance',
      subtitle: 'Board & Leadership Resource Center',
      category: 'Dashboard Demo',
      industry: 'Governance & Non-Profit',
      image: '/projects/dfwul.png',
      highlights: ['Role-Based Access', 'Board Packets', 'Finance & Budgets', 'Program Impact Q2'],
      description: 'Interactive governance hub allowing board members, finance officers, HR, and committee leads to access real-time board packets, financial oversight, and program impact metrics.',
      link: 'https://evobrandconcepts.com/DFWUL/'
    },
    {
      id: 307,
      title: 'NOVA Transformation Portal',
      subtitle: 'Employer & Digital Growth Hub',
      category: 'Dashboard Demo',
      industry: 'Business Growth & SaaS',
      image: '/projects/nova.png',
      highlights: ['Digital Audits', 'Transformation Roadmap', 'Virtual Coaching Room', 'Resource Matching'],
      description: 'Small business portal providing automated digital audits, step-by-step transformation roadmaps, virtual 1-on-1 coaching integration, and priority growth resources.',
      link: 'https://evobrand.net/nova/'
    }
  ];

  const recentLaunches = [
    {
      id: 107,
      title: "The Texas Theater",
      category: 'Web Development',
      industry: 'Entertainment',
      image: '/projects/ttt.png',
      highlights: ['Live Music & Film', 'Historic Venue', 'Waxahachie TX'],
      description: "A restored 1939 art-deco theater on the square in Waxahachie, Texas. Live music, film, and theater under a working neon marquee.",
      link: 'https://evobrandconcepts.com/ttt/'
    },
    {
      id: 106,
      title: "Christopher's Pinpoint",
      category: 'Web Development',
      industry: 'Fashion & Apparel',
      image: '/projects/cpp.png',
      highlights: ['Bespoke Suits', 'Custom Haberdasher', 'Monroe LA'],
      description: "We don't make suits. We build character. Hand-cut, hand-stitched garments built from a pattern that exists nowhere else but on you.",
      link: 'https://christopherspinpoint.com/'
    },
    {
      id: 20,
      title: 'RBCA Community Development Corporation',
      category: 'Web Development',
      industry: 'Non-profit',
      image: '/projects/rbcacdc.png',
      highlights: ['Workforce Development', 'Second Chance', 'Career Placement'],
      description: 'Building Careers. Rebuilding Lives. Strengthening Communities. A 5-week Second Chance Workforce Development Program equipping returning citizens with industry certifications, hands-on training, and real career placement support.',
      link: 'https://rbcacdc.org'
    },
    {
      id: 105,
      title: "Big Al's Down The Hatch",
      category: 'Web Development',
      industry: 'Hospitality',
      image: '/projects/bigals.png',
      highlights: ['Menu', 'Karaoke', 'Catering'],
      description: 'Pizza, wings and more from the pit behind the bar. Karaoke that gets loud, brunch that runs till 2, and a party trailer Big Al will drive straight to your backyard.',
      link: 'https://evobrandconcepts.com/bigals'
    },
    {
      id: 101,
      title: 'Common Ground Ministries',
      category: 'Web Development',
      industry: 'Non-profit',
      image: '/projects/cgm.png',
      highlights: ['Youth Mentorship', 'Faith-Based', 'Online Donations'],
      description: 'Where every child is celebrated for who they are. Serving at-risk children with faith, mentorship, and a safe place to grow.',
      link: 'https://cgmhachie.org'
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
    },
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
    }
  ];

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
                {flagshipItems.map((item, i) => (
                  <a
                    key={item.id}
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
                        {String(i + 1).padStart(2, '0')} / {String(flagshipItems.length).padStart(2, '0')}
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
                ))}
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

        {/* Dashboard Demos */}
        <section id="dashboard-demos" className="py-20 bg-[#111823] border-y border-white/10 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#22c8e5]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mb-12">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#22c8e5]/10 border border-[#22c8e5]/25 text-[#22c8e5] text-xs font-bold uppercase tracking-widest mb-4">
                  <LayoutDashboard className="w-4 h-4" />
                  Live Applications & Portals
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Dashboard <span className="text-[#22c8e5]">Demos</span>
                </h2>
                <p className="text-gray-300 text-base md:text-lg">
                  Explore live custom portals, workforce management consoles, community hubs, and operations dashboards built by EVOBRAND.
                </p>
              </Reveal>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {dashboardDemos.map((demo, index) => (
                <motion.div
                  key={demo.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group relative rounded-2xl overflow-hidden bg-[#16202e] border border-white/10 hover:border-[#22c8e5]/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-64 md:h-72 overflow-hidden bg-[#0f1419]">
                      <img
                        src={demo.image}
                        alt={demo.title}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#16202e] via-transparent to-transparent opacity-90" />
                      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0f1419]/80 text-[#22c8e5] border border-[#22c8e5]/25 backdrop-blur-md">
                          {demo.category}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Live Demo
                        </span>
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      <div className="mb-3">
                        <h3 className="text-2xl font-bold text-white group-hover:text-[#22c8e5] transition-colors">
                          {demo.title}
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#22c8e5]/80 mt-1">
                          {demo.subtitle}
                        </p>
                      </div>

                      <p className="text-gray-300 text-sm leading-relaxed mb-6">
                        {demo.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {demo.highlights.map((h) => (
                          <span
                            key={h}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#0f1419] border border-[#22c8e5]/20 text-gray-300"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 md:px-8 md:pb-8 pt-0">
                    <a
                      href={demo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl bg-[#22c8e5] text-[#003258] font-bold text-sm hover:bg-[#38d4ef] hover:shadow-[0_0_20px_rgba(34,200,229,0.4)] transition-all"
                    >
                      Launch Live Demo
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Launches */}
        <section id="recent-launches" className="py-20 bg-[#0f1419]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mb-12">
              <Reveal>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#22c8e5] mb-3">
                  Portfolio & Client Solutions
                </p>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Recent <span className="text-[#22c8e5]">Launches</span>
                </h2>
                <p className="text-gray-300 text-base md:text-lg">
                  Explore our latest custom websites, non-profit portals, e-commerce platforms, and specialized digital solutions.
                </p>
              </Reveal>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentLaunches.map((item, index) => {
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
