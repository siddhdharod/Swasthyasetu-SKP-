import { useState } from 'react';
import axios from 'axios';
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
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
      await axios.post('http://localhost:8000/reports/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      clearInterval(timer);
      setProgress(100);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        setTitle('');
        setProgress(0);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
      clearInterval(timer);
    }
    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      <div className="text-center space-y-3">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center space-x-2 bg-primary-gradient/10 px-4 py-1.5 rounded-full border border-primary-light/20 text-primary-light text-xs font-bold uppercase tracking-widest"
        >
          <Lock size={14} />
          <span>Military-Grade Encryption</span>
        </motion.div>
        <h2 className="text-5xl font-extrabold tracking-tight">
          Upload <span className={theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}>Medical Record</span>
        </h2>
        <p className="text-slate-500 max-w-lg mx-auto font-medium">
          Securely vault your health documents using our AI-powered encryption system. 
          Accessible only by your verified biometrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form Side */}
        <div className="lg:col-span-3">
          <motion.form 
            onSubmit={handleUpload} 
            className="glass-light dark:glass-dark p-8 space-y-8 relative overflow-hidden"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Report Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Annual Cardiovascular Screening"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-primary-light transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Record Classification</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-primary-light transition-all font-medium appearance-none"
                >
                  <option>Lab Report</option>
                  <option>Prescription</option>
                  <option>Vaccination Record</option>
                  <option>Scan / MRI</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Document Source</label>
                <div 
                  className={`
                    relative border-2 border-dashed rounded-3xl p-12 transition-all group
                    ${file ? 'border-primary-light bg-primary-gradient/5' : 'border-slate-200 dark:border-white/10 hover:border-primary-light/50 bg-white/30 dark:bg-black/10'}
                  `}
                >
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,image/*"
                  />
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className={`p-5 rounded-2xl transition-all ${file ? 'bg-primary-gradient text-white scale-110' : 'bg-primary-gradient/10 text-primary-light group-hover:scale-110'}`}>
                      {file ? <FileText size={40} /> : <Upload size={40} />}
                    </div>
                    {file ? (
                      <div>
                        <p className="font-bold text-lg text-primary-light">{file.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for encryption</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <p className="text-lg font-bold">Drop your file here</p>
                          <p className="text-sm text-slate-500">or click to browse your workstation</p>
                        </div>
                        <div className="flex space-x-2 text-[10px] font-bold uppercase text-slate-400">
                          <span className="bg-white/50 dark:bg-black/20 px-2 py-1 rounded">PDF</span>
                          <span className="bg-white/50 dark:bg-black/20 px-2 py-1 rounded">PNG</span>
                          <span className="bg-white/50 dark:bg-black/20 px-2 py-1 rounded">JPG</span>
                        </div>
                      </>
                    )}
                  </div>
                  {file && (
                    <button 
                      onClick={(e) => { e.preventDefault(); setFile(null); }}
                      className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
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
                  className="space-y-2"
                >
                  <div className="flex justify-between text-xs font-bold text-primary-light">
                    <span>SECURITY PROGRESS</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 dark:bg-black/40 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary-gradient"
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
                w-full flex items-center justify-center space-x-3 py-5 rounded-2xl text-lg font-bold transition-all shadow-xl
                ${!file || uploading ? 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-white/5' : 'bg-primary-gradient text-white hover:scale-[1.02] active:scale-[0.98] shadow-primary-light/20'}
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>SECURELY UPLOADING...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle size={24} />
                  <span>UPLOAD COMPLETED!</span>
                </>
              ) : (
                <>
                  <FilePlus size={24} />
                  <span>INITIALIZE SECURE UPLOAD</span>
                </>
              )}
            </button>
          </motion.form>
        </div>

        {/* Instructions Side */}
        <div className="lg:col-span-2 space-y-6">
          <Widget className="h-full">
            <h3 className="text-xl font-bold mb-6">Upload Guidelines</h3>
            <ul className="space-y-6">
              {[
                { icon: FileText, title: 'Supported Formats', text: 'Upload reports in PDF, PNG, or JPG formats up to 20MB.' },
                { icon: Shield, title: 'AI Verification', text: 'Our AI will automatically categorize and scan the document for data points.' },
                { icon: Lock, title: 'End-to-End Encryption', text: 'Files are AES-256 encrypted before hitting our secure cloud vaults.' },
              ].map((item, i) => (
                <li key={i} className="flex space-x-4">
                  <div className="p-3 bg-primary-gradient/10 text-primary-light rounded-xl flex-shrink-0 self-start">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wide">{item.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-12 p-6 bg-primary-gradient/5 rounded-3xl border border-primary-light/10">
              <p className="text-xs font-bold text-primary-light uppercase tracking-widest mb-2">Did you know?</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                SwasthyaSetu AI uses biometric hashing to ensure your medical data is only accessible to you and your authorized emergency contacts.
              </p>
            </div>
          </Widget>
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
