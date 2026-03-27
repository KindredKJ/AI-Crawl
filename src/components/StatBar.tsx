import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface StatBarProps {
  label: string;
  value: string | number;
  progress: number;
  colorClass?: string;
}

export const StatBar: React.FC<StatBarProps> = ({ label, value, progress, colorClass = "bg-platinum" }) => {
  return (
    <div className="bg-surface-container p-6 rounded-xl group hover:bg-surface-container-high transition-all duration-300">
      <div className="flex justify-between items-end mb-2">
        <span className="font-headline font-bold text-xs uppercase tracking-widest text-platinum/60">{label}</span>
        <span className="text-2xl font-black font-headline text-white tracking-tighter">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClass)}
        />
      </div>
    </div>
  );
};
