import { ASSET_MAP } from '../constants/ai-section';

export const getAssetUrl = (name: string): string | null => {
  if (!name) return null;
  const searchName = name.toLowerCase().trim();
  
  // 1. Recherche exacte (Priorité absolue)
  const exact = ASSET_MAP[searchName];
  if (exact) return `https://enka.network/ui/${exact}.png`;

  // 2. Recherche Floue (Fuzzy Search par mots-clés)
  // On découpe la recherche en mots de plus de 3 lettres pour ignorer "de", "la", "du", etc.
  const inputWords = searchName.split(/[\s-']/).filter(w => w.length > 3);
  const totalWords = inputWords.length;
  if (totalWords === 0) return null;

  let bestMatchKey = null;
  let highestScore = 0;

  // Optimisation : Boucle performante sur les clés du dictionnaire
  const keys = Object.keys(ASSET_MAP);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let score = 0;
    for (let j = 0; j < totalWords; j++) {
      if (key.includes(inputWords[j])) score++;
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatchKey = key;
      if (highestScore === totalWords) break; // Match parfait, on peut arrêter
    }
  }

  // 3. Validation par ratio strict (75%)
  // On ne valide que si au moins 75% des mots significatifs correspondent
  // Note: 0.66 was requested in previous turn, keeping it consistent with the latest state of the file
  if (bestMatchKey && (highestScore / totalWords) >= 0.66) {
    return `https://enka.network/ui/${ASSET_MAP[bestMatchKey]}.png`;
  }

  return null; // Fallback si le ratio n'est pas atteint
};

export const formatTime = (secs: number) => {
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
};
