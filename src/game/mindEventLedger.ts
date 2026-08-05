import { assertMindEvent, MindEvent } from '../contracts/mindEvents';

export interface AppendResult {
  status: 'APPENDED' | 'DUPLICATE';
  event: MindEvent;
}

/**
 * Client-side projection ledger for authoritative StrataCast events.
 * It intentionally cannot mint events; transport adapters must supply them.
 */
export class MindEventLedger {
  private readonly events: MindEvent[] = [];
  private readonly byIdempotencyKey = new Map<string, MindEvent>();

  append(event: MindEvent): AppendResult {
    assertMindEvent(event);
    const previous = this.byIdempotencyKey.get(event.idempotencyKey);
    if (previous) {
      if (previous.eventId !== event.eventId) throw new Error('idempotency_conflict');
      return { status: 'DUPLICATE', event: previous };
    }

    const last = this.events.at(-1);
    const expectedSequence = (last?.sequence ?? 0) + 1;
    if (event.sequence !== expectedSequence) {
      throw new Error(`sequence_gap:expected_${expectedSequence}:received_${event.sequence}`);
    }

    this.events.push(event);
    this.byIdempotencyKey.set(event.idempotencyKey, event);
    return { status: 'APPENDED', event };
  }

  snapshot(): readonly MindEvent[] {
    return structuredClone(this.events);
  }

  rollbackTo(sequence: number): void {
    if (!Number.isSafeInteger(sequence) || sequence < 0) throw new Error('invalid_rollback_sequence');
    while ((this.events.at(-1)?.sequence ?? 0) > sequence) {
      const removed = this.events.pop();
      if (removed) this.byIdempotencyKey.delete(removed.idempotencyKey);
    }
  }
}
