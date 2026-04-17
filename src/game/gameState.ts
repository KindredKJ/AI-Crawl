import { Weapon, Entity, PlayerState, Enemy, CombatLog } from '../types';
import { WEAPONS, ENTITIES } from '../constants';

const STORAGE_KEY = 'ai_crawl_save';

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
  inventory: {
    weapons: [WEAPONS[0]],
    entities: [ENTITIES[0]],
    loot: [],
    materials: {},
  },
  stats: {
    totalKills: 0,
    battlesWon: 0,
    battlesLost: 0,
    damageDealt: 0,
    damageTaken: 0,
    totalCaptures: 0,
  },
  unlockedZones: ['SECTOR_1'],
  activeZone: 'SECTOR_1',
  auraActive: false,
  auraCooldown: 0,
};

export class GameStateManager {
  private state: PlayerState;
  private listeners: Array<(state: PlayerState) => void> = [];

  constructor() {
    this.state = this.load();
  }

  private load(): PlayerState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new fields
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch {
      // corrupt save, reset
    }
    return { ...DEFAULT_STATE };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // storage unavailable
    }
  }

  reset() {
    this.state = { ...DEFAULT_STATE };
    this.save();
    this.notify();
  }

  get(): PlayerState {
    return { ...this.state };
  }

  subscribe(fn: (state: PlayerState) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.get()));
  }

  update(patch: Partial<PlayerState>) {
    this.state = { ...this.state, ...patch };
    this.save();
    this.notify();
  }

  applyBattleResult(result: {
    won: boolean;
    xpGained: number;
    currencyGained: number;
    damageDealt: number;
    damageTaken: number;
    kills: number;
    loot?: Weapon | Entity | null;
  }) {
    const s = this.state;
    const newXp = s.xp + result.xpGained;
    const didLevelUp = newXp >= s.xpToNext;
    const newLevel = didLevelUp ? s.level + 1 : s.level;
    const newXpToNext = didLevelUp ? Math.floor(s.xpToNext * 1.5) : s.xpToNext;
    const leftoverXp = didLevelUp ? newXp - s.xpToNext : newXp;

    const newMaxHp = didLevelUp ? Math.floor(s.maxHp * 1.1) : s.maxHp;
    // Heal 30% on win, take damage on loss
    const hpDelta = result.won
      ? Math.floor(newMaxHp * 0.3)
      : -result.damageTaken;
    const newHp = Math.max(100, Math.min(newMaxHp, s.hp + hpDelta));

    const newInventory = { ...s.inventory, materials: { ...s.inventory.materials } };
    if (result.loot) {
      if ('atk' in result.loot) {
        newInventory.weapons = [...newInventory.weapons, result.loot as Weapon];
      } else {
        newInventory.entities = [...newInventory.entities, result.loot as Entity];
      }
    }
    // Add loot materials
    if (result.lootItems) {
      result.lootItems.forEach((item: { id: string; quantity: number }) => {
        newInventory.materials[item.id] = (newInventory.materials[item.id] ?? 0) + item.quantity;
      });
    }

    this.state = {
      ...s,
      level: newLevel,
      xp: leftoverXp,
      xpToNext: newXpToNext,
      hp: newHp,
      maxHp: newMaxHp,
      currency: s.currency + result.currencyGained,
      inventory: newInventory,
      stats: {
        totalKills: s.stats.totalKills + result.kills,
        battlesWon: s.stats.battlesWon + (result.won ? 1 : 0),
        battlesLost: s.stats.battlesLost + (result.won ? 0 : 1),
        damageDealt: s.stats.damageDealt + result.damageDealt,
        damageTaken: s.stats.damageTaken + result.damageTaken,
        totalCaptures: (s.stats.totalCaptures ?? 0) + (result.captured ? 1 : 0),
      },
    };
    this.save();
    this.notify();

    return { didLevelUp, newLevel };
  }

  activateAura(): boolean {
    if (this.state.auraActive || this.state.auraCooldown > 0) return false;
    this.state = { ...this.state, auraActive: true };
    this.save();
    this.notify();
    return true;
  }

  deactivateAura(cooldownSeconds: number) {
    this.state = { ...this.state, auraActive: false, auraCooldown: cooldownSeconds };
    this.save();
    this.notify();
  }

  tickAuraCooldown() {
    if (this.state.auraCooldown > 0) {
      this.state = { ...this.state, auraCooldown: this.state.auraCooldown - 1 };
      this.notify();
    }
  }

  equipWeapon(weapon: Weapon, slot: 'primary' | 'secondary') {
    if (slot === 'primary') {
      this.state = { ...this.state, equippedWeapon: weapon };
    } else {
      this.state = { ...this.state, equippedSecondary: weapon };
    }
    this.save();
    this.notify();
  }

  equipEntity(entity: Entity) {
    this.state = { ...this.state, equippedEntity: entity };
    this.save();
    this.notify();
  }
}

export const gameState = new GameStateManager();
