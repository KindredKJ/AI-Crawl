/**
 * COVENANT//DUST KINFT progression — game-owned, off-chain entitlements.
 *
 * A KINFT is a Kindred in-game collectible with an archetype, rarity, rank,
 * attributes and concrete equip/unlock rules. These LOCAL grants are NOT ERC-721
 * mints, do not establish wallet ownership, and may never be accepted as proof
 * of a payable/tradeable asset. A signed backend receipt + independent chain
 * verification are required before any external mint/binding/transfer.
 */
export const KINFT_RARITIES = [
  'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'OTHERWORLDLY',
] as const;
export type KINFTRarity = typeof KINFT_RARITIES[number];
export type KINFTKind = 'SKILL' | 'CHARACTER' | 'POWER' | 'WEAPON' | 'GEAR' | 'COMPANION';

export interface KINFTCombatBonuses {
  attackPct: number;
  defensePct: number;
  critChancePct: number;
  dodgeChancePct: number;
}

export interface KINFTDefinition {
  id: string;
  name: string;
  kind: KINFTKind;
  rarity: KINFTRarity;
  requiredPlayerLevel: number;
  abilities: readonly string[];
  attributes: Readonly<KINFTCombatBonuses>;
  description: string;
  /** Owning a blueprint does not automatically ship the corresponding UE asset. */
  implementation: 'BROWSER_COMBAT' | 'UNREAL_CONTENT_PENDING';
}

export const KINFT_CATALOG: readonly KINFTDefinition[] = [
  { id: 'shroud-microstructure', name: 'Shroud: First Weave', kind: 'GEAR', rarity: 'COMMON', requiredPlayerLevel: 1,
    abilities: ['Projectile Deflection', 'Guard Weave'], attributes: { attackPct: 0, defensePct: 0.04, critChancePct: 0, dodgeChancePct: 0.01 },
    description: 'The adaptive coat remembers an older form of protection.', implementation: 'BROWSER_COMBAT' },
  { id: 'iron-psalm-ironwork', name: 'Iron Psalm: Frontier Forge', kind: 'WEAPON', rarity: 'UNCOMMON', requiredPlayerLevel: 1,
    abilities: ['Resonant Shot', 'Reactive Cylinder'], attributes: { attackPct: 0.06, defensePct: 0, critChancePct: 0.01, dodgeChancePct: 0 },
    description: 'Your revolver answers words you do not remember.', implementation: 'BROWSER_COMBAT' },
  { id: 'dead-eye-reflex', name: 'Dead Eye: Reflex Echo', kind: 'SKILL', rarity: 'RARE', requiredPlayerLevel: 3,
    abilities: ['Weak-Point Read', 'Ricochet Prediction'], attributes: { attackPct: 0.03, defensePct: 0, critChancePct: 0.035, dodgeChancePct: 0 },
    description: 'A fragment of forgotten ballistic intuition.', implementation: 'BROWSER_COMBAT' },
  { id: 'covenant-sight', name: 'Covenant Sight: Broken Seal', kind: 'POWER', rarity: 'EPIC', requiredPlayerLevel: 8,
    abilities: ['Authority Break', 'Corruption Trace'], attributes: { attackPct: 0.07, defensePct: 0.025, critChancePct: 0, dodgeChancePct: 0 },
    description: 'Detect the signatures claiming a battlefield.', implementation: 'BROWSER_COMBAT' },
  { id: 'engineer-rider', name: 'The Engineer: Rider Accord', kind: 'CHARACTER', rarity: 'LEGENDARY', requiredPlayerLevel: 15,
    abilities: ['System Reversal', 'Machine Intercession'], attributes: { attackPct: 0.025, defensePct: 0.035, critChancePct: 0, dodgeChancePct: 0 },
    description: 'A future Rider allegiance, not yet a playable Unreal character.', implementation: 'UNREAL_CONTENT_PENDING' },
  { id: 'unknown-horse', name: 'Unknown Rider: Mount Bond', kind: 'COMPANION', rarity: 'UNCOMMON', requiredPlayerLevel: 1,
    abilities: ['Collapse Run', 'Impossible Sprint'], attributes: { attackPct: 0, defensePct: 0.025, critChancePct: 0, dodgeChancePct: 0.025 },
    description: 'The horse recognizes a rider it has never met.', implementation: 'UNREAL_CONTENT_PENDING' },
  { id: 'seraph-drive', name: 'Seraph Drive: Ignition', kind: 'POWER', rarity: 'LEGENDARY', requiredPlayerLevel: 20,
    abilities: ['Aerial Burst', 'Biomechanical Acceleration'], attributes: { attackPct: 0.08, defensePct: 0, critChancePct: 0.02, dodgeChancePct: 0 },
    description: 'A mechanical acceleration system with buried origins.', implementation: 'UNREAL_CONTENT_PENDING' },
  { id: 'stratakey-one', name: 'First StrataKey', kind: 'SKILL', rarity: 'OTHERWORLDLY', requiredPlayerLevel: 25,
    abilities: ['Strata Walk', 'Layer Boundary Traverse'], attributes: { attackPct: 0.04, defensePct: 0.04, critChancePct: 0.015, dodgeChancePct: 0.01 },
    description: 'A key to the layers beneath ordinary reality.', implementation: 'UNREAL_CONTENT_PENDING' },
  { id: 'judgment-protocol', name: 'Judgment: Faultline', kind: 'WEAPON', rarity: 'EPIC', requiredPlayerLevel: 10,
    abilities: ['Structural Weakness', 'Breakpoint Shot'], attributes: { attackPct: 0.07, defensePct: 0, critChancePct: 0.025, dodgeChancePct: 0 },
    description: 'The weapon reveals where impossible structures can fail.', implementation: 'BROWSER_COMBAT' },
  { id: 'host-channel', name: 'Host Channel: First Trumpet', kind: 'GEAR', rarity: 'OTHERWORLDLY', requiredPlayerLevel: 30,
    abilities: ['Living Shield', 'Host Resonance'], attributes: { attackPct: 0.035, defensePct: 0.08, critChancePct: 0, dodgeChancePct: 0 },
    description: 'An unfathomable response to a forbidden frequency.', implementation: 'UNREAL_CONTENT_PENDING' },
  { id: 'machine-defector', name: 'The Machine: Broken Possession', kind: 'COMPANION', rarity: 'RARE', requiredPlayerLevel: 5,
    abilities: ['Covering Fire', 'Signal Jamming'], attributes: { attackPct: 0.02, defensePct: 0.035, critChancePct: 0, dodgeChancePct: 0 },
    description: 'A captured machine whose inhabitant is not understood.', implementation: 'UNREAL_CONTENT_PENDING' },
  { id: 'marshal-oath', name: 'Marshal: Unbroken Oath', kind: 'CHARACTER', rarity: 'EPIC', requiredPlayerLevel: 10,
    abilities: ['Last Stand', 'Law of the Frontier'], attributes: { attackPct: 0.03, defensePct: 0.03, critChancePct: 0, dodgeChancePct: 0 },
    description: 'The Marshal is entirely human—and dangerous.', implementation: 'UNREAL_CONTENT_PENDING' },
];

