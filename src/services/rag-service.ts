/**
 * RAG Service — Retrieval-Augmented Generation for Genshin AI
 * ─────────────────────────────────────────────────────────────
 * Scans prompts for character names, retrieves official game data
 * from rag-database.json AND theorycrafting data from rag-gazette-character.json
 * and formats it for the AI.
 */

import ragData from '../data/rag-database.json';
import gazetteData from '../data/rag-gazette-character.json';

// ── Types ──────────────────────────────────────────────────
interface RagCharacter {
    id: string;
    name: string;
    element: string | null;
    weapon: string | null;
    rarity: number;
    region: string | null;
    substat: string | null;
    skills: { name: string; description: string }[];
    passives: { name: string; description: string }[];
    constellations: { name: string; level: number; description: string }[];
}

export interface RagCombinedContext {
    stats: Record<string, any>;
    theorycrafting: Record<string, any>;
}

const database: RagCharacter[] = ragData as RagCharacter[];

// Pre-compute a lookup map for fast matching
const characterMap = new Map<string, RagCharacter>();
for (const char of database) {
    characterMap.set(char.name.toLowerCase(), char);
}

// ── Helpers ────────────────────────────────────────────────

export const getCharacterSlug = (name: string): string => {
    return name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/ /g, "-")
        .replace(/[^a-z0-9-]/g, "");
};

/** Truncate a description to avoid bloating the prompt */
const truncate = (text: string, maxLen = 300): string =>
    text.length > maxLen ? text.slice(0, maxLen) + '…' : text;

/** Format a single character's data into a readable object for the AI */
const formatCharacterStats = (char: RagCharacter): any => {
    return {
        name: char.name,
        element: char.element || '?',
        weaponType: char.weapon || '?',
        rarity: char.rarity,
        ascensionSubstat: char.substat || '?',
        passives: char.passives.map(p => ({
            name: p.name,
            description: truncate(p.description)
        })),
        skills: char.skills.map(s => ({
            name: s.name,
            description: truncate(s.description)
        })),
        constellations: char.constellations.map(c => ({
            level: c.level,
            name: c.name,
            description: truncate(c.description, 200)
        }))
    };
};

// ── Main Export ────────────────────────────────────────────

/**
 * Extracts RAG context for characters mentioned in the prompt
 * or present in the user's showcase.
 *
 * @param prompt       - The user's query text
 * @param showcaseNames - Names from the Enka showcase (optional)
 * @returns A formatted context object, or null if no matches
 */
export const extractContextForCharacters = (
    prompt: string,
    showcaseNames: string[] = []
): RagCombinedContext | null => {
    const matchedNames = new Set<string>();

    // 1. Match character names found in the prompt text
    for (const [lowerName] of characterMap) {
        const regex = new RegExp(`\\b${lowerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(prompt)) {
            matchedNames.add(lowerName);
        }
    }

    // 2. Add showcase character names (always included for context)
    for (const name of showcaseNames) {
        const lower = name.toLowerCase();
        if (characterMap.has(lower)) {
            matchedNames.add(lower);
        }
    }

    if (matchedNames.size === 0) return null;

    // 3. Build combined context blocks
    const result: RagCombinedContext = { stats: {}, theorycrafting: {} };

    for (const lowerName of matchedNames) {
        const char = characterMap.get(lowerName);
        if (char) {
            result.stats[char.name] = formatCharacterStats(char);

            // Fallback for theorycrafting : if gazetteData has it, inject it
            const slug = getCharacterSlug(char.name);
            const extendedSlug = slug === "voyageur" ? "voyageur-anemo" : slug; // Handle generic traveler
            const gazetteEntry = (gazetteData as any)[slug] || (gazetteData as any)[extendedSlug];

            if (gazetteEntry) {
                result.theorycrafting[char.name] = gazetteEntry;
            } else {
                result.theorycrafting[char.name] = { note: "Aucune donnée de theorycrafting disponible pour " + char.name };
            }
        }
    }

    return result;
};
