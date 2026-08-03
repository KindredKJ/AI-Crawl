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
  const ledger = new MindEventLedger();
  ledger.append(event(1));
  const snapshot = ledger.snapshot();
  assert.equal(snapshot.length, 1);
  assert.notEqual(snapshot[0], ledger.snapshot()[0]);
});

test('deduplicates an idempotent retry without advancing sequence', () => {
  const ledger = new MindEventLedger();
  const first = ledger.append(event(1));
  const retry = ledger.append(event(99, { idempotencyKey: 'key-1' }));
  assert.equal(first.status, 'APPENDED');
  assert.equal(retry.status, 'DUPLICATE');
  assert.equal(ledger.snapshot().length, 1);
});

test('rejects sequence gaps and dishonest observation labels', () => {
  const ledger = new MindEventLedger();
  assert.throws(() => ledger.append(event(2)), /sequence_gap/);
  assert.throws(() => ledger.append(event(1, {
    type: 'mind.observation.recorded',
    truthClass: 'PREDICTED',
    payload: { summary: 'A vehicle is present', confidence: 0.8 },
  })), /observation_requires_direct_truth_class/);
});

test('rolls projections back and permits replay from the rollback boundary', () => {
  const ledger = new MindEventLedger();
  ledger.append(event(1));
  ledger.append(event(2));
  ledger.rollbackTo(1);
  assert.deepEqual(ledger.snapshot().map(item => item.sequence), [1]);
  assert.equal(ledger.append(event(2)).status, 'APPENDED');
});

