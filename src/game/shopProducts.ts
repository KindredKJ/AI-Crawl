// ── AI Crawl — Shop Products ──────────────────────────────────────────────────
// Philosophy: free-to-play feels fair. Small boosts only. Big value only at $20+.
// Nothing is pay-to-win — all items are also earnable in-game, just slower.

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  emoji: string;
  priceUsd: number;       // display price
  stripePriceId: string;  // set after creating Stripe prices
  category: 'booster' | 'bundle' | 'cosmetic' | 'currency';
  rewards: ShopReward[];
  badge?: string;         // "BEST VALUE" | "POPULAR" | "LIMITED"
  accentColor: string;
}

export interface ShopReward {
  type: 'currency' | 'captures' | 'xp_boost' | 'craft_mats' | 'weapon_crate' | 'entity_crate' | 'hp_restore' | 'aura_charge' | 'premium_capture';
  amount: number;
  label: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOSTERS — $0.99–$2.99 — small, impulse buys
// ─────────────────────────────────────────────────────────────────────────────
export const BOOSTERS: ShopProduct[] = [
  {
    id: 'boost_credits_sm',
    name: 'Data Chip',
    description: 'A small burst of in-game credits to keep you going.',
    emoji: '💾',
    priceUsd: 0.99,
    stripePriceId: '',
    category: 'currency',
    rewards: [{ type: 'currency', amount: 1000, label: '+1,000 Credits' }],
    accentColor: '#4ade80',
  },
  {
    id: 'boost_capture',
    name: 'Capture Booster',
    description: '+50% capture rate for your next 10 battles.',
    emoji: '🎯',
    priceUsd: 0.99,
    stripePriceId: '',
    category: 'booster',
    rewards: [{ type: 'captures', amount: 10, label: '10× Boosted Captures' }],
    accentColor: '#60a5fa',
  },
  {
    id: 'boost_xp',
    name: 'XP Surge',
    description: '2× XP for your next 5 battles. Level up faster.',
    emoji: '⚡',
    priceUsd: 0.99,
    stripePriceId: '',
    category: 'booster',
    rewards: [{ type: 'xp_boost', amount: 5, label: '2× XP for 5 battles' }],
    accentColor: '#facc15',
  },
  {
    id: 'boost_hp',
    name: 'Emergency Repair',
    description: 'Fully restore your HP right now.',
    emoji: '🔋',
    priceUsd: 0.99,
    stripePriceId: '',
    category: 'booster',
    rewards: [{ type: 'hp_restore', amount: 100, label: 'Full HP Restore' }],
    accentColor: '#f87171',
  },
  {
    id: 'boost_credits_md',
    name: 'Neural Cache',
    description: 'A decent stack of credits for crafting and upgrades.',
    emoji: '🧠',
    priceUsd: 1.99,
    stripePriceId: '',
    category: 'currency',
    rewards: [{ type: 'currency', amount: 2500, label: '+2,500 Credits' }],
    accentColor: '#a78bfa',
  },
  {
    id: 'boost_aura',
    name: 'Aura Charge',
    description: '3 instant Aura activations, no cooldown.',
    emoji: '🌀',
    priceUsd: 1.99,
    stripePriceId: '',
    category: 'booster',
    rewards: [{ type: 'aura_charge', amount: 3, label: '3 Aura Charges' }],
    accentColor: '#2dd4bf',
  },
  {
    id: 'boost_mats',
    name: 'Scrap Haul',
    description: 'A random assortment of crafting materials.',
    emoji: '⚙️',
    priceUsd: 1.99,
    stripePriceId: '',
    category: 'booster',
    rewards: [{ type: 'craft_mats', amount: 20, label: '20 Random Crafting Mats' }],
    accentColor: '#fb923c',
  },
  {
    id: 'boost_premium_capture',
    name: 'Prime Capture Node',
    description: 'Guaranteed capture on your next target, any rarity.',
    emoji: '💠',
    priceUsd: 2.99,
    stripePriceId: '',
    category: 'booster',
    rewards: [{ type: 'premium_capture', amount: 1, label: '1 Guaranteed Capture' }],
    accentColor: '#e879f9',
    badge: 'POPULAR',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BUNDLES — $4.99–$19.99 — value scales with price
// ─────────────────────────────────────────────────────────────────────────────
export const BUNDLES: ShopProduct[] = [
  {
    id: 'bundle_starter',
    name: 'Starter Kit',
    description: 'Everything you need to hit the ground running.',
    emoji: '🚀',
    priceUsd: 4.99,
    stripePriceId: '',
    category: 'bundle',
    rewards: [
      { type: 'currency', amount: 3000, label: '+3,000 Credits' },
      { type: 'captures', amount: 5, label: '5× Boosted Captures' },
      { type: 'hp_restore', amount: 100, label: 'Full HP Restore' },
      { type: 'xp_boost', amount: 3, label: '2× XP for 3 battles' },
    ],
    accentColor: '#34d399',
  },
  {
    id: 'bundle_hunter',
    name: 'Entity Hunter Pack',
    description: 'Built for collectors. Maximize your companion roster.',
    emoji: '🕸️',
    priceUsd: 7.99,
    stripePriceId: '',
    category: 'bundle',
    badge: 'POPULAR',
    rewards: [
      { type: 'premium_capture', amount: 3, label: '3 Guaranteed Captures' },
      { type: 'captures', amount: 15, label: '15× Boosted Captures' },
      { type: 'entity_crate', amount: 1, label: '1 Rare Entity Crate' },
      { type: 'currency', amount: 2000, label: '+2,000 Credits' },
    ],
    accentColor: '#60a5fa',
  },
  {
    id: 'bundle_crafter',
    name: 'Forge Master Bundle',
    description: 'Craft legendary gear without the grind.',
    emoji: '🔨',
    priceUsd: 7.99,
    stripePriceId: '',
    category: 'bundle',
    rewards: [
      { type: 'craft_mats', amount: 60, label: '60 Crafting Materials' },
      { type: 'weapon_crate', amount: 1, label: '1 Rare Weapon Crate' },
      { type: 'currency', amount: 2500, label: '+2,500 Credits' },
    ],
    accentColor: '#fb923c',
  },
  {
    id: 'bundle_power',
    name: 'Power Surge Pack',
    description: 'Dominate the Nexus. Max XP and battle bonuses.',
    emoji: '💥',
    priceUsd: 9.99,
    stripePriceId: '',
    category: 'bundle',
    rewards: [
      { type: 'xp_boost', amount: 20, label: '2× XP for 20 battles' },
      { type: 'aura_charge', amount: 5, label: '5 Aura Charges' },
      { type: 'currency', amount: 5000, label: '+5,000 Credits' },
      { type: 'hp_restore', amount: 100, label: 'Full HP Restore' },
    ],
    accentColor: '#facc15',
  },
  {
    id: 'bundle_mega',
    name: 'Nexus Arsenal',
    description: 'The ultimate loadout. Serious players only.',
    emoji: '🏆',
    priceUsd: 14.99,
    stripePriceId: '',
    category: 'bundle',
    badge: 'BEST VALUE',
    rewards: [
      { type: 'currency', amount: 15000, label: '+15,000 Credits' },
      { type: 'premium_capture', amount: 5, label: '5 Guaranteed Captures' },
      { type: 'weapon_crate', amount: 2, label: '2 Rare Weapon Crates' },
      { type: 'entity_crate', amount: 2, label: '2 Rare Entity Crates' },
      { type: 'craft_mats', amount: 80, label: '80 Crafting Materials' },
      { type: 'xp_boost', amount: 15, label: '2× XP for 15 battles' },
      { type: 'aura_charge', amount: 8, label: '8 Aura Charges' },
    ],
    accentColor: '#e879f9',
  },
  {
    id: 'bundle_founder',
    name: 'Founder\'s Vault',
    description: 'For those who want it all. Maximum value, one time.',
    emoji: '👑',
    priceUsd: 19.99,
    stripePriceId: '',
    category: 'bundle',
    badge: 'BEST VALUE',
    rewards: [
      { type: 'currency', amount: 30000, label: '+30,000 Credits' },
      { type: 'premium_capture', amount: 10, label: '10 Guaranteed Captures' },
      { type: 'weapon_crate', amount: 3, label: '3 Legendary Weapon Crates' },
      { type: 'entity_crate', amount: 3, label: '3 Legendary Entity Crates' },
      { type: 'craft_mats', amount: 150, label: '150 Crafting Materials' },
      { type: 'xp_boost', amount: 30, label: '2× XP for 30 battles' },
      { type: 'aura_charge', amount: 15, label: '15 Aura Charges' },
    ],
    accentColor: '#fbbf24',
  },
];

export const ALL_PRODUCTS = [...BOOSTERS, ...BUNDLES];

// ─────────────────────────────────────────────────────────────────────────────
// AD DEAL — shown after combat when player is low on a resource
// ─────────────────────────────────────────────────────────────────────────────
export interface AdDeal {
  id: string;
  headline: string;
  subline: string;
  emoji: string;
  reward: ShopReward;
  linkedProductId: string; // "Buy more" links to this product
}

export const AD_DEALS: AdDeal[] = [
  {
    id: 'ad_credits',
    headline: 'Running Low?',
    subline: 'Watch a quick ad — get 200 free credits instantly.',
    emoji: '💾',
    reward: { type: 'currency', amount: 200, label: '+200 Credits' },
    linkedProductId: 'boost_credits_sm',
  },
  {
    id: 'ad_hp',
    headline: 'Barely Survived?',
    subline: 'Watch a quick ad — restore 25% HP for free.',
    emoji: '🔋',
    reward: { type: 'hp_restore', amount: 25, label: '+25% HP' },
    linkedProductId: 'boost_hp',
  },
  {
    id: 'ad_capture',
    headline: 'Almost Had It!',
    subline: 'Watch a quick ad — get a boosted capture for your next battle.',
    emoji: '🎯',
    reward: { type: 'captures', amount: 1, label: '1 Boosted Capture' },
    linkedProductId: 'boost_capture',
  },
  {
    id: 'ad_xp',
    headline: 'So Close to Level Up!',
    subline: 'Watch a quick ad — get 2× XP next battle.',
    emoji: '⚡',
    reward: { type: 'xp_boost', amount: 1, label: '2× XP next battle' },
    linkedProductId: 'boost_xp',
  },
];
