import React, { useState } from 'react';
import { DetailedCharacter, Character } from '../types';
import { Lock, User, Sparkles, AlertCircle, Loader2, CheckCircle2, XCircle, Target, Activity, Heart } from 'lucide-react';
import { AuditResult } from '../types/ai-types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis, Tooltip } from 'recharts';
import { useAuditFavorites } from '../hooks/useAuditFavorites';

interface AuditViewProps {
  uid: string;
  detailedRoster: DetailedCharacter[];
  characters: Character[];
  onOpenWelcomeModal: () => void;
  onAudit: (apiKey: string, characterName: string, equipList: any[], stats?: Record<string, any>, previousStats?: any) => void;
  auditResult: AuditResult | null;
  isAuditing: boolean;
  apiKey: string;
  error: string | null;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-sm">
        <p className="font-bold text-slate-200 mb-2">{data.subject}</p>
        <p className="text-fuchsia-400">Actuel : <span className="font-bold">{data.displayCurrent}</span></p>
        <p className="text-slate-400">Cible : <span className="font-bold">{data.displayTarget}</span></p>
      </div>
    );
  }
  return null;
};

const getHeatmapColor = (score: number) => {
  const s = Math.min(100, Math.max(0, score));
  if (s < 50) {
    const ratio = s / 50;
    const gb = Math.round(255 * ratio);
    return `rgb(255, ${gb}, ${gb})`; // Rouge vers Blanc
  } else {
    const ratio = (s - 50) / 50;
    const rb = Math.round(255 * (1 - ratio));
    return `rgb(${rb}, 255, ${rb})`; // Blanc vers Vert
  }
};

