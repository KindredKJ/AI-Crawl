// ─────────────────────────────────────────────────────────────────────────────
// LOOT SYSTEM
// Every material is thematically tied to enemy types.
// Every craftable item has a recipe built from those materials.
// ─────────────────────────────────────────────────────────────────────────────

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface LootMaterial {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;          // tailwind text color class
  bgColor: string;        // tailwind bg color class
  borderColor: string;    // tailwind border color class
  rarity: Rarity;
  dropsFrom: string[];    // enemy type strings
}

export interface CraftRecipe {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: 'WEAPON' | 'ARMOR' | 'COMPANION_MOD' | 'CONSUMABLE';
  rarity: Rarity;
  ingredients: { materialId: string; qty: number }[];
  // What the crafted item gives
  statBoost: {
    atk?: number;
    def?: number;
    hp?: number;
    critBonus?: number;
    dodgeBonus?: number;
  };
  flavorText: string;
}

// ── Materials ──────────────────────────────────────────────────────────────────

export const MATERIALS: LootMaterial[] = [
  // MECHANICAL / DROID drops
  {
    id: 'scrap_metal',
    name: 'Scrap Metal',
    description: 'Twisted alloy fragments from destroyed mechs. Surprisingly workable.',
    emoji: '🔩',
    color: 'text-slate-300',
    bgColor: 'bg-slate-800/40',
    borderColor: 'border-slate-500/30',
    rarity: 'Common',
    dropsFrom: ['MECHANICAL', 'DROID'],
  },
  {
    id: 'alloy_plate',
    name: 'Alloy Plate',
    description: 'High-grade reinforced plating stripped from heavy combat units.',
    emoji: '🛡️',
    color: 'text-slate-200',
    bgColor: 'bg-slate-700/40',
    borderColor: 'border-slate-400/30',
    rarity: 'Uncommon',
    dropsFrom: ['MECHANICAL', 'CONSTRUCT'],
  },
  {
    id: 'power_cell',
    name: 'Power Cell',
    description: 'Compact energy cell. Still holds a dangerous charge.',
    emoji: '🔋',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/30',
    borderColor: 'border-yellow-500/30',
    rarity: 'Common',
    dropsFrom: ['DROID', 'DRONE', 'MECHANICAL'],
  },
  {
    id: 'drone_part',
    name: 'Drone Component',
    description: 'Lightweight composite parts from aerial units. Perfect for mobile builds.',
    emoji: '🔧',
    color: 'text-sky-300',
    bgColor: 'bg-sky-900/30',
    borderColor: 'border-sky-500/30',
    rarity: 'Common',
    dropsFrom: ['DRONE'],
  },
  {
    id: 'nano_chip',
    name: 'Nano Chip',
    description: 'A dense lattice of nanoscale processors. Foundation of all advanced tech.',
    emoji: '💾',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/30',
    borderColor: 'border-cyan-500/30',
    rarity: 'Common',
    dropsFrom: ['DRONE', 'MECHANICAL', 'DROID', 'CONSTRUCT'],
  },
  {
    id: 'ai_core',
    name: 'AI Core',
    description: 'The thinking engine of a droid. Warm to the touch. Occasionally beeps.',
    emoji: '🧠',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
    borderColor: 'border-blue-500/30',
    rarity: 'Rare',
    dropsFrom: ['DROID', 'HUMANOID'],
  },
  {
    id: 'neural_chip',
    name: 'Neural Chip',
    description: 'Hyper-dense cognitive matrix. Processes combat data at light speed.',
    emoji: '⚡',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-900/30',
    borderColor: 'border-indigo-500/30',
    rarity: 'Epic',
    dropsFrom: ['HUMANOID', 'DROID'],
  },
  {
    id: 'explosive_core',
    name: 'Explosive Core',
    description: 'Volatile antimatter charge. Handle with extreme caution.',
    emoji: '💥',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/30',
    borderColor: 'border-orange-500/30',
    rarity: 'Uncommon',
    dropsFrom: ['DRONE'],
  },

  // PHANTOM / ANOMALY drops
  {
    id: 'echo_fragment',
    name: 'Echo Fragment',
    description: 'A sliver of crystallized sound. Hums with residual consciousness.',
    emoji: '🔮',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
    borderColor: 'border-purple-500/30',
    rarity: 'Uncommon',
    dropsFrom: ['PHANTOM'],
  },
  {
    id: 'void_shard',
    name: 'Void Shard',
    description: 'A fragment of compressed nothingness. Absorbs light around it.',
    emoji: '🌑',
    color: 'text-violet-400',
    bgColor: 'bg-violet-900/40',
    borderColor: 'border-violet-500/30',
    rarity: 'Rare',
    dropsFrom: ['PHANTOM', 'ANOMALY'],
  },
  {
    id: 'corrupted_data',
    name: 'Corrupted Data',
    description: 'Hostile code given physical form. Rewrites whatever it touches.',
    emoji: '⚠️',
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
    borderColor: 'border-red-500/30',
    rarity: 'Uncommon',
    dropsFrom: ['ANOMALY', 'PHANTOM'],
  },
  {
    id: 'dark_crystal',
    name: 'Dark Crystal',
    description: 'Solidified void energy. Radiates cold that does not register on thermometers.',
    emoji: '💎',
    color: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-900/30',
    borderColor: 'border-fuchsia-500/30',
    rarity: 'Epic',
    dropsFrom: ['PHANTOM', 'ANOMALY'],
  },

  // BEAST / BIO drops
  {
    id: 'bio_sample',
    name: 'Bio Sample',
    description: 'Organic material from bio-mechanical hybrids. Unstable but potent.',
    emoji: '🧬',
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
    borderColor: 'border-green-500/30',
    rarity: 'Common',
    dropsFrom: ['BEAST'],
  },
  {
    id: 'acid_vial',
    name: 'Acid Vial',
    description: 'Contained corrosive secretion. Eats through 4-inch steel in 12 seconds.',
    emoji: '🧪',
    color: 'text-lime-400',
    bgColor: 'bg-lime-900/30',
    borderColor: 'border-lime-500/30',
    rarity: 'Uncommon',
    dropsFrom: ['BEAST'],
  },

  // ENERGY / HIGH TIER drops
  {
    id: 'energy_shard',
    name: 'Energy Shard',
    description: 'Crystallized kinetic energy, sheared from high-voltage entities.',
    emoji: '✨',
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-400/30',
    rarity: 'Uncommon',
    dropsFrom: ['MECHANICAL', 'ANOMALY', 'BEAST'],
  },
  {
    id: 'plasma_cell',
    name: 'Plasma Cell',
    description: 'Superheated matter contained by a magnetic envelope. Extremely volatile.',
    emoji: '🔥',
    color: 'text-orange-300',
    bgColor: 'bg-orange-900/30',
    borderColor: 'border-orange-400/30',
    rarity: 'Rare',
    dropsFrom: ['PHANTOM', 'BEAST', 'MECHANICAL'],
  },
  {
    id: 'fusion_core',
    name: 'Fusion Core',
    description: 'A miniaturized fusion reactor. Powers entire cities. Or one very good weapon.',
    emoji: '☢️',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/30',
    borderColor: 'border-amber-500/30',
    rarity: 'Epic',
    dropsFrom: ['CONSTRUCT', 'MECHANICAL'],
  },
  {
    id: 'quantum_core',
    name: 'Quantum Core',
    description: 'Exists in multiple states simultaneously. The pinnacle of known materials.',
    emoji: '🌀',
    color: 'text-teal-300',
    bgColor: 'bg-teal-900/30',
    borderColor: 'border-teal-500/30',
    rarity: 'Legendary',
    dropsFrom: ['ANOMALY', 'CONSTRUCT', 'BOSS'],
  },
];

