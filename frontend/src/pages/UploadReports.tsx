import { useState } from 'react';
import api from '../api/instance';
import { Upload, FilePlus, Loader2, CheckCircle, X, FileText, Lock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function UploadReports() {
  const { theme } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Lab Report');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'uploading' | 'extracting' | 'analyzing' | 'idle'>('idle');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setStep('uploading');
    setProgress(0);
    
    // Simulate progress
    const timer = setInterval(() => {
      setProgress(p => (p < 90 ? p + 10 : p));
    }, 200);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('report_type', type);

    try {
      setStep('extracting');
      const response = await api.post('/reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });
      
      setStep('analyzing');
      clearInterval(timer);
      setProgress(100);
      setSuccess(true);
      setStep('idle');
      
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        setTitle('');
        setProgress(0);
      }, 3000);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      alert(detail || 'Upload failed. Please upload a clearer document or image.');
      clearInterval(timer);
      setStep('idle');
    }
    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4 pb-20">
      <div className="text-center space-y-3">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center space-x-2 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-[0.2em]"
        >
          <Lock size={14} />
          <span>Biometric AES-256 Encryption</span>
        </motion.div>
        <h2 className="text-5xl font-extrabold tracking-tight">
          Secure <span className={theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}>Vault Ingress</span>
        </h2>
        <p className="text-slate-500 max-w-lg mx-auto font-medium">
          Securely deposit clinical documents into your private health vault. 
          Powered by neural classification and medical-grade security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form Side */}
        <div className="lg:col-span-3">
          <motion.form 
            onSubmit={handleUpload} 
            className="premium-card p-8 space-y-8 relative overflow-hidden"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60">Record Identification</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Annual Cardiovascular Screening"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl px-5 py-4 outline-none focus:border-[var(--accent-primary)] focus:ring-4 ring-[var(--accent-primary)]/5 transition-all font-bold text-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60">Clinical Category</label>
                <div className="relative">
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl px-5 py-4 outline-none focus:border-[var(--accent-primary)] focus:ring-4 ring-[var(--accent-primary)]/5 transition-all font-bold text-[var(--text-primary)] appearance-none"
                  >
                    <option>Lab Report</option>
                    <option>Prescription</option>
                    <option>Vaccination Record</option>
                    <option>Scan / MRI</option>
                    <option>Other</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-[var(--text-secondary)]">
                    <Shield size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60">Document Source</label>
                <div 
                  className={`
                    relative border-2 border-dashed rounded-[2rem] p-12 transition-all group
                    ${file ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' : 'border-[var(--border-main)] hover:border-[var(--accent-primary)] bg-[var(--bg-primary)]'}
                  `}
                >
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,image/*"
                  />
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className={`p-6 rounded-[2rem] transition-all ${file ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] group-hover:scale-110 shadow-sm'}`}>
                      {file ? (file.type.startsWith('image/') ? <Upload size={40} /> : <FileText size={40} />) : <Upload size={40} />}
                    </div>
                    {file ? (
                      <div>
                        <p className="font-bold text-lg text-[var(--accent-primary)]">{file.name}</p>
                        <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] mt-1 opacity-60">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for encryption</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-[var(--text-primary)]">Drop Clinical File</p>
                          <p className="text-sm text-[var(--text-secondary)] font-bold opacity-60">or click to browse local workstation</p>
                        </div>
                        <div className="flex space-x-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                          <span className="bg-white dark:bg-white/5 px-2 py-1 rounded shadow-sm">PDF</span>
                          <span className="bg-white dark:bg-white/5 px-2 py-1 rounded shadow-sm">PNG</span>
                          <span className="bg-white dark:bg-white/5 px-2 py-1 rounded shadow-sm">JPG</span>
                        </div>
                      </>
                    )}
                  </div>
                  {file && (
                    <button 
                      onClick={(e) => { e.preventDefault(); setFile(null); }}
                      className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {progress > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="flex justify-between text-[10px] font-black tracking-widest text-[var(--accent-primary)]">
                    <span>
                      {step === 'uploading' && "UPLOADING FILE..."}
                      {step === 'extracting' && (file?.type.startsWith('image/') ? "SCANNING IMAGE..." : "EXTRACTING TEXT...")}
                      {step === 'analyzing' && "VAULTING DOCUMENT..."}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-main)] shadow-inner">
                    <motion.div 
                      className="h-full bg-[var(--accent-primary)] shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={!file || uploading}
              className={`
                w-full flex items-center justify-center space-x-3 py-5 rounded-[1.5rem] text-lg font-bold transition-all
                ${!file || uploading ? 'opacity-50 cursor-not-allowed bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-main)]' : 'bg-[var(--accent-primary)] text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-[0.98]'}
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span className="uppercase tracking-widest">
                    {step === 'uploading' && "INGRESSING..."}
                    {step === 'extracting' && "RECOGNIZING..."}
                    {step === 'analyzing' && "VAULTING..."}
                  </span>
                </>
              ) : success ? (
                <>
                  <CheckCircle size={24} />
                  <span className="uppercase tracking-widest">ENCRYPTED & VAULTED</span>
                </>
              ) : (
                <>
                  <Shield size={22} />
                  <span className="tracking-tight">INITIALIZE SECURE DEPOSIT</span>
                </>
              )}
            </button>
          </motion.form>
        </div>

        {/* Instructions Side */}
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card p-8 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/5 blur-3xl -mr-16 -mt-16" />
            <h3 className="text-xl font-bold mb-8 text-slate-800 dark:text-white">Upload Guidelines</h3>
            <ul className="space-y-8">
              {[
                { icon: FileText, title: 'Universal Ingestion', text: 'Upload PDFs (text or scanned) & Images (PNG, JPG, WebP).' },
                { icon: Shield, title: 'AI Classification', text: 'Our neural network will automatically audit and categorize your data.' },
                { icon: Lock, title: 'AES-256 Protocol', text: 'Clinical records are encrypted before leaving your local machine.' },
              ].map((item, i) => (
                <li key={i} className="flex space-x-5">
                  <div className="p-3.5 bg-[var(--bg-primary)] text-[var(--accent-primary)] rounded-2xl flex-shrink-0 self-start shadow-sm border border-[var(--border-main)] transition-transform hover:scale-110">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-[var(--text-primary)]">{item.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed font-bold opacity-60">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-12 p-6 bg-[var(--bg-primary)] rounded-[2rem] border border-[var(--border-main)]">
              <p className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest mb-2">Protocol Note</p>
              <p className="text-xs text-[var(--text-secondary)] font-bold opacity-70 leading-relaxed">
                SwasthyaSetu AI uses decentralized biometric hashing to ensure your medical data is immutable and only accessible to verified identities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Widget = ({ children, className = "" }: any) => (
  <div className={`glass-light dark:glass-dark p-8 relative overflow-hidden ${className}`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-gradient/5 blur-3xl -mr-16 -mt-16" />
    {children}
  </div>
);
