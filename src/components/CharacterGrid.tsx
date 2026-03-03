import React, { useState } from 'react';
import CharacterCard from './CharacterCard';
import { Character, UserBox } from '../types';
import { Sparkles, Database, ChevronDown, ChevronUp } from 'lucide-react';

const LAB_INITIAL_COUNT = 18;

interface CharacterGridProps {
  characters: Character[];
  userBox: UserBox;
  onToggleOwn: (id: string) => void;
  onToggleBuild: (id: string) => void;
  isLoading: boolean;
  detailedRoster?: any[]; // We need this to know which characters are in the showcase
  onViewBuild?: (character: Character) => void;
}

const CharacterGrid: React.FC<CharacterGridProps> = ({
  characters,
  userBox,
  onToggleOwn,
  onToggleBuild,
  isLoading,
  detailedRoster = [],
  onViewBuild
}) => {
  const [isLabExpanded, setIsLabExpanded] = useState(false);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="text-center text-slate-400 py-12">
        No characters found.
      </div>
    );
  }

  // Split characters into showcase and others
  const showcaseNames = new Set(detailedRoster.map((c: any) => c.name.toLowerCase()));

  const showcaseCharacters = characters.filter(char => showcaseNames.has(char.name.toLowerCase()));
  const otherCharacters = characters.filter(char => !showcaseNames.has(char.name.toLowerCase()));

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Showcase Section */}
      {showcaseCharacters.length > 0 && (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800/60 pb-2">
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Vitrine Synchronisée</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {showcaseCharacters.map((char) => {
              const detail = detailedRoster.find((c: any) => c.name.toLowerCase() === char.name.toLowerCase());
              // Explicitly merge weapon and artifacts to ensure they are passed down
              const enrichedChar = detail ? {
                ...char,
                ...detail,
                weapon: detail.weapon,
                artifacts: detail.artifacts
              } : char;

              return (
                <CharacterCard
                  key={char.id}
                  character={enrichedChar}
                  userState={userBox[char.id] || { isOwned: false, isBuilt: false }}
                  onToggleOwn={onToggleOwn}
                  onToggleBuild={onToggleBuild}
                  onViewBuild={onViewBuild}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Other Characters Section */}
      {otherCharacters.length > 0 && (
        <div id="lab-section" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800/60 pb-2">
            <Database className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Mode Laboratoire (Saisie Manuelle)</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {(isLabExpanded ? otherCharacters : otherCharacters.slice(0, LAB_INITIAL_COUNT)).map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                userState={userBox[char.id] || { isOwned: false, isBuilt: false }}
                onToggleOwn={onToggleOwn}
                onToggleBuild={onToggleBuild}
              />
            ))}
          </div>

          {/* Bouton "Voir plus" / "Voir moins" */}
          {otherCharacters.length > LAB_INITIAL_COUNT && (
            <div className="flex justify-center mt-6">
              {!isLabExpanded ? (
                <button
                  onClick={() => setIsLabExpanded(true)}
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm font-semibold hover:bg-slate-700/60 hover:border-slate-600/60 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  Afficher tout le roster ({otherCharacters.length} personnages)
                  <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsLabExpanded(false);
                    setTimeout(() => {
                      document.getElementById('lab-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm font-semibold hover:bg-slate-700/60 hover:border-slate-600/60 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  Réduire le roster
                  <ChevronUp className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterGrid;
