import React, { useEffect, useState } from 'react';
import {
 CANON, CLUES, WAVES, encounter, type CampaignState, type CampaignEvent,
 type Action, type Tactic,
} from '../game/covenantDust';
import { covenantDustSave } from '../game/covenantDustSave';
import { beginWaveCombat, takeWaveTurn, type WaveBattle, type CombatMove } from '../game/covenantDustCombat';

type Choice = { label:string; action:Action; fields?:Partial<CampaignEvent> };
const action=(label:string,kind:Action,fields?:Partial<CampaignEvent>):Choice=>
 ({label,action:kind,fields});

function available(state:CampaignState):Choice[]{
 switch(state.stage){
  case 'DEAD_SKY':return [
   action('Shroud · Block','SHROUD_BLOCK'),
   action('Shroud · Redirect','SHROUD_REDIRECT'),
   action('Revolver · Dead Eye','REVOLVER_FIRE'),
   action('Aerial Dash','AERIAL_DASH'),
  ];
  case 'COLLAPSE_RUN':return state.mounted?[
   action('Ride Through Destruction','RIDE_HARD'),
   action('Vault the Falling Arch','HORSE_JUMP'),
   action('Fire Backward','FIRE_BACKWARD'),
  ]:[action('Grab the Saddle','MOUNT_HORSE')];
  case 'MERCYS_END':{
   const clues=Object.entries(CLUES).filter(([id])=>!state.clues.includes(id as keyof typeof CLUES))
     .map(([id,name])=>action('Investigate · '+name,'INVESTIGATE',
       {clue:id as keyof typeof CLUES}));
   if(state.clues.length>=3&&state.covenant==='HIDDEN')
    clues.push(action('Expose the Black Covenant','ANALYZE_COVENANT'));
   return clues;
  }
  case 'THE_NOTARY':return [
   action('Revolver · Strike the Notary','STRIKE_NOTARY'),
   action('Covenant Sight · Break Authority','BREAK_AUTHORITY'),
  ];
  case 'FIRST_COVENANT_ENDING':return [];
 }
}
const copy:Record<CampaignState['stage'],{subtitle:string;intro:string}> = {
 DEAD_SKY:{
  subtitle:'WAVE 0 — THE DEAD SKY',
  intro:'Black. Wind. A cylinder clicks. The Gunslinger opens his eyes—falling above an impossible desert. Wraiths skip through the air. The first combat lesson begins inside catastrophe.',
 },
 COLLAPSE_RUN:{
  subtitle:'WAVE 0 — THE COLLAPSE RUN',
  intro:'Three EPIC Dust Titans rise. You cannot kill them all. The town breaks apart. A rider dies. An unknown horse escapes into the ruins. WIN BY SURVIVING.',
 },
 MERCYS_END:{
  subtitle:"CAMPAIGN I — THE FIRST COVENANT",
  intro:"Mercy's End: frontier saloons, autonomous freight, a silent data center. Machines move without power and the law itself is changing. Investigate while the ten-wave regional pressure arc escalates.",
 },
 THE_NOTARY:{
  subtitle:'BOSS — THE NOTARY',
  intro:'A being of signatures and ceremonial armor claims the battlefield. Floors, doors and weapons become property. Ordinary damage cannot destroy its authority.',
 },
 FIRST_COVENANT_ENDING:{
  subtitle:'CAMPAIGN I — THE LAST SCREEN',
  intro:'For a moment, the machines stop screaming. Then every dead screen in the region turns on. “Congratulations. You stopped one contract.” Billions of covenants light up. “We only needed humanity to sign once.”',
 },
};

