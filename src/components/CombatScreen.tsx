import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StatBar } from './StatBar';
import { gameState } from '../game/gameState';
import { companionManager, attemptCapture, TYPE_BONUSES } from '../game/companionSystem';
import { runCombatRound, calcBattleRewards, spawnEnemyFromTemplate, BattleState } from '../game/combatEngine';
import { getRandomEnemyForLevel, ENEMY_ROSTER } from '../game/enemyRoster';
import { ZONES, getZone, ZoneId } from '../game/enemies';
import { PlayerState, Enemy, EnemyTemplate, Companion } from '../types';
import { Swords, Shield, Zap, ChevronRight, RotateCcw, Trophy, Skull, Star, Circle, Users } from 'lucide-react';
import { cn } from '../lib/utils';

const ROUND_DELAY_MS = 800;
type CombatPhase = 'IDLE' | 'IN_BATTLE' | 'RESULT';

const TYPE_COLORS: Record<string, string> = {
  MECHANICAL: 'text-slate-300', DROID: 'text-blue-400', DRONE: 'text-sky-400',
  BEAST: 'text-orange-400', PHANTOM: 'text-purple-400', ANOMALY: 'text-pink-400',
  CONSTRUCT: 'text-teal', HUMANOID: 'text-green-400', BOSS: 'text-red-400',
};

