import React, { useEffect, useMemo, useState } from 'react';
import { Gem, LockKeyhole, Sparkles, Sword, Shield, Users, Zap, Crown, Check } from 'lucide-react';
import { gameState } from '../game/gameState';
import { KINFT_CATALOG, KINFT_RARITIES, kinftVault } from '../game/kinft';
import type { KINFTKind, KINFTRarity, KINFTUserPreferences } from '../game/kinft';

const RARITY_GRADIENT: Record<KINFTRarity, string> = {
  COMMON: 'from-slate-500/20 to-slate-900/70 border-slate-500/30',
  UNCOMMON: 'from-emerald-500/20 to-slate-900/70 border-emerald-500/30',
  RARE: 'from-blue-500/20 to-slate-900/70 border-blue-500/30',
  EPIC: 'from-violet-500/30 to-slate-900/70 border-violet-500/40',
  LEGENDARY: 'from-amber-500/30 to-slate-900/70 border-amber-500/40',
  OTHERWORLDLY: 'from-fuchsia-500/40 via-indigo-900/40 to-slate-900/70 border-fuchsia-400/50',
};
const KINDS: readonly KINFTKind[] = ['SKILL','POWER','WEAPON','GEAR','COMPANION','CHARACTER'];
const kindIcon = {
  SKILL: Sparkles, POWER: Zap, WEAPON: Sword, GEAR: Shield,
  COMPANION: Users, CHARACTER: Crown,
};
const CUSTOMIZERS: Array<{key: keyof KINFTUserPreferences; title: string; options: string[]; description: string}> = [
  { key: 'shroudPalette', title: 'Shroud palette', options: ['OBSIDIAN', 'EMBER', 'SERAPH', 'VOID'], description: 'Saved look preference for the future Unreal Shroud material' },
  { key: 'combatStance', title: 'Combat stance', options: ['BALANCED', 'PRECISION', 'ONSLAUGHT', 'GUARDIAN'], description: 'Active balanced attack, defense and critical-hit tradeoffs' },
  { key: 'cameraShake', title: 'Camera impact', options: ['OFF', 'SUBTLE', 'CINEMATIC'], description: 'Saved accessibility and cinematic camera preference' },
  { key: 'presentation', title: 'HUD layout', options: ['IMMERSIVE', 'TACTICAL', 'ACCESSIBLE'], description: 'Saved Unreal HUD profile; native rendering not yet integrated' },
  { key: 'effects', title: 'Visual fidelity', options: ['PERFORMANCE', 'BALANCED', 'CINEMATIC'], description: 'Saved Unreal effects preference; requires native renderer integration' },
];
const PALETTE_BORDER: Record<KINFTUserPreferences['shroudPalette'], string> = {
  OBSIDIAN: 'border-slate-500/30', EMBER: 'border-orange-500/40',
  SERAPH: 'border-amber-200/40', VOID: 'border-violet-500/50',
};
const percentage = (fraction: number) => `${Math.round(fraction * 1000) / 10}%`;

