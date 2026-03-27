import React from 'react';
import { Settings } from 'lucide-react';

export const TopNav: React.FC = () => {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-[#131313]/80 backdrop-blur-xl rounded-b-[3rem] shadow-[0_8px_32px_rgba(229,226,225,0.05)]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden outline outline-2 outline-platinum/20">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0jp0yOXhuGhYT4Dl-8_Ygl5AreV_er8GVESNxqRcxvKEt4_Xat05oC3CPx9CsQUSQiShPfFmxeYKgqnpOhHGaCfBUDT6cM_Q2bjO2AeeJL6NOBQfsP3UPjaLMtwu5bMlG7fY9mgZ5wGMcRQOO7X4axqD91JBZoEOeGFxKlK2SW1dqJK8rjTRyP5kVNB3vNpQZRj8a469k7TOEkOo0223P3Wq9Emsx2qZ8qkcjW1wFfx-m0PwP8Qo5o3G1OxBQziD8R-ERH41iBrqH" 
            alt="Profile"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-platinum/60 font-headline">Sector Alpha-9</span>
          <h1 className="text-xl font-extrabold text-platinum tracking-tighter font-headline">NEO-AEON</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-surface-container/50 px-4 py-1.5 rounded-full border border-white/5">
          <span className="text-platinum font-headline font-bold text-xs">LVL 99</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high text-platinum hover:bg-surface-container-highest transition-all duration-300">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};
