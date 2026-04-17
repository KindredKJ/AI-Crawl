import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gameState } from '../game/gameState';
import { companionManager } from '../game/companionSystem';
import { PlayerState, Companion } from '../types';
import { Trophy, Target, Zap, Shield, Swords, RotateCcw, Star, TrendingUp, Users, X, Edit3, Check } from 'lucide-react';
import { cn } from '../lib/utils';

const TYPE_COLORS: Record<string, string> = {
  MECHANICAL: 'text-slate-300 border-slate-500/30 bg-slate-900/20',
  DROID: 'text-blue-400 border-blue-500/30 bg-blue-900/20',
  DRONE: 'text-sky-400 border-sky-500/30 bg-sky-900/20',
  BEAST: 'text-orange-400 border-orange-500/30 bg-orange-900/20',
  PHANTOM: 'text-purple-400 border-purple-500/30 bg-purple-900/20',
  ANOMALY: 'text-pink-400 border-pink-500/30 bg-pink-900/20',
  CONSTRUCT: 'text-teal border-teal/30 bg-teal/10',
  HUMANOID: 'text-green-400 border-green-500/30 bg-green-900/20',
  BOSS: 'text-red-400 border-red-500/30 bg-red-900/20',
};

interface Achievement {
  id: string; name: string; description: string; icon: React.ReactNode;
  unlocked: (p: PlayerState) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', name: 'First Blood', description: 'Win your first battle', icon: <Swords size={18} />, unlocked: p => p.stats.battlesWon >= 1 },
  { id: 'survivor', name: 'Survivor', description: 'Win 10 battles', icon: <Shield size={18} />, unlocked: p => p.stats.battlesWon >= 10 },
  { id: 'slayer', name: 'Slayer', description: 'Eliminate 50 enemies', icon: <Target size={18} />, unlocked: p => p.stats.totalKills >= 50 },
  { id: 'first_capture', name: 'Tamer', description: 'Capture your first companion', icon: <Users size={18} />, unlocked: p => p.stats.totalCaptures >= 1 },
  { id: 'collector', name: 'Collector', description: 'Capture 10 companions', icon: <Users size={18} />, unlocked: p => p.stats.totalCaptures >= 10 },
  { id: 'level5', name: 'Rising Force', description: 'Reach Level 5', icon: <TrendingUp size={18} />, unlocked: p => p.level >= 5 },
  { id: 'level10', name: 'Ascendant', description: 'Reach Level 10', icon: <Zap size={18} />, unlocked: p => p.level >= 10 },
  { id: 'level20', name: 'Nexus Walker', description: 'Reach Level 20', icon: <Star size={18} />, unlocked: p => p.level >= 20 },
  { id: 'wealthy', name: 'Data Broker', description: 'Accumulate 5,000 credits', icon: <Star size={18} />, unlocked: p => p.currency >= 5000 },
  { id: 'centurion', name: 'Centurion', description: 'Win 100 battles', icon: <Trophy size={18} />, unlocked: p => p.stats.battlesWon >= 100 },
  { id: 'destroyer', name: 'Destroyer', description: 'Deal 1,000,000 total damage', icon: <Zap size={18} />, unlocked: p => p.stats.damageDealt >= 1_000_000 },
];

type Tab = 'STATS' | 'COMPANIONS' | 'ACHIEVEMENTS';

