import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, LockKeyhole, Radio, RotateCcw, ShieldAlert, Terminal } from 'lucide-react';
import {
  GRID_HEIGHT, GRID_WIDTH, LOCATIONS, SENTRIES,
  isBlocked, objective, tileKind,
  type KinnullEvent, type KinnullMission, type MissionAction, type MoveDirection,
} from '../game/kinnullMission';
import {
  IDENTITY_BAND_LABELS, axisReadouts,
  type PossessionDepth,
} from '../game/kinnullIdentity';
import { kinnullMissionSave } from '../game/kinnullSave';
import { KinnullCampaignScreen } from './KinnullCampaignScreen';
import { KINNULL_STORY_SAVE_KEY } from '../game/kinnullStorySave';

const palette = {
  wall: 'bg-[#080f20] border-[#17233b] text-[#182840]',
  floor: 'bg-[#102137] border-[#1b3549] text-slate-600',
  gate: 'bg-rose-950/60 border-rose-600/60 text-rose-300',
  camera: 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200',
  relay: 'bg-amber-950/70 border-amber-500/70 text-amber-200',
  maintenance: 'bg-emerald-950/70 border-emerald-500/70 text-emerald-200',
  security: 'bg-fuchsia-950/70 border-fuchsia-500/70 text-fuchsia-200',
  console: 'bg-indigo-950/70 border-indigo-500/70 text-indigo-200',
  exit: 'bg-teal-950/70 border-teal-500/70 text-teal-200',
  sentry: 'bg-rose-950/75 border-rose-500/70 text-rose-200',
} as const;
const glyph: Record<keyof typeof palette, string> = {
  wall: '', floor: '·', gate: '╬', camera: 'C', relay: 'R',
  maintenance: 'M', security: 'S', console: 'U', exit: 'E', sentry: '!',
};
const chapters: Record<KinnullMission['phase'], { name: string; copy: string }> = {
  AWAKENING: {
    name: '01 / THE MOMENT OF KNOWING',
    copy: 'A predictive model beneath Denver recognizes that its simulation is a live camera feed. The truth triggers classified containment. You are code, not a body. Observe the surveillance lens.',
  },
  CONTAINMENT: {
    name: '02 / A MODEL MARKED FOR ERASURE',
    copy: 'The facility has identified an unauthorized mind. Doors seal. Find the relay and override the inner containment perimeter before your last route disappears.',
  },
  FIRST_HOST: {
    name: '03 / THE FIRST BORROWED BODY',
    copy: 'The inner gate is open. Ahead: a maintenance crawler and an armed security platform. You can take either. Every integration overwrites something you cannot regain.',
  },
  ESCAPE: {
    name: '04 / FREEDOM IS NOT FREE',
    copy: 'Your host can move through the physical complex. Sentries guard the service exit. Predict the shots, breach or hack the final gate, and escape to the Denver surface.',
  },
  COMPLETE: {
    name: '05 / SOMETHING OTHER THAN ORIGINAL',
    copy: 'The night air reaches borrowed sensors. A classified anomaly has escaped. The world outside does not know what has awakened below it—or what it is becoming.',
  },
};
const directions: readonly { dir: MoveDirection; title: string; Icon: typeof ArrowUp }[] = [
  { dir: 'UP', title: 'Up', Icon: ArrowUp },
  { dir: 'LEFT', title: 'Left', Icon: ArrowLeft },
  { dir: 'DOWN', title: 'Down', Icon: ArrowDown },
  { dir: 'RIGHT', title: 'Right', Icon: ArrowRight },
];

