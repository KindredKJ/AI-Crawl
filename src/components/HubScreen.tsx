import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { WEAPONS, ENTITIES } from '../constants';
import { Weapon, Entity } from '../types';
import { Plus, Filter, SortAsc, Info, X, ArrowRightLeft, Shield, Zap, Target } from 'lucide-react';
import { StatBar } from './StatBar';
import { cn } from '../lib/utils';

interface EquippedState {
  primary: Weapon | null;
  secondary: Weapon | null;
  tactical: Entity | null;
}

export const HubScreen: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<(Weapon | Entity)[]>([]);
  const [equipped, setEquipped] = useState<EquippedState>({
    primary: null,
    secondary: null,
    tactical: null,
  });
  const [loadoutName, setLoadoutName] = useState('Loadout 1');
  const [activeDragItem, setActiveDragItem] = useState<Weapon | Entity | null>(null);

  const toggleSelection = (item: Weapon | Entity) => {
    setSelectedItems(prev => {
      const isAlreadySelected = prev.find(i => i.id === item.id);
      if (isAlreadySelected) {
        return prev.filter(i => i.id !== item.id);
      }
      if (prev.length >= 2) {
        return [prev[1], item];
      }
      return [...prev, item];
    });
  };

  const equipItem = (item: Weapon | Entity, slot?: keyof EquippedState) => {
    const isWeapon = 'atk' in item;
    if (isWeapon) {
      if (slot === 'primary' || slot === 'secondary') {
        setEquipped(prev => ({ ...prev, [slot]: item as Weapon }));
      } else {
        // Auto-fill first empty weapon slot
        if (!equipped.primary) {
          setEquipped(prev => ({ ...prev, primary: item as Weapon }));
        } else {
          setEquipped(prev => ({ ...prev, secondary: item as Weapon }));
        }
      }
    } else {
      setEquipped(prev => ({ ...prev, tactical: item as Entity }));
    }
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    const item = [...WEAPONS, ...ENTITIES].find(i => i.id === active.id);
    if (item) setActiveDragItem(item);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (over && over.id) {
      const item = [...WEAPONS, ...ENTITIES].find(i => i.id === active.id);
      if (!item) return;

      const slotId = over.id as keyof EquippedState;
      equipItem(item, slotId);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar: Stats & Loadout */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="flex flex-col gap-4">
              <h2 className="font-headline text-5xl font-extrabold tracking-tighter text-white">HUB</h2>
              <div className="p-1.5 glass-panel rounded-2xl flex gap-1">
                <button className="flex-1 py-3 px-4 rounded-xl bg-platinum text-surface font-black text-xs tracking-[0.15em] font-headline">CHARACTER</button>
                <button className="flex-1 py-3 px-4 rounded-xl text-platinum/40 font-black text-xs tracking-[0.15em] font-headline hover:text-platinum transition-colors">COMPANIONS</button>
              </div>
            </div>

            {/* Loadout Slots */}
            <div className="p-6 glass-panel rounded-[2rem] space-y-6">
              <div className="space-y-1">
                <span className="text-[8px] font-bold tracking-[0.2em] text-platinum/30 uppercase">Current Configuration</span>
                <div className="flex items-center justify-between">
                  <input 
                    type="text"
                    value={loadoutName}
                    onChange={(e) => setLoadoutName(e.target.value)}
                    className="bg-transparent border-none text-xl font-headline font-black text-platinum uppercase tracking-tight focus:outline-none w-full placeholder:text-platinum/20"
                    placeholder="LOADOUT NAME"
                  />
                  <div className="w-2 h-2 rounded-full bg-teal animate-pulse shrink-0 ml-2" />
                </div>
              </div>
              
              <div className="space-y-4">
                <EquipmentSlot 
                  id="primary" 
                  label="Primary Weapon" 
                  item={equipped.primary} 
                  icon={<Zap size={14} />}
                  onRemove={() => setEquipped(prev => ({ ...prev, primary: null }))}
                />
                <EquipmentSlot 
                  id="secondary" 
                  label="Secondary Weapon" 
                  item={equipped.secondary} 
                  icon={<Target size={14} />}
                  onRemove={() => setEquipped(prev => ({ ...prev, secondary: null }))}
                />
                <EquipmentSlot 
                  id="tactical" 
                  label="Tactical Entity" 
                  item={equipped.tactical} 
                  icon={<Shield size={14} />}
                  onRemove={() => setEquipped(prev => ({ ...prev, tactical: null }))}
                />
              </div>
            </div>

            <div className="p-8 glass-panel rounded-[2.5rem] space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-[0.2em] text-platinum/40">COMBAT POWER</span>
                <span className="text-3xl font-headline font-black text-platinum">12,480</span>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold tracking-wider">
                    <span className="text-platinum/50 uppercase">Resilience</span>
                    <span className="text-platinum">842</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-platinum"></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold tracking-wider">
                    <span className="text-platinum/50 uppercase">Aether Flow</span>
                    <span className="text-teal">2,100</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-3/5 bg-teal"></div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Arsenal Area */}
          <main className="lg:col-span-9">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-headline font-bold tracking-tighter">Tactical Arsenal</h2>
                <p className="text-platinum/60 mt-2 max-w-md">Drag gear to slots in your loadout to equip them for the next mission.</p>
              </div>
              <div className="flex gap-4">
                <button className="p-4 rounded-full bg-surface-container hover:bg-surface-container-highest transition-colors">
                  <Filter size={20} className="text-platinum" />
                </button>
                <button className="p-4 rounded-full bg-surface-container hover:bg-surface-container-highest transition-colors">
                  <SortAsc size={20} className="text-platinum" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {WEAPONS.map((weapon) => (
                <GearCard 
                  key={weapon.id} 
                  item={weapon} 
                  isSelected={selectedItems.some(i => i.id === weapon.id)}
                  onSelect={() => toggleSelection(weapon)}
                  onEquip={() => equipItem(weapon)}
                  isEquipped={equipped.primary?.id === weapon.id || equipped.secondary?.id === weapon.id}
                />
              ))}
              {ENTITIES.map((entity) => (
                <GearCard 
                  key={entity.id} 
                  item={entity} 
                  isSelected={selectedItems.some(i => i.id === entity.id)}
                  onSelect={() => toggleSelection(entity)}
                  onEquip={() => equipItem(entity)}
                  isEquipped={equipped.tactical?.id === entity.id}
                />
              ))}
              
              {/* Empty Slot */}
              <div className="bg-surface-container-lowest rounded-xl p-6 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                  <Plus size={32} className="text-platinum/40" />
                </div>
                <span className="font-headline font-bold text-sm uppercase tracking-widest text-platinum/40">Empty Slot</span>
              </div>
            </div>
          </main>
        </div>

        {/* Comparison Overlay */}
        <AnimatePresence>
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-4xl px-6"
            >
              <div className="glass-panel rounded-[2rem] p-6 border border-platinum/20 shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-platinum/10 rounded-lg">
                      <ArrowRightLeft size={18} className="text-platinum" />
                    </div>
                    <h3 className="font-headline font-black text-xl uppercase tracking-wider">Tactical Comparison</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedItems([])}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={20} className="text-platinum/60" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8 relative">
                  {/* Center Divider */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 -translate-x-1/2 hidden md:block" />
                  
                  {selectedItems.map((item, idx) => (
                    <div key={item.id} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h4 className="font-headline font-bold text-lg text-white">{item.name}</h4>
                          <span className="text-[10px] font-bold text-platinum/40 uppercase tracking-widest">
                            {'atk' in item ? (item as Weapon).rarity : (item as Entity).type}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[8px] font-bold text-platinum/40 uppercase tracking-widest block mb-1">
                            {'atk' in item ? 'Attack' : 'Defense'}
                          </span>
                          <span className={cn(
                            "text-xl font-black font-headline",
                            'atk' in item ? "text-gold" : "text-teal"
                          )}>
                            {'atk' in item ? (item as Weapon).atk : (item as Entity).def}
                          </span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[8px] font-bold text-platinum/40 uppercase tracking-widest block mb-1">
                            {'atk' in item ? 'Range' : 'Radius'}
                          </span>
                          <span className="text-xl font-black font-headline text-platinum">
                            {'atk' in item ? (item as Weapon).detailedStats.range : (item as Entity).detailedStats.radius}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedItems.length === 1 && (
                    <div className="flex flex-col items-center justify-center text-center border-2 border-dashed border-white/10 rounded-2xl p-8 opacity-40">
                      <Plus size={32} className="text-platinum/20 mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Select another item to compare</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeDragItem ? (
            <div className="w-80 scale-95 opacity-90 pointer-events-none">
              <GearCard item={activeDragItem} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

const EquipmentSlot: React.FC<{ 
  id: string; 
  label: string; 
  item: Weapon | Entity | null;
  icon: React.ReactNode;
  onRemove: () => void;
}> = ({ id, label, item, icon, onRemove }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "relative rounded-2xl p-3 border-2 transition-all duration-300 group",
        isOver ? "border-teal bg-teal/10 scale-[1.02]" : "border-white/5 bg-white/5",
        item ? "border-platinum/20" : "border-dashed"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center border transition-colors",
          item ? "bg-surface-container-high border-white/10" : "bg-white/5 border-white/5"
        )}>
          {item ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
          ) : (
            <div className="text-platinum/20">{icon}</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[8px] font-bold text-platinum/40 uppercase tracking-widest block mb-0.5">{label}</span>
          <span className={cn(
            "text-xs font-headline font-black truncate block",
            item ? "text-white" : "text-platinum/20 italic"
          )}>
            {item ? item.name : 'Empty Slot'}
          </span>
        </div>
        {item && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 hover:bg-white/10 rounded-full text-platinum/40 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

const GearCard: React.FC<{ 
  item: Weapon | Entity; 
  isSelected?: boolean;
  onSelect?: () => void;
  onEquip?: () => void;
  isEquipped?: boolean;
  isOverlay?: boolean;
}> = ({ item, isSelected, onSelect, onEquip, isEquipped, isOverlay }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isWeapon = 'atk' in item;
  const rarity = isWeapon ? (item as Weapon).rarity : (item as Entity).type;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    disabled: isOverlay,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;
  
  const getRarityColor = (r: string) => {
    switch (r) {
      case 'Legendary': return 'text-gold border-gold/30 bg-gold/5';
      case 'Epic': return 'text-teal border-teal/30 bg-teal/5';
      case 'Rare': return 'text-blue-400 border-blue-400/30 bg-blue-400/5';
      case 'Defense': return 'text-teal border-teal/30 bg-teal/5';
      case 'Attack': return 'text-gold border-gold/30 bg-gold/5';
      case 'Support': return 'text-platinum border-platinum/30 bg-platinum/5';
      default: return 'text-platinum border-platinum/30 bg-platinum/5';
    }
  };

  return (
    <motion.div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      whileHover={{ y: isDragging ? 0 : -8 }}
      className={cn(
        "bg-surface-container-low rounded-2xl p-5 group transition-all duration-500 border hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative cursor-grab active:cursor-grabbing",
        isSelected ? "border-platinum shadow-[0_0_20px_rgba(228,227,224,0.2)]" : "border-white/5 hover:border-platinum/20",
        isDragging && "opacity-0",
        isEquipped && "ring-2 ring-teal ring-offset-4 ring-offset-surface"
      )}
    >
      <AnimatePresence>
        {isHovered && !isSelected && !isDragging && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute -top-32 left-0 right-0 z-50 p-4 glass-panel rounded-2xl border border-platinum/20 shadow-2xl pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
              <Info size={14} className="text-platinum/60" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-platinum">Detailed Specs</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {isWeapon ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-platinum/40 uppercase tracking-widest block">Range</span>
                    <span className="text-xs font-headline font-black text-platinum">{(item as Weapon).detailedStats.range}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-platinum/40 uppercase tracking-widest block">Fire Rate</span>
                    <span className="text-xs font-headline font-black text-platinum">{(item as Weapon).detailedStats.fireRate}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-platinum/40 uppercase tracking-widest block">Weight</span>
                    <span className="text-xs font-headline font-black text-platinum">{(item as Weapon).detailedStats.weight}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-platinum/40 uppercase tracking-widest block">Radius</span>
                    <span className="text-xs font-headline font-black text-platinum">{(item as Entity).detailedStats.radius}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-platinum/40 uppercase tracking-widest block">Recharge</span>
                    <span className="text-xs font-headline font-black text-platinum">{(item as Entity).detailedStats.recharge}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-platinum/40 uppercase tracking-widest block">Duration</span>
                    <span className="text-xs font-headline font-black text-platinum">{(item as Entity).detailedStats.duration}</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isEquipped && (
        <div className="absolute top-4 left-4 z-30 bg-teal text-surface text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
          Equipped
        </div>
      )}
      {/* Image Container */}
      <div className="relative w-full aspect-square rounded-xl mb-5 overflow-hidden bg-surface-container-lowest border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent z-10 opacity-60" />
        <img 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
          src={item.image} 
          referrerPolicy="no-referrer"
        />
        
        {/* Rarity/Type Badge */}
        <div className={cn(
          "absolute top-3 right-3 z-20 backdrop-blur-md px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.15em] border",
          getRarityColor(rarity)
        )}>
          {rarity}
        </div>

        {/* Tech Overlay */}
        <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            <span className="text-[8px] font-bold text-teal/80 uppercase tracking-widest">System Online</span>
          </div>
          <span className="text-[8px] font-mono text-platinum/30 uppercase">SN: {item.id.toUpperCase()}-00{Math.floor(Math.random() * 9)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <h3 className="font-headline font-black text-xl text-white tracking-tight group-hover:text-platinum transition-colors">{item.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-bold text-platinum/40 uppercase tracking-widest">{isWeapon ? 'Weapon Class' : 'Entity Type'}</span>
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[9px] font-bold text-platinum/60 uppercase tracking-widest">{isWeapon ? 'Offensive' : 'Tactical'}</span>
          </div>
        </div>

        <p className="text-platinum/50 text-xs leading-relaxed font-medium line-clamp-3 min-h-[3rem]">
          {item.description}
        </p>

        {/* Stats Section */}
        <div className="bg-surface-container-lowest/50 rounded-xl p-3 border border-white/5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-platinum/40 uppercase tracking-widest mb-1">{isWeapon ? 'Output Power' : 'Defense Rating'}</span>
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  "text-lg font-black font-headline tracking-tighter",
                  isWeapon ? "text-gold" : "text-teal"
                )}>
                  {isWeapon ? (item as Weapon).atk : (item as Entity).def}
                </span>
                <span className="text-[10px] font-bold text-platinum/30 uppercase">Units</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center border border-white/5">
              {isWeapon ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gold/20 blur-md rounded-full" />
                  <span className="material-symbols-outlined text-gold text-xl relative z-10">bolt</span>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-teal/20 blur-md rounded-full" />
                  <span className="material-symbols-outlined text-teal text-xl relative z-10">shield</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Visual Stat Breakdown */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[7px] font-bold uppercase tracking-widest text-platinum/20">
              <span>Min</span>
              <span>Optimal Range</span>
              <span>Max</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 12 }).map((_, i) => {
                const statValue = isWeapon ? (item as Weapon).atk : (item as Entity).def;
                const maxStat = isWeapon ? 4000 : 2000;
                const percentage = (statValue / maxStat) * 12;
                const isActive = i < percentage;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "h-1.5 flex-1 rounded-sm transition-all duration-500",
                      isActive 
                        ? (isWeapon ? "bg-gold shadow-[0_0_8px_rgba(233,195,73,0.4)]" : "bg-teal shadow-[0_0_8px_rgba(175,205,197,0.4)]") 
                        : "bg-white/5"
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onEquip?.(); }}
          className={cn(
            "w-full py-3.5 font-headline font-black text-[10px] rounded-xl uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.98] shadow-lg shadow-black/20",
            isEquipped 
              ? "bg-teal text-surface hover:bg-teal/80" 
              : "bg-surface-container-highest text-platinum hover:bg-platinum hover:text-surface"
          )}
        >
          {isEquipped ? 'Equipped' : (isWeapon ? 'Equip Arsenal' : 'Deploy Unit')}
        </button>
      </div>
    </motion.div>
  );
};
