import React from 'react';
import { motion } from 'motion/react';
import { StatBar } from './StatBar';

export const CombatScreen: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-32">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-20">
        <div className="lg:col-span-5 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-gold font-headline font-bold uppercase tracking-[0.4em] text-xs">System Status: Overloaded</span>
            <h1 className="text-6xl md:text-8xl font-headline font-black text-white mt-4 leading-none tracking-normal">
              ASCENSION <br/><span className="text-platinum/50">PROTOCOL</span>
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 gap-4">
            <StatBar label="Attack Power" value="9,001+" progress={92} colorClass="bg-gradient-to-r from-teal to-gold" />
            <StatBar label="Defense Matrix" value="4,850" progress={65} colorClass="bg-platinum/40" />
            <StatBar label="Aura Speed" value="MAX" progress={100} colorClass="bg-teal" />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-6 platinum-shimmer text-surface font-headline font-black uppercase tracking-[0.3em] rounded-full shadow-[0_20px_40px_rgba(194,199,206,0.2)] transition-all duration-300"
          >
            Initiate Power-Up
          </motion.button>
        </div>

        <div className="lg:col-span-7 relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal/20 to-gold/20 blur-[120px] rounded-full opacity-60 group-hover:opacity-90 transition-opacity duration-700"></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-surface-container-low aspect-[4/5] overflow-hidden border border-white/10 rounded-3xl"
          >
            <img 
              alt="Character Visualization" 
              className="w-full h-full object-cover aura-glow" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-8 left-8 space-y-2">
              <div className="px-4 py-2 bg-teal text-surface font-headline font-black text-[10px] rounded-full uppercase shadow-lg shadow-teal/20">Aura: Active</div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-xl text-white font-headline font-black text-[10px] rounded-full uppercase border border-white/20">Sync: 100%</div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
