export interface Team {
  rank: number;
  name: string;
  characters: string[];
  explanation: string;
  rotation: string;
}

export interface TeamResponse {
  teams: Team[];
}

export interface WeaponDetail {
  name: string;
  rarity: number;
  type: string;
}

export interface BuildDetail {
  character: string;
  weapons: WeaponDetail[];
  artifactSet: string;
  sands: string;
  goblet: string;
  circlet: string;
  substats: string[];
  explanation: string;
}

export interface BuildResponse {
  builds: BuildDetail[];
}

export interface SavedTeam {
  id: string;
  teamData: Team;
  buildData?: BuildResponse;
  savedAt: number;
}

export interface AuditResult {
  status?: string;
  positives?: string[];
  negatives?: string[];
  priorities?: string[];
  chartData?: {
    subject: string;
    scoreCurrent: number;
    scoreTarget: number;
    displayCurrent: string;
    displayTarget: string;
  }[];
  isComparison?: boolean;
  tierProgression?: string;
  statDifferences?: {
    name: string;
    oldVal: string;
    newVal: string;
    diff: string;
    perfectionScore: number;
  }[];
  analysis?: string;
  verdict?: 'KEEP' | 'REVERT';
}
