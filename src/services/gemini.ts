import { GoogleGenAI } from "@google/genai";
import { TeamResponse, BuildResponse, AuditResult } from "../types/ai-types";
import { extractContextForCharacters } from "./rag-service";

export interface ModelInfo {
  id: string;
  name: string;
}

export const fetchAvailableModels = async (apiKey: string): Promise<ModelInfo[]> => {
  const BLACKLIST = ['tts', 'audio', 'vision', 'image', 'nano banana', 'exp', 'preview', 'embedding', 'aqa', 'bisheng'];
  const WHITELIST_IDS = ['gemini-3-flash-preview']; // Bypass blacklist for these exact IDs

  /** Performance tier score — higher = better model */
  const getModelScore = (id: string): number => {
    const lower = id.toLowerCase();
    // Gemini 3 Flash family (top tier)
    if (lower.includes('gemini-3') && lower.includes('flash') && !lower.includes('lite')) return 900;
    // Gemini 2.5 Flash
    if (lower.includes('2.5') && lower.includes('flash') && !lower.includes('lite')) return 800;
    // Gemini 2.0 Flash
    if (lower.includes('2.0') && lower.includes('flash') && !lower.includes('lite')) return 700;
    // Gemini 1.5 Flash
    if (lower.includes('1.5') && lower.includes('flash') && !lower.includes('lite')) return 600;
    // Flash Lite (any version)
    if (lower.includes('flash') && lower.includes('lite')) return 500;
    // Gemma 3 27B
    if (lower.includes('gemma') && lower.includes('27b')) return 400;
    // Gemma 3 12B
    if (lower.includes('gemma') && lower.includes('12b')) return 350;
    // Gemma 3 4B
    if (lower.includes('gemma') && lower.includes('4b')) return 300;
    // Gemma 3 1B/2B
    if (lower.includes('gemma') && (lower.includes('1b') || lower.includes('2b'))) return 200;
    // Gemma other
    if (lower.includes('gemma')) return 250;
    // Generic flash
    if (lower.includes('flash')) return 550;
    return 100;
  };

  /** Clean up display name for UI */
  const cleanDisplayName = (name: string, id: string): string => {
    // Special rename for whitelisted preview models
    if (id.includes('gemini-3-flash-preview')) return 'Gemini 3 Flash';
    return name
      .replace(/-latest$/i, '')
      .replace(/\s*latest$/i, '')
      .replace(/[-\s]?001$/i, '')
      .replace(/[-\s]?002$/i, '')
      .trim();
  };

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) throw new Error('Failed to fetch models');
    const data = await res.json();

    const result = (data.models || [])
      .filter((m: any) => {
        if (!m.supportedGenerationMethods?.includes('generateContent')) return false;
        const id = (m.name || '').replace('models/', '').toLowerCase();
        // Absolute whitelist bypass — skip all other checks
        if (WHITELIST_IDS.some(wl => id === wl)) return true;
        // Whitelist: must be flash, lite, or gemma
        const isAllowed = id.includes('flash') || id.includes('lite') || id.includes('gemma');
        if (!isAllowed) return false;
        // Blacklist: reject any model containing banned keywords
        if (BLACKLIST.some(term => id.includes(term))) return false;
        // Exclude pro/ultra
        if (id.includes('pro') || id.includes('ultra')) return false;
        return true;
      })
      .map((m: any) => {
        const modelId = m.name.replace('models/', '');
        return {
          id: modelId,
          name: cleanDisplayName(m.displayName || modelId, modelId),
        };
      })
      // Deduplicate by cleaned name (keep highest-scoring variant)
      .reduce((acc: ModelInfo[], model: ModelInfo) => {
        const existing = acc.find(m => m.name === model.name && m.id !== model.id);
        if (!existing) {
          acc.push(model);
        } else if (getModelScore(model.id) > getModelScore(existing.id)) {
          const idx = acc.indexOf(existing);
          acc[idx] = model;
        }
        return acc;
      }, [] as ModelInfo[])
      .sort((a: ModelInfo, b: ModelInfo) => getModelScore(b.id) - getModelScore(a.id));

    return result;
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};

