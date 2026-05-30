import { createClient } from '@sanity/client';
import { Project, Testimonial } from '@/types';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'placeholder',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
});

export const MOCK_PROJECTS: Project[] = [
  {
    _id: '1',
    title: 'DoD Logistics Intelligence Platform',
    slug: { current: 'dod-logistics-intelligence-platform' },
    category: 'Government',
    description:
      'A fully integrated AI-powered logistics intelligence platform built for the Department of Defense, enabling real-time supply chain tracking, predictive maintenance scheduling, and automated procurement across 40+ military installations.',
    shortDescription: 'AI-powered logistics intelligence for DoD supply chain operations across 40+ installations.',
    techStack: ['Next.js', 'Python', 'PostgreSQL', 'TensorFlow', 'AWS GovCloud'],
    imageUrl: '/images/project-dod.jpg',
    featured: true,
    client: 'Department of Defense',
    duration: '18 months',
    results: [
      '42% reduction in supply chain delays',
      '$180M in procurement savings',
      'FedRAMP High authorized',
    ],
    publishedAt: '2023-09-15',
  },
  {
    _id: '2',
    title: 'Fortune 500 AI Content Engine',
    slug: { current: 'fortune-500-ai-content-engine' },
    category: 'AI Solutions',
    description:
      'A custom LLM-powered content creation and distribution platform for a Fortune 500 retail company, enabling personalized marketing content at scale across 12 languages and 30+ markets.',
    shortDescription: 'LLM-powered content engine generating personalized marketing at scale for global retail.',
    techStack: ['React', 'Node.js', 'OpenAI API', 'Redis', 'GCP'],
    imageUrl: '/images/project-ai-content.jpg',
    featured: true,
    client: 'Fortune 500 Retailer (NDA)',
    duration: '9 months',
    results: [
      '10x content output increase',
      '67% reduction in production costs',
      '28% improvement in engagement metrics',
    ],
    publishedAt: '2023-11-20',
  },
  {
    _id: '3',
    title: 'Federal Agency Digital Transformation',
    slug: { current: 'federal-agency-digital-transformation' },
    category: 'Government',
    description:
      'Complete digital transformation of a federal civilian agency, migrating legacy COBOL systems to cloud-native microservices architecture, with a modern React-based citizen portal serving 2M+ users.',
    shortDescription: 'Legacy modernization to cloud-native architecture serving 2M+ citizens.',
    techStack: ['React', 'Java Spring', 'Kubernetes', 'Oracle', 'Azure Government'],
    imageUrl: '/images/project-federal.jpg',
    featured: true,
    client: 'Federal Civilian Agency (NDA)',
    duration: '24 months',
    results: [
      '99.9% uptime SLA achieved',
      '73% faster citizen service delivery',
      'FISMA High compliance',
    ],
    publishedAt: '2024-01-10',
  },
  {
    _id: '4',
    title: 'Enterprise Brand Identity System',
    slug: { current: 'enterprise-brand-identity-system' },
    category: 'Branding',
    description:
      'Complete rebrand and design system for a $2B enterprise SaaS company, including logo suite, motion guidelines, component library, and brand voice framework deployed across 400+ employees.',
    shortDescription: 'Complete rebrand and design system for a $2B enterprise SaaS company.',
    techStack: ['Figma', 'After Effects', 'Storybook', 'React', 'CSS Modules'],
    imageUrl: '/images/project-brand.jpg',
    featured: false,
    client: 'Enterprise SaaS Company (NDA)',
    duration: '6 months',
    results: [
      '40% improvement in brand recognition',
      'Unified design system across 400+ employees',
      '3 industry design awards',
    ],
    publishedAt: '2024-02-28',
  },
  {
    _id: '5',
    title: 'Predictive Analytics Command Center',
    slug: { current: 'predictive-analytics-command-center' },
    category: 'Enterprise',
    description:
      'Real-time predictive analytics platform for a global energy company, integrating IoT sensor data from 500+ facilities with ML models for predictive maintenance and operational optimization.',
    shortDescription: 'Real-time predictive analytics from 500+ IoT-enabled facilities for global energy operations.',
    techStack: ['Next.js', 'Python', 'Apache Kafka', 'ClickHouse', 'Kubernetes'],
    imageUrl: '/images/project-analytics.jpg',
    featured: false,
    client: 'Global Energy Corporation (NDA)',
    duration: '14 months',
    results: [
      '$40M annual savings in prevented downtime',
      '89% accuracy in predictive maintenance',
      'ISO 27001 certified',
    ],
    publishedAt: '2024-03-15',
  },
  {
    _id: '6',
    title: 'Intelligent Contract Management',
    slug: { current: 'intelligent-contract-management' },
    category: 'AI Solutions',
    description:
      'AI-powered contract review and management system for a top-10 law firm, featuring NLP-based clause extraction, risk scoring, and automated compliance checking against regulatory frameworks.',
    shortDescription: 'NLP-powered contract review and risk scoring for a top-10 law firm.',
    techStack: ['React', 'Python', 'spaCy', 'PostgreSQL', 'Docker'],
    imageUrl: '/images/project-contracts.jpg',
    featured: false,
    client: 'Top-10 Law Firm (NDA)',
    duration: '8 months',
    results: [
      '85% reduction in review time',
      '99.2% clause extraction accuracy',
      '$12M in recovered contract value',
    ],
    publishedAt: '2024-04-01',
  },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    _id: 't1',
    name: 'Col. James Hartfield',
    title: 'Director of Digital Transformation',
    company: 'U.S. Army Corps of Engineers',
    content:
      'EvoBrand delivered what three previous contractors could not. Their AI integration capabilities and understanding of government compliance requirements set them apart entirely. We have achieved FISMA High authorization and our operational efficiency is up 60%.',
    rating: 5,
  },
  {
    _id: 't2',
    name: 'Sarah Chen',
    title: 'Chief Technology Officer',
    company: 'Fortune 100 Financial Services',
    content:
      'The AI content engine EvoBrand built has fundamentally changed how we operate. We are producing 10x the content with 70% less cost, and the quality is consistently superior. Their team understood our regulatory constraints and delivered a solution that exceeded every benchmark.',
    rating: 5,
  },
  {
    _id: 't3',
    name: 'Marcus Williams',
    title: 'VP of Engineering',
    company: 'Global Aerospace Defense',
    content:
      'Working with EvoBrand on our digital transformation was exceptional. They navigated complex security requirements, legacy system constraints, and aggressive timelines with remarkable professionalism. The result is a platform that will serve us for the next decade.',
    rating: 5,
  },
  {
    _id: 't4',
    name: 'Dr. Patricia Okafor',
    title: 'Executive Director',
    company: 'Federal Health Agency',
    content:
      'EvoBrand brought enterprise-grade AI capabilities to a government context with full compliance—something we were told was not possible on our timeline. They proved the skeptics wrong and delivered a solution that is now being replicated across three other agencies.',
    rating: 5,
  },
];