const CATALOG = new Map(KINFT_CATALOG.map(def => [def.id, def]));
const RARITY_COST = [1, 2, 3, 5, 8, 13] as const;
const ZERO: KINFTCombatBonuses = { attackPct: 0, defensePct: 0, critChancePct: 0, dodgeChancePct: 0 };
const STORAGE_KEY = 'ai_crawl_kinft_v1';

export interface KINFTCollectible {
  id: string;
  definitionId: string;
  rarity: KINFTRarity;
  level: number;
  acquiredFrom: string;
  acquiredAt: string;
  state: 'LOCAL_REWARD_UNVERIFIED';
}
export interface KINFTUserPreferences {
  shroudPalette: 'OBSIDIAN' | 'EMBER' | 'SERAPH' | 'VOID';
  combatStance: 'PRECISION' | 'ONSLAUGHT' | 'GUARDIAN';
  cameraShake: 'OFF' | 'SUBTLE' | 'CINEMATIC';
  presentation: 'IMMERSIVE' | 'TACTICAL' | 'ACCESSIBLE';
  effects: 'PERFORMANCE' | 'BALANCED' | 'CINEMATIC';
}
export const DEFAULT_KINFT_PREFERENCES: Readonly<KINFTUserPreferences> = {
  shroudPalette: 'OBSIDIAN',
  combatStance: 'PRECISION',
  cameraShake: 'SUBTLE',
  presentation: 'IMMERSIVE',
  effects: 'BALANCED',
};
const PREFERENCE_OPTIONS: { [K in keyof KINFTUserPreferences]: readonly KINFTUserPreferences[K][] } = {
  shroudPalette: ['OBSIDIAN', 'EMBER', 'SERAPH', 'VOID'],
  combatStance: ['PRECISION', 'ONSLAUGHT', 'GUARDIAN'],
  cameraShake: ['OFF', 'SUBTLE', 'CINEMATIC'],
  presentation: ['IMMERSIVE', 'TACTICAL', 'ACCESSIBLE'],
  effects: ['PERFORMANCE', 'BALANCED', 'CINEMATIC'],
};
export interface KINFTSnapshot {
  schemaVersion: 1;
  items: KINFTCollectible[];
  claimedEvents: string[];
  equipped: Partial<Record<KINFTKind, string>>;
  essence: number;
  customization: KINFTUserPreferences;
}
export interface KINFTVictory {
  eventId: string;
  encounterId: string;
  playerLevel: number;
  totalWins: number;
  boss: boolean;
  won: boolean;
}
export interface KINFTRewardResult {
  essence: number;
  newItem: KINFTCollectible | null;
  alreadyProcessed: boolean;
}

