import { GoogleGenAI } from "@google/genai";
import { TeamResponse, BuildResponse, AuditResult } from "../types/ai-types";

const handleGeminiError = (error: any): never => {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (
    errorMessage.includes('429') || 
    errorMessage.includes('quota') || 
    errorMessage.includes('too many requests') || 
    errorMessage.includes('rate limit')
  ) {
    throw new Error("L'IA de Teyvat doit se reposer quelques secondes. Veuillez patienter avant de relancer une analyse.");
  }
  
  throw error;
};

export const generateTeams = async (apiKey: string, prompt: string): Promise<TeamResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Aucune réponse reçue de l'IA.");
    }

    return JSON.parse(responseText) as TeamResponse;
  } catch (error) {
    handleGeminiError(error);
  }
};

export const generateTeamDetails = async (apiKey: string, prompt: string): Promise<BuildResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Pas de réponse pour les détails.");
    }

    return JSON.parse(responseText) as BuildResponse;
  } catch (error) {
    handleGeminiError(error);
    throw error;
  }
};

export const formatEquipForAI = (equipList: any[], stats?: Record<string, any>) => {
  const equipText = equipList.map(equip => {
    const flat = equip.flat;
    if (!flat) return null;
    
    if (flat.itemType === "ITEM_WEAPON") {
      return `Arme: ${flat.nameTextMapHash} (Lvl ${equip.weapon?.level})`;
    } else if (flat.itemType === "ITEM_RELIQUARY") {
      const level = equip.reliquary?.level ? equip.reliquary.level - 1 : 0;
      return `Artéfact: ${flat.setNameTextMapHash} (${flat.equipType}) Lvl ${level} - Main: ${flat.reliquaryMainstat?.mainPropId} - Subs: ${flat.reliquarySubstats?.map((s: any) => s.appendPropId).join(', ')}`;
    }
    return null;
  }).filter(Boolean).join('; ');

  let statsText = "";
  if (stats) {
    statsText = `STATS: PV: ${Math.round(stats.hp)}, ATQ: ${Math.round(stats.atk)}, DEF: ${Math.round(stats.def)}, Taux Crit: ${(stats.cr * 100).toFixed(1)}%, Dégâts Crit: ${(stats.cd * 100).toFixed(1)}%, Recharge: ${(stats.er * 100).toFixed(1)}%, Maîtrise: ${Math.round(stats.em)}`;
  }

  return `${equipText}. ${statsText}`;
};

export const generateCharacterAudit = async (apiKey: string, characterName: string, equipList: any[], stats?: Record<string, any>, previousStats?: any): Promise<AuditResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const formattedData = formatEquipForAI(equipList, stats);
    
    let prompt;

    if (previousStats) {
      // Prompt de comparaison
      prompt = `Tu es un expert theorycrafter Genshin. L'utilisateur veut comparer son NOUVEAU build avec son ANCIEN pour ${characterName}.
    ANCIENNES STATS : ${JSON.stringify(previousStats)}
    NOUVELLES STATS : ${JSON.stringify(stats)}
    DÉTAILS DU NOUVEAU BUILD : ${formattedData}

    Analyse la différence. Tu DOIS répondre UNIQUEMENT avec ce JSON valide et strict :
    {
      "isComparison": true,
      "tierProgression": "ex: Argent 🥈 ➡️ Platine 💎",
      "statDifferences": [
        { 
          "name": "Taux Crit", "oldVal": "68.8%", "newVal": "75.5%", 
          "diff": "+6.7%", 
          "perfectionScore": 85 
        }
      ],
      "analysis": "Explication courte du compromis (ex: Tu as sacrifié de la Recharge pour du Dégât, c'est rentable).",
      "verdict": "KEEP", // ou "REVERT" si c'est une régression
      "status": "Un des 4 tiers exacts : 'Non build', 'Build sans opti', 'Build perfectionnable', 'Parfaite'",
      "chartData": [
        { 
          "subject": "Stat pertinente 1", 
          "scoreCurrent": 90, 
          "scoreTarget": 100, 
          "displayCurrent": "267%", 
          "displayTarget": "250-270%" 
        }
      ],
      "positives": ["Point fort court 1", "..."],
      "negatives": ["Point faible court 1", "..."],
      "priorities": ["Action chiffrée 1", "..."]
    }
    
    Règles :
    1. "verdict" doit être "KEEP" (Garder le nouveau) ou "REVERT" (Revenir à l'ancien).
    2. Sois précis sur les différences de stats.
    3. perfectionScore est une note sur 100 de la NOUVELLE statistique par rapport au potentiel maximum du personnage.
    4. Génère aussi chartData, positives, negatives et priorities comme pour un audit normal, car cela servira de nouvelle sauvegarde.`;
    } else {
      // Prompt classique (Audit)
      prompt = `Tu es un expert theorycrafter Genshin Impact. Analyse l'équipement de ${characterName} : ${formattedData}.

VOICI LES STATISTIQUES FINALES EXACTES DU PERSONNAGE (Section STATS).
RÈGLE ABSOLUE : Tu ne DOIS PAS calculer les statistiques toi-même. Utilise UNIQUEMENT les valeurs finales fournies dans la section STATS.
Pour l'ATQ, les PV et la DEF, affiche toujours une valeur numérique brute entière (ex: 1321), JAMAIS de pourcentage.
Reprends exactement ces valeurs pour la clé 'displayCurrent' de ton JSON.

Tu DOIS répondre UNIQUEMENT avec un objet JSON valide suivant cette structure stricte :

{
  "status": "Un des 4 tiers exacts : 'Non build', 'Build sans opti', 'Build perfectionnable', 'Parfaite'",
  "positives": ["Point fort court 1", "..."],
  "negatives": ["Point faible court 1", "..."],
  "priorities": ["Action chiffrée 1 (ex: Viser 65% TC / 130% DC)", "Action chiffrée 2 (ex: Monter ER vers 270%)"],
  "chartData": [
    { 
      "subject": "Stat pertinente 1 (ex: Recharge d'Énergie)", 
      "scoreCurrent": 90, 
      "scoreTarget": 100, 
      "displayCurrent": "267%", 
      "displayTarget": "250-270%" 
    },
    { "subject": "Stat pertinente 2", "scoreCurrent": 70, "scoreTarget": 90, "displayCurrent": "...", "displayTarget": "..." },
    { "subject": "Stat pertinente 3", "scoreCurrent": 50, "scoreTarget": 80, "displayCurrent": "...", "displayTarget": "..." },
    { "subject": "Stat pertinente 4", "scoreCurrent": 80, "scoreTarget": 95, "displayCurrent": "...", "displayTarget": "..." },
    { "subject": "Stat pertinente 5", "scoreCurrent": 60, "scoreTarget": 85, "displayCurrent": "...", "displayTarget": "..." }
  ]
}
Règles : 
1. Choisis les 5 statistiques les plus IMPORTANTES pour ce personnage spécifique (ex: pas d'EM pour Raiden sauf si Hyperbloom).
2. 'scoreCurrent' et 'scoreTarget' sont des notes sur 100 pour tracer le graphique.
3. 'displayCurrent' et 'displayTarget' sont les VRAIES valeurs textuelles à afficher à l'utilisateur.
4. Sois sévère mais juste sur les scores.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Pas de réponse de l'audit.");
    }

    return JSON.parse(responseText) as AuditResult;
  } catch (error) {
    handleGeminiError(error);
    throw error;
  }
};
