import { useState, useEffect } from 'react';
import { SavedAudit } from '../types';
import { AuditResult } from '../types/ai-types';

export const useAuditFavorites = (currentUid: string) => {
  const [savedAudits, setSavedAudits] = useState<SavedAudit[]>([]);

  // Load favorites when UID changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = `genshin_audit_favorites_${currentUid || '000000000'}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setSavedAudits(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved audits", e);
          setSavedAudits([]);
        }
      } else {
        setSavedAudits([]);
      }
    }
  }, [currentUid]);

  const saveToStorage = (audits: SavedAudit[]) => {
    if (typeof window !== 'undefined') {
      const key = `genshin_audit_favorites_${currentUid || '000000000'}`;
      localStorage.setItem(key, JSON.stringify(audits));
      window.dispatchEvent(new Event('auditFavoritesChanged'));
    }
  };

  const addAudit = (characterName: string, avatarId: number, result: AuditResult, rawStats?: Record<string, any>) => {
    const newAudit: SavedAudit = {
      id: crypto.randomUUID(),
      characterName,
      avatarId,
      date: new Date().toISOString(),
      result,
      rawStats
    };

    // On filtre l'ancien s'il existe (écrasement)
    const filtered = savedAudits.filter(a => a.characterName !== characterName);
    const updated = [newAudit, ...filtered];
    
    setSavedAudits(updated);
    saveToStorage(updated);
  };

  const removeAudit = (id: string) => {
    const newAudits = savedAudits.filter(audit => audit.id !== id);
    setSavedAudits(newAudits);
    saveToStorage(newAudits);
  };

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const key = `genshin_audit_favorites_${currentUid || '000000000'}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setSavedAudits(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse saved audits", e);
        }
      } else {
        setSavedAudits([]);
      }
    };

    window.addEventListener('auditFavoritesChanged', handleStorageChange);
    return () => window.removeEventListener('auditFavoritesChanged', handleStorageChange);
  }, [currentUid]);

  const isAuditSaved = (characterName: string) => {
    // Check if we have a saved audit for this character
    // We might want to allow multiple audits per character (history), 
    // but for "favoriting" usually implies the latest or a specific one.
    // Let's check if ANY audit exists for this character name for now to toggle the button state.
    return savedAudits.some(audit => audit.characterName === characterName);
  };

  return {
    savedAudits,
    addAudit,
    removeAudit,
    isAuditSaved
  };
};