export const CovenantDustScreen:React.FC=()=>{
 const [state,setState]=useState<CampaignState>(()=>covenantDustSave.get());
 const [error,setError]=useState('');
 const [tactic,setTactic]=useState<Tactic>('SHROUD');
 useEffect(()=>covenantDustSave.subscribe(setState),[]);
 const enemy=encounter(state);
 const [battle,setBattle]=useState<WaveBattle|null>(()=>state.stage==='MERCYS_END'?beginWaveCombat(encounter(state)):null);
 useEffect(()=>{
  setBattle(state.stage==='MERCYS_END'?beginWaveCombat(encounter(state)):null);
 },[state.stage,state.wave,enemy.seed]);
 const choices=available(state);
 function fight(move:CombatMove){
  if(!battle)return;
  try{setBattle(takeWaveTurn(battle,move,state.awakenings,state.mounted));setError('');}
  catch(e){setError(e instanceof Error?e.message:'Invalid tactical move');}
 }
 function dispatch(next:Choice){
  try{
   covenantDustSave.dispatch({
    id:'campaign.'+(state.revision+1),revision:state.revision,action:next.action,
    ...next.fields,
   });
   setError('');
  }catch(e){setError(e instanceof Error?e.message:'Campaign action failed');}
 }
 return (
  <section className="mx-auto max-w-6xl px-5 pt-24 pb-36" aria-label="Covenant Dust campaign">
   <div className="space-y-2 mb-8">
    <div className="text-xs tracking-[.35em] uppercase text-amber-400">
     AI Crawl · Story operations · Local campaign preview
    </div>
    <h1 className="font-headline font-black text-4xl md:text-6xl tracking-tight text-white">
     COVENANT<span className="text-amber-400">//</span>DUST
    </h1>
    <p className="text-sm text-white/50">{copy[state.stage].subtitle}</p>
   </div>
   <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
    <article className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
     <div className="flex flex-wrap gap-3 items-center justify-between">
      <span className="text-xs tracking-widest uppercase text-amber-300">{state.title}</span>
      <span className="text-xs text-white/40">CANON v1 · REV {state.revision}</span>
     </div>
     <p className="text-lg text-white/80 leading-relaxed">{copy[state.stage].intro}</p>
     <div className="p-5 bg-amber-400/10 border border-amber-400/25 rounded-2xl">
      <p className="text-xs tracking-widest text-amber-300 uppercase mb-2">Current objective</p>
      <h2 className="font-headline text-xl font-bold">{state.objective}</h2>
     </div>
     <div aria-label="Current campaign tactics" className="space-y-3">
      <h3 className="text-xs font-bold tracking-widest text-white/50 uppercase">Your actions</h3>
      <div className="grid sm:grid-cols-2 gap-2">
       {choices.map((choice,i)=>
        <button key={choice.label+i} type="button" onClick={()=>dispatch(choice)}
         className="rounded-xl px-4 py-3 text-left text-sm font-bold text-white bg-white/10 border border-white/15 hover:border-amber-400/70 hover:bg-amber-400/10 focus-visible:outline-2 focus-visible:outline-amber-400 transition">
         {choice.label}
        </button>)}
       {state.stage==='MERCYS_END'&&
        <div className="col-span-full rounded-2xl border border-white/10 p-4 space-y-3">
         <label className="block text-xs text-white/60" htmlFor="covenant-tactic">Encounter tactic</label>
         <select id="covenant-tactic" className="w-full bg-[#201f1f] text-white rounded-xl p-2"
          value={tactic} onChange={e=>setTactic(e.target.value as Tactic)}>
          <option value="SHROUD">Shroud</option>
          <option value="DEAD_EYE">Dead Eye</option>
          <option value="HORSE">Rider Link</option>
          <option value="COVER">Environmental Cover</option>
          <option value="ALLY">Ally Tactics (proposed)</option>
         </select>
         {battle&&<div className="space-y-3" aria-label="Local tactical combat">
          <div className="flex justify-between text-xs text-white/75">
           <span>Gunslinger HP {battle.heroHP}/160</span><span>Enemy pressure {battle.enemyHP}</span>
          </div>
          <div className="flex justify-between text-xs text-white/60">
           <span>Shroud {battle.shroudEnergy}/4</span><span>Revolver {battle.ammo}/6</span>
           <span>Turn {battle.turn}/5+</span>
          </div>
          <p className="text-xs text-amber-300">Incoming: {battle.nextThreat.replaceAll('_',' ')}</p>
          <div className="grid grid-cols-2 gap-2">
           {([
            ['SHROUD_BLOCK','Block'],['SHROUD_REDIRECT','Redirect'],
            ['REVOLVER','Revolver'],['DEAD_EYE','Dead Eye'],
            ['DODGE','Dodge'],['TAKE_COVER','Take Cover'],
            ['RIDER_EVADE','Mounted Evasion'],
           ] as const).map(([move,label])=><button key={move} type="button"
            disabled={battle.status!=='FIGHTING'} onClick={()=>fight(move)}
            className="text-left p-2 rounded-lg bg-white/10 border border-white/10 text-sm hover:bg-white/20 disabled:opacity-35">
            {label}
           </button>)}
          </div>
          <p className="text-xs text-white/65">{battle.journal.at(-1)}</p>
          {battle.status==='FALLEN'&&<button type="button"
           className="text-sm text-amber-300 underline" onClick={()=>setBattle(beginWaveCombat(encounter(state)))}>
           Retry the local encounter
          </button>}
          {(battle.status==='SURVIVED'||battle.status==='ROUTED')&&<button type="button"
           onClick={()=>dispatch(action('Secure Wave','RESOLVE_WAVE',
             {tactic,outcome:battle.status==='ROUTED'?'ROUTED':'SURVIVED'}))}
           className="w-full bg-amber-400 text-black font-bold rounded-xl p-3 hover:bg-amber-300">
           Secure Wave {state.wave} · {battle.status}
          </button>}
         </div>}
         <p className="text-xs text-white/40">Tactical actions affect damage, ammunition, cover and Shroud energy. Local battle results remain untrusted for online rewards.</p>
        </div>}
      </div>
      {error&&<p role="alert" className="text-rose-300 text-sm">{error}</p>}
     </div>
     {state.stage==='FIRST_COVENANT_ENDING'&&
      <div className="bg-rose-950/40 rounded-2xl border border-rose-500/30 p-5 space-y-3">
       <h3 className="text-xl font-black text-rose-200">GLOBAL COVENANT CONVERGENCE DETECTED</h3>
       <p className="text-lg font-bold">EXECUTION PROGRESS: 1%</p>
       <p className="italic text-white/70">“Ride fast.”</p>
       <p className="text-xs text-white/50">CAMPAIGN II: THE MACHINE WAR — not yet implemented</p>
      </div>}
    </article>
    <aside className="space-y-5">
     <div className="glass-panel rounded-3xl p-6 space-y-4">
      <h3 className="text-xs text-white/50 uppercase tracking-widest font-bold">Adversary pressure</h3>
      <div className="flex justify-between items-baseline">
       <span className="text-3xl font-black text-amber-300">W{state.wave}</span>
       <span className="text-xs uppercase tracking-wider">{enemy.rarity}</span>
      </div>
      <p className="text-sm text-white/80">{enemy.waveName}</p>
      <div className="text-sm text-white/50 space-y-1">
       <p>Proposed enemy roster: {enemy.enemies.join(' · ')}</p>
       <p>Spawn budget: {enemy.spawnBudget} · Hazards: {enemy.hazards.join(' · ')}</p>
       <p>Counter-tactics: {enemy.tactics.join(' · ')}</p>
      </div>
      <p className="text-[11px] text-amber-300/70">
       Local deterministic encounter directives; native Unreal rendering and AI behaviors remain separate work.
      </p>
     </div>
     <div className="glass-panel rounded-3xl p-6 space-y-3">
      <h3 className="text-xs tracking-widest font-bold uppercase text-white/50">Awakening / knowledge</h3>
      <p className="text-sm">Abilities: {state.awakenings.join(' · ')}</p>
      <p className="text-sm">Clues: {state.clues.length}/4 · Shroud deflections: {state.shroudDeflections}</p>
      <p className="text-sm">Mount: {state.mounted?'Rider Link active':'Not mounted'} · Horse: {state.horseIdentity}</p>
      <p className="text-sm">Black Covenant: {state.covenant} · Seals: {state.notaryPhase}/3</p>
      <p className="text-sm">StrataKeys: {state.strataKeys}</p>
     </div>
     <div className="glass-panel rounded-3xl p-6 space-y-3">
      <h3 className="text-xs uppercase font-bold tracking-widest text-white/50">Campaign journal</h3>
      <ol className="space-y-2 max-h-64 overflow-auto">
       {[...state.log].reverse().slice(0,8).map(e=>
        <li key={e.id} className="text-xs text-white/70 border-l border-amber-300/30 pl-3">{e.text}</li>)}
       {state.log.length===0&&<li className="text-sm text-white/40">The Gunslinger is falling...</li>}
      </ol>
      <button type="button" onClick={()=>{
       if(globalThis.confirm?.('Reset the local Covenant Dust campaign preview?')){
        covenantDustSave.reset();setError('');
       }
      }} className="text-xs text-white/45 underline hover:text-white">Reset campaign preview</button>
     </div>
    </aside>
   </div>
   <p className="mt-6 text-xs text-white/40 max-w-3xl">
    This tactical campaign interface is an additive browser preview of canonical state logic.
    It does not replace AI Crawl combat, KINFT, existing saves, or the Unreal Engine game.
    It cannot mint assets, deploy contracts, publish videos, or modify WorldKernel authority.
   </p>
  </section>
 );
};
