import test from 'node:test';
import assert from 'node:assert/strict';
import { COVENANT_ENTITIES,validateRegistry,visibleEntity,rarityBehavior,contestFictionalClaim } from '../../src/game/covenantDustRegistry';
import {RIDERS,proposeAllyAction,type AllySituation} from '../../src/game/covenantDustCompanions';
test('entity registry has unique IDs, semantic rarity and spoiler-safe discovery',()=>{
 validateRegistry();
 assert.equal(new Set(COVENANT_ENTITIES.map(x=>x.id)).size,COVENANT_ENTITIES.length);
 assert.equal(visibleEntity('enemy.dust-titan').title,'UNKNOWN ENTITY');
 assert.equal(visibleEntity('enemy.dust-titan',['enemy.dust-titan']).rarity,'EPIC');
 assert.equal(visibleEntity('mount.unknown',['mount.unknown']).rarity,'UNREVEALED');
 assert.ok(rarityBehavior('OTHERWORLDLY').includes('world-scale-consequences'));
 assert.ok(rarityBehavior('LEGENDARY').includes('unique-boss-phases'));
});
test('fictional Notary property claims need Covenant Sight and evidence; never real-world calls',()=>{
 const claim={claimId:'notary.seal.1',worldId:'world.mercys-end',territoryId:'saloon',
  covenantId:'contract.black-covenant',power:'CLAIM_TERRAIN' as const,status:'ACTIVE' as const,
  inWorldOnly:true as const,externalEffect:false as const};
 assert.throws(()=>contestFictionalClaim(claim,false,4));
 assert.throws(()=>contestFictionalClaim(claim,true,2));
 const broken=contestFictionalClaim(claim,true,4);
 assert.equal(broken.status,'INVALIDATED');
 assert.equal(broken.externalEffect,false);
 assert.throws(()=>contestFictionalClaim(broken,true,4));
});
test('companions have distinct roles and propose independent, approval-bound tactics',()=>{
 assert.equal(RIDERS.length,5);
 const situation:AllySituation={worldId:'world.mercys-end',ally:'ENGINEER',stage:'MERCYS_END',
  incomingThreat:'COVENANT_SEAL',playerDecision:'INVESTIGATE',eligibleRoster:['ENGINEER'],
  memory:{trust:75,warningsHeeded:3,timesRescued:1,decisions:[]}};
 const plan=proposeAllyAction(situation);
 assert.equal(plan.intent,'BREAK_COVENANT');
 assert.equal(plan.requiresWorldKernelApproval,true);
 assert.equal(plan.executed,false);
 assert.equal(plan.awardsGranted,false);
 const refusal=proposeAllyAction({...situation,playerDecision:'ATTACK',incomingThreat:'PROJECTILES',
  memory:{...situation.memory,trust:12}});
 assert.equal(refusal.intent,'REFUSE');
 const rescue=proposeAllyAction({...situation,incomingThreat:'ALLY_DOWN'});
 assert.equal(rescue.intent,'RESCUE');
 assert.throws(()=>proposeAllyAction({...situation,eligibleRoster:[]}));
});
