import React from 'react';
import { MapPin, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onEnable: () => void;
}

const LocationPermissionModal: React.FC<Props> = ({ onEnable }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-light dark:glass-dark max-w-md w-full p-8 rounded-3xl shadow-2xl text-center border border-white/20"
      >
        <div className="w-20 h-20 bg-primary-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/20">
          <MapPin size={40} className="text-white animate-bounce" />
        </div>
        
        <h2 className="text-2xl font-bold mb-4 bg-primary-gradient bg-clip-text text-transparent">
          Location Access Required
        </h2>
        
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          Location access is required to use this healthcare platform because it enables nearby disease awareness and health insights.
        </p>

        <div className="flex items-center space-x-2 text-amber-500 bg-amber-500/10 p-3 rounded-xl mb-8 text-sm text-left">
          <ShieldAlert size={24} className="flex-shrink-0" />
          <p>Your privacy is protected. We only use your location for public health intelligence.</p>
        </div>

        <button
          onClick={onEnable}
          className="w-full py-4 bg-primary-gradient dark:bg-neon-gradient text-white dark:text-near-black rounded-2xl font-bold shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
        >
          <MapPin size={20} />
          <span>Enable Location</span>
        </button>
      </motion.div>
    </div>
  );
};

export default LocationPermissionModal;
