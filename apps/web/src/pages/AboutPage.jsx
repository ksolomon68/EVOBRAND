import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, Users, Award } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import {
  PageHero,
  Reveal,
  TiltCard,
  ScrollDrawnLine,
  EraWatermark,
} from '@/components/motion/PageMotion.jsx';

const AboutPage = () => {
  const coreValues = [
    {
      icon: <Target size={40} />,
      title: 'Plain answers',
      description: 'Clear scope, honest timelines, and written decisions. You always know where the project stands.'
    },
    {
      icon: <Users size={40} />,
      title: 'Senior-led',
      description: 'The person who scopes the work stays on it through launch and after.'
    },
    {
      icon: <Lightbulb size={40} />,
      title: 'Built to be run',
      description: 'We design systems your staff can operate after we hand them over, not just launch.'
    },
    {
      icon: <Award size={40} />,
      title: 'Accountable',
      description: 'Every project starts with agreed outcomes, and we report against them.'
    }
  ];

  // TODO(content): add the certifying agency, certificate number and expiration
  // for each certification. Leave `agency` empty to hide that line on the page.
  const certifications = [
    { code: 'SBE', title: 'Small Business Enterprise', agency: '' },
    { code: 'WBE', title: "Women's Business Enterprise", agency: '' },
    { code: 'MBE', title: 'Minority Business Enterprise', agency: '' }
  ];

  const history = [
    {
      num: '01',
      era: '1999: The foundation',
      // TODO(content): the original business name, if you want it mentioned.
      body: 'The business started in 1999 as a creative agency doing brand and digital work.',
    },
    {
      num: '02',
      era: '2010: EVOBRAND Concepts',
      body: 'In 2010 the business moved to Italy, Texas, in the DFW area, and became EVOBRAND Concepts LLC.',
    },
    {
      num: '03',
      era: 'Today: Full-stack delivery',
      body: 'A full-stack digital agency for government agencies, corporations, and nonprofits. Strategy, design, development, and the platforms that keep programs running, including ChamberCore and PrimeReach.',
    },
  ];

  return (
    <>
      <SEO
        title="About EVOBRAND Concepts"
        description="EVOBRAND Concepts is a full-stack digital agency led by Keisha Solomon, with 25+ years of work for government agencies, corporations, and nonprofits. SBE, WBE, and MBE certified. Based in Italy, Texas."
        keywords="about EVOBRAND Concepts, Keisha Solomon, digital agency Texas, SBE WBE MBE certified agency, government web development"
        canonical="https://evobrand.net/about"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "EVOBRAND Concepts LLC",
          "url": "https://evobrand.net",
          "logo": "https://evobrand.net/logo.png",
          "foundingDate": "1999",
          "description": "Full-stack digital agency serving government agencies, corporations, and nonprofits.",
          "email": "info@evobrand.net",
          "telephone": "+1-214-531-4427",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Italy",
            "addressRegion": "TX",
            "addressCountry": "US"
          },
          "founder": {
            "@type": "Person",
            "name": "Keisha Solomon"
          },
          "sameAs": ["https://www.linkedin.com/company/evobrand-concepts/"]
        }}
      />

      <div className="min-h-screen bg-[#0f1419]">
        {/* Hero */}
        <PageHero
          variant="about"
          eyebrow="Since 1999 · Italy, Texas"
          lines={[
            [{ t: 'Full-stack' }, { t: 'digital' }, { t: 'agency.' }],
            [
              { t: 'Senior-led', accent: true },
              { t: 'for', accent: true },
              { t: '25+', accent: true },
              { t: 'years.', accent: true },
            ],
          ]}
          sub="EVOBRAND Concepts plans, designs, and builds websites, platforms, and brand systems for government agencies, corporations, and nonprofits."
        />

        {/* Company story: scroll-drawn timeline */}
        <section className="py-20 bg-[#0f1419]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Reveal>
                <h2 className="text-3xl font-bold text-white mb-14 text-center">
                  Our <span className="text-[#22c8e5]">Evolution</span>
                </h2>
              </Reveal>

              <div className="relative pl-12 md:pl-16">
                <EraWatermark labels={['1999', '2010', 'TODAY']} />
                <ScrollDrawnLine className="left-[5px] md:left-[7px] top-2 bottom-2" />

                {history.map((beat) => (
                  <Reveal key={beat.num} delay={0.05} className="relative mb-12 last:mb-0">
                    {/* Node on the spine */}
                    <span
                      aria-hidden="true"
                      className="absolute -left-12 md:-left-16 top-1.5 flex h-3 w-3 translate-x-[0px] items-center justify-center"
                    >
                      <span className="h-3 w-3 rounded-full border border-white/40 bg-[#0f1419]" />
                    </span>
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50 mb-2">
                      {beat.num} · {beat.era}
                    </p>
                    <p className="text-gray-300 leading-relaxed">{beat.body}</p>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.1}>
                <p className="mt-14 rounded-2xl border border-[#22c8e5]/20 bg-[#1a2332] p-8 text-center font-semibold text-white">
                  Twenty-five years in, the work is still led by the person who started it.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-[#1a2332]">
          <div className="container mx-auto px-4">
            <Reveal>
              <h2 className="text-3xl font-bold text-white mb-12 text-center">How we work</h2>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {coreValues.map((value, index) => (
                <Reveal key={index} delay={index * 0.08}>
                  <TiltCard className="h-full rounded-xl border border-white/5 bg-[#0f1419] p-6 text-center transition-colors hover:border-[#22c8e5]/30">
                    <div className="text-[#22c8e5] mb-4 flex justify-center">{value.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                    <p className="text-gray-400 text-sm">{value.description}</p>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>



        {/* Leadership */}
        <section className="py-20 bg-[#0f1419]">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <Reveal>
              <h2 className="text-3xl font-bold text-white mb-6">Leadership</h2>
              {/* TODO(content): headshot and a short bio for Keisha Solomon. */}
              <p className="text-xl font-bold text-white">Keisha Solomon</p>
              <p className="text-[#22c8e5] font-semibold mb-4">Founder</p>
              <p className="text-gray-300 leading-relaxed">
                Keisha has led the business since 1999 and leads every EVOBRAND engagement directly.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-20 bg-[#1a2332]">
          <div className="container mx-auto px-4">
            <Reveal>
              <h2 className="text-3xl font-bold text-white mb-12 text-center">Certifications</h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {certifications.map((cert, index) => (
                <Reveal key={cert.code} delay={index * 0.08}>
                  <div className="h-full rounded-xl border border-white/5 bg-[#0f1419] p-6 text-center">
                    <p className="text-3xl font-bold text-[#22c8e5] mb-2">{cert.code}</p>
                    <h3 className="text-white font-bold">{cert.title}</h3>
                    {cert.agency && <p className="text-gray-400 text-sm mt-1">{cert.agency}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 relative overflow-hidden bg-[#1a2332]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(34,200,229,0.12)_0%,transparent_70%)] pointer-events-none"></div>
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-4xl font-bold text-white mb-6">Start a project</h2>
            <p className="text-xl text-white/90 mb-8">Tell us what you are working on and we will set up a call.</p>
            <a
              href="/contact"
              className="inline-block px-8 py-4 bg-[#22c8e5] text-[#003258] rounded-2xl font-bold hover:shadow-lg hover:bg-opacity-90 transition-all"
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
