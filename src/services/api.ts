import { Character, ElementType } from '../types';
import charactersData from '../data/characters.json';

export const fetchCharacters = async (): Promise<Character[]> => {
  try {
    return (charactersData as any[]).map((char) => ({
      id: String(char.id),
      name: char.name,
      element: char.element as ElementType,
      rank: Number(char.rank),
      icon: `https://enka.network/ui/${char.icon}.png`,
    }));
  } catch (error) {
    console.error("Erreur lors du chargement local des personnages:", error);
    return [];
  }
};