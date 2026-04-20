import React, { useEffect, useState } from 'react';
import { Settings, Cloud, CloudOff, Loader, Check, AlertTriangle } from 'lucide-react';
import { gameState } from '../game/gameState';
import { cloudSync } from '../game/cloudSync';
import { PlayerState } from '../types';
import { cn } from '../lib/utils';

type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error' | 'offline' | 'conflict';

const SYNC_ICONS: Record<SyncStatus, React.ReactNode> = {
  idle:     <Cloud size={14} className="text-platinum/30" />,
  syncing:  <Loader size={14} className="text-teal animate-spin" />,
  saved:    <Check size={14} className="text-teal" />,
  error:    <AlertTriangle size={14} className="text-red-400" />,
  offline:  <CloudOff size={14} className="text-platinum/30" />,
  conflict: <AlertTriangle size={14} className="text-gold" />,
};

const SYNC_LABELS: Record<SyncStatus, string> = {
  idle:     'Cloud',
  syncing:  'Saving…',
  saved:    'Saved',
  error:    'Sync error',
  offline:  'Offline',
  conflict: 'Conflict resolved',
};

export const TopNav: React.FC = () => {
  const [player, setPlayer] = useState<PlayerState>(gameState.get());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(cloudSync.getStatus());

  useEffect(() => {
    const unsub1 = gameState.subscribe(setPlayer);
    const unsub2 = cloudSync.onStatus(setSyncStatus);
    return () => { unsub1(); unsub2(); };
  }, []);

  const hpPct = Math.round((player.hp / player.maxHp) * 100);

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#131313]/80 backdrop-blur-xl rounded-b-[2.5rem] shadow-[0_8px_32px_rgba(229,226,225,0.05)]">
      {/* Left: identity */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden outline outline-2 outline-platinum/20">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0jp0yOXhuGhYT4Dl-8_Ygl5AreV_er8GVESNxqRcxvKEt4_Xat05oC3CPx9CsQUSQiShPfFmxeYKgqnpOhHGaCfBUDT6cM_Q2bjO2AeeJL6NOBQfsP3UPjaLMtwu5bMlG7fY9mgZ5wGMcRQOO7X4axqD91JBZoEOeGFxKlK2SW1dqJK8rjTRyP5kVNB3vNpQZRj8a469k7TOEkOo0223P3Wq9Emsx2qZ8qkcjW1wFfx-m0PwP8Qo5o3G1OxBQziD8R-ERH41iBrqH"
              alt="Profile"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Online dot */}
          <span className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#131313]",
            syncStatus === 'offline' || syncStatus === 'error' ? "bg-red-500" : "bg-teal"
          )} />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-platinum/50 font-headline">
            {player.activeZone.replace('_', ' ')}
          </span>
          <h1 className="text-lg font-extrabold text-platinum tracking-tighter font-headline leading-none">
            NEO-AEON
          </h1>
        </div>
      </div>

      {/* Center: HP bar */}
      <div className="hidden sm:flex flex-col items-center gap-1 min-w-[120px]">
        <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", hpPct > 50 ? "bg-teal" : hpPct > 25 ? "bg-gold" : "bg-red-500")}
            style={{ width: `${hpPct}%` }}
          />
        </div>
        <span className="text-[9px] font-bold text-platinum/40 uppercase tracking-widest">
          {player.hp.toLocaleString()} HP
        </span>
      </div>

      {/* Right: level + sync + settings */}
      <div className="flex items-center gap-2">
        {/* Sync indicator */}
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest",
          syncStatus === 'saved' ? "bg-teal/10 border-teal/20 text-teal" :
          syncStatus === 'syncing' ? "bg-surface-container border-white/10 text-teal" :
          syncStatus === 'error' ? "bg-red-900/20 border-red-500/20 text-red-400" :
          syncStatus === 'conflict' ? "bg-gold/10 border-gold/20 text-gold" :
          "bg-surface-container border-white/5 text-platinum/30"
        )}>
          {SYNC_ICONS[syncStatus]}
          <span className="hidden sm:inline">{SYNC_LABELS[syncStatus]}</span>
        </div>

        <div className="bg-surface-container/50 px-3 py-1.5 rounded-full border border-white/5">
          <span className="text-platinum font-headline font-black text-xs">LV.{player.level}</span>
        </div>

        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-high text-platinum hover:bg-surface-container-highest transition-all">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
