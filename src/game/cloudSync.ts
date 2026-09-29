// ─────────────────────────────────────────────────────────────────────────────
// CLOUD SYNC
// Bridges local gameState + companionManager ↔ the syncSave backend function.
// Call cloudSync.init() on app boot. It auto-saves on a debounced interval.
// ─────────────────────────────────────────────────────────────────────────────

import { gameState } from './gameState';
import { companionManager } from './companionSystem';

const SYNC_URL = 'https://kindred-492933f1.base44.app/functions/syncSave';
const DEBOUNCE_MS = 4000;    // wait 4s after last change before syncing
const SAVE_VERSION_KEY = 'ai_crawl_save_version';

function safeStorage(): Storage | undefined {
  try {
    return typeof globalThis.localStorage === 'undefined' ? undefined : globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function readSaveVersion(): number {
  try {
    const raw = safeStorage()?.getItem(SAVE_VERSION_KEY);
    const version = raw === null || raw === undefined ? 0 : Number.parseInt(raw, 10);
    return Number.isFinite(version) && version >= 0 ? version : 0;
  } catch {
    return 0;
  }
}

function writeSaveVersion(version: number): void {
  try {
    safeStorage()?.setItem(SAVE_VERSION_KEY, String(version));
  } catch {
    // Cloud remains usable when local browser storage is disabled or full.
  }
}

type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error' | 'offline' | 'conflict';

class CloudSync {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private saveVersion = 0;
  private status: SyncStatus = 'idle';
  private statusListeners: Array<(s: SyncStatus) => void> = [];
  private initialized = false;
  private authToken: string | null = null;

  // Call this once from App with the Base44 auth token
  async init(token: string | null) {
    this.authToken = token;
    this.saveVersion = readSaveVersion();

    if (!token) {
      this.setStatus('offline');
      return;
    }

    // Try to load cloud save
    try {
      this.setStatus('syncing');
      const res = await this.call({ action: 'load' });

      if (res.found) {
        const localVersion = readSaveVersion();
        // Cloud is newer — load it
        if ((res.saveVersion ?? 0) > localVersion) {
          console.log('[CloudSync] Loading cloud save (version', res.saveVersion, '> local', localVersion, ')');
          gameState.update(res.playerState);
          companionManager.loadFromCloud(res.companions ?? [], res.activeCompanionId ?? null);
          this.saveVersion = res.saveVersion;
          writeSaveVersion(this.saveVersion);
        } else {
          console.log('[CloudSync] Local save is current, pushing to cloud');
          await this.pushNow();
        }
      } else {
        // No cloud save yet — push local
        console.log('[CloudSync] No cloud save found, pushing local');
        await this.pushNow();
      }
      this.setStatus('saved');
    } catch (e) {
      console.warn('[CloudSync] Init failed:', e);
      this.setStatus('error');
    }

    // Subscribe once: repeated auth refreshes must not multiply cloud writes.
    if (!this.initialized) {
      gameState.subscribe(() => this.scheduleSave());
      companionManager.subscribe(() => this.scheduleSave());
      this.initialized = true;
    }
  }

  private scheduleSave() {
    if (!this.authToken) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.pushNow(), DEBOUNCE_MS);
  }

  async pushNow(): Promise<void> {
    if (!this.authToken) return;
    try {
      this.setStatus('syncing');
      this.saveVersion += 1;
      writeSaveVersion(this.saveVersion);

      const player = gameState.get();
      const companions = companionManager.getAll();
      const activeId = companionManager.getActive()?.id ?? null;

      const res = await this.call({
        action: 'save',
        playerState: player,
        companions,
        activeCompanionId: activeId,
        saveVersion: this.saveVersion,
      });

      if (res.conflict) {
        // Cloud has newer data — load it
        console.log('[CloudSync] Conflict detected, loading cloud version', res.cloudVersion);
        gameState.update(res.playerState);
        companionManager.loadFromCloud(res.companions ?? [], res.activeCompanionId ?? null);
        this.saveVersion = res.cloudVersion;
        writeSaveVersion(this.saveVersion);
        this.setStatus('conflict');
        setTimeout(() => this.setStatus('saved'), 2000);
      } else {
        this.setStatus('saved');
      }
    } catch {
      this.setStatus('error');
    }
  }

  async deleteCloudSave(): Promise<void> {
    if (!this.authToken) return;
    await this.call({ action: 'delete' });
    this.saveVersion = 0;
    writeSaveVersion(0);
  }

  private async call(body: object): Promise<any> {
    const res = await fetch(SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  getStatus(): SyncStatus { return this.status; }

  onStatus(fn: (s: SyncStatus) => void) {
    this.statusListeners.push(fn);
    return () => { this.statusListeners = this.statusListeners.filter(l => l !== fn); };
  }

  private setStatus(s: SyncStatus) {
    this.status = s;
    this.statusListeners.forEach(fn => fn(s));
  }
}

export const cloudSync = new CloudSync();
