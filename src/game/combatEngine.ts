import { PlayerState, Enemy, CombatLog, CombatResult, EnemyTemplate, LootItem } from '../types';
import { Companion } from '../types';

const BASE_CRIT_CHANCE = 0.15;
const BASE_DODGE_CHANCE = 0.08;
const AURA_DAMAGE_BONUS = 0.5;
const AURA_DEF_BONUS = 0.3;
const ANGRY_ENEMY_BONUS = 0.1;

function rollCrit(bonusChance = 0): boolean {
  return Math.random() < BASE_CRIT_CHANCE + bonusChance;
}

function rollDodge(bonusChance = 0): boolean {
  return Math.random() < BASE_DODGE_CHANCE + bonusChance;
}

function getCompanionBonuses(companion: Companion | null): {
  atkBonus: number;
  defBonus: number;
  critBonus: number;
  dodgeBonus: number;
  xpMult: number;
  currMult: number;
  hpMult: number;
} {
  const base = { atkBonus: 0, defBonus: 0, critBonus: 0, dodgeBonus: 0, xpMult: 1, currMult: 1, hpMult: 1 };
  if (!companion) return base;

  // Flat companion stats
  base.atkBonus += companion.atk * 0.1;  // 10% of companion ATK added to player
  base.defBonus += companion.def * 0.1;

  // Type bonus
  const tb = companion.typeBonus;
  switch (tb.stat) {
    case 'atk':     base.atkBonus += tb.bonus * 1000; break; // multiplier → flat approximation
    case 'def':     base.defBonus += tb.bonus * 500; break;
    case 'crit':    base.critBonus += tb.bonus; break;
    case 'dodge':   base.dodgeBonus += tb.bonus; break;
    case 'xp':      base.xpMult += tb.bonus; break;
    case 'currency': base.currMult += tb.bonus; break;
    case 'hp':      base.hpMult += tb.bonus; break;
  }
  return base;
}

export function calcPlayerDamage(
  player: PlayerState,
  auraActive: boolean,
  companion: Companion | null
): { damage: number; isCrit: boolean; abilityUsed: string } {
  const weapon = player.equippedWeapon;
  const base = weapon ? weapon.atk : 500;
  const cb = getCompanionBonuses(companion);

  const levelBonus = 1 + (player.level - 1) * 0.08;
  const auraBonus = auraActive ? (1 + AURA_DAMAGE_BONUS) : 1;
  const crit = rollCrit(cb.critBonus);
  const critMult = crit ? 2.0 : 1.0;
  const variance = 0.85 + Math.random() * 0.3;

  const damage = Math.floor((base + cb.atkBonus) * levelBonus * auraBonus * critMult * variance);

  const weaponAbilities = ['Primary Strike', 'Charged Shot', 'Precision Burst', 'Overdrive', 'Rapid Fire', 'Power Shot'];
  const abilityUsed = weaponAbilities[Math.floor(Math.random() * weaponAbilities.length)];

  return { damage, isCrit: crit, abilityUsed };
}

export function calcEnemyDamage(
  enemy: Enemy,
  playerDef: number,
  entityDef: number,
  auraActive: boolean,
  companion: Companion | null
): { damage: number; dodged: boolean; abilityUsed: string } {
  const cb = getCompanionBonuses(companion);

  if (rollDodge(cb.dodgeBonus)) {
    return { damage: 0, dodged: true, abilityUsed: '' };
  }

  const totalDef = playerDef + entityDef + cb.defBonus;
  const defReduction = Math.min(0.75, totalDef / (totalDef + 800));
  const auraDefBonus = auraActive ? AURA_DEF_BONUS : 0;
  const effectiveReduction = Math.min(0.85, defReduction + auraDefBonus);

  const angryMult = enemy.isAngry ? (1 + ANGRY_ENEMY_BONUS) : 1;
  const variance = 0.8 + Math.random() * 0.4;
  const rawDamage = Math.floor(enemy.atk * angryMult * variance);
  const damage = Math.floor(rawDamage * (1 - effectiveReduction));

  const ability = enemy.abilities[Math.floor(Math.random() * enemy.abilities.length)];
  return { damage: Math.max(1, damage), dodged: false, abilityUsed: ability };
}

// ── Companion assist attack ───────────────────────────────────────────────────

