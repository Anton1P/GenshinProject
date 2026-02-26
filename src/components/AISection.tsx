import React, { useState, useRef, useEffect } from 'react';
import { Character, UserBox } from '../types';
import { Sparkles, AlertCircle, CheckCircle2, Medal, Loader2, Info, CheckCircle, Star } from 'lucide-react';
import { Team, BuildResponse } from '../types/ai-types';
import { formatTime } from '../utils/ai-helpers';

interface AISectionProps {
  characters: Character[];
  userBox: UserBox;
  // Props from useGemini
  apiKey: string;
  isGenerating: boolean;
  teamsResult: any;
  error: string | null;
  loadingPhrase: string;
  seconds: number;
  progress: number;
  handleGenerateTeams: (query: string, builtChars: string[], ownedChars: string[]) => void;
  // Props from useFavorites
  toggleFavoriteTeam: (team: Team) => void;
  isTeamFavorited: (teamName: string) => boolean;
  // Props for interaction
  onSelectTeam: (team: Team) => void;
  buildsCache: Record<string, BuildResponse>;
  getRankBadge: (rank: number) => React.ReactNode;
  getRankBorder: (rank: number) => string;
}

const AISection: React.FC<AISectionProps> = ({ 
  characters, 
  userBox,
  apiKey,
  isGenerating,
  teamsResult,
  error,
  loadingPhrase,
  seconds,
  progress,
  handleGenerateTeams,
  toggleFavoriteTeam,
  isTeamFavorited,
  onSelectTeam,
  buildsCache,
  getRankBadge,
  getRankBorder
}) => {
  const [query, setQuery] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const onGenerate = async () => {
    const builtChars = characters
      .filter(c => userBox[c.id]?.isOwned && userBox[c.id]?.isBuilt)
      .map(c => c.name);
      
    const ownedChars = characters
      .filter(c => userBox[c.id]?.isOwned && !userBox[c.id]?.isBuilt)
      .map(c => c.name);

    await handleGenerateTeams(query, builtChars, ownedChars);
    
    // Scroll impératif après la génération
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const getCharacterIcon = (name: string) => {
    const char = characters.find(c => c.name.toLowerCase() === name.toLowerCase());
    return char ? char.icon : null;
  };

  return (
    <>
      <div className={`mt-8 bg-slate-900/50 p-6 rounded-xl border border-white/10 backdrop-blur-sm max-w-4xl mx-auto transition-opacity duration-300 ${isGenerating ? 'opacity-90 pointer-events-none' : 'opacity-100'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-300">
          <Sparkles className="w-5 h-5" />
          Assistant IA Theorycraft
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Votre objectif (ex: "Team Freeze pour Ayaka")
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white h-32 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none placeholder-slate-600 disabled:opacity-50"
              placeholder="Décrivez ce que vous cherchez..."
              disabled={isGenerating}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isGenerating
                  ? 'bg-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg hover:shadow-purple-500/25'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-mono w-12 text-left">{formatTime(seconds)}</span>
                  <span className="animate-pulse">{loadingPhrase}</span>
                </>
              ) : (
                'Générer mes équipes'
              )}
            </button>
            
            {isGenerating && (
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {teamsResult && (
            <div ref={resultsRef} className="space-y-6 mt-8 pt-8 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white pb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Équipes Suggérées
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                {teamsResult.teams.map((team: Team, index: number) => {
                  const isCached = !!buildsCache[team.name];
                  const isFavorited = isTeamFavorited(team.name);
                  
                  return (
                    <div key={index} className={`rounded-xl p-5 border transition-all duration-300 ${getRankBorder(team.rank)}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteTeam(team);
                          }}
                          className="p-1 hover:bg-white/10 rounded-full transition-colors"
                          title={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                          <Star 
                            className={`w-5 h-5 transition-colors ${
                              isFavorited ? "text-yellow-400 fill-yellow-400" : "text-slate-400 hover:text-yellow-400"
                            }`} 
                          />
                        </button>
                        <h4 className="text-xl font-bold text-white">
                          {team.name}
                        </h4>
                      </div>
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
                        <p className="leading-relaxed">{team.explanation}</p>
                      </div>
                      
                      <div className="bg-slate-950/30 p-3 rounded-lg border border-white/5">
                        <p className="font-semibold text-slate-400 mb-1 text-xs uppercase tracking-wider">Rotation</p>
                        <p className="font-mono text-xs leading-relaxed text-purple-200/80">{team.rotation}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => onSelectTeam(team)}
                      className={`mt-4 w-full py-2 rounded-lg text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${
                        isCached 
                          ? 'bg-slate-700/50 border border-green-500/30 hover:bg-slate-700' 
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {isCached ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Builds en cache
                        </>
                      ) : (
                        <>
                          <Info className="w-4 h-4" />
                          Plus d'infos / Builds
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AISection;
