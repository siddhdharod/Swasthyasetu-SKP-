import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Shield, Activity, Search, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

export default function ClaimAnalyzer() {
  const { theme } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ 
    internal_similarity: number;
    medical_similarity: number;
    ai_writing: number;
    nlp_report: {
      summary: string;
      findings: string[];
      recommendations: string[];
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await axios.post('http://localhost:8000/api/claims/analyze', formData);
      setResult({ 
        internal_similarity: resp.data.internal_similarity_percentage,
        medical_similarity: resp.data.medical_similarity_percentage,
        ai_writing: resp.data.ai_writing_percentage,
        nlp_report: resp.data.nlp_report
      });
      setAnalyzing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "An unexpected error occurred during analysis.");
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-4">
      <div className="text-center space-y-3">
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center space-x-2 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest"
        >
          <Activity size={14} />
          <span>Advanced AI Claim Intelligence</span>
        </motion.div>
        <h2 className="text-5xl font-extrabold tracking-tight">
          AI Claim <span className={theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}>Analyzer</span>
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto font-medium">
          Multi-layer verification: Document Authenticity, Medical Literature Match, 
          and AI Writing Detection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Box */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-4 glass-light dark:glass-dark p-8 space-y-8 h-full"
        >
          <div className="flex items-center space-x-4 mb-2">
            <div className="p-3 bg-primary-gradient/10 text-primary-light rounded-2xl">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Input Protocol</h3>
              <p className="text-xs text-slate-500 font-medium">Upload claim documents for neural scanning</p>
            </div>
          </div>

          <label className="block relative h-64 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all cursor-pointer group">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept=".pdf" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-6">
              <div className={`p-5 rounded-full transition-all ${file ? 'bg-cyan-400 text-white scale-110 shadow-lg' : 'bg-cyan-500/10 text-cyan-400 group-hover:scale-110'}`}>
                <FileText size={48} />
              </div>
              {file ? (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-cyan-400 truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-slate-500">{ (file.size / 1024).toFixed(0) } KB • Ready for AI pass</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-bold">Select Claim Document</p>
                  <p className="text-sm text-slate-500">PDF files strictly required for embedding extraction</p>
                </div>
              )}
            </div>
          </label>

          <button 
            onClick={handleAnalyze}
            disabled={!file || analyzing}
            className={`
              w-full flex items-center justify-center space-x-3 py-5 rounded-2xl text-lg font-bold transition-all shadow-xl
              ${!file || analyzing ? 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-white/5' : 'bg-[#00FFFF] text-[#050810] hover:scale-[1.02] shadow-cyan-400/20'}
            `}
          >
            {analyzing ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>PROCESSING NEURAL LAYERS...</span>
              </>
            ) : (
              <>
                <Search size={24} />
                <span>START COMPREHENSIVE SCAN</span>
              </>
            )}
          </button>

          <div className="p-4 bg-white/30 dark:bg-black/20 rounded-2xl flex items-start space-x-3 border border-white/10">
            <Info size={18} className="text-slate-400 mt-1 flex-shrink-0" />
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              The AI performs three scans: Internal (duplicate detection), Medical Literature (accuracy), and AI Detection (authenticity).
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-8 glass-light dark:glass-dark p-8 flex flex-col space-y-8 min-h-[500px] relative overflow-hidden"
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl flex items-start space-x-4 mb-4"
            >
              <AlertCircle className="flex-shrink-0 mt-1" size={24} />
              <div className="space-y-1">
                <h4 className="font-bold">Neural Scan Inference Error</h4>
                <p className="text-sm opacity-80">{error}</p>
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
                <div className="w-32 h-32 mx-auto bg-slate-500/5 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                  <Shield size={64} strokeWidth={1} />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-bold text-slate-400">System Ready</h3>
                  <p className="text-slate-500 max-w-xs">Awaiting claim document for analysis...</p>
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
                     className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full shadow-[0_0_30px_rgba(0,255,255,0.2)]" 
                   />
                   <motion.div 
                     animate={{ rotate: -360 }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-4 border-2 border-purple-500 border-b-transparent rounded-full opacity-50" 
                   />
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-2xl font-black text-cyan-400">NLP</span>
                     <span className="text-[10px] font-bold tracking-widest opacity-50">ENGINE</span>
                   </div>
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-lg font-bold animate-pulse">Running Triple-Layer Scan...</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Comparing 1.2M Medical Records</p>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gauge 1: Internal Similarity */}
                  <div className="glass-light dark:glass-dark p-6 rounded-3xl flex flex-col items-center space-y-4 border border-white/5">
                    <div className="relative">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-white/5" />
                        <motion.circle 
                          cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" 
                          strokeDasharray={351.8}
                          initial={{ strokeDashoffset: 351.8 }}
                          animate={{ strokeDashoffset: 351.8 - (351.8 * result.internal_similarity / 100) }}
                          className={result.internal_similarity > 70 ? 'text-red-500' : 'text-cyan-400'}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">{Math.round(result.internal_similarity)}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-xs font-bold uppercase text-slate-500">Duplicate Check</h4>
                    </div>
                  </div>

                  {/* Gauge 2: Medical Similarity */}
                  <div className="glass-light dark:glass-dark p-6 rounded-3xl flex flex-col items-center space-y-4 border border-white/5">
                    <div className="relative">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-white/5" />
                        <motion.circle 
                          cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" 
                          strokeDasharray={351.8}
                          initial={{ strokeDashoffset: 351.8 }}
                          animate={{ strokeDashoffset: 351.8 - (351.8 * result.medical_similarity / 100) }}
                          className="text-purple-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">{Math.round(result.medical_similarity)}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-xs font-bold uppercase text-slate-500">Medical Veracity</h4>
                    </div>
                  </div>

                  {/* Gauge 3: AI Writing */}
                  <div className="glass-light dark:glass-dark p-6 rounded-3xl flex flex-col items-center space-y-4 border border-white/5">
                    <div className="relative">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-white/5" />
                        <motion.circle 
                          cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" 
                          strokeDasharray={351.8}
                          initial={{ strokeDashoffset: 351.8 }}
                          animate={{ strokeDashoffset: 351.8 - (351.8 * result.ai_writing / 100) }}
                          className={result.ai_writing > 50 ? 'text-orange-500' : 'text-green-500'}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">{Math.round(result.ai_writing)}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-xs font-bold uppercase text-slate-500">AI Probability</h4>
                    </div>
                  </div>
                </div>

                {/* NLP Report Card */}
                <div className="glass-light dark:glass-dark p-8 rounded-3xl border border-white/5 space-y-6 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-400/20 text-cyan-400 rounded-lg">
                      <Activity size={20} />
                    </div>
                    <h3 className="text-xl font-bold">NLP Medical Report</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-500 uppercase">Executive Summary</h4>
                      <p className="text-sm leading-relaxed text-slate-300">
                        {result.nlp_report?.summary || "Summary data unavailable"}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Key Findings</h4>
                        <ul className="space-y-1">
                          {result.nlp_report?.findings?.map((f, i) => (
                            <li key={i} className="text-xs flex items-start space-x-2">
                              <span className="text-cyan-400 mt-1">•</span>
                              <span>{f}</span>
                            </li>
                          )) || <li className="text-xs text-slate-500 italic">No findings detected</li>}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Recommendations</h4>
                        <ul className="space-y-1">
                          {result.nlp_report?.recommendations?.map((r, i) => (
                            <li key={i} className="text-xs flex items-start space-x-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>{r}</span>
                            </li>
                          )) || <li className="text-xs text-slate-500 italic">No recommendations provided</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`
                   p-6 rounded-3xl flex items-start space-x-4 border text-left
                   ${(result.internal_similarity > 70 || result.ai_writing > 70)
                     ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                     : 'bg-cyan-500/10 text-cyan-400 border-cyan-400/20'}
                `}>
                  <div className={`p-3 rounded-2xl ${(result.internal_similarity > 70 || result.ai_writing > 70) ? 'bg-red-500 text-white' : 'bg-cyan-400 text-[#050810]'}`}>
                    {(result.internal_similarity > 70 || result.ai_writing > 70) ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{(result.internal_similarity > 70 || result.ai_writing > 70) ? 'Authenticity Warning' : 'Safe Verification'}</h4>
                    <p className="text-sm opacity-80 mt-1 font-medium leading-relaxed">
                      {result.internal_similarity > 70 
                        ? 'System detected a high semantic correlation with a pre-existing claim. Possible duplicate entry detected.' 
                        : result.ai_writing > 70 
                          ? 'This document has a high probability of being AI-generated. Manual verification recommended.'
                          : 'No significant matches found in our database and patterns look authentic. Document appears unique.'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setResult(null)}
                  className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary-light transition-colors self-center"
                >
                  Clear Results and Reset
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
