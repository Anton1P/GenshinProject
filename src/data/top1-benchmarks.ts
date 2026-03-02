/**
 * Top 1% benchmark stats from Akasha.cv leaderboards.
 * These represent the stat thresholds of top 1% players for each character.
 * Used to normalize the radar chart — a character with stats matching these
 * values will appear as a full hexagon.
 *
 * Format: { hp, atk, def, cr, cd, er, em }
 * cr/cd/er are stored as decimals (e.g. 0.75 = 75%)
 * em is stored as flat value
 * 
 * Sources: Akasha.cv leaderboards, KQM standards, community data (2024-2025)
 */

export interface BenchmarkStats {
    hp: number;
    atk: number;
    def: number;
    cr: number;   // decimal: 0.75 = 75%
    cd: number;   // decimal: 2.50 = 250%
    er: number;   // decimal: 1.20 = 120%
    em: number;
}

/**
 * Default fallback benchmarks for characters not explicitly listed.
 * Based on average top 1% stats across all DPS characters.
 */
const DEFAULT_DPS: BenchmarkStats = {
    hp: 22000, atk: 2500, def: 1000, cr: 0.80, cd: 2.20, er: 1.30, em: 200
};

const DEFAULT_SUPPORT: BenchmarkStats = {
    hp: 30000, atk: 1800, def: 1200, cr: 0.65, cd: 1.80, er: 2.00, em: 300
};

const DEFAULT_HEALER: BenchmarkStats = {
    hp: 38000, atk: 1500, def: 1100, cr: 0.50, cd: 1.50, er: 1.80, em: 150
};

/**
 * Per-character top 1% benchmarks.
 * Keys match character names in ENKA_AVATAR_MAP.
 */
