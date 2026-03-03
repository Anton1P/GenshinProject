import React, { useState, useEffect } from 'react';
import { Character, ElementType, UserBox } from './types';
import { fetchCharacters } from './services/api';
import FilterBar from './components/FilterBar';
import CharacterGrid from './components/CharacterGrid';
import AISection from './components/AISection';
import FavoritesView from './components/FavoritesView';
import AuditView from './components/AuditView';
import { WelcomeModal } from './components/WelcomeModal';
import { useGemini } from './hooks/useGemini';
import { useFavorites } from './hooks/useFavorites';
import { useAuditFavorites } from './hooks/useAuditFavorites';
import { useUID } from './hooks/useUID';
import { useUserBox } from './hooks/useUserBox';
import { useApiKey } from './hooks/useApiKey';
import { useModelSelector } from './hooks/useModelSelector';
import { Team, BuildResponse } from './types/ai-types';
import { TeamDetailsModal } from './components/TeamDetailsModal';
import { BuildDashboardModal } from './components/BuildDashboardModal';
import Header from './components/Header';
import RefreshButton from './components/RefreshButton';
import { Sparkles, Star, User, RefreshCw, Link, BrainCircuit } from 'lucide-react';

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filter, setFilter] = useState<ElementType | 'All'>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'generator' | 'favorites' | 'audit'>('generator');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedBuildChar, setSelectedBuildChar] = useState<Character | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Lifted hooks
  const { apiKey, setApiKey, isValidating, keyStatus } = useApiKey();
  const { selectedModel, setSelectedModel, availableModels, isLoadingModels } = useModelSelector(apiKey);
  const gemini = useGemini();
  const uidHook = useUID();
  const favorites = useFavorites(uidHook.uid);
  const { savedAudits, removeAudit } = useAuditFavorites(uidHook.uid);
  const { userBox, setUserBox, toggleOwn, toggleBuild } = useUserBox(uidHook.uid, characters);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchCharacters();
        setCharacters(data);
      } catch (error) {
        console.error('Failed to load characters', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Check if UID exists in localStorage on mount to hide modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUid = localStorage.getItem('genshin_uid');
      if (savedUid && savedUid.length === 9) {
        setShowWelcome(false);
      } else if (savedUid === '000000000') {
        setShowWelcome(false);
      }
    }
  }, []);

  const handleUIDSubmit = async (uid: string) => {
    // uidHook.setUid(uid) is handled inside loadProfile on success
    const detailedRoster = await uidHook.loadProfile(uid);

    if (detailedRoster) {
      // If guest mode (empty array returned), box remains empty (handled by hook reset).
      // If valid profile, fill box.

      if (detailedRoster.length > 0) {
        // We need to update the box for the NEW UID.
        // Since state updates are async, we can't rely on 'userBox' being the new one yet.
        // However, we can construct the new state and set it.
        // The hook will also try to load from storage, but our update should win or merge.

        // To be safe and robust: Read current storage for this UID, merge, and set.
        const storageKey = `genshin_box_${uid}`;
        const saved = localStorage.getItem(storageKey);
        const existingBox = saved ? JSON.parse(saved) : {};

        const newUserBox = { ...existingBox };

        detailedRoster.forEach(char => {
          // Find character ID by name
          const character = characters.find(c => c.name.toLowerCase() === char.name.toLowerCase());
          if (character) {
            newUserBox[character.id] = { isOwned: true, isBuilt: true };
          }
        });

        setUserBox(newUserBox);
      }

      setShowWelcome(false);
    }
  };

  const handleFilterSelect = (element: ElementType | 'All') => {
    if (filter === element) {
      setFilter('All');
    } else {
      setFilter(element);
    }
  };

  const filteredCharacters = characters.filter((char) => {
    if (filter === 'All') return true;
    return char.element === filter;
  });

  // Calculate stats
  const ownedCount = Object.values(userBox).filter((state: any) => state.isOwned).length;
  const builtCount = Object.values(userBox).filter((state: any) => state.isBuilt).length;

  // Modal handlers
  const onSelectTeam = (team: Team) => {
    setSelectedTeam(team);
    gemini.handleGetTeamDetails(apiKey, team, selectedModel);
  };

  const onCloseModal = () => {
    setSelectedTeam(null);
    gemini.clearTeamDetails();
  };

  const getCharacterIcon = (name: string) => {
    const char = characters.find(c => c.name.toLowerCase() === name.toLowerCase());
    return char ? char.icon : null;
  };

  const handleViewFavoriteBuild = async (team: Team, buildData?: BuildResponse) => {
    setSelectedTeam(team);
    if (buildData) {
      gemini.setTeamDetails(buildData);
    } else {
      // Generate build if missing and save it
      const details = await gemini.handleGetTeamDetails(apiKey, team, selectedModel);
      if (details) {
        favorites.saveBuildToTeam(team, details);
      }
    }
  };

  // Rank Badge Helper (lifted for reuse)
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 text-xs font-bold uppercase tracking-wider flex items-center gap-1">1er - Optimale</span>;
      case 2:
        return <span className="px-3 py-1 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/50 text-xs font-bold uppercase tracking-wider flex items-center gap-1">2ème - Excellente</span>;
      case 3:
        return <span className="px-3 py-1 rounded-full bg-orange-700/20 text-orange-400 border border-orange-700/50 text-xs font-bold uppercase tracking-wider flex items-center gap-1">3ème - Très bonne</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-blue-900/20 text-blue-300 border border-blue-900/50 text-xs font-bold uppercase tracking-wider flex items-center gap-1">4ème - Alternative</span>;
    }
  };

  const getRankBorder = (rank: number) => {
    switch (rank) {
      case 1: return "border-yellow-500/30 hover:border-yellow-500/60 bg-gradient-to-br from-slate-800/80 to-yellow-900/10";
      case 2: return "border-slate-400/30 hover:border-slate-400/60 bg-gradient-to-br from-slate-800/80 to-slate-700/10";
      case 3: return "border-orange-700/30 hover:border-orange-700/60 bg-gradient-to-br from-slate-800/80 to-orange-900/10";
      default: return "border-white/5 hover:border-purple-500/30 bg-slate-800/50";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500 selection:text-white pt-16 overflow-x-hidden">
      <Header
        builtCount={builtCount}
        ownedCount={ownedCount}
        totalCharacters={characters.length}
        uid={uidHook.uid}
        onOpenWelcomeModal={() => setShowWelcome(true)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        isValidating={isValidating}
        keyStatus={keyStatus}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        availableModels={availableModels}
        isLoadingModels={isLoadingModels}
      />

      <div className="w-full bg-slate-900/50 border-b border-slate-800 mb-8">
        <div className="max-w-7xl mx-auto">
          {/* Conteneur principal des filtres et du bouton avec marge réduite */}
          <div className="flex flex-col md:flex-row justify-between items-center w-full mb-6 gap-4 px-4">

            {/* Zone des filtres d'éléments (centrée sur mobile, à gauche sur desktop) */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 flex-1">
              <FilterBar selectedElement={filter} onSelectElement={handleFilterSelect} />
            </div>

            {/* Zone du Bouton Refresh (à droite) */}
            <div className="flex justify-end">
              <RefreshButton uid={uidHook.uid} onRefresh={uidHook.forceRefresh} isLoading={uidHook.isLoadingEnka} />
            </div>

          </div>
        </div>
      </div>

      <main className="pb-20 px-4 max-w-7xl mx-auto">
        <CharacterGrid
          characters={filteredCharacters}
          userBox={userBox}
          onToggleOwn={toggleOwn}
          onToggleBuild={toggleBuild}
          isLoading={loading}
          detailedRoster={uidHook.detailedRoster}
          onViewBuild={setSelectedBuildChar}
        />

        {!loading && characters.length > 0 && (
          <div className="mt-12">
            {/* Navigation Tabs */}
            <div className="flex justify-center mb-8 w-full">
              <div className="bg-slate-900/80 p-1 rounded-xl border border-white/10 flex flex-wrap justify-center gap-2 backdrop-blur-sm w-full md:w-auto">
                <button
                  onClick={() => setActiveTab('generator')}
                  className={`px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 flex-1 md:flex-none justify-center whitespace-nowrap ${activeTab === 'generator'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Générateur
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 flex-1 md:flex-none justify-center whitespace-nowrap ${activeTab === 'favorites'
                    ? 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Star className="w-4 h-4" />
                  Favoris
                  {(favorites.favorites.length + savedAudits.length) > 0 && (
                    <span className="ml-1 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {favorites.favorites.length + savedAudits.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 flex-1 md:flex-none justify-center whitespace-nowrap ${activeTab === 'audit'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <BrainCircuit className="w-4 h-4" />
                  Coach IA
                </button>
              </div>
            </div>

            {/* Views */}
            {activeTab === 'generator' ? (
              <AISection
                characters={characters}
                userBox={userBox}
                detailedRoster={uidHook.detailedRoster}
                apiKey={apiKey}
                // Pass hook values
                {...gemini}
                handleGenerateTeams={(q, b, o) => gemini.handleGenerateTeams(apiKey, q, b, o, selectedModel)}
                // Pass favorites values
                {...favorites}
                // Pass interaction handlers
                onSelectTeam={onSelectTeam}
                getRankBadge={getRankBadge}
                getRankBorder={getRankBorder}
              />
            ) : activeTab === 'favorites' ? (
              <FavoritesView
                favorites={favorites.favorites}
                savedAudits={savedAudits}
                characters={characters}
                onDeleteTeam={favorites.toggleFavoriteTeam}
                onDeleteAudit={removeAudit}
                onViewBuild={handleViewFavoriteBuild}
                getRankBadge={getRankBadge}
                getRankBorder={getRankBorder}
              />
            ) : (
              <AuditView
                uid={uidHook.uid}
                detailedRoster={uidHook.detailedRoster}
                characters={characters}
                onOpenWelcomeModal={() => setShowWelcome(true)}
                onAudit={(key, name, equips, stats, prev) => gemini.handleCharacterAudit(key, name, equips, stats, prev, selectedModel)}
                auditResult={gemini.auditResult}
                isAuditing={gemini.isAuditing}
                apiKey={apiKey}
                error={gemini.error}
              />
            )}
          </div>
        )}
      </main>

      {/* Shared Modal */}
      {selectedTeam && (
        <TeamDetailsModal
          selectedTeam={selectedTeam}
          teamDetails={gemini.teamDetails}
          isLoading={gemini.isLoadingDetails}
          loadingPhrase={gemini.modalLoadingPhrase}
          progress={gemini.modalProgress}
          onClose={onCloseModal}
          getCharacterIcon={getCharacterIcon}
          onSaveBuild={(build) => favorites.saveBuildToTeam(selectedTeam, build)}
          isBuildSaved={favorites.isBuildFavorited(selectedTeam.name)}
        />
      )}

      {selectedBuildChar && (
        <BuildDashboardModal
          character={selectedBuildChar}
          onClose={() => setSelectedBuildChar(null)}
        />
      )}

      {(gemini.isGenerating || gemini.isLoadingDetails) && <div className="fixed inset-0 z-[100] cursor-wait" aria-hidden="true" />}

      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        onSubmit={handleUIDSubmit}
        isLoading={uidHook.isLoadingEnka}
        error={uidHook.enkaError}
        initialUid={uidHook.uid}
      />
    </div>
  );
}

export default App;
