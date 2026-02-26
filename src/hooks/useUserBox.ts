import { useState, useEffect, useCallback } from 'react';
import { UserBox, Character } from '../types';

export const useUserBox = (currentUid: string, initialCharacters: Character[]) => {
  const [userBox, setUserBox] = useState<UserBox>({});

  // Helper to get storage key
  const getStorageKey = (uid: string) => `genshin_box_${uid || '000000000'}`;

  // Load box when UID changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = getStorageKey(currentUid);
      const saved = localStorage.getItem(key);
      
      if (saved) {
        try {
          setUserBox(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse userBox", e);
          setUserBox({});
        }
      } else {
        // If no saved data for this UID, reset to empty
        // We could populate with initialCharacters if we wanted default values,
        // but {} is handled as "not owned/not built" by the UI.
        setUserBox({});
      }
    }
  }, [currentUid]);

  // Save box whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = getStorageKey(currentUid);
      localStorage.setItem(key, JSON.stringify(userBox));
    }
  }, [userBox, currentUid]);

  const toggleOwn = useCallback((id: string) => {
    setUserBox((prev) => {
      const currentState = prev[id] || { isOwned: false, isBuilt: false };
      const newIsOwned = !currentState.isOwned;
      
      // If un-owning, force built to false
      const newIsBuilt = newIsOwned ? currentState.isBuilt : false;

      return {
        ...prev,
        [id]: { isOwned: newIsOwned, isBuilt: newIsBuilt },
      };
    });
  }, []);

  const toggleBuild = useCallback((id: string) => {
    setUserBox((prev) => {
      const currentState = prev[id] || { isOwned: false, isBuilt: false };
      const newIsBuilt = !currentState.isBuilt;
      
      // If building (setting to true), force owned to true
      // If un-building (setting to false), keep owned status as is
      const newIsOwned = newIsBuilt ? true : currentState.isOwned;

      return {
        ...prev,
        [id]: { isOwned: newIsOwned, isBuilt: newIsBuilt },
      };
    });
  }, []);

  return {
    userBox,
    setUserBox,
    toggleOwn,
    toggleBuild
  };
};
