
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import AccessibilityWidget from '@/components/AccessibilityWidget.jsx';
import HomePage from '@/pages/HomePage.jsx';
import ServicesPage from '@/pages/ServicesPage.jsx';
import HowItWorksPage from '@/pages/HowItWorksPage.jsx';
import OurWorkPage from '@/pages/OurWorkPage.jsx';
import ResourcesPage from '@/pages/ResourcesPage.jsx';
import AboutPage from '@/pages/AboutPage.jsx';
import ContactPage from '@/pages/ContactPage.jsx';
import ClientPortalPage from '@/pages/ClientPortalPage.jsx';
import BlogPostPage from '@/pages/BlogPostPage.jsx';
import AuditorPage from '@/pages/AuditorPage.jsx';
import AuditorResultsPage from '@/pages/AuditorResultsPage.jsx';
import ClientPortalLoginPage from '@/pages/ClientPortalLoginPage.jsx';
import ResetPasswordPage from '@/pages/ResetPasswordPage.jsx';
import MaintenancePlansPage from '@/pages/MaintenancePlansPage.jsx';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage.jsx';
import NotFoundPage from '@/pages/NotFoundPage.jsx';
import AccessibilityStatementPage from '@/pages/AccessibilityStatementPage.jsx';
import BookConsultationPage from '@/pages/BookConsultationPage.jsx';
import FreeDemoPortalPage from '@/pages/FreeDemoPortalPage.jsx';
import { trackPageView } from '@/lib/analytics.js';

function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnalyticsTracker />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#22c8e5] focus:text-[#003258] focus:font-bold focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1" id="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/our-work" element={<OurWorkPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/client-portal" element={<ClientPortalPage />} />
            <Route path="/login" element={<ClientPortalLoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/auditor" element={<AuditorPage />} />
            <Route path="/auditor/results/:id" element={<AuditorResultsPage />} />
            <Route path="/maintenance-plans" element={<MaintenancePlansPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/accessibility-statement" element={<AccessibilityStatementPage />} />
            <Route path="/book-consultation" element={<BookConsultationPage />} />
            <Route path="/free-demo-portal" element={<FreeDemoPortalPage />} />
            <Route path="/book" element={<Navigate to="/book-consultation" replace />} />
            <Route path="/contract-builder" element={<Navigate to="/client-portal" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <AccessibilityWidget />
      </div>
    </BrowserRouter>
  );
}

export default App;
