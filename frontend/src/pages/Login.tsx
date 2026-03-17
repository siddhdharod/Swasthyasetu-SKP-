import { useState } from 'react';
import api from '../api/instance';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, Sparkles, Loader2, ArrowRight, ShieldCheck, User, AlertCircle } from 'lucide-react';
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
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-teal-500/5 blur-[120px] rounded-full" />
    </div>
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { name, role, token } = response.data;
      localStorage.setItem("userName", name);
      localStorage.setItem("userRole", role);
      localStorage.setItem("token", token);
      login();
      
      if (role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-500">
      <Blobs />
      
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mx-auto"
          >
            <ShieldCheck size={12} />
            <span>Secure Clinical Access</span>
          </motion.div>
          <h1 className="text-5xl font-extrabold tracking-tight">
            SwasthyaSetu <span className={theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}>AI</span>
          </h1>
          <p className="text-slate-500 font-medium">Professional Healthcare Intelligence Dashboard</p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="premium-card p-10 space-y-8 relative overflow-hidden"
        >
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Login</h2>
            <p className="text-slate-400 font-medium text-sm">
              Enter your credentials to access your clinical workspace.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start space-x-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 text-xs font-bold"
              >
                <AlertCircle size={16} className="mt-0.5" />
                <span>{message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.com"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-4 ring-[var(--accent-primary)]/5 focus:border-[var(--accent-primary)]/50 transition-all text-lg font-bold text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60">Password</label>
                <Link to="/forgot-password" university-block className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] hover:underline">Reset?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-4 ring-[var(--accent-primary)]/5 focus:border-[var(--accent-primary)]/50 transition-all text-lg font-bold text-[var(--text-primary)]"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[var(--accent-primary)] text-white flex items-center justify-center space-x-3 py-5 rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
              <span className="uppercase tracking-widest text-sm">Proceed to Dashboard</span>
            </button>
          </form>

          <div className="text-center pt-4">
             <p className="text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest opacity-60">
               New here? <Link to="/register" className="text-[var(--accent-primary)] hover:underline ml-2">Initialize Protocol</Link>
             </p>
          </div>

          <div className="pt-8 border-t border-[var(--border-main)] text-center">
            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] opacity-40">
              Validated by HealthNet Security
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