export const RegistryScreen: React.FC = () => {
  const [player, setPlayer] = useState<PlayerState>(gameState.get());
  const [companions, setCompanions] = useState<Companion[]>(companionManager.getAll());
  const [tab, setTab] = useState<Tab>('STATS');
  const [confirmReset, setConfirmReset] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const activeCompanion = companionManager.getActive();

  useEffect(() => { return gameState.subscribe(setPlayer); }, []);
  useEffect(() => { return companionManager.subscribe(setCompanions); }, []);

  const winRate = player.stats.battlesWon + player.stats.battlesLost > 0
    ? Math.round((player.stats.battlesWon / (player.stats.battlesWon + player.stats.battlesLost)) * 100) : 0;
  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked(player)).length;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-32 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-gold font-headline font-bold uppercase tracking-[0.4em] text-xs">Player Registry</span>
        <h1 className="text-5xl font-headline font-black text-white mt-2 leading-none">
          {player.name}<span className="text-platinum/40 text-2xl ml-4">LV.{player.level}</span>
        </h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['STATS', 'COMPANIONS', 'ACHIEVEMENTS'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("flex-1 py-3 rounded-full font-headline font-black text-xs uppercase tracking-widest transition-all",
              tab === t ? "platinum-shimmer text-surface" : "bg-surface-container-low border border-white/5 text-platinum/40")}>
            {t === 'COMPANIONS' ? `${t} (${companions.length})` : t === 'ACHIEVEMENTS' ? `${t} ${unlockedCount}/${ACHIEVEMENTS.length}` : t}
          </button>
        ))}
      </div>

      {/* ── STATS TAB ── */}
      {tab === 'STATS' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Level', value: player.level, color: 'text-white' },
              { label: 'Win Rate', value: `${winRate}%`, color: winRate >= 60 ? 'text-teal' : 'text-gold' },
              { label: 'Total Kills', value: player.stats.totalKills.toLocaleString(), color: 'text-white' },
              { label: 'Captures', value: player.stats.totalCaptures.toLocaleString(), color: 'text-purple-400' },
              { label: 'Battles Won', value: player.stats.battlesWon.toLocaleString(), color: 'text-teal' },
              { label: 'Battles Lost', value: player.stats.battlesLost.toLocaleString(), color: 'text-red-400' },
              { label: 'Credits', value: player.currency.toLocaleString(), color: 'text-gold' },
              { label: 'Companions', value: companions.length, color: 'text-purple-300' },
            ].map(s => (
              <div key={s.label} className="bg-surface-container-low rounded-2xl p-4 border border-white/5">
                <div className="text-[9px] font-bold uppercase tracking-widest text-platinum/40 mb-1">{s.label}</div>
                <div className={cn("text-2xl font-headline font-black", s.color)}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-bold uppercase tracking-widest text-platinum/40">XP Progress</span>
              <span className="text-sm font-headline font-black text-platinum">{player.xp.toLocaleString()} / {player.xpToNext.toLocaleString()}</span>
            </div>
            <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(player.xp / player.xpToNext) * 100}%` }}
                transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-teal to-gold rounded-full" />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-red-500/20 rounded-2xl p-5 space-y-3">
            <div className="text-[9px] font-bold uppercase tracking-widest text-red-400">Danger Zone</div>
            {!confirmReset ? (
              <button onClick={() => setConfirmReset(true)}
                className="flex items-center gap-2 text-red-400/60 text-sm font-bold hover:text-red-400 transition-colors">
                <RotateCcw size={16} /> Reset All Progress
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-400">This will erase everything. Are you sure?</p>
                <div className="flex gap-3">
                  <button onClick={() => { gameState.reset(); companionManager.reset(); setConfirmReset(false); }}
                    className="px-5 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-full text-sm font-bold">
                    Yes, Reset
                  </button>
                  <button onClick={() => setConfirmReset(false)}
                    className="px-5 py-2 bg-surface-container-low border border-white/10 text-platinum rounded-full text-sm font-bold">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── COMPANIONS TAB ── */}
      {tab === 'COMPANIONS' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {companions.length === 0 ? (
            <div className="text-center py-16 text-platinum/30">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <div className="font-headline font-black text-lg">No companions yet</div>
              <div className="text-sm mt-2">Weaken enemies in combat, then attempt to capture them</div>
            </div>
          ) : (
            companions.map(c => {
              const isActive = c.id === activeCompanion?.id;
              const typeStyle = TYPE_COLORS[c.type] ?? TYPE_COLORS.MECHANICAL;
              const isEditing = editingId === c.id;
              return (
                <motion.div key={c.id} layout
                  className={cn("rounded-2xl p-5 border space-y-3 transition-all", isActive ? "border-teal bg-teal/5" : "border-white/5 bg-surface-container-low")}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input value={editName} onChange={e => setEditName(e.target.value)}
                            className="bg-surface-container-high rounded-lg px-3 py-1 text-white text-sm font-bold border border-white/20 outline-none"
                            autoFocus onKeyDown={e => { if (e.key === 'Enter') { companionManager.rename(c.id, editName); setEditingId(null); } }} />
                          <button onClick={() => { companionManager.rename(c.id, editName); setEditingId(null); }}>
                            <Check size={16} className="text-teal" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-black text-white">{c.nickname ?? c.name}</span>
                          {c.nickname && <span className="text-platinum/30 text-xs">({c.name})</span>}
                          <button onClick={() => { setEditingId(c.id); setEditName(c.nickname ?? c.name); }}
                            className="text-platinum/30 hover:text-platinum transition-colors">
                            <Edit3 size={12} />
                          </button>
                        </div>
                      )}
                      <div className={cn("inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border", typeStyle)}>
                        {c.type}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-platinum/30">Lv.{c.level}</span>
                      {isActive && <span className="text-[9px] font-bold text-teal uppercase tracking-widest">Active</span>}
                    </div>
                  </div>

                  <div className="text-xs text-platinum/40 italic">"{c.flavor}"</div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/5 rounded-xl p-2 text-center">
                      <div className="text-[8px] text-platinum/30 uppercase">ATK</div>
                      <div className="text-sm font-black text-gold">{c.atk.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2 text-center">
                      <div className="text-[8px] text-platinum/30 uppercase">DEF</div>
                      <div className="text-sm font-black text-teal">{c.def.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2 text-center">
                      <div className="text-[8px] text-platinum/30 uppercase">Wins</div>
                      <div className="text-sm font-black text-white">{c.battlesWon}</div>
                    </div>
                  </div>

                  {/* Type Bonus */}
                  <div className="text-[10px] font-bold text-teal">{c.typeBonus.description}</div>

                  {/* Abilities */}
                  <div className="flex flex-wrap gap-1.5">
                    {c.abilities.map(a => (
                      <span key={a} className="px-2 py-1 bg-white/5 rounded-full text-[9px] font-bold text-platinum/50 uppercase tracking-wider">{a}</span>
                    ))}
                  </div>

                  {/* XP */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-platinum/30">
                      <span>XP {c.xp}/{c.xpToNext}</span>
                      <span>Level {c.level}</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${(c.xp / c.xpToNext) * 100}%` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {!isActive && (
                      <button onClick={() => companionManager.setActive(c.id)}
                        className="flex-1 py-2 bg-teal/10 border border-teal/30 text-teal rounded-full text-xs font-bold uppercase tracking-widest">
                        Deploy
                      </button>
                    )}
                    {isActive && (
                      <button onClick={() => companionManager.setActive(null)}
                        className="flex-1 py-2 bg-surface-container-high border border-white/10 text-platinum/60 rounded-full text-xs font-bold uppercase tracking-widest">
                        Recall
                      </button>
                    )}
                    <button onClick={() => companionManager.release(c.id)}
                      className="p-2 rounded-full bg-red-900/10 border border-red-500/20 text-red-400/60 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* ── ACHIEVEMENTS TAB ── */}
      {tab === 'ACHIEVEMENTS' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {ACHIEVEMENTS.map(a => {
            const earned = a.unlocked(player);
            return (
              <div key={a.id}
                className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-all",
                  earned ? "bg-teal/5 border-teal/20" : "bg-surface-container-low border-white/5 opacity-50")}>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                  earned ? "bg-teal/20 text-teal" : "bg-white/5 text-platinum/30")}>
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
        </motion.div>
      )}
    </div>
  );
};
