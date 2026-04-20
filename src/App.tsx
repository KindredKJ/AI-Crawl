import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { CombatScreen } from './components/CombatScreen';
import { MapScreen } from './components/MapScreen';
import { HubScreen } from './components/HubScreen';
import { RegistryScreen } from './components/RegistryScreen';
import { CraftingScreen } from './components/CraftingScreen';
import { ShopScreen } from './components/ShopScreen';
import { AdDealModal } from './components/AdDealModal';
import { cloudSync } from './game/cloudSync';
import { checkPurchaseReturn, applyRewards } from './game/iap';
import { gameState } from './game/gameState';
import { AD_DEALS, ALL_PRODUCTS } from './game/shopProducts';
import { GameScreen } from './types';

declare const window: Window & {
  __base44?: { auth?: { getToken?: () => Promise<string | null> } };
};

// Show an ad deal every N battles when player meets a trigger condition
const AD_BATTLE_INTERVAL = 5;

export default function App() {
  const [activeScreen, setActiveScreen] = useState<GameScreen>('COMBAT');
  const [syncReady, setSyncReady] = useState(false);
  const [adDeal, setAdDeal] = useState<(typeof AD_DEALS)[0] | null>(null);
  const [purchaseToast, setPurchaseToast] = useState<string[] | null>(null);
  const [battlesSinceAd, setBattlesSinceAd] = useState(0);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const initSync = async () => {
      try {
        const token = await window.__base44?.auth?.getToken?.() ?? null;
        await cloudSync.init(token);
      } catch {
        await cloudSync.init(null);
      }
      setSyncReady(true);
    };
    initSync();
  }, []);

  // ── Handle Stripe return ──────────────────────────────────────────────────
  useEffect(() => {
    const { productId, success } = checkPurchaseReturn();
    if (success && productId) {
      const product = ALL_PRODUCTS.find(p => p.id === productId);
      if (product) {
        const msgs = applyRewards(product.rewards);
        setPurchaseToast(msgs);
        setTimeout(() => setPurchaseToast(null), 6000);
      }
    }
  }, []);

  // ── Ad deal trigger — fires after combat battles ──────────────────────────
  // Exported so CombatScreen can call it via window event
  useEffect(() => {
    const handleBattleEnd = (e: Event) => {
      const detail = (e as CustomEvent).detail as { won: boolean };
      const state = gameState.get();
      const nextCount = battlesSinceAd + 1;
      setBattlesSinceAd(nextCount);

      if (nextCount >= AD_BATTLE_INTERVAL) {
        // Pick contextual deal based on player state
        let deal = AD_DEALS[0];
        if (state.hp < state.maxHp * 0.35) {
          deal = AD_DEALS.find(d => d.id === 'ad_hp') ?? deal;
        } else if (state.currency < 200) {
          deal = AD_DEALS.find(d => d.id === 'ad_credits') ?? deal;
        } else if (!detail.won) {
          deal = AD_DEALS.find(d => d.id === 'ad_xp') ?? deal;
        } else {
          deal = AD_DEALS[Math.floor(Math.random() * AD_DEALS.length)];
        }
        setAdDeal(deal);
        setBattlesSinceAd(0);
      }
    };

    window.addEventListener('battleEnd', handleBattleEnd);
    return () => window.removeEventListener('battleEnd', handleBattleEnd);
  }, [battlesSinceAd]);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'COMBAT':   return <CombatScreen key="combat" />;
      case 'MAP':      return <MapScreen key="map" />;
      case 'HUB':      return <HubScreen key="hub" />;
      case 'REGISTRY': return <RegistryScreen key="registry" />;
      case 'CRAFTING': return <CraftingScreen key="crafting" />;
      case 'SHOP':     return <ShopScreen key="shop" />;
      default:         return <CombatScreen key="combat" />;
    }
  };

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      <TopNav />

      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeScreen={activeScreen} onScreenChange={setActiveScreen} />

      {/* Optional ad deal modal */}
      {adDeal && (
        <AdDealModal
          deal={adDeal}
          onClose={() => setAdDeal(null)}
          onRewardClaimed={(msgs) => {
            setAdDeal(null);
            setPurchaseToast(msgs);
            setTimeout(() => setPurchaseToast(null), 5000);
          }}
        />
      )}

      {/* Purchase success toast */}
      <AnimatePresence>
        {purchaseToast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-28 left-4 right-4 z-50 bg-teal-500/20 border border-teal-500/40 rounded-2xl p-4"
          >
            <p className="text-teal-300 font-bold text-sm mb-1">🎉 Purchase Applied!</p>
            {purchaseToast.map((m, i) => (
              <p key={i} className="text-white text-xs">✓ {m}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
