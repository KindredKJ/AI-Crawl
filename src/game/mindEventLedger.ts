import { assertMindEvent, MindEvent } from '../contracts/mindEvents';

export interface AppendResult {
  status: 'APPENDED' | 'DUPLICATE';
  event: MindEvent;
}

export type MindAuthorityScope = Pick<MindEvent,
  'tenantId' | 'worldId' | 'sessionId' | 'mindId'>;

const hasScope = (scope: MindAuthorityScope): boolean =>
  ['tenantId', 'worldId', 'sessionId', 'mindId'].every(
    key => typeof scope[key as keyof MindAuthorityScope] === 'string' &&
      scope[key as keyof MindAuthorityScope].trim().length > 0,
  );

/**
 * Client-side projection only; input must originate at an authorized gateway.
 * Each ledger is bound to a single exact tenant/world/session/Mind identity.
 */
export class MindEventLedger {
  private readonly events: MindEvent[] = [];
  private readonly byIdempotencyKey = new Map<string, MindEvent>();
  private readonly scope: Readonly<MindAuthorityScope>;

  constructor(scope: MindAuthorityScope) {
    if (!scope || !hasScope(scope)) throw new Error('invalid_projection_scope');
    this.scope = Object.freeze({ ...scope });
  }

  append(event: unknown): AppendResult {
    assertMindEvent(event);
    for (const key of ['tenantId', 'worldId', 'sessionId', 'mindId'] as const) {
      if (event[key] !== this.scope[key]) {
        throw new Error('projection_scope_mismatch');
      }
    }

    // Use a fresh transport snapshot: the caller may modify its original JSON.
    const received: MindEvent = structuredClone(event);
    const previous = this.byIdempotencyKey.get(received.idempotencyKey);
    if (previous) {
      // A collision is NOT an idempotent retry, even when eventId matches.
      if (JSON.stringify(previous) !== JSON.stringify(received)) {
        throw new Error('idempotency_conflict');
      }
      return { status: 'DUPLICATE', event: structuredClone(previous) };
    }

    const last = this.events.at(-1);
    const expectedSequence = (last?.sequence ?? 0) + 1;
    if (received.sequence !== expectedSequence) {
      throw new Error('sequence_gap:expected_' + expectedSequence +
        ':received_' + received.sequence);
    }

    this.events.push(received);
    this.byIdempotencyKey.set(received.idempotencyKey, received);
    return { status: 'APPENDED', event: structuredClone(received) };
  }

  snapshot(): readonly MindEvent[] {
    return structuredClone(this.events);
  }

  rollbackTo(sequence: number): void {
    if (!Number.isSafeInteger(sequence) || sequence < 0) {
      throw new Error('invalid_rollback_sequence');
    }
    while ((this.events.at(-1)?.sequence ?? 0) > sequence) {
      const removed = this.events.pop();
      if (removed) this.byIdempotencyKey.delete(removed.idempotencyKey);
    }
  }
}
