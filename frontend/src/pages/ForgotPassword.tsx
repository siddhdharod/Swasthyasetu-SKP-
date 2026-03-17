import { useState } from 'react';
import api from '../api/instance';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, Loader2, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgotPassword() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP/New Password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setMessage('A reset code has been transmitted.');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Identity lookup failed.');
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
      setMessage('Security credentials updated. Redirecting to login terminal...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Reset failed.');
    }
    setLoading(false);
  };

  const glassClass = theme === 'dark' ? 'glass-dark' : 'glass-light';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative ${theme === 'dark' ? 'dark bg-[#050810] text-white' : 'bg-[#FFF8F0] text-slate-800'}`}>
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${glassClass} p-10 space-y-8 relative overflow-hidden backdrop-blur-3xl shadow-2xl border-white/20`}
        >
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-black tracking-tighter">Credential Recovery</h2>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
              Initiate neural bypass sequence
            </p>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex items-start space-x-3 p-4 rounded-2xl border text-xs font-bold ${message.includes('updated') || message.includes('transmitted') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
              >
                <ShieldCheck size={16} className="mt-0.5" />
                <span>{message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity Channel</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors" size={18} />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sid@mesh.io"
                    className="w-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-11 pr-4 outline-none focus:ring-2 ring-primary-light transition-all font-bold text-sm"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary-gradient text-white flex items-center justify-center space-x-3 py-4 rounded-2xl text-lg font-black shadow-xl shadow-primary-light/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
                <span>DISPATCH CODE</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Reset Code</label>
                  <input 
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 text-center text-2xl font-black outline-none tracking-widest focus:ring-2 ring-primary-light transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Security Phrase</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors" size={18} />
                    <input 
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-11 pr-4 outline-none focus:ring-2 ring-primary-light transition-all font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#00FFFF] text-[#050810] flex items-center justify-center space-x-3 py-5 rounded-2xl text-lg font-black shadow-xl shadow-cyan-400/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                <span>UPDATE VAULT</span>
              </button>
            </form>
          )}

          <div className="text-center pt-4">
             <Link to="/login" className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-primary-light transition-colors">Abort Sequence</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
