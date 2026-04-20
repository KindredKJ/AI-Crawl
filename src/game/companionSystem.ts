import { Companion, EnemyTemplate, PlayerState } from '../types';

const STORAGE_KEY = 'ai_crawl_companions';

// Companion passive bonuses based on type
export const TYPE_BONUSES: Record<string, { stat: string; bonus: number; description: string }> = {
  MECHANICAL: { stat: 'def', bonus: 0.12, description: '+12% Defense' },
  DROID:      { stat: 'atk', bonus: 0.10, description: '+10% Attack' },
  DRONE:      { stat: 'dodge', bonus: 0.08, description: '+8% Dodge Chance' },
  BEAST:      { stat: 'atk', bonus: 0.15, description: '+15% Attack' },
  PHANTOM:    { stat: 'crit', bonus: 0.10, description: '+10% Crit Chance' },
  ANOMALY:    { stat: 'xp', bonus: 0.20, description: '+20% XP Gain' },
  CONSTRUCT:  { stat: 'hp', bonus: 0.15, description: '+15% Max HP' },
  HUMANOID:   { stat: 'currency', bonus: 0.25, description: '+25% Currency' },
};

export class CompanionManager {
  private companions: Companion[];
  private activeCompanionId: string | null;
  private listeners: Array<(c: Companion[]) => void> = [];

  constructor() {
    const saved = this.load();
    this.companions = saved.companions;
    this.activeCompanionId = saved.activeId;
  }

  private load(): { companions: Companion[]; activeId: string | null } {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { companions: [], activeId: null };
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      companions: this.companions,
      activeId: this.activeCompanionId,
    }));
  }

  subscribe(fn: (c: Companion[]) => void) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private notify() {
    this.listeners.forEach(fn => fn([...this.companions]));
  }

  getAll(): Companion[] {
    return [...this.companions];
  }

  getActive(): Companion | null {
    return this.companions.find(c => c.id === this.activeCompanionId) ?? null;
  }

  setActive(id: string | null) {
    this.activeCompanionId = id;
    this.save();
    this.notify();
  }

  capture(template: EnemyTemplate, playerLevel: number): Companion {
    const companion: Companion = {
      id: `${template.id}_${Date.now()}`,
      templateId: template.id,
      name: template.name,
      nickname: null,
      type: template.type,
      flavor: template.flavor,
      level: Math.max(1, playerLevel - 1),
      xp: 0,
      xpToNext: 100,
      hp: template.baseHp,
      maxHp: template.baseHp,
      atk: template.baseAtk,
      def: template.baseDef,
      abilities: template.abilities.slice(0, 2), // Start with first 2 abilities
      capturedAt: new Date().toISOString(),
      battlesWon: 0,
      typeBonus: TYPE_BONUSES[template.type] ?? TYPE_BONUSES.MECHANICAL,
    };
    this.companions.push(companion);
    if (!this.activeCompanionId) this.activeCompanionId = companion.id;
    this.save();
    this.notify();
    return companion;
  }

  release(id: string) {
    this.companions = this.companions.filter(c => c.id !== id);
    if (this.activeCompanionId === id) {
      this.activeCompanionId = this.companions[0]?.id ?? null;
    }
    this.save();
    this.notify();
  }

  rename(id: string, nickname: string) {
    this.companions = this.companions.map(c =>
      c.id === id ? { ...c, nickname } : c
    );
    this.save();
    this.notify();
  }

  addXp(id: string, xp: number): { leveledUp: boolean; newLevel: number } {
    let leveledUp = false;
    let newLevel = 0;
    this.companions = this.companions.map(c => {
      if (c.id !== id) return c;
      const newXp = c.xp + xp;
      const didLevel = newXp >= c.xpToNext;
      const level = didLevel ? c.level + 1 : c.level;
      if (didLevel) { leveledUp = true; newLevel = level; }
      // Level up boosts stats
      const hpBoost = didLevel ? Math.floor(c.maxHp * 0.08) : 0;
      const atkBoost = didLevel ? Math.floor(c.atk * 0.06) : 0;
      const defBoost = didLevel ? Math.floor(c.def * 0.05) : 0;
      // Unlock abilities at levels 5, 10, 15
      const newAbilities = didLevel && (level === 5 || level === 10 || level === 15)
        ? [...c.abilities, `Ability Lv${level}`]
        : c.abilities;
      return {
        ...c,
        level,
        xp: didLevel ? newXp - c.xpToNext : newXp,
        xpToNext: didLevel ? Math.floor(c.xpToNext * 1.5) : c.xpToNext,
        maxHp: c.maxHp + hpBoost,
        hp: c.hp + hpBoost,
        atk: c.atk + atkBoost,
        def: c.def + defBoost,
        abilities: newAbilities,
      };
    });
    this.save();
    this.notify();
    return { leveledUp, newLevel };
  }

  recordBattleWin(id: string) {
    this.companions = this.companions.map(c =>
      c.id === id ? { ...c, battlesWon: c.battlesWon + 1 } : c
    );
    this.save();
  }

  loadFromCloud(companions: Companion[], activeId: string | null) {
    this.companions = companions;
    this.activeCompanionId = activeId;
    this.save();
    this.notify();
  }

  reset() {
    this.companions = [];
    this.activeCompanionId = null;
    this.save();
    this.notify();
  }
}

export const companionManager = new CompanionManager();

// ── Capture logic ─────────────────────────────────────────────────────────────

export interface CaptureAttemptResult {
  success: boolean;
  message: string;
  companion?: Companion;
  angryEnemy: boolean; // enemy gets +10% ATK on fail
}

export function attemptCapture(
  template: EnemyTemplate,
  enemyHpPercent: number, // 0-1, lower = easier to catch
  playerLevel: number,
): CaptureAttemptResult {
  // Base rate from template
  const base = template.captureRate;

  // HP modifier: at 10% HP = 2x base, at 100% HP = 0.3x base
  const hpMod = 0.3 + (1 - enemyHpPercent) * 1.7;

  // Level advantage: player higher level = easier
  const levelMod = 1 + Math.min(0.3, (playerLevel - template.tier * 3) * 0.05);

  const finalChance = Math.min(0.95, base * hpMod * levelMod);
  const roll = Math.random();
  const success = roll < finalChance;

  if (success) {
    const companion = companionManager.capture(template, playerLevel);
    return {
      success: true,
      message: `🔮 Capture successful! ${template.name} is now your companion!`,
      companion,
      angryEnemy: false,
    };
  }

  // Failed capture — enemy gets angry
  const pct = Math.round(finalChance * 100);
  return {
    success: false,
    message: `❌ Capture failed (${pct}% chance). ${template.name} is enraged! +10% ATK`,
    angryEnemy: true,
  };
}
