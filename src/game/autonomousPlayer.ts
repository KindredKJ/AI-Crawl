/**
 * Kindred AI Crawl Autonomous Player v1.
 * Open, dependency-free utility agent with deterministic lookahead and bounded
 * contextual bandit memory. NO external effects or sovereign world authority.
 */
import { CLUES, type CampaignState, type CampaignEvent, type Action, type Tactic } from './covenantDust';
import { takeWaveTurn, type CombatMove, type WaveBattle } from './covenantDustCombat';

export const PILOT_SCHEMA = 'kindred.ai-crawl.autoplayer/v1' as const;
export type PilotStyle = 'BALANCED' | 'CINEMATIC' | 'SURVIVAL' | 'EXPLORER';
export type PilotMemory = Readonly<Record<string, Readonly<{ visits: number; meanReward: number }>>>;
export type PilotIntent =
  | Readonly<{ kind: 'CAMPAIGN'; action: Action; fields?: Partial<CampaignEvent>; reason: string; cue: string }>
  | Readonly<{ kind: 'COMBAT'; action: CombatMove; tactic: Tactic; reason: string; cue: string; projected: WaveBattle; context: string }>
  | Readonly<{ kind: 'RETRY'; reason: string; cue: string }>
  | Readonly<{ kind: 'STOP'; reason: string; cue: string }>;

const MOVES: readonly CombatMove[] = ['SHROUD_BLOCK','SHROUD_REDIRECT','REVOLVER',
  'DEAD_EYE','DODGE','TAKE_COVER','RIDER_EVADE'];

const CINEMATIC: Readonly<Record<CombatMove, string>> = {
  SHROUD_BLOCK: 'SHROUD RISES · THE IMPACT SHATTERS THE DUST',
  SHROUD_REDIRECT: 'PERFECT COUNTER · TURN THEIR FIRE AGAINST THEM',
  REVOLVER: 'SIX-SHOT STANDOFF · THE GUNSLINGER FIRES',
  DEAD_EYE: 'DEAD EYE · TIME FRACTURES AT THE WEAK POINT',
  DODGE: 'AERIAL EVASION · A HAIRLINE ESCAPE',
  TAKE_COVER: 'BREAK FOR COVER · THE WALLS EXPLODE',
  RIDER_EVADE: 'RIDER LINK · HORSE AND GUNSLINGER STRIKE',
};

export function tacticForMove(move: CombatMove): Tactic {
  if (move === 'DEAD_EYE' || move === 'REVOLVER') return 'DEAD_EYE';
  if (move === 'RIDER_EVADE') return 'HORSE';
  if (move === 'TAKE_COVER' || move === 'DODGE') return 'COVER';
  return 'SHROUD';
}

