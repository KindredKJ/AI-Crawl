/** Versioned AI Crawl product contracts consumed from the StrataCast event bus. */
export const MIND_EVENT_SCHEMA = 'aicrawl.mind-event/v1' as const;

export type TruthClass =
  | 'OBSERVED'
  | 'MEASURED'
  | 'REPORTED'
  | 'DERIVED'
  | 'PREDICTED'
  | 'PLANNED'
  | 'SIMULATED'
  | 'UNKNOWN';

export type GuidanceDisposition = 'ACCEPTED' | 'DEFERRED' | 'REJECTED' | 'ESCALATED';

export interface EventIdentity {
  eventId: string;
  idempotencyKey: string;
  sequence: number;
  occurredAt: string;
  mindId: string;
  worldId: string;
  sessionId: string;
  tenantId: string;
}

export interface Provenance {
  producer: string;
  sourceEventIds: string[];
  runtimeVersion: string;
}

interface MindEventBase<TType extends string, TPayload> extends EventIdentity {
  schemaVersion: typeof MIND_EVENT_SCHEMA;
  type: TType;
  truthClass: TruthClass;
  payload: TPayload;
  provenance: Provenance;
}

export type MindEvent =
  | MindEventBase<'mind.objective.changed', { objective: string; stage: string }>
  | MindEventBase<'mind.observation.recorded', { summary: string; confidence: number }>
  | MindEventBase<'mind.guidance.received', { guidanceId: string; summary: string }>
  | MindEventBase<'mind.guidance.evaluated', {
      guidanceId: string;
      disposition: GuidanceDisposition;
      rationale: string;
      requiredApproval: string | null;
    }>
  | MindEventBase<'mind.action.executed', { action: string; outcome: 'SUCCEEDED' | 'FAILED' }>
  | MindEventBase<'mind.status.unknown', { field: string; reason: string }>;

export function assertMindEvent(event: MindEvent): void {
  if (event.schemaVersion !== MIND_EVENT_SCHEMA) throw new Error('unsupported_schema');
  if (!event.eventId || !event.idempotencyKey) throw new Error('missing_event_identity');
  if (!Number.isSafeInteger(event.sequence) || event.sequence < 1) throw new Error('invalid_sequence');
  if (Number.isNaN(Date.parse(event.occurredAt))) throw new Error('invalid_timestamp');
  if (!event.mindId || !event.worldId || !event.sessionId || !event.tenantId) {
    throw new Error('missing_authority_scope');
  }
  if (!event.provenance.producer || !event.provenance.runtimeVersion) {
    throw new Error('missing_provenance');
  }
  if (event.type === 'mind.observation.recorded') {
    if (event.truthClass !== 'OBSERVED' && event.truthClass !== 'MEASURED') {
      throw new Error('observation_requires_direct_truth_class');
    }
    if (event.payload.confidence < 0 || event.payload.confidence > 1) {
      throw new Error('invalid_confidence');
    }
  }
  if (event.type === 'mind.guidance.evaluated' && event.truthClass !== 'DERIVED') {
    throw new Error('evaluation_requires_derived_truth_class');
  }
}

