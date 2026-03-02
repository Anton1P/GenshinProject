import locData from '../data/loc_fr.json';

// Mapping temporaire des IDs vers les noms
// À compléter avec la liste exhaustive plus tard
export const ENKA_AVATAR_MAP: Record<number, string> = {
  10000002: "Kamisato Ayaka",
  10000003: "Jean",
  10000005: "Voyageuse",
  10000006: "Lisa",
  10000007: "Voyageuse",
  10000014: "Barbara",
  10000015: "Kaeya",
  10000016: "Diluc",
  10000020: "Razor",
  10000021: "Amber",
  10000022: "Venti",
  10000023: "Xiangling",
  10000024: "Beidou",
  10000025: "Xingqiu",
  10000026: "Xiao",
  10000027: "Ningguang",
  10000029: "Klee",
  10000030: "Zhongli",
  10000031: "Fischl",
  10000032: "Bennett",
  10000033: "Tartaglia",
  10000034: "Noëlle",
  10000035: "Qiqi",
  10000036: "Chongyun",
  10000037: "Ganyu",
  10000038: "Albedo",
  10000039: "Diona",
  10000041: "Mona",
  10000042: "Keqing",
  10000043: "Sucrose",
  10000044: "Xinyan",
  10000045: "Rosalia",
  10000046: "Hu Tao",
  10000047: "Kaedehara Kazuha",
  10000048: "Yanfei",
  10000049: "Yoimiya",
  10000050: "Thomas",
  10000051: "Eula",
  10000052: "Shogun Raiden",
  10000053: "Sayu",
  10000054: "Sangonomiya Kokomi",
  10000055: "Gorou",
  10000056: "Kujou Sara",
  10000057: "Arataki Itto",
  10000058: "Yae Miko",
  10000059: "Shikanoin Heizou",
  10000060: "Yelan",
  10000061: "Kirara",
  10000062: "Aloy",
  10000063: "Shenhe",
  10000064: "Yun Jin",
  10000065: "Kuki Shinobu",
  10000066: "Kamisato Ayato",
  10000067: "Collei",
  10000068: "Dori",
  10000069: "Tighnari",
  10000070: "Nilou",
  10000071: "Cyno",
  10000072: "Candace",
  10000073: "Nahida",
  10000074: "Layla",
  10000075: "Nomade",
  10000076: "Faruzan",
  10000077: "Yaoyao",
  10000078: "Alhaitham",
  10000079: "Dehya",
  10000080: "Mika",
  10000081: "Kaveh",
  10000082: "Baizhu",
  10000083: "Lynette",
  10000084: "Lyney",
  10000085: "Fréminet",
  10000086: "Wriothesley",
  10000087: "Neuvillette",
  10000088: "Charlotte",
  10000089: "Furina",
  10000090: "Chevreuse",
  10000091: "Navia",
  10000092: "Gaming",
  10000093: "Xianyun",
  10000094: "Chiori",
  10000095: "Sigewinne",
  10000096: "Arlecchino",
  10000097: "Sethos",
  10000098: "Clorinde",
  10000099: "Émilie",
  10000100: "Kachina",
  10000101: "Kinich",
  10000102: "Mualani",
  10000103: "Xilonen",
  10000104: "Chasca",
  10000105: "Ororon",
  10000106: "Mavuika",
  10000107: "Citlali",
  10000108: "Lan Yan",
  10000109: "Yumemizuki Mizuki",
  10000110: "Iansan",
  10000111: "Varesa",
  10000112: "Escoffier",
  10000113: "Ifa",
  10000114: "Skirk",
  10000115: "Dahlia",
  10000116: "Ineffa",
  10000119: "Lauma",
  10000120: "Flins",
  10000121: "Aino",
  10000122: "Nefer",
  10000123: "Durin",
  10000124: "Jahoda",
  10000125: "Columbina",
  10000901: "Mavuika (Essai)",
  10000902: "Hu Tao (essai)",
  10000904: "Columbina",
};

interface EnkaResponse {
  playerInfo: any;
  avatarInfoList?: any[];
  ttl?: number;
}

