import React from 'react';
import { X } from 'lucide-react';
import { Character, WeaponData, EquipStat } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getBenchmark } from '../data/top1-benchmarks';

interface BuildDashboardModalProps {
  character: Character | null;
  onClose: () => void;
}

import { getStatIcon } from './StatIcon';


// ─── Helpers ────────────────────────────────────────────────────────────────

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
    'FIGHT_PROP_BASE_ATTACK': 'ATQ de base',
  };
  return map[type] || type;
};
const calculateCV = (subStats: EquipStat[]): number => {
  let cv = 0;
  subStats.forEach(stat => {
    if (stat.type === 'FIGHT_PROP_CRITICAL') {
      cv += stat.value * 2;
    } else if (stat.type === 'FIGHT_PROP_CRITICAL_HURT') {
      cv += stat.value;
    }
  });
  return parseFloat(cv.toFixed(1));
};

const getCVColor = (cv: number) => {
  if (cv >= 50) return { border: 'border-rose-500', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]', text: 'text-rose-300', bg: 'bg-rose-500/30' };
  if (cv >= 40) return { border: 'border-amber-400', glow: 'shadow-[0_0_12px_rgba(251,191,36,0.4)]', text: 'text-amber-300', bg: 'bg-amber-500/30' };
  if (cv >= 30) return { border: 'border-fuchsia-400', glow: 'shadow-[0_0_10px_rgba(232,121,249,0.35)]', text: 'text-fuchsia-300', bg: 'bg-fuchsia-500/30' };
  if (cv >= 20) return { border: 'border-blue-400', glow: 'shadow-[0_0_8px_rgba(96,165,250,0.3)]', text: 'text-blue-300', bg: 'bg-blue-500/30' };
  return { border: 'border-slate-500/50', glow: '', text: 'text-slate-300', bg: 'bg-slate-600/30' };
};

// Element theme colors for the background gradient
const getElementTheme = (element: string) => {
  const themes: Record<string, { from: string; to: string; accent: string }> = {
    Pyro: { from: '#1a0808', to: '#2d0a0a', accent: '#ef4444' },
    Hydro: { from: '#080d1a', to: '#0a152d', accent: '#3b82f6' },
    Cryo: { from: '#081518', to: '#0a2530', accent: '#22d3ee' },
    Electro: { from: '#120820', to: '#1f0a35', accent: '#a855f7' },
    Anemo: { from: '#081a12', to: '#0a2d1a', accent: '#2dd4bf' },
    Geo: { from: '#1a1508', to: '#2d250a', accent: '#eab308' },
    Dendro: { from: '#0d1a08', to: '#152d0a', accent: '#22c55e' },
  };
  return themes[element] || themes.Pyro;
};

