import React, { useEffect, useRef, useState } from 'react';
import {
 decidePilot, learn, observedReward, parsePilotMemory, PILOT_SCHEMA,
 type PilotIntent, type PilotStyle, type PilotMemory,
} from '../game/autonomousPlayer';
import type { CampaignState, CampaignEvent, Action } from '../game/covenantDust';
import type { CombatMove, WaveBattle } from '../game/covenantDustCombat';

const MEMORY_KEY = 'ai_crawl_autonomous_pilot_v1';
type Pending = Readonly<{ before: WaveBattle; context: string }>;
type Props = Readonly<{
 state: CampaignState;
 battle: WaveBattle | null;
 onCampaignAction: (action: Action, fields?: Partial<CampaignEvent>) => void;
 onCombatMove: (move: CombatMove) => void;
 onRetryBattle: () => void;
}>;

function loadMemory(): PilotMemory {
 try {
  const raw = globalThis.localStorage?.getItem(MEMORY_KEY);
  return raw && raw.length < 32768 ? parsePilotMemory(JSON.parse(raw)) : {};
 } catch { return {}; }
}
function saveMemory(memory: PilotMemory): void {
 try { globalThis.localStorage?.setItem(MEMORY_KEY,
  JSON.stringify({ schemaVersion: PILOT_SCHEMA, values: memory })); }
 catch { /* Storage permission / quota cannot block gameplay. */ }
}
function marker(state: CampaignState, battle: WaveBattle | null): string {
 return state.seed + ':' + state.revision + ':' + state.stage + ':' + state.wave + ':' +
  (battle ? battle.sourceSeed + ':' + battle.turn + ':' + battle.status : 'none');
}