const AuditView: React.FC<AuditViewProps> = ({
  uid,
  detailedRoster,
  characters,
  onOpenWelcomeModal,
  onAudit,
  auditResult,
  isAuditing,
  apiKey,
  error
}) => {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const { addAudit, removeAudit, isAuditSaved, savedAudits } = useAuditFavorites(uid);
  const [shieldWarning, setShieldWarning] = useState<string | null>(null);
  const [isReplaced, setIsReplaced] = useState(false);

  const previousAudit = selectedChar ? savedAudits.find(a => a.characterName === selectedChar) : undefined;

  const handleAuditClick = () => {
    setShieldWarning(null); // Reset warning
    setIsReplaced(false); // Reset replaced state

    const character = detailedRoster.find(c => c.name === selectedChar);
    if (!character) return;

    if (previousAudit) {
      if (!previousAudit.rawStats || !character.stats) {
        // Ancienne sauvegarde sans stats : on avertit gentiment et on laisse passer
        setShieldWarning("⚠️ Ancienne sauvegarde détectée. Cette analyse va mettre à jour votre profil pour activer le comparateur.");
        onAudit(apiKey, character.name, character.equipList, character.stats);
        return;
      }

      // Vérification anti-gaspillage
      const keys = ['hp', 'atk', 'def', 'cr', 'cd', 'er', 'em'];
      const isIdentical = keys.every(key => character.stats?.[key] === previousAudit.rawStats?.[key]);

      if (isIdentical) {
        setShieldWarning("Bouclier activé : Vos statistiques n'ont pas évolué depuis le dernier audit sauvegardé. Améliorez vos artéfacts avant de relancer une analyse !");
        return; // On bloque l'appel réseau
      }
    }

    // Si on passe le bouclier (ou s'il n'y a pas d'ancien audit), on lance l'audit normal (Phase 1)
    onAudit(apiKey, character.name, character.equipList, character.stats, previousAudit?.rawStats);
  };

  const getCharacterIcon = (name: string) => {
    const char = characters.find(c => c.name.toLowerCase() === name.toLowerCase());
    return char ? char.icon : null;
  };

  const getCharacterElement = (name: string) => {
    const char = characters.find(c => c.name.toLowerCase() === name.toLowerCase());
    return char ? char.element : 'Anemo';
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'Pyro': return '#ef4444'; // red-500
      case 'Hydro': return '#3b82f6'; // blue-500
      case 'Dendro': return '#22c55e'; // green-500
      case 'Electro': return '#a855f7'; // purple-500
      case 'Anemo': return '#14b8a6'; // teal-500
      case 'Cryo': return '#06b6d4'; // cyan-500
      case 'Geo': return '#eab308'; // yellow-500
      default: return '#8b5cf6'; // violet-500
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('non build')) return 'bg-amber-700 text-white border-amber-600'; // Bronze
    if (s.includes('sans opti')) return 'bg-slate-400 text-slate-900 border-slate-300'; // Silver
    if (s.includes('perfectionnable')) return 'bg-yellow-500 text-yellow-950 border-yellow-400'; // Gold
    if (s.includes('parfaite') || s.includes('optimisé')) return 'bg-sky-400 text-sky-950 border-sky-300'; // Platinum/Blue
    return 'bg-slate-700 text-slate-300 border-slate-600';
  };

  const handleSaveAudit = () => {
    if (selectedChar && auditResult) {
      const char = detailedRoster.find(c => c.name === selectedChar);
      if (char) {
        // L'ID étant le nom du personnage, addAudit va naturellement écraser l'ancien
        // Note: addAudit generates a new ID but filters by characterName might be needed if we want strict replacement logic
        // But useAuditFavorites implementation of addAudit just prepends. 
        // To properly "replace", we should remove the old one first or update addAudit.
        // Given the current implementation of addAudit, let's remove the old one first to be clean.
        if (previousAudit) {
          removeAudit(previousAudit.id);
        }
        addAudit(char.name, char.avatarId, auditResult, char.stats);
        setIsReplaced(true);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      {error && (
        <div className="p-4 mb-6 text-red-400 bg-red-900/50 rounded-lg border border-red-500/50 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Character List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-purple-400" />
            Vos Personnages
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {detailedRoster.map((char) => (
              <div 
                key={char.avatarId}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                  selectedChar === char.name 
                    ? 'bg-purple-600/20 border-purple-500/50' 
                    : 'bg-slate-800/50 border-white/5 hover:bg-slate-800'
                }`}
                onClick={() => {
                  setSelectedChar(char.name);
                }}
              >
                <img 
                  src={getCharacterIcon(char.name) || ''} 
                  alt={char.name}
                  className="w-12 h-12 rounded-full bg-slate-900 object-cover border border-white/10"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-white">{char.name}</h4>
                  <p className="text-xs text-slate-400">Prêt pour l'audit</p>
                </div>
                {selectedChar === char.name && <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
              </div>
            ))}
          </div>
        </div>

        {/* Audit Area */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 min-h-[500px] backdrop-blur-sm relative overflow-hidden">
            {!selectedChar ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                <p>Sélectionnez un personnage à gauche pour commencer l'audit.</p>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex flex-col mb-6 border-b border-white/5 pb-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={getCharacterIcon(selectedChar) || ''} 
                        alt={selectedChar}
                        className="w-16 h-16 rounded-full bg-slate-900 object-cover border-2 border-purple-500/30"
                      />
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedChar}</h2>
                        <p className="text-sm text-slate-400">Analyse d'équipement par IA</p>
                      </div>
                    </div>
                  </div>

                  {shieldWarning && (
                    <div className={`w-full mb-4 p-3 rounded-lg text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
                      shieldWarning.includes('⚠️') 
                        ? 'bg-amber-900/40 border border-amber-500/50 text-amber-200' 
                        : 'bg-red-900/40 border border-red-500/50 text-red-200'
                    }`}>
                      <div className={`p-1.5 rounded-full ${
                        shieldWarning.includes('⚠️') ? 'bg-amber-500/20' : 'bg-red-500/20'
                      }`}>
                        {shieldWarning.includes('⚠️') ? <AlertCircle className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4 text-red-400" />}
                      </div>
                      {shieldWarning}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    {(auditResult || previousAudit) && (
                      <button
                        onClick={() => {
                          if (isAuditSaved(selectedChar)) {
                            const auditToRemove = savedAudits.find(a => a.characterName === selectedChar);
                            if (auditToRemove) {
                              removeAudit(auditToRemove.id);
                            }
                          } else {
                            handleSaveAudit();
                          }
                        }}
                        className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                          isAuditSaved(selectedChar)
                            ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/10'
                        }`}
                        title={isAuditSaved(selectedChar) ? "Retirer des favoris" : "Sauvegarder cet audit"}
                      >
                        <Heart className={`w-5 h-5 ${isAuditSaved(selectedChar) ? 'fill-current' : ''}`} />
                      </button>
                    )}
                    
                    <button
                      onClick={handleAuditClick}
                      disabled={isAuditing || !apiKey}
                      className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                        isAuditing || !apiKey
                          ? 'bg-slate-700 cursor-not-allowed text-slate-400 shadow-none'
                          : previousAudit
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-orange-900/50'
                            : 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-purple-900/50'
                      }`}
                    >
                      {isAuditing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyse...
                        </>
                      ) : (
                        <>
                          {previousAudit ? <Activity className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                          {previousAudit ? "Comparer l'évolution ⚔️" : "Lancer l'Audit"}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {!apiKey && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4 text-yellow-200 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Veuillez renseigner votre clé API Gemini dans la barre de navigation en haut pour utiliser cette fonction.
                  </div>
                )}

                <div className="flex-1 bg-slate-950/50 rounded-xl p-6 border border-white/5 overflow-y-auto">
                  {isAuditing ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-slate-400 animate-pulse">L'IA analyse vos artéfacts...</p>
                    </div>
                  ) : auditResult ? (
                    auditResult.isComparison ? (
                      // Comparison UI
                      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex justify-center">
                          <div className="text-xl font-bold text-amber-400 bg-amber-900/30 p-4 rounded-lg text-center border border-amber-500/30 shadow-lg shadow-amber-900/20">
                            {auditResult.tierProgression}
                          </div>
                        </div>

                        {auditResult.analysis && (
                          <p className="text-slate-300 italic text-center max-w-2xl mx-auto leading-relaxed">
                            "{auditResult.analysis}"
                          </p>
                        )}

                        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                          <h4 className="text-slate-300 font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                            <Activity className="w-4 h-4 text-purple-400" />
                            Bilan Comptable
                          </h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[...(auditResult.statDifferences || [])].sort((a: any, b: any) => {
                              const aImproved = a.diff.includes('+') ? 1 : 0;
                              const bImproved = b.diff.includes('+') ? 1 : 0;
                              if (aImproved !== bImproved) return bImproved - aImproved; // Les '+' d'abord
                              return b.perfectionScore - a.perfectionScore; // Ensuite les stats les plus importantes/élevées
                            }).map((diff: any, idx) => (
                              <li key={idx} className="bg-slate-950/50 p-3 rounded border border-slate-800 font-mono text-sm text-slate-300 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: getHeatmapColor(diff.perfectionScore) }}></div>
                                  <span className="font-bold text-slate-200">{diff.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-slate-500 line-through">{diff.oldVal}</span>
                                  <span className="text-slate-400">➡️</span>
                                  <span style={{ color: getHeatmapColor(diff.perfectionScore), fontWeight: 'bold' }}>{diff.newVal} ({diff.diff})</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {auditResult.verdict === 'KEEP' ? (
                          <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-xl p-6 text-center mt-6 shadow-lg shadow-emerald-900/20">
                            <div className="flex justify-center mb-3">
                              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">NOUVEAU BUILD VALIDÉ</h3>
                            <p className="text-emerald-200/80 mb-6">L'IA recommande de conserver ces changements.</p>
                            <button 
                              onClick={handleSaveAudit} 
                              disabled={isReplaced}
                              className={`mt-4 w-full flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-lg transition-all ${isReplaced ? 'bg-emerald-900/50 text-emerald-400 cursor-not-allowed border border-emerald-500/30' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'}`}
                            >
                              {isReplaced ? (
                                <>
                                  <Heart className="w-5 h-5 fill-emerald-400 text-emerald-400" />
                                  ✅ Remplacé avec succès !
                                </>
                              ) : (
                                <>
                                  <Heart className="w-5 h-5 text-red-500" />
                                  Remplacer l'ancien favori
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="bg-rose-900/20 border border-rose-500/50 rounded-xl p-6 text-center mt-6 shadow-lg shadow-rose-900/20">
                            <div className="flex justify-center mb-3">
                              <XCircle className="w-12 h-12 text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">RÉGRESSION DÉTECTÉE</h3>
                            <p className="text-rose-200/80">Votre ancien build était globalement meilleur. L'IA recommande de l'annuler.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Standard UI
                      <div className="space-y-8">
                        {/* Status Header */}
                        <div className="flex justify-center">
                          <span className={`px-6 py-2 rounded-full border font-bold text-sm uppercase tracking-wider shadow-lg ${getStatusColor(auditResult.status || '')}`}>
                            {auditResult.status}
                          </span>
                        </div>

                        {/* Radar Chart Section */}
                        {auditResult.chartData && (
                          <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
                            <h4 className="text-slate-300 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                              <Activity className="w-4 h-4 text-purple-400" />
                              Analyse Graphique
                            </h4>
                            <div className="h-[300px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={auditResult.chartData}>
                                  <PolarGrid stroke="#374151" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Radar
                                    name="Cible"
                                    dataKey="scoreTarget"
                                    stroke="#9ca3af"
                                    strokeOpacity={0.5}
                                    fill="#9ca3af"
                                    fillOpacity={0.1}
                                  />
                                  <Radar
                                    name="Actuel"
                                    dataKey="scoreCurrent"
                                    stroke={getElementColor(getCharacterElement(selectedChar || ''))}
                                    fill={getElementColor(getCharacterElement(selectedChar || ''))}
                                    fillOpacity={0.5}
                                  />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Positives */}
                          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
                            <h4 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5" />
                              Points Forts
                            </h4>
                            <ul className="space-y-2">
                              {auditResult.positives?.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                  <span className="text-emerald-500 mt-1">•</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Negatives */}
                          <div className="bg-rose-900/20 border border-rose-500/30 rounded-xl p-4">
                            <h4 className="text-rose-400 font-bold mb-3 flex items-center gap-2">
                              <XCircle className="w-5 h-5" />
                              Points Faibles
                            </h4>
                            <ul className="space-y-2">
                              {auditResult.negatives?.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                  <span className="text-rose-500 mt-1">•</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Priorities */}
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                          <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Actions Prioritaires
                          </h4>
                          <ul className="space-y-2">
                            {auditResult.priorities?.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="text-blue-500 font-bold min-w-[20px]">{idx + 1}.</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                      <p>Les résultats de l'audit apparaîtront ici.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditView;
