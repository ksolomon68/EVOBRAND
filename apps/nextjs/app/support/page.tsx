import type { Metadata } from 'next';
import PricingCards from '@/components/support/PricingCards';
import SupportForm from '@/components/support/SupportForm';
import AnimatedSection from '@/components/ui/AnimatedSection';

export const metadata: Metadata = {
  title: 'Support Plans & Pricing',
  description:
    'Enterprise support plans for EvoBrand clients. From Starter to Enterprise white-glove support.',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Pricing */}
        <section aria-labelledby="pricing-heading">
          <AnimatedSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
              Support Plans
            </div>
            <h1 id="pricing-heading" className="text-4xl sm:text-5xl font-bold text-white mb-4">
              World-Class Support, Scaled to You
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Every EvoBrand project includes a support tier. Choose the level that matches your
              operational tempo and mission criticality.
            </p>
          </AnimatedSection>
          <PricingCards />
        </section>

        {/* Support ticket */}
        <section aria-labelledby="ticket-heading">
          <AnimatedSection className="text-center mb-10">
            <h2 id="ticket-heading" className="text-3xl font-bold text-white mb-3">
              Submit a Support Ticket
            </h2>
            <p className="text-gray-400">
              Existing clients: submit your request below and we&apos;ll respond within your SLA window.
            </p>
          </AnimatedSection>
          <div className="max-w-2xl mx-auto rounded-2xl bg-white/5 border border-white/10 p-8">
            <SupportForm />
          </div>
        </section>
      </div>
    </div>
  );
}
