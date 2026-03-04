/**
 * RAG Service — Retrieval-Augmented Generation for Genshin AI
 * ─────────────────────────────────────────────────────────────
 * Scans prompts for character names, retrieves official game data
 * from rag-database.json, and formats it as context for the AI.
 */

import ragData from '../data/rag-database.json';

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

const database: RagCharacter[] = ragData as RagCharacter[];

// Pre-compute a lookup map for fast matching
const characterMap = new Map<string, RagCharacter>();
for (const char of database) {
    characterMap.set(char.name.toLowerCase(), char);
}

// ── Helpers ────────────────────────────────────────────────

/** Truncate a description to avoid bloating the prompt */
const truncate = (text: string, maxLen = 300): string =>
    text.length > maxLen ? text.slice(0, maxLen) + '…' : text;

/** Format a single character's data into a readable text block for the AI */
const formatCharacterBlock = (char: RagCharacter): string => {
    const lines: string[] = [];

    lines.push(`=== DONNÉES OFFICIELLES : ${char.name} ===`);
    lines.push(`Élément: ${char.element || '?'} | Arme: ${char.weapon || '?'} | Rareté: ${char.rarity}★ | Substat: ${char.substat || '?'}`);

    if (char.passives.length > 0) {
        lines.push('Passifs:');
        for (const p of char.passives) {
            lines.push(`- ${p.name}: ${truncate(p.description)}`);
        }
    }

    if (char.skills.length > 0) {
        lines.push('Compétences:');
        for (const s of char.skills) {
            lines.push(`- ${s.name}: ${truncate(s.description)}`);
        }
    }

    if (char.constellations.length > 0) {
        lines.push('Constellations:');
        for (const c of char.constellations) {
            lines.push(`- C${c.level} ${c.name}: ${truncate(c.description, 200)}`);
        }
    }

    return lines.join('\n');
};

// ── Main Export ────────────────────────────────────────────

/**
 * Extracts RAG context for characters mentioned in the prompt
 * or present in the user's showcase.
 *
 * @param prompt       - The user's query text
 * @param showcaseNames - Names from the Enka showcase (optional)
 * @returns A formatted context string, or "" if no matches
 */
export const extractContextForCharacters = (
    prompt: string,
    showcaseNames: string[] = []
): string => {
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

    if (matchedNames.size === 0) return '';

    // 3. Build formatted context blocks
    const blocks: string[] = [];
    for (const name of matchedNames) {
        const char = characterMap.get(name);
        if (char) {
            blocks.push(formatCharacterBlock(char));
        }
    }

    return blocks.join('\n\n');
};