type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
function defaultStorage(): StoragePort | undefined {
  try { return typeof globalThis.localStorage === 'undefined' ? undefined : globalThis.localStorage; }
  catch { return undefined; }
}
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function emptySnapshot(): KINFTSnapshot {
  return { schemaVersion: 1, items: [], claimedEvents: [], equipped: {}, essence: 0, customization: { ...DEFAULT_KINFT_PREFERENCES } };
}
function validEvent(value: string): boolean {
  return typeof value === 'string' && value.length > 0 && value.length <= 160 && /^[A-Za-z0-9._:-]+$/.test(value);
}
function rarityIndex(rarity: KINFTRarity): number { return KINFT_RARITIES.indexOf(rarity); }
function weightedDefinition(eventId: string, playerLevel: number, boss: boolean, kind: KINFTKind): KINFTDefinition {
  const seed = [...eventId].reduce((h, char) => Math.imul(h ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const band = Math.min(5, Math.floor(Math.max(1, playerLevel) / 6) + (boss ? 1 : 0));
  const options = KINFT_CATALOG.filter(def => def.kind === kind && def.requiredPlayerLevel <= playerLevel);
  const candidates = options.filter(def => rarityIndex(def.rarity) <= band);
  const pool = candidates.length > 0 ? candidates : options.length > 0 ? options : KINFT_CATALOG.filter(def => def.requiredPlayerLevel <= playerLevel);
  return pool[seed % pool.length];
}
function sanitizePreferences(value: unknown): KINFTUserPreferences {
  const raw = value && typeof value === 'object' ? value as Partial<KINFTUserPreferences> : {};
  const next = { ...DEFAULT_KINFT_PREFERENCES };
  for (const key of Object.keys(PREFERENCE_OPTIONS) as Array<keyof KINFTUserPreferences>) {
    const proposed = raw[key];
    if (proposed && (PREFERENCE_OPTIONS[key] as readonly string[]).includes(proposed)) {
      // All values are checked against a fixed enum before persistence.
      (next as unknown as Record<string, string>)[key] = proposed;
    }
  }
  return next;
}
function safeLoad(storage?: StoragePort): KINFTSnapshot {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return emptySnapshot();
    const parsed = JSON.parse(raw) as Partial<KINFTSnapshot>;
    if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.items) || !Array.isArray(parsed.claimedEvents)) return emptySnapshot();
    const items = parsed.items.filter((item): item is KINFTCollectible =>
      item && typeof item.id === 'string' && CATALOG.has(item.definitionId) &&
      item.state === 'LOCAL_REWARD_UNVERIFIED' &&
      item.rarity === CATALOG.get(item.definitionId)?.rarity &&
      Number.isInteger(item.level) && item.level >= 1 && item.level <= 20 &&
      typeof item.acquiredFrom === 'string' && typeof item.acquiredAt === 'string');
    const equipped: KINFTSnapshot['equipped'] = {};
    for (const [kind, id] of Object.entries(parsed.equipped ?? {})) {
      const item = items.find(found => found.id === id);
      if (item && CATALOG.get(item.definitionId)?.kind === kind) equipped[kind as KINFTKind] = id;
    }
    return {
      schemaVersion: 1,
      items: items.slice(0, 500),
      claimedEvents: parsed.claimedEvents.filter((id): id is string => validEvent(id)).slice(-5000),
      equipped,
      essence: Number.isSafeInteger(parsed.essence) ? Math.min(Math.max(0, parsed.essence as number), 1_000_000) : 0,
      customization: sanitizePreferences(parsed.customization),
    };
  } catch { return emptySnapshot(); }
}

