import { useState } from 'react';
import axios from 'axios';
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
    confirmPassword: ''
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
      await axios.post('http://localhost:8000/api/auth/register', {
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
      await axios.post('http://localhost:8000/api/auth/verify-otp', { email: formData.email, otp });
      setMessage('Account synthesized successfully. Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Verification failed.');
    }
    setLoading(false);
  };

  const glassClass = theme === 'dark' ? 'glass-dark' : 'glass-light';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative ${theme === 'dark' ? 'dark bg-[#050810] text-white' : 'bg-[#FFF8F0] text-slate-800'}`}>
      <div className="w-full max-w-2xl">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${glassClass} p-10 space-y-8 relative overflow-hidden backdrop-blur-3xl shadow-2xl border-white/20`}
        >
          <div className="space-y-2 text-center">
            <h2 className="text-4xl font-black tracking-tighter">{step === 1 ? 'Initiate Enrollment' : 'Verify Identity'}</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
              {step === 1 ? 'Join the decentralized AI healthcare mesh' : `Enter the code sent to ${formData.email}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex items-start space-x-3 p-4 rounded-2xl border text-xs font-bold ${message.includes('successfully') || message.includes('transmitted') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
              >
                <ShieldCheck size={16} className="mt-0.5" />
                <span>{message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 ? (
            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors" size={18} />
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Siddharth"
                    className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 ring-primary-light transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Channel</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors" size={18} />
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="sid@mesh.io"
                    className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 ring-primary-light transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Link</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors" size={18} />
                  <input 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 0000000000"
                    className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 ring-primary-light transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Age</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors" size={18} />
                    <input 
                      type="number"
                      required
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      placeholder="21"
                      className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 ring-primary-light transition-all font-bold text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Gender</label>
                  <div className="relative group">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors" size={18} />
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 ring-primary-light transition-all font-bold text-sm appearance-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Security Phrase</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors" size={18} />
                  <input 
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 ring-primary-light transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Phrase</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors" size={18} />
                  <input 
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 ring-primary-light transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="col-span-1 md:col-span-2 bg-primary-gradient text-white flex items-center justify-center space-x-3 py-4 rounded-2xl text-lg font-black shadow-xl shadow-primary-light/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
                <span>GENERATE ACCOUNT</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">6-Digit Security Code</label>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl py-6 text-center text-4xl font-black outline-none tracking-[0.5em] focus:ring-2 ring-primary-light transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#00FFFF] text-[#050810] flex items-center justify-center space-x-3 py-5 rounded-2xl text-lg font-black shadow-xl shadow-cyan-400/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                <span>AUTHORIZE ENROLLMENT</span>
              </button>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary-light transition-colors text-center"
              >
                Return to Form
              </button>
            </form>
          )}

          <div className="text-center pt-4">
             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
               Already in the mesh? <Link to="/login" className="text-primary-light hover:underline ml-2">Secure Login</Link>
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
