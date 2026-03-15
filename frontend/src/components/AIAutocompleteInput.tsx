import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
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
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);
    return () => clearTimeout(handler);
  }, [value]);

  useEffect(() => {
    if (debouncedValue.length < 2) {
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
        const res = await axios.post('http://localhost:8000/api/ai-suggestions', {
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
    <div className="relative w-full">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        required={required}
        className={className}
      />
      
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 pointer-events-none">
        {loading ? (
          <Loader2 size={16} className="animate-spin text-cyan-500" />
        ) : (
          <Sparkles size={16} className={`opacity-20 ${theme === 'dark' ? 'text-cyan-400' : 'text-primary-light'}`} />
        )}
      </div>

      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute z-50 left-0 right-0 mt-2 p-2 rounded-[14px] shadow-2xl border ${
              theme === 'dark' 
                ? 'bg-[#0A0F1E]/95 border-white/10 backdrop-blur-xl shadow-cyan-500/5' 
                : 'bg-white/95 border-slate-200 backdrop-blur-xl shadow-slate-200'
            }`}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => {
                  onChange(suggestion);
                  setShowDropdown(false);
                }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                  theme === 'dark' 
                    ? 'hover:bg-white/5 text-slate-300' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Search size={14} className="opacity-40" />
                <span className="text-[14px] font-medium leading-tight">{suggestion}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
