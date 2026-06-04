import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import SEO from '@/components/SEO.jsx';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [isNewUser, setIsNewUser] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sessionId = searchParams.get('session_id');
  const planId = searchParams.get('planId');
  const email = searchParams.get('email');
  const name = searchParams.get('name');

  useEffect(() => {
    if (!sessionId || !planId || !email || !name) {
      setStatus('error');
      setErrorMsg('Missing checkout session details. If you completed a payment, please contact support.');
      return;
    }

    const verifySession = async () => {
      try {
        const res = await fetch(`${API_BASE}/payments/verify-public-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, planId, email, name }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to verify session.');
        }

        setIsNewUser(data.isNewUser);
        setStatus('success');
      } catch (err) {
        console.error('Verify session error:', err);
        setStatus('error');
        setErrorMsg(err.message || 'Error processing your payment verification. Please reach out to support.');
      }
    };

    verifySession();
  }, [sessionId, planId, email, name]);

  return (
    <>
      <SEO 
        title="Payment Success - EVOBRAND"
        description="Thank you for your purchase. Your payment was verified successfully."
      />
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-[#1a2332] border border-white/5 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden"
        >
          {/* Top glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#22c8e5]/10 rounded-full blur-3xl" />

          {status === 'verifying' && (
            <div className="space-y-6 py-8">
              <Loader2 className="animate-spin text-[#22c8e5] mx-auto" size={56} />
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h2>
                <p className="text-gray-400 max-w-sm mx-auto">
                  Please hold on while we confirm your payment session and set up your portal account.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6 py-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                <AlertCircle size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                <p className="text-red-400 max-w-sm mx-auto mb-6">
                  {errorMsg}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all text-sm"
                  >
                    Contact Support
                  </a>
                  <a
                    href="/"
                    className="px-6 py-3 rounded-2xl bg-[#22c8e5] text-[#003258] font-bold hover:brightness-110 transition-all text-sm"
                  >
                    Return Home
                  </a>
                </div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-[#22c8e5]/10 text-[#22c8e5] flex items-center justify-center border border-[#22c8e5]/20">
                <CheckCircle2 size={32} />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Order Confirmed!</h2>
                <p className="text-gray-300">
                  Thank you for your business, <strong>{name}</strong>! Your order has been placed successfully.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left text-sm space-y-4">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs">What happens next?</h4>
                {isNewUser ? (
                  <p className="text-gray-300 leading-relaxed">
                    We have created a client account for you using your email: <strong className="text-white">{email}</strong>. 
                    Please check your inbox for a welcome email containing instructions on how to set up your password and log in.
                  </p>
                ) : (
                  <p className="text-gray-300 leading-relaxed">
                    An order confirmation email has been sent to <strong className="text-white">{email}</strong>. 
                    Since you already have a client portal account, your purchase has been added to your dashboard.
                  </p>
                )}
                <p className="text-gray-300 leading-relaxed">
                  An order ticket has been opened inside the portal where you can monitor fulfillment progress and communicate directly with our team.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-4 rounded-2xl bg-[#22c8e5] text-[#003258] font-bold text-sm uppercase tracking-wider hover:shadow-lg hover:shadow-[#22c8e5]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  Go to Client Portal <ArrowRight size={16} />
                </button>
                <a
                  href="/"
                  className="text-xs text-gray-500 hover:text-white transition-all underline"
                >
                  Go back to Home Page
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
