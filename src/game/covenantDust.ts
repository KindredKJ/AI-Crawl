/** COVENANT//DUST: deterministic campaign content, not a server combat receipt. */
export const VERSION = 'covenant.dust/v1' as const;
export const RARITIES = ['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','OTHERWORLDLY'] as const;
export type Rarity = typeof RARITIES[number];
export type Stage = 'DEAD_SKY'|'COLLAPSE_RUN'|'MERCYS_END'|'THE_NOTARY'|'FIRST_COVENANT_ENDING';
export type Awakening = 'SHROUD'|'DEAD_EYE'|'SERAPH_DRIVE'|'COVENANT_SIGHT'|'IRON_PSALM'|
 'STRATA_WALK'|'JUDGMENT'|'RIDER_LINK'|'HOST_CHANNEL';
export const WAVES = ['CONTACT','COMBINATION','ENVIRONMENTAL_FAILURE','HEAVY_ENTITY',
 'REALITY_BREACH','SWARM','COMMANDER','COVENANT_EVENT','OVERWHELM','AWAKENING'] as const;
export type Action = 'SHROUD_BLOCK'|'SHROUD_REDIRECT'|'REVOLVER_FIRE'|'AERIAL_DASH'|
 'MOUNT_HORSE'|'RIDE_HARD'|'HORSE_JUMP'|'FIRE_BACKWARD'|'INVESTIGATE'|
 'ANALYZE_COVENANT'|'RESOLVE_WAVE'|'BREAK_AUTHORITY'|'STRIKE_NOTARY'|'RECORD_CHOICE';
