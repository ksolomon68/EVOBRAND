import {
  BadgeCheck,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  Compass,
  Gauge,
  LayoutDashboard,
  Newspaper,
  PlayCircle,
  Rocket,
  Route,
  ScanSearch,
  ShieldCheck,
  UserRound,
  Wrench,
  Accessibility,
  MonitorSmartphone,
} from 'lucide-react';
import { SERVICES } from '@/data/services.js';

// Primary navigation. Each group opens a panel: a feature card on the left,
// a grid of links on the right, and the client portal bar underneath.
// `match` lists path prefixes that mark the group active.

export const NAV_GROUPS = [
  {
    id: 'about',
    label: 'About',
    to: '/about',
    match: ['/about', '/how-it-works'],
    title: 'About the studio',
    feature: {
      eyebrow: 'Since 1999 · Italy, Texas',
      lead: 'Senior-led',
      emphasis: 'for 25+ years.',
      cta: { to: '/about', label: 'Read our story' },
    },
    items: [
      { to: '/about', icon: Compass, title: 'Our story', body: 'From a 1999 creative agency to full-stack delivery' },
      { to: '/how-it-works', icon: Route, title: 'How we work', body: 'Discovery to launch, with you in the room' },
      { to: '/about#leadership', icon: UserRound, title: 'Leadership', body: 'The person who scopes the work stays on it' },
      { to: '/about#certifications', icon: BadgeCheck, title: 'Certifications', body: 'SBE, WBE and MBE certified' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    to: '/services',
    match: ['/services', '/maintenance-plans'],
    title: 'Services',
    feature: {
      eyebrow: 'Strategy · Design · Technology',
      lead: 'Start with the problem.',
      emphasis: 'Build the right system.',
      cta: { to: '/book-consultation', label: 'Book a strategy call' },
    },
    items: [
      ...SERVICES.map((s) => ({ to: `/services/${s.slug}`, icon: s.icon, title: s.title, body: s.menuBlurb })),
      { to: '/maintenance-plans', icon: Wrench, title: 'Maintenance plans', body: 'Updates, security and support every month' },
      { to: '/free-demo-portal', icon: MonitorSmartphone, title: 'Free demo portal', body: 'See your own portal before you commit' },
    ],
  },
  {
    id: 'work',
    label: 'Work',
    to: '/our-work',
    match: ['/our-work'],
    title: 'Our work',
    feature: {
      eyebrow: 'Inside the work',
      lead: 'Platforms that',
      emphasis: 'carry real programs.',
      cta: { to: '/our-work', label: 'See all work' },
    },
    items: [
      { to: '/our-work#academy', icon: GraduationCap, title: 'EVOBRAND Academy', body: 'The AI Executive Sandbox cohort' },
      { to: '/our-work#flagship', icon: Rocket, title: 'Flagship platforms', body: 'ChamberCore, PrimeReach and more' },
      { to: '/our-work#dashboard-demos', icon: LayoutDashboard, title: 'Dashboard demos', body: 'Live portals you can click through' },
      { to: '/our-work#recent-launches', icon: Newspaper, title: 'Recent launches', body: 'Websites for businesses and nonprofits' },
      { to: '/our-work/videos', icon: PlayCircle, title: 'Video library', body: 'Walkthroughs, tutorials and client stories' },
      { to: '/free-demo-portal', icon: MonitorSmartphone, title: 'Request a demo portal', body: 'A working preview built for you, free' },
    ],
  },
  {
    id: 'tools',
    label: 'Free tools',
    to: '/auditors',
    match: ['/auditors', '/auditor', '/accessibility-checker'],
    title: 'Free tools',
    feature: {
      eyebrow: 'Free · Instant · No sign-up',
      lead: 'Check your site',
      emphasis: 'in a few minutes.',
      cta: { to: '/auditor', label: 'Start the brand audit' },
    },
    items: [
      { to: '/auditor', icon: Gauge, title: 'Brand auditor', body: 'Scores, benchmarks and a 90-day plan' },
      { to: '/accessibility-checker', icon: Accessibility, title: 'Accessibility checker', body: 'Find WCAG barriers on any page' },
      { to: '/free-demo-portal', icon: ScanSearch, title: 'Free demo portal', body: 'Your logo, your workflow, a live preview' },
      { to: '/book-consultation', icon: CalendarCheck, title: 'Strategy call', body: 'Thirty minutes, no obligation' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    to: '/resources',
    match: ['/resources', '/blog', '/accessibility-statement'],
    title: 'Resources',
    feature: {
      eyebrow: 'Guides · Research · Insight',
      lead: 'Practical reading',
      emphasis: 'for busy teams.',
      cta: { to: '/resources', label: 'Browse resources' },
    },
    items: [
      { to: '/resources', icon: BookOpen, title: 'Articles & guides', body: 'AI, automation and digital strategy' },
      { to: '/accessibility-statement', icon: ShieldCheck, title: 'Accessibility statement', body: 'How this site meets WCAG' },
    ],
  },
];

export const PORTAL_LINK = { to: '/client-portal', label: 'Open the client portal', note: 'Client & partner access' };
