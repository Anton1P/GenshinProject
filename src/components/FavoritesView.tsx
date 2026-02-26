import React, { useState } from 'react';
import { Character, SavedAudit } from '../types';
import { SavedTeam, Team, BuildResponse } from '../types/ai-types';
import { Star, Trash2, Eye, Sparkles, AlertCircle, ChevronDown, ChevronUp, Activity, CheckCircle2, XCircle, Target, Heart } from 'lucide-react';
import { getAssetUrl } from '../utils/ai-helpers';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis, Tooltip } from 'recharts';

interface FavoritesViewProps {
  favorites: SavedTeam[];
  savedAudits: SavedAudit[];
  characters: Character[];
  onDeleteTeam: (team: Team) => void;
  onDeleteAudit: (id: string) => void;
  onViewBuild: (team: Team, buildData?: BuildResponse) => void;
  getRankBadge: (rank: number) => React.ReactNode;
  getRankBorder: (rank: number) => string;
}

interface FavoriteTeamCardProps {
  fav: SavedTeam;
  characters: Character[];
  onDelete: (team: Team) => void;
  onViewBuild: (team: Team, buildData?: BuildResponse) => void;
  getRankBadge: (rank: number) => React.ReactNode;
  getRankBorder: (rank: number) => string;
  getCharacterIcon: (name: string) => string | null | undefined;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-sm">
        <p className="font-bold text-slate-200 mb-2">{data.subject}</p>
        <p className="text-fuchsia-400">Actuel : <span className="font-bold">{data.displayCurrent}</span></p>
        <p className="text-slate-400">Cible : <span className="font-bold">{data.displayTarget}</span></p>
      </div>
    );
  }
  return null;
};

interface SavedAuditCardProps {
  audit: SavedAudit;
  onRemove: (id: string) => void;
  getCharacterIcon: (name: string) => string | null | undefined;
  getCharacterElement: (name: string) => string;
  getElementColor: (element: string) => string;
  getStatusColor: (status: string) => string;
}

