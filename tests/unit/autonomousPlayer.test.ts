import test from 'node:test';
import assert from 'node:assert/strict';
import { newCampaign, transition, encounter, type CampaignState } from '../../src/game/covenantDust';
import { beginWaveCombat, takeWaveTurn, type WaveBattle, type CombatMove } from '../../src/game/covenantDustCombat';
import {
 chooseCombat, decidePilot, learn, observedReward, parsePilotMemory,
 PILOT_SCHEMA, type PilotMemory, type PilotStyle,
} from '../../src/game/autonomousPlayer';

test('autonomous combat: legal, deterministic, adversary-aware and bounded', () => {
 let s = newCampaign(91);
 for (const action of ['SHROUD_REDIRECT','REVOLVER_FIRE','AERIAL_DASH','SHROUD_BLOCK',
   'MOUNT_HORSE','RIDE_HARD','HORSE_JUMP','FIRE_BACKWARD'] as const) {
  s = transition(s,{id:'setup.'+s.revision,revision:s.revision,action});
 }
 assert.equal(s.stage,'MERCYS_END');
 const battle = beginWaveCombat(encounter(s));
 const first = chooseCombat(battle,s,{},'BALANCED',[]);
 const again = chooseCombat(battle,s,{},'BALANCED',[]);
 assert.deepEqual(first,again);
 assert.equal(first.kind,'COMBAT');
 if (first.kind==='COMBAT') {
  assert.deepEqual(first.projected,takeWaveTurn(battle,first.action,s.awakenings,s.mounted));
  assert.ok(first.reason.includes(battle.nextThreat));
 }
});

test('AI pilot completes every authored campaign chapter, ten waves, and boss seals', () => {
 let state: CampaignState = newCampaign(1987);
 let battle: WaveBattle | null = null;
 let memory: PilotMemory = {};
 let moves: CombatMove[] = [];
 const observed = { turns:0, routed:0, survived:0, failed:0, decisions:0 };
 const styles: PilotStyle[] = ['BALANCED','CINEMATIC','SURVIVAL','EXPLORER'];

 for (let i=0;i<220;i++) {
  if(state.stage==='MERCYS_END' && !battle) battle=beginWaveCombat(encounter(state));
  const intent=decidePilot(state,battle,memory,styles[i % styles.length]!,moves);
  if(intent.kind==='STOP') {
   assert.equal(state.stage,'FIRST_COVENANT_ENDING',
    'Autoplayer stopped before the canonical campaign was complete: '+intent.reason);
   break;
  }
  if(intent.kind==='RETRY') {
   observed.failed++;
   assert.ok(observed.failed<=2,'tactical policy could not complete a playable wave');
   battle=beginWaveCombat(encounter(state));
   continue;
  }
  if(intent.kind==='COMBAT') {
   assert.ok(battle);
   const after=takeWaveTurn(battle!,intent.action,state.awakenings,state.mounted);
   assert.deepEqual(intent.projected,after);
   assert.ok(after.turn===battle!.turn+1);
   memory=learn(memory,intent.context,observedReward(battle!,after));
   moves=[...moves.slice(-7),intent.action];
   battle=after;
   observed.turns++;
   if(after.status==='ROUTED') observed.routed++;
   if(after.status==='SURVIVED') observed.survived++;
  } else {
   const beforeWave=state.wave, beforeStage=state.stage;
   state=transition(state,{id:'pilot.test.'+state.revision,revision:state.revision,
    action:intent.action,...intent.fields});
   if(intent.action==='RESOLVE_WAVE') {
    assert.ok(state.wave>beforeWave || state.stage!==beforeStage);
    battle=state.stage==='MERCYS_END'?beginWaveCombat(encounter(state)):null;
   }
  }
  observed.decisions++;
 }
 assert.equal(state.stage,'FIRST_COVENANT_ENDING');
 assert.equal(state.strataKeys,1);
 assert.equal(state.covenant,'BROKEN');
 assert.equal(state.notaryPhase,3);
 assert.equal(state.wave,10);
 assert.equal(observed.failed,0);
 assert.ok(observed.turns>=10);
 assert.ok(observed.decisions>=35);
 assert.ok(Object.keys(memory).length>0);
 assert.equal(state.publishingAuthorized,false);
});

test('memory importer discards corrupt, oversized and out-of-policy records', () => {
 const key='EARLY.HEALTHY.PROJECTILE_VOLLEY.DEAD_EYE';
 const valid=parsePilotMemory({schemaVersion:PILOT_SCHEMA, values:{
  [key]:{visits:4,meanReward:18},
 }});
 assert.equal(valid[key]?.visits,4);
 assert.deepEqual(parsePilotMemory({schemaVersion:'unknown',values:{}}),{});
 assert.deepEqual(parsePilotMemory({schemaVersion:PILOT_SCHEMA,values:{
  [key]:{visits:Infinity,meanReward:0},
 }}),{});
 assert.deepEqual(parsePilotMemory({schemaVersion:PILOT_SCHEMA,values:{
  ['INJECT.RUN.SHELL']: {visits:1,meanReward:1},
 }}),{});
 assert.throws(()=>learn({},'invalid.command',50));
 assert.throws(()=>learn({},key,Infinity));
});

test('observed training will not accept a different battle or counterfeit turn', () => {
 const s=newCampaign();
 const encounterStub={wave:1,sourceSeed:101,turn:0,heroHP:160,enemyHP:59,
  shroudEnergy:4,ammo:6,coverIntegrity:60,status:'FIGHTING' as const,
  nextThreat:'MELEE_DIVE' as const,journal:[]};
 void s;
 assert.throws(()=>observedReward(encounterStub,{...encounterStub,turn:0}));
 assert.throws(()=>observedReward(encounterStub,{...encounterStub,turn:1,sourceSeed:99}));
});