export const AutonomousPilotPanel: React.FC<Props> = ({
 state, battle, onCampaignAction, onCombatMove, onRetryBattle,
}) => {
 const [enabled, setEnabled] = useState(false);
 const [style, setStyle] = useState<PilotStyle>('CINEMATIC');
 const [pace, setPace] = useState(1600);
 const [latest, setLatest] = useState<PilotIntent | null>(null);
 const [history, setHistory] = useState<string[]>([]);
 const [memory, setMemory] = useState<PilotMemory>(loadMemory);
 const [completedMoves, setCompletedMoves] = useState(0);
 const [failed, setFailed] = useState('');
 const pending = useRef<Pending | null>(null);
 const recentMoves = useRef<CombatMove[]>([]);
 const lastActionMarker = useRef('');
 const retries = useRef(0);

 // Learning consumes a committed local battle update, never the predicted move
 // that the action-selection function considered before the UI advanced.
 useEffect(() => {
  const receipt = pending.current;
  if (!receipt || !battle) return;
  if (battle.sourceSeed !== receipt.before.sourceSeed) {
   pending.current = null;
   return;
  }
  if (battle.turn === receipt.before.turn + 1) {
   const reward = observedReward(receipt.before, battle);
   setMemory(old => {
    const next = learn(old, receipt.context, reward);
    saveMemory(next);
    return next;
   });
   setCompletedMoves(v => v + 1);
   pending.current = null;
  }
 }, [battle]);

 useEffect(() => {
  if (!enabled) return;
  // StrictMode/effect resubscriptions must not duplicate a state transition.
  const snapshot = marker(state, battle);
  if (snapshot === lastActionMarker.current) return;
  const timer = globalThis.setTimeout(() => {
   const step = decidePilot(state, battle, memory, style, recentMoves.current);
   setLatest(step);
   if (step.kind === 'STOP') { setEnabled(false); return; }
   if (step.kind === 'RETRY') {
    if (retries.current >= 2) {
     setFailed('Encounter retry budget exhausted; manual review required.');
     setEnabled(false);
     return;
    }
    retries.current += 1;
    lastActionMarker.current = snapshot;
    onRetryBattle();
    return;
   }
   try {
    if (step.kind === 'COMBAT') {
     pending.current = { before: battle!, context: step.context };
     recentMoves.current = [...recentMoves.current.slice(-7), step.action];
     onCombatMove(step.action);
    } else {
     onCampaignAction(step.action, step.fields);
    }
    lastActionMarker.current = snapshot;
    setHistory(previous => [...previous.slice(-7), step.cue]);
    setFailed('');
   } catch (error) {
    pending.current = null;
    setFailed(error instanceof Error ? error.message : 'Autonomous action failed');
    setEnabled(false);
   }
  }, pace);
  return () => globalThis.clearTimeout(timer);
 }, [enabled, state, battle, memory, style, pace, onCampaignAction, onCombatMove, onRetryBattle]);

 const toggle = () => {
  if (!enabled) {
   lastActionMarker.current = '';
   retries.current = 0;
   setFailed('');
  }
  setEnabled(!enabled);
 };
 const learnedContexts = Object.keys(memory).length;

 return (
  <section className="rounded-3xl border border-amber-400/35 bg-gradient-to-br from-[#25190b] via-[#161519] to-[#10121d] p-5 space-y-4"
   aria-label="Kindred autonomous AI gameplay pilot">
   <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
     <p className="text-[10px] font-bold uppercase tracking-[.3em] text-amber-300">Kindred AI · Player Mind</p>
     <h3 className="font-headline text-2xl font-black text-white">AUTONOMOUS PILOT</h3>
     <p className="text-xs text-white/55">Real game-state tactics · Local player/tester · No paid AI API</p>
    </div>
    <span className={'text-xs font-bold rounded-full px-3 py-2 border ' +
      (enabled ? 'border-green-400/40 bg-green-500/10 text-green-300' :
       'border-white/20 bg-white/5 text-white/60')}>
     {enabled ? '● PILOT ACTIVE' : '○ MANUAL CONTROL'}
    </span>
   </div>
   <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
    <label className="text-xs text-white/65 space-y-1">
     <span className="block">Playing style</span>
     <select aria-label="Autonomous player style" disabled={enabled} value={style}
      onChange={e => setStyle(e.target.value as PilotStyle)}
      className="block w-full rounded-xl bg-black/50 border border-white/20 text-white px-3 py-3">
      <option value="CINEMATIC">Cinematic · Epic moments</option>
      <option value="BALANCED">Balanced · Strong decisions</option>
      <option value="SURVIVAL">Survival · Careful veteran</option>
      <option value="EXPLORER">Explorer · Varied tactics</option>
     </select>
    </label>
    <label className="text-xs text-white/65 space-y-1">
     <span className="block">Stream pacing</span>
     <select aria-label="Autonomous player action interval" value={pace}
      onChange={e => setPace(Number(e.target.value))}
      className="block w-full rounded-xl bg-black/50 border border-white/20 text-white px-3 py-3">
      <option value={1000}>Fast · 1 second</option>
      <option value={1600}>Cinematic · 1.6 seconds</option>
      <option value={2800}>Commentary · 2.8 seconds</option>
     </select>
    </label>
    <button type="button" onClick={toggle}
     className={'min-h-12 px-6 rounded-xl font-black uppercase tracking-wider ' +
      (enabled ? 'bg-rose-600 text-white hover:bg-rose-500' :
       'bg-amber-400 text-black hover:bg-amber-300')}>
     {enabled ? 'Stop Pilot' : 'Let AI Play'}
    </button>
   </div>
   <div className="bg-black/40 rounded-2xl border border-white/10 p-4 space-y-2" aria-live="polite">
    <p className="text-[10px] tracking-widest text-amber-300 uppercase">Live cinematic director</p>
    <p className="text-lg font-black text-white">{latest?.cue ?? 'AWAITING DIRECTOR ACTIVATION'}</p>
    <p className="text-xs text-white/70 leading-relaxed">
     {latest?.reason ?? 'The player Mind will inspect campaign state, choose legal moves, and record outcomes.'}
    </p>
   </div>
   <div className="flex flex-wrap gap-4 text-xs text-white/65">
    <span>Observed combat turns: <strong className="text-white">{completedMoves}</strong></span>
    <span>Learned contexts: <strong className="text-white">{learnedContexts}</strong></span>
    <span>Campaign revision: <strong className="text-white">{state.revision}</strong></span>
    <span>Battle status: <strong className="text-white">{battle?.status ?? state.stage}</strong></span>
   </div>
   {history.length > 0 && <ol className="text-[11px] text-white/50 space-y-1 max-h-32 overflow-y-auto"
    aria-label="Observed autonomous actions">
    {[...history].reverse().map((item, index) =>
     <li key={history.length - index + ':' + item}>▸ {item}</li>)}
   </ol>}
   {failed && <p role="alert" className="text-rose-300 text-xs">{failed}</p>}
   <p className="text-[11px] text-amber-100/45">
    This is a locally executed tactical AI, not a trained replica of the founder.
    Only valid campaign actions execute. Learning is scoped to this browser; no online rewards,
    code edits, cloud writes, YouTube broadcasts or WorldKernel mutations are triggered by the pilot.
   </p>
  </section>
 );
};
