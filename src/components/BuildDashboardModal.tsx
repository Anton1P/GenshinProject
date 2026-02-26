import React from 'react';
import { X, Sword, Shield, Zap, Heart, Crosshair, TrendingUp, Activity } from 'lucide-react';
import { Character, WeaponData, EquipStat } from '../types';

interface BuildDashboardModalProps {
  character: Character | null;
  onClose: () => void;
}

// Helper to format stats
const formatStatValue = (type: string, value: number) => {
  if (
    type.includes('PERCENT') || 
    type.includes('CRITICAL') || 
    type.includes('EFFICIENCY') || 
    type.includes('ADD_HURT') ||
    type === 'FIGHT_PROP_HEAL_ADD'
  ) {
    return `${value.toFixed(1)}%`;
  }
  return Math.round(value).toLocaleString();
};

const getStatName = (type: string) => {
  const map: Record<string, string> = {
    'FIGHT_PROP_HP': 'PV',
    'FIGHT_PROP_HP_PERCENT': 'PV',
    'FIGHT_PROP_ATTACK': 'ATQ',
    'FIGHT_PROP_ATTACK_PERCENT': 'ATQ',
    'FIGHT_PROP_DEFENSE': 'DÉF',
    'FIGHT_PROP_DEFENSE_PERCENT': 'DÉF',
    'FIGHT_PROP_CRITICAL': 'Taux CRIT',
    'FIGHT_PROP_CRITICAL_HURT': 'DGT CRIT',
    'FIGHT_PROP_CHARGE_EFFICIENCY': 'Recharge',
    'FIGHT_PROP_ELEMENT_MASTERY': 'Maîtrise',
    'FIGHT_PROP_HEAL_ADD': 'Bonus Soin',
    'FIGHT_PROP_PHYSICAL_ADD_HURT': 'Bonus Phys.',
    'FIGHT_PROP_FIRE_ADD_HURT': 'Bonus Pyro',
    'FIGHT_PROP_ELEC_ADD_HURT': 'Bonus Electro',
    'FIGHT_PROP_WATER_ADD_HURT': 'Bonus Hydro',
    'FIGHT_PROP_GRASS_ADD_HURT': 'Bonus Dendro',
    'FIGHT_PROP_WIND_ADD_HURT': 'Bonus Anemo',
    'FIGHT_PROP_ROCK_ADD_HURT': 'Bonus Geo',
    'FIGHT_PROP_ICE_ADD_HURT': 'Bonus Cryo',
  };
  return map[type] || type;
};

const getStatIcon = (type: string) => {
  if (type.includes('HP')) return <Heart className="w-4 h-4 text-rose-400" />;
  if (type.includes('ATTACK')) return <Sword className="w-4 h-4 text-amber-400" />;
  if (type.includes('DEFENSE')) return <Shield className="w-4 h-4 text-slate-400" />;
  if (type.includes('CRITICAL_HURT')) return <Crosshair className="w-4 h-4 text-fuchsia-400" />;
  if (type.includes('CRITICAL')) return <Activity className="w-4 h-4 text-fuchsia-400" />;
  if (type.includes('CHARGE')) return <Zap className="w-4 h-4 text-yellow-400" />;
  if (type.includes('MASTERY')) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  return <div className="w-4 h-4 rounded-full bg-slate-600" />;
};

