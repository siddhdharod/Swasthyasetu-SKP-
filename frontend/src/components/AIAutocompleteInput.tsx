import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import api from '../api/instance';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  context: string;
  required?: boolean;
  className?: string;
}

const cache = new Map<string, string[]>();

export default function AIAutocompleteInput({ value, onChange, placeholder, context, required, className }: Props) {
  const { theme } = useTheme();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isSelectionRef = useRef(false);
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce logic (increased to 400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 400);
    return () => clearTimeout(handler);
  }, [value]);

  useEffect(() => {
    if (debouncedValue.length < 3 || isSelectionRef.current) {
      if (isSelectionRef.current) {
        isSelectionRef.current = false;
      }
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (cache.has(debouncedValue)) {
      setSuggestions(cache.get(debouncedValue)!);
      setShowDropdown(true);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await api.post('/ai-suggestions', {
          text: debouncedValue,
          context: context
        });
        const newSuggestions = res.data.suggestions;
        setSuggestions(newSuggestions);
        cache.set(debouncedValue, newSuggestions);
        if (newSuggestions.length > 0) setShowDropdown(true);
      } catch (err) {
        console.error('AI Suggestion error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue, context]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full group">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          required={required}
          className={`${className} pr-12 transition-all duration-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50`}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Loader2 size={18} className="animate-spin text-cyan-500" />
              </motion.div>
            ) : (
              <motion.div
                key="sparkles"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.4, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group-hover:opacity-100 transition-opacity"
              >
                <Sparkles 
                  size={18} 
                  className={theme === 'dark' ? 'text-cyan-400' : 'text-primary-light'} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-[100] left-0 right-0 mt-2 p-1.5 rounded-[20px] shadow-2xl border backdrop-blur-2xl overflow-hidden ${
              theme === 'dark' 
                ? 'bg-[#0A0F1E]/90 border-white/10 shadow-cyan-900/20' 
                : 'bg-white/90 border-slate-200 shadow-slate-200/50'
            }`}
          >
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">
                AI Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    isSelectionRef.current = true;
                    onChange(suggestion);
                    setShowDropdown(false);
                    setSuggestions([]);
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-[12px] cursor-pointer transition-all ${
                    theme === 'dark' 
                      ? 'hover:bg-white/5 text-slate-300 hover:text-cyan-400' 
                      : 'hover:bg-slate-50 text-slate-700 hover:text-primary-light'
                  }`}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-500/10 flex items-center justify-center">
                    <Search size={12} className="opacity-60" />
                  </div>
                  <span className="text-[14px] font-medium truncate">{suggestion}</span>
                </motion.div>
              ))}
            </div>
            <div className="px-4 py-2 bg-slate-500/5 border-t border-white/5 flex items-center justify-between">
               <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Powered by Gemini Neural Link</span>
               <div className="flex space-x-1">
                 <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                 <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse delay-75" />
                 <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse delay-150" />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
