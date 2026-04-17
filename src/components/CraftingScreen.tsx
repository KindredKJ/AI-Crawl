import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gameState } from '../game/gameState';
import { MATERIALS, RECIPES, MATERIAL_MAP, RARITY_COLORS, canCraft, getMissingIngredients, CraftRecipe, Rarity } from '../game/lootSystem';
import { PlayerState } from '../types';
import { Hammer, Package, ChevronRight, Check, Lock, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

type FilterType = 'ALL' | 'WEAPON' | 'ARMOR' | 'COMPANION_MOD' | 'CONSUMABLE';
type TabType = 'CRAFT' | 'MATERIALS';

const FILTER_LABELS: Record<FilterType, string> = {
  ALL: 'All',
  WEAPON: '⚔️ Weapons',
  ARMOR: '🛡️ Armor',
  COMPANION_MOD: '🧠 Mods',
  CONSUMABLE: '💊 Consumables',
};

const TYPE_ICONS: Record<string, string> = {
  WEAPON: '⚔️', ARMOR: '🛡️', COMPANION_MOD: '🧠', CONSUMABLE: '💊',
};

export const CraftingScreen: React.FC = () => {
  const [player, setPlayer] = useState<PlayerState>(gameState.get());
  const [tab, setTab] = useState<TabType>('CRAFT');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [craftedId, setCraftedId] = useState<string | null>(null);
  const [craftAnim, setCraftAnim] = useState(false);

  useEffect(() => gameState.subscribe(setPlayer), []);

  const materials = player.inventory.materials ?? {};

  const filtered = RECIPES.filter(r => filter === 'ALL' || r.type === filter);

  const handleCraft = (recipe: CraftRecipe) => {
    if (!canCraft(recipe.id, materials)) return;
    setCraftAnim(true);
    setTimeout(() => {
      // Deduct materials
      const newMaterials = { ...materials };
      recipe.ingredients.forEach(ing => {
        newMaterials[ing.materialId] = (newMaterials[ing.materialId] ?? 0) - ing.qty;
      });
      gameState.update({
        inventory: {
          ...player.inventory,
          materials: newMaterials,
        },
      });
      setCraftedId(recipe.id);
      setCraftAnim(false);
      setTimeout(() => setCraftedId(null), 2500);
    }, 800);
  };

  const totalMaterials = Object.values(materials).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-32 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-gold font-headline font-bold uppercase tracking-[0.4em] text-xs">Fabrication Lab</span>
        <h1 className="text-5xl font-headline font-black text-white mt-2 leading-none">
          CRAFTING<br /><span className="text-platinum/40">TERMINAL</span>
        </h1>
        <p className="text-platinum/40 text-sm mt-3">
          Loot drops from enemies are the raw materials. Craft them into weapons, armor, and mods.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['CRAFT', 'MATERIALS'] as TabType[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("flex-1 py-3 rounded-full font-headline font-black text-xs uppercase tracking-widest transition-all",
              tab === t ? "platinum-shimmer text-surface" : "bg-surface-container-low border border-white/5 text-platinum/40")}>
            {t === 'MATERIALS' ? `Materials (${totalMaterials})` : t}
          </button>
        ))}
      </div>

      {/* ── CRAFT TAB ── */}
      {tab === 'CRAFT' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Filter bar */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(Object.keys(FILTER_LABELS) as FilterType[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("shrink-0 px-4 py-2 rounded-full font-headline font-bold text-xs uppercase tracking-widest transition-all",
                  filter === f ? "bg-teal/20 border border-teal/40 text-teal" : "bg-surface-container-low border border-white/5 text-platinum/40")}>
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>

          {/* Recipes */}
          <div className="space-y-4">
            {filtered.map(recipe => {
              const craftable = canCraft(recipe.id, materials);
              const missing = getMissingIngredients(recipe.id, materials);
              const rarityStyle = RARITY_COLORS[recipe.rarity];
              const justCrafted = craftedId === recipe.id;

              return (
                <motion.div key={recipe.id} layout
                  className={cn("rounded-2xl border p-5 space-y-4 transition-all",
                    justCrafted ? "border-teal bg-teal/10" :
                    craftable ? `${rarityStyle.border} ${rarityStyle.bg}` :
                    "border-white/5 bg-surface-container-low opacity-70")}>

                  {/* Recipe header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("text-3xl w-12 h-12 flex items-center justify-center rounded-xl border", rarityStyle.border, rarityStyle.bg)}>
                        {recipe.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-black text-white text-lg">{recipe.name}</span>
                          <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border", rarityStyle.text, rarityStyle.border, rarityStyle.bg)}>
                            {recipe.rarity}
                          </span>
                        </div>
                        <div className="text-xs text-platinum/40 mt-0.5">{recipe.description}</div>
                      </div>
                    </div>
                    <div className="text-xl">{TYPE_ICONS[recipe.type]}</div>
                  </div>

                  {/* Stat boosts */}
                  <div className="flex flex-wrap gap-2">
                    {recipe.statBoost.atk && (
                      <span className="px-2.5 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold text-xs font-bold">+{recipe.statBoost.atk.toLocaleString()} ATK</span>
                    )}
                    {recipe.statBoost.def && (
                      <span className="px-2.5 py-1 bg-teal/10 border border-teal/20 rounded-full text-teal text-xs font-bold">+{recipe.statBoost.def.toLocaleString()} DEF</span>
                    )}
                    {recipe.statBoost.hp && (
                      <span className="px-2.5 py-1 bg-green-900/30 border border-green-500/20 rounded-full text-green-400 text-xs font-bold">+{recipe.statBoost.hp.toLocaleString()} HP</span>
                    )}
                    {recipe.statBoost.critBonus && (
                      <span className="px-2.5 py-1 bg-red-900/20 border border-red-500/20 rounded-full text-red-400 text-xs font-bold">+{Math.round(recipe.statBoost.critBonus * 100)}% Crit</span>
                    )}
                    {recipe.statBoost.dodgeBonus && (
                      <span className="px-2.5 py-1 bg-purple-900/20 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold">+{Math.round(recipe.statBoost.dodgeBonus * 100)}% Dodge</span>
                    )}
                  </div>

                  {/* Ingredients */}
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-platinum/30 mb-2">Required Materials</div>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.map(ing => {
                        const mat = MATERIAL_MAP[ing.materialId];
                        const have = materials[ing.materialId] ?? 0;
                        const hasEnough = have >= ing.qty;
                        return (
                          <div key={ing.materialId}
                            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold",
                              hasEnough ? `${mat.bgColor} ${mat.borderColor} ${mat.color}` :
                              "bg-red-900/20 border-red-500/20 text-red-400")}>
                            <span>{mat.emoji}</span>
                            <span>{mat.name}</span>
                            <span className={cn("font-black", hasEnough ? "text-white" : "text-red-300")}>
                              {have}/{ing.qty}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flavor */}
                  <div className="text-xs text-platinum/30 italic border-t border-white/5 pt-3">
                    "{recipe.flavorText}"
                  </div>

                  {/* Craft button */}
                  <motion.button
                    whileHover={craftable ? { scale: 1.01 } : {}}
                    whileTap={craftable ? { scale: 0.98 } : {}}
                    onClick={() => handleCraft(recipe)}
                    disabled={!craftable || craftAnim}
                    className={cn(
                      "w-full py-4 rounded-full font-headline font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all",
                      justCrafted ? "bg-teal text-surface" :
                      craftable ? "platinum-shimmer text-surface shadow-[0_8px_24px_rgba(194,199,206,0.2)]" :
                      "bg-surface-container-high border border-white/5 text-platinum/20 cursor-not-allowed"
                    )}>
                    {justCrafted ? (
                      <><Check size={18} /> Crafted!</>
                    ) : craftable ? (
                      <><Hammer size={18} /> Craft Now</>
                    ) : (
                      <><Lock size={16} /> Missing Materials</>
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── MATERIALS TAB ── */}
      {tab === 'MATERIALS' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Group by rarity */}
          {(['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'] as Rarity[]).map(rarity => {
            const rarityMats = MATERIALS.filter(m => m.rarity === rarity);
            const owned = rarityMats.filter(m => (materials[m.id] ?? 0) > 0);
            const unowned = rarityMats.filter(m => (materials[m.id] ?? 0) === 0);
            const style = RARITY_COLORS[rarity];
            return (
              <div key={rarity}>
                <div className={cn("text-[9px] font-bold uppercase tracking-widest mb-3", style.text)}>{rarity}</div>
                <div className="grid grid-cols-1 gap-2">
                  {[...owned, ...unowned].map(mat => {
                    const qty = materials[mat.id] ?? 0;
                    const hasAny = qty > 0;
                    return (
                      <div key={mat.id}
                        className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-all",
                          hasAny ? `${mat.bgColor} ${mat.borderColor}` :
                          "bg-surface-container-low border-white/5 opacity-40")}>
                        <div className={cn("text-2xl w-11 h-11 flex items-center justify-center rounded-xl border", mat.borderColor, mat.bgColor)}>
                          {mat.emoji}
                        </div>
                        <div className="flex-1">
                          <div className={cn("font-headline font-bold text-sm", hasAny ? mat.color : "text-platinum/40")}>
                            {mat.name}
                          </div>
                          <div className="text-[10px] text-platinum/30 mt-0.5">{mat.description}</div>
                          <div className="text-[9px] text-platinum/20 mt-1">
                            Drops from: {mat.dropsFrom.join(', ')}
                          </div>
                        </div>
                        <div className={cn("font-headline font-black text-2xl", hasAny ? mat.color : "text-platinum/20")}>
                          {qty}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Craft flash overlay */}
      <AnimatePresence>
        {craftAnim && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
            style={{ background: 'radial-gradient(circle, rgba(194,199,206,0.15) 0%, transparent 70%)' }}>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}
              className="text-6xl">⚙️</motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
