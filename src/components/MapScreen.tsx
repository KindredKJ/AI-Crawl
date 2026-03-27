import React from 'react';
import { motion } from 'motion/react';
import { MapPin, ShieldAlert, Zap, Plus, Minus, Navigation } from 'lucide-react';

export const MapScreen: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D Map Background */}
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover opacity-60 mix-blend-lighten scale-110" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCToCSXSd3c4ABK12zWlTEf1Fc5dnK1wKkr0lOEyEQMftKmMAupQpV8xcZ5v6_ed2lmgvUUPnyWA8kEllrh4XuTSatSli9S_f7wIhrLndhxcpraSiG4uIn3KrrW6KlBj7NvP1qk1XSX-Dsm3NS2WXbKvmLkK79dVCHadUFEQMnW_DBMcUk-EgJmp9E2278LhzfdSbY8GKQbZ2Jcsj5Jl2gc1y2fiO7RFHKTS2RJLXx1ehXhPstIvQCVsPvel24MZKm4ZYU3bhJsmWgp" 
          alt="Aetheria Archipelago"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface opacity-80"></div>
      </div>

      {/* Interactive Markers */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Resource Node */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[35%] left-[25%] pointer-events-auto flex flex-col items-center"
        >
          <div className="w-12 h-12 platinum-shimmer rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(194,199,206,0.5)]">
            <Zap size={24} className="text-surface fill-current" />
          </div>
          <span className="mt-2 bg-surface-container-highest/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border border-platinum/10 text-platinum">Resource Node</span>
        </motion.div>

        {/* Hostile Nexus */}
        <div className="absolute top-[45%] right-[20%] pointer-events-auto flex flex-col items-center">
          <div className="w-14 h-14 bg-surface-container-lowest border border-red-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          <span className="mt-2 bg-red-900/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border border-red-500/20 text-red-500">Hostile Nexus</span>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
        <button className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-platinum hover:bg-surface-container-high transition-all active:scale-90">
          <Plus size={24} />
        </button>
        <button className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-platinum hover:bg-surface-container-high transition-all active:scale-90">
          <Minus size={24} />
        </button>
        <button className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-platinum hover:bg-surface-container-high transition-all active:scale-90 mt-4">
          <Navigation size={24} />
        </button>
      </div>

      {/* Regional Stats */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-30">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-panel p-6 rounded-xl border border-white/5 shadow-2xl flex flex-col gap-6"
        >
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-platinum/60 font-headline">Geographic Analysis</span>
              <h2 className="text-2xl font-extrabold text-white font-headline leading-none">Sector V-8 Prime</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-gold font-headline">Threat Level</span>
              <span className="block text-xl font-black text-gold tracking-tighter">CLASS S</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-container-low/50 p-4 rounded-lg flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-platinum/40 font-headline">Stability</span>
              <span className="text-xl font-extrabold text-white">88%</span>
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden mt-1">
                <div className="w-[88%] h-full platinum-shimmer"></div>
              </div>
            </div>
            <div className="bg-surface-container-low/50 p-4 rounded-lg flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-platinum/40 font-headline">Anomalies</span>
              <span className="text-xl font-extrabold text-white">14</span>
              <span className="text-[8px] text-red-500 font-bold uppercase mt-1">Increasing</span>
            </div>
            <div className="bg-surface-container-low/50 p-4 rounded-lg flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-platinum/40 font-headline">Tier</span>
              <span className="text-xl font-extrabold text-gold tracking-tight">Legendary</span>
              <span className="text-[8px] text-platinum/40 font-bold uppercase mt-1">High Yield</span>
            </div>
          </div>
          <button className="w-full py-4 platinum-shimmer rounded-full text-surface font-bold uppercase tracking-widest text-sm shadow-[0_4px_24px_rgba(194,199,206,0.3)] active:scale-[0.98] transition-all">
            Initiate Deployment
          </button>
        </motion.div>
      </div>
    </div>
  );
};
