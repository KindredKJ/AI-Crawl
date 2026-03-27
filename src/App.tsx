import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { CombatScreen } from './components/CombatScreen';
import { MapScreen } from './components/MapScreen';
import { HubScreen } from './components/HubScreen';
import { GameScreen } from './types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<GameScreen>('COMBAT');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'COMBAT':
        return <CombatScreen key="combat" />;
      case 'MAP':
        return <MapScreen key="map" />;
      case 'HUB':
        return <HubScreen key="hub" />;
      case 'REGISTRY':
        return (
          <div key="registry" className="flex items-center justify-center h-screen">
            <h2 className="text-platinum/40 font-headline font-bold text-2xl uppercase tracking-widest">Registry Data Offline</h2>
          </div>
        );
      default:
        return <CombatScreen key="combat" />;
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
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav 
        activeScreen={activeScreen} 
        onScreenChange={setActiveScreen} 
      />
    </div>
  );
}
