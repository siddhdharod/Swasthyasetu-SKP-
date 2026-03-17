import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle';
}

export default function Skeleton({ className = "", variant = 'rect' }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`
        bg-slate-200 dark:bg-white/5 
        ${variant === 'circle' ? 'rounded-full' : 'rounded-2xl'}
        ${className}
      `}
    />
  );
}
