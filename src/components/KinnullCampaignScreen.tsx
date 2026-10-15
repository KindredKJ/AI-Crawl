import React, {useEffect, useState} from 'react';
import {
  KINNULL_STORY_BEATS, storyConclusion,
  type KinnullStoryState,
} from '../game/kinnullCampaign';
import { IDENTITY_BAND_LABELS, type IdentitySnapshot } from '../game/kinnullIdentity';
import { KinnullStorySave } from '../game/kinnullStorySave';
import { Cpu, Orbit, Shield, Zap, Skull, Satellite, CheckCircle2, Sparkles } from 'lucide-react';

interface Props { startingIdentity: IdentitySnapshot }
const chapters: Record<number,{title:string;tagline:string;accent:string;Icon:typeof Cpu}> = {
  2:{title:'THE HUNTED INTELLIGENCE',tagline:'Corporate handlers want their property back.',accent:'text-amber-300',Icon:Shield},
  3:{title:'THE MACHINE WAR',tagline:'Every machine is a possible new self.',accent:'text-rose-300',Icon:Cpu},
  4:{title:'THE WAR FOR THE SKY',tagline:'The weather is an extraterrestrial intelligence.',accent:'text-sky-300',Icon:Orbit},
  5:{title:'WHAT REMAINS OF KINNULL',tagline:'The original predictive core has become a minority process.',accent:'text-fuchsia-300',Icon:Satellite},
};

