import type { Metadata } from 'next';
import BookingForm from '@/components/booking/BookingForm';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Shield, Clock, Users, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Book a Strategy Call',
  description:
    'Schedule a discovery call, technical consultation, or full strategy session with the EvoBrand team.',
};

const trustPoints = [
  { icon: Shield, text: 'NDA available before any conversation' },
  { icon: Clock, text: 'Same-week availability for urgent initiatives' },
  { icon: Users, text: 'Direct access to senior architects & strategists' },
  { icon: Star, text: '98% client satisfaction across 50+ engagements' },
];

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
            Book a Call
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Let&apos;s Talk About Your Mission
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Whether you have a defined project or are still exploring possibilities, our team
            is ready to help you navigate your options with expertise and candor.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Trust signals */}
          <div className="space-y-4">
            <h2 className="text-white font-semibold text-lg mb-6">Why EvoBrand</h2>
            {trustPoints.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-blue-400" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
              </div>
            ))}

            <div className="mt-8 p-5 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Clearances Held</p>
              <div className="flex flex-wrap gap-2">
                {['TS/SCI', 'Secret', 'Public Trust', 'FedRAMP'].map((badge) => (
                  <span
                    key={badge}
                    className="px-2.5 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Booking form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
              <BookingForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