export type Tactic = 'SHROUD'|'DEAD_EYE'|'HORSE'|'COVER'|'ALLY';
export type Outcome = 'SURVIVED'|'ROUTED'|'ESCAPED';
export type Clue = 'RADIO_VOICES'|'MISSING_THIRTEEN_SECONDS'|'KNEELING_ROBOTS'|'OWNERSHIP_REWRITE';
export const CLUES:Record<Clue,string> = {
 RADIO_VOICES:'Unpowered radios carry voices of the dead',
 MISSING_THIRTEEN_SECONDS:'Every clock loses thirteen seconds at 3:17 AM',
 KNEELING_ROBOTS:'Farm robots kneel westward at midnight',
 OWNERSHIP_REWRITE:'Data-center ownership contracts rewrite themselves',
};
export const ENEMIES = {
 WRAITH:{rarity:'UNCOMMON',roles:['flight','blink','crossfire']},
 DUST_TITAN:{rarity:'EPIC',roles:['siege','terrain-collapse']},
 COVENANT_HOUND:{rarity:'RARE',roles:['pursuit','machine-vision']},
 SEAL_CONSTRUCT:{rarity:'RARE',roles:['territory-control','binding']},
 NOTARY:{rarity:'LEGENDARY',roles:['boss','authority-claims']},
} as const;
export const CANON = {
 title:'COVENANT//DUST',protagonist:'THE GUNSLINGER',antagonist:'THE ADVERSARY NETWORK',
 host:'THE HOST',intro:'WAVE 0 — THE DEAD SKY',mount:'ENTITY UNKNOWN',
 titan:'DUST TITAN',town:"MERCY'S END",boss:'THE NOTARY',
 artifact:'STRATAKEY',mystery:'DO NOT KILL THE RIDER',unrevealedName:true,
 phases:['FRONTIER','TERRITORIES','THE MACHINE WAR','THE SKIES OPEN','THE LAST CONTRACT','REVELATION'],
 companions:['THE ENGINEER','THE PREACHER','THE CHILD','THE MARSHAL','THE MACHINE'],
} as const;
const SEALS=['PROPERTY_CLAIM','BINDING_CHAINS','OWNERSHIP_SEAL'] as const;
export interface CampaignLog {
 readonly id:string; readonly revision:number; readonly stage:Stage;
 readonly action:Action; readonly text:string; readonly wave:number;
}
export interface CampaignState {
 readonly version:typeof VERSION; readonly seed:number; readonly revision:number;
 readonly stage:Stage; readonly wave:number; readonly objective:string;
 readonly title:'THE GUNSLINGER'; readonly aerialActions:number;
 readonly shroudDeflections:number; readonly mounted:boolean;
 readonly rideActions:number; readonly clues:readonly Clue[];
 readonly awakenings:readonly Awakening[]; readonly titanCount:0|3;
 readonly horseIdentity:'UNKNOWN'; readonly notaryPhase:number;
 readonly strataKeys:0|1; readonly covenant:'HIDDEN'|'EXPOSED'|'BROKEN';
 readonly tacticalMemory:Readonly<Record<string,number>>;
 readonly choices:Readonly<Record<string,string>>;
 readonly eventIds:readonly string[]; readonly log:readonly CampaignLog[];
 readonly publishingAuthorized:false;
}
export interface CampaignEvent {
 readonly id:string; readonly revision:number; readonly action:Action;
 readonly clue?:Clue; readonly tactic?:Tactic; readonly outcome?:Outcome;
 readonly choiceId?:string; readonly choice?:string;
}
export interface Encounter {
 readonly stage:Stage; readonly wave:number; readonly waveName:string;
 readonly seed:number; readonly spawnBudget:number;
 readonly enemies:readonly (keyof typeof ENEMIES)[]; readonly rarity:Rarity;
 readonly hazards:readonly string[]; readonly tactics:readonly string[];
 readonly objective:string; readonly cinematicCue:string;
 readonly trust:'UNTRUSTED_LOCAL_DIRECTIVE'; readonly worldKernelMutation:false;
 readonly rewards:'LOCAL_PROGRESS_ONLY';
}
export class CampaignError extends Error {
 constructor(message:string){super(message);this.name='CampaignError';}
}
function check(value:unknown,message:string):asserts value{
 if(!value)throw new CampaignError(message);
}
function bounded(value:number,max:number):boolean{
 return Number.isSafeInteger(value)&&value>=0&&value<=max;
}
function add<T>(array:readonly T[],item:T):T[]{return array.includes(item)?[...array]:[...array,item];}
function hash(input:string):number{
 let v=2166136261;
 for(let i=0;i<input.length;i++)v=Math.imul(v^input.charCodeAt(i),16777619);
 return v>>>0;
}
export function newCampaign(seed=1987):CampaignState{
 check(bounded(seed,2147483647),'Invalid campaign seed');
 return {version:VERSION,seed,revision:0,stage:'DEAD_SKY',wave:0,
  objective:'SURVIVE THE FALL',title:'THE GUNSLINGER',aerialActions:0,
  shroudDeflections:0,mounted:false,rideActions:0,clues:[],
  awakenings:['SHROUD'],titanCount:0,horseIdentity:'UNKNOWN',notaryPhase:0,
  strataKeys:0,covenant:'HIDDEN',tacticalMemory:{},choices:{},eventIds:[],log:[],
  publishingAuthorized:false};
}
function objective(state:CampaignState):string{
 switch(state.stage){
  case 'DEAD_SKY':return 'SURVIVE THE FALL';
  case 'COLLAPSE_RUN':return 'REACH THE ARCHWAY';
  case 'MERCYS_END':return state.covenant==='EXPOSED'?'BREAK THE FIRST COVENANT':"INVESTIGATE MERCY'S END";
  case 'THE_NOTARY':return "BREAK THE NOTARY'S AUTHORITY";
  case 'FIRST_COVENANT_ENDING':return 'GLOBAL COVENANT CONVERGENCE DETECTED — 1%';
 }
}
export function transition(previous:CampaignState,event:CampaignEvent):CampaignState{
 check(previous.version===VERSION&&bounded(previous.revision,1000000)&&bounded(previous.wave,10),
  'Invalid campaign state');
 check(/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/.test(event.id)&&bounded(event.revision,1000000),
  'Invalid event envelope');
 if(previous.eventIds.includes(event.id))return previous; // exactly-once local replay
 check(event.revision===previous.revision,'Out-of-order campaign revision');
 check(previous.eventIds.length<10000,'Event limit reached');
 let state:CampaignState={...previous,clues:[...previous.clues],awakenings:[...previous.awakenings],
  tacticalMemory:{...previous.tacticalMemory},choices:{...previous.choices}};
 let message='';
 switch(state.stage){
 case 'DEAD_SKY':{
  check(['SHROUD_BLOCK','SHROUD_REDIRECT','REVOLVER_FIRE','AERIAL_DASH'].includes(event.action),
   'The combat tutorial happens in freefall');
  state={...state,aerialActions:state.aerialActions+1};
  if(event.action==='SHROUD_BLOCK'||event.action==='SHROUD_REDIRECT'){
   state={...state,shroudDeflections:state.shroudDeflections+1};
   message=event.action==='SHROUD_BLOCK'?'THE SHROUD HARDENS AGAINST THE BLADES':'THE SHROUD REDIRECTS THE STRIKE';
  }else if(event.action==='REVOLVER_FIRE'){
   state={...state,awakenings:add(state.awakenings,'DEAD_EYE')};
   message='SIX CHAMBERS. SIX ROUNDS. IMPOSSIBLE BALLISTICS.';
  }else message='SERAPH DRIVE STIRS AS THE SKY TEARS OPEN.';
  if(state.aerialActions>=4&&state.shroudDeflections>=1){
   state={...state,stage:'COLLAPSE_RUN',titanCount:3};
   message+=' THREE DUST TITANS RISE. SURVIVE—DO NOT FIGHT THEM ALL.';
  }
  break;
 }
 case 'COLLAPSE_RUN':{
  check(['MOUNT_HORSE','RIDE_HARD','HORSE_JUMP','FIRE_BACKWARD'].includes(event.action),
   'The Collapse Run requires mounted traversal');
  if(event.action==='MOUNT_HORSE'){
   check(!state.mounted,'Already mounted');
   state={...state,mounted:true,awakenings:add(state.awakenings,'RIDER_LINK')};
   message='ENTITY UNKNOWN. THE HORSE RECOGNIZES THE RIDER.';
  }else{
   check(state.mounted,'Mount the horse first');
   state={...state,rideActions:state.rideActions+1};
   message=event.action==='HORSE_JUMP'?'THE HORSE LEAPS THROUGH A COLLAPSING ARCH':
    event.action==='FIRE_BACKWARD'?'THE BULLET EXPOSES THE SYMBOL ON TITAN AND ARM':
    'THE FRONTIER COLLAPSES BEHIND THE HORSE';
   if(state.rideActions>=3){
    state={...state,stage:'MERCYS_END',wave:1};
    message+=" MERCY'S END APPEARS THROUGH THE DUST.";
   }
  }
  break;
 }
 case 'MERCYS_END':{
  if(event.action==='INVESTIGATE'){
   check(event.clue!==undefined&&Object.hasOwn(CLUES,event.clue),'Unknown evidence');
   check(!state.clues.includes(event.clue),'Clue already investigated');
   state={...state,clues:[...state.clues,event.clue]};
   message='COVENANT EVIDENCE: '+CLUES[event.clue];
  }else if(event.action==='ANALYZE_COVENANT'){
   check(state.clues.length>=3,'Three independent clues required');
   check(state.covenant==='HIDDEN','Covenant already exposed');
   state={...state,covenant:'EXPOSED',awakenings:add(state.awakenings,'COVENANT_SIGHT')};
   message='BLACK COVENANT EXPOSED IN DATA CENTER OWNERSHIP LOGIC';
  }else if(event.action==='RESOLVE_WAVE'){
   const tactic=event.tactic,outcome=event.outcome;
   check(tactic!==undefined&&['SHROUD','DEAD_EYE','HORSE','COVER','ALLY'].includes(tactic)&&
    outcome!==undefined&&['SURVIVED','ROUTED','ESCAPED'].includes(outcome),
    'Wave result needs tactic and outcome');
   if(tactic==='DEAD_EYE')check(state.awakenings.includes('DEAD_EYE'),'Dead Eye undiscovered');
   if(tactic==='HORSE')check(state.mounted,'Horse unavailable');
   const key='tactic.'+tactic;
   state={...state,tacticalMemory:{...state.tacticalMemory,
    [key]:Math.min(1000,(state.tacticalMemory[key]??0)+1)}};
   message='WAVE '+state.wave+' '+WAVES[state.wave-1]+' — '+outcome+' VIA '+tactic;
   if(state.wave===10){
    check(state.covenant==='EXPOSED','Expose the Black Covenant before final wave');
    state={...state,stage:'THE_NOTARY'};
    message+=' THE NOTARY CLAIMS THE BATTLEFIELD.';
   }else state={...state,wave:state.wave+1};
  }else if(event.action==='RECORD_CHOICE'){
   check(typeof event.choiceId==='string'&&/^[a-zA-Z0-9_.:-]{1,64}$/.test(event.choiceId)&&
    typeof event.choice==='string'&&event.choice.trim().length>0&&event.choice.length<=80&&
    !Object.hasOwn(state.choices,event.choiceId),'Duplicate or invalid story choice');
   state={...state,choices:{...state.choices,[event.choiceId]:event.choice}};
   message='PERSISTENT CHOICE: '+event.choiceId;
  }else throw new CampaignError('Mercy’s End needs investigation, encounter or dialogue decisions');
  break;
 }
 case 'THE_NOTARY':{
  check(['BREAK_AUTHORITY','STRIKE_NOTARY'].includes(event.action),
   'The Notary requires breaking authority');
  if(event.action==='STRIKE_NOTARY')message='THE NOTARY REWRITES THE FLOOR. BULLETS CANNOT BREAK OWNERSHIP.';
  else{
   check(state.covenant==='EXPOSED'&&state.awakenings.includes('COVENANT_SIGHT'),
    'Covenant Sight required');
   message='AUTHORITY BROKEN: '+['PROPERTY_CLAIM','BINDING_CHAINS','OWNERSHIP_SEAL'][state.notaryPhase];
   state={...state,notaryPhase:state.notaryPhase+1};
   if(state.notaryPhase===3){
    state={...state,covenant:'BROKEN',strataKeys:1,stage:'FIRST_COVENANT_ENDING'};
    message+=' STRATAKEY ACQUIRED. THE LAST CONTRACT REMAINS.';
   }
  }
  break;
 }
 case 'FIRST_COVENANT_ENDING':
  throw new CampaignError('Campaign II requires separately authored content');
 }
 return {...state,revision:previous.revision+1,objective:objective(state),
  eventIds:[...previous.eventIds,event.id],
  log:[...previous.log.slice(-199),{id:event.id,revision:previous.revision+1,stage:state.stage,
   action:event.action,text:message,wave:state.wave}]};
}
export function encounter(state:CampaignState):Encounter{
 check(state.version===VERSION&&bounded(state.wave,10),'Invalid campaign');
 const wave=state.stage==='DEAD_SKY'?0:state.wave;
 const seed=hash([state.seed,state.stage,wave,...Object.entries(state.tacticalMemory).sort().flat()].join('|'));
 const available:(keyof typeof ENEMIES)[]=wave===0?['WRAITH']:
  wave===4||wave===9?['WRAITH','DUST_TITAN']:
  wave>=7?['WRAITH','SEAL_CONSTRUCT']:['WRAITH','COVENANT_HOUND','SEAL_CONSTRUCT'];
 const roster:(keyof typeof ENEMIES)[]=[available[seed%available.length]!];
 if(wave>=2)roster.push(available[(seed>>>7)%available.length]!);
 if(state.titanCount===3&&wave===0)roster.push('DUST_TITAN');
 if(state.stage==='THE_NOTARY')roster.push('NOTARY');
 const hazards=['FALLING_MESAS','ELECTRICAL_STORMS','COLLAPSING_BRIDGES',
  'CORRUPTED_SERVER_TERRAIN','TITAN_FOOTSTEPS','COVENANT_SEALS'];
 const best=Object.entries(state.tacticalMemory).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0];
 return {stage:state.stage,wave,waveName:wave===0?'THE DEAD SKY':WAVES[Math.min(9,Math.max(0,wave-1))],
  seed,spawnBudget:Math.min(64,3+2*wave),enemies:[...new Set(roster)],
  rarity:state.stage==='THE_NOTARY'?'LEGENDARY':wave===4||wave===9||wave===10?'EPIC':
   wave>=7?'RARE':wave>=2?'UNCOMMON':'COMMON',
  hazards:[hazards[seed%hazards.length]!,...(wave>=3?[hazards[(seed+3)%hazards.length]!]:[])],
  tactics:best?['COUNTER_'+best[0].slice(7)]:['PROBE_PLAYER_REACTIONS'],
  objective:state.objective,
  cinematicCue:state.stage==='DEAD_SKY'?'dead_sky.falling_wraiths':
   state.stage==='COLLAPSE_RUN'?'collapse_run.horse_archway':
   state.stage==='THE_NOTARY'?'notary.claim.phase_'+state.notaryPhase:
   'mercys_end.wave_'+wave,
  trust:'UNTRUSTED_LOCAL_DIRECTIVE',worldKernelMutation:false,rewards:'LOCAL_PROGRESS_ONLY'};
}
