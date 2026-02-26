import { useState, useEffect } from 'react';
import { Team, BuildResponse, SavedTeam } from '../types/ai-types';

export const useFavorites = (currentUid: string) => {
  const [favorites, setFavorites] = useState<SavedTeam[]>([]);

  // Load favorites when UID changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use '000000000' as default key for guests or empty UID
      const storageKey = `genshin_favorites_${currentUid || '000000000'}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse favorites", e);
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    }
  }, [currentUid]);

  // Save favorites whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = `genshin_favorites_${currentUid || '000000000'}`;
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    }
  }, [favorites, currentUid]);

  const toggleFavoriteTeam = (team: Team) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === team.name);
      if (exists) {
        return prev.filter(f => f.id !== team.name);
      }
      return [...prev, {
        id: team.name,
        teamData: team,
        savedAt: Date.now()
      }];
    });
  };

  const saveBuildToTeamWithData = (team: Team, build: BuildResponse) => {
    setFavorites(prev => {
      const existingTeamIndex = prev.findIndex(f => f.id === team.name);
      
      if (existingTeamIndex >= 0) {
        const newFavorites = [...prev];
        newFavorites[existingTeamIndex] = {
          ...newFavorites[existingTeamIndex],
          buildData: build
        };
        return newFavorites;
      } else {
        return [...prev, {
          id: team.name,
          teamData: team,
          buildData: build,
          savedAt: Date.now()
        }];
      }
    });
  };

  const isTeamFavorited = (teamName: string) => {
    return favorites.some(f => f.id === teamName);
  };

  const isBuildFavorited = (teamName: string) => {
    return favorites.some(f => f.id === teamName && !!f.buildData);
  };

  return {
    favorites,
    toggleFavoriteTeam,
    saveBuildToTeam: saveBuildToTeamWithData,
    isTeamFavorited,
    isBuildFavorited
  };
};
