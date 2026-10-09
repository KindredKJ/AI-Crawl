import test from 'node:test';
import assert from 'node:assert/strict';
import {
 VERSION, RARITIES, WAVES, ENEMIES, CANON, newCampaign, transition, encounter, CampaignError,
 type CampaignState, type CampaignEvent, type Action,
} from '../../src/game/covenantDust';
import { CovenantDustSave } from '../../src/game/covenantDustSave';

function act(s:CampaignState,action:Action,extra:Partial<CampaignEvent>={}):CampaignState{
 return transition(s,{id:'local.'+(s.revision+1),revision:s.revision,action,...extra});
}
function fall():CampaignState{
 let s=newCampaign();s=act(s,'SHROUD_REDIRECT');s=act(s,'REVOLVER_FIRE');
 s=act(s,'AERIAL_DASH');return act(s,'SHROUD_BLOCK');
}
function town():CampaignState{
 let s=act(fall(),'MOUNT_HORSE');s=act(s,'RIDE_HARD');s=act(s,'HORSE_JUMP');
 return act(s,'FIRE_BACKWARD');
}
function revealed():CampaignState{
 let s=town();
 for(const clue of ['RADIO_VOICES','MISSING_THIRTEEN_SECONDS','OWNERSHIP_REWRITE'] as const){
  s=act(s,'INVESTIGATE',{clue});
 }
 return act(s,'ANALYZE_COVENANT');
}
function notary():CampaignState{
 let s=revealed();
 for(let i=1;i<=10;i++)s=act(s,'RESOLVE_WAVE',{tactic:'SHROUD',outcome:'SURVIVED'});
 return s;
}
class MemoryStorage {
 data=new Map<string,string>();
 getItem(k:string){return this.data.get(k)??null;}
 setItem(k:string,v:string){this.data.set(k,v);}
}
test('canon defines mystery, player fantasy, rarity and all ten wave phases',()=>{
 assert.equal(CANON.protagonist,'THE GUNSLINGER');
 assert.equal(CANON.unrevealedName,true);
 assert.deepEqual(RARITIES,['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','OTHERWORLDLY']);
 assert.equal(WAVES.length,10);
 assert.equal(ENEMIES.DUST_TITAN.rarity,'EPIC');
 assert.equal(newCampaign().version,VERSION);
});
test('Wave 0 begins in midair and requires Shroud, not arbitrary titan kills',()=>{
 let s=newCampaign();
 assert.equal(s.stage,'DEAD_SKY');
 for(let i=0;i<4;i++)s=act(s,'REVOLVER_FIRE');
 assert.equal(s.stage,'DEAD_SKY');
 s=act(s,'SHROUD_BLOCK');
 assert.equal(s.stage,'COLLAPSE_RUN');assert.equal(s.titanCount,3);
 assert.equal(s.objective,'REACH THE ARCHWAY');
 assert.equal(encounter(s).worldKernelMutation,false);
});
test('collapse escape keeps horse unknown while discovering Rider Link',()=>{
 assert.throws(()=>act(fall(),'HORSE_JUMP'),CampaignError);
 const s=town();assert.equal(s.stage,'MERCYS_END');
 assert.equal(s.horseIdentity,'UNKNOWN');assert.equal(s.mounted,true);
 assert.ok(s.awakenings.includes('RIDER_LINK'));assert.ok(s.awakenings.includes('DEAD_EYE'));
 assert.equal(s.strataKeys,0);
});
test('Mercys End requires genuine clue IDs, distinct evidence and Covenant Sight',()=>{
 let s=town();
 assert.throws(()=>act(s,'ANALYZE_COVENANT'),/Three independent/);
 s=act(s,'INVESTIGATE',{clue:'RADIO_VOICES'});
 assert.throws(()=>act(s,'INVESTIGATE',{clue:'RADIO_VOICES'}),/already/);
 const ready=revealed();
 assert.equal(ready.covenant,'EXPOSED');assert.ok(ready.awakenings.includes('COVENANT_SIGHT'));
});
test('wave director replays exactly and bounded tactics create adaptive enemy behavior',()=>{
 const s=revealed();
 assert.deepEqual(encounter(s),encounter({...s,tacticalMemory:{}}));
 const b=act(s,'RESOLVE_WAVE',{tactic:'SHROUD',outcome:'ESCAPED'});
 assert.equal(b.wave,2);
 const c=encounter(b);
 assert.ok(c.tactics.includes('COUNTER_SHROUD'));
 assert.ok(c.spawnBudget<=64);
 assert.equal(c.trust,'UNTRUSTED_LOCAL_DIRECTIVE');
 assert.equal(c.rewards,'LOCAL_PROGRESS_ONLY');
 assert.equal(encounter(b).seed,encounter(b).seed);
});
test('wave ten requires exposed Covenant; normal damage cannot defeat Notary',()=>{
 let s=town();
 for(let i=1;i<=9;i++)s=act(s,'RESOLVE_WAVE',{tactic:'COVER',outcome:'SURVIVED'});
 assert.equal(s.wave,10);
 assert.throws(()=>act(s,'RESOLVE_WAVE',{tactic:'SHROUD',outcome:'SURVIVED'}),/Expose/);
 s=notary();
 assert.equal(s.stage,'THE_NOTARY');
 let shot=act(s,'STRIKE_NOTARY');
 assert.equal(shot.notaryPhase,0);
 assert.equal(shot.strataKeys,0);
});
test('three distinct authority seals, not health bars, award first StrataKey',()=>{
 let s=notary();
 for(let i=1;i<=3;i++){
  s=act(s,'BREAK_AUTHORITY');assert.equal(s.notaryPhase,i);
 }
 assert.equal(s.stage,'FIRST_COVENANT_ENDING');
 assert.equal(s.covenant,'BROKEN');assert.equal(s.strataKeys,1);
 assert.match(s.objective,/1%/);
 assert.throws(()=>act(s,'BREAK_AUTHORITY'),/Campaign II/);
});
test('event IDs are idempotent and stale revisions are rejected',()=>{
 const s=newCampaign();
 const a:CampaignEvent={id:'unique.event',revision:0,action:'SHROUD_BLOCK'};
 const once=transition(s,a),twice=transition(once,a);
 assert.equal(once,twice);
 assert.throws(()=>transition(once,{...a,id:'other'}),/Out-of-order/);
 assert.throws(()=>transition(s,{id:'../../bad',revision:0,action:'SHROUD_BLOCK'}),/Invalid event/);
});
test('persistent dialogue choices cannot be overwritten by replay',()=>{
 let s=town();
 s=act(s,'RECORD_CHOICE',{choiceId:'marshal.trust',choice:'SPARE'});
 assert.equal(s.choices['marshal.trust'],'SPARE');
 assert.throws(()=>act(s,'RECORD_CHOICE',{choiceId:'marshal.trust',choice:'BETRAY'}),/Duplicate/);
});
test('campaign save is isolated, validates corruption and survives repeated revisioned decisions',()=>{
 const storage=new MemoryStorage();
 const m=new CovenantDustSave(storage);
 const a=m.dispatch({id:'one',revision:0,action:'SHROUD_BLOCK'});
 assert.equal(a.revision,1);
 assert.equal(new CovenantDustSave(storage).get().revision,1);
 const b=m.dispatch({id:'one',revision:0,action:'SHROUD_BLOCK'});
 assert.equal(b.revision,1);
 const savedKey=[...storage.data.keys()][0]!;
 const parsed=JSON.parse(storage.getItem(savedKey)!);
 parsed.publishingAuthorized=true;
 storage.setItem(savedKey,JSON.stringify(parsed));
 assert.equal(new CovenantDustSave(storage).get().revision,0);
 assert.equal(new CovenantDustSave(storage).get().publishingAuthorized,false);
});
test('authoritative privileges, true origin and unavailable awakenings remain closed',()=>{
 const s=newCampaign(11);
 assert.equal(s.awakenings.includes('HOST_CHANNEL'),false);
 assert.equal(s.awakenings.includes('SERAPH_DRIVE'),false);
 assert.equal(s.publishingAuthorized,false);
 assert.throws(()=>newCampaign(-1));
 assert.equal(CANON.mystery,'DO NOT KILL THE RIDER');
});
