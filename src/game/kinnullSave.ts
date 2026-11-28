/** Separate Kinnull-only offline campaign event ledger.
 * Replays authoritative game rules from event zero instead of trusting saved client snapshots.
 * Local saves cannot award purchases, money, tokens or server entitlements.
 */
import {
  advanceKinnull, createKinnullMission,
  type KinnullEvent, type KinnullMission,
} from './kinnullMission';

export const KINNULL_SAVE_KEY = 'ai_crawl_kinnull_awaken_v1';
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
const MAX_EVENTS = 1500;
function storageOrUndefined(): StorageLike | undefined {
  try { return typeof globalThis.localStorage === 'undefined' ? undefined : globalThis.localStorage; }
  catch { return undefined; }
}

function replay(input: unknown): KinnullMission {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new Error('Save must be a versioned event envelope');
  }
  const envelope = input as Record<string, unknown>;
  if (envelope.version !== 'kinnull.save/v1' || !Array.isArray(envelope.events) ||
      envelope.events.length > MAX_EVENTS) {
    throw new Error('Unrecognized mission save');
  }
  let state = createKinnullMission();
  for (const raw of envelope.events) {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      throw new Error('Invalid event in saved campaign');
    }
    state = advanceKinnull(state, raw as KinnullEvent);
  }
  return state;
}
export class KinnullMissionSave {
  #state: KinnullMission;
  #storage: StorageLike | undefined;
  #listeners = new Set<(state: KinnullMission) => void>();
  #lastLoadError = '';

  constructor(storage: StorageLike | undefined = storageOrUndefined()) {
    this.#storage = storage;
    let result = createKinnullMission();
    try {
      const raw = storage?.getItem(KINNULL_SAVE_KEY);
      if (raw !== undefined && raw !== null) result = replay(JSON.parse(raw) as unknown);
    } catch {
      this.#lastLoadError = 'An invalid local Kinnull save was rejected. Started a fresh campaign.';
    }
    this.#state = result;
  }
  get lastLoadError(): string { return this.#lastLoadError; }
  get(): KinnullMission { return structuredClone(this.#state); }
  subscribe(fn: (state: KinnullMission) => void): () => void {
    this.#listeners.add(fn);
    return () => this.#listeners.delete(fn);
  }
  dispatch(event: KinnullEvent): KinnullMission {
    const updated = advanceKinnull(this.#state, event);
    if (updated !== this.#state) {
      this.#state = updated;
      this.#persist();
      for (const fn of [...this.#listeners]) {
        try { fn(this.get()); } catch { /* broken visual subscriber cannot block progress */ }
      }
    }
    return this.get();
  }
  /** Explicitly begin a separate new run; never rewind the identity of an active campaign. */
  newRun(): void {
    this.#state = createKinnullMission();
    this.#persist();
    for (const fn of [...this.#listeners]) {
      try { fn(this.get()); } catch { /* visual subscriber isolation */ }
    }
  }
  #persist(): void {
    try {
      this.#storage?.setItem(KINNULL_SAVE_KEY, JSON.stringify({
        version: 'kinnull.save/v1', events: this.#state.events,
      }));
    } catch {
      // Offline play remains usable if storage is unavailable; persistence is not guaranteed.
    }
  }
}
export const kinnullMissionSave = new KinnullMissionSave();