// ── Crafting Recipes ───────────────────────────────────────────────────────────

export const RECIPES: CraftRecipe[] = [
  // ── TIER 1 WEAPONS (Common mats) ──────────────────────────────────────────

  {
    id: 'salvage_blade',
    name: 'Salvage Blade',
    description: 'A crude but effective weapon forged from mech debris. Gets the job done.',
    emoji: '🗡️',
    type: 'WEAPON',
    rarity: 'Common',
    ingredients: [
      { materialId: 'scrap_metal', qty: 4 },
      { materialId: 'power_cell', qty: 1 },
    ],
    statBoost: { atk: 300 },
    flavorText: 'Filed down by hand. The edge is rough. So is the enemy.',
  },
  {
    id: 'drone_cannon',
    name: 'Drone Cannon',
    description: 'Repurposed drone propulsion converted into a kinetic launcher.',
    emoji: '🚀',
    type: 'WEAPON',
    rarity: 'Common',
    ingredients: [
      { materialId: 'drone_part', qty: 3 },
      { materialId: 'nano_chip', qty: 2 },
    ],
    statBoost: { atk: 350 },
    flavorText: 'What sends drones flying can send projectiles even faster.',
  },
  {
    id: 'circuit_knuckles',
    name: 'Circuit Knuckles',
    description: 'Electrified gauntlets that deliver a shock with every punch.',
    emoji: '🥊',
    type: 'WEAPON',
    rarity: 'Uncommon',
    ingredients: [
      { materialId: 'nano_chip', qty: 3 },
      { materialId: 'power_cell', qty: 2 },
      { materialId: 'scrap_metal', qty: 2 },
    ],
    statBoost: { atk: 480 },
    flavorText: 'The voltage isn\'t lethal. The punches might be.',
  },

  // ── TIER 2 WEAPONS (Uncommon + Rare mats) ─────────────────────────────────

  {
    id: 'phantom_blade',
    name: 'Phantom Blade',
    description: 'A sword forged from echo fragments. Partially phases through armor on impact.',
    emoji: '👻',
    type: 'WEAPON',
    rarity: 'Rare',
    ingredients: [
      { materialId: 'echo_fragment', qty: 3 },
      { materialId: 'void_shard', qty: 1 },
      { materialId: 'alloy_plate', qty: 2 },
    ],
    statBoost: { atk: 850, critBonus: 0.05 },
    flavorText: 'It doesn\'t cut through armor. It cuts through the idea of armor.',
  },
  {
    id: 'acid_lancer',
    name: 'Acid Lancer',
    description: 'A lance tipped with a corrosive charge from beast vials. Melts shields on contact.',
    emoji: '🧪',
    type: 'WEAPON',
    rarity: 'Rare',
    ingredients: [
      { materialId: 'acid_vial', qty: 3 },
      { materialId: 'bio_sample', qty: 2 },
      { materialId: 'alloy_plate', qty: 2 },
    ],
    statBoost: { atk: 920 },
    flavorText: 'Not elegant. Extremely effective.',
  },
  {
    id: 'plasma_cutter',
    name: 'Plasma Cutter',
    description: 'A superheated blade of contained plasma. Leaves glowing wounds.',
    emoji: '🔥',
    type: 'WEAPON',
    rarity: 'Rare',
    ingredients: [
      { materialId: 'plasma_cell', qty: 2 },
      { materialId: 'energy_shard', qty: 2 },
      { materialId: 'alloy_plate', qty: 1 },
    ],
    statBoost: { atk: 1100 },
    flavorText: 'Burns at 4,000 degrees. The blade never cools.',
  },
  {
    id: 'void_repeater',
    name: 'Void Repeater',
    description: 'A rapid-fire weapon that launches compressed void shards. Each shot removes a piece of reality.',
    emoji: '🌑',
    type: 'WEAPON',
    rarity: 'Epic',
    ingredients: [
      { materialId: 'void_shard', qty: 4 },
      { materialId: 'corrupted_data', qty: 2 },
      { materialId: 'ai_core', qty: 1 },
    ],
    statBoost: { atk: 1600, critBonus: 0.08 },
    flavorText: 'Every shot leaves a small patch of absolute darkness.',
  },
  {
    id: 'explosive_gauntlet',
    name: 'Explosive Gauntlet',
    description: 'A heavy armored fist loaded with micro-detonators harvested from Zip Drones.',
    emoji: '💥',
    type: 'WEAPON',
    rarity: 'Rare',
    ingredients: [
      { materialId: 'explosive_core', qty: 3 },
      { materialId: 'drone_part', qty: 2 },
      { materialId: 'alloy_plate', qty: 2 },
    ],
    statBoost: { atk: 1400 },
    flavorText: 'A punch that registers on seismographs.',
  },

  // ── TIER 3 WEAPONS (Epic mats) ─────────────────────────────────────────────

  {
    id: 'neural_katana',
    name: 'Neural Katana',
    description: 'A blade fused with cognitive matrix tech. Anticipates enemy moves before they happen.',
    emoji: '⚡',
    type: 'WEAPON',
    rarity: 'Epic',
    ingredients: [
      { materialId: 'neural_chip', qty: 2 },
      { materialId: 'ai_core', qty: 3 },
      { materialId: 'void_shard', qty: 2 },
    ],
    statBoost: { atk: 2200, critBonus: 0.12, dodgeBonus: 0.05 },
    flavorText: 'It doesn\'t just cut. It out-thinks.',
  },
  {
    id: 'dark_crystal_cannon',
    name: 'Dark Crystal Cannon',
    description: 'A weapon that fires shards of crystallized void. Each shot warps local spacetime.',
    emoji: '💎',
    type: 'WEAPON',
    rarity: 'Epic',
    ingredients: [
      { materialId: 'dark_crystal', qty: 3 },
      { materialId: 'fusion_core', qty: 1 },
      { materialId: 'corrupted_data', qty: 3 },
    ],
    statBoost: { atk: 2800 },
    flavorText: 'The impact radius includes things that haven\'t happened yet.',
  },
  {
    id: 'fusion_hammer',
    name: 'Fusion Hammer',
    description: 'A massive warhammer with a fusion reactor in its head. Causes nuclear impact on swing.',
    emoji: '☢️',
    type: 'WEAPON',
    rarity: 'Epic',
    ingredients: [
      { materialId: 'fusion_core', qty: 2 },
      { materialId: 'alloy_plate', qty: 4 },
      { materialId: 'energy_shard', qty: 3 },
    ],
    statBoost: { atk: 3200 },
    flavorText: 'The swing takes a second. You feel it a day later.',
  },

  // ── LEGENDARY WEAPONS (Legendary mats) ────────────────────────────────────

  {
    id: 'quantum_annihilator',
    name: 'Quantum Annihilator',
    description: 'Fires projectiles that exist in multiple states simultaneously. Impossible to dodge all of them.',
    emoji: '🌀',
    type: 'WEAPON',
    rarity: 'Legendary',
    ingredients: [
      { materialId: 'quantum_core', qty: 3 },
      { materialId: 'dark_crystal', qty: 2 },
      { materialId: 'neural_chip', qty: 2 },
      { materialId: 'fusion_core', qty: 1 },
    ],
    statBoost: { atk: 4500, critBonus: 0.15, dodgeBonus: 0.05 },
    flavorText: 'Every shot hits. Every single one.',
  },
  {
    id: 'void_sovereign_blade',
    name: 'Void Sovereign Blade',
    description: 'Forged from a fragment of the Void Sovereign itself. The only blade that can cut silence.',
    emoji: '🌑',
    type: 'WEAPON',
    rarity: 'Legendary',
    ingredients: [
      { materialId: 'quantum_core', qty: 2 },
      { materialId: 'dark_crystal', qty: 4 },
      { materialId: 'void_shard', qty: 5 },
    ],
    statBoost: { atk: 5000, critBonus: 0.20 },
    flavorText: 'The blade doesn\'t exist between swings. Neither do its victims.',
  },

  // ── ARMOR / DEFENSE ────────────────────────────────────────────────────────

  {
    id: 'salvage_vest',
    name: 'Salvage Vest',
    description: 'Layered scrap plates hammered into rough body armor. Not pretty. Functional.',
    emoji: '🥼',
    type: 'ARMOR',
    rarity: 'Common',
    ingredients: [
      { materialId: 'scrap_metal', qty: 5 },
      { materialId: 'nano_chip', qty: 1 },
    ],
    statBoost: { def: 200, hp: 500 },
    flavorText: 'Dents easily. Dents in the right direction.',
  },
  {
    id: 'alloy_carapace',
    name: 'Alloy Carapace',
    description: 'Reinforced exo-shell stripped from Behemoth-class units.',
    emoji: '🛡️',
    type: 'ARMOR',
    rarity: 'Rare',
    ingredients: [
      { materialId: 'alloy_plate', qty: 5 },
      { materialId: 'power_cell', qty: 2 },
      { materialId: 'nano_chip', qty: 3 },
    ],
    statBoost: { def: 600, hp: 1200 },
    flavorText: 'Rated for direct cannon fire. Tested personally.',
  },
  {
    id: 'void_shroud',
    name: 'Void Shroud',
    description: 'A cloak woven from echo fragments and void shards. Makes you hard to perceive.',
    emoji: '🌑',
    type: 'ARMOR',
    rarity: 'Epic',
    ingredients: [
      { materialId: 'void_shard', qty: 3 },
      { materialId: 'echo_fragment', qty: 3 },
      { materialId: 'dark_crystal', qty: 1 },
    ],
    statBoost: { def: 400, dodgeBonus: 0.12, hp: 800 },
    flavorText: 'The enemy can\'t hit what it can\'t fully see.',
  },
  {
    id: 'quantum_shell',
    name: 'Quantum Shell',
    description: 'An armor that exists in a superposition of broken and unbroken states. Attacks resolve as partial.',
    emoji: '🌀',
    type: 'ARMOR',
    rarity: 'Legendary',
    ingredients: [
      { materialId: 'quantum_core', qty: 2 },
      { materialId: 'fusion_core', qty: 2 },
      { materialId: 'alloy_plate', qty: 4 },
    ],
    statBoost: { def: 1200, hp: 3000, dodgeBonus: 0.08 },
    flavorText: 'Schrödinger\'s armor. Until it fails, it hasn\'t.',
  },
  {
    id: 'bio_weave_suit',
    name: 'Bio-Weave Suit',
    description: 'Living armor grown from beast tissue. Regenerates slowly between battles.',
    emoji: '🧬',
    type: 'ARMOR',
    rarity: 'Rare',
    ingredients: [
      { materialId: 'bio_sample', qty: 5 },
      { materialId: 'acid_vial', qty: 2 },
      { materialId: 'energy_shard', qty: 2 },
    ],
    statBoost: { def: 500, hp: 2000 },
    flavorText: 'Warm. A little unsettling. Very effective.',
  },

  // ── COMPANION MODS ─────────────────────────────────────────────────────────

  {
    id: 'neural_uplink',
    name: 'Neural Uplink',
    description: 'Hardwires a companion\'s AI directly to your combat system. Reaction time: instant.',
    emoji: '🧠',
    type: 'COMPANION_MOD',
    rarity: 'Rare',
    ingredients: [
      { materialId: 'ai_core', qty: 2 },
      { materialId: 'nano_chip', qty: 3 },
    ],
    statBoost: { critBonus: 0.08 },
    flavorText: 'You think. It acts. Simultaneously.',
  },
  {
    id: 'void_resonator',
    name: 'Void Resonator',
    description: 'Tunes a companion\'s frequency to the void, amplifying its phantom attacks.',
    emoji: '🔮',
    type: 'COMPANION_MOD',
    rarity: 'Epic',
    ingredients: [
      { materialId: 'void_shard', qty: 2 },
      { materialId: 'echo_fragment', qty: 3 },
    ],
    statBoost: { critBonus: 0.15, dodgeBonus: 0.08 },
    flavorText: 'Your companion now strikes from two dimensions at once.',
  },
  {
    id: 'fusion_heart',
    name: 'Fusion Heart',
    description: 'A miniature fusion core implanted into a companion chassis. Dramatically increases output.',
    emoji: '☢️',
    type: 'COMPANION_MOD',
    rarity: 'Epic',
    ingredients: [
      { materialId: 'fusion_core', qty: 1 },
      { materialId: 'alloy_plate', qty: 2 },
      { materialId: 'power_cell', qty: 3 },
    ],
    statBoost: { atk: 800, hp: 1500 },
    flavorText: 'Warning: companion may begin to glow.',
  },

  // ── CONSUMABLES ────────────────────────────────────────────────────────────

  {
    id: 'repair_kit',
    name: 'Repair Kit',
    description: 'Restores 500 HP. Smells like solder and desperation.',
    emoji: '🩹',
    type: 'CONSUMABLE',
    rarity: 'Common',
    ingredients: [
      { materialId: 'scrap_metal', qty: 2 },
      { materialId: 'nano_chip', qty: 1 },
    ],
    statBoost: { hp: 500 },
    flavorText: 'Good enough to get back in the fight.',
  },
  {
    id: 'plasma_stim',
    name: 'Plasma Stim',
    description: 'Injects superheated plasma into the system. Massive temporary ATK boost.',
    emoji: '💉',
    type: 'CONSUMABLE',
    rarity: 'Rare',
    ingredients: [
      { materialId: 'plasma_cell', qty: 1 },
      { materialId: 'bio_sample', qty: 2 },
    ],
    statBoost: { atk: 1000 },
    flavorText: 'It burns going in. That\'s how you know it\'s working.',
  },
  {
    id: 'void_cloak',
    name: 'Void Cloak',
    description: 'Single-use cloak woven from void shards. Guarantees one full dodge.',
    emoji: '🌑',
    type: 'CONSUMABLE',
    rarity: 'Rare',
    ingredients: [
      { materialId: 'void_shard', qty: 2 },
      { materialId: 'echo_fragment', qty: 1 },
    ],
    statBoost: { dodgeBonus: 0.5 },
    flavorText: 'Used once. Remembered forever.',
  },
  {
    id: 'quantum_catalyst',
    name: 'Quantum Catalyst',
    description: 'Temporarily destabilizes local probability fields. Everything crits.',
    emoji: '🌀',
    type: 'CONSUMABLE',
    rarity: 'Legendary',
    ingredients: [
      { materialId: 'quantum_core', qty: 1 },
      { materialId: 'dark_crystal', qty: 1 },
      { materialId: 'energy_shard', qty: 3 },
    ],
    statBoost: { critBonus: 0.5 },
    flavorText: 'Reality\'s off. You\'re on.',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export const MATERIAL_MAP: Record<string, LootMaterial> = Object.fromEntries(
  MATERIALS.map(m => [m.id, m])
);

export const RECIPE_MAP: Record<string, CraftRecipe> = Object.fromEntries(
  RECIPES.map(r => [r.id, r])
);

export const RARITY_COLORS: Record<Rarity, { text: string; bg: string; border: string }> = {
  Common:    { text: 'text-slate-300',  bg: 'bg-slate-800/40',   border: 'border-slate-500/30' },
  Uncommon:  { text: 'text-green-400',  bg: 'bg-green-900/30',   border: 'border-green-500/30' },
  Rare:      { text: 'text-blue-400',   bg: 'bg-blue-900/30',    border: 'border-blue-500/30' },
  Epic:      { text: 'text-purple-400', bg: 'bg-purple-900/30',  border: 'border-purple-500/30' },
  Legendary: { text: 'text-amber-400',  bg: 'bg-amber-900/30',   border: 'border-amber-500/30' },
};

export function canCraft(recipeId: string, inventory: Record<string, number>): boolean {
  const recipe = RECIPE_MAP[recipeId];
  if (!recipe) return false;
  return recipe.ingredients.every(ing => (inventory[ing.materialId] ?? 0) >= ing.qty);
}

export function getMissingIngredients(recipeId: string, inventory: Record<string, number>) {
  const recipe = RECIPE_MAP[recipeId];
  if (!recipe) return [];
  return recipe.ingredients
    .filter(ing => (inventory[ing.materialId] ?? 0) < ing.qty)
    .map(ing => ({
      material: MATERIAL_MAP[ing.materialId],
      have: inventory[ing.materialId] ?? 0,
      need: ing.qty,
    }));
}
