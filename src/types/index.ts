import { AuditResult } from './ai-types';

export * from './ai-types';

export type ElementType = 'Pyro' | 'Hydro' | 'Cryo' | 'Electro' | 'Anemo' | 'Geo' | 'Dendro';

export interface EquipStat {
  type: string;
  value: number;
}

export interface WeaponData {
  nameHash: number;
  level: number;
  icon: string;
  mainStat?: EquipStat;
  subStats?: EquipStat[];
}

export interface ArtifactData {
  equipType: string;
  level: number;
  icon: string;
  mainStat: EquipStat;
  subStats: EquipStat[];
}

export interface Character {
  id: string;
  name: string;
  element: ElementType;
  rank: number;
  icon: string;
  weapon?: WeaponData;
  artifacts?: ArtifactData[];
}

export interface UserCharacterState {
  isOwned: boolean;
  isBuilt: boolean;
}

export interface UserBox {
  [characterId: string]: UserCharacterState;
}

export interface DetailedCharacter {
  name: string;
  avatarId: number;
  equipList: any[];
  stats?: Record<string, any>;
  weapon?: WeaponData;
  artifacts?: ArtifactData[];
}

export interface SavedAudit {
  id: string;
  characterName: string;
  avatarId: number;
  date: string;
  result: AuditResult;
  rawStats?: Record<string, any>;
}
