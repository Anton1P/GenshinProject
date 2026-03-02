import { useState } from 'react';
import { fetchEnkaProfile, parseEnkaCharacters } from '../services/enka';
import { DetailedCharacter } from '../types';

export const useUID = () => {
  const [uid, setUid] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('genshin_uid') || '';
    }
    return '';
  });

  const [isLoadingEnka, setIsLoadingEnka] = useState(false);
  const [enkaError, setEnkaError] = useState<string | null>(null);
  const [detailedRoster, setDetailedRoster] = useState<DetailedCharacter[]>([]);

  const loadProfile = async (uidToLoad: string): Promise<DetailedCharacter[] | null> => {
    // Handle Guest Mode (000000000)
    if (uidToLoad === '000000000') {
      setUid('000000000');
      setDetailedRoster([]);
      setEnkaError(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('genshin_uid', '000000000');
      }
      return [];
    }

    // Backdoor for testing (Magic UID)
    if (uidToLoad === '999999999') {
      const debugRoster: DetailedCharacter[] = [
        {
          name: "Raiden Shogun",
          avatarId: 10000052,
          equipList: [
            { flat: { itemType: "ITEM_WEAPON", nameTextMapHash: "La Prise" }, weapon: { level: 90 } },
            { flat: { itemType: "ITEM_RELIQUARY", setNameTextMapHash: "Emblème du destin brisé", reliquaryMainstat: { mainPropId: "FIGHT_PROP_HP", statValue: 4780 }, reliquarySubstats: [{ appendPropId: "FIGHT_PROP_DEFENSE_PERCENT", statValue: 12.4 }, { appendPropId: "FIGHT_PROP_CRITICAL", statValue: 14.0 }, { appendPropId: "FIGHT_PROP_DEFENSE", statValue: 19 }, { appendPropId: "FIGHT_PROP_CRITICAL_HURT", statValue: 15.5 }] }, reliquary: { level: 21 } },
            { flat: { itemType: "ITEM_RELIQUARY", setNameTextMapHash: "Emblème du destin brisé", reliquaryMainstat: { mainPropId: "FIGHT_PROP_ATTACK", statValue: 311 }, reliquarySubstats: [{ appendPropId: "FIGHT_PROP_DEFENSE_PERCENT", statValue: 6.6 }, { appendPropId: "FIGHT_PROP_CRITICAL_HURT", statValue: 18.7 }, { appendPropId: "FIGHT_PROP_CRITICAL", statValue: 7.8 }, { appendPropId: "FIGHT_PROP_HP_PERCENT", statValue: 9.9 }] }, reliquary: { level: 21 } },
            { flat: { itemType: "ITEM_RELIQUARY", setNameTextMapHash: "Emblème du destin brisé", reliquaryMainstat: { mainPropId: "FIGHT_PROP_CHARGE_EFFICIENCY", statValue: 51.8 }, reliquarySubstats: [{ appendPropId: "FIGHT_PROP_CRITICAL", statValue: 3.9 }, { appendPropId: "FIGHT_PROP_CRITICAL_HURT", statValue: 17.9 }, { appendPropId: "FIGHT_PROP_DEFENSE", statValue: 37 }, { appendPropId: "FIGHT_PROP_ATTACK_PERCENT", statValue: 9.3 }] }, reliquary: { level: 21 } },
            { flat: { itemType: "ITEM_RELIQUARY", setNameTextMapHash: "Emblème du destin brisé", reliquaryMainstat: { mainPropId: "FIGHT_PROP_ELEC_ADD_HURT", statValue: 46.6 }, reliquarySubstats: [{ appendPropId: "FIGHT_PROP_CHARGE_EFFICIENCY", statValue: 17.5 }, { appendPropId: "FIGHT_PROP_HP_PERCENT", statValue: 4.1 }, { appendPropId: "FIGHT_PROP_CRITICAL_HURT", statValue: 12.4 }, { appendPropId: "FIGHT_PROP_CRITICAL", statValue: 7.0 }] }, reliquary: { level: 21 } },
            { flat: { itemType: "ITEM_RELIQUARY", setNameTextMapHash: "Emblème du destin brisé", reliquaryMainstat: { mainPropId: "FIGHT_PROP_CRITICAL", statValue: 31.1 }, reliquarySubstats: [{ appendPropId: "FIGHT_PROP_ATTACK_PERCENT", statValue: 9.9 }, { appendPropId: "FIGHT_PROP_CRITICAL_HURT", statValue: 18.7 }, { appendPropId: "FIGHT_PROP_HP", statValue: 538 }, { appendPropId: "FIGHT_PROP_DEFENSE_PERCENT", statValue: 13.1 }] }, reliquary: { level: 21 } }
          ],
          stats: {
            hp: 30000,
            atk: 2050,
            def: 650,
            cr: 100,
            cd: 374,
            er: 9.99,
            em: 0
          },
          weapon: {
            name: "La Prise",
            level: 90,
            rank: 4,
            refinement: 5,
            icon: "https://enka.network/ui/UI_EquipIcon_Pole_Mori.png",
            mainStat: { type: "FIGHT_PROP_CHARGE_EFFICIENCY", value: 45.9 },
            subStats: []
          },
          artifacts: [
            {
              equipType: "EQUIP_BRACER",
              level: 20,
              icon: "https://enka.network/ui/UI_RelicIcon_15020_4.png",
              mainStat: { type: "FIGHT_PROP_HP", value: 4780 },
              subStats: [
                { type: "FIGHT_PROP_CRITICAL", value: 3.9 },
                { type: "FIGHT_PROP_CRITICAL_HURT", value: 21.0 },
                { type: "FIGHT_PROP_ATTACK_PERCENT", value: 5.8 },
                { type: "FIGHT_PROP_ELEMENT_MASTERY", value: 23 }
              ]
            },
            {
              equipType: "EQUIP_NECKLACE",
              level: 20,
              icon: "https://enka.network/ui/UI_RelicIcon_15020_2.png",
              mainStat: { type: "FIGHT_PROP_ATTACK", value: 311 },
              subStats: [
                { type: "FIGHT_PROP_CRITICAL", value: 10.5 },
                { type: "FIGHT_PROP_CRITICAL_HURT", value: 14.0 },
                { type: "FIGHT_PROP_CHARGE_EFFICIENCY", value: 6.5 },
                { type: "FIGHT_PROP_HP_PERCENT", value: 4.1 }
              ]
            },
            {
              equipType: "EQUIP_SHOES",
              level: 20,
              icon: "https://enka.network/ui/UI_RelicIcon_15020_5.png",
              mainStat: { type: "FIGHT_PROP_CHARGE_EFFICIENCY", value: 51.8 },
              subStats: [
                { type: "FIGHT_PROP_CRITICAL", value: 7.0 },
                { type: "FIGHT_PROP_CRITICAL_HURT", value: 20.2 },
                { type: "FIGHT_PROP_ATTACK", value: 19 },
                { type: "FIGHT_PROP_DEFENSE_PERCENT", value: 12.4 }
              ]
            },
            {
              equipType: "EQUIP_RING",
              level: 20,
              icon: "https://enka.network/ui/UI_RelicIcon_15020_1.png",
              mainStat: { type: "FIGHT_PROP_ELEC_ADD_HURT", value: 46.6 },
              subStats: [
                { type: "FIGHT_PROP_CRITICAL", value: 10.1 },
                { type: "FIGHT_PROP_CRITICAL_HURT", value: 13.2 },
                { type: "FIGHT_PROP_ATTACK_PERCENT", value: 9.9 },
                { type: "FIGHT_PROP_CHARGE_EFFICIENCY", value: 4.5 }
              ]
            },
            {
              equipType: "EQUIP_DRESS",
              level: 20,
              icon: "https://enka.network/ui/UI_RelicIcon_15020_3.png",
              mainStat: { type: "FIGHT_PROP_CRITICAL", value: 31.1 },
              subStats: [
                { type: "FIGHT_PROP_CRITICAL_HURT", value: 28.0 },
                { type: "FIGHT_PROP_ATTACK_PERCENT", value: 5.3 },
                { type: "FIGHT_PROP_CHARGE_EFFICIENCY", value: 11.0 },
                { type: "FIGHT_PROP_DEFENSE", value: 39 }
              ]
            }
          ]
        }
      ];

      setDetailedRoster(debugRoster);
      setUid(uidToLoad);
      if (typeof window !== 'undefined') {
        localStorage.setItem('genshin_uid', uidToLoad);
      }
      setIsLoadingEnka(false);
      setEnkaError(null);

      return debugRoster;
    }

    if (!uidToLoad || uidToLoad.length < 9) {
      setEnkaError("L'UID doit contenir 9 chiffres.");
      return null;
    }

    setIsLoadingEnka(true);
    setEnkaError(null);
    setDetailedRoster([]);

    try {
      const data = await fetchEnkaProfile(uidToLoad);

      if (data.avatarInfoList) {
        const roster = parseEnkaCharacters(data.avatarInfoList);
        setDetailedRoster(roster);

        // Success: Save UID
        setUid(uidToLoad);
        if (typeof window !== 'undefined') {
          localStorage.setItem('genshin_uid', uidToLoad);
        }

        if (roster.length === 0) {
          setEnkaError("Aucun personnage 'bien buildé' trouvé dans la vitrine (Arme 70+ & 5 Artéfacts 20).");
        }
        return roster;
      } else {
        // Failure: Clear UID
        setUid('');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('genshin_uid');
        }
        setEnkaError("Aucun personnage trouvé dans la vitrine. Vérifiez qu'elle est publique.");
        return null;
      }
    } catch (err: any) {
      // Failure: Clear UID
      setUid('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('genshin_uid');
      }
      setEnkaError(err.message || "Erreur lors du chargement du profil.");
      return null;
    } finally {
      setIsLoadingEnka(false);
    }
  };

  const forceRefresh = async () => {
    if (!uid || uid === '999999999' || uid === '000000000') return;
    setIsLoadingEnka(true);
    setEnkaError(null);
    try {
      localStorage.removeItem(`genshin_data_${uid}`);
      await loadProfile(uid);
      // On déclenche un événement pour informer le bouton que le rafraîchissement a réussi
      window.dispatchEvent(new CustomEvent('enkaRefreshed', { detail: { uid } }));
    } catch (err) {
      setEnkaError("Erreur lors du rafraîchissement.");
    } finally {
      setIsLoadingEnka(false);
    }
  };

  return {
    uid,
    setUid,
    isLoadingEnka,
    enkaError,
    detailedRoster,
    loadProfile,
    forceRefresh
  };
};
