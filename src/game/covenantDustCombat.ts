/**
 * Deterministic tactical encounter loop for the AI Crawl browser campaign.
 * A playable local combat simulation; NOT a signed server result, native UE
 * combat/physics renderer, or a source of transferable rewards.
 */
import type { Encounter, Awakening } from './covenantDust';

export type CombatMove='SHROUD_BLOCK'|'SHROUD_REDIRECT'|'REVOLVER'|'DEAD_EYE'|
 'DODGE'|'TAKE_COVER'|'RIDER_EVADE';
export type CombatStatus='FIGHTING'|'SURVIVED'|'ROUTED'|'FALLEN';
export interface WaveBattle {
 readonly wave:number;
 readonly sourceSeed:number;
 readonly turn:number;
 readonly heroHP:number;
 readonly enemyHP:number;
 readonly shroudEnergy:number;
 readonly ammo:number;
 readonly coverIntegrity:number;
 readonly status:CombatStatus;
 readonly nextThreat:'PROJECTILE_VOLLEY'|'MELEE_DIVE'|'BREACH_SHOCKWAVE';
 readonly journal:readonly string[];
}
export class WaveCombatError extends Error {
 constructor(message:string){super(message);this.name='WaveCombatError';}
}
function requireAction(cond:unknown,message:string):asserts cond {
 if(!cond)throw new WaveCombatError(message);
}
const clamp=(n:number,low:number,high:number)=>Math.min(high,Math.max(low,n));
function nextThreat(seed:number,turn:number):WaveBattle['nextThreat'] {
 const value=(Math.imul(seed^(turn*2654435761),2246822519)>>>0)%3;
 return (['PROJECTILE_VOLLEY','MELEE_DIVE','BREACH_SHOCKWAVE'] as const)[value]!;
}
export function beginWaveCombat(directive:Encounter):WaveBattle {
 requireAction(directive.trust==='UNTRUSTED_LOCAL_DIRECTIVE'&&
  directive.wave>=1&&directive.wave<=10&&Number.isSafeInteger(directive.seed),
  'Valid Mercy’s End local encounter directive required');
 return {wave:directive.wave,sourceSeed:directive.seed,turn:0,heroHP:160,
  enemyHP:50+directive.wave*9,shroudEnergy:4,ammo:6,coverIntegrity:60,
  status:'FIGHTING',nextThreat:nextThreat(directive.seed,0),
  journal:['A hostile wave closes in. Survive or break its pressure.']};
}
/** Pure turn: no random rolls, scene mutations, wallet effects or external writes. */
export function takeWaveTurn(
 before:WaveBattle,move:CombatMove,awakenings:readonly Awakening[],mounted:boolean,
):WaveBattle {
 requireAction(before.status==='FIGHTING','The wave is already resolved');
 requireAction(Number.isSafeInteger(before.turn)&&before.turn>=0&&before.turn<20,
  'Invalid or exhausted combat turn');
 let energy=before.shroudEnergy,ammo=before.ammo,cover=before.coverIntegrity;
 let damage=0,guard=0,log='';
 switch(move){
  case 'SHROUD_BLOCK':
   requireAction(energy>=1,'Shroud energy depleted');
   energy-=1;guard=30;log='THE SHROUD HARDENS: protect against the incoming attack';break;
  case 'SHROUD_REDIRECT':
   requireAction(energy>=2,'Shroud redirection needs two energy');
   energy-=2;guard=19;damage=32;log='THE SHROUD REDIRECTS THE PROJECTILE INTO ITS MASTER';break;
  case 'REVOLVER':
   requireAction(ammo>=1,'Revolver cylinder empty');
   ammo-=1;damage=24;log='REVOLVER: precision gunfire';break;
  case 'DEAD_EYE':
   requireAction(awakenings.includes('DEAD_EYE'),'Dead Eye is not yet awakened');
   requireAction(ammo>=1,'Dead Eye needs a live revolver round');
   ammo-=1;damage=40;guard=4;log='DEAD EYE: threat vectors converge into a weak point';break;
  case 'DODGE':
   guard=before.nextThreat==='BREACH_SHOCKWAVE'?10:28;
   energy=clamp(energy+1,0,4);log='AERIAL MOVEMENT: slip between converging threats';break;
  case 'TAKE_COVER':
   requireAction(cover>0,'All cover is destroyed');
   guard=23;energy=clamp(energy+1,0,4);cover=Math.max(0,cover-12);
   log='Environmental cover absorbs the strike';break;
  case 'RIDER_EVADE':
   requireAction(mounted,'Rider Link has not been discovered');
   guard=35;damage=10;log='RIDER LINK: mount and gunslinger outmaneuver the swarm';break;
  default:throw new WaveCombatError('Unknown tactical move');
 }
 const enemyHP=Math.max(0,before.enemyHP-damage);
 const turn=before.turn+1;
 // A kill prevents the telegraphed enemy retaliation. Survival also counts:
 // the campaign's escape objective does not require killing every Wraith.
 const raw=before.nextThreat==='PROJECTILE_VOLLEY'?18+before.wave*2:
  before.nextThreat==='MELEE_DIVE'?22+before.wave*2:26+before.wave*2;
 const incoming=enemyHP===0?0:Math.max(0,raw-guard);
 const heroHP=Math.max(0,before.heroHP-incoming);
 let status:CombatStatus='FIGHTING';
 if(heroHP<=0)status='FALLEN';
 else if(enemyHP<=0)status='ROUTED';
 else if(turn>=5)status='SURVIVED';
 const result=log+(damage?' · '+damage+' pressure damage':'')+
  (incoming?' · '+incoming+' damage received':' · attack defended');
 return {...before,turn,enemyHP,heroHP,shroudEnergy:energy,ammo,
  coverIntegrity:cover,status,nextThreat:nextThreat(before.sourceSeed,turn),
  journal:[...before.journal.slice(-11),result]};
}
