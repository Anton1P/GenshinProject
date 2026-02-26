import React, { useState } from 'react';
import { Loader2, AlertCircle, Download, User } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (uid: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  initialUid?: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
  initialUid = ''
}) => {
  const [uid, setUid] = useState(initialUid);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uid.length === 9) {
      onSubmit(uid);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
              <User className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-2">
            Bienvenue Voyageur
          </h2>
          
          <p className="text-slate-400 text-center text-sm mb-8 leading-relaxed">
            Saisissez votre UID pour importer automatiquement vos personnages bien équipés depuis votre vitrine en jeu.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="uid" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                UID Genshin Impact
              </label>
              <input
                id="uid"
                type="text"
                value={uid}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                  setUid(val);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-mono tracking-widest text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-slate-700"
                placeholder="700000000"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={uid.length !== 9 || isLoading}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                uid.length === 9 && !isLoading
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importation...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Importer ma vitrine
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => onSubmit('000000000')}
              disabled={isLoading}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors underline decoration-slate-700 hover:decoration-slate-500 underline-offset-4"
            >
              Ignorer et continuer en tant qu'invité
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
