import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Loader2, Mail, User } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

export default function PublicCheckoutModal({ planId, planName, price, type, onClose }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !name) {
      setErrorMsg('Please enter both your name and email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/payments/public-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, email, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create payment session.');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Stripe redirect URL not received.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0f1419] p-8 text-white shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#22c8e5]/10 text-[#22c8e5]">
              <CreditCard size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white">Complete Your Purchase</h3>
            <p className="text-sm text-gray-400 mt-1">
              You are purchasing <strong>{planName}</strong>
            </p>
            <div className="mt-3 inline-block px-4 py-1.5 rounded-full text-lg font-bold bg-[#22c8e5]/10 text-[#22c8e5] border border-[#22c8e5]/20">
              {price}{type === 'recurring' ? '/mo' : ''}
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 p-3.5 text-sm text-red-400 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-500" size={18} />
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#22c8e5] focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#22c8e5] focus:bg-white/10 transition-all"
                />
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block pl-1">
                Your receipt and client portal login instructions will be sent here.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22c8e5] py-3.5 text-sm font-bold text-[#003258] hover:shadow-lg hover:shadow-[#22c8e5]/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  Proceed to Secure Checkout
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-[10px] text-gray-500">
            Secure checkout powered by Stripe. SSL encrypted.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
