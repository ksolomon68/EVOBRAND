import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { AuthProvider } from '@/hooks/useAuth.jsx';
import { loadMotion } from '@/lib/motion.js';

// Start fetching the motion engine alongside the app; it is a separate lazy chunk.
loadMotion();

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