const SavedAuditCard: React.FC<SavedAuditCardProps> = ({ 
  audit, 
  onRemove, 
  getCharacterIcon, 
  getCharacterElement, 
  getElementColor, 
  getStatusColor 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 md:p-6 relative group mb-4">
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <img 
            src={getCharacterIcon(audit.characterName) || ''} 
            alt={audit.characterName}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-900 object-cover border-2 border-purple-500/30"
          />
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-white">{audit.characterName}</h2>
            <p className="text-xs md:text-sm text-slate-400">Audit du {new Date(audit.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`hidden md:inline-block px-3 py-1 rounded-full border font-bold text-xs uppercase tracking-wider shadow-lg ${getStatusColor(audit.result?.status || '')}`}>
            {audit.result?.status}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(audit.id);
            }}
            className="p-2 bg-slate-900/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors"
            title="Supprimer cet audit"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-white/5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Status Header (Mobile only) */}
          <div className="flex justify-center md:hidden">
            <span className={`px-6 py-2 rounded-full border font-bold text-sm uppercase tracking-wider shadow-lg ${getStatusColor(audit.result?.status || '')}`}>
              {audit.result?.status}
            </span>
          </div>

          {/* Radar Chart Section */}
          {audit.result.chartData && (
            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={audit.result.chartData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Radar
                      name="Cible"
                      dataKey="scoreTarget"
                      stroke="#9ca3af"
                      strokeOpacity={0.5}
                      fill="#9ca3af"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="Actuel"
                      dataKey="scoreCurrent"
                      stroke={getElementColor(getCharacterElement(audit.characterName))}
                      fill={getElementColor(getCharacterElement(audit.characterName))}
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positives */}
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
              <h4 className="text-emerald-400 font-bold mb-3 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Points Forts
              </h4>
              <ul className="space-y-1">
                {audit.result.positives.slice(0, 3).map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Negatives */}
            <div className="bg-rose-900/20 border border-rose-500/30 rounded-xl p-4">
              <h4 className="text-rose-400 font-bold mb-3 flex items-center gap-2 text-sm">
                <XCircle className="w-4 h-4" />
                Points Faibles
              </h4>
              <ul className="space-y-1">
                {audit.result.negatives.slice(0, 3).map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-rose-500 mt-0.5">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Priorities */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
            <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" />
              Actions Prioritaires
            </h4>
            <ul className="space-y-1">
              {audit.result.priorities.slice(0, 2).map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-blue-500 font-bold min-w-[15px]">{idx + 1}.</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const FavoriteTeamCard: React.FC<FavoriteTeamCardProps> = ({
  fav,
  onDelete,
  onViewBuild,
  getRankBadge,
  getRankBorder,
  getCharacterIcon
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const team = fav.teamData;
  const hasBuild = !!fav.buildData;

  return (
    <div className={`rounded-xl p-5 border transition-all duration-300 relative group ${getRankBorder(team.rank)}`}>
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(team);
        }}
        className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
        title="Supprimer des favoris"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex justify-between items-start mb-4 pr-10">
        <h4 className="text-xl font-bold text-white">
          {team.name}
        </h4>
        {getRankBadge(team.rank)}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {team.characters.map((charName, idx) => {
          const icon = getCharacterIcon(charName);
          return icon ? (
            <img 
              key={idx}
              src={icon} 
              alt={charName}
              title={charName}
              className="w-12 h-12 rounded-full border-2 border-slate-700 object-cover bg-slate-800 hover:scale-110 transition-transform cursor-help"
            />
          ) : (
            <div 
              key={idx}
              title={charName}
              className="w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 hover:scale-110 transition-transform cursor-help"
            >
              {charName.substring(0, 2).toUpperCase()}
            </div>
          );
        })}
      </div>

      <div className="space-y-3 text-sm text-slate-300">
        <div className="bg-slate-950/30 p-3 rounded-lg border border-white/5">
          <p className="font-semibold text-slate-400 mb-1 text-xs uppercase tracking-wider">Pourquoi ça marche</p>
          <p className={`leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>{team.explanation}</p>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-2 font-medium transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" /> Voir moins
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" /> Voir plus
              </>
            )}
          </button>
        </div>
        
        {isExpanded && (
          <div className="bg-slate-950/30 p-3 rounded-lg border border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="font-semibold text-slate-400 mb-1 text-xs uppercase tracking-wider">Rotation</p>
            <p className="font-mono text-xs leading-relaxed text-purple-200/80">{team.rotation}</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => onViewBuild(team, fav.buildData)}
        className={`mt-4 w-full py-2 rounded-lg text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${
          hasBuild
            ? 'bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-300' 
            : 'bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-300'
        }`}
      >
        {hasBuild ? (
          <>
            <Eye className="w-4 h-4" />
            Voir le build sauvegardé
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Générer le build avec l'IA
          </>
        )}
      </button>
      
      {!hasBuild && (
        <p className="text-xs text-center mt-2 text-slate-500 flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Build non généré
        </p>
      )}
    </div>
  );
};

const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  savedAudits,
  characters,
  onDeleteTeam,
  onDeleteAudit,
  onViewBuild,
  getRankBadge,
  getRankBorder,
}) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'audits'>('teams');

  const getCharacterIcon = (name: string) => {
    const char = characters.find(c => c.name.toLowerCase() === name.toLowerCase());
    return char ? char.icon : null;
  };

  const getCharacterElement = (name: string) => {
    const char = characters.find(c => c.name.toLowerCase() === name.toLowerCase());
    return char ? char.element : 'Anemo';
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'Pyro': return '#ef4444'; // red-500
      case 'Hydro': return '#3b82f6'; // blue-500
      case 'Dendro': return '#22c55e'; // green-500
      case 'Electro': return '#a855f7'; // purple-500
      case 'Anemo': return '#14b8a6'; // teal-500
      case 'Cryo': return '#06b6d4'; // cyan-500
      case 'Geo': return '#eab308'; // yellow-500
      default: return '#8b5cf6'; // violet-500
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('non build')) return 'bg-amber-700 text-white border-amber-600'; // Bronze
    if (s.includes('sans opti')) return 'bg-slate-400 text-slate-900 border-slate-300'; // Silver
    if (s.includes('perfectionnable')) return 'bg-yellow-500 text-yellow-950 border-yellow-400'; // Gold
    if (s.includes('parfaite') || s.includes('optimisé')) return 'bg-sky-400 text-sky-950 border-sky-300'; // Platinum/Blue
    return 'bg-slate-700 text-slate-300 border-slate-600';
  };

  return (
    <div className="mt-8">
      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-center mb-8 gap-2 w-full max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('teams')} 
          className={`flex-1 px-4 py-2 text-sm sm:text-base rounded-md transition-all whitespace-nowrap text-center flex items-center justify-center gap-2 ${
            activeTab === 'teams' 
              ? 'bg-purple-600 text-white font-bold shadow-lg' 
              : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
          }`}
        >
          <Star className="w-4 h-4" />
          Équipes Sauvegardées
          {favorites.length > 0 && <span className="ml-1 text-xs bg-black/20 px-1.5 py-0.5 rounded-full">{favorites.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('audits')} 
          className={`flex-1 px-4 py-2 text-sm sm:text-base rounded-md transition-all whitespace-nowrap text-center flex items-center justify-center gap-2 ${
            activeTab === 'audits' 
              ? 'bg-fuchsia-600 text-white font-bold shadow-lg' 
              : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          Audits
          {savedAudits.length > 0 && <span className="ml-1 text-xs bg-black/20 px-1.5 py-0.5 rounded-full">{savedAudits.length}</span>}
        </button>
      </div>

      {activeTab === 'teams' ? (
        favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="bg-slate-800/50 p-6 rounded-full border border-white/5">
              <Star className="w-12 h-12 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-300">Aucune équipe favorite</h3>
            <p className="text-slate-500 max-w-md">
              Utilisez le générateur d'équipes pour créer des compositions et sauvegardez-les ici pour les retrouver plus tard.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {favorites.map((fav) => (
              <FavoriteTeamCard
                key={fav.id}
                fav={fav}
                characters={characters}
                onDelete={onDeleteTeam}
                onViewBuild={onViewBuild}
                getRankBadge={getRankBadge}
                getRankBorder={getRankBorder}
                getCharacterIcon={getCharacterIcon}
              />
            ))}
          </div>
        )
      ) : (
        savedAudits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="bg-slate-800/50 p-6 rounded-full border border-white/5">
              <Activity className="w-12 h-12 text-slate-600" />
            </div>
            <p className="text-center text-slate-400">Aucun audit sauvegardé pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
            {savedAudits.map((audit) => (
              <SavedAuditCard 
                key={audit.id} 
                audit={audit} 
                onRemove={onDeleteAudit}
                getCharacterIcon={getCharacterIcon}
                getCharacterElement={getCharacterElement}
                getElementColor={getElementColor}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default FavoritesView;
