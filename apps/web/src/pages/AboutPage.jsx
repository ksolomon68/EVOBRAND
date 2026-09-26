import React, { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight, Award, Lightbulb, Route, Target, Users } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import FrameScrub from '@/components/cinematic/FrameScrub.jsx';
import { CtaBand, InnerHero, LinkCards, SplitSection, useStaggerReveal } from '@/components/inner/InnerKit.jsx';
import { ProofLedger, SectionHeading } from '@/components/system/Section.jsx';
import { useMotion } from '@/lib/motion.js';

const CORE_VALUES = [
  { icon: Target, title: 'Plain answers', body: 'Clear scope, honest timelines, and written decisions. You always know where the project stands.' },
  { icon: Users, title: 'Senior-led', body: 'The person who scopes the work stays on it through launch and after.' },
  { icon: Lightbulb, title: 'Built to be run', body: 'We design systems your staff can operate after we hand them over, not just launch.' },
  { icon: Award, title: 'Accountable', body: 'Every project starts with agreed outcomes, and we report against them.' },
];

// Certified by the North Central Texas Regional Certification Agency.
// Leave `agency` empty to hide that line on the page.
const CERTIFICATIONS = [
  { code: 'SBE', title: 'Small Business Enterprise', agency: 'NCTRCA' },
  { code: 'WBE', title: "Women's Business Enterprise", agency: 'NCTRCA' },
  { code: 'MBE', title: 'Minority Business Enterprise', agency: 'NCTRCA' },
];

const HISTORY = [
  { meta: '1999', title: 'Code was the foundation', body: 'With credentials in Computer Science and Computer Information Systems, Keisha began coding when websites were still built largely by hand in HTML. She founded EVOBRAND Marketing in 1999 to bring that technical foundation to brand and digital work.' },
  { meta: '2003', title: 'Early WordPress contributor', body: 'Keisha was one of the first contributors to WordPress, helping shape the open-source platform during its earliest years.' },
  { meta: '2010', title: 'EVOBRAND Concepts', body: 'After years of building across the Dallas–Fort Worth area, the business became EVOBRAND Concepts LLC in 2010 and expanded its work across strategy, design, and development.' },
  {
    meta: 'Today',
    title: 'Animation, systems, and AI',
    body: 'Keisha’s longtime passion for animation now shapes how she brings digital ideas to life. Today, she enjoys implementing AI throughout her workflows while continuing to lead EVOBRAND’s strategy, design, development, and platform work.',
    link: 'https://evobrandacademy.com',
    linkLabel: 'Explore the AI literacy course',
  },
];

function Values() {
  const ref = React.useRef(null);
  useStaggerReveal(ref);
  return (
    <ul ref={ref} className="value-grid">
      {CORE_VALUES.map(({ icon: Icon, title, body }) => (
        <li key={title} data-reveal-item>
          <span className="mega-link__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.6} /></span>
          <h3>{title}</h3>
          <p>{body}</p>
        </li>
      ))}
    </ul>
  );
}

