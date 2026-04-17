import { Enemy } from '../types';

export type ZoneId = 'SECTOR_1' | 'SECTOR_2' | 'SECTOR_3' | 'SECTOR_4' | 'NEXUS_PRIME';

export interface Zone {
  id: ZoneId;
  name: string;
  threatLevel: string;
  description: string;
  minLevel: number;
  enemies: Enemy[];
  bossEnemy: Enemy;
  xpMultiplier: number;
  currencyMultiplier: number;
}

const makeEnemy = (
  id: string,
  name: string,
  hp: number,
  atk: number,
  def: number,
  image: string,
  type: Enemy['type'],
  abilities: string[]
): Enemy => ({ id, name, hp, maxHp: hp, atk, def, image, type, abilities, isBoss: false });

export const ZONES: Zone[] = [
  {
    id: 'SECTOR_1',
    name: 'Sector V-1 Perimeter',
    threatLevel: 'CLASS C',
    description: 'Outer defense grid. Rogue drones and corrupted patrols.',
    minLevel: 1,
    xpMultiplier: 1,
    currencyMultiplier: 1,
    enemies: [
      makeEnemy('e_drone_1', 'Rogue Scout Drone', 400, 180, 50, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHGV0XRTj5tclke8KczDZOZrQJ8AElYYCYI-xMvGaN2aJOYt_5wBwrEpODKCs-YMyWl3mypjYywWTc7QumvebQgDJbi8k7SzQYCSTvRaYz1yheL8LCqoVCMBTWj3ddsVVcQUEdbTWiuqNu7-lqqBkJ0SbKVKIdWbvc4x7Wu8-9wHBUJyv0Z3IXvE64mRVKDnxKL13kewdmOz2EfUKE3x0TdtyxPogqqmxT_Xo-_rxWhHNSRRsOrMd40RtEiayWNMY_F-bNY4qqUrq6', 'MECHANICAL', ['Pulse Shot', 'Scan Lock']),
      makeEnemy('e_patrol_1', 'Corrupted Patrol Unit', 600, 220, 80, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp', 'MECHANICAL', ['Override Strike', 'Shield Bash']),
      makeEnemy('e_wraith_1', 'Phantom Wraith', 350, 300, 30, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHGV0XRTj5tclke8KczDZOZrQJ8AElYYCYI-xMvGaN2aJOYt_5wBwrEpODKCs-YMyWl3mypjYywWTc7QumvebQgDJbi8k7SzQYCSTvRaYz1yheL8LCqoVCMBTWj3ddsVVcQUEdbTWiuqNu7-lqqBkJ0SbKVKIdWbvc4x7Wu8-9wHBUJyv0Z3IXvE64mRVKDnxKL13kewdmOz2EfUKE3x0TdtyxPogqqmxT_Xo-_rxWhHNSRRsOrMd40RtEiayWNMY_F-bNY4qqUrq6', 'ANOMALY', ['Phase Slash', 'Blink Strike']),
    ],
    bossEnemy: { ...makeEnemy('boss_1', 'WARDEN-01 Alpha', 2000, 380, 200, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp', 'BOSS', ['Overload Pulse', 'Lock-On Barrage', 'Emergency Protocol']), isBoss: true, maxHp: 2000 },
  },
  {
    id: 'SECTOR_2',
    name: 'Sector V-4 Citadel',
    threatLevel: 'CLASS B',
    description: 'Fortified inner city. Elite soldiers and weaponized constructs.',
    minLevel: 5,
    xpMultiplier: 1.8,
    currencyMultiplier: 1.6,
    enemies: [
      makeEnemy('e_soldier_2', 'Elite Vanguard', 900, 420, 150, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp', 'HUMANOID', ['Plasma Burst', 'Tactical Roll', 'Suppressive Fire']),
      makeEnemy('e_construct_2', 'Armored Construct', 1200, 350, 280, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHGV0XRTj5tclke8KczDZOZrQJ8AElYYCYI-xMvGaN2aJOYt_5wBwrEpODKCs-YMyWl3mypjYywWTc7QumvebQgDJbi8k7SzQYCSTvRaYz1yheL8LCqoVCMBTWj3ddsVVcQUEdbTWiuqNu7-lqqBkJ0SbKVKIdWbvc4x7Wu8-9wHBUJyv0Z3IXvE64mRVKDnxKL13kewdmOz2EfUKE3x0TdtyxPogqqmxT_Xo-_rxWhHNSRRsOrMd40RtEiayWNMY_F-bNY4qqUrq6', 'MECHANICAL', ['Iron Slam', 'Barrier Wall']),
    ],
    bossEnemy: { ...makeEnemy('boss_2', 'CITADEL PRIME', 4500, 680, 400, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp', 'BOSS', ['Fortress Mode', 'Orbital Strike', 'System Override']), isBoss: true, maxHp: 4500 },
  },
  {
    id: 'SECTOR_3',
    name: 'Sector V-7 Abyss',
    threatLevel: 'CLASS A',
    description: 'Deep anomaly zone. Reality-distorting entities and void crawlers.',
    minLevel: 10,
    xpMultiplier: 2.8,
    currencyMultiplier: 2.4,
    enemies: [
      makeEnemy('e_void_3', 'Void Crawler', 1500, 750, 200, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHGV0XRTj5tclke8KczDZOZrQJ8AElYYCYI-xMvGaN2aJOYt_5wBwrEpODKCs-YMyWl3mypjYywWTc7QumvebQgDJbi8k7SzQYCSTvRaYz1yheL8LCqoVCMBTWj3ddsVVcQUEdbTWiuqNu7-lqqBkJ0SbKVKIdWbvc4x7Wu8-9wHBUJyv0Z3IXvE64mRVKDnxKL13kewdmOz2EfUKE3x0TdtyxPogqqmxT_Xo-_rxWhHNSRRsOrMd40RtEiayWNMY_F-bNY4qqUrq6', 'ANOMALY', ['Void Rend', 'Reality Tear', 'Phase Storm']),
      makeEnemy('e_specter_3', 'Abyss Specter', 1100, 900, 120, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp', 'ANOMALY', ['Soul Drain', 'Terror Wave']),
    ],
    bossEnemy: { ...makeEnemy('boss_3', 'THE VOID SOVEREIGN', 8000, 1200, 600, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHGV0XRTj5tclke8KczDZOZrQJ8AElYYCYI-xMvGaN2aJOYt_5wBwrEpODKCs-YMyWl3mypjYywWTc7QumvebQgDJbi8k7SzQYCSTvRaYz1yheL8LCqoVCMBTWj3ddsVVcQUEdbTWiuqNu7-lqqBkJ0SbKVKIdWbvc4x7Wu8-9wHBUJyv0Z3IXvE64mRVKDnxKL13kewdmOz2EfUKE3x0TdtyxPogqqmxT_Xo-_rxWhHNSRRsOrMd40RtEiayWNMY_F-bNY4qqUrq6', 'BOSS', ['Abyssal Rift', 'Consume Reality', 'Void Ascension', 'Dimensional Collapse']), isBoss: true, maxHp: 8000 },
  },
  {
    id: 'NEXUS_PRIME',
    name: 'Nexus Prime',
    threatLevel: 'CLASS S',
    description: 'The origin point. Ancient AI overlords and world-ending threats.',
    minLevel: 20,
    xpMultiplier: 5,
    currencyMultiplier: 4,
    enemies: [
      makeEnemy('e_overlord_4', 'Ancient Overlord', 3000, 1400, 500, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp', 'BOSS', ['World Breaker', 'Time Collapse', 'Singularity']),
    ],
    bossEnemy: { ...makeEnemy('final_boss', 'ASCENSION — THE FINAL PROTOCOL', 20000, 2500, 1000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp', 'BOSS', ['Omega Strike', 'Reality Reset', 'Ascension Protocol', 'Endless Loop', 'Final Judgment']), isBoss: true, maxHp: 20000 },
  },
];

export function getZone(id: ZoneId): Zone {
  return ZONES.find(z => z.id === id) ?? ZONES[0];
}

export function getRandomEnemy(zone: Zone): Enemy {
  const pool = zone.enemies;
  const base = pool[Math.floor(Math.random() * pool.length)];
  // Fresh copy with full HP
  return { ...base, hp: base.maxHp };
}
