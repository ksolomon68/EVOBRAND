import React, { useEffect } from 'react';
import './accessibility-widget.css';

export default function AccessibilityWidget() {
  useEffect(() => {
    // Dynamically import the vanilla JS widget so it runs on the client side
    // It automatically manages its own DOM insertion and cleanup
    import('./accessibility-widget.js');
  }, []);

  return null; // The vanilla JS script appends elements directly to the body
}