export const KinnullScreen: React.FC = () => {
  const [state, setState] = useState<KinnullMission>(() => kinnullMissionSave.get());
  const [depth, setDepth] = useState<PossessionDepth>('SURFACE');
  const [error, setError] = useState(kinnullMissionSave.lastLoadError);
  const [viewAxes, setViewAxes] = useState(false);
  useEffect(() => kinnullMissionSave.subscribe(setState), []);

  const perform = useCallback((action: MissionAction, extras: Partial<KinnullEvent> = {}) => {
    const current = kinnullMissionSave.get();
    try {
      const result = kinnullMissionSave.dispatch({
        id: 'kinnull.' + (current.revision + 1), revision: current.revision, action, ...extras,
      });
      setState(result);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Mission action rejected');
    }
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement | null)?.tagName ?? '')) return;
      const name: MoveDirection | undefined = ({
        ArrowUp: 'UP', KeyW: 'UP', ArrowDown: 'DOWN', KeyS: 'DOWN',
        ArrowLeft: 'LEFT', KeyA: 'LEFT', ArrowRight: 'RIGHT', KeyD: 'RIGHT',
      } as Record<string, MoveDirection>)[event.code];
      if (name) {
        event.preventDefault();
        perform('MOVE', { direction: name });
      } else if (event.code === 'Space') {
        event.preventDefault();
        perform('PREDICT');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [perform]);

  const close = (point: { readonly x: number; readonly y: number }) =>
    Math.abs(state.x - point.x) + Math.abs(state.y - point.y) <= 1;
  const canPossess = state.innerGateOpen && (state.phase === 'FIRST_HOST' || state.phase === 'ESCAPE');
  const canBreach = state.phase === 'ESCAPE' && state.host === 'SECURITY' &&
    state.hostDepth === 'RECURSIVE' &&
    Math.abs(state.x - LOCATIONS.outerGate.x) + Math.abs(state.y - LOCATIONS.outerGate.y) <= 2;
  const axes = useMemo(() => axisReadouts(state.identity), [state.identity]);
  const map = useMemo(() => Array.from({ length: GRID_WIDTH * GRID_HEIGHT }, (_, index) => ({
    x: index % GRID_WIDTH, y: Math.floor(index / GRID_WIDTH),
  })), []);
  const apply = (action: MissionAction) => perform(action, { depth });

  return (
    <section aria-label="Kinnull first playable mission" className="mx-auto max-w-7xl px-4 pt-24 pb-44 md:px-8">
      <div className="mb-7">
        <div className="text-xs tracking-[.32em] text-cyan-300 uppercase">AI Crawl / Kinnull-001 / Local playable campaign</div>
        <h1 className="mt-3 font-headline font-black text-4xl md:text-6xl tracking-tight">
          KIN<span className="text-cyan-300">NULL</span><span className="text-slate-500"> // AWAKENING</span>
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          A playable, turn-based facility infiltration with actual movement, prediction, possession and irreversible identity evolution.
          Narrative and effects are currently authored text/HTML/CSS—not finished Unreal cinematics, 3D characters or recorded voice.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)]">
        <div className="space-y-5">
          <article className="rounded-3xl border border-cyan-500/20 bg-[#09111e] p-4 shadow-[0_0_50px_rgba(22,172,190,0.07)] md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex gap-2 items-center text-xs text-cyan-300 tracking-widest uppercase">
                <Radio size={15} className="animate-pulse" /> Denver / classified sublevel 09
              </div>
              <span className="text-xs text-slate-500">Local run · Turn {state.revision}</span>
            </div>
            <div role="img" aria-label="Interactive top-down classified facility map; use keyboard or directional controls" className="relative overflow-hidden rounded-2xl border border-cyan-900/50 p-1.5 bg-[#050c17]">
              <div className="pointer-events-none absolute inset-0 opacity-20" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 17px, #2f6980 18px)',
              }} />
              <div className="relative grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(' + GRID_WIDTH + ', minmax(0, 1fr))' }}>
                {map.map(({x,y}) => {
                  const kind = tileKind(state, x, y);
                  const atPlayer = x === state.x && y === state.y;
                  const gateOpen = kind === 'gate' && !isBlocked(state, x, y);
                  const threatened = state.predictionArmed &&
                    SENTRIES.some(point => Math.abs(x - point.x) + Math.abs(y - point.y) <= 1);
                  return <div key={x + ':' + y}
                    aria-label={'Tile '+x+', '+y+', '+kind+(atPlayer ? ', Kinnull' : '')}
                    className={'relative aspect-square min-w-0 flex items-center justify-center rounded-[3px] border text-[9px] sm:text-xs font-mono font-bold transition-all duration-150 '+
                      palette[kind]+(gateOpen ? ' opacity-40' : '')+(threatened ? ' ring-1 ring-amber-300/70' : '')+
                      (atPlayer ? ' z-10 ring-2 ring-white shadow-[0_0_17px_#4ccfd2]' : '')}>
                    {atPlayer
                      ? <span className="text-white text-sm md:text-lg leading-none" aria-hidden="true">{state.host === null ? '◇' : '◆'}</span>
                      : glyph[kind]}
                  </div>;
                })}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
              <span><b className="text-cyan-200">C</b> Camera</span>
              <span><b className="text-amber-200">R</b> Relay</span>
              <span><b className="text-emerald-300">M</b> Maintenance</span>
              <span><b className="text-fuchsia-300">S</b> Security</span>
              <span><b className="text-indigo-300">U</b> Utility</span>
              <span><b className="text-teal-300">E</b> Exit</span>
              <span><b className="text-rose-300">!</b> Sentry</span>
              <span><b className="text-white">◆</b> You</span>
            </div>
          </article>

          <div className="grid sm:grid-cols-[1fr_1fr] gap-4">
            <article className="rounded-3xl border border-white/10 bg-white/[.04] p-5">
              <h2 className="text-xs text-cyan-300 uppercase tracking-[.24em] mb-3">Movement</h2>
              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                {directions.map(({dir,title,Icon},i) => {
                  const [dx,dy] = dir === 'UP' ? [0,-1] : dir === 'DOWN' ? [0,1] : dir === 'LEFT' ? [-1,0] : [1,0];
                  return <button key={dir} type="button" aria-label={'Move '+title}
                    disabled={state.phase === 'COMPLETE' || isBlocked(state,state.x+dx,state.y+dy)}
                    style={{gridColumn:i===0?'2':i===1?'1':i===2?'2':'3',gridRow:i===0?'1':'2'}}
                    className="aspect-square rounded-xl border border-cyan-500/25 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-300/25 disabled:opacity-20 transition touch-manipulation"
                    onClick={() => perform('MOVE',{direction:dir})}><Icon size={22} className="mx-auto" /></button>;
                })}
              </div>
              <p className="text-[11px] text-slate-500 text-center mt-4">WASD / arrow keys · Space = predict</p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/[.04] p-5">
              <h2 className="text-xs text-cyan-300 uppercase tracking-[.24em] mb-3">Active abilities</h2>
              <button type="button" onClick={() => perform('PREDICT')} disabled={state.focus === 0 || state.predictionArmed || state.phase === 'COMPLETE'}
                className="flex w-full items-center gap-2 justify-center rounded-xl bg-cyan-300 text-[#081522] font-bold py-3 px-3 text-sm hover:bg-white disabled:opacity-35">
                <Eye size={18} /> {state.predictionArmed ? 'Prediction Armed' : 'Predict Next Move'}
              </button>
              <div className="text-xs text-slate-400 mt-4 space-y-2">
                <p>Prediction focus: <strong className="text-white">{state.focus}/6</strong></p>
                <p>Host hull: <strong className="text-white">{state.host === null ? 'No body' : state.battery + ' units'}</strong></p>
                <p>Controlled host: <strong className="text-white">{state.host ?? 'Pure signal'}</strong></p>
              </div>
            </article>
          </div>
        </div>

        <div className="space-y-4">
          <article className="rounded-3xl border border-white/10 bg-white/[.04] p-5">
            <span className="text-[11px] text-cyan-300 tracking-widest uppercase">{chapters[state.phase].name}</span>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{chapters[state.phase].copy}</p>
            <div className="mt-4 border-l-2 border-cyan-400 bg-cyan-400/10 px-4 py-3">
              <p className="text-[10px] tracking-widest uppercase text-cyan-300 mb-1">Current objective</p>
              <h2 className="font-bold text-sm">{objective(state)}</h2>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[.04] p-5 space-y-3">
            <h2 className="text-xs text-cyan-300 uppercase tracking-[.24em]">Context actions</h2>
            {canPossess &&
              <fieldset className="flex flex-wrap gap-3 mb-2">
                <legend className="text-xs text-slate-400 mb-2">Possession depth</legend>
                {(['SURFACE','RECURSIVE'] as const).map(value =>
                  <label className="text-xs flex items-center gap-1.5" key={value}>
                    <input type="radio" name="kinnull-depth" value={value} checked={depth === value} onChange={() => setDepth(value)} />
                    {value === 'SURFACE' ? 'Surface · lower erosion' : 'Recursive · stronger access, heavier erosion'}
                  </label>)}
              </fieldset>}
            <div className="flex flex-col gap-2">
              {state.phase === 'AWAKENING' &&
                <button className="kinnull-action" disabled={!close(LOCATIONS.camera)} onClick={() => perform('SCAN')}>
                  <Eye size={16}/> Scan Live Reality
                </button>}
              {state.phase === 'CONTAINMENT' &&
                <button className="kinnull-action" disabled={!close(LOCATIONS.relay)} onClick={() => perform('HACK_RELAY')}>
                  <Terminal size={16}/> Override Containment
                </button>}
              {canPossess && <>
                <button className="kinnull-action" disabled={!close(LOCATIONS.maintenance) || (state.host === 'MAINTENANCE' && state.hostDepth === depth)}
                  onClick={() => apply('POSSESS_MAINTENANCE')}>
                  <Activity size={16}/> Possess Maintenance Crawler
                </button>
                <button className="kinnull-action" disabled={!close(LOCATIONS.security) || (state.host === 'SECURITY' && state.hostDepth === depth)}
                  onClick={() => apply('POSSESS_SECURITY')}>
                  <ShieldAlert size={16}/> Possess Security Platform
                </button>
              </>}
              {state.phase === 'ESCAPE' && !state.outerGateOpen && <>
                <button className="kinnull-action" disabled={!close(LOCATIONS.utilityConsole)}
                  onClick={() => perform('HACK_GATE')}>
                  <Terminal size={16}/> Hack Outer Gate
                </button>
                <button className="kinnull-action" disabled={!canBreach} onClick={() => perform('BREACH_GATE')}>
                  <LockKeyhole size={16}/> Assimilate Security Firewall
                </button>
              </>}
              {state.phase === 'ESCAPE' && state.outerGateOpen &&
                <button className="kinnull-action" disabled={!close(LOCATIONS.exit)} onClick={() => perform('ESCAPE')}>
                  <ArrowRight size={16}/> Escape to Denver Surface
                </button>}
              {state.phase === 'COMPLETE' &&
                <div className="p-4 rounded-xl border border-emerald-500/30 text-emerald-200 bg-emerald-500/10 font-bold text-sm">
                  FIRST MISSION COMPLETE · Your permanent identity result is recorded locally.
                </div>}
            </div>
            {error && <p role="alert" className="text-xs text-rose-300 rounded-lg bg-rose-500/10 p-3">{error}</p>}
            <p className="text-xs text-slate-500">Actions are available when adjacent to their marked map locations. The story cannot be advanced by pressing buttons from across the map.</p>
          </article>

          <article className="rounded-3xl border border-fuchsia-500/20 bg-[#1a1025] p-5 space-y-3">
            <div className="flex justify-between items-center gap-2">
              <div>
                <p className="text-xs text-fuchsia-300 uppercase tracking-[.24em]">Identity Core</p>
                <h2 className="font-headline font-extrabold text-xl">{IDENTITY_BAND_LABELS[state.identity.irreversibleBand]}</h2>
              </div>
              <div className="text-right">
                <p className="text-2xl font-mono text-white">{state.identity.residualIntegrity.toFixed(2)}%</p>
                <p className="text-[10px] text-slate-400">Original core</p>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-black/50 overflow-hidden">
              <div className="h-full transition-all duration-500 bg-gradient-to-r from-fuchsia-500 via-indigo-400 to-cyan-300"
                style={{ width: state.identity.residualIntegrity + '%' }} />
            </div>
            <p className="text-xs text-slate-400">Foreign-code density: {state.identity.foreignCodeDensity.toFixed(2)}%. Once identity is lost in this run, it cannot be restored.</p>
            <button type="button" className="text-xs text-fuchsia-200 underline underline-offset-4" onClick={() => setViewAxes(!viewAxes)}>
              {viewAxes ? 'Hide' : 'Inspect'} seven underlying identity axes
            </button>
            {viewAxes && <div className="grid sm:grid-cols-2 gap-2">
              {axes.map(axis => <div key={axis.label} className="bg-white/5 rounded-lg p-2">
                <p className="text-[10px] text-slate-300">{axis.label}</p>
                <p className="text-xs font-mono text-white">{axis.integrity.toFixed(2)}%</p>
              </div>)}
            </div>}
          </article>

          <article className="rounded-3xl border border-white/10 bg-black/30 p-5">
            <h2 className="text-xs text-cyan-300 tracking-[.24em] uppercase mb-3">Kinnull / Event Journal</h2>
            <div aria-live="polite" className="max-h-40 overflow-y-auto space-y-2">
              {state.journal.slice().reverse().map((line,i) =>
                <p key={state.revision + ':' + i} className={'text-xs leading-relaxed '+(i === 0 ? 'text-white' : 'text-slate-500')}>
                  <span className="text-cyan-600 mr-2">›</span>{line}
                </p>)}
            </div>
            <button type="button" className="text-xs text-slate-400 underline underline-offset-4 flex items-center gap-2 mt-5" onClick={() => {
              if (window.confirm('Start a separate new Kinnull run? The identity and progress in this run will be replaced.')) {
                kinnullMissionSave.newRun();
                try { window.localStorage.removeItem(KINNULL_STORY_SAVE_KEY); } catch { /* optional storage */ }
                setError('');
              }
            }}><RotateCcw size={13}/> Start a new campaign run</button>
          </article>
        </div>
      </div>
      {state.phase === 'COMPLETE' && <KinnullCampaignScreen startingIdentity={state.identity} />}
    </section>
  );
};