export const BuildDashboardModal: React.FC<BuildDashboardModalProps> = ({ character, onClose }) => {
  if (!character) return null;

  // Cast to any to access stats from DetailedCharacter merge
  const detailedChar = character as any;
  const stats = detailedChar.stats || {};
  const weapon = character.weapon;

  // Construct Splash Art URL (using Enka logic if avatarId is available)
  // Note: Enka uses specific naming conventions. If we have avatarId, we can try to guess.
  // Standard format: UI_Gacha_AvatarImg_PlayerBoy.png etc.
  // For simplicity, we'll use the icon but try to find a better image source if possible or just scale the icon.
  // Actually, Enka API usually provides 'costumeId' or we can derive from avatarId.
  // Since we don't have a reliable map for Gacha images here without a huge dictionary, 
  // we will use the icon but styled as a "card" or see if we can use a placeholder.
  // BETTER: Use the icon but large and blurred background?
  // OR: Just use the icon in a nice frame.
  // The user suggested: "UI_Gacha_AvatarImg..." if possible.
  // Let's try to construct it if we have the ID, but it requires a map name.
  // We'll stick to a high-quality display of the icon for now to be safe, or use a known pattern if we had the map name.
  
  // Let's assume we just use the icon for now but make it look good.
  
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
      <div className="bg-slate-950 rounded-2xl w-full max-w-6xl h-[90vh] border border-slate-800 relative overflow-hidden flex flex-col shadow-2xl">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-slate-800 rounded-full text-white transition-colors border border-white/10 backdrop-blur-md"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            
            {/* LEFT COLUMN: Character Identity */}
            <div className="col-span-1 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group">
              {/* Background Image Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 to-slate-950 z-0" />
              <img 
                src={character.icon} 
                alt={character.name} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                <div className="mb-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-black/50 border border-white/10 backdrop-blur-md text-${character.element.toLowerCase()}`}>
                    {character.element}
                  </span>
                </div>
                <h2 className="text-5xl font-black text-white mb-2 tracking-tight leading-none">
                  {character.name}
                </h2>
                <div className="flex items-center gap-3 text-slate-400 font-mono text-sm">
                  <span>Niv. 90</span> {/* Placeholder or extract if available */}
                  <span>•</span>
                  <span>Amitié 10</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Stats & Equipment */}
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
              
              {/* WEAPON CARD */}
              {weapon && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex items-center gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sword className="w-32 h-32" />
                  </div>
                  
                  <div className="relative z-10 w-24 h-24 shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 flex items-center justify-center shadow-lg">
                    <img src={weapon.icon} alt="Weapon" className="w-20 h-20 object-contain" />
                  </div>
                  
                  <div className="relative z-10 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {/* Name hash is usually a number, we might not have the string name here without a map */}
                          {typeof weapon.nameHash === 'string' ? weapon.nameHash : "Arme"}
                        </h3>
                        <p className="text-slate-400 text-sm">Niv. {weapon.level}</p>
                      </div>
                      <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500 text-xs font-bold">
                        R5 {/* Refinement placeholder */}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {weapon.mainStat && (
                        <div className="bg-slate-950/50 rounded px-3 py-2 border border-slate-800">
                          <p className="text-xs text-slate-500 uppercase">{getStatName(weapon.mainStat.type)}</p>
                          <p className="text-lg font-mono font-bold text-white">
                            {formatStatValue(weapon.mainStat.type, weapon.mainStat.value)}
                          </p>
                        </div>
                      )}
                      {weapon.subStats && weapon.subStats.length > 0 && (
                         <div className="bg-slate-950/50 rounded px-3 py-2 border border-slate-800">
                           <p className="text-xs text-slate-500 uppercase">{getStatName(weapon.subStats[0].type)}</p>
                           <p className="text-lg font-mono font-bold text-white">
                             {formatStatValue(weapon.subStats[0].type, weapon.subStats[0].value)}
                           </p>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* GLOBAL STATS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Custom Stat Card Helper */}
                {Object.entries(stats).map(([key, value]) => {
                  // Map simple keys to Enka prop types for formatting
                  const typeMap: Record<string, string> = {
                    hp: 'FIGHT_PROP_HP',
                    atk: 'FIGHT_PROP_ATTACK',
                    def: 'FIGHT_PROP_DEFENSE',
                    cr: 'FIGHT_PROP_CRITICAL',
                    cd: 'FIGHT_PROP_CRITICAL_HURT',
                    er: 'FIGHT_PROP_CHARGE_EFFICIENCY',
                    em: 'FIGHT_PROP_ELEMENT_MASTERY'
                  };
                  
                  const propType = typeMap[key];
                  if (!propType) return null;

                  const isCrit = key === 'cr' || key === 'cd';
                  const highlightClass = isCrit 
                    ? 'border-fuchsia-500/30 bg-fuchsia-500/5' 
                    : 'border-slate-800 bg-slate-900/50';
                  
                  const textClass = isCrit ? 'text-fuchsia-300' : 'text-slate-300';

                  return (
                    <div key={key} className={`rounded-xl p-4 border ${highlightClass} flex flex-col gap-1`}>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatIcon(propType)}
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                          {getStatName(propType)}
                        </span>
                      </div>
                      <span className={`text-xl font-mono font-bold ${textClass}`}>
                        {/* Special handling for simple keys if needed, but formatStatValue expects prop types */}
                        {/* If values are already formatted in stats object, just display. 
                            But usually they are raw numbers. 
                            In debug data: cr: 100 (meaning 100%), cd: 374 (374%).
                            In Enka real data: cr: 0.5 (50%).
                            We need to be careful. 
                            Let's assume debug data format for now or handle both?
                            If value < 2 for CR/CD, it's likely decimal.
                        */}
                        {(() => {
                          const val = value as number;
                          if (key === 'cr' || key === 'cd' || key === 'er') {
                             // Heuristic: if < 2, assume decimal (e.g. 0.5 -> 50%)
                             // But ER base is 1.0 (100%).
                             // Debug data has 100 for CR.
                             // Let's just append % for these keys.
                             return `${Number(val).toFixed(1)}%`;
                          }
                          return Math.round(Number(val)).toLocaleString();
                        })()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* ARTIFACTS PLACEHOLDER (Phase 3) */}
              <div className="mt-auto">
                <div className="flex items-center gap-2 mb-4 opacity-50">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Artéfacts (Phase 3)</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="aspect-square rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-slate-800/50" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
