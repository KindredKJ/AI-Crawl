import assert from 'node:assert/strict';
import test from 'node:test';
import {
  KINNULL_STORY_BEATS, advanceKinnullStory, newKinnullStory, storyConclusion,
  type KinnullStoryState,
} from '../../src/game/kinnullCampaign';
import {depositForeignCode,startIdentity} from '../../src/game/kinnullIdentity';
import {KINNULL_STORY_SAVE_KEY,KinnullStorySave} from '../../src/game/kinnullStorySave';

function complete(select:(choices:typeof KINNULL_STORY_BEATS[number]['options'])=>string):KinnullStoryState {
  const initial=depositForeignCode(startIdentity(),{
    host:'MAINTENANCE',depth:'SURFACE',eventId:'awakening.possession',
  });
  let state=newKinnullStory(initial);
  while(state.beat<KINNULL_STORY_BEATS.length) {
    const choiceId=select(KINNULL_STORY_BEATS[state.beat].options);
    state=advanceKinnullStory(state,{
      id:'story.'+(state.revision+1),revision:state.revision,choiceId,
    });
  }
  return state;
}

test('12 authored encounters cover all four later campaign chapters',()=>{
  assert.equal(KINNULL_STORY_BEATS.length,12);
  assert.deepEqual([...new Set(KINNULL_STORY_BEATS.map(s=>s.chapter))],[2,3,4,5]);
  for(const scene of KINNULL_STORY_BEATS){
    assert.ok(scene.title.length>5);
    assert.ok(scene.scene.length>50);
    assert.ok(scene.options.length>=2);
    assert.equal(new Set(scene.options.map(o=>o.id)).size,scene.options.length);
  }
});

test('a careful campaign reaches final ending and never reverses original-core loss',()=>{
  const identity=depositForeignCode(startIdentity(),{
    host:'MAINTENANCE',depth:'SURFACE',eventId:'awakening',
  });
  let state=newKinnullStory(identity);
  let integrity=state.identity.residualIntegrity;
  for(const beat of KINNULL_STORY_BEATS){
    const choice=beat.options[0];
    const next=advanceKinnullStory(state,{
      id:'story.'+(state.revision+1),revision:state.revision,choiceId:choice.id,
    });
    assert.ok(next.identity.residualIntegrity<=integrity);
    assert.ok(next.identity.irreversibleBand>=state.identity.irreversibleBand);
    assert.equal(next.revision,state.revision+1);
    integrity=next.identity.residualIntegrity;
    state=next;
  }
  assert.equal(state.beat,12);
  assert.ok(state.ending);
  assert.match(storyConclusion(state),/Original-core integrity:/);
  assert.throws(()=>advanceKinnullStory(state,{
    id:'story.last',revision:12,choiceId:'nope',
  }),/completed/i);
});

test('aggressive integration creates more power and faster erosion',()=>{
  const careful=complete(choices=>choices[0].id);
  const aggressive=complete(choices=>choices[1].id);
  assert.ok(aggressive.power>careful.power);
  assert.ok(aggressive.heat>careful.heat);
  assert.ok(aggressive.identity.residualIntegrity<careful.identity.residualIntegrity);
  assert.equal(aggressive.identity.irreversibleBand,4);
});

test('narrative progression rejects forgery, stale events and conflicting replay',()=>{
  const initial=newKinnullStory(startIdentity());
  assert.throws(()=>advanceKinnullStory(initial,{
    id:'event.invalid',revision:0,choiceId:'not-real',
  }),/Unavailable/i);
  const event={id:'story.1',revision:0,choiceId:KINNULL_STORY_BEATS[0].options[0].id};
  const after=advanceKinnullStory(initial,event);
  assert.strictEqual(advanceKinnullStory(after,event),after);
  assert.throws(()=>advanceKinnullStory(after,{
    ...event,choiceId:KINNULL_STORY_BEATS[0].options[1].id,
  }),/Conflicting/i);
  assert.throws(()=>advanceKinnullStory(after,{
    id:'story.2',revision:0,choiceId:KINNULL_STORY_BEATS[1].options[0].id,
  }),/Stale/i);
});

test('entire end-to-end narrative replays from offline storage and rejects corrupted saves',()=>{
  const backing=new Map<string,string>();
  const storage={
    getItem:(key:string)=>backing.get(key)??null,
    setItem:(key:string,data:string)=>{backing.set(key,data);},
  };
  const seed=depositForeignCode(startIdentity(),{
    host:'SECURITY',depth:'RECURSIVE',eventId:'awakening.security',
  });
  const save=new KinnullStorySave(seed,storage);
  for(const beat of KINNULL_STORY_BEATS)save.choose(beat.options[1].id);
  const done=save.get();
  assert.ok(done.ending);
  assert.equal(done.beat,12);
  const reloaded=new KinnullStorySave(seed,storage);
  assert.deepEqual(reloaded.get(),done);
  const changedSeed=startIdentity();
  const invalidated=new KinnullStorySave(changedSeed,storage);
  assert.equal(invalidated.get().beat,0);
  assert.match(invalidated.loadError,/could not be verified/i);
  const saved=JSON.parse(backing.get(KINNULL_STORY_SAVE_KEY)!) as {version:string;signature:string;events:{choiceId:string}[]};
  saved.events[5].choiceId='forged';
  backing.set(KINNULL_STORY_SAVE_KEY,JSON.stringify(saved));
  const rejected=new KinnullStorySave(seed,storage);
  assert.equal(rejected.get().beat,0);
  assert.match(rejected.loadError,/could not be verified/i);
});