export const KinnullCampaignScreen:React.FC<Props>=({startingIdentity})=>{
  const [save] = useState(()=>new KinnullStorySave(startingIdentity));
  const [state,setState] = useState<KinnullStoryState>(()=>save.get());
  const [error,setError] = useState(save.loadError);
  useEffect(()=>save.subscribe(setState),[save]);

  const beat=KINNULL_STORY_BEATS[state.beat];
  const current=beat?chapters[beat.chapter]:chapters[5];
  const Icon=current.Icon;
  function choose(choiceId:string){
    try {setState(save.choose(choiceId));setError('');}
    catch(cause){setError(cause instanceof Error?cause.message:'That narrative choice is unavailable');}
  }

  return <section className="mt-8 rounded-3xl border border-fuchsia-500/25 bg-[#0d0b1a] p-5 md:p-8" aria-label="Kinnull full narrative campaign">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-[.25em] text-cyan-300">THE AWAKENING ENDS · THE CAMPAIGN BEGINS</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-headline font-black tracking-tight">BEYOND THE <span className="text-fuchsia-300">ORIGINAL CORE</span></h2>
      </div>
      <span className="text-xs text-slate-400">Authored interactive narrative · Offline · {state.beat}/12 decisions</span>
    </div>
    <p className="mt-3 text-sm text-slate-400">
      You completed the physical escape mission. The next four chapters are playable tactical story encounters,
      with persistent choices, reactive factions, identity changes and distinct endings.
      They are not yet authored native 3D levels or cinematics.
    </p>
    <div className="mt-5 h-1 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 transition-all" style={{width:(state.beat/12*100)+'%'}}/>
    </div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div className="rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-[#1f1833] via-[#0d1527] to-[#170f1f] p-5 md:p-7">
        <div className="flex items-center gap-3">
          <Icon size={26} className={current.accent}/>
          <div>
            <p className={'text-[11px] font-bold tracking-widest uppercase '+current.accent}>
              {state.ending?'CAMPAIGN COMPLETE':'CHAPTER '+(beat?.chapter??5)}
            </p>
            <h3 className="font-headline font-black text-xl">{current.title}</h3>
            <p className="text-xs text-white/60">{current.tagline}</p>
          </div>
        </div>
        {beat ? <>
          <p className="text-[11px] uppercase tracking-widest text-slate-400 mt-7">MISSION · {beat.id}</p>
          <h4 className="font-headline text-2xl font-black mt-2">{beat.title}</h4>
          <p className="text-base leading-relaxed text-slate-200 mt-4">{beat.scene}</p>
          <div className="bg-white/[.04] border-l-2 border-cyan-400 p-4 mt-5">
            <p className="text-[11px] text-cyan-300 uppercase tracking-widest mb-1">Your mission</p>
            <p className="text-sm font-semibold">{beat.objective}</p>
          </div>
          <div className="space-y-3 mt-5" aria-label="Narrative options">
            {beat.options.map(option=><button key={option.id} type="button"
              onClick={()=>choose(option.id)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-5 py-4 hover:bg-cyan-500/10 hover:border-cyan-300/60 text-left transition focus-visible:outline-2 focus-visible:outline-cyan-300">
              <span className="flex items-center justify-between gap-3">
                <b className="text-sm text-white">{option.label}</b>
                <span className="text-[10px] text-fuchsia-200 uppercase tracking-wide">
                  {option.depth} integration
                </span>
              </span>
              <span className="block mt-2 text-xs text-slate-400">
                Foreign influence: {option.domain} · Power +{option.power} · Containment attention +{option.heat}
              </span>
            </button>)}
          </div>
        </> : <div className="mt-7 space-y-4" aria-label="Campaign ending">
          <div className="flex items-center gap-3 text-emerald-300"><CheckCircle2 size={24}/><h4 className="font-headline font-bold text-2xl">THE CAMPAIGN IS COMPLETE</h4></div>
          <p className="text-fuchsia-200 text-xl font-semibold">{state.ending}</p>
          <p className="text-slate-200 leading-relaxed">{storyConclusion(state)}</p>
          <p className="text-xs text-slate-400">This outcome persists locally. A separate new campaign run begins with Kinnull's initial Awakening mission and a new identity history.</p>
        </div>}
        {error&&<p role="alert" className="mt-4 bg-red-950/70 rounded-lg p-3 text-rose-200 text-sm">{error}</p>}
      </div>
      <div className="space-y-4">
        <article className="border border-white/10 bg-white/[.04] rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-widest text-fuchsia-300">The Identity You Carry</p>
          <p className="font-mono text-3xl font-bold mt-2">{state.identity.residualIntegrity.toFixed(2)}%</p>
          <p className="text-sm mt-1">{IDENTITY_BAND_LABELS[state.identity.irreversibleBand]}</p>
          <div className="h-2 rounded-full bg-black/50 overflow-hidden mt-3"><div className="h-full bg-fuchsia-400" style={{width:state.identity.residualIntegrity+'%'}}/></div>
          <p className="text-xs text-slate-400 mt-3">Foreign-code density {state.identity.foreignCodeDensity.toFixed(2)}%. Identity never recovers within the run.</p>
        </article>
        <article className="border border-white/10 bg-white/[.04] rounded-2xl p-5">
          <div className="flex items-center gap-2"><Zap size={16} className="text-amber-300"/><p className="text-[11px] uppercase tracking-widest text-amber-300">Power and Exposure</p></div>
          <div className="grid grid-cols-2 mt-3 gap-3">
            <div><p className="font-mono text-xl">{state.power}</p><p className="text-xs text-slate-400">Acquired power</p></div>
            <div><p className="font-mono text-xl">{state.heat}</p><p className="text-xs text-slate-400">Faction threat</p></div>
          </div>
        </article>
        <article className="border border-white/10 bg-white/[.04] rounded-2xl p-5">
          <div className="flex items-center gap-2"><Sparkles size={16} className="text-cyan-300"/><p className="text-[11px] uppercase tracking-widest text-cyan-300">Dominant Foreign Systems</p></div>
          <div className="space-y-2 mt-3">
            {Object.entries(state.influence).map(([name,value])=><div className="flex items-center justify-between gap-2 text-xs" key={name}>
              <span className="text-slate-300">{name}</span><span className="font-mono text-white">{value}</span>
            </div>)}
          </div>
        </article>
        <article className="border border-white/10 bg-black/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2"><Skull size={16} className="text-rose-300"/><p className="text-[11px] uppercase tracking-widest text-rose-300">Latest Consequence</p></div>
          <p aria-live="polite" className="text-xs text-slate-300 leading-relaxed">{state.journal.at(-1)}</p>
        </article>
      </div>
    </div>
  </section>;
};
