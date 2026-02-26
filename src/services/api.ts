import { Character, ElementType } from '../types';

interface AmbrCharacter {
  id: string | number;
  name: string;
  element: string;
  rankLevel: number;
  icon: string;
}

const ELEMENT_MAP: { [key: string]: ElementType } = {
  Fire: 'Pyro', Water: 'Hydro', Ice: 'Cryo', Electric: 'Electro',
  Wind: 'Anemo', Rock: 'Geo', Grass: 'Dendro',
};

// Box de secours avec 25 personnages (IDs uniques corrigés et images Enka)
const FALLBACK_CHARACTERS: Character[] = [
  { id: '10000092', name: 'Gaming', element: 'Pyro', rank: 4, icon: 'https://enka.network/ui/UI_AvatarIcon_Gaming.png' },
  { id: '10000041', name: 'Mona', element: 'Hydro', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Mona.png' },
  { id: '10000046', name: 'Hu Tao', element: 'Pyro', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Hutao.png' },
  { id: '10000091', name: 'Navia', element: 'Geo', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Navia.png' },
  { id: '10000089', name: 'Chevreuse', element: 'Pyro', rank: 4, icon: 'https://enka.network/ui/UI_AvatarIcon_Chevreuse.png' },
  { id: '10000087', name: 'Neuvillette', element: 'Hydro', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Neuvillette.png' },
  { id: '10000088', name: 'Furina', element: 'Hydro', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Furina.png' },
  { id: '10000060', name: 'Yelan', element: 'Hydro', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Yelan.png' },
  { id: '10000025', name: 'Xingqiu', element: 'Hydro', rank: 4, icon: 'https://enka.network/ui/UI_AvatarIcon_Xingqiu.png' },
  { id: '10000023', name: 'Xiangling', element: 'Pyro', rank: 4, icon: 'https://enka.network/ui/UI_AvatarIcon_Xiangling.png' },
  { id: '10000032', name: 'Bennett', element: 'Pyro', rank: 4, icon: 'https://enka.network/ui/UI_AvatarIcon_Bennett.png' },
  { id: '10000096', name: 'Arlecchino', element: 'Pyro', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Arlecchino.png' },
  { id: '10000073', name: 'Nahida', element: 'Dendro', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Nahida.png' },
  { id: '10000078', name: 'Alhaitham', element: 'Dendro', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Alhatham.png' },
  { id: '10000082', name: 'Baizhu', element: 'Dendro', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Baizhuer.png' },
  { id: '10000052', name: 'Raiden Shogun', element: 'Electro', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Shougun.png' },
  { id: '10000065', name: 'Kuki Shinobu', element: 'Electro', rank: 4, icon: 'https://enka.network/ui/UI_AvatarIcon_Shinobu.png' },
  { id: '10000031', name: 'Fischl', element: 'Electro', rank: 4, icon: 'https://enka.network/ui/UI_AvatarIcon_Fischl.png' },
  { id: '10000047', name: 'Kazuha', element: 'Anemo', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Kazuha.png' },
  { id: '10000043', name: 'Sucrose', element: 'Anemo', rank: 4, icon: 'https://enka.network/ui/UI_AvatarIcon_Sucrose.png' },
  { id: '10000002', name: 'Ayaka', element: 'Cryo', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Ayaka.png' },
  { id: '10000063', name: 'Shenhe', element: 'Cryo', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Shenhe.png' },
  { id: '10000039', name: 'Diona', element: 'Cryo', rank: 4, icon: 'https://enka.network/ui/UI_AvatarIcon_Diona.png' },
  { id: '10000030', name: 'Zhongli', element: 'Geo', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Zhongli.png' },
  { id: '10000093', name: 'Xianyun', element: 'Anemo', rank: 5, icon: 'https://enka.network/ui/UI_AvatarIcon_Liuyun.png' }
];

export const fetchCharacters = async (): Promise<Character[]> => {
  try {
    // Appel direct, propre et sans proxy !
    const response = await fetch('https://api.ambr.top/v2/fr/avatar');
    
    if (!response.ok) throw new Error('Erreur réseau ou API inaccessible');
    
    const json = await response.json();
    const items = json.data.items;
    
    return Object.values(items as Record<string, AmbrCharacter>)
      .filter((char) => {
        const isTraveler = String(char.id) === '10000005' || String(char.id) === '10000007';
        const rank = Number(char.rankLevel); 
        return !isTraveler && (rank === 4 || rank === 5);
      })
      .map((char) => ({
        id: String(char.id),
        name: char.name,
        element: ELEMENT_MAP[char.element] || (char.element as ElementType),
        rank: Number(char.rankLevel),
        icon: `https://enka.network/ui/${char.icon}.png`,
      }));

  } catch (error) {
    console.warn("Appel API bloqué (CORS) ou échoué. Chargement immédiat de la box de secours.");
    return FALLBACK_CHARACTERS; 
  }
};