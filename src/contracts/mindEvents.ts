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

/** Validate untrusted deserialized transport input before it enters a Mind projection. */
export function assertMindEvent(value: unknown): asserts value is MindEvent {
  const valid = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);
  const nonEmpty = (v: unknown): v is string =>
    typeof v === 'string' && v.trim().length > 0;
  const requireString = (v: unknown, code: string): void => {
    if (!nonEmpty(v)) throw new Error(code);
  };

  if (!valid(value)) throw new Error('invalid_event_shape');
  const e = value;
  if (e.schemaVersion !== MIND_EVENT_SCHEMA) throw new Error('unsupported_schema');
  requireString(e.eventId, 'missing_event_identity');
  requireString(e.idempotencyKey, 'missing_event_identity');
  if (!Number.isSafeInteger(e.sequence) || (e.sequence as number) < 1) {
    throw new Error('invalid_sequence');
  }
  if (!nonEmpty(e.occurredAt) || !Number.isFinite(Date.parse(e.occurredAt))) {
    throw new Error('invalid_timestamp');
  }
  for (const field of ['mindId', 'worldId', 'sessionId', 'tenantId']) {
    requireString(e[field], 'missing_authority_scope');
  }
  const truths: readonly unknown[] = [
    'OBSERVED', 'MEASURED', 'REPORTED', 'DERIVED',
    'PREDICTED', 'PLANNED', 'SIMULATED', 'UNKNOWN',
  ];
  if (!truths.includes(e.truthClass)) throw new Error('invalid_truth_class');
  if (!valid(e.provenance)) throw new Error('missing_provenance');
  requireString(e.provenance.producer, 'missing_provenance');
  requireString(e.provenance.runtimeVersion, 'missing_provenance');
  if (!Array.isArray(e.provenance.sourceEventIds) ||
      !e.provenance.sourceEventIds.every(nonEmpty)) {
    throw new Error('invalid_provenance_sources');
  }

  if (!valid(e.payload)) throw new Error('invalid_payload');
  const payload = e.payload;
  switch (e.type) {
    case 'mind.objective.changed':
      requireString(payload.objective, 'invalid_objective');
      requireString(payload.stage, 'invalid_objective_stage');
      break;
    case 'mind.observation.recorded':
      if (e.truthClass !== 'OBSERVED' && e.truthClass !== 'MEASURED') {
        throw new Error('observation_requires_direct_truth_class');
      }
      requireString(payload.summary, 'invalid_observation');
      if (typeof payload.confidence !== 'number' ||
          !Number.isFinite(payload.confidence) ||
          payload.confidence < 0 || payload.confidence > 1) {
        throw new Error('invalid_confidence');
      }
      break;
    case 'mind.guidance.received':
      requireString(payload.guidanceId, 'invalid_guidance');
      requireString(payload.summary, 'invalid_guidance');
      break;
    case 'mind.guidance.evaluated':
      if (e.truthClass !== 'DERIVED') {
        throw new Error('evaluation_requires_derived_truth_class');
      }
      requireString(payload.guidanceId, 'invalid_guidance');
      requireString(payload.rationale, 'invalid_guidance');
      if (!['ACCEPTED', 'DEFERRED', 'REJECTED', 'ESCALATED'].includes(
          payload.disposition as string)) throw new Error('invalid_disposition');
      if (payload.requiredApproval !== null &&
          !nonEmpty(payload.requiredApproval)) {
        throw new Error('invalid_required_approval');
      }
      break;
    case 'mind.action.executed':
      requireString(payload.action, 'invalid_action');
      if (payload.outcome !== 'SUCCEEDED' && payload.outcome !== 'FAILED') {
        throw new Error('invalid_action_outcome');
      }
      break;
    case 'mind.status.unknown':
      if (e.truthClass !== 'UNKNOWN') throw new Error('unknown_requires_unknown_truth_class');
      requireString(payload.field, 'invalid_unknown_status');
      requireString(payload.reason, 'invalid_unknown_status');
      break;
    default:
      throw new Error('unknown_event_type');
  }
}
