
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ChatWidget from '@/components/ChatWidget.jsx';
import HomePage from '@/pages/HomePage.jsx';
const ServicesPage = lazy(() => import('@/pages/ServicesPage.jsx'));
const HowItWorksPage = lazy(() => import('@/pages/HowItWorksPage.jsx'));
const OurWorkPage = lazy(() => import('@/pages/OurWorkPage.jsx'));
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage.jsx'));
const AboutPage = lazy(() => import('@/pages/AboutPage.jsx'));
const ContactPage = lazy(() => import('@/pages/ContactPage.jsx'));
const ClientPortalPage = lazy(() => import('@/pages/ClientPortalPage.jsx'));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage.jsx'));
const AuditorsPage = lazy(() => import('@/pages/AuditorsPage.jsx'));
const AuditorPage = lazy(() => import('@/pages/AuditorPage.jsx'));
const AuditorResultsPage = lazy(() => import('@/pages/AuditorResultsPage.jsx'));
const AccessibilityCheckerPage = lazy(() => import('@/pages/AccessibilityCheckerPage.jsx'));
const AccessibilityCheckerResultsPage = lazy(() => import('@/pages/AccessibilityCheckerResultsPage.jsx'));
const ClientPortalLoginPage = lazy(() => import('@/pages/ClientPortalLoginPage.jsx'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage.jsx'));
const MaintenancePlansPage = lazy(() => import('@/pages/MaintenancePlansPage.jsx'));
const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccessPage.jsx'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage.jsx'));
const AccessibilityStatementPage = lazy(() => import('@/pages/AccessibilityStatementPage.jsx'));
const BookConsultationPage = lazy(() => import('@/pages/BookConsultationPage.jsx'));
const FreeDemoPortalPage = lazy(() => import('@/pages/FreeDemoPortalPage.jsx'));
const StyleGuidePage = lazy(() => import('@/pages/StyleGuidePage.jsx'));
const VideoLibrarySection = lazy(() => import('@/components/VideoLibrarySection.jsx'));
import SEO from '@/components/SEO.jsx';
import { trackPageView } from '@/lib/analytics.js';

function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);
  return null;
}

function SiteLayout() {
  const { pathname } = useLocation();
  const isPortal = pathname === '/client-portal';
  return (
    <>
      <ScrollToTop />
      <AnalyticsTracker />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#22c8e5] focus:text-[#003258] focus:font-bold focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="flex flex-col min-h-screen">
        {!isPortal && <Header />}
        <main className="flex-1" id="main-content">
          <Suspense fallback={<div className="min-h-[100svh]" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/our-work" element={<OurWorkPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/videos" element={<><SEO title="Video library" description="Explore EVOBRAND videos on branding, automation, AI, and business growth." canonical="https://evobrand.net/videos" /><VideoLibrarySection standalone /></>} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/client-portal" element={<ClientPortalPage />} />
            <Route path="/login" element={<ClientPortalLoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/auditors" element={<AuditorsPage />} />
            <Route path="/auditor" element={<AuditorPage />} />
            <Route path="/auditor/results/:id" element={<AuditorResultsPage />} />
            <Route path="/accessibility-checker" element={<AccessibilityCheckerPage />} />
            <Route path="/accessibility-checker/results/:id" element={<AccessibilityCheckerResultsPage />} />
            <Route path="/maintenance-plans" element={<MaintenancePlansPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/accessibility-statement" element={<AccessibilityStatementPage />} />
            <Route path="/book-consultation" element={<BookConsultationPage />} />
            <Route path="/free-demo-portal" element={<FreeDemoPortalPage />} />
            <Route path="/style-guide" element={<StyleGuidePage />} />
            <Route path="/book" element={<Navigate to="/book-consultation" replace />} />
            <Route path="/contract-builder" element={<Navigate to="/client-portal" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
        </main>
        {!isPortal && <Footer />}
        <ChatWidget />
      </div>
    </>
  );
}

export default function App() {
  return <BrowserRouter><SiteLayout /></BrowserRouter>;
}
