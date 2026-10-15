/** A separately versioned, event-replayed story save. Cross-run identity is never silently restored. */
import {
  advanceKinnullStory, newKinnullStory, type KinnullStoryEvent, type KinnullStoryState,
} from './kinnullCampaign';
import type { IdentitySnapshot } from './kinnullIdentity';

export const KINNULL_STORY_SAVE_KEY = 'ai_crawl_kinnull_complete_campaign_v1';
type StorageLike = Pick<Storage,'getItem'|'setItem'>;
function defaultStorage():StorageLike|undefined {
  try{return typeof globalThis.localStorage==='undefined'?undefined:globalThis.localStorage;}
  catch{return undefined;}
}
function signature(identity:IdentitySnapshot):string {
  // Local save matching only, NOT an authentication signature.
  return JSON.stringify([identity.vector,identity.residualIntegrity,
    identity.irreversibleBand,identity.foreignCodeDensity,identity.foreignCode]);
}
export class KinnullStorySave {
  private state:KinnullStoryState;
  private listeners=new Set<(state:KinnullStoryState)=>void>();
  readonly loadError:string;
  private identitySeedSignature:string;
  constructor(identity:IdentitySnapshot,private storage:StorageLike|undefined=defaultStorage()){
    this.identitySeedSignature=signature(identity);
    const initial=newKinnullStory(identity);
    let loaded=initial;
    let error='';
    try {
      const raw=storage?.getItem(KINNULL_STORY_SAVE_KEY);
      if(raw){
        const body=JSON.parse(raw) as unknown;
        if(typeof body!=='object'||!body||Array.isArray(body))throw Error('invalid envelope');
        const parsed=body as Record<string,unknown>;
        if(parsed.version!=='kinnull.story-save/v1'||parsed.signature!==signature(identity)||
           !Array.isArray(parsed.events)||parsed.events.length>12)throw Error('invalid saved narrative');
        for(const event of parsed.events){
          if(typeof event!=='object'||!event||Array.isArray(event))throw Error('invalid story event');
          loaded=advanceKinnullStory(loaded,event as KinnullStoryEvent);
        }
      }
    }catch{
      loaded=initial;
      error='The local story save could not be verified and was not loaded.';
    }
    this.state=loaded;
    this.loadError=error;
  }
  get():KinnullStoryState { return structuredClone(this.state); }
  subscribe(listener:(s:KinnullStoryState)=>void):()=>void{
    this.listeners.add(listener);return()=>this.listeners.delete(listener);
  }
  choose(choiceId:string):KinnullStoryState{
    const event:KinnullStoryEvent={
      id:'kinnull.story.'+(this.state.revision+1),
      revision:this.state.revision,choiceId,
    };
    const updated=advanceKinnullStory(this.state,event);
    this.state=updated;
    try{
      const initial=this.state;
      // Reconstruct the campaign base from the first event's identity input.
      // The original seed is saved in the instance at construction; see seedIdentity below.
      this.storage?.setItem(KINNULL_STORY_SAVE_KEY,JSON.stringify({
        version:'kinnull.story-save/v1',
        signature:this.identitySeedSignature,
        events:initial.events,
      }));
    }catch{/* gameplay remains offline-capable even when browser storage is full */}
    for(const fn of this.listeners){try{fn(this.get());}catch{/* ignore broken view */}}
    return this.get();
  }
}
