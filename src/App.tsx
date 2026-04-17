import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { CombatScreen } from './components/CombatScreen';
import { MapScreen } from './components/MapScreen';
import { HubScreen } from './components/HubScreen';
import { RegistryScreen } from './components/RegistryScreen';
import { CraftingScreen } from './components/CraftingScreen';
import { GameScreen } from './types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<GameScreen>('COMBAT');

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
            transition={{ duration: 0.3, ease: 'easeInOut' }}>
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav activeScreen={activeScreen} onScreenChange={setActiveScreen} />
    </div>
  );
}
