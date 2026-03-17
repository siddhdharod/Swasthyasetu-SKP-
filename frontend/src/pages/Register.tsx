import { useState } from 'react';
import api from '../api/instance';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, Loader2, ArrowRight, Lock, Sparkles, CheckCircle2, User, Phone, Calendar, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Other',
    password: '',
    confirmPassword: '',
    role: 'patient'
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage("Security phrases do not match.");
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await api.post('/auth/register', {
        ...formData,
        age: parseInt(formData.age)
      });
      setStep(2);
      setMessage('A security code has been transmitted to your mail workstation.');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Enrollment failed. Please verify your data.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/auth/verify-otp', { email: formData.email, otp });
      setMessage('Account synthesized successfully. Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Verification failed.');
    }
    setLoading(false);
  };

  const glassClass = theme === 'dark' ? 'glass-dark' : 'glass-light';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-500">
      <div className="w-full max-w-2xl">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="premium-card p-10 space-y-8 relative overflow-hidden"
        >
          <div className="space-y-1 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">{step === 1 ? 'Create Account' : 'Verify Identity'}</h2>
            <p className="text-[var(--text-secondary)] font-bold text-sm opacity-60">
              {step === 1 ? 'Register for the SwasthyaSetu AI medical network' : `Enter the verification code sent to ${formData.email}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-start space-x-3 p-4 rounded-2xl text-xs font-bold ${message.includes('successfully') || message.includes('transmitted') ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20'}`}
              >
                <ShieldCheck size={16} className="mt-0.5" />
                <span>{message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 ? (
            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Selection */}
              <div className="col-span-1 md:col-span-2 flex p-1.5 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl mb-2">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, role: 'patient'})}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${formData.role === 'patient' ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-blue-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)] opacity-60 hover:opacity-100'}`}
                >
                  <User size={16} />
                  <span>Patient</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, role: 'doctor'})}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${formData.role === 'doctor' ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'text-[var(--text-secondary)] hover:text-teal-600 opacity-60 hover:opacity-100'}`}
                >
                  <ShieldCheck size={16} />
                  <span>Medical Pro</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors opacity-60" size={18} />
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl py-4 pl-11 pr-4 outline-none focus:ring-4 ring-[var(--accent-primary)]/5 focus:border-[var(--accent-primary)]/50 transition-all font-bold text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors opacity-60" size={18} />
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl py-4 pl-11 pr-4 outline-none focus:ring-4 ring-[var(--accent-primary)]/5 focus:border-[var(--accent-primary)]/50 transition-all font-bold text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors opacity-60" size={18} />
                  <input 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 00000 00000"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl py-4 pl-11 pr-4 outline-none focus:ring-4 ring-[var(--accent-primary)]/5 focus:border-[var(--accent-primary)]/50 transition-all font-bold text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 ml-1">Age</label>
                   <div className="relative group">
                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors opacity-60" size={18} />
                     <input 
                       type="number"
                       required
                       value={formData.age}
                       onChange={(e) => setFormData({...formData, age: e.target.value})}
                       placeholder="24"
                       className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl py-4 pl-11 pr-4 outline-none focus:ring-4 ring-[var(--accent-primary)]/5 focus:border-[var(--accent-primary)]/50 transition-all font-bold text-sm text-[var(--text-primary)]"
                     />
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 ml-1">Gender</label>
                  <div className="relative group">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors opacity-60" size={18} />
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl py-4 pl-11 pr-4 outline-none focus:ring-4 ring-[var(--accent-primary)]/5 focus:border-[var(--accent-primary)]/50 transition-all font-bold text-sm text-[var(--text-primary)] appearance-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors opacity-60" size={18} />
                  <input 
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl py-4 pl-11 pr-4 outline-none focus:ring-4 ring-[var(--accent-primary)]/5 focus:border-[var(--accent-primary)]/50 transition-all font-bold text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors opacity-60" size={18} />
                  <input 
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl py-4 pl-11 pr-4 outline-none focus:ring-4 ring-[var(--accent-primary)]/5 focus:border-[var(--accent-primary)]/50 transition-all font-bold text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="col-span-1 md:col-span-2 bg-[var(--accent-primary)] text-white flex items-center justify-center space-x-3 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
                <span className="uppercase tracking-widest text-sm">Register Account</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-3 text-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60">Security Code</label>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-3xl py-8 text-center text-5xl font-black outline-none tracking-[0.4em] focus:ring-4 ring-[var(--accent-primary)]/5 focus:border-[var(--accent-primary)]/50 transition-all text-[var(--text-primary)]"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[var(--accent-primary)] text-white flex items-center justify-center space-x-3 py-5 rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                <span className="uppercase tracking-widest text-sm">Complete Enrollment</span>
              </button>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--accent-primary)] opacity-60 hover:opacity-100 transition-colors text-center"
              >
                Edit Registration Details
              </button>
            </form>
          )}

          <div className="text-center pt-4">
             <p className="text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest opacity-60">
               Existing member? <Link to="/login" className="text-[var(--accent-primary)] hover:underline ml-2">Secure Login</Link>
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
