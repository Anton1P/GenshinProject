import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  uid: string;
  onRefresh: () => void;
  isLoading: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ uid, onRefresh, isLoading }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Si pas d'UID on ne fait rien
    if (!uid || uid === '000000000') return;

    const checkTime = () => {
      const expiration = localStorage.getItem(`enka_cooldown_${uid}`);
      if (expiration) {
        const remaining = Math.max(0, Math.ceil((parseInt(expiration) - Date.now()) / 1000));
        setTimeLeft(remaining);
      } else {
        setTimeLeft(0);
      }
    };

    // Vérification initiale
    checkTime();

    // Intervalle
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, [uid]);

  useEffect(() => {
    const handleRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.uid === uid) {
        const cooldown = 5 * 60 * 1000; // 5 minutes
        const expiration = Date.now() + cooldown;
        localStorage.setItem(`enka_cooldown_${uid}`, expiration.toString());
        setTimeLeft(300);
      }
    };

    window.addEventListener('enkaRefreshed', handleRefreshed);
    return () => window.removeEventListener('enkaRefreshed', handleRefreshed);
  }, [uid]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Masquer si pas d'UID (règle exécutée APRÈS les Hooks)
  if (!uid || uid === '000000000') {
    return null;
  }

  return (
    <button
      onClick={onRefresh}
      disabled={isLoading || timeLeft > 0 || uid === '999999999'}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm font-medium
        ${(isLoading || timeLeft > 0 || uid === '999999999') ? 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}
        ${uid === '999999999' ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-fuchsia-400' : ''}`} />
      <span className="hidden sm:inline">
        {isLoading ? 'Actualisation...' : timeLeft > 0 ? `Patientez ${formatTime(timeLeft)}` : 'Actualiser'}
      </span>
    </button>
  );
};

export default RefreshButton;
