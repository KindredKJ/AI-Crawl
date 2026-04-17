import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StatBar } from './StatBar';
import { gameState } from '../game/gameState';
import { runCombatRound, calcBattleRewards, BattleState } from '../game/combatEngine';
import { getZone, getRandomEnemy, ZoneId, ZONES } from '../game/enemies';
import { PlayerState, Enemy, CombatLog } from '../types';
import { Swords, Shield, Zap, ChevronRight, RotateCcw, Trophy, Skull, Star } from 'lucide-react';
import { cn } from '../lib/utils';

const ROUND_DELAY_MS = 900;

type CombatPhase = 'IDLE' | 'SELECTING_ENEMY' | 'IN_BATTLE' | 'RESULT';

export const CombatScreen: React.FC = () => {
  const [player, setPlayer] = useState<PlayerState>(gameState.get());
  const [phase, setPhase] = useState<CombatPhase>('IDLE');
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [isBossFight, setIsBossFight] = useState(false);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [isRunningRound, setIsRunningRound] = useState(false);
  const [resultData, setResultData] = useState<{ won: boolean; xp: number; currency: number; leveledUp: boolean; newLevel: number } | null>(null);
  const [showAuraEffect, setShowAuraEffect] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = gameState.subscribe(setPlayer);
    return unsub;
  }, []);

  // Aura cooldown tick
  useEffect(() => {
    if (player.auraCooldown <= 0) return;
    const t = setInterval(() => gameState.tickAuraCooldown(), 1000);
    return () => clearInterval(t);
  }, [player.auraCooldown]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battle?.rounds.length]);

  const zone = getZone(player.activeZone as ZoneId);

  const startBattle = useCallback((boss: boolean) => {
    const enemy = boss ? { ...zone.bossEnemy, hp: zone.bossEnemy.maxHp } : getRandomEnemy(zone);
    setCurrentEnemy(enemy);
    setIsBossFight(boss);
    setBattle({
      playerHp: player.hp,
      enemyHp: enemy.hp,
      rounds: [],
      status: 'ONGOING',
    });
    setPhase('IN_BATTLE');
    setResultData(null);
  }, [player, zone]);

  const handleAttack = useCallback(() => {
    if (!battle || !currentEnemy || isRunningRound || battle.status !== 'ONGOING') return;

    setIsRunningRound(true);

    setTimeout(() => {
      setBattle(prev => {
        if (!prev || !currentEnemy) return prev;
        const next = runCombatRound(prev, player, currentEnemy, player.auraActive);

        if (next.status !== 'ONGOING') {
          const won = next.status === 'PLAYER_WON';
          const rewards = calcBattleRewards(currentEnemy, player.level, zone.xpMultiplier, zone.currencyMultiplier, won);
          const { didLevelUp, newLevel } = gameState.applyBattleResult({
            ...rewards,
            damageTaken: won ? 0 : (player.hp - next.playerHp),
            damageDealt: currentEnemy.maxHp - next.enemyHp,
          });

          if (player.auraActive) gameState.deactivateAura(30);

          setResultData({
            won,
            xp: rewards.xpGained,
            currency: rewards.currencyGained,
            leveledUp: didLevelUp,
            newLevel,
          });
          setPhase('RESULT');
        }

        return next;
      });
      setIsRunningRound(false);
    }, ROUND_DELAY_MS);
  }, [battle, currentEnemy, isRunningRound, player, zone]);

  const handleActivateAura = useCallback(() => {
    const activated = gameState.activateAura();
    if (activated) {
      setShowAuraEffect(true);
      setTimeout(() => setShowAuraEffect(false), 1500);
    }
  }, []);

  const handleFlee = useCallback(() => {
    if (player.auraActive) gameState.deactivateAura(15);
    setBattle(null);
    setCurrentEnemy(null);
    setPhase('IDLE');
  }, [player.auraActive]);

  const hpPercent = (player.hp / player.maxHp) * 100;
  const xpPercent = (player.xp / player.xpToNext) * 100;
  const enemyHpPercent = battle ? (battle.enemyHp / (currentEnemy?.maxHp ?? 1)) * 100 : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-32 min-h-screen">

      {/* Aura Flash */}
      <AnimatePresence>
        {showAuraEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(175,205,197,0.3) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      {/* IDLE / Zone Select */}
      {phase === 'IDLE' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Player Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-gold font-headline font-bold uppercase tracking-[0.4em] text-xs">
                  {zone.threatLevel} — {zone.name}
                </span>
                <h1 className="text-5xl md:text-7xl font-headline font-black text-white mt-2 leading-none">
                  ASCENSION <br /><span className="text-platinum/50">PROTOCOL</span>
                </h1>
              </div>

              <div className="space-y-3">
                <StatBar label={`HP — ${player.hp.toLocaleString()} / ${player.maxHp.toLocaleString()}`} value="" progress={hpPercent} colorClass={hpPercent > 50 ? 'bg-teal' : hpPercent > 25 ? 'bg-gold' : 'bg-red-500'} />
                <StatBar label={`XP — Level ${player.level}`} value={`${player.xp}/${player.xpToNext}`} progress={xpPercent} colorClass="bg-gradient-to-r from-teal to-gold" />
                <StatBar label={`Attack Power — ${player.equippedWeapon?.atk.toLocaleString() ?? '—'}`} value="" progress={Math.min(100, ((player.equippedWeapon?.atk ?? 0) / 5000) * 100)} colorClass="bg-platinum/40" />
              </div>

              {/* Currency */}
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-2xl border border-white/5">
                <Star size={16} className="text-gold" />
                <span className="font-headline font-black text-gold text-lg">{player.currency.toLocaleString()}</span>
                <span className="text-platinum/40 text-xs uppercase tracking-widest ml-1">Credits</span>
              </div>

              {/* Battle Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startBattle(false)}
                  className="w-full py-5 platinum-shimmer text-surface font-headline font-black uppercase tracking-[0.3em] rounded-full shadow-[0_20px_40px_rgba(194,199,206,0.2)] flex items-center justify-center gap-3"
                >
                  <Swords size={20} />
                  Engage Enemy
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startBattle(true)}
                  className="w-full py-4 bg-gold/10 border border-gold/30 text-gold font-headline font-black uppercase tracking-[0.2em] rounded-full flex items-center justify-center gap-3"
                >
                  <Trophy size={18} />
                  Challenge Zone Boss
                </motion.button>

                {/* Aura Button */}
                <motion.button
                  whileHover={player.auraCooldown === 0 ? { scale: 1.02 } : {}}
                  whileTap={player.auraCooldown === 0 ? { scale: 0.98 } : {}}
                  onClick={handleActivateAura}
                  disabled={player.auraActive || player.auraCooldown > 0}
                  className={cn(
                    "w-full py-4 rounded-full font-headline font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all",
                    player.auraActive
                      ? "bg-teal/20 border border-teal/50 text-teal"
                      : player.auraCooldown > 0
                        ? "bg-surface-container-low border border-white/5 text-platinum/30"
                        : "bg-teal/10 border border-teal/30 text-teal"
                  )}
                >
                  <Zap size={18} />
                  {player.auraActive ? 'Aura: Active' : player.auraCooldown > 0 ? `Aura Recharging (${player.auraCooldown}s)` : 'Activate Aura'}
                </motion.button>
              </div>
            </div>

            {/* Character Visual */}
            <div className="lg:col-span-7 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal/20 to-gold/20 blur-[120px] rounded-full opacity-60 group-hover:opacity-90 transition-opacity duration-700" />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-surface-container-low aspect-[4/5] overflow-hidden border border-white/10 rounded-3xl"
              >
                <img
                  alt="Character"
                  className="w-full h-full object-cover aura-glow"
                  src={player.equippedEntity?.image ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp'}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-8 left-8 space-y-2">
                  <div className={cn(
                    "px-4 py-2 font-headline font-black text-[10px] rounded-full uppercase shadow-lg",
                    player.auraActive ? "bg-teal text-surface shadow-teal/20" : "bg-white/10 backdrop-blur-xl text-white border border-white/20"
                  )}>
                    Aura: {player.auraActive ? 'ACTIVE' : 'STANDBY'}
                  </div>
                  <div className="px-4 py-2 bg-white/10 backdrop-blur-xl text-white font-headline font-black text-[10px] rounded-full uppercase border border-white/20">
                    Level {player.level}
                  </div>
                </div>

                {/* Equipped Weapon Badge */}
                {player.equippedWeapon && (
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="glass-panel rounded-xl px-4 py-3 border border-white/10 flex items-center gap-3">
                      <img src={player.equippedWeapon.image} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <div className="text-[9px] font-bold uppercase text-platinum/50 tracking-widest">{player.equippedWeapon.rarity}</div>
                        <div className="text-sm font-headline font-black text-white">{player.equippedWeapon.name}</div>
                      </div>
                    </div>
                  </div>
                )}
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
                  <button
                    key={z.id}
                    disabled={locked}
                    onClick={() => gameState.update({ activeZone: z.id })}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all",
                      player.activeZone === z.id
                        ? "border-teal bg-teal/10"
                        : locked
                          ? "border-white/5 bg-surface-container-low opacity-40 cursor-not-allowed"
                          : "border-white/5 bg-surface-container-low hover:border-platinum/20"
                    )}
                  >
                    <div className="text-[9px] font-bold uppercase tracking-widest text-gold mb-1">{z.threatLevel}</div>
                    <div className="text-sm font-headline font-black text-white">{z.name}</div>
                    {locked && <div className="text-[9px] text-red-400 mt-1">Requires Level {z.minLevel}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* IN BATTLE */}
      {phase === 'IN_BATTLE' && battle && currentEnemy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* VS Header */}
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-gold">
              {isBossFight ? '⚠️ BOSS ENCOUNTER' : 'Combat Initiated'}
            </span>
            {isBossFight && (
              <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1">Extreme Threat Detected</div>
            )}
          </div>

          {/* Combat Arena */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player */}
            <div className="bg-surface-container-low rounded-3xl p-5 border border-white/5 space-y-3">
              <div className="text-[9px] font-bold uppercase tracking-widest text-teal">YOUR UNIT</div>
              <div className="text-xl font-headline font-black text-white">{player.name}</div>
              <div className="text-sm font-bold text-platinum/60">Lv.{player.level}</div>
              <StatBar label="HP" value={`${battle.playerHp.toLocaleString()}`} progress={(battle.playerHp / player.maxHp) * 100} colorClass={battle.playerHp / player.maxHp > 0.5 ? 'bg-teal' : battle.playerHp / player.maxHp > 0.25 ? 'bg-gold' : 'bg-red-500'} />
              {player.auraActive && (
                <div className="text-[9px] font-bold text-teal uppercase tracking-widest">⚡ AURA ACTIVE — +50% DMG / +30% DEF</div>
              )}
            </div>

            {/* Enemy */}
            <div className={cn(
              "rounded-3xl p-5 border space-y-3",
              isBossFight ? "bg-red-900/10 border-red-500/20" : "bg-surface-container-low border-white/5"
            )}>
              <div className={cn("text-[9px] font-bold uppercase tracking-widest", isBossFight ? "text-red-400" : "text-platinum/40")}>
                {isBossFight ? '🔴 BOSS' : currentEnemy.type}
              </div>
              <div className="text-xl font-headline font-black text-white">{currentEnemy.name}</div>
              <div className="text-[10px] text-platinum/40">ATK: {currentEnemy.atk.toLocaleString()} | DEF: {currentEnemy.def}</div>
              <StatBar label="HP" value={`${battle.enemyHp.toLocaleString()}`} progress={enemyHpPercent} colorClass={isBossFight ? 'bg-red-500' : 'bg-platinum/40'} />
            </div>
          </div>

          {/* Combat Log */}
          <div className="bg-surface-container-low rounded-2xl border border-white/5 p-4 h-48 overflow-y-auto space-y-2">
            <div className="text-[9px] font-bold uppercase tracking-widest text-platinum/30 mb-3">Combat Log</div>
            {battle.rounds.length === 0 && (
              <div className="text-platinum/30 text-sm">Waiting for first strike...</div>
            )}
            {battle.rounds.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: log.turn === 'PLAYER' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "text-sm font-medium",
                  log.turn === 'PLAYER' ? "text-teal" : "text-red-400",
                  log.isCrit && "font-black"
                )}
              >
                {log.message}
              </motion.div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={isRunningRound}
              onClick={handleAttack}
              className={cn(
                "col-span-2 py-5 platinum-shimmer text-surface font-headline font-black uppercase tracking-[0.2em] rounded-full flex items-center justify-center gap-3",
                isRunningRound && "opacity-60"
              )}
            >
              <Swords size={20} />
              {isRunningRound ? 'Executing...' : 'ATTACK'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleFlee}
              className="py-5 bg-white/5 border border-white/10 text-platinum/60 font-headline font-black uppercase tracking-wider rounded-full flex items-center justify-center gap-2"
            >
              <ChevronRight size={18} />
              Flee
            </motion.button>
          </div>

          {/* In-battle Aura */}
          {!player.auraActive && player.auraCooldown === 0 && (
            <button
              onClick={handleActivateAura}
              className="w-full py-3 bg-teal/10 border border-teal/30 text-teal font-headline font-bold uppercase tracking-widest rounded-full text-sm flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              Activate Aura (+50% DMG)
            </button>
          )}
        </motion.div>
      )}

      {/* RESULT */}
      {phase === 'RESULT' && resultData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
        >
          {/* Win / Loss Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className={cn(
              "w-28 h-28 rounded-full flex items-center justify-center",
              resultData.won ? "bg-teal/20 border-2 border-teal" : "bg-red-900/20 border-2 border-red-500"
            )}
          >
            {resultData.won
              ? <Trophy size={48} className="text-teal" />
              : <Skull size={48} className="text-red-400" />}
          </motion.div>

          <div className="text-center">
            <h2 className={cn(
              "text-5xl font-headline font-black",
              resultData.won ? "text-white" : "text-red-400"
            )}>
              {resultData.won ? 'VICTORY' : 'DEFEATED'}
            </h2>
            <p className="text-platinum/50 text-sm mt-2 uppercase tracking-widest">
              {resultData.won ? 'Enemy eliminated' : 'Unit compromised — retreating'}
            </p>
          </div>

          {/* Rewards */}
          {resultData.won && (
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5 text-center">
                <div className="text-[9px] font-bold uppercase tracking-widest text-platinum/40 mb-1">XP Gained</div>
                <div className="text-2xl font-headline font-black text-teal">+{resultData.xp.toLocaleString()}</div>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5 text-center">
                <div className="text-[9px] font-bold uppercase tracking-widest text-platinum/40 mb-1">Credits</div>
                <div className="text-2xl font-headline font-black text-gold">+{resultData.currency.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Level Up */}
          {resultData.leveledUp && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-8 py-4 bg-gold/10 border border-gold/30 rounded-2xl text-center"
            >
              <div className="text-gold font-headline font-black text-xl">⬆️ LEVEL UP!</div>
              <div className="text-gold/70 text-sm mt-1">Now Level {resultData.newLevel}</div>
            </motion.div>
          )}

          <div className="flex gap-4 w-full max-w-sm">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startBattle(isBossFight)}
              className="flex-1 py-4 platinum-shimmer text-surface font-headline font-black uppercase tracking-wider rounded-full flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPhase('IDLE')}
              className="flex-1 py-4 bg-surface-container-low border border-white/10 text-platinum font-headline font-black uppercase tracking-wider rounded-full"
            >
              Return
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
