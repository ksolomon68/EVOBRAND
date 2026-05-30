import type { Metadata } from 'next';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import AnimatedSection from '@/components/ui/AnimatedSection';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Explore EvoBrand case studies across government, enterprise, AI solutions, and branding.',
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
            Our Work
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Proof in Production
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Every engagement represents a real organizational challenge solved with precision engineering,
            creative strategy, and technology that lasts.
          </p>
        </AnimatedSection>

        <PortfolioGrid />
      </div>
    </div>
  );
}
