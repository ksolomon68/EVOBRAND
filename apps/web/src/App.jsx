
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, matchPath } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import RouteCurtain from '@/components/RouteCurtain.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ChatWidget from '@/components/ChatWidget.jsx';
import HomePage from '@/pages/HomePage.jsx';

// lazy() that can also be preloaded. When a prerendered page boots, main.jsx
// preloads the current route's chunk before rendering, so the first render
// uses the module directly instead of flashing the Suspense fallback over the
// prerendered HTML. The choice is fixed per mount so a page never remounts.
function lazyPage(factory) {
  let Loaded = null;
  const load = () => factory().then((m) => { Loaded = m.default; return m; });
  const Lazy = lazy(load);
  function Page(props) {
    const [Comp] = useState(() => Loaded || Lazy);
    return <Comp {...props} />;
  }
  Page.preload = load;
  return Page;
}
const ServicesPage = lazyPage(() => import('@/pages/ServicesPage.jsx'));
const GoogleAdGrantsPage = lazyPage(() => import('@/pages/GoogleAdGrantsPage.jsx'));
const ServiceDetailPage = lazyPage(() => import('@/pages/ServiceDetailPage.jsx'));
const HowItWorksPage = lazyPage(() => import('@/pages/HowItWorksPage.jsx'));
const OurWorkPage = lazyPage(() => import('@/pages/OurWorkPage.jsx'));
const ResourcesPage = lazyPage(() => import('@/pages/ResourcesPage.jsx'));
const AboutPage = lazyPage(() => import('@/pages/AboutPage.jsx'));
const ContactPage = lazyPage(() => import('@/pages/ContactPage.jsx'));
const ClientPortalPage = lazyPage(() => import('@/pages/ClientPortalPage.jsx'));
const BlogPostPage = lazyPage(() => import('@/pages/BlogPostPage.jsx'));
const AuditorsPage = lazyPage(() => import('@/pages/AuditorsPage.jsx'));
const AuditorPage = lazyPage(() => import('@/pages/AuditorPage.jsx'));
const AuditorResultsPage = lazyPage(() => import('@/pages/AuditorResultsPage.jsx'));
const AccessibilityCheckerPage = lazyPage(() => import('@/pages/AccessibilityCheckerPage.jsx'));
const AccessibilityCheckerResultsPage = lazyPage(() => import('@/pages/AccessibilityCheckerResultsPage.jsx'));
const ClientPortalLoginPage = lazyPage(() => import('@/pages/ClientPortalLoginPage.jsx'));
const ResetPasswordPage = lazyPage(() => import('@/pages/ResetPasswordPage.jsx'));
const MaintenancePlansPage = lazyPage(() => import('@/pages/MaintenancePlansPage.jsx'));
const PaymentSuccessPage = lazyPage(() => import('@/pages/PaymentSuccessPage.jsx'));
const NotFoundPage = lazyPage(() => import('@/pages/NotFoundPage.jsx'));
const AccessibilityStatementPage = lazyPage(() => import('@/pages/AccessibilityStatementPage.jsx'));
const BookConsultationPage = lazyPage(() => import('@/pages/BookConsultationPage.jsx'));
const FreeDemoPortalPage = lazyPage(() => import('@/pages/FreeDemoPortalPage.jsx'));
const MotionLabPage = lazyPage(() => import('@/pages/MotionLabPage.jsx'));
const StyleGuidePage = lazyPage(() => import('@/pages/StyleGuidePage.jsx'));
const VideoLibraryPage = lazyPage(() => import('@/pages/VideoLibraryPage.jsx'));
import { trackPageView } from '@/lib/analytics.js';

// Route → page, for preloading the current page before the first render
// (see lazyPage). Must mirror the <Route> table below for prerendered pages.
const PRELOADABLE = [
  ['/services', ServicesPage],
  ['/google-ad-grants', GoogleAdGrantsPage],
  ['/services/:slug', ServiceDetailPage],
  ['/how-it-works', HowItWorksPage],
  ['/our-work', OurWorkPage],
  ['/our-work/videos', VideoLibraryPage],
  ['/resources', ResourcesPage],
  ['/about', AboutPage],
  ['/contact', ContactPage],
  ['/blog/:slug', BlogPostPage],
  ['/auditors', AuditorsPage],
  ['/auditor', AuditorPage],
  ['/accessibility-checker', AccessibilityCheckerPage],
  ['/maintenance-plans', MaintenancePlansPage],
  ['/accessibility-statement', AccessibilityStatementPage],
  ['/book-consultation', BookConsultationPage],
  ['/free-demo-portal', FreeDemoPortalPage],
];

export function preloadRoute(pathname) {
  const hit = PRELOADABLE.find(([pattern]) => matchPath(pattern, pathname));
  // Unknown paths render NotFoundPage, so preload that instead.
  return (hit ? hit[1] : NotFoundPage).preload().catch(() => {});
}

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
      <RouteCurtain />
      <AnalyticsTracker />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#22c8e5] focus:text-[#003258] focus:font-bold focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="flex flex-col min-h-screen">
        {!isPortal && <Header />}
        <main className="flex-1" id="main-content" tabIndex={-1}>
          <Suspense fallback={<div className="min-h-[100svh]" aria-busy="true" />}>
            <div key={pathname} className="route-scene">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/google-ad-grants" element={<GoogleAdGrantsPage />} />
                <Route path="/services/google-ad-grants" element={<Navigate to="/google-ad-grants" replace />} />
                <Route path="/services/:slug" element={<ServiceDetailPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/our-work" element={<OurWorkPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/our-work/videos" element={<VideoLibraryPage />} />
                <Route path="/videos" element={<Navigate to="/our-work/videos" replace />} />
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
                <Route path="/motion-lab" element={<MotionLabPage />} />
                <Route path="/motion-lab/blueprint" element={<Navigate to="/" replace />} />
                <Route path="/book" element={<Navigate to="/book-consultation" replace />} />
                <Route path="/contract-builder" element={<Navigate to="/client-portal" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
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
