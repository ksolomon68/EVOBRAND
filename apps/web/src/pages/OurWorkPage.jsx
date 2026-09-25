
import React from 'react';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, MotionConfig } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { CtaBand, InnerHero } from '@/components/inner/InnerKit.jsx';
import { ButtonLink, SectionHeading } from '@/components/system/Section.jsx';

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
          start: 'top 80px', // below the sticky header
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
      link: 'https://chambercore.net'
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
      id: 105,
      title: 'The AI Executive Sandbox',
      category: 'Executive Education',
      industry: 'AI & Leadership',
      image: '/projects/keishasolomon.png',
      highlights: ['8-Month Cohort', 'Hands-On Building', 'Executive AI'],
      description: 'Applied AI for Leadership & Business Innovation. An eight-month, in-person cohort where leaders build working AI assets, policies, workflows, and pipelines.',
      link: 'https://keishasolomon.com/'
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
      description: 'Dynamic platform driving community reactivation across 3 states, unifying public art initiatives, urban agriculture, youth culture programs, and neighborhood impact.',
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
      description: 'The inaugural debutante presentation by the 11 chapters of the Dallas Center of Excellence within Jack and Jill of America, celebrating young women of extraordinary character.',
      link: 'https://evobrandconcepts.com/jewels/'
    }
  ];

  const testimonials = [
    {
      name: 'Marcus T.',
      company: 'Civic Initiative',
      role: 'Project Director',
      quote: 'Keisha and the EVOBRAND team were exactly what we needed. They took a complex set of requirements for our public portal and built a platform our community actually loves using. The communication was stellar from day one.',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      company: 'Growth Partners',
      role: 'Founder',
      quote: "We struggled for months trying to piece together a coherent brand identity. EVOBRAND stepped in, mapped out a clear strategy, and completely overhauled our web presence. Our conversion rate has literally doubled since the relaunch.",
      rating: 5
    },
    {
      name: 'David S.',
      company: 'B2B Solutions Group',
      role: 'Operations Lead',
      quote: 'Finding an agency that actually understands both complex backend systems and high-end design is rare. EVOBRAND delivered a custom web application that replaced three legacy tools we were using. We couldn\'t be happier with the result.',
      rating: 5
    }
  ];

  return (
    <>
      <SEO
        title="Our Work: Platforms, Websites and Case Studies"
        description="Selected EVOBRAND work for government agencies, nonprofits, and businesses: government contracting platforms, membership systems, websites, and custom applications."
        keywords="EVOBRAND portfolio, AI case studies, web development portfolio, Ellis County web design, SaaS development, government contracting platform"
        canonical="https://evobrand.net/our-work"
      />

      <MotionConfig reducedMotion="user">
        <InnerHero
          crumbs={[{ label: 'Our work' }]}
          label="Web · SaaS · Government · Nonprofit"
          lead="Built for real people."
          emphasis="Put to work every day."
          intro="Platforms for contracting, membership, workforce development and civic participation, plus websites for businesses and nonprofits. Every project here is live; open any of them."
          actions={[
            { to: '/book-consultation', label: 'Start a project', cta: 'work-hero-start' },
            { to: '/free-demo-portal', label: 'Get a free demo portal', cta: 'work-hero-demo' },
          ]}
          media={{
            src: '/projects/optimized/caltrans-1900.webp',
            srcSet: '/projects/optimized/caltrans-960.webp 960w, /projects/optimized/caltrans-1900.webp 1900w',
            width: 1898,
            height: 909,
            alt: 'Caltrans BizConnect home page',
            caption: 'Caltrans BizConnect · Statewide small business platform',
          }}
          jumps={[
            { href: '#flagship', label: 'Flagship platforms' },
            { href: '#dashboard-demos', label: 'Dashboard demos' },
            { href: '#recent-launches', label: 'Recent launches' },
            { href: '#testimonials', label: 'What clients say' },
          ]}
        />

        {/* Featured reel: pinned horizontal showcase of flagship builds */}
        <section id="flagship" ref={reelRef} className="work-reel" aria-labelledby="flagship-heading">
          <div className="work-reel__stage">
            <div className="evo-container work-reel__head">
              <SectionHeading
                id="flagship-heading"
                label="01 · Flagship platforms"
                lead="Products we built"
                emphasis="and still run."
              />
              <div className="work-reel__progress" aria-hidden="true"><span ref={reelProgressRef} /></div>
            </div>

            <div className="work-reel__viewport">
              <div ref={reelTrackRef} className="work-reel__track">
                {flagshipItems.map((item, i) => (
                  <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" className="work-card work-card--wide">
                    <div className="work-card__media">
                      <img src={item.image} alt={`${item.title} home page`} loading="lazy" decoding="async" />
                      <span className="work-card__index">{String(i + 1).padStart(2, '0')} / {String(flagshipItems.length).padStart(2, '0')}</span>
                    </div>
                    <div className="work-card__body">
                      <p className="work-card__meta">{item.category} · {item.industry}</p>
                      <h3 className="work-card__title">{item.title}</h3>
                      <p className="work-card__text">{item.description}</p>
                      <ul className="work-card__chips">
                        {item.highlights.map((h) => <li key={h}>{h}</li>)}
                      </ul>
                      <span className="work-card__cta">Visit the live site <ExternalLink size={15} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span></span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Demos */}
        <section id="dashboard-demos" className="evo-block evo-block--slate" aria-labelledby="demos-heading">
          <div className="evo-container">
            <div className="work-section-head">
              <SectionHeading
                id="demos-heading"
                label="02 · Dashboard demos"
                lead="Live portals"
                emphasis="you can click through."
                intro="Custom portals, workforce consoles, community hubs and operations dashboards. Each one is a working demo."
              />
              <ButtonLink to="/free-demo-portal" variant="secondary">Request your own demo</ButtonLink>
            </div>

            <div className="work-grid work-grid--2">
              {dashboardDemos.map((demo, index) => (
                <motion.a
                  key={demo.id}
                  href={demo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="work-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: (index % 2) * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="work-card__media">
                    <img src={demo.image} alt={`${demo.title} dashboard`} loading="lazy" decoding="async" />
                    <span className="work-card__live"><span aria-hidden="true" />Live demo</span>
                  </div>
                  <div className="work-card__body">
                    <p className="work-card__meta">{demo.subtitle} · {demo.industry}</p>
                    <h3 className="work-card__title">{demo.title}</h3>
                    <p className="work-card__text">{demo.description}</p>
                    <ul className="work-card__chips">
                      {demo.highlights.map((h) => <li key={h}>{h}</li>)}
                    </ul>
                    <span className="work-card__cta">Launch the demo <ExternalLink size={15} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span></span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Launches */}
        <section id="recent-launches" className="evo-block evo-block--ink" aria-labelledby="launches-heading">
          <div className="evo-container">
            <div className="work-section-head">
              <SectionHeading
                id="launches-heading"
                label="03 · Recent launches"
                lead="Websites for businesses,"
                emphasis="nonprofits and campaigns."
                intro="Custom websites, nonprofit portals, e-commerce and specialized digital work."
              />
              <ButtonLink to="/services/web-development" variant="secondary">Web development service</ButtonLink>
            </div>

            <div className="work-grid work-grid--3">
              {recentLaunches.map((item, index) => {
                const Tag = item.link ? motion.a : motion.div;
                const linkProps = item.link ? { href: item.link, target: '_blank', rel: 'noopener noreferrer' } : {};
                return (
                  <Tag
                    key={item.id}
                    {...linkProps}
                    className="work-card work-card--compact"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: (index % 3) * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="work-card__media">
                      <img src={item.image} alt={`${item.title} website`} loading="lazy" decoding="async" />
                    </div>
                    <div className="work-card__body">
                      <p className="work-card__meta">{item.category} · {item.industry}</p>
                      <h3 className="work-card__title">{item.title}</h3>
                      <p className="work-card__text">{item.description}</p>
                      {item.link && (
                        <span className="work-card__cta">Visit the site <ExternalLink size={15} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span></span>
                      )}
                    </div>
                  </Tag>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="evo-block evo-block--deep" aria-labelledby="testimonials-heading">
          <div className="evo-container">
            <SectionHeading id="testimonials-heading" label="04 · What clients say" lead="In their" emphasis="own words." />
            <div className="quote-grid">
              {testimonials.map((t, index) => (
                <motion.figure
                  key={t.name}
                  className="quote-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <blockquote>“{t.quote}”</blockquote>
                  <figcaption>
                    <span className="quote-card__mono" aria-hidden="true">{t.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
                    <span>
                      <strong>{t.name}</strong>
                      <span>{t.role}, {t.company}</span>
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        <CtaBand
          label="Start your project"
          lead="Your platform"
          emphasis="could be next."
          intro="Tell us what needs to work. We will map it with you and show you what it could look like, often with a live demo before you commit."
          secondary={{ to: '/free-demo-portal', label: 'Get a free demo portal', cta: 'work-band-demo' }}
        />
      </MotionConfig>
    </>
  );
};

export default OurWorkPage;