export class KINFTVault {
  private data: KINFTSnapshot;
  private listeners = new Set<() => void>();
  constructor(private readonly storage: StoragePort | undefined = defaultStorage()) {
    this.data = safeLoad(storage);
  }
  get(): KINFTSnapshot { return clone(this.data); }
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  private persist(): void {
    try { this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.data)); }
    catch { /* usable local progress even when browser storage is restricted */ }
    for (const listener of this.listeners) listener();
  }
  awardVictory(result: KINFTVictory): KINFTRewardResult {
    if (!result.won || !validEvent(result.eventId) || !validEvent(result.encounterId)
      || !Number.isInteger(result.playerLevel) || result.playerLevel < 1
      || !Number.isSafeInteger(result.totalWins) || result.totalWins < 1) {
      return { essence: 0, newItem: null, alreadyProcessed: false };
    }
    if (this.data.claimedEvents.includes(result.eventId)) return { essence: 0, newItem: null, alreadyProcessed: true };
    const essence = result.boss ? 8 : 2;
    this.data.essence = Math.min(1_000_000, this.data.essence + essence);
    this.data.claimedEvents.push(result.eventId);
    this.data.claimedEvents = this.data.claimedEvents.slice(-5000);
    const rewardEvent = result.boss
      ? `boss-first-clear:${result.encounterId}`
      : result.totalWins % 5 === 0 ? `fifth-victory:${result.totalWins}` : null;
    let newItem: KINFTCollectible | null = null;
    if (rewardEvent && !this.data.claimedEvents.includes(rewardEvent)) {
      this.data.claimedEvents.push(rewardEvent);
      const types: KINFTKind[] = ['SKILL', 'GEAR', 'WEAPON', 'COMPANION', 'POWER', 'CHARACTER'];
      const kind = result.boss
        ? types[Math.min(5, Math.floor((result.playerLevel - 1) / 5))]
        : types[Math.floor(result.totalWins / 5 - 1) % types.length];
      const def = weightedDefinition(rewardEvent, result.playerLevel, result.boss, kind);
      newItem = {
        id: `KINFT:${rewardEvent}:${def.id}`,
        definitionId: def.id, rarity: def.rarity,
        level: 1, acquiredFrom: rewardEvent, acquiredAt: new Date().toISOString(),
        state: 'LOCAL_REWARD_UNVERIFIED'
      };
      this.data.items.push(newItem);
    }
    this.persist();
    return { essence, newItem: newItem ? clone(newItem) : null, alreadyProcessed: false };
  }
  equip(id: string, playerLevel: number): boolean {
    const item = this.data.items.find(owned => owned.id === id);
    if (!item) return false;
    const def = CATALOG.get(item.definitionId);
    if (!def || playerLevel < def.requiredPlayerLevel) return false;
    this.data.equipped[def.kind] = id;
    this.persist();
    return true;
  }
  unequip(kind: KINFTKind): void {
    delete this.data.equipped[kind];
    this.persist();
  }
  updatePreferences(patch: Partial<KINFTUserPreferences>): void {
    this.data.customization = sanitizePreferences({ ...this.data.customization, ...patch });
    this.persist();
  }
  train(id: string): boolean {
    const item = this.data.items.find(owned => owned.id === id);
    if (!item || item.level >= 20) return false;
    const cost = this.trainingCost(item);
    if (this.data.essence < cost) return false;
    this.data.essence -= cost;
    item.level += 1;
    this.persist();
    return true;
  }
  trainingCost(item: KINFTCollectible): number {
    return (item.level + 1) * 3 * RARITY_COST[rarityIndex(item.rarity)];
  }
  combatBonuses(): KINFTCombatBonuses {
    const sums: KINFTCombatBonuses = { ...ZERO };
    for (const id of Object.values(this.data.equipped)) {
      const item = this.data.items.find(owned => owned.id === id);
      if (!item) continue;
      const def = CATALOG.get(item.definitionId);
      if (!def || def.implementation !== 'BROWSER_COMBAT') continue;
      const scale = 1 + (item.level - 1) * 0.025;
      for (const key of Object.keys(sums) as Array<keyof KINFTCombatBonuses>) sums[key] += def.attributes[key] * scale;
    }
    // Combat stances offer bounded, reversible playstyle tradeoffs.
    switch (this.data.customization.combatStance) {
      case 'PRECISION': sums.critChancePct += 0.015; sums.attackPct -= 0.02; break;
      case 'ONSLAUGHT': sums.attackPct += 0.04; sums.defensePct -= 0.03; break;
      case 'GUARDIAN': sums.defensePct += 0.04; sums.attackPct -= 0.025; break;
    }
    // Balanced caps prevent collectibles becoming uncapped pay-for-power.
    sums.attackPct = Math.max(-0.05, Math.min(0.30, sums.attackPct));
    sums.defensePct = Math.max(-0.05, Math.min(0.25, sums.defensePct));
    sums.critChancePct = Math.min(0.15, sums.critChancePct);
    sums.dodgeChancePct = Math.min(0.15, sums.dodgeChancePct);
    return sums;
  }
}

export const kinftVault = new KINFTVault();