export const KINFTVaultScreen: React.FC = () => {
  const [state, setState] = useState(kinftVault.get());
  const [playerLevel, setPlayerLevel] = useState(gameState.get().level);
  const [filter, setFilter] = useState<KINFTKind | 'ALL'>('ALL');
  useEffect(() => kinftVault.subscribe(() => setState(kinftVault.get())), []);
  useEffect(() => gameState.subscribe(profile => setPlayerLevel(profile.level)), []);

  const cards = useMemo(() => state.items
    .map(item => ({ item, def: KINFT_CATALOG.find(def => def.id === item.definitionId) }))
    .filter(({ def }) => def && (filter === 'ALL' || def.kind === filter))
    .reverse(), [state.items, filter]);
  const bonuses = kinftVault.combatBonuses();

  return (
    <main className="max-w-7xl mx-auto min-h-screen px-4 pt-24 pb-40 space-y-7 text-white">
      <header className="space-y-3">
        <div className="text-[11px] tracking-[0.35em] uppercase text-violet-300">Covenant//Dust · Kindred KINFT Archive</div>
        <h1 className="text-4xl md:text-6xl font-headline font-black">YOUR <span className="text-violet-300">LEGACY</span></h1>
        <p className="text-platinum/60 max-w-2xl text-sm leading-6">
          Earn KINFTs through victories, bosses and milestones. Equip unique ability fragments,
          upgrade their rank with Shroud Essence, and assemble a custom Rider loadout.
        </p>
        <p className="text-xs text-amber-200/80">
          These are LOCAL in-game collectibles—not minted NFTs, verified wallet holdings, or tradeable on-chain assets.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-surface-container-low border border-white/10 p-4">
          <div className="text-xs uppercase tracking-widest text-platinum/50">KINFTs acquired</div>
          <div className="text-3xl font-black mt-2">{state.items.length}</div>
        </div>
        <div className="rounded-2xl bg-surface-container-low border border-white/10 p-4">
          <div className="text-xs uppercase tracking-widest text-platinum/50">Shroud Essence</div>
          <div className="text-3xl font-black mt-2 text-violet-300">{state.essence}</div>
        </div>
        <div className="rounded-2xl bg-surface-container-low border border-white/10 p-4">
          <div className="text-xs uppercase tracking-widest text-platinum/50">Equipped Slots</div>
          <div className="text-3xl font-black mt-2">{Object.values(state.equipped).length} / 6</div>
        </div>
        <div className="rounded-2xl bg-surface-container-low border border-white/10 p-4">
          <div className="text-xs uppercase tracking-widest text-platinum/50">Rider Level</div>
          <div className="text-3xl font-black mt-2">{playerLevel}</div>
        </div>
      </div>

      <section className="rounded-2xl p-5 bg-violet-950/20 border border-violet-300/15 space-y-3">
        <h2 className="font-headline font-black uppercase tracking-wider text-sm">Active bonuses · current browser combat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <span>Attack <strong className="text-violet-200">+{percentage(bonuses.attackPct)}</strong></span>
          <span>Defense <strong className="text-violet-200">+{percentage(bonuses.defensePct)}</strong></span>
          <span>Crit <strong className="text-violet-200">+{percentage(bonuses.critChancePct)}</strong></span>
          <span>Dodge <strong className="text-violet-200">+{percentage(bonuses.dodgeChancePct)}</strong></span>
        </div>
        <p className="text-xs text-platinum/50">
          Native Unreal powers, characters, animations and mounted abilities still require their authored game assets.
        </p>
      </section>

      <section className={`rounded-3xl border p-5 bg-surface-container-low space-y-4 ${PALETTE_BORDER[state.customization.shroudPalette]}`}>
        <h2 className="text-xl font-headline font-black">YOUR PERSONALIZED RIDER</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CUSTOMIZERS.map(setting => (
            <label key={setting.key} className="block space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-platinum/70">{setting.title}</span>
              <select
                value={state.customization[setting.key]}
                onChange={event => kinftVault.updatePreferences({
                  [setting.key]: event.currentTarget.value,
                } as Partial<KINFTUserPreferences>)}
                className="w-full text-white bg-[#181324] border border-violet-300/30 rounded-xl p-3 text-sm">
                {setting.options.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <span className="text-[11px] leading-4 block text-platinum/40">{setting.description}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-platinum/50">
          Your combat stance changes browser combat now. Other preferences are saved as production contracts
          for the native Unreal customizer; they do not yet change Unreal rendering.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-headline font-black">CUSTOMIZE YOUR LOADOUT</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('ALL')}
            className={`rounded-full px-3 py-2 border text-[11px] font-bold ${filter === 'ALL' ? 'bg-violet-300 text-black' : 'border-white/20 text-platinum/70'}`}>ALL</button>
          {KINDS.map(kind => {
            const Icon = kindIcon[kind];
            return <button key={kind} onClick={() => setFilter(kind)}
              className={`rounded-full px-3 py-2 border text-[11px] font-bold flex items-center gap-1.5 ${filter === kind ? 'bg-violet-300 text-black' : 'border-white/20 text-platinum/70'}`}>
              <Icon size={13} /> {kind}
            </button>;
          })}
        </div>

        {state.items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-violet-300/30 p-10 text-center space-y-3 bg-surface-container-low">
            <Gem size={36} className="mx-auto text-violet-300" />
            <h3 className="font-headline font-bold text-xl">Your first KINFT is waiting</h3>
            <p className="text-platinum/60 max-w-md mx-auto text-sm">
              Win a zone boss for a first-clear KINFT. Every fifth regular victory also grants one.
              Any victory yields Shroud Essence for upgrades. Rewards are earned, not purchased.
            </p>
          </div>
        ) : cards.length === 0 ? (
          <p className="text-platinum/50">No owned KINFTs in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cards.map(({ item, def }) => {
              if (!def) return null;
              const isEquipped = state.equipped[def.kind] === item.id;
              const restricted = playerLevel < def.requiredPlayerLevel;
              const trainCost = kinftVault.trainingCost(item);
              const canTrain = item.level < 20 && state.essence >= trainCost;
              return <article key={item.id}
                className={`rounded-3xl border p-5 bg-gradient-to-br space-y-4 ${RARITY_GRADIENT[def.rarity]}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-[0.25em] font-black">{def.rarity}</span>
                  <span className="text-[11px] opacity-70 uppercase">{def.kind} · Rank {item.level}/20</span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-xl">{def.name}</h3>
                  <p className="mt-2 text-platinum/70 text-xs leading-5">{def.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {def.abilities.map(ability => <span key={ability}
                    className="px-2.5 py-1.5 rounded-full border border-white/15 text-[11px]">{ability}</span>)}
                </div>
                <div className="text-[11px] text-platinum/60">
                  {def.implementation === 'BROWSER_COMBAT'
                    ? 'Playable browser combat bonus'
                    : 'Narrative unlock · Unreal character/ability content pending'}
                </div>
                {restricted && <div className="text-xs text-amber-200 flex items-center gap-2">
                  <LockKeyhole size={14} /> Requires Rider Level {def.requiredPlayerLevel}
                </div>}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    disabled={restricted}
                    onClick={() => isEquipped ? kinftVault.unequip(def.kind) : kinftVault.equip(item.id, playerLevel)}
                    className="px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-xs font-bold disabled:opacity-30">
                    {isEquipped ? <span className="flex items-center justify-center gap-1"><Check size={13}/> EQUIPPED</span> : 'EQUIP'}
                  </button>
                  <button
                    disabled={!canTrain}
                    onClick={() => kinftVault.train(item.id)}
                    className="px-3 py-3 bg-violet-300/20 border border-violet-300/30 rounded-xl text-xs font-bold disabled:opacity-30">
                    {item.level >= 20 ? 'MAX RANK' : `TRAIN · ${trainCost} ESSENCE`}
                  </button>
                </div>
              </article>;
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-headline font-black">RARITY EVOLUTION</h2>
        <div className="flex flex-wrap gap-2">
          {KINFT_RARITIES.map(rarity => <span key={rarity}
            className={`rounded-full px-3 py-2 text-xs font-bold border bg-gradient-to-br ${RARITY_GRADIENT[rarity]}`}>
            {rarity}
          </span>)}
        </div>
        <p className="text-xs text-platinum/50">
          Collectibles unlock content and specializations; they do not replace the Gunslinger's canonical awakening milestones.
          More powerful KINFTs require actual campaign progress and have bounded combat stats.
        </p>
      </section>
    </main>
  );
};
