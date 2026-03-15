import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, User, Clock, Zap, Sparkles, TrendingUp, Search, Binary, Hash, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = 'http://localhost:8000/api/problems';

export default function CollaborationThreads() {
  const { theme } = useTheme();
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    let interval: any;
    if (selectedProblem) {
      fetchMessages();
      interval = setInterval(fetchMessages, 3000); // Polling every 3 seconds
      fetchSummary();
    }
    return () => clearInterval(interval);
  }, [selectedProblem]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchProblems = async () => {
    try {
      const res = await axios.get(API_BASE);
      setProblems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    if (!selectedProblem) return;
    try {
      const res = await axios.get(`${API_BASE}/${selectedProblem.id}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummary = async () => {
    if (!selectedProblem) return;
    setIsSummarizing(true);
    try {
      const res = await axios.get(`${API_BASE}/${selectedProblem.id}/summary`);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage || !selectedProblem) return;
    try {
      await axios.post(`${API_BASE}/${selectedProblem.id}/messages`, 
        { content: newMessage }
      );
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const glassClass = theme === 'dark' ? 'glass-dark' : 'glass-light';
  const headingClass = theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light';
  const accentColor = theme === 'dark' ? 'text-cyan-400' : 'text-primary-light';

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className={`text-[28px] font-black tracking-tighter ${headingClass} mb-1`}>Collab Threads</h1>
          <p className="text-slate-500 font-medium text-[14px]">Real-time clinical strategy synchronization.</p>
        </motion.div>
        <div className={`flex items-center space-x-3 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-primary-light/10 border-primary-light/20 text-primary-light'} border`}>
           <div className={`w-2 h-2 rounded-full animate-ping ${theme === 'dark' ? 'bg-cyan-500' : 'bg-primary-light'}`} />
           <span>Neural Bridge Active</span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Panel: Problem List (320px) */}
        <div className={`w-[320px] ${glassClass} flex flex-col p-5 border-transparent shadow-xl overflow-hidden shrink-0`}>
          <div className="mb-6 relative">
             <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
             <input 
              placeholder="Search threads..." 
              className={`w-full bg-white/5 dark:bg-black/20 border ${theme === 'dark' ? 'border-white/10 focus:border-cyan-500/30' : 'border-slate-200 focus:border-primary-light/30'} rounded-2xl pl-11 pr-4 py-3 text-[14px] outline-none transition-all font-bold tracking-tight`} 
             />
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {problems.map(prob => (
              <motion.button 
                key={prob.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedProblem(prob)}
                className={`w-full text-left p-4 rounded-2xl transition-all border group relative overflow-hidden ${
                  selectedProblem?.id === prob.id 
                    ? theme === 'dark' 
                      ? 'bg-cyan-500/10 border-cyan-500/50' 
                      : 'bg-primary-light/5 border-primary-light/50'
                    : 'hover:bg-white/5 border-transparent'
                }`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${selectedProblem?.id === prob.id ? theme === 'dark' ? 'bg-cyan-400' : 'bg-primary-light' : 'opacity-0'}`} />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">by {prob.createdBy}</span>
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-500">
                    <MessageSquare size={10} />
                    <span>{prob.messageCount || 0}</span>
                  </div>
                </div>
                <h4 className={`font-black text-[14px] line-clamp-2 leading-snug ${selectedProblem?.id === prob.id ? theme === 'dark' ? 'text-white' : 'text-slate-800' : 'text-slate-500 group-hover:text-slate-700'}`}>
                  {prob.title}
                </h4>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right Panel: Chat Interface (Auto) */}
        <div className={`flex-1 ${glassClass} flex flex-col border-transparent shadow-2xl relative overflow-hidden`}>
          {!selectedProblem ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-30">
               <div className="p-8 rounded-full bg-slate-100 dark:bg-white/5">
                <MessageSquare size={64} className="text-slate-400" />
               </div>
               <div className="space-y-1">
                 <h2 className="text-[20px] font-black uppercase tracking-[0.3em]">Neural Feed Hub</h2>
                 <p className="text-[14px] font-medium">Select a thread from the registry to join the synthesis portal.</p>
               </div>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-white/5 flex gap-6 items-start">
                 <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <Hash size={18} className={accentColor} />
                      <h2 className="font-black text-[20px] tracking-tight leading-none">{selectedProblem.title}</h2>
                    </div>
                    <p className="text-[14px] font-medium text-slate-400 line-clamp-1 italic">"{selectedProblem.description}"</p>
                 </div>
                 
                 {/* AI Summary Panel */}
                 <div className={`w-72 p-4 rounded-2xl border ${theme === 'dark' ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-primary-light/5 border-primary-light/20'} shrink-0 relative overflow-hidden`}>
                   <div className="absolute top-0 right-0 opacity-10"><Sparkles size={40} /></div>
                   <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center space-x-2">
                     <Zap size={10} fill="currentColor" />
                     <span>AI Insight</span>
                   </h3>
                   {isSummarizing ? (
                     <div className="space-y-1 animate-pulse">
                        <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded" />
                        <div className="h-2 w-4/5 bg-slate-200 dark:bg-white/10 rounded" />
                     </div>
                   ) : (
                     <p className="text-[11px] font-medium leading-relaxed italic text-slate-500 line-clamp-3">
                       {summary || "Analyzing discussion patterns..."}
                     </p>
                   )}
                 </div>
              </div>

              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-black/[0.01]">
                 {messages.map((msg, i) => (
                   <motion.div 
                     key={msg.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className={`flex gap-4 ${msg.email === 'ai' ? 'justify-center my-8' : ''}`}
                   >
                     <div className={`w-10 h-10 rounded-xl ${theme === 'dark' ? 'bg-black/40' : 'bg-white shadow-sm'} border dark:border-white/10 border-slate-100 flex items-center justify-center shrink-0`}>
                       <User size={18} className="text-slate-400" />
                     </div>
                     <div className={`space-y-2 max-w-[75%]`}>
                       <div className="flex items-center space-x-3 ml-1">
                         <span className={`text-[12px] font-black uppercase tracking-widest ${accentColor}`}>{msg.author}</span>
                         <span className="text-[10px] text-slate-400 font-bold">
                            {new Date(msg.timestamp * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                       </div>
                       <div className={`${
                        i % 2 === 0 
                        ? theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm' 
                        : theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-primary-light/5 border-primary-light/20'
                       } border rounded-2xl rounded-tl-none px-5 py-3.5 text-[14px] font-medium leading-relaxed text-slate-600 dark:text-slate-300`}>
                         {msg.content}
                       </div>
                     </div>
                   </motion.div>
                 ))}
                 {messages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-4">
                      <Binary size={48} />
                      <p className="text-[14px] font-black uppercase tracking-widest">Protocol Sync: No Transmissions Detected</p>
                   </div>
                 )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-white/5 backdrop-blur-md">
                 <div className="flex items-center space-x-4">
                    <input 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Enter clinical strategy..."
                      className={`flex-1 bg-white/5 dark:bg-black/40 border ${theme === 'dark' ? 'border-white/10 focus:border-cyan-500/50' : 'border-slate-200 focus:border-primary-light/50'} rounded-2xl px-6 py-4 text-[14px] font-bold outline-none transition-all shadow-inner`}
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      className={`w-14 h-14 ${theme === 'dark' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]' : 'bg-primary-light text-white shadow-[0_8px_15px_rgba(255,122,174,0.3)]'} rounded-2xl flex items-center justify-center transition-all`}
                    >
                       <Send size={24} />
                    </motion.button>
                 </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
