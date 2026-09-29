import type { Weapon, Entity, PlayerState, CombatResult } from '../types';
import { WEAPONS, ENTITIES } from '../constants';

const STORAGE_KEY = 'ai_crawl_save';

type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;

const DEFAULT_STATE: PlayerState = {
  name: 'UNIT-01',
  level: 1,
  xp: 0,
  xpToNext: 100,
  hp: 1000,
  maxHp: 1000,
  currency: 500,
  equippedWeapon: WEAPONS[0],
  equippedSecondary: null,
  equippedEntity: ENTITIES[0],
  inventory: { weapons: [WEAPONS[0]], entities: [ENTITIES[0]], loot: [], materials: {} },
  stats: { totalKills: 0, battlesWon: 0, battlesLost: 0, damageDealt: 0, damageTaken: 0, totalCaptures: 0 },
  unlockedZones: ['SECTOR_1'],
  activeZone: 'SECTOR_1',
  auraActive: false,
  auraCooldown: 0,
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function browserStorage(): StoragePort | undefined {
  try {
    return typeof globalThis.localStorage === 'undefined' ? undefined : globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function finite(value: unknown, fallback: number, min = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(min, value) : fallback;
}

function sanitizeState(value: unknown): PlayerState {
  const raw = value && typeof value === 'object' ? value as Partial<PlayerState> : {};
  const inventory = raw.inventory && typeof raw.inventory === 'object' ? raw.inventory : {};
  const stats = raw.stats && typeof raw.stats === 'object' ? raw.stats : {};
  const merged = {
    ...clone(DEFAULT_STATE),
    ...raw,
    inventory: {
      ...clone(DEFAULT_STATE.inventory),
      ...inventory,
      weapons: Array.isArray(inventory.weapons) ? inventory.weapons : clone(DEFAULT_STATE.inventory.weapons),
      entities: Array.isArray(inventory.entities) ? inventory.entities : clone(DEFAULT_STATE.inventory.entities),
      loot: Array.isArray(inventory.loot) ? inventory.loot : [],
      materials: inventory.materials && typeof inventory.materials === 'object' && !Array.isArray(inventory.materials)
        ? inventory.materials : {},
    },
    stats: { ...DEFAULT_STATE.stats, ...stats },
    unlockedZones: Array.isArray(raw.unlockedZones) ? raw.unlockedZones.filter((zone): zone is string => typeof zone === 'string') : ['SECTOR_1'],
  } as PlayerState;

  merged.name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.slice(0, 40) : DEFAULT_STATE.name;
  merged.level = Math.floor(finite(raw.level, 1, 1));
  merged.xp = finite(raw.xp, 0);
  merged.xpToNext = finite(raw.xpToNext, 100, 1);
  merged.maxHp = finite(raw.maxHp, 1000, 1);
  merged.hp = Math.min(merged.maxHp, finite(raw.hp, merged.maxHp));
  merged.currency = finite(raw.currency, 0);
  merged.auraActive = raw.auraActive === true;
  merged.auraCooldown = finite(raw.auraCooldown, 0);
  merged.activeZone = typeof raw.activeZone === 'string' ? raw.activeZone : 'SECTOR_1';
  for (const key of ['totalKills', 'battlesWon', 'battlesLost', 'damageDealt', 'damageTaken', 'totalCaptures'] as const) {
    merged.stats[key] = finite(stats[key], 0);
  }
  for (const [id, quantity] of Object.entries(merged.inventory.materials)) {
    if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity < 0) delete merged.inventory.materials[id];
  }
  return merged;
}

export class GameStateManager {
  private state: PlayerState;
  private listeners: Array<(state: PlayerState) => void> = [];
  private readonly storage?: StoragePort;

  constructor(storage: StoragePort | undefined = browserStorage()) {
    this.storage = storage;
    this.state = this.load();
  }

  private load(): PlayerState {
    try {
      const saved = this.storage?.getItem(STORAGE_KEY);
      if (saved) return sanitizeState(JSON.parse(saved));
    } catch {
      // Keep a valid fresh profile when storage is blocked or the save is corrupt.
    }
    return clone(DEFAULT_STATE);
  }

  save(): void {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Gameplay remains available when browser storage is full or unavailable.
    }
  }

  reset(): void {
    this.state = clone(DEFAULT_STATE);
    this.save();
    this.notify();
  }

  get(): PlayerState {
    return clone(this.state);
  }

  subscribe(fn: (state: PlayerState) => void): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(listener => listener !== fn); };
  }

  private notify(): void {
    for (const listener of [...this.listeners]) {
      try {
        listener(this.get());
      } catch (error) {
        // A broken UI subscriber must not interrupt gameplay state changes.
        console.error('[GameState] Subscriber failed:', error);
      }
    }
  }

  update(patch: Partial<PlayerState>): void {
    this.state = sanitizeState({
      ...this.state,
      ...patch,
      inventory: patch.inventory ? { ...this.state.inventory, ...patch.inventory } : this.state.inventory,
      stats: patch.stats ? { ...this.state.stats, ...patch.stats } : this.state.stats,
    });
    this.save();
    this.notify();
  }

  applyBattleResult(result: CombatResult): { didLevelUp: boolean; newLevel: number } {
    const s = this.state;
    const gainedXp = finite(result.xpGained, 0);
    let level = s.level;
    let xpToNext = s.xpToNext;
    let maxHp = s.maxHp;
    let xp = s.xp + gainedXp;
    let didLevelUp = false;

    while (xp >= xpToNext && level < 9999) {
      xp -= xpToNext;
      level += 1;
      xpToNext = Math.max(xpToNext + 1, Math.floor(xpToNext * 1.5));
      maxHp = Math.floor(maxHp * 1.1);
      didLevelUp = true;
    }

    const hpDelta = result.won ? Math.floor(maxHp * 0.3) : -finite(result.damageTaken, 0);
    const inventory = clone(s.inventory);
    if (result.loot) {
      if ('atk' in result.loot) inventory.weapons.push(result.loot as Weapon);
      else inventory.entities.push(result.loot as Entity);
    }
    for (const item of result.lootItems ?? []) {
      if (item && typeof item.id === 'string' && Number.isFinite(item.quantity) && item.quantity > 0) {
        inventory.materials[item.id] = (inventory.materials[item.id] ?? 0) + item.quantity;
      }
    }

    this.state = sanitizeState({
      ...s,
      level,
      xp,
      xpToNext,
      maxHp,
      hp: Math.max(100, Math.min(maxHp, s.hp + hpDelta)),
      currency: s.currency + finite(result.currencyGained, 0),
      inventory,
      stats: {
        totalKills: s.stats.totalKills + finite(result.kills, 0),
        battlesWon: s.stats.battlesWon + (result.won ? 1 : 0),
        battlesLost: s.stats.battlesLost + (result.won ? 0 : 1),
        damageDealt: s.stats.damageDealt + finite(result.damageDealt, 0),
        damageTaken: s.stats.damageTaken + finite(result.damageTaken, 0),
        totalCaptures: s.stats.totalCaptures + (result.captured ? 1 : 0),
      },
    });
    this.save();
    this.notify();
    return { didLevelUp, newLevel: level };
  }

  activateAura(): boolean {
    if (this.state.auraActive || this.state.auraCooldown > 0) return false;
    this.state = { ...this.state, auraActive: true };
    this.save();
    this.notify();
    return true;
  }

  deactivateAura(cooldownSeconds: number): void {
    this.state = { ...this.state, auraActive: false, auraCooldown: finite(cooldownSeconds, 0) };
    this.save();
    this.notify();
  }

  tickAuraCooldown(): void {
    if (this.state.auraCooldown > 0) {
      this.state = { ...this.state, auraCooldown: this.state.auraCooldown - 1 };
      this.save();
      this.notify();
    }
  }

  equipWeapon(weapon: Weapon, slot: 'primary' | 'secondary'): void {
    this.state = slot === 'primary'
      ? { ...this.state, equippedWeapon: weapon }
      : { ...this.state, equippedSecondary: weapon };
    this.save();
    this.notify();
  }

  equipEntity(entity: Entity): void {
    this.state = { ...this.state, equippedEntity: entity };
    this.save();
    this.notify();
  }
}

export const gameState = new GameStateManager();
