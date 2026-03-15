import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, User, Sparkles, Loader2, Bot } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

export default function ChatbotWidget() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, {role: 'user', content: userMsg}]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/api/chatbot/ask', { message: userMsg });
      setMessages(prev => [...prev, {role: 'ai', content: res.data.response}]);
    } catch (err) {
      setMessages(prev => [...prev, {role: 'ai', content: "Neural sync interrupted. Please try again."}]);
    } finally {
      setLoading(false);
    }
  };

  const glassClass = theme === 'dark' ? 'glass-dark' : 'glass-light';
  const accentColor = theme === 'dark' ? 'text-cyan-400' : 'text-primary-light';

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`w-96 h-[550px] mb-6 ${glassClass} border-white/20 shadow-2xl flex flex-col overflow-hidden backdrop-blur-3xl`}
          >
            {/* Header */}
            <div className={`p-5 border-b border-white/10 ${theme === 'dark' ? 'bg-white/5' : 'bg-primary-light/5'} flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-primary-light/20 text-primary-light'}`}>
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest leading-none">Health Assistant</h3>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">AI Node Active</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4 px-6">
                  <Sparkles size={48} className={accentColor} />
                  <p className="text-[12px] font-bold uppercase tracking-widest">Neural Link Established. Ask regarding clinical symptoms or platform protocols.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                    ? `${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-primary-light/10 border-primary-light/20 text-primary-light'} border rounded-tr-none font-bold`
                    : `${theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-sm'} border border-white/10 rounded-tl-none font-medium`
                  } text-[13px] leading-relaxed`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className={`${theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-sm'} border border-white/10 p-4 rounded-2xl rounded-tl-none`}>
                    <Loader2 className="animate-spin text-slate-400" size={18} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-white/10 bg-white/5">
              <div className="flex items-center space-x-3">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type health query..."
                  className="flex-1 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[13px] font-bold outline-none focus:ring-2 ring-primary-light transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className={`p-3 rounded-xl transition-all ${theme === 'dark' ? 'bg-cyan-500 text-black hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]' : 'bg-primary-light text-white hover:shadow-[0_8px_15px_rgba(255,122,174,0.3)]'} disabled:opacity-50`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-3 px-6 py-4 rounded-full shadow-2xl transition-all ${theme === 'dark' ? 'bg-cyan-500 text-black shadow-cyan-400/20' : 'bg-primary-gradient text-white shadow-primary-light/30'}`}
      >
        <MessageSquare size={24} />
        <span className="font-black uppercase tracking-[0.2em] text-[12px]">AI Health Assistant</span>
      </motion.button>
    </div>
  );
}
