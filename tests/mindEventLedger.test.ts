import assert from 'node:assert/strict';
import test from 'node:test';
import { MindEvent } from '../src/contracts/mindEvents';
import { MindEventLedger } from '../src/game/mindEventLedger';

const event = (sequence: number, overrides: Partial<MindEvent> = {}): MindEvent => ({
  schemaVersion: 'aicrawl.mind-event/v1',
  type: 'mind.objective.changed',
  eventId: `evt-${sequence}`,
  idempotencyKey: `key-${sequence}`,
  sequence,
  occurredAt: '2026-08-03T00:00:00.000Z',
  mindId: 'mind-genesis-1',
  worldId: 'world-genesis',
  sessionId: 'session-1',
  tenantId: 'tenant-kindred',
  truthClass: 'REPORTED',
  payload: { objective: 'Enter the Mind Chamber', stage: 'NAVIGATING' },
  provenance: { producer: 'stratacast.event-adapter', sourceEventIds: [], runtimeVersion: '1.0.0' },
  ...overrides,
} as MindEvent);

test('appends authoritative events in order and returns an immutable snapshot', () => {
  const ledger = new MindEventLedger({ tenantId: 'tenant-kindred', worldId: 'world-genesis', sessionId: 'session-1', mindId: 'mind-genesis-1' });
  ledger.append(event(1));
  const snapshot = ledger.snapshot();
  assert.equal(snapshot.length, 1);
  assert.notEqual(snapshot[0], ledger.snapshot()[0]);
});

test('deduplicates an idempotent retry without advancing sequence', () => {
  const ledger = new MindEventLedger({ tenantId: 'tenant-kindred', worldId: 'world-genesis', sessionId: 'session-1', mindId: 'mind-genesis-1' });
  const first = ledger.append(event(1));
  const retry = ledger.append(event(1));
  assert.equal(first.status, 'APPENDED');
  assert.equal(retry.status, 'DUPLICATE');
  assert.equal(ledger.snapshot().length, 1);
});

test('deduplicates identical retry envelopes with reordered JSON object keys', () => {
  const ledger = new MindEventLedger({ tenantId: 'tenant-kindred', worldId: 'world-genesis', sessionId: 'session-1', mindId: 'mind-genesis-1' });
  const first = event(1);
  ledger.append(first);
  const reordered = Object.fromEntries(
    Object.entries(first).reverse().map(([key, value]) => {
      if (key === 'payload' || key === 'provenance') {
        return [key, Object.fromEntries(Object.entries(value).reverse())];
      }
      return [key, value];
    }),
  ) as unknown as MindEvent;
  assert.equal(ledger.append(reordered).status, 'DUPLICATE');
  assert.equal(ledger.snapshot().length, 1);
});

test('rejects reuse of an idempotency key for a different event', () => {
  const ledger = new MindEventLedger({ tenantId: 'tenant-kindred', worldId: 'world-genesis', sessionId: 'session-1', mindId: 'mind-genesis-1' });
  ledger.append(event(1));
  assert.throws(() => ledger.append(event(2, { idempotencyKey: 'key-1' })), /idempotency_conflict/);
});

test('rejects sequence gaps and dishonest observation labels', () => {
  const ledger = new MindEventLedger({ tenantId: 'tenant-kindred', worldId: 'world-genesis', sessionId: 'session-1', mindId: 'mind-genesis-1' });
  assert.throws(() => ledger.append(event(2)), /sequence_gap/);
  assert.throws(() => ledger.append(event(1, {
    type: 'mind.observation.recorded',
    truthClass: 'PREDICTED',
    payload: { summary: 'A vehicle is present', confidence: 0.8 },
  })), /observation_requires_direct_truth_class/);
});

test('rolls projections back and permits replay from the rollback boundary', () => {
  const ledger = new MindEventLedger({ tenantId: 'tenant-kindred', worldId: 'world-genesis', sessionId: 'session-1', mindId: 'mind-genesis-1' });
  ledger.append(event(1));
  ledger.append(event(2));
  ledger.rollbackTo(1);
  assert.deepEqual(ledger.snapshot().map(item => item.sequence), [1]);
  assert.equal(ledger.append(event(2)).status, 'APPENDED');
});

test('rejects malformed, unknown and dishonest deserialized event types', () => {
  const ledger = new MindEventLedger({
    tenantId: 'tenant-kindred', worldId: 'world-genesis',
    sessionId: 'session-1', mindId: 'mind-genesis-1',
  });
  const send = (value: unknown) => ledger.append(value);
  assert.throws(() => send({ ...event(1), type: 'mind.status.fabricated' }), /unknown_event_type/);
  assert.throws(() => send({ ...event(1), truthClass: 'TRUST_ME' }), /invalid_truth_class/);
  assert.throws(() => send({ ...event(1), provenance: null }), /missing_provenance/);
  assert.throws(() => send({
    ...event(1), type: 'mind.observation.recorded', truthClass: 'OBSERVED',
    payload: { summary: 'object', confidence: 'high' },
  }), /invalid_confidence/);
  assert.throws(() => send({
    ...event(1), type: 'mind.status.unknown', truthClass: 'OBSERVED',
    payload: { field: 'health', reason: 'no telemetry' },
  }), /unknown_requires_unknown_truth_class/);
});

test('rejects cross-tenant, cross-world, cross-session and cross-Mind events', () => {
  const ledger = new MindEventLedger({
    tenantId: 'tenant-kindred', worldId: 'world-genesis',
    sessionId: 'session-1', mindId: 'mind-genesis-1',
  });
  for (const [key, value] of [
    ['tenantId', 'other-tenant'], ['worldId', 'other-world'],
    ['sessionId', 'other-session'], ['mindId', 'other-mind'],
  ] as const) {
    assert.throws(() => ledger.append(event(1, { [key]: value })), /projection_scope_mismatch/);
  }
  assert.deepEqual(ledger.snapshot(), []);
});

test('rejects conflicting idempotency reuse even when eventId matches', () => {
  const ledger = new MindEventLedger({
    tenantId: 'tenant-kindred', worldId: 'world-genesis',
    sessionId: 'session-1', mindId: 'mind-genesis-1',
  });
  ledger.append(event(1));
  assert.throws(() => ledger.append(event(99, {
    eventId: 'evt-1', idempotencyKey: 'key-1',
  })), /idempotency_conflict/);
});

test('defensively copies caller input and append results', () => {
  const ledger = new MindEventLedger({
    tenantId: 'tenant-kindred', worldId: 'world-genesis',
    sessionId: 'session-1', mindId: 'mind-genesis-1',
  });
  const mutable = event(1);
  const result = ledger.append(mutable);
  mutable.sequence = 10;
  (mutable.payload as { objective: string }).objective = 'forged';
  result.event.sequence = 999;
  assert.equal(ledger.snapshot()[0].sequence, 1);
  assert.equal((ledger.snapshot()[0].payload as { objective: string }).objective, 'Enter the Mind Chamber');
  assert.equal(ledger.append(event(2)).status, 'APPENDED');
});
