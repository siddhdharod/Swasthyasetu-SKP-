import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Shield, Activity, Search, Info, FileSearch, Sparkles, ShieldCheck, TrendingUp, AlertTriangle, Zap, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/instance';
import { useTheme } from '../context/ThemeContext';

export default function ClaimAnalyzer() {
  const { theme } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState<'uploading' | 'extracting' | 'analyzing' | 'idle'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setStep('uploading');
    setResult(null);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 1: Uploading (Simulated by the start of the request, but for more realism we keep it quick)
      setStep('extracting');
      
      const response = await api.post('/claims/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setStep('analyzing');
      // Natural delay to show the 'analyzing' state for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Safety parsing for the AI Analysis data
      const analysis = response.data.ai_analysis;
      setResult({
        ...response.data,
        ai_analysis: analysis
      });
      setAnalyzing(false);
      setStep('idle');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to extract content. Please upload a clearer document or image.");
      setAnalyzing(false);
      setStep('idle');
    }
  };

  const glassClass = theme === 'dark' ? 'glass-dark' : 'glass-light';

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-4 pb-20">
      <div className="text-center space-y-3">
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center space-x-2 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest"
        >
          <Activity size={14} />
          <span>Advanced AI Document Intelligence</span>
        </motion.div>
        <h2 className="text-5xl font-extrabold tracking-tight">
          Clinical <span className={theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}>Audit Engine</span>
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto font-medium">
          Multi-layer verification: Classification, Extraction, Risk Indicators, 
          and AI Writing Detection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Box */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-4 premium-card p-8 rounded-[2rem] space-y-8 h-full sticky top-4 shadow-xl"
        >
          <div className="flex items-center space-x-4 mb-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-2xl">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Input Protocol</h3>
              <p className="text-xs text-slate-500 font-bold tracking-tight uppercase opacity-60">Vault Upload</p>
            </div>
          </div>

          <label className="block relative h-64 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all cursor-pointer group">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept=".pdf,image/*" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-6">
              <div className={`p-5 rounded-3xl transition-all ${file ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 group-hover:scale-110'}`}>
                {file && file.type.startsWith('image/') ? <Upload size={48} /> : <FileText size={48} />}
              </div>
              {file ? (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-blue-600 truncate max-w-xs">{file.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{ (file.size / 1024).toFixed(0) } KB • Ready for AI pass</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Select Document or Image</p>
                  <p className="text-xs text-slate-500 font-medium">PDFs, Scans, or Photos accepted</p>
                </div>
              )}
            </div>
          </label>

          <button 
            onClick={handleAnalyze}
            disabled={!file || analyzing}
            className={`
              w-full flex items-center justify-center space-x-3 py-5 rounded-2xl text-lg font-bold transition-all
              ${!file || analyzing ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-white/5 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20'}
            `}
          >
            {analyzing ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span className="tracking-widest uppercase">SCANNING...</span>
              </>
            ) : (
              <>
                <Search size={22} />
                <span className="tracking-tight">GENERATE AUDIT REPORT</span>
              </>
            )}
          </button>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-[2rem] flex flex-col space-y-8 min-h-[500px] relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none`}
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 p-6 rounded-2xl flex items-start space-x-4 mb-4"
            >
              <AlertCircle className="flex-shrink-0 mt-1" size={24} />
              <div className="space-y-1">
                <h4 className="font-black uppercase tracking-wider text-[10px]">Neural Scan Inference Error</h4>
                <p className="text-sm font-bold">{error}</p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!result && !analyzing && (
              <motion.div 
                key="awaiting"
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center flex-grow space-y-6"
              >
                <div className="w-32 h-32 mx-auto bg-slate-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-slate-200 dark:text-slate-800">
                  <Shield size={64} strokeWidth={1} />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-bold text-slate-400">System Ready for Audit</h3>
                  <p className="text-slate-400 max-w-xs text-sm font-medium">Upload a clinical document to generate a high-veracity intelligence report.</p>
                </div>
              </motion.div>
            )}

            {analyzing && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center flex-grow space-y-8"
              >
                <div className="relative w-48 h-48 mx-auto">
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full shadow-[0_0_30px_rgba(37,99,235,0.1)]" 
                   />
                   <motion.div 
                     animate={{ rotate: -360 }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-4 border-2 border-teal-500/30 border-b-transparent rounded-full" 
                   />
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-2xl font-black text-blue-600">AUDIT</span>
                     <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Process 802</span>
                   </div>
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-lg font-bold animate-pulse text-blue-600">
                    {step === 'uploading' && "Uploading document..."}
                    {step === 'extracting' && (file?.type.startsWith('image/') ? "Scanning image..." : "Extracting text...")}
                    {step === 'analyzing' && "Analyzing document..."}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Classifying • Detecting AI • Assessing Risk</p>
                </div>
              </motion.div>
            )}

            {result && result.ai_analysis && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-10 text-left"
              >
                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-main)] space-y-1 shadow-sm">
                    <p className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest opacity-60">Doc Type</p>
                    <p className="text-xl font-extrabold text-[var(--accent-primary)]">{result.ai_analysis.document_type || 'Unknown'}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-main)] space-y-1 shadow-sm">
                    <p className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest opacity-60">AI Prob</p>
                    <p className="text-xl font-extrabold text-teal-600">{result.ai_analysis.ai_writing_detection?.ai_probability || '0%'}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-main)] space-y-1 shadow-sm">
                    <p className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest opacity-60">Similarity</p>
                    <p className="text-xl font-extrabold text-indigo-600">{result.internal_similarity_percentage}%</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-main)] space-y-1 shadow-sm">
                    <p className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest opacity-60">Risk Index</p>
                    <p className={`text-xl font-extrabold ${result.ai_analysis.risk_indicators?.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {result.ai_analysis.risk_indicators?.length > 0 ? 'Elevated' : 'Nominal'}
                    </p>
                  </div>
                </div>

                {/* Gist Section */}
                <div className="space-y-4">
                  <h4 className="text-xl font-bold flex items-center space-x-2 text-slate-800 dark:text-white">
                    <Sparkles size={20} className="text-blue-600" />
                    <span>Clinical Gist</span>
                  </h4>
                  <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                       <FileText size={80} />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold text-lg relative z-10">
                      {result.ai_analysis.document_gist}
                    </p>
                  </div>
                </div>

                {/* Split View: Entities and Facts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Entity Extraction */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-extrabold flex items-center space-x-2 px-2 text-[var(--text-primary)]">
                       <FileSearch size={18} className="text-[var(--accent-primary)]" />
                       <span>Extracted Metadata</span>
                    </h4>
                    <div className="space-y-2">
                       {Object.entries(result.ai_analysis.entities || {}).map(([key, value]: [string, any]) => (
                         <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-main)]">
                            <span className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-wider opacity-60">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[150px]">
                              {value || 'Not detected'}
                            </span>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-extrabold flex items-center space-x-2 px-2 text-[var(--text-primary)]">
                       <Zap size={18} className="text-teal-500" />
                       <span>Key Clinical Indicators</span>
                    </h4>
                    <div className="space-y-4 p-8 rounded-[2rem] bg-teal-50/50 dark:bg-teal-500/5 border border-teal-100 dark:border-teal-500/10">
                       {(result.ai_analysis.key_points || []).map((point: string, i: number) => (
                         <div key={i} className="flex items-start space-x-4">
                            <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                            <p className="text-sm font-bold text-[var(--text-primary)] leading-relaxed opacity-80">{point}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                {/* Risk or Fraud Indicators */}
                <div className="space-y-4">
                  <h4 className="text-lg font-extrabold flex items-center space-x-2 px-2 text-[var(--text-primary)]">
                    <AlertTriangle size={18} className="text-rose-500" />
                    <span>Inconsistency Audit</span>
                  </h4>
                  {result.ai_analysis.risk_indicators?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.ai_analysis.risk_indicators.map((risk: string, i: number) => (
                        <div key={i} className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center space-x-4 text-rose-600">
                          <AlertCircle size={20} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{risk}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 flex items-center space-x-4 shadow-sm">
                      <ShieldCheck size={28} />
                      <span className="text-sm font-extrabold uppercase tracking-tight">Audit successful: No clinical inconsistencies detected.</span>
                    </div>
                  )}
                </div>

                {/* Final Insight Section */}
                <div className={`p-8 rounded-[2.5rem] border ${result.ai_analysis.risk_indicators?.length > 0 ? 'bg-rose-50/50 border-rose-100 dark:bg-rose-500/5 dark:border-rose-500/20' : 'bg-blue-50/50 border-blue-100 dark:bg-blue-500/5 dark:border-blue-500/20'}`}>
                  <div className="flex items-start space-x-6">
                    <div className={`p-4 rounded-2xl ${result.ai_analysis.risk_indicators?.length > 0 ? 'bg-rose-600' : 'bg-[var(--accent-primary)]'} text-white shadow-lg`}>
                       <Shield size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-extrabold text-[var(--text-primary)]">Clinical Authentication Verdict</h4>
                      <p className="text-base font-bold text-[var(--text-secondary)] mt-2 leading-relaxed opacity-90">
                        {result.ai_analysis.final_insight}
                      </p>
                      <div className="mt-6 flex items-center space-x-4 p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-main)] shadow-inner">
                         <div className="w-1.5 h-10 bg-[var(--accent-primary)]/20 rounded-full" />
                         <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--text-secondary)] opacity-60">
                           AI Writing Analysis: {result.ai_writing_detection_reason || result.ai_analysis.ai_writing_detection?.reason || 'Verified Human Structure'}
                         </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center pt-10">
                  <button 
                    onClick={() => setResult(null)}
                    className="flex items-center space-x-2 text-xs font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all group"
                  >
                    <span>Scan New Record</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
