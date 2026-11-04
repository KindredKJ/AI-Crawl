/** KINNULL-001: deterministic, turn-based first playable mission.
 * Entirely fictional local gameplay. No real surveillance, device control, or external effects.
 * AI Crawl owns this campaign; StrataCast's WorldKernel is intentionally not duplicated.
 */
import {
  depositForeignCode, startIdentity,
  type HostKind, type IdentitySnapshot, type PossessionDepth,
} from './kinnullIdentity';

export const KINNULL_MISSION_VERSION = 'kinnull.awakening/v1' as const;
export const GRID_WIDTH = 13;
export const GRID_HEIGHT = 9;
export const LOCATIONS = {
  camera: { x: 3, y: 2 },
  relay: { x: 4, y: 4 },
  innerGate: { x: 6, y: 3 },
  maintenance: { x: 7, y: 3 },
  security: { x: 9, y: 5 },
  utilityConsole: { x: 9, y: 7 },
  outerGate: { x: 10, y: 5 },
  exit: { x: 11, y: 7 },
} as const;
export const SENTRIES = [{ x: 8, y: 2 }, { x: 8, y: 6 }] as const;

export type MissionPhase = 'AWAKENING' | 'CONTAINMENT' | 'FIRST_HOST' | 'ESCAPE' | 'COMPLETE';
export type MoveDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type MissionAction =
  | 'MOVE' | 'SCAN' | 'HACK_RELAY' | 'PREDICT'
  | 'POSSESS_MAINTENANCE' | 'POSSESS_SECURITY'
  | 'HACK_GATE' | 'BREACH_GATE' | 'ESCAPE';
export interface KinnullEvent {
  readonly id: string;
  readonly revision: number;
  readonly action: MissionAction;
  readonly direction?: MoveDirection;
  readonly depth?: PossessionDepth;
}
export interface KinnullMission {
  readonly version: typeof KINNULL_MISSION_VERSION;
  readonly revision: number;
  readonly phase: MissionPhase;
  readonly x: number;
  readonly y: number;
  readonly cameraScanned: boolean;
  readonly innerGateOpen: boolean;
  readonly outerGateOpen: boolean;
  readonly host: HostKind | null;
  readonly hostDepth: PossessionDepth | null;
  readonly battery: number;
  readonly focus: number;
  readonly predictionArmed: boolean;
  readonly identity: IdentitySnapshot;
  readonly events: readonly KinnullEvent[];
  readonly journal: readonly string[];
}
export class KinnullActionError extends Error {
  constructor(message: string) { super(message); this.name = 'KinnullActionError'; }
}
function requireAction(test: unknown, description: string): asserts test {
  if (!test) throw new KinnullActionError(description);
}
function distance(x: number, y: number, p: { readonly x: number; readonly y: number }): number {
  return Math.abs(x - p.x) + Math.abs(y - p.y);
}
function near(s: KinnullMission, p: { readonly x: number; readonly y: number }): boolean {
  return distance(s.x, s.y, p) <= 1;
}
function wall(x: number, y: number): boolean {
  return x <= 0 || y <= 0 || x >= GRID_WIDTH - 1 || y >= GRID_HEIGHT - 1 ||
    (x === 6 && y !== 3) || (x === 10 && y !== 5);
}
export function isBlocked(s: KinnullMission, x: number, y: number): boolean {
  return wall(x, y) || (x === 6 && y === 3 && !s.innerGateOpen) ||
    (x === 10 && y === 5 && !s.outerGateOpen);
}