function sample(seed: number, iteration: number): number {
  let x = (seed ^ Math.imul(iteration + 1, 0x9e3779b9)) >>> 0;
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15; x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

function contextKey(battle: WaveBattle): string {
  const hpBand = battle.heroHP < 55 ? 'CRITICAL' : battle.heroHP < 105 ? 'PRESSURED' : 'HEALTHY';
  const waveBand = battle.wave >= 8 ? 'LATE' : battle.wave >= 4 ? 'MID' : 'EARLY';
  return [waveBand, hpBand, battle.nextThreat].join('.');
}

export function observedReward(before: WaveBattle, after: WaveBattle): number {
  if (after.turn !== before.turn + 1 || after.sourceSeed !== before.sourceSeed) {
    throw new Error('Only a measured continuation of the same local battle can train the pilot');
  }
  const dealt = before.enemyHP - after.enemyHP;
  const taken = before.heroHP - after.heroHP;
  const victory = after.status === 'ROUTED' ? 40 : after.status === 'SURVIVED' ? 24 : 0;
  const defeat = after.status === 'FALLEN' ? 80 : 0;
  return Math.max(-150, Math.min(150,
    0.35 * dealt - 0.85 * taken + victory - defeat + 0.3 * (after.shroudEnergy - before.shroudEnergy)));
}

/** Bandit statistics update only from the ACTUAL committed battle result. */
export function learn(memory: PilotMemory, key: string, reward: number): PilotMemory {
  if (!/^(EARLY|MID|LATE)\.(HEALTHY|PRESSURED|CRITICAL)\.(PROJECTILE_VOLLEY|MELEE_DIVE|BREACH_SHOCKWAVE)\.(SHROUD_BLOCK|SHROUD_REDIRECT|REVOLVER|DEAD_EYE|DODGE|TAKE_COVER|RIDER_EVADE)$/.test(key) ||
      !Number.isFinite(reward) || reward < -150 || reward > 150) {
    throw new Error('Invalid combat-learning receipt');
  }
  const original = memory[key] ?? { visits: 0, meanReward: 0 };
  const visits = Math.min(10000, original.visits + 1);
  const meanReward = Math.max(-150, Math.min(150, original.meanReward +
    (reward - original.meanReward) / Math.min(visits, 300)));
  return { ...memory, [key]: { visits, meanReward } };
}

export function parsePilotMemory(input: unknown): PilotMemory {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const obj = input as Record<string, unknown>;
  if (obj.schemaVersion !== PILOT_SCHEMA || !obj.values || typeof obj.values !== 'object' ||
      Array.isArray(obj.values)) return {};
  const values = obj.values as Record<string, unknown>;
  if (Object.keys(values).length > 200) return {};
  let memory: PilotMemory = {};
  for (const [key, entry] of Object.entries(values)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return {};
    const value = entry as Record<string, unknown>;
    if (!Number.isInteger(value.visits) || (value.visits as number) < 1 ||
        (value.visits as number) > 10000 ||
        typeof value.meanReward !== 'number' || !Number.isFinite(value.meanReward) ||
        Math.abs(value.meanReward) > 150) return {};
    try { memory = learn(memory, key, value.meanReward); }
    catch { return {}; }
    memory = { ...memory, [key]: { visits: value.visits as number, meanReward: value.meanReward } };
  }
  return memory;
}

export function chooseCombat(
  battle: WaveBattle,
  state: CampaignState,
  memory: PilotMemory,
  style: PilotStyle = 'BALANCED',
  previousMoves: readonly CombatMove[] = [],
): PilotIntent {
  if (battle.status === 'FALLEN') return { kind: 'RETRY', reason: 'Recover from this failed local test encounter', cue: 'REWIND · ADAPT' };
  if (battle.status !== 'FIGHTING') return {
    kind: 'CAMPAIGN', action: 'RESOLVE_WAVE', fields: {
      tactic: tacticForMove(previousMoves.at(-1) ?? 'SHROUD_BLOCK'),
      outcome: battle.status === 'ROUTED' ? 'ROUTED' : 'SURVIVED',
    }, reason: 'Persist the completed wave through the existing campaign state machine',
    cue: battle.status === 'ROUTED' ? 'WAVE ROUTED · VICTORY' : 'WAVE SURVIVED · KEEP MOVING',
  };
  const context = contextKey(battle);
  const tactical = MOVES.flatMap((action, index) => {
    let projected: WaveBattle;
    try { projected = takeWaveTurn(battle, action, state.awakenings, state.mounted); }
    catch { return []; } // Engine-authorized move set, never invent or bypass an action.
    const key = context + '.' + action;
    const history = memory[key];
    const recent = previousMoves.slice(-3).filter(item => item === action).length;
    const reward = observedReward(battle, projected);
    const flair = ['DEAD_EYE','SHROUD_REDIRECT','RIDER_EVADE'].includes(action) ? 4 : 0;
    const varied = sample(battle.sourceSeed, battle.turn * 31 + index);
    const survival = projected.status === 'FALLEN' ? -120 : 0;
    const resources = 1.0 * (projected.ammo - battle.ammo) +
      1.2 * (projected.shroudEnergy - battle.shroudEnergy);
    const memoryBias = history ? 0.18 * history.meanReward : 0;
    const curiosity = style === 'EXPLORER' ? 5 * Math.sqrt(2 / ((history?.visits ?? 0) + 1)) : 0;
    const score = reward + resources + memoryBias + curiosity + survival -
      recent * (style === 'CINEMATIC' ? 13 : 5) +
      flair * (style === 'CINEMATIC' ? 3 : 1) +
      (style === 'SURVIVAL' ? 1.25 * (projected.heroHP - battle.heroHP) : 0) +
      varied * (style === 'EXPLORER' ? 7 : 2);
    return [{ action, projected, key, score, index }];
  });
  tactical.sort((a,b) => b.score - a.score || a.index - b.index);
  const best = tactical[0];
  if (!best) return { kind: 'STOP', reason: 'No legal combat actions remain', cue: 'AGENT HALTED · NO LEGAL MOVE' };
  return {
    kind: 'COMBAT', action: best.action, tactic: tacticForMove(best.action),
    projected: best.projected, context: best.key,
    cue: CINEMATIC[best.action],
    reason: 'Evaluated ' + tactical.length + ' legal actions; selected ' + best.action +
      ' against ' + battle.nextThreat + ', expected HP ' + best.projected.heroHP +
      ' and enemy pressure ' + best.projected.enemyHP + '.',
  };
}

export function chooseCampaign(state: CampaignState): PilotIntent {
  const campaign = (action: Action, reason: string, cue: string, fields?: Partial<CampaignEvent>): PilotIntent =>
    ({ kind: 'CAMPAIGN', action, reason, cue, ...(fields ? { fields } : {}) });
  switch (state.stage) {
    case 'DEAD_SKY': {
      const actions: readonly Action[] = ['SHROUD_REDIRECT','REVOLVER_FIRE','AERIAL_DASH','SHROUD_BLOCK'];
      const next = actions[Math.min(state.aerialActions, actions.length - 1)]!;
      return campaign(next, 'Establish defense, precision and movement skills in the opening sequence',
        'THE DEAD SKY · ' + next.replaceAll('_', ' '));
    }
    case 'COLLAPSE_RUN': {
      const next: Action = !state.mounted ? 'MOUNT_HORSE' :
        (['RIDE_HARD','HORSE_JUMP','FIRE_BACKWARD'] as const)[Math.min(state.rideActions, 2)]!;
      return campaign(next, 'Survive the Titans and advance the cinematic traversal',
        'ESCAPE SEQUENCE · ' + next.replaceAll('_', ' '));
    }
    case 'MERCYS_END': {
      const missing = Object.keys(CLUES).filter(id => !state.clues.includes(id as keyof typeof CLUES));
      if (state.covenant === 'HIDDEN' && missing.length > 0 && state.clues.length < 4) {
        return campaign('INVESTIGATE', 'Investigate a distinct clue before escalating the wave',
          'DISCOVERY · ' + missing[0]!.replaceAll('_',' '), { clue: missing[0] as keyof typeof CLUES });
      }
      if (state.covenant === 'HIDDEN') {
        return campaign('ANALYZE_COVENANT', 'Enough independent clues to expose the underlying threat',
          'COVENANT REVEALED');
      }
      return { kind: 'STOP', reason: 'An active wave requires tactical combat state to choose actions',
        cue: 'AWAITING ENCOUNTER' };
    }
    case 'THE_NOTARY':
      return campaign('BREAK_AUTHORITY', 'The boss is immune to ordinary damage until its contracts are broken',
        'BOSS PHASE · AUTHORITY BREAK ' + (state.notaryPhase + 1));
    case 'FIRST_COVENANT_ENDING':
      return { kind: 'STOP', reason: 'The playable authored campaign is complete; preserve progress',
        cue: 'CAMPAIGN COMPLETE · READY FOR REVIEW' };
  }
}

export function decidePilot(
  state: CampaignState, battle: WaveBattle | null,
  memory: PilotMemory, style: PilotStyle = 'BALANCED',
  previousMoves: readonly CombatMove[] = [],
): PilotIntent {
  if (state.stage === 'MERCYS_END') {
    if (state.covenant === 'HIDDEN' && state.clues.length < 4) return chooseCampaign(state);
    if (state.covenant === 'HIDDEN') return chooseCampaign(state);
    if (battle) return chooseCombat(battle, state, memory, style, previousMoves);
    return { kind: 'STOP', reason: 'Waiting for local combat scene to materialize', cue: 'SCENE HANDOFF' };
  }
  return chooseCampaign(state);
}