/** Robust JSON extractor — handles markdown fences, conversational wrappers, etc. */
const extractValidJson = (rawText: string): string => {
  // 1. Try direct parse after stripping markdown fences
  try {
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // 2. Fallback: extract the first JSON object or array via regex
    const match = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      return match[0];
    }
    throw new Error("Impossible de trouver un JSON valide dans la réponse de l'IA.");
  }
};

const handleGeminiError = (error: any): never => {
  const errorMessage = error?.message?.toLowerCase() || '';

  if (
    errorMessage.includes('503') ||
    errorMessage.includes('unavailable') ||
    errorMessage.includes('high demand') ||
    errorMessage.includes('overloaded')
  ) {
    throw new Error("Les serveurs de Google sont actuellement surchargés (Erreur 503). Le problème vient de leur côté, veuillez patienter quelques minutes avant de réessayer.");
  }

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

export const generateTeams = async (apiKey: string, prompt: string, model: string): Promise<TeamResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey });

    const isGemini = model.toLowerCase().includes('gemini');

    // RAG: Augment prompt with official character data
    const ragContext = extractContextForCharacters(prompt);
    let finalPrompt = prompt;
    if (ragContext) {
      finalPrompt += `\n\n--- INSTRUCTIONS SYSTÈME DE VÉRITÉ ABSOLUE ---\nVoici les données mathématiques et mécaniques officielles extraites du jeu pour les personnages concernés. Tu DOIS baser ton theorycrafting strictement sur ces informations (Ne pas inventer de mécaniques) :\n\n${ragContext}`;
    }

    const response = await ai.models.generateContent({
      model,
      contents: finalPrompt,
      config: {
        ...(isGemini && { responseMimeType: "application/json" }),
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Aucune réponse reçue de l'IA.");
    }

    console.log("🤖 [generateTeams] RAW AI RESPONSE:", responseText.slice(0, 300));
    const safeJson = extractValidJson(responseText);
    return JSON.parse(safeJson) as TeamResponse;
  } catch (error) {
    handleGeminiError(error);
  }
};

export const generateTeamDetails = async (apiKey: string, prompt: string, model: string): Promise<BuildResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey });

    const isGemini = model.toLowerCase().includes('gemini');

    // RAG: Augment prompt with official character data
    const ragContext = extractContextForCharacters(prompt);
    let finalPrompt = prompt;
    if (ragContext) {
      finalPrompt += `\n\n--- INSTRUCTIONS SYSTÈME DE VÉRITÉ ABSOLUE ---\nVoici les données mathématiques et mécaniques officielles extraites du jeu pour les personnages concernés. Tu DOIS baser ton theorycrafting strictement sur ces informations (Ne pas inventer de mécaniques) :\n\n${ragContext}`;
    }
    finalPrompt += `\n\nRÈGLE ABSOLUE : Tu DOIS répondre UNIQUEMENT avec l'objet JSON. N'écris AUCUN texte avant, AUCUN texte après. Ton premier caractère doit être '{' et ton dernier '}'.`;

    const response = await ai.models.generateContent({
      model,
      contents: finalPrompt,
      config: {
        ...(isGemini && { responseMimeType: "application/json" }),
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Pas de réponse pour les détails.");
    }

    console.log("🤖 [generateTeamDetails] RAW AI RESPONSE:", responseText.slice(0, 300));
    const safeJson = extractValidJson(responseText);
    return JSON.parse(safeJson) as BuildResponse;
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

export const generateCharacterAudit = async (apiKey: string, characterName: string, equipList: any[], stats?: Record<string, any>, previousStats?: any, model?: string): Promise<AuditResult> => {
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

    const effectiveModel = model || 'gemini-2.5-flash';
    const isGemini = effectiveModel.toLowerCase().includes('gemini');

    const response = await ai.models.generateContent({
      model: effectiveModel,
      contents: prompt,
      config: {
        ...(isGemini && { responseMimeType: "application/json" }),
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Pas de réponse de l'audit.");
    }

    console.log("🤖 [generateCharacterAudit] RAW AI RESPONSE:", responseText.slice(0, 300));
    const safeJson = extractValidJson(responseText);
    return JSON.parse(safeJson) as AuditResult;
  } catch (error) {
    handleGeminiError(error);
    throw error;
  }
};