function companionAssist(companion: Companion | null): { damage: number; message: string } | null {
  if (!companion) return null;
  if (Math.random() > 0.3) return null; // 30% chance to assist each round

  const damage = Math.floor(companion.atk * (0.5 + Math.random() * 0.5));
  const ability = companion.abilities[Math.floor(Math.random() * companion.abilities.length)];
  return { damage, message: `🤝 ${companion.nickname ?? companion.name} uses ${ability} — ${damage.toLocaleString()} bonus damage!` };
}

// ── Battle state ──────────────────────────────────────────────────────────────

export interface BattleState {
  playerHp: number;
  enemyHp: number;
  rounds: CombatLog[];
  status: 'ONGOING' | 'PLAYER_WON' | 'PLAYER_LOST';
  enemyIsAngry: boolean;
}

export function runCombatRound(
  battle: BattleState,
  player: PlayerState,
  enemy: Enemy,
  auraActive: boolean,
  companion: Companion | null,
): BattleState {
  const logs: CombatLog[] = [...battle.rounds];
  let { playerHp, enemyHp, enemyIsAngry } = battle;
  const liveEnemy = enemyIsAngry ? { ...enemy, isAngry: true } : enemy;

  // Player attacks
  const playerAtk = calcPlayerDamage(player, auraActive, companion);
  enemyHp = Math.max(0, enemyHp - playerAtk.damage);
  logs.push({
    turn: 'PLAYER',
    message: playerAtk.isCrit
      ? `💥 CRITICAL HIT! ${playerAtk.abilityUsed} — ${playerAtk.damage.toLocaleString()} dmg!`
      : `⚔️ ${playerAtk.abilityUsed} — ${playerAtk.damage.toLocaleString()} dmg`,
    damage: playerAtk.damage,
    isCrit: playerAtk.isCrit,
  });

  // Companion assist
  if (enemyHp > 0) {
    const assist = companionAssist(companion);
    if (assist) {
      enemyHp = Math.max(0, enemyHp - assist.damage);
      logs.push({ turn: 'SYSTEM', message: assist.message, damage: assist.damage, isCrit: false });
    }
  }

  if (enemyHp <= 0) {
    return { playerHp, enemyHp: 0, rounds: logs, status: 'PLAYER_WON', enemyIsAngry };
  }

  // Enemy attacks back
  const entityDef = player.equippedEntity?.def ?? 0;
  const enemyAtk = calcEnemyDamage(liveEnemy, 0, entityDef, auraActive, companion);

  if (enemyAtk.dodged) {
    logs.push({ turn: 'SYSTEM', message: `🌀 Evaded! ${enemy.name}'s attack missed`, damage: 0, isCrit: false });
  } else {
    playerHp = Math.max(0, playerHp - enemyAtk.damage);
    logs.push({
      turn: 'ENEMY',
      message: `💢 ${enemy.name} — ${enemyAtk.abilityUsed}: ${enemyAtk.damage.toLocaleString()} dmg`,
      damage: enemyAtk.damage,
      isCrit: false,
    });
  }

  const status: BattleState['status'] = playerHp <= 0 ? 'PLAYER_LOST' : 'ONGOING';
  return { playerHp, enemyHp, rounds: logs, status, enemyIsAngry };
}

// ── Rewards ───────────────────────────────────────────────────────────────────

export function calcBattleRewards(
  template: EnemyTemplate,
  playerLevel: number,
  xpMult: number,
  currMult: number,
  companionXpMult: number,
  won: boolean,
): CombatResult & { companionXp: number } {
  if (!won) {
    return { won: false, xpGained: Math.floor(20 * xpMult), currencyGained: 0, damageDealt: 0, damageTaken: 0, kills: 0, loot: null, lootItems: [], captured: false, companionXp: 0 };
  }

  const levelDiff = Math.max(0.5, 1 + (template.tier - Math.ceil(playerLevel / 4)) * 0.15);
  const xpGained = Math.floor(template.xpReward * xpMult * companionXpMult * levelDiff);
  const currencyGained = Math.floor(template.currencyReward * currMult * (0.8 + Math.random() * 0.4));
  const companionXp = Math.floor(xpGained * 0.6);

  // Loot drops
  const lootItems: LootItem[] = [];
  template.lootTable.forEach(itemId => {
    if (Math.random() < 0.6) {
      const existing = lootItems.find(l => l.id === itemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        lootItems.push({ id: itemId, name: formatLootName(itemId), quantity: 1 });
      }
    }
  });

  return { won: true, xpGained, currencyGained, damageDealt: 0, damageTaken: 0, kills: 1, loot: null, lootItems, captured: false, companionXp };
}

