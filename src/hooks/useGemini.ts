import { useState, useRef, useEffect } from 'react';
import { Team, TeamResponse, BuildResponse, AuditResult } from '../types/ai-types';
import { generateTeams, generateTeamDetails, generateCharacterAudit } from '../services/gemini';
import { LOADING_PHRASES } from '../constants/ai-section';

export const useGemini = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [teamsResult, setTeamsResult] = useState<TeamResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);
  const [seconds, setSeconds] = useState(0);
  const [progress, setProgress] = useState(0);

  const [teamDetails, setTeamDetails] = useState<BuildResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [buildsCache, setBuildsCache] = useState<Record<string, BuildResponse>>({});

  const [modalLoadingPhrase, setModalLoadingPhrase] = useState(LOADING_PHRASES[0]);
  const [modalProgress, setModalProgress] = useState(0);

  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Loading animation logic for main generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timer: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isGenerating) {
      setProgress(0);
      interval = setInterval(() => {
        setLoadingPhrase(prev => {
          const currentIndex = LOADING_PHRASES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_PHRASES.length;
          return LOADING_PHRASES[nextIndex];
        });
      }, 7000);

      timer = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);

      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          const remaining = 95 - prev;
          const increment = Math.random() * (remaining / 20) + 0.1;
          return Math.min(prev + increment, 95);
        });
      }, 200);

    } else {
      setSeconds(0);
      setLoadingPhrase(LOADING_PHRASES[0]);
      if (teamsResult) {
        setProgress(100);
      } else {
        setProgress(0);
      }
    }

    return () => {
      clearInterval(interval);
      clearInterval(timer);
      clearInterval(progressInterval);
    };
  }, [isGenerating, teamsResult]);

  // Loading animation logic for modal
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isLoadingDetails) {
      setModalProgress(0);
      interval = setInterval(() => {
        setModalLoadingPhrase(prev => {
          const currentIndex = LOADING_PHRASES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_PHRASES.length;
          return LOADING_PHRASES[nextIndex];
        });
      }, 7000);

      progressInterval = setInterval(() => {
        setModalProgress(prev => {
          if (prev >= 95) return prev;
          const remaining = 95 - prev;
          const increment = Math.random() * (remaining / 20) + 0.1;
          return Math.min(prev + increment, 95);
        });
      }, 200);

    } else {
      setModalLoadingPhrase(LOADING_PHRASES[0]);
      if (teamDetails) {
        setModalProgress(100);
      } else {
        setModalProgress(0);
      }
    }

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isLoadingDetails, teamDetails]);

  const handleGenerateTeams = async (apiKey: string, query: string, builtChars: string[], ownedChars: string[], model: string) => {
    setError(null);
    setTeamsResult(null);
    setBuildsCache({});

    if (!apiKey || !apiKey.trim()) {
      setError("Veuillez entrer une clé API Gemini dans le menu en haut.");
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `Agis en tant qu'expert Genshin Impact. Voici la requête du joueur : ${query}. Voici les personnages qu'il possède et qui sont bien optimisés : ${builtChars.join(', ')}. Voici les personnages possédés mais non optimisés : ${ownedChars.join(', ')}. Tu dois PROPOSER EXACTEMENT 4 ÉQUIPES, classées de la meilleure (1ère) à la moins bonne (4ème). Structure ton JSON ainsi : { "teams": [ { "rank": 1, "name": "...", "characters": ["Perso1", "Perso2", "Perso3", "Perso4"], "explanation": "...", "rotation": "..." }, ... ] }. Tu DOIS répondre UNIQUEMENT avec un objet JSON valide, sans markdown.`;

      const result = await generateTeams(apiKey, prompt, model);
      setTeamsResult(result);
    } catch (err: any) {
      console.error("Erreur lors de la génération:", err);
      setError(err.message || "Une erreur est survenue lors de la communication avec Gemini.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetTeamDetails = async (apiKey: string, team: Team, model: string) => {
    setError(null);
    setTeamDetails(null);

    if (buildsCache[team.name]) {
      setTeamDetails(buildsCache[team.name]);
      return;
    }

    if (!apiKey || !apiKey.trim()) {
      setError("Veuillez entrer une clé API Gemini dans le menu en haut.");
      return;
    }

    setIsLoadingDetails(true);

    try {
      const prompt = `Agis en tant qu'expert Genshin. Pour cette équipe nommée '${team.name}' composée de ${team.characters.join(', ')}, donne le build optimal pour chaque personnage. RÉPONDS INTÉGRALEMENT EN FRANÇAIS. Utilise STRICTEMENT les noms officiels français du jeu Genshin Impact pour les armes, les sets d'artéfacts et les statistiques (ex: 'Bâton de Homa', 'Emblème du destin brisé', 'Taux CRIT', 'Recharge d'Énergie'). N'utilise AUCUN terme en anglais. Tu dois fournir EXACTEMENT 4 options d'armes par personnage, classées de la plus performante à la moins performante. Tu peux proposer du 5★, du 4★, et même du 3★ si c'est très performant (ex: Pampille Blanche). Pour le paramètre 'type' des armes, utilise UNIQUEMENT ces mots-clés : 'Signature', 'Alternative payante', 'Craftable', 'Alternative', 'F2P'. Ajoute un champ 'explanation' (80 mots max) expliquant brièvement tes choix pour ce personnage. Structure JSON : { "builds": [ { "character": "...", "explanation": "...", "weapons": [ { "name": "...", "rarity": 5, "type": "Signature" }, ... ], "artifactSet": "...", "sands": "...", "goblet": "...", "circlet": "...", "substats": ["..."] } ] }. Tu DOIS répondre UNIQUEMENT avec un objet JSON valide, sans markdown.`;

      const details = await generateTeamDetails(apiKey, prompt, model);
      setTeamDetails(details);
      setBuildsCache(prev => ({ ...prev, [team.name]: details }));
      return details;
    } catch (err: any) {
      console.error("Erreur détails:", err);
      setError(err.message || "Erreur lors de la récupération des builds.");
      return null;
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const clearTeamDetails = () => {
    setTeamDetails(null);
  };

  const handleCharacterAudit = async (apiKey: string, characterName: string, equipList: any[], stats?: Record<string, any>, previousStats?: any, model?: string) => {
    setError(null);
    setIsAuditing(true);
    setAuditResult(null);

    if (!apiKey || !apiKey.trim()) {
      setError("Veuillez entrer une clé API Gemini dans le menu en haut.");
      setIsAuditing(false);
      return;
    }

    try {
      const result = await generateCharacterAudit(apiKey, characterName, equipList, stats, previousStats, model);
      setAuditResult(result);
    } catch (err: any) {
      console.error("Erreur audit:", err);
      setError(err.message || "Erreur lors de l'audit.");
    } finally {
      setIsAuditing(false);
    }
  };

  return {
    isGenerating,
    teamsResult,
    error,
    loadingPhrase,
    seconds,
    progress,
    teamDetails,
    setTeamDetails,
    isLoadingDetails,
    buildsCache,
    modalLoadingPhrase,
    modalProgress,
    handleGenerateTeams,
    handleGetTeamDetails,
    clearTeamDetails,
    auditResult,
    isAuditing,
    handleCharacterAudit
  };
};
