import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Mail, ShieldCheck, Loader2, ArrowRight, Lock, Sparkles, CheckCircle2, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const Blobs = () => (
    <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-light/10 blur-[100px] rounded-full" 
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className={`absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] ${theme === 'dark' ? 'bg-cyan-500/5' : 'bg-purple-500/5'} blur-[100px] rounded-full`} 
      />
    </div>
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login', { email, password });
      login();
      navigate('/');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative ${theme === 'dark' ? 'dark bg-[#050810] text-white' : 'bg-[#FFF8F0] text-slate-800'}`}>
      <Blobs />
      
      <button 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-8 right-8 p-3 glass-light dark:glass-dark rounded-2xl hover:scale-110 transition-all z-50 text-slate-500"
      >
        {theme === 'dark' ? <Sparkles size={20} className="text-cyan-400" /> : <Lock size={20} className="text-primary-light" />}
      </button>

      <div className="w-full max-w-xl grid lg:grid-cols-1 gap-12 items-center">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-primary-gradient/10 px-4 py-2 rounded-full border border-primary-light/20 text-primary-light text-[10px] font-black uppercase tracking-[0.2em] mx-auto">
            <Lock size={12} />
            <span>Biometric AI Mesh</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none">
            SwasthyaSetu <span className={theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}>AI</span>
          </h1>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-light dark:glass-dark p-10 space-y-8 relative overflow-hidden backdrop-blur-3xl shadow-2xl border-white/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-gradient/5 blur-3xl -mr-16 -mt-16" />
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">Access Vault</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
              Authenticate via encrypted neural link to proceed
            </p>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex items-start space-x-3 p-4 rounded-2xl border text-xs font-bold bg-red-500/10 text-red-500 border-red-500/20`}
              >
                <ShieldCheck size={16} className="mt-0.5" />
                <span>{message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity Channel</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@workstation.io"
                  className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-2 ring-primary-light transition-all text-lg font-bold"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Phrase</label>
                <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-primary-light hover:underline">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-2 ring-primary-light transition-all text-lg font-bold"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-gradient text-white flex items-center justify-center space-x-3 py-5 rounded-2xl text-lg font-black shadow-xl shadow-primary-light/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
              <span>AUTHORIZE IDENTITY</span>
            </button>
          </form>

          <div className="text-center pt-4">
             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
               New to the mesh? <Link to="/register" className="text-primary-light hover:underline ml-2">Initiate Enrollment</Link>
             </p>
          </div>

          <div className="pt-8 border-t border-white/10 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Secured by <span className="text-primary-light">SwasthyaNet Protocol</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
