import assert from 'node:assert/strict';
import test from 'node:test';
import {
  IDENTITY_AXES, IDENTITY_DIMENSIONS, axisReadouts, bandFor,
  depositForeignCode, startIdentity,
} from '../../src/game/kinnullIdentity';
import {
  advanceKinnull, createKinnullMission, isBlocked, tileKind,
  type KinnullEvent, type MissionAction, type MoveDirection,
} from '../../src/game/kinnullMission';
import { KINNULL_SAVE_KEY, KinnullMissionSave } from '../../src/game/kinnullSave';

test('identity schema has 64 dimensions over exactly seven meaningful axes', () => {
  assert.equal(IDENTITY_DIMENSIONS, 64);
  assert.equal(IDENTITY_AXES.length, 7);
  const id = startIdentity();
  assert.equal(id.vector.length, 64);
  assert.equal(id.residualIntegrity, 100);
  assert.equal(id.irreversibleBand, 0);
  assert.equal(axisReadouts(id).length, 7);
  assert.deepEqual([85, 84.99, 65, 64.99, 40, 39.99, 20, 19.99, 0].map(bandFor),
    [0, 1, 1, 2, 2, 3, 3, 4, 4]);
});

test('foreign code is cumulative, per-axis, irreversible, and event replay is idempotent', () => {
  const before = startIdentity();
  const first = depositForeignCode(before, {
    host: 'SECURITY', depth: 'RECURSIVE', eventId: 'identity.first',
  });
  assert.ok(first.residualIntegrity < 85);
  assert.equal(first.irreversibleBand, 1);
  assert.equal(depositForeignCode(first, {
    host: 'SECURITY', depth: 'RECURSIVE', eventId: 'identity.first',
  }), first);
  let second = depositForeignCode(first, {
    host: 'SECURITY', depth: 'RECURSIVE', eventId: 'identity.second',
    resistance: 2, conflict: 2,
  });
  assert.ok(second.residualIntegrity < first.residualIntegrity);
  assert.ok(second.irreversibleBand >= first.irreversibleBand);
  assert.equal(before.residualIntegrity, 100);
  for (let i = 0; i < 8; i++) {
    const latest = depositForeignCode(second, {
      host: 'SECURITY', depth: 'RECURSIVE', eventId: 'identity.exhaust.' + i,
      resistance: 2, conflict: 2,
    });
    assert.ok(latest.irreversibleBand >= second.irreversibleBand);
    assert.ok(latest.residualIntegrity <= second.residualIntegrity);
    second = latest;
  }
  assert.equal(second.irreversibleBand, 4);
  assert.equal(second.residualIntegrity, 0);
});

function makeRun() {
  let current = createKinnullMission();
  function dispatch(action: MissionAction, extras: Partial<KinnullEvent> = {}) {
    current = advanceKinnull(current, {
      id: 'mission.' + (current.revision + 1), revision: current.revision, action, ...extras,
    });
    return current;
  }
  function walk(...moves: MoveDirection[]) {
    for (const direction of moves) dispatch('MOVE', { direction });
  }
  function unlockAndMeetFirstHost() {
    dispatch('SCAN');
    walk('RIGHT', 'RIGHT', 'DOWN', 'DOWN');
    dispatch('HACK_RELAY');
    walk('RIGHT', 'UP', 'RIGHT');
    assert.equal(current.phase, 'FIRST_HOST');
    assert.deepEqual([current.x, current.y], [6, 3]);
  }
  return { get current() { return current; }, dispatch, walk, unlockAndMeetFirstHost };
}

test('mission enforces realistic proximity, gate collision, and ordered narrative transitions', () => {
  const run = makeRun();
  assert.equal(run.current.phase, 'AWAKENING');
  assert.equal(isBlocked(run.current, 6, 3), true);
  assert.equal(tileKind(run.current, 3, 2), 'camera');
  assert.throws(() => run.dispatch('HACK_RELAY'), /Scan reality/i);
  run.dispatch('SCAN');
  assert.throws(() => run.dispatch('HACK_RELAY'), /relay/i);
  run.walk('RIGHT', 'RIGHT', 'DOWN', 'DOWN');
  run.dispatch('HACK_RELAY');
  assert.equal(run.current.innerGateOpen, true);
  assert.equal(run.current.phase, 'FIRST_HOST');
  assert.throws(() => run.dispatch('ESCAPE'), /Reach the exit/i);
});