function StoryExperience() {
  const motion = useMotion();
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!motion || !root) return undefined;

    const { gsap } = motion;
    const chapters = gsap.utils.toArray('[data-story-step]', root);
    const progress = root.querySelector('[data-story-progress]');
    const currentYear = root.querySelector('[data-story-year]');
    const currentChapter = root.querySelector('[data-story-chapter]');
    let activeIndex = -1;

    const setActive = (index) => {
      if (index === activeIndex) return;
      activeIndex = index;
      chapters.forEach((chapter, chapterIndex) => chapter.classList.toggle('is-active', chapterIndex === index));
      if (currentYear) currentYear.textContent = HISTORY[index]?.meta || '';
      if (currentChapter) currentChapter.textContent = `Chapter ${String(index + 1).padStart(2, '0')}`;
    };

    setActive(0);

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const progressTween = gsap.fromTo(progress,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top 62%',
            end: 'bottom 38%',
            scrub: 0.65,
            onUpdate: (self) => setActive(Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length))),
          },
        });

      const chapterTimelines = chapters.map((chapter) => {
        const year = chapter.querySelector('.story-experience__year');
        const copy = chapter.querySelector('.story-experience__copy');
        const glow = chapter.querySelector('.story-experience__glow');
        const node = chapter.querySelector('.story-experience__node');

        return gsap.timeline({
          scrollTrigger: {
            trigger: chapter,
            start: 'top 80%',
            end: 'bottom 30%',
            scrub: 0.7,
          },
        })
          .fromTo(chapter,
            { autoAlpha: 0.3, x: 52, scale: 0.965 },
            { autoAlpha: 1, x: 0, scale: 1, duration: 0.43, ease: 'none' })
          .fromTo(year,
            { y: 44, rotation: -3 },
            { y: 0, rotation: 0, duration: 0.43, ease: 'none' }, 0)
          .fromTo(copy,
            { y: 32 },
            { y: 0, duration: 0.43, ease: 'none' }, 0)
          .fromTo(glow,
            { autoAlpha: 0, scale: 0.82 },
            { autoAlpha: 1, scale: 1, duration: 0.43, ease: 'none' }, 0)
          .fromTo(node,
            { scale: 0.65 },
            { scale: 1, duration: 0.43, ease: 'none' }, 0)
          .to(chapter, { autoAlpha: 0.48, x: -16, scale: 0.98, duration: 0.57, ease: 'none' })
          .to(glow, { autoAlpha: 0.08, scale: 1.1, duration: 0.57, ease: 'none' }, '<');
      });

      return () => {
        progressTween.scrollTrigger?.kill();
        progressTween.revert();
        chapterTimelines.forEach((timeline) => {
          timeline.scrollTrigger?.kill();
          timeline.revert();
        });
      };
    }, root);

    return () => {
      media.revert();
      chapters.forEach((chapter) => chapter.classList.remove('is-active'));
    };
  }, [motion]);

  return (
    <section ref={rootRef} id="story" className="evo-block evo-block--ink story-experience" aria-labelledby="story-heading">
      <div className="story-experience__grid" aria-hidden="true" />
      <div className="evo-container story-experience__layout">
        <div className="story-experience__intro">
          <SectionHeading
            id="story-heading"
            label="Our story"
            lead="Twenty-five years in,"
            emphasis="still led by the founder."
            intro="The work has changed shape many times. Who leads it has not."
          />

          <div className="story-experience__status" aria-hidden="true">
            <p data-story-chapter>Chapter 01</p>
            <div>
              <strong data-story-year>1999</strong>
              <span>/ {String(HISTORY.length).padStart(2, '0')}</span>
            </div>
            <small>One founder. One continuous line.</small>
          </div>
        </div>

        <div className="story-experience__timeline">
          <div className="story-experience__rail" aria-hidden="true"><span data-story-progress /></div>
          <ol>
            {HISTORY.map((chapter, index) => (
              <li key={chapter.meta} className="story-experience__chapter" data-story-step>
                <span className="story-experience__node" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className="story-experience__glow" aria-hidden="true" />
                <span className="story-experience__kicker">Chapter {String(index + 1).padStart(2, '0')}</span>
                <span className="story-experience__year" aria-hidden="true">{chapter.meta}</span>
                <div className="story-experience__copy">
                  <p>{chapter.meta}</p>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.body}</p>
                  {chapter.link && (
                    <a className="story-experience__link" href={chapter.link} target="_blank" rel="noopener noreferrer">
                      {chapter.linkLabel} <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About EVOBRAND Concepts"
        description="EVOBRAND Concepts is a full-stack digital agency led by Keisha Solomon, with 25+ years of work for government agencies, corporations, and nonprofits. SBE, WBE, and MBE certified. Based in the Dallas–Fort Worth area."
        keywords="about EVOBRAND Concepts, Keisha Solomon, digital agency Texas, SBE WBE MBE certified agency, government web development"
        canonical="https://evobrand.net/about"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'EVOBRAND Concepts LLC',
          url: 'https://evobrand.net',
          logo: 'https://evobrand.net/logo.png',
          foundingDate: '1999',
          description: 'Full-stack digital agency serving government agencies, corporations, and nonprofits.',
          email: 'info@evobrand.net',
          telephone: '+1-214-531-4427',
          address: { '@type': 'PostalAddress', addressRegion: 'TX', addressCountry: 'US' },
          founder: { '@type': 'Person', name: 'Keisha Solomon' },
          sameAs: ['https://www.linkedin.com/company/evobrand-concepts/'],
        }}
      />

      <InnerHero
        crumbs={[{ label: 'About' }]}
        label="Since 1999 · Dallas–Fort Worth"
        lead="Full-stack digital agency."
        emphasis="Senior-led for 25+ years."
        intro="EVOBRAND Concepts plans, designs, and builds websites, platforms, and brand systems for government agencies, corporations, and nonprofits."
        actions={[
          { to: '/book-consultation', label: 'Book a strategy call', cta: 'about-hero-call' },
          { to: '/our-work', label: 'See the work', cta: 'about-hero-work' },
        ]}
        facts={[
          { label: 'Established', value: '1999' },
          { label: 'Based in', value: 'Dallas–Fort Worth, Texas' },
          { label: 'Certified', value: 'SBE · WBE · MBE' },
          { label: 'Clients', value: 'Public, private and nonprofit' },
        ]}
        jumps={[
          { href: '#story', label: 'Our story' },
          { href: '#values', label: 'How we work' },
          { href: '#leadership', label: 'Leadership' },
          { href: '#certifications', label: 'Certifications' },
        ]}
      />

      <StoryExperience />

      <section id="values" className="evo-block evo-block--slate" aria-labelledby="values-heading">
        <div className="evo-container">
          <SectionHeading
            id="values-heading"
            label="How we work"
            lead="Four promises"
            emphasis="we keep on every project."
          />
          <div className="mt-space-xl"><Values /></div>
        </div>
      </section>

      <FrameScrub
        id="leadership"
        labelledBy="leadership-heading"
        src="/brand/leadership"
        frames={76}
        focus={0.66}
        alt="Keisha Solomon, founder of EVOBRAND Concepts, in the studio."
      >
        <SectionHeading id="leadership-heading" label="Leadership" lead="Keisha Solomon," emphasis="Founder." />
        <div className="inner-prose">
          <p className="inner-quote">Keisha has led the business since 1999 and leads every EVOBRAND engagement directly.</p>
          <p>
            Keisha founded the company as EVOBRAND Marketing and has spent more than 25 years building brands,
            websites, and digital platforms for government agencies, corporations, and nonprofits. Under her
            leadership, EVOBRAND built ChamberCore, which runs chambers of commerce, and PrimeReach, which connects
            government prime contractors with qualified small businesses.
          </p>
        </div>
      </FrameScrub>

      <section id="certifications" className="evo-block evo-block--navy" aria-labelledby="cert-heading">
        <div className="evo-container">
          <SectionHeading
            id="cert-heading"
            label="Certifications"
            lead="Certified to work"
            emphasis="where the work is."
            intro="EVOBRAND Concepts holds small, women-owned, and minority-owned business certifications."
          />
          <div className="mt-space-xl">
            <ProofLedger
              items={CERTIFICATIONS.map((c) => ({ value: c.code, label: c.agency ? `${c.title} · ${c.agency}` : c.title }))}
            />
          </div>
        </div>
      </section>

      <SplitSection
        id="next"
        label="Keep exploring"
        lead="See how we work,"
        emphasis="then see the results."
      >
        <LinkCards
          columns={2}
          items={[
            { to: '/how-it-works', icon: Route, meta: 'Process', title: 'How we work', body: 'Discovery to launch and beyond, with clear milestones and shared visibility.', cta: 'See the process' },
            { to: '/our-work', icon: Award, meta: 'Portfolio', title: 'Our work', body: 'Platforms for contracting, membership, workforce development and civic participation.', cta: 'See the work' },
          ]}
        />
      </SplitSection>

      <CtaBand
        label="Start a project"
        lead="Tell us what you are"
        emphasis="working on."
        intro="We will set up a call, map the problem with you, and give you a clear scope and timeline."
      />
    </>
  );
}