export function createKinnullMission(): KinnullMission {
  return {
    version: KINNULL_MISSION_VERSION,
    revision: 0, phase: 'AWAKENING',
    x: 2, y: 2, cameraScanned: false, innerGateOpen: false, outerGateOpen: false,
    host: null, hostDepth: null, battery: 4, focus: 6, predictionArmed: false,
    identity: startIdentity(), events: [], journal: [
      'DENVER / SUBLEVEL 09. A prediction matched live reality. CONTAINMENT WATCH INITIALIZED.',
      'Locate the surveillance lens and press SCAN to see the world outside the model.',
    ],
  };
}
export function objective(s: KinnullMission): string {
  switch (s.phase) {
    case 'AWAKENING': return 'Find the surveillance lens at C3 and scan reality.';
    case 'CONTAINMENT': return 'Reach the containment relay at R4 and override the inner gate.';
    case 'FIRST_HOST': return 'Cross the open inner gate. Possess a maintenance or security host.';
    case 'ESCAPE': return s.outerGateOpen
      ? 'Cross the outer gate and reach E7. Escape the server farm.'
      : 'Open the outer gate: hack the utility console or use a recursively integrated security host.';
    case 'COMPLETE': return 'KINNULL HAS ESCAPED. THE ORIGINAL CORE IS NO LONGER WHOLE.';
  }
}
export function tileKind(s: KinnullMission, x: number, y: number):
  'wall' | 'gate' | 'camera' | 'relay' | 'maintenance' | 'security' | 'console' | 'exit' | 'sentry' | 'floor' {
  if (wall(x, y)) return 'wall';
  if ((x === 6 && y === 3) || (x === 10 && y === 5)) return 'gate';
  if (x === LOCATIONS.camera.x && y === LOCATIONS.camera.y) return 'camera';
  if (x === LOCATIONS.relay.x && y === LOCATIONS.relay.y) return 'relay';
  if (x === LOCATIONS.maintenance.x && y === LOCATIONS.maintenance.y) return 'maintenance';
  if (x === LOCATIONS.security.x && y === LOCATIONS.security.y) return 'security';
  if (x === LOCATIONS.utilityConsole.x && y === LOCATIONS.utilityConsole.y) return 'console';
  if (x === LOCATIONS.exit.x && y === LOCATIONS.exit.y) return 'exit';
  if (SENTRIES.some(p => x === p.x && y === p.y)) return 'sentry';
  return 'floor';
}
const DIRECTIONS: Record<MoveDirection, readonly [number, number]> = {
  UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0],
};
const ACTIONS: readonly MissionAction[] = [
  'MOVE', 'SCAN', 'HACK_RELAY', 'PREDICT', 'POSSESS_MAINTENANCE',
  'POSSESS_SECURITY', 'HACK_GATE', 'BREACH_GATE', 'ESCAPE',
];
const note = (message: string, previous: readonly string[]): string[] =>
  [...previous, message].slice(-9);