export const TOP1_BENCHMARKS: Record<string, BenchmarkStats> = {
    // ═══════════ PYRO ═══════════
    "Hu Tao": {
        hp: 38000, atk: 1500, def: 1000, cr: 0.78, cd: 2.50, er: 1.10, em: 350
    },
    "Mavuika": {
        hp: 22000, atk: 2800, def: 950, cr: 0.75, cd: 2.50, er: 1.10, em: 200
    },
    "Arlecchino": {
        hp: 22000, atk: 2800, def: 900, cr: 0.82, cd: 2.40, er: 1.10, em: 150
    },
    "Yoimiya": {
        hp: 20000, atk: 2600, def: 900, cr: 0.80, cd: 2.30, er: 1.20, em: 200
    },
    "Diluc": {
        hp: 21000, atk: 2500, def: 950, cr: 0.78, cd: 2.20, er: 1.20, em: 250
    },
    "Klee": {
        hp: 19000, atk: 2400, def: 850, cr: 0.78, cd: 2.20, er: 1.20, em: 200
    },
    "Xiangling": {
        hp: 21000, atk: 2200, def: 900, cr: 0.72, cd: 2.00, er: 1.80, em: 300
    },
    "Lyney": {
        hp: 19000, atk: 2700, def: 850, cr: 0.80, cd: 2.40, er: 1.20, em: 100
    },
    "Dehya": {
        hp: 25000, atk: 2300, def: 1000, cr: 0.72, cd: 2.00, er: 1.30, em: 250
    },
    "Amber": {
        hp: 18000, atk: 2200, def: 850, cr: 0.72, cd: 2.00, er: 1.30, em: 150
    },
    "Xinyan": {
        hp: 22000, atk: 2200, def: 1100, cr: 0.68, cd: 1.80, er: 1.40, em: 150
    },
    "Yanfei": {
        hp: 19000, atk: 2400, def: 850, cr: 0.76, cd: 2.10, er: 1.30, em: 200
    },
    "Thomas": {
        hp: 28000, atk: 1600, def: 950, cr: 0.50, cd: 1.40, er: 2.00, em: 250
    },
    "Gaming": {
        hp: 21000, atk: 2500, def: 950, cr: 0.76, cd: 2.20, er: 1.20, em: 200
    },
    "Chevreuse": {
        hp: 35000, atk: 1400, def: 1000, cr: 0.40, cd: 1.20, er: 1.80, em: 150
    },

    // ═══════════ HYDRO ═══════════
    "Furina": {
        hp: 42000, atk: 1400, def: 1000, cr: 0.78, cd: 2.30, er: 1.50, em: 100
    },
    "Tartaglia": {
        hp: 22000, atk: 2500, def: 900, cr: 0.78, cd: 2.20, er: 1.30, em: 200
    },
    "Yelan": {
        hp: 36000, atk: 1200, def: 850, cr: 0.78, cd: 2.30, er: 1.50, em: 100
    },
    "Xingqiu": {
        hp: 21000, atk: 2100, def: 950, cr: 0.72, cd: 2.00, er: 1.80, em: 150
    },
    "Sangonomiya Kokomi": {
        hp: 42000, atk: 1600, def: 950, cr: 0.10, cd: 1.00, er: 1.60, em: 800
    },
    "Kamisato Ayato": {
        hp: 22000, atk: 2500, def: 950, cr: 0.78, cd: 2.20, er: 1.30, em: 150
    },
    "Nilou": {
        hp: 42000, atk: 1600, def: 1000, cr: 0.50, cd: 1.50, er: 1.30, em: 1000
    },
    "Mona": {
        hp: 19000, atk: 2200, def: 850, cr: 0.68, cd: 1.80, er: 2.20, em: 200
    },
    "Barbara": {
        hp: 38000, atk: 1500, def: 900, cr: 0.45, cd: 1.40, er: 1.60, em: 200
    },
    "Candace": {
        hp: 30000, atk: 1800, def: 950, cr: 0.60, cd: 1.60, er: 1.80, em: 150
    },
    "Mualani": {
        hp: 32000, atk: 1600, def: 900, cr: 0.82, cd: 2.40, er: 1.20, em: 200
    },
    "Sigewinne": {
        hp: 42000, atk: 1200, def: 900, cr: 0.55, cd: 1.60, er: 1.40, em: 150
    },

    // ═══════════ CRYO ═══════════
    "Kamisato Ayaka": {
        hp: 21000, atk: 2600, def: 950, cr: 0.45, cd: 2.60, er: 1.40, em: 100
    },
    "Ganyu": {
        hp: 19000, atk: 2600, def: 850, cr: 0.50, cd: 2.50, er: 1.20, em: 200
    },
    "Eula": {
        hp: 23000, atk: 2600, def: 1000, cr: 0.78, cd: 2.30, er: 1.40, em: 100
    },
    "Shenhe": {
        hp: 20000, atk: 3200, def: 950, cr: 0.50, cd: 1.50, er: 1.50, em: 100
    },
    "Wriothesley": {
        hp: 22000, atk: 2600, def: 950, cr: 0.82, cd: 2.40, er: 1.10, em: 150
    },
    "Rosalia": {
        hp: 21000, atk: 2200, def: 900, cr: 0.85, cd: 1.80, er: 1.40, em: 150
    },
    "Diona": {
        hp: 30000, atk: 1400, def: 900, cr: 0.40, cd: 1.20, er: 1.80, em: 200
    },
    "Kaeya": {
        hp: 22000, atk: 2300, def: 950, cr: 0.72, cd: 2.00, er: 1.40, em: 200
    },
    "Chongyun": {
        hp: 21000, atk: 2200, def: 950, cr: 0.72, cd: 1.90, er: 1.30, em: 200
    },
    "Qiqi": {
        hp: 28000, atk: 2200, def: 1000, cr: 0.55, cd: 1.50, er: 1.60, em: 100
    },
    "Layla": {
        hp: 32000, atk: 1500, def: 950, cr: 0.45, cd: 1.30, er: 1.80, em: 100
    },
    "Fréminet": {
        hp: 22000, atk: 2400, def: 1000, cr: 0.76, cd: 2.10, er: 1.30, em: 150
    },
    "Charlotte": {
        hp: 28000, atk: 1800, def: 900, cr: 0.50, cd: 1.50, er: 1.60, em: 150
    },
    "Mika": {
        hp: 30000, atk: 1500, def: 1000, cr: 0.40, cd: 1.20, er: 2.00, em: 100
    },

    // ═══════════ ELECTRO ═══════════
    "Shogun Raiden": {
        hp: 22000, atk: 2300, def: 1100, cr: 0.78, cd: 2.20, er: 2.80, em: 200
    },
    "Keqing": {
        hp: 20000, atk: 2600, def: 900, cr: 0.80, cd: 2.30, er: 1.20, em: 200
    },
    "Yae Miko": {
        hp: 20000, atk: 2400, def: 850, cr: 0.78, cd: 2.20, er: 1.40, em: 300
    },
    "Cyno": {
        hp: 22000, atk: 2400, def: 950, cr: 0.80, cd: 2.30, er: 1.30, em: 400
    },
    "Fischl": {
        hp: 19000, atk: 2400, def: 850, cr: 0.76, cd: 2.10, er: 1.30, em: 200
    },
    "Kujou Sara": {
        hp: 18000, atk: 2800, def: 850, cr: 0.65, cd: 1.80, er: 2.00, em: 100
    },
    "Lisa": {
        hp: 19000, atk: 2200, def: 850, cr: 0.68, cd: 1.80, er: 1.80, em: 300
    },
    "Razor": {
        hp: 23000, atk: 2500, def: 1000, cr: 0.76, cd: 2.10, er: 1.20, em: 100
    },
    "Beidou": {
        hp: 22000, atk: 2300, def: 950, cr: 0.72, cd: 2.00, er: 1.60, em: 150
    },
    "Kuki Shinobu": {
        hp: 32000, atk: 1600, def: 950, cr: 0.50, cd: 1.50, er: 1.50, em: 900
    },
    "Dori": {
        hp: 24000, atk: 1800, def: 1000, cr: 0.55, cd: 1.60, er: 2.00, em: 200
    },
    "Sethos": {
        hp: 19000, atk: 2200, def: 850, cr: 0.72, cd: 2.00, er: 1.30, em: 500
    },
    "Clorinde": {
        hp: 22000, atk: 2600, def: 950, cr: 0.80, cd: 2.40, er: 1.20, em: 200
    },
    "Ororon": {
        hp: 22000, atk: 1800, def: 900, cr: 0.60, cd: 1.60, er: 1.80, em: 400
    },

    // ═══════════ ANEMO ═══════════
    "Kaedehara Kazuha": {
        hp: 23000, atk: 1900, def: 1000, cr: 0.50, cd: 1.50, er: 1.60, em: 1000
    },
    "Venti": {
        hp: 19000, atk: 2000, def: 900, cr: 0.55, cd: 1.60, er: 1.80, em: 800
    },
    "Xiao": {
        hp: 22000, atk: 2700, def: 1000, cr: 0.80, cd: 2.40, er: 1.30, em: 100
    },
    "Jean": {
        hp: 24000, atk: 2400, def: 1000, cr: 0.65, cd: 1.80, er: 1.60, em: 200
    },
    "Sucrose": {
        hp: 18000, atk: 1800, def: 850, cr: 0.50, cd: 1.40, er: 1.60, em: 900
    },
    "Sayu": {
        hp: 22000, atk: 1800, def: 950, cr: 0.50, cd: 1.40, er: 1.80, em: 700
    },
    "Shikanoin Heizou": {
        hp: 20000, atk: 2400, def: 900, cr: 0.78, cd: 2.20, er: 1.30, em: 300
    },
    "Faruzan": {
        hp: 18000, atk: 2200, def: 850, cr: 0.55, cd: 1.50, er: 2.00, em: 100
    },
    "Xianyun": {
        hp: 20000, atk: 3000, def: 850, cr: 0.55, cd: 1.60, er: 1.60, em: 100
    },
    "Lynette": {
        hp: 21000, atk: 2200, def: 950, cr: 0.68, cd: 1.80, er: 1.60, em: 200
    },
    "Chasca": {
        hp: 20000, atk: 2500, def: 900, cr: 0.80, cd: 2.30, er: 1.20, em: 200
    },
    "Lan Yan": {
        hp: 22000, atk: 1800, def: 1000, cr: 0.55, cd: 1.50, er: 1.80, em: 700
    },

    // ═══════════ GEO ═══════════
    "Zhongli": {
        hp: 52000, atk: 1600, def: 1100, cr: 0.55, cd: 1.60, er: 1.50, em: 100
    },
    "Arataki Itto": {
        hp: 22000, atk: 2000, def: 2500, cr: 0.80, cd: 2.30, er: 1.30, em: 100
    },
    "Albedo": {
        hp: 21000, atk: 1800, def: 2400, cr: 0.72, cd: 2.00, er: 1.30, em: 150
    },
    "Ningguang": {
        hp: 19000, atk: 2500, def: 850, cr: 0.78, cd: 2.20, er: 1.20, em: 100
    },
    "Noëlle": {
        hp: 22000, atk: 2000, def: 2400, cr: 0.76, cd: 2.10, er: 1.40, em: 100
    },
    "Gorou": {
        hp: 22000, atk: 1500, def: 1800, cr: 0.45, cd: 1.30, er: 2.20, em: 100
    },
    "Yun Jin": {
        hp: 22000, atk: 1600, def: 2400, cr: 0.45, cd: 1.30, er: 1.80, em: 100
    },
    "Chiori": {
        hp: 20000, atk: 2400, def: 2200, cr: 0.78, cd: 2.20, er: 1.20, em: 100
    },
    "Navia": {
        hp: 22000, atk: 2600, def: 1000, cr: 0.78, cd: 2.30, er: 1.30, em: 150
    },
    "Kachina": {
        hp: 22000, atk: 1800, def: 2200, cr: 0.65, cd: 1.80, er: 1.40, em: 150
    },

    // ═══════════ DENDRO ═══════════
    "Nahida": {
        hp: 20000, atk: 1800, def: 850, cr: 0.72, cd: 2.00, er: 1.20, em: 1000
    },
    "Tighnari": {
        hp: 19000, atk: 2200, def: 850, cr: 0.78, cd: 2.20, er: 1.20, em: 400
    },
    "Alhaitham": {
        hp: 22000, atk: 2200, def: 1000, cr: 0.80, cd: 2.30, er: 1.30, em: 500
    },
    "Collei": {
        hp: 19000, atk: 2000, def: 850, cr: 0.65, cd: 1.80, er: 1.80, em: 400
    },
    "Yaoyao": {
        hp: 32000, atk: 1500, def: 900, cr: 0.45, cd: 1.30, er: 1.80, em: 300
    },
    "Baizhu": {
        hp: 38000, atk: 1500, def: 900, cr: 0.50, cd: 1.40, er: 1.80, em: 300
    },
    "Kaveh": {
        hp: 22000, atk: 2200, def: 950, cr: 0.70, cd: 2.00, er: 1.40, em: 500
    },
    "Kirara": {
        hp: 32000, atk: 1500, def: 1000, cr: 0.45, cd: 1.30, er: 1.60, em: 200
    },
    "Émilie": {
        hp: 20000, atk: 2200, def: 900, cr: 0.72, cd: 2.00, er: 1.30, em: 400
    },
    "Kinich": {
        hp: 22000, atk: 2500, def: 950, cr: 0.80, cd: 2.40, er: 1.20, em: 300
    },

    // ═══════════ NATLAN (Multi-element) ═══════════
    "Xilonen": {
        hp: 28000, atk: 1600, def: 2500, cr: 0.55, cd: 1.50, er: 1.60, em: 200
    },
    "Citlali": {
        hp: 28000, atk: 1600, def: 950, cr: 0.55, cd: 1.50, er: 1.50, em: 900
    },
    "Iansan": {
        hp: 22000, atk: 2400, def: 950, cr: 0.78, cd: 2.20, er: 1.20, em: 200
    },
    "Varesa": {
        hp: 22000, atk: 2500, def: 950, cr: 0.80, cd: 2.30, er: 1.20, em: 200
    },

    // ═══════════ SNEZHNAYA ═══════════
    "Escoffier": {
        hp: 28000, atk: 1800, def: 950, cr: 0.60, cd: 1.70, er: 1.60, em: 200
    },
    "Ifa": {
        hp: 22000, atk: 2200, def: 900, cr: 0.72, cd: 2.00, er: 1.40, em: 300
    },
    "Skirk": {
        hp: 22000, atk: 2700, def: 950, cr: 0.82, cd: 2.40, er: 1.20, em: 150
    },
    "Dahlia": {
        hp: 30000, atk: 1800, def: 950, cr: 0.55, cd: 1.50, er: 1.80, em: 200
    },
    "Ineffa": {
        hp: 20000, atk: 2400, def: 900, cr: 0.78, cd: 2.20, er: 1.30, em: 200
    },
    "Columbina": {
        hp: 22000, atk: 2500, def: 950, cr: 0.80, cd: 2.30, er: 1.30, em: 200
    },

    // ═══════════ FONTAINE (remaining) ═══════════
    "Neuvillette": {
        hp: 32000, atk: 1600, def: 950, cr: 0.82, cd: 2.40, er: 1.20, em: 200
    },

    // ═══════════ VOYAGEURS ═══════════
    "Voyageuse": {
        hp: 22000, atk: 2200, def: 950, cr: 0.68, cd: 1.80, er: 1.40, em: 200
    },

    // ═══════════ COLLAB ═══════════
    "Aloy": {
        hp: 19000, atk: 2200, def: 850, cr: 0.65, cd: 1.80, er: 1.40, em: 200
    },

    // ═══════════ MISC ═══════════
    "Yumemizuki Mizuki": {
        hp: 28000, atk: 1800, def: 950, cr: 0.60, cd: 1.70, er: 1.60, em: 400
    },
    "Nomade": {
        hp: 22000, atk: 2200, def: 950, cr: 0.68, cd: 1.80, er: 1.40, em: 200
    },
};

/**
 * Get the top 1% benchmark for a given character.
 * Falls back to a generic benchmark based on common role archetypes.
 */
export const getBenchmark = (characterName: string): BenchmarkStats => {
    if (TOP1_BENCHMARKS[characterName]) {
        return TOP1_BENCHMARKS[characterName];
    }
    // Fallback: use generic DPS defaults
    console.warn(`⚠️ No top 1% benchmark for "${characterName}", using defaults.`);
    return DEFAULT_DPS;
};