const getElementBadgeClass = (element: string) => {
  const map: Record<string, string> = {
    Pyro: 'bg-red-500/20 text-red-400 border-red-500/30',
    Hydro: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Cryo: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Electro: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Anemo: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    Geo: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Dendro: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return map[element] || '';
};

// ─── Stat order for the main list ───────────────────────────────────────────

interface StatEntry {
  key: string;
  propType: string;
  label: string;
  value: number;
  displayValue: string;
}

const buildStatList = (stats: Record<string, any>): StatEntry[] => {
  const order = [
    { key: 'hp', propType: 'FIGHT_PROP_HP', label: 'PV max' },
    { key: 'atk', propType: 'FIGHT_PROP_ATTACK', label: 'ATQ' },
    { key: 'def', propType: 'FIGHT_PROP_DEFENSE', label: 'DÉF' },
    { key: 'em', propType: 'FIGHT_PROP_ELEMENT_MASTERY', label: 'Maîtrise élémentaire' },
    { key: 'cr', propType: 'FIGHT_PROP_CRITICAL', label: 'Taux CRIT' },
    { key: 'cd', propType: 'FIGHT_PROP_CRITICAL_HURT', label: 'DGT CRIT' },
    { key: 'er', propType: 'FIGHT_PROP_CHARGE_EFFICIENCY', label: "Recharge d'énergie" },
  ];

  return order
    .filter(s => stats[s.key] !== undefined)
    .map(s => {
      const raw = Number(stats[s.key]);
      let displayValue: string;
      if (s.key === 'cr' || s.key === 'cd' || s.key === 'er') {
        displayValue = `${(raw * 100).toFixed(1)}%`;
      } else {
        displayValue = Math.round(raw).toLocaleString();
      }
      return { ...s, value: raw, displayValue };
    });
};

// ─── Radar data builder ─────────────────────────────────────────────────────

const buildRadarData = (stats: Record<string, any>, characterName: string) => {
  const bench = getBenchmark(characterName);

  const hp = Math.min((Number(stats.hp || 0) / bench.hp) * 100, 100);
  const atk = Math.min((Number(stats.atk || 0) / bench.atk) * 100, 100);
  const def = Math.min((Number(stats.def || 0) / bench.def) * 100, 100);
  const cr = Math.min((Number(stats.cr || 0) / bench.cr) * 100, 100);
  const cd = Math.min((Number(stats.cd || 0) / bench.cd) * 100, 100);
  const er = Math.min((Number(stats.er || 0) / bench.er) * 100, 100);

  return [
    { stat: 'PV', value: hp, raw: Math.round(Number(stats.hp || 0)).toLocaleString(), top1: Math.round(bench.hp).toLocaleString() },
    { stat: 'ATQ', value: atk, raw: Math.round(Number(stats.atk || 0)).toLocaleString(), top1: Math.round(bench.atk).toLocaleString() },
    { stat: 'DÉF', value: def, raw: Math.round(Number(stats.def || 0)).toLocaleString(), top1: Math.round(bench.def).toLocaleString() },
    { stat: 'Taux CRIT', value: cr, raw: `${(Number(stats.cr || 0) * 100).toFixed(1)}%`, top1: `${(bench.cr * 100).toFixed(1)}%` },
    { stat: 'DGT CRIT', value: cd, raw: `${(Number(stats.cd || 0) * 100).toFixed(1)}%`, top1: `${(bench.cd * 100).toFixed(1)}%` },
    { stat: 'Recharge', value: er, raw: `${(Number(stats.er || 0) * 100).toFixed(1)}%`, top1: `${(bench.er * 100).toFixed(1)}%` },
  ];
};

// ─── Component ──────────────────────────────────────────────────────────────

export const BuildDashboardModal: React.FC<BuildDashboardModalProps> = ({ character, onClose }) => {
  if (!character) return null;

  const detailedChar = character as any;
  const stats = detailedChar.stats || {};
  const weapon = character.weapon;
  const artifacts = character.artifacts || [];
  const theme = getElementTheme(character.element);

  const equipOrder = ['EQUIP_BRACER', 'EQUIP_NECKLACE', 'EQUIP_SHOES', 'EQUIP_RING', 'EQUIP_DRESS'];
  const sortedArtifacts = [...artifacts].sort((a, b) =>
    equipOrder.indexOf(a.equipType) - equipOrder.indexOf(b.equipType)
  );

  const statList = buildStatList(stats);
  const radarData = buildRadarData(stats, character.name);

  const totalCV = sortedArtifacts.reduce((sum, a) => sum + calculateCV(a.subStats), 0);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
      style={{ animation: 'fadeIn 0.25s ease-out' }}
    >
      {/* ── Main Panel ── */}
      <div
        className="relative w-full max-w-[1050px] rounded-2xl overflow-hidden border border-white/10"
        style={{
          background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`,
          minHeight: '580px',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all border border-white/10 backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── Content Grid ── */}
        <div className="flex flex-col lg:flex-row min-h-[580px]">

          {/* ═══ LEFT: Splash Art ═══ */}
          <div className="relative lg:w-[42%] min-h-[300px] lg:min-h-full shrink-0 overflow-hidden">
            <img
              src={character.icon}
              alt={character.name}
              className="absolute inset-0 w-full h-full object-cover scale-110"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(to bottom, transparent 40%, ${theme.from} 100%),
                  linear-gradient(to right, transparent 50%, ${theme.to} 100%)
                `,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

            {/* Character info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 z-10">
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md ${getElementBadgeClass(character.element)}`}>
                  {character.element}
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-1 tracking-tight leading-none drop-shadow-lg">
                {character.name}
              </h2>
              <p className="text-sm text-white/50 font-mono mt-2">
                Niv. 90/90
              </p>
            </div>
          </div>

          {/* ═══ RIGHT: Stats & Weapon ═══ */}
          <div className="flex-1 flex flex-col p-5 lg:p-8 gap-5 overflow-y-auto max-h-[85vh] lg:max-h-none">

            {/* ── Weapon Bar ── */}
            {weapon && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                <div className="w-16 h-16 shrink-0 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center overflow-hidden">
                  <img src={weapon.icon} alt="Weapon" className="w-14 h-14 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-base truncate">
                      {weapon.name || 'Arme'}
                    </span>
                    <span className="text-yellow-400 text-xs">
                      {'★'.repeat(weapon.rank || 5)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white/50">Niv. {weapon.level}</span>
                    {weapon.mainStat && (
                      <span className="text-white/70 flex items-center gap-1.5">
                        <div className="opacity-60 scale-90">{getStatIcon(weapon.mainStat.type)}</div>
                        <span className="font-semibold">{formatStatValue(weapon.mainStat.type, weapon.mainStat.value)}</span>
                      </span>
                    )}
                    {weapon.subStats && weapon.subStats.length > 0 && (
                      <span className="text-white/70 flex items-center gap-1.5">
                        <div className="opacity-60 scale-90">{getStatIcon(weapon.subStats[0].type)}</div>
                        <span className="font-semibold">{formatStatValue(weapon.subStats[0].type, weapon.subStats[0].value)}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-md text-xs font-bold border"
                  style={{ color: theme.accent, borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}15` }}
                >
                  R{weapon.refinement || 1}
                </div>
              </div>
            )}

            {/* ── Stats List + Radar side by side ── */}
            <div className="flex flex-col md:flex-row gap-5 flex-1">

              {/* Stats List */}
              <div className="flex-1 flex flex-col gap-0">
                {statList.map((stat, i) => {
                  const isCrit = stat.key === 'cr' || stat.key === 'cd';
                  return (
                    <div
                      key={stat.key}
                      className={`flex items-center justify-between py-3 px-1 ${i < statList.length - 1 ? 'border-b border-white/[0.06]' : ''
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {getStatIcon(stat.propType)}
                        <span className={`text-sm ${isCrit ? 'text-fuchsia-300 font-semibold' : 'text-white/60'}`}>
                          {stat.label}
                        </span>
                      </div>
                      <span className={`text-base font-mono font-bold ${isCrit ? 'text-fuchsia-200' : 'text-white'}`}>
                        {stat.displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Radar Chart */}
              <div className="w-full md:w-[220px] lg:w-[250px] shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                      dataKey="stat"
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip
                      content={({ payload }) => {
                        if (payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-xs">
                              <div className="text-white/60 mb-0.5">{data.stat}</div>
                              <div className="text-white font-bold">{data.raw}</div>
                              <div className="text-white/40 text-[10px] mt-0.5">Top 1%: {data.top1}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Radar
                      dataKey="value"
                      stroke={theme.accent}
                      fill={theme.accent}
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Total CV ── */}
            {sortedArtifacts.length > 0 && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-white/30 text-sm">⬡</span>
                <span className="text-xs font-bold uppercase tracking-wider text-white/30">Artéfacts</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs font-mono text-white/40">
                  Total CV: <span className="text-white/70 font-bold">{totalCV.toFixed(1)}</span>
                </span>
              </div>
            )}

            {/* ── Artifacts Row ── */}
            {sortedArtifacts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {sortedArtifacts.map((artifact, index) => {
                  const cv = calculateCV(artifact.subStats);
                  const cvStyle = getCVColor(cv);

                  return (
                    <div
                      key={index}
                      className={`relative rounded-xl p-2 overflow-hidden backdrop-blur-sm border transition-all hover:scale-[1.02] ${cvStyle.border} ${cvStyle.glow}`}
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      {/* Artifact set icon */}
                      <div className="flex justify-center mb-1 relative z-10">
                        <img
                          src={artifact.icon}
                          alt=""
                          className="w-16 h-16 object-contain drop-shadow-lg"
                        />
                      </div>

                      {/* Header: Level + CV badge */}
                      <div className="flex justify-between items-center mb-1.5 relative z-10">
                        <span className="text-[10px] font-mono text-white/60 bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
                          +{artifact.level}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${cvStyle.text} ${cvStyle.bg} ${cvStyle.border}`}>
                          {cv} CV
                        </span>
                      </div>

                      {/* Main stat */}
                      <div className="mb-1.5 relative z-10">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {getStatIcon(artifact.mainStat.type)}
                          <span className="text-[10px] uppercase text-white/40 truncate">
                            {getStatName(artifact.mainStat.type)}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-white leading-none">
                          {formatStatValue(artifact.mainStat.type, artifact.mainStat.value)}
                        </div>
                      </div>

                      {/* Sub stats */}
                      <div className="space-y-0 border-t border-white/[0.06] pt-1.5 relative z-10">
                        {artifact.subStats.map((sub, idx) => {
                          const isCrit = sub.type.includes('CRITICAL');
                          return (
                            <div key={idx} className="flex justify-between items-center text-[11px]">
                              <span className={isCrit ? 'text-white/80' : 'text-white/40'}>
                                {getStatName(sub.type)}
                              </span>
                              <span className={`font-mono ${isCrit ? 'text-white font-bold' : 'text-white/50'}`}>
                                {formatStatValue(sub.type, sub.value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 rounded-xl border border-dashed border-white/10">
                <p className="text-white/30 text-sm">Aucun artéfact équipé</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