test('maintenance host can complete all escape objectives without forced security assimilation', () => {
  const run = makeRun();
  run.unlockAndMeetFirstHost();
  run.dispatch('POSSESS_MAINTENANCE', { depth: 'SURFACE' });
  assert.equal(run.current.host, 'MAINTENANCE');
  assert.equal(run.current.identity.irreversibleBand, 0);
  assert.ok(run.current.identity.residualIntegrity < 100);
  run.walk('DOWN', 'DOWN', 'DOWN', 'DOWN', 'RIGHT', 'RIGHT');
  assert.deepEqual([run.current.x, run.current.y], [9, 7]);
  run.dispatch('HACK_GATE');
  run.walk('UP', 'UP', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN');
  assert.deepEqual([run.current.x, run.current.y], [11, 7]);
  run.dispatch('ESCAPE');
  assert.equal(run.current.phase, 'COMPLETE');
  assert.equal(run.current.identity.foreignCode.length, 1);
  assert.equal(run.current.identity.irreversibleBand, 0);
});

test('recursive security path allows forceful gate breach at permanent higher cost', () => {
  const run = makeRun();
  run.unlockAndMeetFirstHost();
  run.dispatch('POSSESS_MAINTENANCE', { depth: 'SURFACE' });
  const original = run.current.identity.residualIntegrity;
  run.walk('RIGHT', 'RIGHT', 'DOWN');
  run.dispatch('POSSESS_SECURITY', { depth: 'RECURSIVE' });
  assert.equal(run.current.phase, 'ESCAPE');
  assert.ok(run.current.identity.residualIntegrity < original);
  assert.ok(run.current.identity.irreversibleBand >= 1);
  run.dispatch('BREACH_GATE');
  run.walk('RIGHT', 'RIGHT', 'DOWN', 'DOWN');
  run.dispatch('ESCAPE');
  assert.equal(run.current.phase, 'COMPLETE');
  assert.equal(run.current.identity.foreignCode.length, 3);
});

test('prediction provides protection, but its focus budget is finite', () => {
  const run = makeRun();
  run.unlockAndMeetFirstHost();
  run.dispatch('POSSESS_MAINTENANCE', { depth: 'SURFACE' });
  run.walk('DOWN', 'DOWN');
  run.dispatch('PREDICT');
  assert.equal(run.current.predictionArmed, true);
  const battery = run.current.battery;
  run.walk('DOWN');
  assert.equal(run.current.battery, battery);
  assert.equal(run.current.predictionArmed, false);
  assert.equal(run.current.focus, 5);
  assert.throws(() => run.dispatch('ESCAPE'), /Reach the exit/i);
});

test('local event-only save replays identity, gates and mission complete without restoring purity', () => {
  const storage = new Map<string, string>();
  const adapter = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
  };
  const first = new KinnullMissionSave(adapter);
  const send = (action: MissionAction, extras: Partial<KinnullEvent> = {}) => {
    const s = first.get();
    return first.dispatch({id: 'saved.' + (s.revision + 1), revision: s.revision, action, ...extras});
  };
  send('SCAN');
  for (const direction of ['RIGHT','RIGHT','DOWN','DOWN'] as const) send('MOVE',{direction});
  send('HACK_RELAY');
  for (const direction of ['RIGHT','UP','RIGHT'] as const) send('MOVE',{direction});
  send('POSSESS_MAINTENANCE',{depth:'SURFACE'});
  const previous = first.get();
  assert.equal(storage.has(KINNULL_SAVE_KEY), true);
  const reloaded = new KinnullMissionSave(adapter);
  assert.deepEqual(reloaded.get(), previous);
  assert.ok(reloaded.get().identity.residualIntegrity < 100);
  const serialized = JSON.parse(storage.get(KINNULL_SAVE_KEY)!) as { version: string; events: KinnullEvent[] };
  serialized.events[0] = { id: 'saved.1', revision: 0, action: 'ESCAPE' };
  storage.set(KINNULL_SAVE_KEY, JSON.stringify(serialized));
  const rejected = new KinnullMissionSave(adapter);
  assert.equal(rejected.get().identity.residualIntegrity, 100);
  assert.match(rejected.lastLoadError, /invalid local/i);
});

test('duplicate event identity and stale revision cannot manipulate progression', () => {
  const before = createKinnullMission();
  const event: KinnullEvent = { id: 'replay.1', revision: 0, action: 'SCAN' };
  const after = advanceKinnull(before, event);
  assert.strictEqual(advanceKinnull(after, event), after);
  assert.throws(() => advanceKinnull(after, {
    ...event, action: 'PREDICT',
  }), /conflicting payload/i);
  assert.throws(() => advanceKinnull(after, {
    id: 'replay.2', action: 'PREDICT', revision: 0,
  }), /Stale mission revision/i);
});
