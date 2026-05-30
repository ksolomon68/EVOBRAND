import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'EvoBrand — Premium Custom App Development & AI Integration',
    template: '%s | EvoBrand',
  },
  description:
    'EvoBrand delivers mission-critical custom software, AI integration, and enterprise branding for government contractors and Fortune 500 companies.',
  keywords: [
    'custom app development',
    'AI integration',
    'government software',
    'enterprise technology',
    'FedRAMP',
    'digital transformation',
  ],
  authors: [{ name: 'EvoBrand LLC' }],
  creator: 'EvoBrand LLC',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://evobrand.net',
    siteName: 'EvoBrand',
    title: 'EvoBrand — Premium Custom App Development & AI Integration',
    description:
      'Premium custom software, AI integration, and enterprise branding for government contractors and Fortune 500 companies.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EvoBrand',
    creator: '@evobrand',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-[#0a0a0f] text-white antialiased">
        {/* Skip to content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0066ff] focus:text-white focus:rounded-lg focus:font-medium"
        >
          Skip to main content
        </a>

        <Navbar />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