export const fetchEnkaProfile = async (uid: string): Promise<EnkaResponse> => {
  if (!uid || uid.length < 9) {
    throw new Error("UID invalide");
  }

  // Appel via le proxy local Vite pour éviter les erreurs CORS
  const url = `/api/enka/api/uid/${uid}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 400 || response.status === 404) {
        throw new Error("UID_NOT_FOUND");
      }
      throw new Error(`HTTP_ERROR_${response.status}`);
    }

    const data = await response.json();

    if (!data.playerInfo) {
      throw new Error("Données de profil invalides ou vitrine vide.");
    }

    return data;
  } catch (error: any) {
    // Si l'erreur est explicitement "UID introuvable", on la remonte à l'UI
    if (error.message === "UID_NOT_FOUND" || error.message?.includes("404")) {
      throw new Error("Joueur introuvable ou vitrine cachée. Vérifiez que l'option 'Afficher les détails' est activée en jeu.");
    }

    // Erreur stricte pour tout problème réseau
    throw new Error(error.message || "Impossible de joindre Enka.Network. Veuillez réessayer.");
  }
};

import { DetailedCharacter } from '../types';

export const parseEnkaCharacters = (avatarInfoList: any[]): DetailedCharacter[] => {
  if (!Array.isArray(avatarInfoList)) return [];

  const validatedCharacters: DetailedCharacter[] = [];

  for (const avatar of avatarInfoList) {
    const avatarId = Number(avatar.avatarId);
    const equipList = avatar.equipList;

    if (!Array.isArray(equipList)) continue;

    // Aucune restriction : on importe tous les personnages de la vitrine
    const name = ENKA_AVATAR_MAP[avatarId];

    // Dé-doublonnage : si on a déjà un personnage de ce nom, on passe au suivant
    if (name && !validatedCharacters.some(c => c.name === name)) {
      const stats = avatar.fightPropMap ? {
        hp: avatar.fightPropMap[2000],
        atk: avatar.fightPropMap[2001],
        def: avatar.fightPropMap[2002],
        cr: avatar.fightPropMap[20],
        cd: avatar.fightPropMap[22],
        er: avatar.fightPropMap[23],
        em: avatar.fightPropMap[28] || 0
      } : undefined;

      let weaponData = undefined;
      const artifactsData: any[] = [];

      if (avatar.equipList) {
        avatar.equipList.forEach((equip: any) => {
          const flat = equip.flat;
          if (!flat) return;

          // ... (in the mapping loop)
          if (flat.itemType === 'ITEM_WEAPON') {

            // Refinement formula: find the first value in affixMap and add 1 (since 0-based in game files usually, or exact value provided by Enka)
            // Enka usually provides the promoteLevel as well. affixMap contains the exact refinement (0 = R1)
            let refinement = 1;
            if (equip.weapon?.affixMap) {
              const affixValues = Object.values(equip.weapon.affixMap);
              if (affixValues.length > 0) {
                refinement = (affixValues[0] as number) + 1;
              }
            }

            weaponData = {
              name: (locData as any)[flat.nameTextMapHash] || flat.nameTextMapHash.toString(),
              level: equip.weapon?.level || 1,
              rank: flat.rankLevel || 5,
              refinement: refinement,
              icon: `https://enka.network/ui/${flat.icon}.png`,
              mainStat: flat.weaponStats?.[0] ? { type: flat.weaponStats[0].appendPropId, value: flat.weaponStats[0].statValue } : undefined,
              subStats: flat.weaponStats?.slice(1).map((s: any) => ({ type: s.appendPropId, value: s.statValue })) || []
            };
          } else if (flat.itemType === 'ITEM_RELIQUARY') {
            artifactsData.push({
              equipType: flat.equipType,
              level: equip.reliquary?.level || 1,
              icon: `https://enka.network/ui/${flat.icon}.png`,
              mainStat: flat.reliquaryMainstat ? { type: flat.reliquaryMainstat.mainPropId, value: flat.reliquaryMainstat.statValue } : { type: '', value: 0 },
              subStats: flat.reliquarySubstats?.map((s: any) => ({ type: s.appendPropId, value: s.statValue })) || []
            });
          }
        });
      }

      validatedCharacters.push({
        name,
        avatarId,
        equipList,
        stats,
        weapon: weaponData,
        artifacts: artifactsData
      });
    } else {
      console.warn("⚠️ Personnage importé mais ID manquant dans le dictionnaire :", avatarId);
    }
  }

  return validatedCharacters;
};
