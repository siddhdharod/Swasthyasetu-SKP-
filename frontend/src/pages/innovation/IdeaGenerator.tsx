import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Zap, Plus, Search, ChevronRight, Target, BrainCircuit, Activity, AlertCircle, Sparkles, Cpu, Globe, User, Send } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import AIAutocompleteInput from '../../components/AIAutocompleteInput';

const API_BASE = 'http://localhost:8000/api/problems';

export default function IdeaGenerator() {
  const { theme } = useTheme();
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmittingUserIdea, setIsSubmittingUserIdea] = useState(false);
  const [userIdeaTitle, setUserIdeaTitle] = useState('');
  const [userIdeaDesc, setUserIdeaDesc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await axios.get(API_BASE);
      setProblems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (prob: any) => {
    setSelectedProblem(prob);
    fetchIdeas(prob.id);
  };

  const fetchIdeas = async (problemId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/${problemId}/ideas`);
      setIdeas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedProblem) return;
    setIsGenerating(true);
    try {
      const res = await axios.post(`${API_BASE}/${selectedProblem.id}/ideas`, {
        type: 'ai',
        problem_text: selectedProblem.description
      });
      // Backend returns the newly generated AI ideas
      setIdeas([...res.data, ...ideas]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitUserIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblem || !userIdeaTitle || !userIdeaDesc) return;
    setIsSubmittingUserIdea(true);
    try {
      const res = await axios.post(`${API_BASE}/${selectedProblem.id}/ideas`, {
        type: 'user',
        title: userIdeaTitle,
        description: userIdeaDesc
      });
      setIdeas([res.data, ...ideas]);
      setUserIdeaTitle('');
      setUserIdeaDesc('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingUserIdea(false);
    }
  };

  const glassClass = theme === 'dark' ? 'glass-dark' : 'glass-light';
  const headingClass = theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light';
  const accentColor = theme === 'dark' ? 'text-cyan-400' : 'text-primary-light';

  return (
    <div className="space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-primary-light/10 text-primary-light'}`}>
          <Cpu size={12} />
          <span>Neural Solution Synthesis</span>
        </div>
        <h1 className={`text-[28px] font-black tracking-tighter ${headingClass} mb-2`}>Idea Evolution</h1>
        <p className="text-slate-500 font-medium text-[16px]">Transforming clinical challenges into actionable intelligence through user & AI collaboration.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Step 1: Select Problem */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-500">Challenges</h3>
            <span className={`text-[12px] px-2 py-0.5 rounded-full font-bold ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{problems.length}</span>
          </div>
          
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-3 scrollbar-hide">
            {problems.map(prob => (
              <motion.div 
                key={prob.id}
                onClick={() => handleSelect(prob)}
                whileHover={{ x: 4 }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  selectedProblem?.id === prob.id 
                    ? theme === 'dark' 
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.1)]' 
                      : 'bg-primary-light/5 border-primary-light/50 shadow-[0_8px_20px_rgba(255,122,174,0.1)]'
                    : `${glassClass} border-transparent hover:border-slate-300 dark:hover:border-white/10`
                }`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${selectedProblem?.id === prob.id ? 'opacity-100' : 'opacity-0'} ${theme === 'dark' ? 'bg-cyan-400' : 'bg-primary-light'}`} />
                <h4 className={`font-bold text-[14px] mb-1 leading-tight ${selectedProblem?.id === prob.id ? accentColor : ''}`}>{prob.title}</h4>
                <p className="text-[12px] font-medium opacity-50 line-clamp-1">by {prob.createdBy}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Step 2: Generation Workspace */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {!selectedProblem ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`${glassClass} h-[500px] flex flex-col items-center justify-center text-center space-y-6 opacity-40 border-dashed border-2`}
              >
                <div className="p-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <Target size={64} className="text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-[20px] font-black">Initialization Required</p>
                  <p className="text-[14px] font-medium max-w-xs mx-auto">Select a clinical challenge to initiate the generative engine.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Active Selection Details */}
                <div className={`${glassClass} p-8 border-transparent relative overflow-hidden shadow-2xl`}>
                   <div className={`absolute top-0 left-0 w-2 h-full ${theme === 'dark' ? 'bg-cyan-500' : 'bg-primary-light'}`} />
                   <h3 className="font-black text-[28px] tracking-tight mb-3">
                     {selectedProblem.title}
                   </h3>
                   <p className="text-slate-500 font-medium text-[16px] leading-relaxed italic">"{selectedProblem.description}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Option A: User Idea */}
                  <div className={`${glassClass} p-8 space-y-6 border-transparent`}>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                        <User size={20} className="text-slate-500" />
                      </div>
                      <h4 className="text-[14px] font-black uppercase tracking-widest text-slate-500">Option A: User Strategy</h4>
                    </div>
                    <form onSubmit={handleSubmitUserIdea} className="space-y-4">
                      <AIAutocompleteInput 
                        value={userIdeaTitle}
                        onChange={setUserIdeaTitle}
                        context="idea_generator"
                        placeholder="Strategy Title"
                        required
                        className={`w-full bg-white/5 dark:bg-black/20 border ${theme === 'dark' ? 'border-white/10 focus:border-cyan-500/50' : 'border-slate-200 focus:border-primary-light/50'} rounded-xl px-4 py-3 text-[14px] font-bold outline-none`}
                      />
                      <textarea 
                        value={userIdeaDesc}
                        onChange={(e) => setUserIdeaDesc(e.target.value)}
                        rows={3}
                        placeholder="Detailed explanation..."
                        className={`w-full bg-white/5 dark:bg-black/20 border ${theme === 'dark' ? 'border-white/10 focus:border-cyan-500/50' : 'border-slate-200 focus:border-primary-light/50'} rounded-xl px-4 py-3 text-[14px] font-medium outline-none resize-none`}
                        required
                      />
                      <button 
                        disabled={isSubmittingUserIdea}
                        className={`w-full ${theme === 'dark' ? 'btn-primary-dark' : 'btn-primary-light'} flex items-center justify-center space-x-2 !py-3 !text-[12px] shadow-lg`}
                      >
                        {isSubmittingUserIdea ? <Activity className="animate-spin" size={16} /> : <Send size={16} />}
                        <span className="uppercase tracking-widest">Submit Strategy</span>
                      </button>
                    </form>
                  </div>

                  {/* Option B: AI Generator */}
                  <div className={`${glassClass} p-8 space-y-6 border-transparent flex flex-col justify-center items-center text-center relative overflow-hidden group`}>
                    <div className={`absolute inset-0 bg-primary-gradient opacity-0 group-hover:opacity-[0.02] transition-opacity`} />
                    <div className="p-4 rounded-full bg-primary-gradient/10 border border-primary-light/20 mb-2">
                      <BrainCircuit size={40} className={accentColor} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[14px] font-black uppercase tracking-widest text-slate-500">Option B: AI Synthesis</h4>
                      <p className="text-[12px] text-slate-400 pb-4">Generate 3 high-feasibility clinical strategies using neural refinement.</p>
                      <button 
                        onClick={handleGenerateAI}
                        disabled={isGenerating}
                        className={`w-full ${theme === 'dark' ? 'btn-primary-dark' : 'btn-primary-light'} flex items-center justify-center space-x-3 !py-4 !text-[14px] shadow-2xl relative z-10`}
                      >
                        <Sparkles size={20} className={isGenerating ? "animate-spin" : ""} />
                        <span className="uppercase tracking-widest">{isGenerating ? 'Synthesizing...' : 'Generate AI Ideas'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ideas Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-12 flex flex-col items-center space-y-4"
                      >
                         <BrainCircuit size={48} className={`animate-pulse ${accentColor}`} />
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Neural Network Active</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {ideas.map((idea, i) => (
                    <motion.div 
                      key={idea.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -5 }}
                      className={`${glassClass} p-8 border-transparent hover:border-cyan-500/20 shadow-xl space-y-6 relative overflow-hidden group`}
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-5 -mr-16 -mt-16 transition-all group-hover:opacity-15 ${theme === 'dark' ? 'bg-cyan-500' : 'bg-primary-light'}`} />
                      
                      <div className="flex justify-between items-start relative z-10">
                        <div className={`p-3 rounded-2xl ${idea.type === 'ai' ? theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-primary-light/10 text-primary-light' : 'bg-slate-100 text-slate-500'}`}>
                          {idea.type === 'ai' ? <Sparkles size={24} /> : <User size={24} />}
                        </div>
                        <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{idea.type === 'ai' ? 'AI Synthesis' : 'User Idea'}</div>
                      </div>
                      
                      <div className="space-y-3 relative z-10">
                        <h4 className={`font-black text-[20px] tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{idea.title}</h4>
                        <p className="text-[14px] font-medium text-slate-500 leading-relaxed line-clamp-4">{idea.explanation || idea.description}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-white/5 relative z-10 flex justify-between items-center">
                         <div className="flex flex-col">
                           <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Contributor</span>
                           <span className="text-[12px] font-bold text-slate-500">{idea.createdBy}</span>
                         </div>
                         {idea.feasibility > 0 && (
                           <div className="text-right">
                             <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter block">Readiness</span>
                             <span className={`text-[12px] font-black ${accentColor}`}>{idea.feasibility}%</span>
                           </div>
                         )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
