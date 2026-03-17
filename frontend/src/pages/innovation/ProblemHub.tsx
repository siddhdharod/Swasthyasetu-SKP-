import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/instance';
import { FlaskConical, Sparkles, Plus, Search, Activity, Zap, TrendingUp, AlertCircle, Loader2, Target, Send, ArrowRight, Cpu, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import AIAutocompleteInput from '../../components/AIAutocompleteInput';

export default function ProblemHub() {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problems, setProblems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await api.get('/problems');
      setProblems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/problems', {
        title,
        description,
        difficulty: "Strategic"
      });
      setProblems([response.data, ...problems]); // Immediate state update
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const glassClass = theme === 'dark' ? 'glass-dark' : 'glass-light';
  const headingClass = theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light';

  return (
    <div className="space-y-12 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-primary-light/10 text-primary-light'}`}>
          <Target size={12} />
          <span>Biometric Innovation Vault</span>
        </div>
        <h1 className={`text-[28px] font-black tracking-tighter ${headingClass}`}>Problem Hub</h1>
        <p className="text-slate-500 font-medium text-[16px]">Document clinical challenges to initiate the neural synthesis protocol.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Submission Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${glassClass} p-10 border-transparent relative overflow-hidden group shadow-2xl`}
        >
          <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 transition-all group-hover:opacity-20 ${theme === 'dark' ? 'bg-cyan-500' : 'bg-primary-light'}`} />
          
          <h2 className="text-[20px] font-black tracking-tight mb-8">Submit Challenge</h2>
          
          <form onSubmit={handleCreateProblem} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[14px] font-black uppercase tracking-widest text-slate-500 ml-1">Problem Title</label>
              <AIAutocompleteInput 
                value={title}
                onChange={setTitle}
                context="problem_title"
                placeholder="e.g., Rural Diagnostic Latency"
                required
                className={`w-full bg-white/5 dark:bg-white/5 border ${theme === 'dark' ? 'border-white/10 focus:border-cyan-500/50' : 'border-slate-200 focus:border-primary-light/50 shadow-sm'} rounded-2xl p-5 text-[16px] outline-none transition-all font-bold`}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[14px] font-black uppercase tracking-widest text-slate-500 ml-1">Comprehensive Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe the clinical bottleneck in detail..."
                className={`w-full bg-white/5 dark:bg-white/5 border ${theme === 'dark' ? 'border-white/10 focus:border-cyan-500/50' : 'border-slate-200 focus:border-primary-light/50 shadow-sm'} rounded-2xl p-5 text-[16px] outline-none transition-all font-bold resize-none`}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${theme === 'dark' ? 'btn-primary-dark' : 'btn-primary-light'} !py-5 flex items-center justify-center space-x-3 text-[16px] font-black shadow-2xl`}
            >
              {isSubmitting ? (
                <Activity className="animate-spin" size={20} />
              ) : (
                <>
                  <Send size={20} />
                  <span className="uppercase tracking-[0.2em]">Deploy Problem</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Live Problem List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-black tracking-tight uppercase tracking-widest text-slate-500">Repository</h2>
            <span className={`text-[12px] px-3 py-1 rounded-full font-black ${theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-100 text-slate-500'}`}>{problems.length} Nodes</span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className={`${glassClass} p-6 animate-pulse border-transparent`}>
                  <div className="h-4 w-1/3 bg-slate-200 dark:bg-white/5 rounded-full mb-4" />
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full mb-2" />
                  <div className="h-2 w-2/3 bg-slate-100 dark:bg-white/5 rounded-full" />
                </div>
              ))
            ) : (
              problems.map((prob, i) => (
                <motion.div 
                  key={prob.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`${glassClass} p-6 border-transparent hover:border-slate-300 dark:hover:border-white/10 transition-all cursor-default group relative overflow-hidden`}
                >
                  <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl opacity-5 ${theme === 'dark' ? 'bg-cyan-500' : 'bg-primary-light'} transition-all group-hover:opacity-10`} />
                  <div className="flex justify-between items-start mb-4">
                     <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>PROBLEM-ID: {prob.id.substring(0, 8)}</span>
                     <p className="text-[12px] font-black text-slate-400">{new Date(prob.createdAt * 1000).toLocaleDateString()}</p>
                  </div>
                  <h3 className="font-black text-[18px] mb-2 leading-tight group-hover:text-primary-light transition-colors">{prob.title}</h3>
                  <p className="text-[14px] font-medium text-slate-500 line-clamp-2 leading-relaxed">{prob.description}</p>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10" />
                        <span className="text-[12px] font-black text-slate-500">{prob.createdBy}</span>
                     </div>
                     <div className="flex items-center space-x-1 text-cyan-400">
                        <ArrowRight size={14} />
                     </div>
                  </div>
                </motion.div>
              ))
            )}
            
            {!loading && problems.length === 0 && (
              <div className="py-20 text-center opacity-30 flex flex-col items-center space-y-4">
                 <Cpu size={48} />
                 <p className="font-black uppercase tracking-widest text-sm">Central Hive Empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
