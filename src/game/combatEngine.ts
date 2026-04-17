import { PlayerState, Enemy, CombatLog, CombatResult } from '../types';
import { Weapon, Entity } from '../types';

const CRIT_CHANCE = 0.15;
const DODGE_CHANCE = 0.08;
const AURA_DAMAGE_BONUS = 0.5;
const AURA_DEF_BONUS = 0.3;

function rollCrit(): boolean {
  return Math.random() < CRIT_CHANCE;
}

function rollDodge(): boolean {
  return Math.random() < DODGE_CHANCE;
}

function calcPlayerDamage(player: PlayerState, auraActive: boolean): {
  damage: number;
  isCrit: boolean;
  abilityUsed: string;
} {
  const weapon = player.equippedWeapon;
  const base = weapon ? weapon.atk : 500;
  // Level scaling
  const levelBonus = 1 + (player.level - 1) * 0.08;
  const auraBonus = auraActive ? (1 + AURA_DAMAGE_BONUS) : 1;
  const crit = rollCrit();
  const critMult = crit ? 2.0 : 1.0;
  const variance = 0.85 + Math.random() * 0.3; // 85-115%

  const damage = Math.floor(base * levelBonus * auraBonus * critMult * variance);
  const abilities = weapon ? ['Primary Strike', 'Charged Shot', 'Precision Burst', 'Overdrive'] : ['Bare-Handed Strike'];
  const abilityUsed = abilities[Math.floor(Math.random() * abilities.length)];

  return { damage, isCrit: crit, abilityUsed };
}

function calcEnemyDamage(enemy: Enemy, playerDef: number, entityDef: number, auraActive: boolean): {
  damage: number;
  dodged: boolean;
  abilityUsed: string;
} {
  if (rollDodge()) {
    return { damage: 0, dodged: true, abilityUsed: '' };
  }

  const totalDef = playerDef + entityDef;
  const defReduction = Math.min(0.75, totalDef / (totalDef + 800));
  const auraDefBonus = auraActive ? AURA_DEF_BONUS : 0;
  const effectiveReduction = Math.min(0.85, defReduction + auraDefBonus);

  const variance = 0.8 + Math.random() * 0.4;
  const rawDamage = Math.floor(enemy.atk * variance);
  const damage = Math.floor(rawDamage * (1 - effectiveReduction));

  const ability = enemy.abilities[Math.floor(Math.random() * enemy.abilities.length)];

  return { damage: Math.max(1, damage), dodged: false, abilityUsed: ability };
}

export interface BattleState {
  playerHp: number;
  enemyHp: number;
  rounds: CombatLog[];
  status: 'ONGOING' | 'PLAYER_WON' | 'PLAYER_LOST';
}

export function runCombatRound(
  battle: BattleState,
  player: PlayerState,
  enemy: Enemy,
  auraActive: boolean
): BattleState {
  const logs: CombatLog[] = [...battle.rounds];
  let { playerHp, enemyHp } = battle;

  // Player attacks
  const playerAtk = calcPlayerDamage(player, auraActive);
  enemyHp = Math.max(0, enemyHp - playerAtk.damage);

  logs.push({
    turn: 'PLAYER',
    message: playerAtk.isCrit
      ? `💥 CRITICAL HIT! ${playerAtk.abilityUsed} — ${playerAtk.damage.toLocaleString()} damage!`
      : `⚔️ ${playerAtk.abilityUsed} — ${playerAtk.damage.toLocaleString()} damage`,
    damage: playerAtk.damage,
    isCrit: playerAtk.isCrit,
  });

  if (enemyHp <= 0) {
    return { playerHp, enemyHp: 0, rounds: logs, status: 'PLAYER_WON' };
  }

  // Enemy attacks back
  const entityDef = player.equippedEntity?.def ?? 0;
  const enemyAtk = calcEnemyDamage(enemy, 0, entityDef, auraActive);

  if (enemyAtk.dodged) {
    logs.push({
      turn: 'ENEMY',
      message: `🌀 Dodged! ${enemy.name} attack evaded`,
      damage: 0,
      isCrit: false,
    });
  } else {
    playerHp = Math.max(0, playerHp - enemyAtk.damage);
    logs.push({
      turn: 'ENEMY',
      message: `💢 ${enemy.name} uses ${enemyAtk.abilityUsed} — ${enemyAtk.damage.toLocaleString()} damage`,
      damage: enemyAtk.damage,
      isCrit: false,
    });
  }

  const status: BattleState['status'] = playerHp <= 0 ? 'PLAYER_LOST' : 'ONGOING';
  return { playerHp, enemyHp, rounds: logs, status };
}

export function calcBattleRewards(
  enemy: Enemy,
  playerLevel: number,
  xpMult: number,
  currMult: number,
  won: boolean
): CombatResult {
  if (!won) {
    return {
      won: false,
      xpGained: Math.floor(20 * xpMult),
      currencyGained: 0,
      damageDealt: 0,
      damageTaken: 0,
      kills: 0,
      loot: null,
    };
  }

  const baseXp = enemy.isBoss ? 300 : 80;
  const baseCurrency = enemy.isBoss ? 200 : 50;
  const levelDiff = Math.max(0.5, 1 + (enemy.def / 500 - playerLevel * 0.05));

  const xpGained = Math.floor(baseXp * xpMult * levelDiff);
  const currencyGained = Math.floor(baseCurrency * currMult * (0.8 + Math.random() * 0.4));

  // Loot drop (15% chance for regular, 60% for boss)
  const lootChance = enemy.isBoss ? 0.6 : 0.15;
  const dropsLoot = Math.random() < lootChance;

  return {
    won: true,
    xpGained,
    currencyGained,
    damageDealt: enemy.maxHp - Math.max(0, enemy.hp),
    damageTaken: 0,
    kills: 1,
    loot: dropsLoot ? null : null, // will be populated by loot system later
  };
}
