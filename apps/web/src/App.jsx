
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
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
            <Route path="/maintenance" element={<MaintenancePlansPage />} />
            <Route path="/contract-builder" element={<Navigate to="/client-portal" replace />} />
          </Routes>
        </main>
        <Footer />
        <AccessibilityWidget />
      </div>
    </BrowserRouter>
  );
}

export default App;
