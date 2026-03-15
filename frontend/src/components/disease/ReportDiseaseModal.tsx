import React, { useState, useEffect } from 'react';
import { X, Send, AlertTriangle, Search, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ReportDiseaseModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [diseaseName, setDiseaseName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Moderate');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (diseaseName.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:8000/api/diseases/suggestions?q=${diseaseName}`);
        setSuggestions(res.data.suggestions);
      } catch (err) {
        console.error("Suggestions error:", err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [diseaseName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diseaseName) return;

    setIsSubmitting(true);
    setError('');
    try {
      await axios.post('http://localhost:8000/api/diseases/report', {
        disease_name: diseaseName,
        description,
        severity
      }, { withCredentials: true });
      onSuccess();
      onClose();
      setDiseaseName('');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit report. Please ensure location is enabled.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="premium-card-light dark:premium-card-dark max-w-lg w-full overflow-hidden border border-white/40 dark:border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.4)]"
      >
        <div className="p-8 border-b border-white/20 dark:border-white/5 flex justify-between items-center bg-gradient-to-r from-primary-600 to-primary-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <h3 className="text-2xl font-black text-white flex items-center space-x-3 relative">
            <Activity size={28} className="animate-pulse" />
            <span className="tracking-tighter uppercase italic">Report Emergency</span>
          </h3>
          <button onClick={onClose} className="relative text-white/80 hover:text-white hover:rotate-90 transition-all duration-300">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-center space-x-2">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="relative">
            <label className="block text-sm font-semibold mb-2 text-slate-500 dark:text-slate-400">Disease Name</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={diseaseName}
                onChange={(e) => setDiseaseName(e.target.value)}
                placeholder="e.g. Dengue, Malaria, Viral Fever"
                className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary-500 transition-all font-medium"
                required
              />
            </div>
            
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden"
                >
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setDiseaseName(s); setSuggestions([]); }}
                      className="w-full text-left px-4 py-3 hover:bg-primary-500/10 transition-colors text-sm font-medium border-b border-slate-100 dark:border-white/5 last:border-0"
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-3 text-slate-400 dark:text-slate-500">Hazard Severity</label>
            <div className="flex space-x-4">
              {['Mild', 'Moderate', 'Severe'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeverity(lvl)}
                  className={`flex-1 py-4 rounded-2xl font-black transition-all duration-300 border-2 ${
                    severity === lvl 
                      ? 'bg-primary-gradient dark:bg-neon-gradient border-transparent text-white dark:text-near-black shadow-[0_8px_20px_rgba(255,122,174,0.3)] dark:shadow-[0_8px_20px_rgba(0,255,255,0.2)] scale-[1.05]' 
                      : 'border-slate-200 dark:border-white/10 text-slate-400 hover:border-primary-500/30'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-500 dark:text-slate-400">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about your symptoms or situation..."
              className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-primary-500 transition-all min-h-[100px] resize-none"
            />
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-400 dark:text-slate-500 p-2 italic bg-black/5 rounded-lg">
            <AlertTriangle size={14} />
            <span>Identity Protection: Your name and profile are never shared in disease reports. Only coordinates are stored for mapping.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !diseaseName}
            className="w-full py-4 bg-primary-gradient dark:bg-neon-gradient text-white dark:text-near-black rounded-2xl font-bold shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? <Activity className="animate-spin" /> : <Send size={20} />}
            <span>{isSubmitting ? 'Reporting...' : 'Submit Report'}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ReportDiseaseModal;
