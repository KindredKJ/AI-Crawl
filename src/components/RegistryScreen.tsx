import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { gameState } from '../game/gameState';
import { PlayerState } from '../types';
import { Trophy, Target, Zap, Shield, Sword, RotateCcw, Star, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: (p: PlayerState) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', name: 'First Blood', description: 'Win your first battle', icon: <Sword size={20} />, unlocked: p => p.stats.battlesWon >= 1 },
  { id: 'survivor', name: 'Survivor', description: 'Win 10 battles', icon: <Shield size={20} />, unlocked: p => p.stats.battlesWon >= 10 },
  { id: 'slayer', name: 'Slayer', description: 'Eliminate 50 enemies', icon: <Target size={20} />, unlocked: p => p.stats.totalKills >= 50 },
  { id: 'level5', name: 'Rising Force', description: 'Reach Level 5', icon: <TrendingUp size={20} />, unlocked: p => p.level >= 5 },
  { id: 'level10', name: 'Ascendant', description: 'Reach Level 10', icon: <Zap size={20} />, unlocked: p => p.level >= 10 },
  { id: 'wealthy', name: 'Data Broker', description: 'Accumulate 5,000 credits', icon: <Star size={20} />, unlocked: p => p.currency >= 5000 },
  { id: 'centurion', name: 'Centurion', description: 'Win 100 battles', icon: <Trophy size={20} />, unlocked: p => p.stats.battlesWon >= 100 },
  { id: 'destroyer', name: 'Destroyer', description: 'Deal 1,000,000 total damage', icon: <Zap size={20} />, unlocked: p => p.stats.damageDealt >= 1_000_000 },
];

export const RegistryScreen: React.FC = () => {
  const [player, setPlayer] = useState<PlayerState>(gameState.get());
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    return gameState.subscribe(setPlayer);
  }, []);

  const winRate = player.stats.battlesWon + player.stats.battlesLost > 0
    ? Math.round((player.stats.battlesWon / (player.stats.battlesWon + player.stats.battlesLost)) * 100)
    : 0;

  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked(player)).length;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-32 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-gold font-headline font-bold uppercase tracking-[0.4em] text-xs">Player Registry</span>
        <h1 className="text-5xl font-headline font-black text-white mt-2 leading-none">
          {player.name}
          <span className="text-platinum/40 text-2xl ml-4">LV.{player.level}</span>
        </h1>
      </motion.div>

      {/* Core Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Level', value: player.level, color: 'text-white' },
          { label: 'Win Rate', value: `${winRate}%`, color: winRate >= 60 ? 'text-teal' : 'text-gold' },
          { label: 'Total Kills', value: player.stats.totalKills.toLocaleString(), color: 'text-white' },
          { label: 'Credits', value: player.currency.toLocaleString(), color: 'text-gold' },
          { label: 'Battles Won', value: player.stats.battlesWon.toLocaleString(), color: 'text-teal' },
          { label: 'Battles Lost', value: player.stats.battlesLost.toLocaleString(), color: 'text-red-400' },
          { label: 'Damage Dealt', value: player.stats.damageDealt.toLocaleString(), color: 'text-white' },
          { label: 'Damage Taken', value: player.stats.damageTaken.toLocaleString(), color: 'text-platinum/60' },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-container-low rounded-2xl p-4 border border-white/5">
            <div className="text-[9px] font-bold uppercase tracking-widest text-platinum/40 mb-1">{stat.label}</div>
            <div className={cn("text-2xl font-headline font-black", stat.color)}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[9px] font-bold uppercase tracking-widest text-platinum/40">Experience Progress</span>
          <span className="text-sm font-headline font-black text-platinum">{player.xp.toLocaleString()} / {player.xpToNext.toLocaleString()} XP</span>
        </div>
        <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(player.xp / player.xpToNext) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-teal to-gold rounded-full"
          />
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-platinum/40">Achievements</h3>
          <span className="text-xs font-bold text-teal">{unlockedCount} / {ACHIEVEMENTS.length}</span>
        </div>
        <div className="space-y-2">
          {ACHIEVEMENTS.map(a => {
            const earned = a.unlocked(player);
            return (
              <div
                key={a.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                  earned
                    ? "bg-teal/5 border-teal/20"
                    : "bg-surface-container-low border-white/5 opacity-50"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", earned ? "bg-teal/20 text-teal" : "bg-white/5 text-platinum/30")}>
                  {a.icon}
                </div>
                <div className="flex-1">
                  <div className={cn("font-headline font-bold text-sm", earned ? "text-white" : "text-platinum/40")}>{a.name}</div>
                  <div className="text-[10px] text-platinum/30">{a.description}</div>
                </div>
                {earned && <div className="text-teal text-lg">✓</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory Summary */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-platinum/40 mb-4">Inventory</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5">
            <div className="text-[9px] font-bold uppercase tracking-widest text-platinum/40 mb-2">Weapons</div>
            <div className="text-3xl font-headline font-black text-white">{player.inventory.weapons.length}</div>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5">
            <div className="text-[9px] font-bold uppercase tracking-widest text-platinum/40 mb-2">Entities</div>
            <div className="text-3xl font-headline font-black text-white">{player.inventory.entities.length}</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-500/20 rounded-2xl p-5 space-y-3">
        <div className="text-[9px] font-bold uppercase tracking-widest text-red-400">Danger Zone</div>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-2 text-red-400/60 text-sm font-bold hover:text-red-400 transition-colors"
          >
            <RotateCcw size={16} />
            Reset All Progress
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-400">This will erase everything. Are you sure?</p>
            <div className="flex gap-3">
              <button
                onClick={() => { gameState.reset(); setConfirmReset(false); }}
                className="px-5 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-full text-sm font-bold"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-5 py-2 bg-surface-container-low border border-white/10 text-platinum rounded-full text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