export const CombatScreen: React.FC = () => {
  const [player, setPlayer] = useState<PlayerState>(gameState.get());
  const [companions, setCompanions] = useState<Companion[]>(companionManager.getAll());
  const [phase, setPhase] = useState<CombatPhase>('IDLE');
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<EnemyTemplate | null>(null);
  const [isBossFight, setIsBossFight] = useState(false);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [isRunningRound, setIsRunningRound] = useState(false);
  const [captureMsg, setCaptureMsg] = useState<string | null>(null);
  const [resultData, setResultData] = useState<{
    won: boolean; captured: boolean; xp: number; currency: number;
    leveledUp: boolean; newLevel: number; lootItems: { id: string; name: string; quantity: number }[];
    capturedCompanion?: Companion;
  } | null>(null);
  const [showAuraEffect, setShowAuraEffect] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { return gameState.subscribe(setPlayer); }, []);
  useEffect(() => { return companionManager.subscribe(setCompanions); }, []);

  useEffect(() => {
    if (player.auraCooldown <= 0) return;
    const t = setInterval(() => gameState.tickAuraCooldown(), 1000);
    return () => clearInterval(t);
  }, [player.auraCooldown]);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [battle?.rounds.length]);

  const zone = getZone(player.activeZone as ZoneId);
  const activeCompanion = companionManager.getActive();

  const startBattle = useCallback((boss: boolean) => {
    let template: EnemyTemplate;
    let enemy: Enemy;

    if (boss) {
      const zoneData = ZONES.find(z => z.id === player.activeZone);
      const b = zoneData?.bossEnemy;
      if (!b) return;
      enemy = { ...b, hp: b.maxHp, templateId: undefined };
      template = {
        id: b.id, name: b.name, flavor: 'A zone boss. Defeat it to prove your dominance.',
        type: b.type as any, tier: Math.ceil(ZONES.indexOf(zoneData!) + 1),
        baseHp: b.maxHp, baseAtk: b.atk, baseDef: b.def,
        abilities: b.abilities, captureRate: 0.05, lootTable: ['fusion_core', 'quantum_core'],
        xpReward: 400, currencyReward: 300,
      };
    } else {
      template = getRandomEnemyForLevel(player.level);
      const levelMult = 1 + (player.level - 1) * 0.05;
      enemy = spawnEnemyFromTemplate(template, levelMult);
    }

    setCurrentTemplate(template);
    setCurrentEnemy(enemy);
    setIsBossFight(boss);
    setBattle({ playerHp: player.hp, enemyHp: enemy.hp, rounds: [], status: 'ONGOING', enemyIsAngry: false });
    setPhase('IN_BATTLE');
    setResultData(null);
    setCaptureMsg(null);
  }, [player]);

  const finishBattle = useCallback((nextBattle: BattleState, template: EnemyTemplate, captured = false, capturedCompanion?: Companion) => {
    const won = nextBattle.status === 'PLAYER_WON';
    const xpMult = zone.xpMultiplier;
    const currMult = zone.currencyMultiplier;
    const compXpMult = activeCompanion?.typeBonus.stat === 'xp' ? 1 + activeCompanion.typeBonus.bonus : 1;
    const rewards = calcBattleRewards(template, player.level, xpMult, currMult, compXpMult, won);
    const { didLevelUp, newLevel } = gameState.applyBattleResult({
      won, xpGained: rewards.xpGained, currencyGained: rewards.currencyGained,
      damageDealt: template.baseHp, damageTaken: player.hp - nextBattle.playerHp,
      kills: won ? 1 : 0, loot: null, lootItems: rewards.lootItems, captured,
    });
    // Give companion XP
    if (activeCompanion) {
      companionManager.addXp(activeCompanion.id, rewards.companionXp);
      if (won) companionManager.recordBattleWin(activeCompanion.id);
    }
    if (player.auraActive) gameState.deactivateAura(30);
    setResultData({ won, captured, xp: rewards.xpGained, currency: rewards.currencyGained, leveledUp: didLevelUp, newLevel, lootItems: rewards.lootItems, capturedCompanion });
    setPhase('RESULT');
  }, [player, zone, activeCompanion]);

  const handleAttack = useCallback(() => {
    if (!battle || !currentEnemy || !currentTemplate || isRunningRound || battle.status !== 'ONGOING') return;
    setIsRunningRound(true);
    setTimeout(() => {
      const next = runCombatRound(battle, player, currentEnemy, player.auraActive, activeCompanion);
      setBattle(next);
      if (next.status !== 'ONGOING') finishBattle(next, currentTemplate);
      setIsRunningRound(false);
    }, ROUND_DELAY_MS);
  }, [battle, currentEnemy, currentTemplate, isRunningRound, player, activeCompanion, finishBattle]);

  const handleCapture = useCallback(() => {
    if (!battle || !currentEnemy || !currentTemplate || isRunningRound || battle.status !== 'ONGOING') return;
    setIsRunningRound(true);

    setTimeout(() => {
      const hpPct = battle.enemyHp / (currentEnemy.maxHp || 1);
      const result = attemptCapture(currentTemplate, hpPct, player.level);

      setCaptureMsg(result.message);

      // Log it
      setBattle(prev => prev ? {
        ...prev,
        enemyIsAngry: result.angryEnemy,
        rounds: [...prev.rounds, { turn: 'SYSTEM', message: result.message, damage: 0, isCrit: false }],
      } : prev);

      if (result.success && result.companion) {
        // Win the encounter on capture
        const nextBattle: BattleState = { ...battle, status: 'PLAYER_WON', enemyHp: 0, rounds: [...battle.rounds] };
        finishBattle(nextBattle, currentTemplate, true, result.companion);
      } else {
        // Carry on fighting (enemy now angry)
        setIsRunningRound(false);
      }
    }, ROUND_DELAY_MS);
  }, [battle, currentEnemy, currentTemplate, isRunningRound, player, finishBattle]);

  const handleActivateAura = useCallback(() => {
    if (gameState.activateAura()) {
      setShowAuraEffect(true);
      setTimeout(() => setShowAuraEffect(false), 1500);
    }
  }, []);

  const handleFlee = useCallback(() => {
    if (player.auraActive) gameState.deactivateAura(15);
    setBattle(null); setCurrentEnemy(null); setCurrentTemplate(null);
    setPhase('IDLE'); setCaptureMsg(null);
  }, [player.auraActive]);

  const hpPercent = (player.hp / player.maxHp) * 100;
  const xpPercent = (player.xp / player.xpToNext) * 100;
  const enemyHpPercent = battle && currentEnemy ? (battle.enemyHp / currentEnemy.maxHp) * 100 : 100;
  const captureChancePreview = currentTemplate && battle
    ? Math.round(Math.min(95, currentTemplate.captureRate * (0.3 + (1 - battle.enemyHp / currentEnemy!.maxHp) * 1.7) * 100))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-32 min-h-screen">

      {/* Aura Flash */}
      <AnimatePresence>
        {showAuraEffect && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(175,205,197,0.3) 0%, transparent 70%)' }} />
        )}
      </AnimatePresence>

      {/* ── IDLE ── */}
      {phase === 'IDLE' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left panel */}
            <div className="lg:col-span-5 space-y-5">
              <div>
                <span className="text-gold font-headline font-bold uppercase tracking-[0.4em] text-xs">{zone.threatLevel} — {zone.name}</span>
                <h1 className="text-5xl md:text-7xl font-headline font-black text-white mt-2 leading-none">
                  ASCENSION <br /><span className="text-platinum/50">PROTOCOL</span>
                </h1>
              </div>

              <div className="space-y-3">
                <StatBar label={`HP  ${player.hp.toLocaleString()} / ${player.maxHp.toLocaleString()}`} value="" progress={hpPercent} colorClass={hpPercent > 50 ? 'bg-teal' : hpPercent > 25 ? 'bg-gold' : 'bg-red-500'} />
                <StatBar label={`XP  Level ${player.level}`} value={`${player.xp}/${player.xpToNext}`} progress={xpPercent} colorClass="bg-gradient-to-r from-teal to-gold" />
              </div>

              {/* Active Companion */}
              {activeCompanion ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-teal/5 rounded-2xl border border-teal/20">
                  <Users size={16} className="text-teal" />
                  <div className="flex-1">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-teal/60">Active Companion</div>
                    <div className="font-headline font-black text-sm text-white">{activeCompanion.nickname ?? activeCompanion.name}</div>
                  </div>
                  <div className="text-[10px] text-teal">{activeCompanion.typeBonus.description}</div>
                </div>
              ) : (
                <div className="px-4 py-3 bg-surface-container-low rounded-2xl border border-white/5 text-platinum/30 text-sm">
                  No companion — capture one in battle to gain buffs
                </div>
              )}

              <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-2xl border border-white/5">
                <Star size={16} className="text-gold" />
                <span className="font-headline font-black text-gold text-lg">{player.currency.toLocaleString()}</span>
                <span className="text-platinum/40 text-xs uppercase tracking-widest ml-1">Credits</span>
                <span className="ml-auto text-platinum/30 text-xs">{companions.length} companions</span>
              </div>

              <div className="space-y-3">
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => startBattle(false)}
                  className="w-full py-5 platinum-shimmer text-surface font-headline font-black uppercase tracking-[0.3em] rounded-full shadow-[0_20px_40px_rgba(194,199,206,0.2)] flex items-center justify-center gap-3">
                  <Swords size={20} /> Engage Enemy
                </motion.button>
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => startBattle(true)}
                  className="w-full py-4 bg-gold/10 border border-gold/30 text-gold font-headline font-black uppercase tracking-[0.2em] rounded-full flex items-center justify-center gap-3">
                  <Trophy size={18} /> Challenge Zone Boss
                </motion.button>
                <motion.button
                  whileHover={player.auraCooldown === 0 && !player.auraActive ? { scale: 1.02 } : {}}
                  onClick={handleActivateAura}
                  disabled={player.auraActive || player.auraCooldown > 0}
                  className={cn("w-full py-4 rounded-full font-headline font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all",
                    player.auraActive ? "bg-teal/20 border border-teal/50 text-teal" :
                    player.auraCooldown > 0 ? "bg-surface-container-low border border-white/5 text-platinum/30" :
                    "bg-teal/10 border border-teal/30 text-teal")}>
                  <Zap size={18} />
                  {player.auraActive ? 'Aura: Active' : player.auraCooldown > 0 ? `Aura Recharging (${player.auraCooldown}s)` : 'Activate Aura'}
                </motion.button>
              </div>
            </div>

            {/* Character visual */}
            <div className="lg:col-span-7 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal/20 to-gold/20 blur-[120px] rounded-full opacity-60 group-hover:opacity-90 transition-opacity duration-700" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="relative bg-surface-container-low aspect-[4/5] overflow-hidden border border-white/10 rounded-3xl">
                <img alt="Character" className="w-full h-full object-cover aura-glow"
                  src={player.equippedEntity?.image ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp'}
                  referrerPolicy="no-referrer" />
                <div className="absolute top-8 left-8 space-y-2">
                  <div className={cn("px-4 py-2 font-headline font-black text-[10px] rounded-full uppercase",
                    player.auraActive ? "bg-teal text-surface" : "bg-white/10 backdrop-blur-xl text-white border border-white/20")}>
                    Aura: {player.auraActive ? 'ACTIVE' : 'STANDBY'}
                  </div>
                  <div className="px-4 py-2 bg-white/10 backdrop-blur-xl text-white font-headline font-black text-[10px] rounded-full uppercase border border-white/20">
                    Level {player.level}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Zone selector */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-platinum/40 mb-4">Available Zones</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ZONES.map(z => {
                const locked = player.level < z.minLevel;
                return (
                  <button key={z.id} disabled={locked} onClick={() => gameState.update({ activeZone: z.id })}
                    className={cn("p-4 rounded-2xl border text-left transition-all",
                      player.activeZone === z.id ? "border-teal bg-teal/10" :
                      locked ? "border-white/5 bg-surface-container-low opacity-40 cursor-not-allowed" :
                      "border-white/5 bg-surface-container-low hover:border-platinum/20")}>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-gold mb-1">{z.threatLevel}</div>
                    <div className="text-sm font-headline font-black text-white">{z.name}</div>
                    {locked && <div className="text-[9px] text-red-400 mt-1">Lv.{z.minLevel} required</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── IN BATTLE ── */}
      {phase === 'IN_BATTLE' && battle && currentEnemy && currentTemplate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="text-center">
            <span className={cn("text-xs font-bold uppercase tracking-[0.4em]", isBossFight ? "text-red-400" : "text-gold")}>
              {isBossFight ? '⚠️ BOSS ENCOUNTER' : `${currentEnemy.type} ENCOUNTER`}
            </span>
          </div>

          {/* Enemy flavor */}
          <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5">
            <div className={cn("text-[9px] font-bold uppercase tracking-widest mb-1", TYPE_COLORS[currentEnemy.type] ?? 'text-platinum/40')}>
              {currentEnemy.type} · Tier {currentTemplate.tier}
            </div>
            <div className="text-lg font-headline font-black text-white">{currentEnemy.name}</div>
            <div className="text-xs text-platinum/40 mt-1 italic">"{currentTemplate.flavor}"</div>
          </div>

          {/* HP Bars */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low rounded-3xl p-4 border border-white/5 space-y-2">
              <div className="text-[9px] font-bold uppercase tracking-widest text-teal">YOUR UNIT</div>
              <div className="font-headline font-black text-white">{player.name} · Lv.{player.level}</div>
              {activeCompanion && <div className="text-[9px] text-teal/60">+ {activeCompanion.nickname ?? activeCompanion.name}</div>}
              <StatBar label="" value={`${battle.playerHp.toLocaleString()} HP`}
                progress={(battle.playerHp / player.maxHp) * 100}
                colorClass={battle.playerHp / player.maxHp > 0.5 ? 'bg-teal' : battle.playerHp / player.maxHp > 0.25 ? 'bg-gold' : 'bg-red-500'} />
              {player.auraActive && <div className="text-[9px] font-bold text-teal uppercase">⚡ AURA +50% DMG / +30% DEF</div>}
            </div>
            <div className={cn("rounded-3xl p-4 border space-y-2", isBossFight ? "bg-red-900/10 border-red-500/20" : "bg-surface-container-low border-white/5")}>
              <div className={cn("text-[9px] font-bold uppercase tracking-widest", isBossFight ? "text-red-400" : (TYPE_COLORS[currentEnemy.type] ?? 'text-platinum/40'))}>
                {isBossFight ? '🔴 BOSS' : currentEnemy.type}
              </div>
              <div className="font-headline font-black text-white">{currentEnemy.name}</div>
              {battle.enemyIsAngry && <div className="text-[9px] text-red-400 font-bold">😤 ENRAGED +10% ATK</div>}
              <StatBar label="" value={`${battle.enemyHp.toLocaleString()} HP`}
                progress={enemyHpPercent}
                colorClass={isBossFight ? 'bg-red-500' : 'bg-platinum/40'} />
            </div>
          </div>

          {/* Combat Log */}
          <div className="bg-surface-container-low rounded-2xl border border-white/5 p-4 h-44 overflow-y-auto space-y-1.5">
            <div className="text-[9px] font-bold uppercase tracking-widest text-platinum/30 mb-2">Combat Log</div>
            {battle.rounds.length === 0 && <div className="text-platinum/30 text-sm">Waiting for first action...</div>}
            {battle.rounds.map((log, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: log.turn === 'PLAYER' ? -8 : 8 }} animate={{ opacity: 1, x: 0 }}
                className={cn("text-sm", log.turn === 'PLAYER' ? "text-teal" : log.turn === 'SYSTEM' ? "text-gold" : "text-red-400", log.isCrit && "font-black")}>
                {log.message}
              </motion.div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* Attack */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              disabled={isRunningRound} onClick={handleAttack}
              className={cn("col-span-1 py-5 platinum-shimmer text-surface font-headline font-black uppercase tracking-wider rounded-full flex items-center justify-center gap-2", isRunningRound && "opacity-60")}>
              <Swords size={18} /> {isRunningRound ? '...' : 'ATTACK'}
            </motion.button>

            {/* Capture */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              disabled={isRunningRound || isBossFight} onClick={handleCapture}
              className={cn("col-span-1 py-5 rounded-full font-headline font-black uppercase tracking-wider flex flex-col items-center justify-center gap-1 border transition-all",
                isBossFight ? "bg-surface-container-low border-white/5 text-platinum/20 cursor-not-allowed" :
                "bg-purple-900/20 border-purple-500/30 text-purple-300 hover:bg-purple-900/30")}>
              <Circle size={18} />
              <span className="text-[9px]">CAPTURE {!isBossFight && `${captureChancePreview}%`}</span>
            </motion.button>

            {/* Flee */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleFlee}
              className="col-span-1 py-5 bg-white/5 border border-white/10 text-platinum/60 font-headline font-black uppercase tracking-wider rounded-full flex items-center justify-center gap-2">
              <ChevronRight size={18} /> FLEE
            </motion.button>
          </div>

          {/* In-battle aura */}
          {!player.auraActive && player.auraCooldown === 0 && (
            <button onClick={handleActivateAura}
              className="w-full py-3 bg-teal/10 border border-teal/30 text-teal font-headline font-bold uppercase tracking-widest rounded-full text-sm flex items-center justify-center gap-2">
              <Zap size={16} /> Activate Aura (+50% DMG)
            </button>
          )}
        </motion.div>
      )}

      {/* ── RESULT ── */}
      {phase === 'RESULT' && resultData && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">

          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className={cn("w-28 h-28 rounded-full flex items-center justify-center",
              resultData.captured ? "bg-purple-900/30 border-2 border-purple-500" :
              resultData.won ? "bg-teal/20 border-2 border-teal" : "bg-red-900/20 border-2 border-red-500")}>
            {resultData.captured ? <Circle size={48} className="text-purple-400" /> :
             resultData.won ? <Trophy size={48} className="text-teal" /> :
             <Skull size={48} className="text-red-400" />}
          </motion.div>

          <div className="text-center">
            <h2 className={cn("text-5xl font-headline font-black",
              resultData.captured ? "text-purple-300" : resultData.won ? "text-white" : "text-red-400")}>
              {resultData.captured ? 'CAPTURED!' : resultData.won ? 'VICTORY' : 'DEFEATED'}
            </h2>
            <p className="text-platinum/50 text-sm mt-2 uppercase tracking-widest">
              {resultData.captured ? `${resultData.capturedCompanion?.name} joins your crew` :
               resultData.won ? 'Enemy eliminated' : 'Unit compromised — retreating'}
            </p>
          </div>

          {/* Captured companion info */}
          {resultData.captured && resultData.capturedCompanion && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm bg-purple-900/20 border border-purple-500/30 rounded-2xl p-5 space-y-2">
              <div className="text-[9px] font-bold uppercase tracking-widest text-purple-400">New Companion</div>
              <div className="text-xl font-headline font-black text-white">{resultData.capturedCompanion.name}</div>
              <div className="text-xs text-platinum/50 italic">"{resultData.capturedCompanion.flavor}"</div>
              <div className="text-sm text-purple-300 font-bold">{resultData.capturedCompanion.typeBonus.description}</div>
            </motion.div>
          )}

          {/* Rewards */}
          {(resultData.won || resultData.captured) && (
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5 text-center">
                <div className="text-[9px] font-bold uppercase tracking-widest text-platinum/40 mb-1">XP</div>
                <div className="text-2xl font-headline font-black text-teal">+{resultData.xp.toLocaleString()}</div>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5 text-center">
                <div className="text-[9px] font-bold uppercase tracking-widest text-platinum/40 mb-1">Credits</div>
                <div className="text-2xl font-headline font-black text-gold">+{resultData.currency.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Loot */}
          {resultData.lootItems.length > 0 && (
            <div className="w-full max-w-sm">
              <div className="text-[9px] font-bold uppercase tracking-widest text-platinum/40 mb-2">Loot Dropped</div>
              <div className="flex flex-wrap gap-2">
                {resultData.lootItems.map(item => (
                  <div key={item.id} className="px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-full text-gold text-xs font-bold">
                    {item.name} ×{item.quantity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Level up */}
          {resultData.leveledUp && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="px-8 py-4 bg-gold/10 border border-gold/30 rounded-2xl text-center">
              <div className="text-gold font-headline font-black text-xl">⬆️ LEVEL UP!</div>
              <div className="text-gold/70 text-sm mt-1">Now Level {resultData.newLevel}</div>
            </motion.div>
          )}

          <div className="flex gap-3 w-full max-w-sm">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => startBattle(isBossFight)}
              className="flex-1 py-4 platinum-shimmer text-surface font-headline font-black uppercase tracking-wider rounded-full flex items-center justify-center gap-2">
              <RotateCcw size={18} /> Again
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setPhase('IDLE')}
              className="flex-1 py-4 bg-surface-container-low border border-white/10 text-platinum font-headline font-black uppercase tracking-wider rounded-full">
              Return
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
