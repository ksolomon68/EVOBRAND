import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

const GOLD = '#22c8e5';

/**
 * PaymentModal
 * Props:
 *  - type:        'contract' | 'ticket'
 *  - id:          number — the contract or ticket ID
 *  - amount:      number — dollar amount (e.g. 2500)
 *  - description: string — e.g. "Brand Identity Package"
 *  - onClose:     () => void
 */
export default function PaymentModal({ type, id, amount, description, onClose }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const fmtCurrency = (v) => {
    const n = Number(v);
    return isNaN(n) ? '$0.00' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const handlePay = async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
      const token = localStorage.getItem('evobrand_token');
      const res = await fetch(`${API_BASE}/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ type, id, amount, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      // Redirect to Stripe's hosted checkout page
      window.location.href = data.url;
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="payment-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: 'rgba(4,8,15,0.92)', backdropFilter: 'blur(12px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          key="payment-modal-card"
          initial={{ opacity: 0, scale: 0.93, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 24 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, #0a1628 0%, #04080f 60%)',
            border: '1px solid rgba(34,200,229,0.2)',
            boxShadow: '0 0 80px -10px rgba(34,200,229,0.15), 0 40px 80px -20px rgba(0,0,0,0.6)',
          }}
        >
          {/* Glowing top bar */}
          <div
            className="h-1 w-full"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
          />

          {/* Header */}
          <div className="flex items-start justify-between p-8 pb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,200,229,0.1)', border: '1px solid rgba(34,200,229,0.2)' }}
              >
                <CreditCard size={22} style={{ color: GOLD }} />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl leading-tight">Secure Payment</h2>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-0.5">Powered by Stripe</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Amount display */}
          <div className="px-8 pb-6">
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: 'rgba(34,200,229,0.05)', border: '1px solid rgba(34,200,229,0.12)' }}
            >
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Amount Due</p>
              <p
                className="text-5xl font-bold mb-1 tracking-tight"
                style={{ color: GOLD }}
              >
                {fmtCurrency(amount)}
              </p>
              {description && (
                <p className="text-white/50 text-sm mt-2">{description}</p>
              )}
              <div className="mt-4 pt-4 border-t border-white/5">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: 'rgba(34,200,229,0.08)', color: `${GOLD}90` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {type === 'contract' ? 'Contract Payment' : 'Invoice Payment'}
                </span>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="px-8 pb-4">
            <div className="flex items-center justify-center gap-6 text-white/25">
              {['Visa', 'Mastercard', 'Amex', 'Discover'].map((card) => (
                <span key={card} className="text-[10px] font-bold uppercase tracking-wider">{card}</span>
              ))}
            </div>
          </div>

          {/* Error message */}
          {status === 'error' && (
            <div className="px-8 pb-4">
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
              >
                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-sm">{errorMsg}</p>
              </motion.div>
            </div>
          )}

          {/* CTA */}
          <div className="px-8 pb-8 space-y-3">
            <button
              onClick={handlePay}
              disabled={status === 'loading'}
              id={`pay-btn-${type}-${id}`}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: status === 'loading'
                  ? 'rgba(34,200,229,0.5)'
                  : `linear-gradient(135deg, ${GOLD}, #1ba3c0)`,
                color: '#003258',
                boxShadow: status === 'loading' ? 'none' : `0 8px 32px rgba(34,200,229,0.25)`,
              }}
              onMouseEnter={(e) => { if (status !== 'loading') e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Pay {fmtCurrency(amount)} Securely
                  <ExternalLink size={14} className="opacity-60" />
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={status === 'loading'}
              className="w-full py-3.5 rounded-2xl text-white/40 hover:text-white/70 text-sm font-bold transition-colors uppercase tracking-widest"
            >
              Pay Later
            </button>
          </div>

          {/* Security note */}
          <div
            className="flex items-center justify-center gap-2 px-8 py-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
          >
            <Lock size={11} className="text-white/25" />
            <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest">
              256-bit SSL · PCI DSS compliant · Powered by Stripe
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