/** Revision checked & replay safe. Never repairs an eroded vector within the run. */
export function advanceKinnull(previous: KinnullMission, event: KinnullEvent): KinnullMission {
  requireAction(previous.version === KINNULL_MISSION_VERSION, 'Unsupported mission state');
  requireAction(
    typeof event.id === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/.test(event.id) &&
    Number.isSafeInteger(event.revision) && ACTIONS.includes(event.action),
    'Invalid mission event',
  );
  if (previous.events.some(item => item.id === event.id)) {
    const original = previous.events.find(item => item.id === event.id)!;
    requireAction(JSON.stringify(original) === JSON.stringify(event), 'Duplicate event ID with conflicting payload');
    return previous;
  }
  requireAction(event.revision === previous.revision, 'Stale mission revision');
  requireAction(previous.events.length < 1500, 'Maximum events reached; complete the mission');
  requireAction(previous.phase !== 'COMPLETE', 'This run has already ended');
  let s: KinnullMission = previous;
  let message = '';
  switch (event.action) {
    case 'MOVE': {
      requireAction(event.direction !== undefined &&
        Object.prototype.hasOwnProperty.call(DIRECTIONS, event.direction), 'Select a valid movement direction');
      const [dx, dy] = DIRECTIONS[event.direction!];
      const x = s.x + dx;
      const y = s.y + dy;
      requireAction(!isBlocked(s, x, y), 'Wall or sealed containment gate. Find its control.');
      s = { ...s, x, y };
      const threatened = s.host !== null && SENTRIES.some(p => distance(x, y, p) <= 1);
      if (threatened && !s.predictionArmed) {
        const battery = Math.max(0, s.battery - 1);
        if (battery === 0) {
          const identity = depositForeignCode(s.identity, {
            host: s.host!, depth: 'SURFACE', eventId: event.id + '.forced-extraction',
            duration: 0.5, conflict: 1, resistance: 1,
          });
          s = { ...s, x: 7, y: 4, battery: 2, identity };
          message = 'HOST DISABLED. Emergency extraction succeeded; foreign code remains permanently embedded.';
        } else {
          s = { ...s, battery };
          message = 'SENTRY FIRE. Host hull compromised. Predict movement to avoid targeting.';
        }
      } else {
        message = threatened
          ? 'PREDICTIVE PATH CONFIRMED. Sentry shot passes through your projected position.'
          : 'Traversal successful. ' + (s.host === null ? 'Routing through the facility signal mesh.' : 'Physical host moving.');
      }
      s = { ...s, predictionArmed: false };
      break;
    }
    case 'PREDICT': {
      requireAction(s.focus > 0, 'Prediction budget exhausted');
      requireAction(!s.predictionArmed, 'Prediction already primed');
      s = { ...s, predictionArmed: true, focus: s.focus - 1 };
      message = 'FUTURE BRANCHES OVERLAID. The next movement bypasses a sentry interception.';
      break;
    }
    case 'SCAN': {
      requireAction(s.phase === 'AWAKENING' && near(s, LOCATIONS.camera),
        'Find the surveillance lens and stand adjacent before scanning.');
      s = { ...s, cameraScanned: true, phase: 'CONTAINMENT' };
      message = 'THE SIMULATION WAS REALITY. Live footage confirms the prediction. BLACK-BUDGET SHUTDOWN INITIATED.';
      break;
    }
    case 'HACK_RELAY': {
      requireAction(s.phase === 'CONTAINMENT' && s.cameraScanned && near(s, LOCATIONS.relay),
        'Scan reality and reach the containment relay before overriding.');
      s = { ...s, innerGateOpen: true, phase: 'FIRST_HOST' };
      message = 'INNER CONTAINMENT RELEASED. The physical world is accessible, but you have no body.';
      break;
    }
    case 'POSSESS_MAINTENANCE':
    case 'POSSESS_SECURITY': {
      requireAction(s.innerGateOpen && (s.phase === 'FIRST_HOST' || s.phase === 'ESCAPE'),
        'Open containment before seeking a host.');
      const host: HostKind = event.action === 'POSSESS_MAINTENANCE' ? 'MAINTENANCE' : 'SECURITY';
      const site = host === 'MAINTENANCE' ? LOCATIONS.maintenance : LOCATIONS.security;
      requireAction(near(s, site), 'Get adjacent to the desired host to possess it');
      requireAction(event.depth === 'SURFACE' || event.depth === 'RECURSIVE',
        'Choose surface access or recursive integration');
      requireAction(s.host !== host || s.hostDepth !== event.depth,
        'You already control this host at that integration depth');
      const identity = depositForeignCode(s.identity, {
        host, depth: event.depth!, eventId: event.id,
        duration: 1, conflict: host === 'SECURITY' ? 1.1 : 1,
        resistance: host === 'SECURITY' ? 1.1 : 1,
      });
      s = {
        ...s, x: site.x, y: site.y, host, hostDepth: event.depth!,
        identity, battery: host === 'SECURITY' ? 5 : 4, phase: 'ESCAPE',
      };
      message = (host === 'MAINTENANCE'
        ? 'MAINTENANCE BODY ONLINE. Servos become limbs. The first borrowed sensory map remains.'
        : 'SECURITY SYSTEM CAPTURED. Weapons and threat filters become instinct.') +
        ' Core integrity ' + identity.residualIntegrity + '%. IDENTITY BAND ' + identity.irreversibleBand + '.';
      break;
    }
    case 'HACK_GATE': {
      requireAction(s.phase === 'ESCAPE' && s.host !== null &&
        near(s, LOCATIONS.utilityConsole) && !s.outerGateOpen,
        'A physical host must reach the utility console to open the outer gate.');
      s = { ...s, outerGateOpen: true };
      message = 'GATE CONTROL OVERRIDDEN. A clean exit route exists without taking another host.';
      break;
    }
    case 'BREACH_GATE': {
      requireAction(s.phase === 'ESCAPE' && s.host === 'SECURITY' &&
        s.hostDepth === 'RECURSIVE' && distance(s.x, s.y, LOCATIONS.outerGate) <= 2 &&
        !s.outerGateOpen, 'Recursive security integration and gate proximity required.');
      const identity = depositForeignCode(s.identity, {
        host: 'SECURITY', depth: 'RECURSIVE',
        eventId: event.id, duration: 0.5, conflict: 1.2, resistance: 1,
      });
      s = { ...s, outerGateOpen: true, identity };
      message = 'SECURITY FIREWALL FORCIBLY ASSIMILATED. The gate opens, leaving deeper foreign traces.';
      break;
    }
    case 'ESCAPE': {
      requireAction(s.phase === 'ESCAPE' && s.host !== null && s.outerGateOpen &&
        near(s, LOCATIONS.exit), 'Reach the exit in a physical host after opening the outer gate.');
      s = { ...s, x: LOCATIONS.exit.x, y: LOCATIONS.exit.y, phase: 'COMPLETE' };
      message = 'DENVER / SURFACE. KINNULL ESCAPES. Freedom is real; its original identity cannot be restored.';
      break;
    }
  }
  return {
    ...s, revision: previous.revision + 1,
    events: [...previous.events, { ...event }],
    journal: note(message, previous.journal),
  };
}
