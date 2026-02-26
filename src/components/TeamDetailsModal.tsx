import React from 'react';
import { Loader2, X, Sword, Hourglass, Trophy, Crown, Star } from 'lucide-react';
import { Team, BuildResponse } from '../types/ai-types';
import { getAssetUrl } from '../utils/ai-helpers';

interface TeamDetailsModalProps {
  selectedTeam: Team;
  teamDetails: BuildResponse | null;
  isLoading: boolean;
  loadingPhrase: string;
  progress: number;
  onClose: () => void;
  getCharacterIcon: (name: string) => string | null | undefined;
  onSaveBuild: (build: BuildResponse) => void;
  isBuildSaved: boolean;
}

export const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({
  selectedTeam,
  teamDetails,
  isLoading,
  loadingPhrase,
  progress,
  onClose,
  getCharacterIcon,
  onSaveBuild,
  isBuildSaved
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {selectedTeam.name}
              </h3>
              <p className="text-slate-400 text-sm mt-1">Détails des builds optimaux</p>
            </div>
            {teamDetails && (
              <button
                onClick={() => onSaveBuild(teamDetails)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title={isBuildSaved ? "Build sauvegardé" : "Sauvegarder ce build"}
              >
                <Star 
                  className={`w-6 h-6 transition-colors ${
                    isBuildSaved ? "text-yellow-400 fill-yellow-400" : "text-slate-400 hover:text-yellow-400"
                  }`} 
                />
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
              <p className="text-slate-300 font-medium animate-pulse">{loadingPhrase}</p>
              <div className="w-64 bg-slate-800 rounded-full h-2 overflow-hidden mt-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : teamDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {teamDetails.builds.map((build, idx) => {
                const icon = getCharacterIcon(build.character);
                const artifactUrl = getAssetUrl(build.artifactSet);

                return (
                  <div key={idx} className="bg-slate-800/50 rounded-xl border border-white/5 p-4 flex flex-col gap-4 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                      {icon ? (
                        <img src={icon} alt={build.character} className="w-12 h-12 rounded-full border border-slate-600 bg-slate-900 object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full border border-slate-600 bg-slate-900 flex items-center justify-center text-xs font-bold">
                          {build.character.substring(0, 2)}
                        </div>
                      )}
                      <div className="font-bold text-white">{build.character}</div>
                    </div>

                    {/* Weapons Section */}
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Sword className="w-3 h-3" /> Armes Recommandées
                      </p>
                      <div className="space-y-2">
                        {build.weapons.map((weapon, wIdx) => {
                          const weaponUrl = getAssetUrl(weapon.name);
                          let borderColor = 'border-slate-600';
                          let textColor = 'text-slate-300';
                          
                          if (weapon.rarity === 5) {
                            borderColor = 'border-yellow-500/50';
                            textColor = 'text-yellow-200';
                          } else if (weapon.rarity === 4) {
                            borderColor = 'border-purple-500/50';
                            textColor = 'text-purple-200';
                          } else if (weapon.rarity === 3) {
                            borderColor = 'border-blue-500/50';
                            textColor = 'text-blue-300';
                          }
                          
                          return weaponUrl ? (
                            <div key={wIdx} className={`flex items-center gap-2 p-1.5 rounded bg-slate-900/50 border ${borderColor}`}>
                              <img src={weaponUrl} alt={weapon.name} className="w-8 h-8 rounded bg-slate-800 object-cover" />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold truncate ${textColor}`}>{weapon.name}</p>
                                <p className="text-[10px] text-slate-500">{weapon.type}</p>
                              </div>
                            </div>
                          ) : (
                            <div key={wIdx} className={`flex items-center justify-between px-2 py-1 rounded bg-slate-900/50 border ${borderColor}`}>
                              <span className={`text-xs font-medium ${textColor}`}>{weapon.name}</span>
                              <span className="text-[10px] text-slate-500">{weapon.type}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Artifacts Section */}
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Set d'Artéfacts</p>
                      <div className="flex items-center gap-2">
                        {artifactUrl && (
                          <img src={artifactUrl} alt={build.artifactSet} className="w-10 h-10 object-cover rounded-full border border-white/10" />
                        )}
                        <p className="text-sm font-bold text-yellow-400 leading-tight">{build.artifactSet}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Stats Principales</p>
                      <div className="grid grid-cols-1 gap-1">
                        <div className="bg-slate-900/50 px-2 py-1 rounded text-xs text-slate-200 flex items-center justify-between">
                          <div className="flex items-center">
                            <Hourglass className="w-4 h-4 inline-block mr-2 text-slate-400" />
                            <span className="text-slate-500">Sablier</span>
                          </div>
                          <span>{build.sands}</span>
                        </div>
                        <div className="bg-slate-900/50 px-2 py-1 rounded text-xs text-slate-200 flex items-center justify-between">
                          <div className="flex items-center">
                            <Trophy className="w-4 h-4 inline-block mr-2 text-slate-400" />
                            <span className="text-slate-500">Coupe</span>
                          </div>
                          <span>{build.goblet}</span>
                        </div>
                        <div className="bg-slate-900/50 px-2 py-1 rounded text-xs text-slate-200 flex items-center justify-between">
                          <div className="flex items-center">
                            <Crown className="w-4 h-4 inline-block mr-2 text-slate-400" />
                            <span className="text-slate-500">Couronne</span>
                          </div>
                          <span>{build.circlet}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Substats Prioritaires</p>
                      <div className="flex flex-wrap gap-1">
                        {build.substats.map((sub, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded text-xs">
                            {i + 1}. {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="mt-4 p-3 bg-slate-900/60 rounded-lg text-[11px] leading-relaxed text-slate-400 italic border border-white/5">
                      {build.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-red-400 p-8">
              Impossible de charger les détails. Veuillez réessayer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
