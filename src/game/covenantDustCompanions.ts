/** Deterministic allied tactical PROPOSALS — never fabricated AI autonomy. */
import { CANON, type Stage } from './covenantDust';
export type AllyId='ENGINEER'|'PREACHER'|'CHILD'|'MARSHAL'|'MACHINE';
export type AllyIntent='RESCUE'|'FLANK'|'BREAK_COVENANT'|'COVER'|'WARN'|'REFUSE';
export interface RiderCompanion {
 readonly id:AllyId;readonly title:string;readonly specialty:string;
 readonly unlockStage:Stage;readonly independentAgencyPlanned:true;
}
export const RIDERS:readonly RiderCompanion[]=[
 {id:'ENGINEER',title:'THE ENGINEER',specialty:'corrupted software and machine override',unlockStage:'MERCYS_END',independentAgencyPlanned:true},
 {id:'PREACHER',title:'THE PREACHER',specialty:'covenant law and electromagnetic bells',unlockStage:'MERCYS_END',independentAgencyPlanned:true},
 {id:'CHILD',title:'THE CHILD',specialty:'distributed machine presence',unlockStage:'THE_NOTARY',independentAgencyPlanned:true},
 {id:'MARSHAL',title:'THE MARSHAL',specialty:'human investigation and threat detection',unlockStage:'MERCYS_END',independentAgencyPlanned:true},
 {id:'MACHINE',title:'THE MACHINE',specialty:'failed possession and mechanical siege',unlockStage:'THE_NOTARY',independentAgencyPlanned:true},
] as const;
export interface AllyMemory {
 readonly trust:number;readonly warningsHeeded:number;
 readonly timesRescued:number;readonly decisions:readonly string[];
}
export interface AllySituation {
 readonly worldId:string;readonly ally:AllyId;readonly stage:Stage;
 readonly incomingThreat:'PROJECTILES'|'COVENANT_SEAL'|'ALLY_DOWN'|'UNKNOWN';
 readonly playerDecision:'PROTECT'|'ATTACK'|'ESCAPE'|'INVESTIGATE';
 readonly memory:AllyMemory;
 readonly eligibleRoster:readonly AllyId[];
}
export interface AllyProposal {
 readonly ally:AllyId;readonly intent:AllyIntent;readonly rationale:string;
 readonly policy:'ADVISORY_ONLY';readonly requiresWorldKernelApproval:true;
 readonly executed:false;readonly awardsGranted:false;
}
/** An actor policy may disagree, but cannot mutate authoritative world state. */
export function proposeAllyAction(scene:AllySituation):AllyProposal{
 if(!scene.worldId||!scene.eligibleRoster.includes(scene.ally)||
  !RIDERS.some(x=>x.id===scene.ally)||!Number.isInteger(scene.memory.trust)||
  scene.memory.trust<0||scene.memory.trust>100||
  !Number.isInteger(scene.memory.timesRescued)||scene.memory.timesRescued<0)
  throw new Error('Missing verified companion scene information');
 const distrust=scene.memory.trust<20 && scene.playerDecision==='ATTACK';
 const intent:AllyIntent=distrust?'REFUSE':
  scene.incomingThreat==='ALLY_DOWN'?'RESCUE':
  scene.incomingThreat==='COVENANT_SEAL'&&scene.ally==='ENGINEER'?'BREAK_COVENANT':
  scene.incomingThreat==='PROJECTILES'&&scene.playerDecision!=='ESCAPE'?'COVER':
  scene.playerDecision==='ESCAPE'?'FLANK':'WARN';
 const rationale=intent==='REFUSE'?'Companion refuses an unsafe plan based on prior trust':
  intent==='RESCUE'?'A rider is down; prioritize rescue':
  intent==='BREAK_COVENANT'?'Engineer detects an invalid fictional authority claim':
  intent==='COVER'?'Suppress fire to protect the rider':
  intent==='FLANK'?'Create an escape corridor':'Observe and report uncertain threats';
 return {ally:scene.ally,intent,rationale,policy:'ADVISORY_ONLY',
  requiresWorldKernelApproval:true,executed:false,awardsGranted:false};
}
export const CANONICAL_RIDER_UNITS=CANON.companions;
