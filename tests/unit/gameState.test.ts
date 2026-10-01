import test from 'node:test';
import assert from 'node:assert/strict';
import { GameStateManager } from '../../src/game/gameState';
import type { CombatResult } from '../../src/types';

class MemoryStorage {
  values = new Map<string, string>();
  failReads = false;
  failWrites = false;

  getItem(key: string): string | null {
    if (this.failReads) throw new Error('storage read blocked');
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.failWrites) throw new Error('storage quota exceeded');
    this.values.set(key, value);
  }
}

const emptyWin = (overrides: Partial<CombatResult> = {}): CombatResult => ({
  won: true,
  xpGained: 0,
  currencyGained: 0,
  damageDealt: 0,
  damageTaken: 0,
  kills: 1,
  loot: null,
  lootItems: [],
  captured: false,
  ...overrides,
});

test('repairs truncated and malformed nested save data', () => {
  const storage = new MemoryStorage();
  storage.values.set('ai_crawl_save', JSON.stringify({ level: 4, inventory: null, stats: { battlesWon: 2 } }));
  const manager = new GameStateManager(storage);
  const state = manager.get();

  assert.equal(state.level, 4);
  assert.equal(state.inventory.weapons.length, 1);
  assert.deepEqual(state.inventory.materials, {});
  assert.equal(state.stats.battlesWon, 2);
  assert.equal(state.stats.totalCaptures, 0);
});

test('uses a fresh profile when save JSON is corrupt or storage is blocked', () => {
  const corrupt = new MemoryStorage();
  corrupt.values.set('ai_crawl_save', '{not json');
  assert.equal(new GameStateManager(corrupt).get().level, 1);

  const blocked = new MemoryStorage();
  blocked.failReads = true;
  const manager = new GameStateManager(blocked);
  blocked.failWrites = true;
  assert.doesNotThrow(() => manager.update({ currency: 900 }));
  assert.equal(manager.get().currency, 900);
});

test('returns isolated snapshots and ignores a failing subscriber', () => {
  const manager = new GameStateManager(new MemoryStorage());
  manager.subscribe(() => { throw new Error('unmounted view'); });
  const snapshot = manager.get();
  snapshot.inventory.weapons.pop();

  assert.equal(manager.get().inventory.weapons.length, 1);
  assert.doesNotThrow(() => manager.update({ currency: 750 }));
  assert.equal(manager.get().currency, 750);
});

test('applies multiple level ups and persists battle materials once', () => {
  const storage = new MemoryStorage();
  const manager = new GameStateManager(storage);
  const result = manager.applyBattleResult(emptyWin({
    xpGained: 275,
    lootItems: [{ id: 'quantum_core', name: 'Quantum Core', quantity: 2 }],
  }));
  const state = manager.get();

  assert.deepEqual(result, { didLevelUp: true, newLevel: 3 });
  assert.equal(state.xp, 25);
  assert.equal(state.xpToNext, 225);
  assert.equal(state.inventory.materials.quantum_core, 2);
  assert.equal(new GameStateManager(storage).get().inventory.materials.quantum_core, 2);
});
