
import React from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics.js';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Record a pageview on every route change (and initial load)
    trackPageView(pathname + search, document.title);
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
