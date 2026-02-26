import React, { useState } from 'react';
import { RefreshCw, User, Link, Key, Menu, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface HeaderProps {
  builtCount: number;
  ownedCount: number;
  totalCharacters: number;
  uid: string;
  onOpenWelcomeModal: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  isValidating: boolean;
  keyStatus: 'idle' | 'valid' | 'invalid';
}

const Header: React.FC<HeaderProps> = ({ 
  builtCount, 
  ownedCount, 
  totalCharacters, 
  uid, 
  onOpenWelcomeModal,
  apiKey,
  setApiKey,
  isValidating,
  keyStatus
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getKeyInputClass = () => {
    if (keyStatus === 'valid') return 'border-green-500/50 focus:border-green-500';
    if (keyStatus === 'invalid') return 'border-red-500/50 focus:border-red-500';
    return 'border-white/10 focus:border-purple-500/50';
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo / Title */}
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex-shrink-0">
            Genshin Theorycraft Box
          </h1>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
            {/* Stats */}
            <div className="flex gap-4 text-xs sm:text-sm text-slate-400 font-mono bg-slate-800/50 px-4 py-2 rounded-full border border-white/5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                Build: <span className="text-white font-bold">{builtCount}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Box: <span className="text-white font-bold">{ownedCount}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                Jeu: <span className="text-white font-bold">{totalCharacters}</span>
              </span>
            </div>

            {/* API Key Input */}
            <div className="relative w-48 lg:w-64">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="password"
                placeholder="Clé Gemini API..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={`w-full bg-slate-950 border rounded-lg py-1.5 pl-9 pr-8 text-xs focus:outline-none transition-all text-slate-300 ${getKeyInputClass()}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValidating ? (
                  <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                ) : keyStatus === 'valid' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                ) : keyStatus === 'invalid' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                ) : null}
              </div>
            </div>

            {/* UID Button */}
            <button
              onClick={onOpenWelcomeModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex-shrink-0"
            >
              {uid && uid !== '000000000' ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span className="font-mono text-xs">UID: {uid}</span>
                </>
              ) : uid === '000000000' ? (
                <>
                  <User className="w-4 h-4" />
                  <span className="font-medium text-xs">Invité</span>
                </>
              ) : (
                <>
                  <Link className="w-4 h-4" />
                  Lier
                </>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-800 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
            {/* Stats */}
            <div className="flex justify-between text-xs text-slate-400 font-mono bg-slate-800/50 px-4 py-3 rounded-lg border border-white/5">
              <span className="flex flex-col items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <span>Build: <strong className="text-white">{builtCount}</strong></span>
              </span>
              <span className="flex flex-col items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Box: <strong className="text-white">{ownedCount}</strong></span>
              </span>
              <span className="flex flex-col items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span>Jeu: <strong className="text-white">{totalCharacters}</strong></span>
              </span>
            </div>

            {/* API Key Input */}
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="password"
                placeholder="Clé Gemini API..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={`w-full bg-slate-950 border rounded-lg py-2.5 pl-9 pr-8 text-sm focus:outline-none transition-all text-slate-300 ${getKeyInputClass()}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValidating ? (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                ) : keyStatus === 'valid' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : keyStatus === 'invalid' ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : null}
              </div>
            </div>

            {/* UID Button */}
            <button
              onClick={() => {
                onOpenWelcomeModal();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-white/5 transition-all"
            >
              {uid && uid !== '000000000' ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span className="font-mono">Gérer UID: {uid}</span>
                </>
              ) : uid === '000000000' ? (
                <>
                  <User className="w-4 h-4" />
                  <span>Mode Invité (Se connecter)</span>
                </>
              ) : (
                <>
                  <Link className="w-4 h-4" />
                  Lier mon compte Genshin
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
