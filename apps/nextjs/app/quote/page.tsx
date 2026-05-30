import type { Metadata } from 'next';
import QuoteForm from '@/components/quote/QuoteForm';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Clock, CheckCircle, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Request a Quote',
  description:
    'Tell us about your project and receive a preliminary proposal within 24 hours.',
};

export default function QuotePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
            Get a Quote
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Tell Us About Your Project
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Complete this form and receive a preliminary proposal within 24 hours.
            No commitment required.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Process */}
          <div className="space-y-5">
            <h2 className="text-white font-semibold">What Happens Next</h2>
            {[
              {
                icon: CheckCircle,
                title: 'We review your requirements',
                desc: 'Our team reads every submission carefully and matches it to the right practice lead.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10 border-blue-500/20',
              },
              {
                icon: Clock,
                title: '24-hour response',
                desc: 'You hear from a senior strategist within one business day — not an auto-reply.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10 border-purple-500/20',
              },
              {
                icon: Lock,
                title: 'NDA first, then details',
                desc: 'If your project is sensitive, we sign an NDA before discussing any specifics.',
                color: 'text-green-400',
                bg: 'bg-green-500/10 border-green-500/20',
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${bg} border flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={color} />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{title}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}

            <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <p className="text-xs text-blue-400 font-medium mb-1">Minimum Engagement</p>
              <p className="text-gray-400 text-xs">
                We typically engage on projects starting at $50K. Below this threshold, we can refer you to trusted partners.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-8">
            <QuoteForm />
          </div>
        </div>
      </div>
    </div>
  );
}
