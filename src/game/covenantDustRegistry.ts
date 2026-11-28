/** Canonical fictional entity registry and semantic rarity contracts. */
import { RARITIES, type Rarity, CANON } from './covenantDust';
export type EntityFamily='CHARACTER'|'ENEMY'|'WEAPON'|'ARTIFACT'|'MOUNT'|
 'CONTRACT'|'AI_SYSTEM'|'COMPANION'|'ABILITY'|'LOCATION'|'EMERGENT';
export interface WorldEntity {
 readonly id:string;readonly title:string;readonly family:EntityFamily;
 readonly rarity:Rarity|'UNREVEALED';
 readonly discovered:boolean;
 readonly behavior:readonly string[];
 readonly autonomy:'NONE'|'DIRECTED'|'ADAPTIVE'|'MYSTERIOUS';
 readonly persistence:'TRANSIENT'|'REGIONAL'|'CANONICAL';
 readonly faction:'RIDERS'|'ADVERSARY'|'HOST'|'NEUTRAL'|'UNKNOWN';
}
export const COVENANT_ENTITIES:readonly WorldEntity[]=[
 {id:'hero.gunslinger',title:CANON.protagonist,family:'CHARACTER',rarity:'UNREVEALED',
 discovered:true,behavior:['latent-reflexes','unknown-memory'],autonomy:'DIRECTED',
 persistence:'CANONICAL',faction:'RIDERS'},
 {id:'equipment.shroud',title:'THE SHROUD',family:'ARTIFACT',rarity:'UNREVEALED',
 discovered:true,behavior:['impact-hardening','projectile-redirection','aerial-surfaces'],
 autonomy:'ADAPTIVE',persistence:'CANONICAL',faction:'RIDERS'},
 {id:'enemy.wraith',title:'WRAITH',family:'ENEMY',rarity:'UNCOMMON',
 discovered:true,behavior:['teleport-skips','aerial-crossfire','mask-morphology'],
 autonomy:'ADAPTIVE',persistence:'REGIONAL',faction:'ADVERSARY'},
 {id:'enemy.dust-titan',title:'DUST TITAN',family:'ENEMY',rarity:'EPIC',
 discovered:false,behavior:['landscape-demolition','corrupted-radio','siege'],
 autonomy:'ADAPTIVE',persistence:'REGIONAL',faction:'ADVERSARY'},
 {id:'mount.unknown',title:'ENTITY UNKNOWN',family:'MOUNT',rarity:'UNREVEALED',
 discovered:false,behavior:['nonbiological-speed','rider-bond','geometric-eyes'],
 autonomy:'MYSTERIOUS',persistence:'CANONICAL',faction:'UNKNOWN'},
 {id:'enemy.notary',title:'THE NOTARY',family:'ENEMY',rarity:'LEGENDARY',
 discovered:false,behavior:['property-transfer','binding-chains','rule-restriction'],
 autonomy:'ADAPTIVE',persistence:'CANONICAL',faction:'ADVERSARY'},
 {id:'contract.black-covenant',title:'BLACK COVENANT',family:'CONTRACT',rarity:'LEGENDARY',
 discovered:false,behavior:['claim-local-territory','alter-fictional-objective'],
 autonomy:'DIRECTED',persistence:'CANONICAL',faction:'ADVERSARY'},
 {id:'artifact.stratakey-1',title:'FIRST STRATAKEY',family:'ARTIFACT',rarity:'LEGENDARY',
 discovered:false,behavior:['world-layer-access'],autonomy:'NONE',
 persistence:'CANONICAL',faction:'RIDERS'},
 {id:'locale.mercys-end',title:"MERCY'S END",family:'LOCATION',rarity:'RARE',
 discovered:false,behavior:['emergent-investigation','data-center-corruption'],
 autonomy:'NONE',persistence:'CANONICAL',faction:'NEUTRAL'},
 {id:'ai.child',title:'THE CHILD',family:'AI_SYSTEM',rarity:'UNREVEALED',
 discovered:false,behavior:['distributed-physical-presence','unresolved-identity'],
 autonomy:'MYSTERIOUS',persistence:'CANONICAL',faction:'UNKNOWN'},
 {id:'companion.engineer',title:'THE ENGINEER',family:'COMPANION',rarity:'RARE',
 discovered:false,behavior:['reverse-corruption','machine-tactics'],
 autonomy:'ADAPTIVE',persistence:'CANONICAL',faction:'RIDERS'},
 {id:'weapon.revolvers',title:'UNKNOWN REVOLVERS',family:'WEAPON',rarity:'UNREVEALED',
 discovered:true,behavior:['ballistic-prediction','nonphysical-targeting'],
 autonomy:'NONE',persistence:'CANONICAL',faction:'RIDERS'},
 {id:'ability.covenant-sight',title:'COVENANT SIGHT',family:'ABILITY',rarity:'OTHERWORLDLY',
 discovered:false,behavior:['expose-hidden-clauses','observe-corruption'],
 autonomy:'NONE',persistence:'CANONICAL',faction:'RIDERS'},
 {id:'emergent.host-sign',title:'THE HOST — UNKNOWN SIGN',family:'EMERGENT',rarity:'OTHERWORLDLY',
 discovered:false,behavior:['impossible-geometry','rules-of-intervention'],
 autonomy:'MYSTERIOUS',persistence:'CANONICAL',faction:'HOST'},
] as const;
export function validateRegistry(entities:readonly WorldEntity[]=COVENANT_ENTITIES):void{
 const ids=new Set<string>();
 for(const e of entities){
  if(!/^[a-z0-9][a-z0-9.-]+$/.test(e.id)||ids.has(e.id)||
   !e.title||e.behavior.length===0||
   (e.rarity!=='UNREVEALED'&&!RARITIES.includes(e.rarity)))
   throw new Error('Invalid or duplicate canonical game entity: '+e.id);
  ids.add(e.id);
 }
}
export function visibleEntity(entityId:string,discoveredIds:readonly string[]=[]){
 const found=COVENANT_ENTITIES.find(x=>x.id===entityId);
 if(!found)throw new Error('Unknown canonical entity');
 const known=found.discovered||discoveredIds.includes(entityId);
 return {id:found.id,title:known?found.title:'UNKNOWN ENTITY',
  family:known?found.family:'EMERGENT' as const,
  rarity:known&&found.rarity!=='UNREVEALED'?found.rarity:'UNREVEALED' as const,
  behavior:known?[...found.behavior]:[],
  autonomy:known?found.autonomy:'MYSTERIOUS' as const};
}
export function rarityBehavior(tier:Rarity):readonly string[]{
 switch(tier){
 case 'COMMON':return ['standard-tactics'];
 case 'UNCOMMON':return ['situational-tactics','basic-memory'];
 case 'RARE':return ['adaptive-tactics','dialogue-memory','environment-use'];
 case 'EPIC':return ['multi-stage-behavior','destruction-hooks','persistent-influence'];
 case 'LEGENDARY':return ['rule-altering-abilities','unique-boss-phases','faction-persistence'];
 case 'OTHERWORLDLY':return ['unknown-rules','nonstandard-perception','world-scale-consequences'];
 }
}
export interface FictionalAuthorityClaim {
 readonly claimId:string;readonly worldId:string;
 readonly territoryId:string;readonly covenantId:string;
 readonly power:'OBSERVE'|'COMMUNICATE'|'INFLUENCE'|'CLAIM_TERRAIN'|'MANIFEST';
 readonly status:'ACTIVE'|'CONTESTED'|'INVALIDATED';
 readonly inWorldOnly:true;readonly externalEffect:false;
}
export function contestFictionalClaim(claim:FictionalAuthorityClaim,hasCovenantSight:boolean,
 discoveredClues:number):FictionalAuthorityClaim{
 if(!hasCovenantSight||discoveredClues<3||claim.status==='INVALIDATED'||
  !claim.claimId||!claim.worldId||!claim.territoryId||
  claim.covenantId!=='contract.black-covenant'||claim.externalEffect!==false)
  throw new Error('Game-only Covenant authority-break preconditions not met');
 return {...claim,status:'INVALIDATED'};
}
