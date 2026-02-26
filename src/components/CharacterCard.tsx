import React from 'react';
import { Star, Eye } from 'lucide-react';
import { Character, UserCharacterState } from '../types';

interface CharacterCardProps {
  character: Character;
  userState: UserCharacterState;
  onToggleOwn: (id: string) => void;
  onToggleBuild: (id: string) => void;
  onViewBuild?: (character: Character) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  userState,
  onToggleOwn,
  onToggleBuild,
  onViewBuild
}) => {
  const { isOwned, isBuilt } = userState;
  const isRank5 = character.rank === 5;
  
  // Check if character is from Enka (has weapon/artifacts data)
  const isEnkaSynced = !!(character.weapon || (character.artifacts && character.artifacts.length > 0));

  // Background color logic
  const bgClass = isRank5
    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
    : 'bg-purple-600';

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 rounded-xl overflow-hidden shadow-lg transform hover:scale-105 ${
        !isOwned ? 'opacity-50 grayscale' : 'opacity-100 grayscale-0 border-2 border-white'
      } ${bgClass}`}
      onClick={() => onToggleOwn(character.id)}
    >
      {/* Character Image */}
      <div className="aspect-square w-full relative">
        <img
          src={character.icon}
          alt={character.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-center">
          <span className="text-white text-sm font-bold truncate block">
            {character.name}
          </span>
        </div>
      </div>

      {/* Top Left Actions - Eye Icon */}
      {onViewBuild && isEnkaSynced && (
        <div className="absolute top-2 left-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewBuild(character);
            }}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-fuchsia-400 transition-all backdrop-blur-sm border border-white/10 hover:border-fuchsia-400/50 shadow-lg"
            title="Voir le build détaillé"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Right Actions - Star Icon */}
      <div className="absolute top-2 right-2 z-20">
        <div
          className="p-1 rounded-full hover:bg-white/20 cursor-pointer transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onToggleBuild(character.id);
          }}
          title={isBuilt ? "Marqué comme buildé" : "Marquer comme buildé"}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              isBuilt ? 'fill-yellow-400 text-yellow-400' : 'text-white/70'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
