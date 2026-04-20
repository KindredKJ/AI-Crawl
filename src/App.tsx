import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { CombatScreen } from './components/CombatScreen';
import { MapScreen } from './components/MapScreen';
import { HubScreen } from './components/HubScreen';
import { RegistryScreen } from './components/RegistryScreen';
import { CraftingScreen } from './components/CraftingScreen';
import { cloudSync } from './game/cloudSync';
import { GameScreen } from './types';

// Base44 SDK — available in the browser bundle via window.__base44
declare const window: Window & {
  __base44?: { auth?: { getToken?: () => Promise<string | null> } };
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<GameScreen>('COMBAT');
  const [syncReady, setSyncReady] = useState(false);

  useEffect(() => {
    // Initialize cloud sync — attempt to get auth token from Base44 SDK
    const initSync = async () => {
      try {
        // Try to get the user token from Base44 auth context
        const token = await window.__base44?.auth?.getToken?.() ?? null;
        await cloudSync.init(token);
      } catch {
        // No auth or offline — init with null (uses localStorage only)
        await cloudSync.init(null);
      }
      setSyncReady(true);
    };
    initSync();
  }, []);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'COMBAT':   return <CombatScreen key="combat" />;
      case 'MAP':      return <MapScreen key="map" />;
      case 'HUB':      return <HubScreen key="hub" />;
      case 'REGISTRY': return <RegistryScreen key="registry" />;
      case 'CRAFTING': return <CraftingScreen key="crafting" />;
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
    </div>
  );
}
