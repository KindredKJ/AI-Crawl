import test from 'node:test';
import assert from 'node:assert/strict';
import {
  KINFT_CATALOG, KINFT_RARITIES, KINFTVault,
} from '../../src/game/kinft';
import type { KINFTVictory } from '../../src/game/kinft';

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}
const event = (id: string, overrides: Partial<KINFTVictory> = {}): KINFTVictory => ({
  eventId: id, encounterId: 'dust-titan', playerLevel: 1,
  totalWins: 1, boss: false, won: true, ...overrides,
});

test('KINFT rarity catalog preserves all six canonical tiers and unlock classes', () => {
  assert.deepEqual(KINFT_RARITIES, ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'OTHERWORLDLY']);
  assert.deepEqual(new Set(KINFT_CATALOG.map(def => def.kind)),
    new Set(['SKILL','CHARACTER','POWER','WEAPON','GEAR','COMPANION']));
  for (const def of KINFT_CATALOG) {
    assert.ok(def.requiredPlayerLevel >= 1);
    assert.ok(def.abilities.length >= 1);
    assert.ok(KINFT_RARITIES.includes(def.rarity));
  }
});

test('ordinary victories earn essence, but KINFT grants occur at milestones', () => {
  const vault = new KINFTVault(new MemoryStorage());
  for (let n = 1; n <= 5; n++) {
    const result = vault.awardVictory(event('regular-' + n, { totalWins: n }));
    assert.equal(result.essence, 2);
    assert.equal(Boolean(result.newItem), n === 5);
    assert.equal(result.alreadyProcessed, false);
  }
  assert.equal(vault.get().essence, 10);
  assert.equal(vault.get().items.length, 1);
});

test('losses and invalid receipts never generate rewards', () => {
  const vault = new KINFTVault(new MemoryStorage());
  assert.equal(vault.awardVictory(event('lost', { won: false })).newItem, null);
  assert.equal(vault.awardVictory(event('invalid id!')).essence, 0);
  assert.deepEqual(vault.get().items, []);
  assert.equal(vault.get().essence, 0);
});

test('first boss clear is a unique reward even across multiple battles', () => {
  const vault = new KINFTVault(new MemoryStorage());
  const first = vault.awardVictory(event('boss-session-a', { boss: true }));
  assert.ok(first.newItem);
  assert.equal(first.newItem?.level, 1);
  assert.equal(first.newItem?.state, 'LOCAL_REWARD_UNVERIFIED');
  assert.equal(vault.awardVictory(event('boss-session-a', { boss: true })).alreadyProcessed, true);
  const rematch = vault.awardVictory(event('boss-session-b', { boss: true, totalWins: 2 }));
  assert.equal(rematch.newItem, null);
  assert.equal(vault.get().items.length, 1);
  assert.equal(vault.get().essence, 16);
});

test('inventory, upgrades and idempotent events survive reload', () => {
  const store = new MemoryStorage();
  const vault = new KINFTVault(store);
  const earned = vault.awardVictory(event('boss-unique', { boss: true }));
  assert.ok(earned.newItem);
  const owned = earned.newItem!;
  assert.equal(vault.equip('KINFT:not-owned', 100), false);
  assert.equal(vault.equip(owned.id, 1), true);
  const name = KINFT_CATALOG.find(def => def.id === owned.definitionId)!;
  assert.equal(vault.get().equipped[name.kind], owned.id);

  for (let i = 0; i < 20; i++) vault.awardVictory(event('regular-extra-' + i, { totalWins: i + 2 }));
  const before = vault.get().essence;
  assert.equal(vault.train(owned.id), true);
  assert.ok(vault.get().essence < before);
  assert.equal(vault.get().items.find(item => item.id === owned.id)?.level, 2);

  const reloaded = new KINFTVault(store);
  assert.equal(reloaded.get().items.find(item => item.id === owned.id)?.level, 2);
  assert.equal(reloaded.get().equipped[name.kind], owned.id);
  assert.equal(reloaded.awardVictory(event('boss-unique', { boss: true })).alreadyProcessed, true);
});

test('equipped KINFT bonuses stay bounded; pending Unreal assets never provide browser combat power', () => {
  const vault = new KINFTVault(new MemoryStorage());
  const item = vault.awardVictory(event('boss-equipped', { boss: true })).newItem!;
  const def = KINFT_CATALOG.find(entry => entry.id === item.definitionId)!;
  const notEquipped = vault.combatBonuses();
  assert.ok(notEquipped.attackPct <= 0.0, 'precision stance exchanges damage for accuracy');
  assert.ok(notEquipped.critChancePct > 0, 'precision stance is active without a KINFT');
  vault.equip(item.id, 1);
  const after = vault.combatBonuses();
  assert.ok(after.attackPct <= 0.3);
  assert.ok(after.defensePct <= 0.25);
  assert.ok(after.critChancePct <= 0.15);
  assert.ok(after.dodgeChancePct <= 0.15);
  if (def.implementation === 'UNREAL_CONTENT_PENDING') {
    assert.deepEqual(after, notEquipped);
  }
});

test('no local reward claims to be a minted ERC-721 or proven chain ownership', () => {
  const vault = new KINFTVault(new MemoryStorage());
  const item = vault.awardVictory(event('boss-onchain', { boss: true })).newItem!;
  assert.equal(item.state, 'LOCAL_REWARD_UNVERIFIED');
  assert.equal('tokenId' in item, false);
  assert.equal('contractAddress' in item, false);
  assert.equal('wallet' in item, false);
});
