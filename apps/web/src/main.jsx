import React from 'react';
import ReactDOM from 'react-dom/client';
import App, { preloadRoute } from '@/App';
import '@/index.css';
import { AuthProvider } from '@/hooks/useAuth.jsx';
import { loadMotion } from '@/lib/motion.js';

// Start fetching the motion engine alongside the app; it is a separate lazy chunk.
loadMotion();

const container = document.getElementById('root');

function render() {
  ReactDOM.createRoot(container).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

// Prerendered pages (tools/prerender.mjs) ship real HTML inside #root. Keep it
// on screen until the current page's code has loaded, then let React take over
// in one synchronous render, so there is no blank flash in between.
if (container.hasChildNodes() && window.location.pathname !== '/') {
  preloadRoute(window.location.pathname).then(render);
} else {
  render();
}
