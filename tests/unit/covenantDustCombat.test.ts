import test from 'node:test';
import assert from 'node:assert/strict';
import {newCampaign, transition, encounter, type CampaignState} from '../../src/game/covenantDust';
import {beginWaveCombat,takeWaveTurn,WaveCombatError} from '../../src/game/covenantDustCombat';
function town():CampaignState{
 let s=newCampaign();for(const a of ['SHROUD_BLOCK','REVOLVER_FIRE','AERIAL_DASH','SHROUD_REDIRECT'] as const){
  s=transition(s,{id:'freefall.'+s.revision,revision:s.revision,action:a});
 }
 for(const a of ['MOUNT_HORSE','RIDE_HARD','HORSE_JUMP','FIRE_BACKWARD'] as const){
  s=transition(s,{id:'escape.'+s.revision,revision:s.revision,action:a});
 }
 return s;
}
test('tactical encounter starts at Mercy wave one and is deterministic',()=>{
 const directive=encounter(town());
 const a=beginWaveCombat(directive);
 const b=beginWaveCombat(directive);
 assert.deepEqual(a,b);
 assert.equal(a.turn,0);
 assert.equal(a.status,'FIGHTING');
});
test('Shroud redirection consumes energy and damages an actual local threat',()=>{
 const a=beginWaveCombat(encounter(town()));
 const b=takeWaveTurn(a,'SHROUD_REDIRECT',['SHROUD'],true);
 assert.equal(b.shroudEnergy,2);
 assert.equal(b.enemyHP,a.enemyHP-32);
 assert.equal(b.turn,1);
 assert.throws(()=>takeWaveTurn(b,'SHROUD_REDIRECT',['SHROUD'],true),WaveCombatError);
});
test('Dead Eye requires awakening and a loaded revolver',()=>{
 const b=beginWaveCombat(encounter(town()));
 assert.throws(()=>takeWaveTurn(b,'DEAD_EYE',['SHROUD'],false),/not yet awakened/);
 const fired=takeWaveTurn(b,'DEAD_EYE',['SHROUD','DEAD_EYE'],false);
 assert.equal(fired.ammo,5);
 assert.equal(fired.enemyHP,b.enemyHP-40);
});
test('Rider Link traversal refuses a missing mount',()=>{
 const b=beginWaveCombat(encounter(town()));
 assert.throws(()=>takeWaveTurn(b,'RIDER_EVADE',['RIDER_LINK'],false),/not been discovered/);
 const result=takeWaveTurn(b,'RIDER_EVADE',['RIDER_LINK'],true);
 assert.equal(result.enemyHP,b.enemyHP-10);
});
test('survival, not just extermination, ends the wave after meaningful defense',()=>{
 const b=beginWaveCombat(encounter(town()));
 let s=b;
 for(let i=0;i<5&&s.status==='FIGHTING';i++)
  s=takeWaveTurn(s,i%2===0?'SHROUD_BLOCK':'TAKE_COVER',['SHROUD'],true);
 assert.equal(s.status,'SURVIVED');
 assert.ok(s.heroHP>0);
 assert.equal(s.turn,5);
 assert.equal(s.enemyHP,b.enemyHP);
 assert.throws(()=>takeWaveTurn(s,'REVOLVER',['SHROUD'],true),/already resolved/);
});
test('ballistics can defeat an enemy before it retaliates in a local encounter',()=>{
 const b=beginWaveCombat(encounter(town()));let s=b;
 while(s.status==='FIGHTING')s=takeWaveTurn(s,'DEAD_EYE',['DEAD_EYE'],true);
 assert.equal(s.status,'ROUTED');
 assert.equal(s.enemyHP,0);
 assert.equal(s.heroHP>0,true);
});
test('randomness cannot change identical encounter outcomes and directives remain local-only',()=>{
 const dir=encounter(town());
 const a=takeWaveTurn(beginWaveCombat(dir),'DODGE',['SHROUD'],true);
 const b=takeWaveTurn(beginWaveCombat(dir),'DODGE',['SHROUD'],true);
 assert.deepEqual(a,b);
 assert.equal(dir.worldKernelMutation,false);
 assert.equal(dir.rewards,'LOCAL_PROGRESS_ONLY');
});
