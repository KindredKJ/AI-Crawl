export interface Weapon {
  id: string;
  name: string;
  description: string;
  atk: number;
  rarity: 'Legendary' | 'Epic' | 'Rare' | 'Common';
  image: string;
  detailedStats: {
    range: string;
    fireRate: string;
    weight: string;
  };
}

export interface Entity {
  id: string;
  name: string;
  description: string;
  def: number;
  type: 'Support' | 'Attack' | 'Defense';
  image: string;
  detailedStats: {
    radius: string;
    recharge: string;
    duration: string;
  };
}

export type GameScreen = 'HUB' | 'MAP' | 'COMBAT' | 'REGISTRY';

// ── Enemy Template (from roster) ─────────────────────────────────────────────

export type EnemyType = 'MECHANICAL' | 'HUMANOID' | 'ANOMALY' | 'DRONE' | 'DROID' | 'BEAST' | 'PHANTOM' | 'CONSTRUCT' | 'BOSS';

export interface EnemyTemplate {
  id: string;
  name: string;
  flavor: string;
  type: EnemyType;
  tier: number;           // 1-5
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  abilities: string[];
  captureRate: number;    // 0-1 base chance
  lootTable: string[];    // item IDs
  xpReward: number;
  currencyReward: number;
}

// ── Live Enemy (in combat) ────────────────────────────────────────────────────

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  image: string;
  type: EnemyType;
  abilities: string[];
  isBoss: boolean;
  templateId?: string;    // links back to EnemyTemplate
  isAngry?: boolean;      // +10% ATK after failed capture
}

// ── Companion ─────────────────────────────────────────────────────────────────

export interface CompanionBonus {
  stat: string;
  bonus: number;
  description: string;
}

export interface Companion {
  id: string;
  templateId: string;
  name: string;
  nickname: string | null;
  type: EnemyType;
  flavor: string;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  abilities: string[];
  capturedAt: string;
  battlesWon: number;
  typeBonus: CompanionBonus;
}

// ── Game State ────────────────────────────────────────────────────────────────

export interface PlayerStats {
  totalKills: number;
  battlesWon: number;
  battlesLost: number;
  damageDealt: number;
  damageTaken: number;
  totalCaptures: number;
}

export interface PlayerInventory {
  weapons: Weapon[];
  entities: Entity[];
  loot: LootItem[];
}

export interface LootItem {
  id: string;
  name: string;
  quantity: number;
}

export interface PlayerState {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  currency: number;
  equippedWeapon: Weapon | null;
  equippedSecondary: Weapon | null;
  equippedEntity: Entity | null;
  inventory: PlayerInventory;
  stats: PlayerStats;
  unlockedZones: string[];
  activeZone: string;
  auraActive: boolean;
  auraCooldown: number;
}

// ── Combat ────────────────────────────────────────────────────────────────────

export interface CombatLog {
  turn: 'PLAYER' | 'ENEMY' | 'SYSTEM';
  message: string;
  damage: number;
  isCrit: boolean;
}

export interface CombatResult {
  won: boolean;
  xpGained: number;
  currencyGained: number;
  damageDealt: number;
  damageTaken: number;
  kills: number;
  loot: Weapon | Entity | null;
  lootItems: LootItem[];
  captured: boolean;
}
