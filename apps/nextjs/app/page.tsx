import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import AICapabilities from '@/components/home/AICapabilities';
import PortfolioPreview from '@/components/home/PortfolioPreview';
import Process from '@/components/home/Process';
import Testimonials from '@/components/home/Testimonials';
import CTABanner from '@/components/home/CTABanner';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <AICapabilities />
      <PortfolioPreview />
      <Process />
      <Testimonials />
      <CTABanner />
    </>
  );
}
