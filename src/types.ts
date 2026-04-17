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

// ---- Game State ----

export interface PlayerStats {
  totalKills: number;
  battlesWon: number;
  battlesLost: number;
  damageDealt: number;
  damageTaken: number;
}

export interface PlayerInventory {
  weapons: Weapon[];
  entities: Entity[];
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

// ---- Combat ----

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  image: string;
  type: 'MECHANICAL' | 'HUMANOID' | 'ANOMALY' | 'BOSS';
  abilities: string[];
  isBoss: boolean;
}

export interface CombatLog {
  turn: 'PLAYER' | 'ENEMY';
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
}
