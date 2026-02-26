// Mapping temporaire des IDs vers les noms
// À compléter avec la liste exhaustive plus tard
export const ENKA_AVATAR_MAP: Record<number, string> = {
  10000002: "Kamisato Ayaka",
  10000003: "Jean",
  10000005: "Voyageur",
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
  10000034: "Noelle",
  10000035: "Qiqi",
  10000036: "Chongyun",
  10000037: "Ganyu",
  10000038: "Albedo",
  10000039: "Diona",
  10000041: "Mona",
  10000042: "Keqing",
  10000043: "Sucrose",
  10000044: "Xinyan",
  10000045: "Rosaria",
  10000046: "Hu Tao",
  10000047: "Kaedehara Kazuha",
  10000048: "Yanfei",
  10000049: "Yoimiya",
  10000050: "Thoma",
  10000051: "Eula",
  10000052: "Raiden Shogun",
  10000053: "Sayu",
  10000054: "Sangonomiya Kokomi",
  10000055: "Gorou",
  10000056: "Kujou Sara",
  10000057: "Arataki Itto",
  10000058: "Yae Miko",
  10000059: "Shikanoin Heizou",
  10000060: "Yelan",
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
  10000083: "Kirara",
  10000084: "Lyney",
  10000085: "Lynette",
  10000086: "Freminet",
  10000087: "Wriothesley",
  10000088: "Neuvillette",
  10000089: "Navia",
  10000090: "Chevreuse",
  10000091: "Gaming",
  10000092: "Xianyun",
  10000093: "Chiori",
  10000094: "Arlecchino",
  10000095: "Sethos",
  10000096: "Clorinde",
  10000097: "Sigewinne",
  10000098: "Emilie",
  10000099: "Mualani",
  10000100: "Kachina",
  10000101: "Kinich",
  10000102: "Xilonen",
  10000103: "Chasca",
  10000104: "Ororon",
  10000105: "Mavuika",
  10000106: "Citlali",
  10000116: "Emilie", // ID alternatif
  10000121: "Kachina", // ID alternatif
  10000125: "Mualani" // ID alternatif
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

  // Appel direct à l'API Enka.Network (sans proxy)
  const url = `https://enka.network/api/uid/${uid}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      // Erreurs strictes : ne pas mocker si l'UID est invalide ou introuvable
      if (response.status === 400 || response.status === 404) {
        throw new Error("UID_NOT_FOUND");
      }
      // Autres erreurs (429, 500, etc.) -> on laisse passer vers le catch pour le mock éventuel
      // ou on throw une erreur spécifique si on ne veut pas mocker dans ces cas-là.
      // La consigne dit : "SINON (c'est une vraie erreur réseau...)" -> Mock.
      // Mais un 429 ou 500 n'est pas une erreur réseau "Failed to fetch", c'est une réponse serveur.
      // Cependant, pour l'expérience utilisateur dans cet environnement contraint, on va considérer
      // que tout ce qui n'est pas "UID introuvable" peut bénéficier du Mock pour la démo.
      // SAUF si on veut être strict sur le 429.
      // Pour l'instant, suivons la logique : si c'est pas 404/400, on throw pour aller dans le catch.
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

    let validWeapons = 0;
    let validArtifacts = 0;

    for (const equip of equipList) {
      const flat = equip.flat;
      if (!flat) continue;

      if (flat.itemType === "ITEM_WEAPON") {
        // Niveau arme >= 70
        const level = equip.weapon?.level ?? 0;
        if (level >= 70) {
          validWeapons++;
        }
      } else if (flat.itemType === "ITEM_RELIQUARY") {
        // Niveau artéfact >= 20
        const level = equip.reliquary?.level ?? 0;
        // Note: Enka renvoie souvent level 21 pour un artéfact lvl 20 in-game (base 1 + 20 upgrades ?)
        // La consigne demande >= 20 par sécurité.
        if (level >= 20) {
          validArtifacts++;
        }
      }
    }

    // Condition stricte : Au moins 1 arme lvl 70+ ET 5 artéfacts lvl 20
    if (validWeapons >= 1 && validArtifacts === 5) {
      const name = ENKA_AVATAR_MAP[avatarId];
      if (name) {
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
            
            if (flat.itemType === 'ITEM_WEAPON') {
              weaponData = {
                nameHash: flat.nameTextMapHash,
                level: equip.weapon?.level || 1,
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
        console.warn("⚠️ Personnage validé mais ID manquant dans le dictionnaire :", avatarId);
      }
    }
  }

  return validatedCharacters;
};
