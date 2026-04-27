import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { supabase } from '../lib/supabase.js';
import { useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  }

  return (
    <>
      <SEO 
        title="Reset Password"
        description="Reset your EVOBRAND client portal password."
        noindex={true}
      />
      <div className="min-h-screen bg-[#04080f] flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <img src="/logo.png" alt="EVOBRAND" className="h-20 mx-auto object-contain" />
            <div className="h-px w-12 bg-[#22c8e5]/20 mx-auto mt-6 mb-4" />
            <p className="text-[#22c8e5]/60 font-[Rajdhani] font-bold tracking-[0.3em] uppercase text-xs">
              Reset Password
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
            {done ? (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Password updated!</h2>
                <p className="text-white/50 text-sm">Redirecting you to login…</p>
              </div>
            ) : !ready ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 border-2 border-[#22c8e5]/20 border-t-[#22c8e5] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/40 text-sm">Verifying reset link…</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-[Rajdhani] font-bold text-white mb-2">Set new password</h2>
                <p className="text-white/40 text-sm mb-8">Choose a strong password for your account.</p>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input
                        type="password"
                        required
                        minLength={8}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#22c8e5] transition-colors"
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input
                        type="password"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#22c8e5] transition-colors"
                        placeholder="••••••••"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#22c8e5] hover:bg-[#1ba3c0] text-[#003258] font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading
                      ? <div className="w-5 h-5 border-2 border-[#003258]/20 border-t-[#003258] rounded-full animate-spin" />
                      : 'UPDATE PASSWORD'}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="mt-8 text-center text-white/20 text-xs font-medium">
            Protected by EVOBRAND Security Protocols
          </p>
        </motion.div>
      </div>
    </>
  );
}
