import React from 'react';
import { motion } from 'motion/react';
import { GameScreen } from '../types';
import { Home, Map as MapIcon, Sword, BookOpen, Hammer, ShoppingBag, Gem, ScrollText, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeScreen: GameScreen;
  onScreenChange: (screen: GameScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onScreenChange }) => {
  const navItems = [
    { id: 'HUB',      icon: Home,        label: 'Hub' },
    { id: 'MAP',      icon: MapIcon,     label: 'Map' },
    { id: 'COMBAT',   icon: Sword,       label: 'Combat' },
    { id: 'CRAFTING', icon: Hammer,      label: 'Craft' },
    { id: 'SHOP',     icon: ShoppingBag, label: 'Store' },
    { id: 'KINFT',    icon: Gem,        label: 'KINFT' },
    { id: 'CAMPAIGN', icon: ScrollText, label: 'Story' },
    { id: 'KINNULL', icon: Cpu, label: 'Kinnull' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center gap-1 px-3 pb-6 pt-3 bg-[#131313]/90 backdrop-blur-2xl rounded-t-[3rem] shadow-[0_-8px_32px_rgba(229,226,225,0.05)] overflow-x-auto">
      {navItems.map((item) => {
        const isActive = activeScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onScreenChange(item.id as GameScreen)}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-300 px-3 py-2 relative",
              isActive
                ? "bg-gradient-to-br from-platinum to-[#15191e] text-[#131313] rounded-full scale-110 shadow-[0_0_15px_rgba(194,199,206,0.3)]"
                : "text-platinum/50 hover:text-platinum"
            )}
          >
            <item.icon size={22} className={cn("mb-1", isActive && "fill-current")} />
            <span className="font-headline text-[9px] font-bold tracking-widest uppercase">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
