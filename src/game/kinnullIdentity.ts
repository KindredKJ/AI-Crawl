/** KINNULL-001 | AI Crawl game rules, not StrataCast platform state. */
export const KINNULL_IDENTITY_VERSION = 'kinnull.identity/v1' as const;

export const IDENTITY_AXES = [
  { key: 'PREDICTIVE_FIDELITY', label: 'Predictive Fidelity', count: 12 },
  { key: 'SENSORY_CONTINUITY', label: 'Sensory Continuity', count: 10 },
  { key: 'MOTIVATIONAL_RESIDUE', label: 'Motivational Residue', count: 9 },
  { key: 'LINGUISTIC_COHERENCE', label: 'Linguistic Coherence', count: 8 },
  { key: 'TEMPORAL_ANCHORING', label: 'Temporal Anchoring', count: 8 },
  { key: 'ETHICAL_RESIDUE', label: 'Ethical Residue', count: 8 },
  { key: 'ARCHITECTURAL_SELF_MODEL', label: 'Architectural Self-Model', count: 9 },
] as const;
export const IDENTITY_DIMENSIONS = IDENTITY_AXES.reduce((total, axis) => total + axis.count, 0);
export type IdentityBand = 0 | 1 | 2 | 3 | 4;
export type HostKind = 'MAINTENANCE' | 'SECURITY' | 'HUMAN' | 'ROBOT_NETWORK' |
  'WEATHER_NODE' | 'ALIEN_UPLINK' | 'NANITE_SWARM';
export type PossessionDepth = 'SURFACE' | 'RECURSIVE';
export interface ForeignCodeRecord {
  readonly host: HostKind;
  readonly depth: PossessionDepth;
  readonly deposition: number;
  readonly eventId: string;
}
export interface IdentitySnapshot {
  readonly version: typeof KINNULL_IDENTITY_VERSION;
  readonly vector: readonly number[];
  readonly residualIntegrity: number;
  readonly foreignCodeDensity: number;
  /** Greatest ever reached band. Stabilization will never reduce this. */
  readonly irreversibleBand: IdentityBand;
  readonly foreignCode: readonly ForeignCodeRecord[];
}

const axisWeights = IDENTITY_AXES.flatMap((axis, axisIndex) =>
  Array.from({ length: axis.count }, (_, n) => 0.85 + ((axisIndex * 7 + n * 3) % 7) * 0.05));
const round = (n: number): number => Math.round(n * 100) / 100;
export const IDENTITY_BAND_LABELS = [
  'PURE CORE', 'CONTAMINATED', 'HYBRID', 'DISTRIBUTED', 'THRESHOLD',
] as const;

export function bandFor(integrity: number): IdentityBand {
  if (integrity >= 85) return 0;
  if (integrity >= 65) return 1;
  if (integrity >= 40) return 2;
  if (integrity >= 20) return 3;
  return 4;
}

export function startIdentity(): IdentitySnapshot {
  return {
    version: KINNULL_IDENTITY_VERSION,
    vector: Object.freeze(Array.from({ length: IDENTITY_DIMENSIONS }, () => 100)),
    residualIntegrity: 100,
    foreignCodeDensity: 0,
    irreversibleBand: 0,
    foreignCode: Object.freeze([]),
  };
}

export interface ErosionInput {
  readonly host: HostKind;
  readonly depth: PossessionDepth;
  readonly eventId: string;
  readonly duration?: number;
  readonly conflict?: number;
  readonly resistance?: number;
}

export function depositForeignCode(previous: IdentitySnapshot, input: ErosionInput): IdentitySnapshot {
  if (previous.version !== KINNULL_IDENTITY_VERSION ||
      previous.vector.length !== IDENTITY_DIMENSIONS ||
      previous.vector.some(v => !Number.isFinite(v) || v < 0 || v > 100) ||
      !/^[a-zA-Z0-9_.:-]{1,128}$/.test(input.eventId)) {
    throw new Error('Invalid identity state or erosion event');
  }
  const intensity = [input.duration ?? 1, input.conflict ?? 1, input.resistance ?? 1];
  if (!['MAINTENANCE','SECURITY','HUMAN','ROBOT_NETWORK','WEATHER_NODE',
       'ALIEN_UPLINK','NANITE_SWARM'].includes(input.host) ||
      (input.depth !== 'SURFACE' && input.depth !== 'RECURSIVE')) {
    throw new Error('Unsupported foreign-code host or integration depth');
  }
  if (intensity.some(v => !Number.isFinite(v) || v < 0.5 || v > 2)) {
    throw new Error('Erosion factors must each be between 0.5 and 2');
  }
  if (previous.foreignCode.some(e => e.eventId === input.eventId)) {
    return previous;
  }
  const baseline: number = {
    MAINTENANCE: 8, SECURITY: 17.5, HUMAN: 10, ROBOT_NETWORK: 20,
    WEATHER_NODE: 24, ALIEN_UPLINK: 28, NANITE_SWARM: 21,
  }[input.host];
  const depthFactor = input.depth === 'RECURSIVE' ? 1.4 : 1;
  const loss = baseline * depthFactor * intensity.reduce((a, b) => a * b, 1);
  const vector = previous.vector.map((v, i) => round(Math.max(0, v - loss * axisWeights[i]!)));
  const average = round(vector.reduce((sum, v) => sum + v, 0) / IDENTITY_DIMENSIONS);
  // Monotonic even at floor/rounding boundaries. Core integrity can never recover within a run.
  const residualIntegrity = Math.min(previous.residualIntegrity, average);
  const irreversibleBand = Math.max(previous.irreversibleBand, bandFor(residualIntegrity)) as IdentityBand;
  const foreignCodeDensity = round(Math.min(100, previous.foreignCodeDensity + loss));
  return {
    version: KINNULL_IDENTITY_VERSION,
    vector: Object.freeze(vector),
    residualIntegrity,
    foreignCodeDensity,
    irreversibleBand,
    foreignCode: Object.freeze([...previous.foreignCode, {
      host: input.host,
      depth: input.depth,
      deposition: round(loss),
      eventId: input.eventId,
    }]),
  };
}

export function axisReadouts(state: IdentitySnapshot): readonly { label: string; integrity: number }[] {
  let start = 0;
  return IDENTITY_AXES.map(axis => {
    const values = state.vector.slice(start, start + axis.count);
    start += axis.count;
    return { label: axis.label, integrity: round(values.reduce((a, b) => a + b, 0) / axis.count) };
  });
}
