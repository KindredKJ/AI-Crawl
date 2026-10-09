/** Isolated, versioned campaign save; cannot alter legacy GameState, KINFT or wallets. */
import {
  VERSION, newCampaign, transition, type CampaignState, type CampaignEvent,
  type Stage, type Awakening, type Clue,
} from './covenantDust';

const KEY = 'ai_crawl_covenant_dust_v1';
type StorageLike = Pick<Storage,'getItem'|'setItem'>;
const STAGES:Stage[]=['DEAD_SKY','COLLAPSE_RUN','MERCYS_END','THE_NOTARY','FIRST_COVENANT_ENDING'];
const AWAKENINGS:Awakening[]=['SHROUD','DEAD_EYE','SERAPH_DRIVE','COVENANT_SIGHT',
 'IRON_PSALM','STRATA_WALK','JUDGMENT','RIDER_LINK','HOST_CHANNEL'];
const CLUES:Clue[]=['RADIO_VOICES','MISSING_THIRTEEN_SECONDS','KNEELING_ROBOTS','OWNERSHIP_REWRITE'];
function isRecord(x:unknown):x is Record<string,unknown> {
 return typeof x==='object'&&x!==null&&!Array.isArray(x);
}
function bounded(x:unknown,max:number):x is number{
 return typeof x==='number'&&Number.isSafeInteger(x)&&x>=0&&x<=max;
}
function validSaved(x:unknown):x is CampaignState {
 if(!isRecord(x)||x.version!==VERSION||!STAGES.includes(x.stage as Stage)||
  !bounded(x.seed,2147483647)||!bounded(x.revision,1000000)||!bounded(x.wave,10)||
  typeof x.objective!=='string'||x.title!=='THE GUNSLINGER'||
  !bounded(x.aerialActions,1000000)||!bounded(x.shroudDeflections,1000000)||
  typeof x.mounted!=='boolean'||!bounded(x.rideActions,1000000)||
  !bounded(x.titanCount,3)||(x.titanCount!==0&&x.titanCount!==3)||
  x.horseIdentity!=='UNKNOWN'||!bounded(x.notaryPhase,3)||
  !bounded(x.strataKeys,1)||!['HIDDEN','EXPOSED','BROKEN'].includes(String(x.covenant))||
  x.publishingAuthorized!==false||!Array.isArray(x.clues)||
  !x.clues.every(c=>CLUES.includes(c))||new Set(x.clues).size!==x.clues.length||
  !Array.isArray(x.awakenings)||!x.awakenings.every(c=>AWAKENINGS.includes(c))||
  !x.awakenings.includes('SHROUD')||!isRecord(x.tacticalMemory)||!isRecord(x.choices)||
  !Array.isArray(x.eventIds)||x.eventIds.length>10000||
  !x.eventIds.every(id=>typeof id==='string'&&/^[a-zA-Z0-9_.:-]{1,128}$/.test(id))||
  new Set(x.eventIds).size!==x.eventIds.length||
  !Array.isArray(x.log)||x.log.length>200||x.log.some(item=>!isRecord(item)||
   !bounded(item.revision,1000000)||typeof item.text!=='string'))return false;
 if(Object.entries(x.tacticalMemory).some(([k,v])=>!/^tactic\.[A-Z_]+$/.test(k)||!bounded(v,1000)))return false;
 if(Object.entries(x.choices).some(([k,v])=>k.length>64||typeof v!=='string'||v.length>80))return false;
 if(x.stage==='FIRST_COVENANT_ENDING'&&(x.strataKeys!==1||x.covenant!=='BROKEN'))return false;
 if(x.stage==='THE_NOTARY'&&x.covenant!=='EXPOSED')return false;
 return true;
}
function detectStorage():StorageLike|undefined{
 try{return typeof globalThis.localStorage==='undefined'?undefined:globalThis.localStorage;}
 catch{return undefined;}
}
const clone=<T>(x:T):T=>JSON.parse(JSON.stringify(x)) as T;
export class CovenantDustSave {
 private state:CampaignState;
 private listeners=new Set<(state:CampaignState)=>void>();
 constructor(private readonly storage:StorageLike|undefined=detectStorage()){
  let state:CampaignState=newCampaign();
  try{const saved=storage?.getItem(KEY);if(saved){
    const parsed:unknown=JSON.parse(saved);if(validSaved(parsed))state=clone(parsed);
  }}catch{ /* Local persistence is optional, never a server authority. */ }
  this.state=state;
 }
 get():CampaignState{return clone(this.state);}
 subscribe(fn:(s:CampaignState)=>void):()=>void{
  this.listeners.add(fn);return()=>this.listeners.delete(fn);
 }
 dispatch(event:CampaignEvent):CampaignState{
  const next=transition(this.state,event);
  if(next!==this.state){this.state=next;this.persist();this.emit();}
  return this.get();
 }
 reset(seed=1987):void{this.state=newCampaign(seed);this.persist();this.emit();}
 private persist():void{
  try{this.storage?.setItem(KEY,JSON.stringify(this.state));}catch{
   // A full browser storage quota must never mutate legacy game saves.
  }
 }
 private emit():void{
  for(const listener of [...this.listeners]){
   try{listener(this.get());}catch{/* Broken subscriber cannot block gameplay. */}
  }
 }
}
export const covenantDustSave=new CovenantDustSave();
