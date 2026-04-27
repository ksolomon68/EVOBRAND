import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import SEO from '@/components/SEO.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const ClientPortalLoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const { error } = await signIn({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
        navigate('/client-portal');
      } else {
        const { error } = await signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName
            }
          }
        });
        if (error) throw error;
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title={forgotPassword ? 'Reset Password' : isLogin ? 'Login' : 'Create Account'}
        description="Access your EVOBRAND client portal."
        noindex={true}
      />

      <div className="min-h-screen bg-[#04080f] flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <motion.img
              src="/logo.png"
              alt="EVOBRAND"
              className="h-20 mx-auto object-contain"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            />
            <div className="h-px w-12 bg-[#22c8e5]/20 mx-auto mt-6 mb-4" />
            <p className="text-[#22c8e5]/60 font-[Rajdhani] font-bold tracking-[0.3em] uppercase text-xs">
              Client Portal
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">

            {/* Sign-up success overlay */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-20 bg-[#04080f]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Check your email</h2>
                  <p className="text-white/60 mb-8">
                    We've sent a confirmation link to <strong>{formData.email}</strong>. Please click it to activate your portal access.
                  </p>
                  <button
                    onClick={() => { setSuccess(false); setIsLogin(true); }}
                    className="text-[#22c8e5] font-bold hover:underline"
                  >
                    Back to login
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Forgot-password view ── */}
            {forgotPassword ? (
              <>
                <button
                  onClick={() => { setForgotPassword(false); setResetSent(false); setError(''); }}
                  className="text-white/30 hover:text-white/60 text-xs font-bold uppercase tracking-widest mb-6 transition-colors"
                >
                  ← Back to login
                </button>

                {resetSent ? (
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-[#22c8e5]/10 flex items-center justify-center mb-6">
                      <CheckCircle2 size={32} style={{ color: '#22c8e5' }} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Check your inbox</h2>
                    <p className="text-white/50 text-sm">
                      A reset link has been sent to <strong className="text-white/70">{formData.email}</strong>. Click it to set a new password.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-[Rajdhani] font-bold text-white mb-2">Forgot password?</h2>
                    <p className="text-white/40 text-sm mb-8">Enter your email and we'll send you a reset link.</p>

                    {error && (
                      <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                        <AlertCircle size={18} className="shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                          <input
                            type="email"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#22c8e5] transition-colors"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                          : 'SEND RESET LINK'}
                      </button>
                    </form>
                  </>
                )}
              </>
            ) : (
              /* ── Login / Sign-up view ── */
              <>
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={() => { setIsLogin(true); setError(''); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-[#22c8e5] text-[#003258]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                    LOG IN
                  </button>
                  <button
                    onClick={() => { setIsLogin(false); setError(''); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-[#22c8e5] text-[#003258]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                    SIGN UP
                  </button>
                </div>

                <h2 className="text-2xl font-[Rajdhani] font-bold text-white mb-2">
                  {isLogin ? 'Welcome back' : 'Start your project'}
                </h2>
                <p className="text-white/40 text-sm mb-8">
                  {isLogin ? 'Sign in to manage your tickets.' : 'Create an account to access support.'}
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input
                          type="text"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#22c8e5] transition-colors"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input
                        type="email"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#22c8e5] transition-colors"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-white/40 text-xs font-bold uppercase tracking-widest">Password</label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => { setForgotPassword(true); setError(''); }}
                          className="text-[#22c8e5]/60 hover:text-[#22c8e5] text-xs font-semibold transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input
                        type="password"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#22c8e5] transition-colors"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#22c8e5] hover:bg-[#1ba3c0] text-[#003258] font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-4"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-[#003258]/20 border-t-[#003258] rounded-full animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'SECURE LOGIN' : 'CREATE ACCOUNT'}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
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
};

export default ClientPortalLoginPage;