function formatLootName(id: string): string {
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Spawn enemy from template ─────────────────────────────────────────────────

const TYPE_IMAGES: Partial<Record<string, string>> = {
  MECHANICAL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp',
  DROID:      'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp',
  DRONE:      'https://lh3.googleusercontent.com/aida-public/AB6AXuCHGV0XRTj5tclke8KczDZOZrQJ8AElYYCYI-xMvGaN2aJOYt_5wBwrEpODKCs-YMyWl3mypjYywWTc7QumvebQgDJbi8k7SzQYCSTvRaYz1yheL8LCqoVCMBTWj3ddsVVcQUEdbTWiuqNu7-lqqBkJ0SbKVKIdWbvc4x7Wu8-9wHBUJyv0Z3IXvE64mRVKDnxKL13kewdmOz2EfUKE3x0TdtyxPogqqmxT_Xo-_rxWhHNSRRsOrMd40RtEiayWNMY_F-bNY4qqUrq6',
  PHANTOM:    'https://lh3.googleusercontent.com/aida-public/AB6AXuCHGV0XRTj5tclke8KczDZOZrQJ8AElYYCYI-xMvGaN2aJOYt_5wBwrEpODKCs-YMyWl3mypjYywWTc7QumvebQgDJbi8k7SzQYCSTvRaYz1yheL8LCqoVCMBTWj3ddsVVcQUEdbTWiuqNu7-lqqBkJ0SbKVKIdWbvc4x7Wu8-9wHBUJyv0Z3IXvE64mRVKDnxKL13kewdmOz2EfUKE3x0TdtyxPogqqmxT_Xo-_rxWhHNSRRsOrMd40RtEiayWNMY_F-bNY4qqUrq6',
  ANOMALY:    'https://lh3.googleusercontent.com/aida-public/AB6AXuCHGV0XRTj5tclke8KczDZOZrQJ8AElYYCYI-xMvGaN2aJOYt_5wBwrEpODKCs-YMyWl3mypjYywWTc7QumvebQgDJbi8k7SzQYCSTvRaYz1yheL8LCqoVCMBTWj3ddsVVcQUEdbTWiuqNu7-lqqBkJ0SbKVKIdWbvc4x7Wu8-9wHBUJyv0Z3IXvE64mRVKDnxKL13kewdmOz2EfUKE3x0TdtyxPogqqmxT_Xo-_rxWhHNSRRsOrMd40RtEiayWNMY_F-bNY4qqUrq6',
  BEAST:      'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp',
  CONSTRUCT:  'https://lh3.googleusercontent.com/aida-public/AB6AXuCHGV0XRTj5tclke8KczDZOZrQJ8AElYYCYI-xMvGaN2aJOYt_5wBwrEpODKCs-YMyWl3mypjYywWTc7QumvebQgDJbi8k7SzQYCSTvRaYz1yheL8LCqoVCMBTWj3ddsVVcQUEdbTWiuqNu7-lqqBkJ0SbKVKIdWbvc4x7Wu8-9wHBUJyv0Z3IXvE64mRVKDnxKL13kewdmOz2EfUKE3x0TdtyxPogqqmxT_Xo-_rxWhHNSRRsOrMd40RtEiayWNMY_F-bNY4qqUrq6',
  HUMANOID:   'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp',
};

export function spawnEnemyFromTemplate(template: EnemyTemplate, levelMult = 1): Enemy {
  return {
    id: template.id,
    name: template.name,
    hp: Math.floor(template.baseHp * levelMult),
    maxHp: Math.floor(template.baseHp * levelMult),
    atk: Math.floor(template.baseAtk * levelMult),
    def: Math.floor(template.baseDef * levelMult),
    image: TYPE_IMAGES[template.type] ?? TYPE_IMAGES.MECHANICAL!,
    type: template.type,
    abilities: template.abilities,
    isBoss: false,
    templateId: template.id,
    isAngry: false,
  };
}
