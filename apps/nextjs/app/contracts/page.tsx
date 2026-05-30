import type { Metadata } from 'next';
import ContractBuilder from '@/components/contracts/ContractBuilder';
import AnimatedSection from '@/components/ui/AnimatedSection';

export const metadata: Metadata = {
  title: 'Contract Builder',
  description:
    'Build and sign a custom service agreement with EvoBrand. Select clauses, set terms, and e-sign securely.',
};

export default function ContractsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
            Contract Builder
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Build Your Service Agreement
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Customize a service contract to your exact requirements. Select the clauses you need,
            enter project details, and e-sign — all in one place.
          </p>
          <p className="text-xs text-gray-600 mt-3">
            All contracts are reviewed by our legal team before becoming binding.
          </p>
        </AnimatedSection>

        <ContractBuilder />
      </div>
    </div>
  );
}
