/**
 * build-rag.js
 * ─────────────────────────────────────────────────────────
 * Parses dvaJi/genshin-data character files and generates
 * a condensed RAG knowledge base for our AI theorycrafter.
 *
 * Usage:  node scripts/build-rag.js
 * Output: src/data/rag-database.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Paths ──────────────────────────────────────────────────
const SOURCE_DIR = path.join(__dirname, '../../genshin-data/src/data/french/characters');
const DEST_PATH = path.join(__dirname, '../src/data/rag-database.json');

// ── Helpers ────────────────────────────────────────────────

/** Strip HTML tags from genshin-data description strings */
const stripHtml = (str) =>
    str.replace(/<[^>]*>/g, '').replace(/\r?\n/g, ' ').replace(/\s{2,}/g, ' ').trim();

/** Build a condensed skill entry (description only, no scaling tables) */
const extractSkill = (skill) => ({
    name: skill.name,
    description: stripHtml(skill.description || ''),
});

/** Build a condensed passive entry */
const extractPassive = (passive) => ({
    name: passive.name,
    description: stripHtml(passive.description || ''),
});

/** Build a condensed constellation entry */
const extractConstellation = (constellation) => ({
    name: constellation.name,
    level: constellation.level,
    description: stripHtml(constellation.description || ''),
});

// ── Main ───────────────────────────────────────────────────

function main() {
    // Validate source directory
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
        console.error('   Make sure genshin-data is cloned at the expected location.');
        process.exit(1);
    }

    const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));
    console.log(`📂 Found ${files.length} character files in genshin-data`);

    const database = [];

    for (const file of files) {
        try {
            const raw = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, file), 'utf-8'));

            const entry = {
                id: raw.id,
                name: raw.name,
                element: raw.element?.name || raw.element?.id || null,
                weapon: raw.weapon_type?.name || raw.weapon_type?.id || null,
                rarity: raw.rarity,
                region: raw.region?.name || null,
                substat: raw.substat || null,

                // Skills : Normal Attack, Elemental Skill, Elemental Burst
                skills: (raw.skills || []).map(extractSkill),

                // Passive talents
                passives: (raw.passives || [])
                    .filter(p => p.level !== 0)            // exclude non-combat passives (exploration)
                    .map(extractPassive),

                // Constellations
                constellations: (raw.constellations || []).map(extractConstellation),
            };

            database.push(entry);
        } catch (err) {
            console.warn(`⚠️  Skipped ${file}: ${err.message}`);
        }
    }

    // Sort alphabetically by name
    database.sort((a, b) => a.name.localeCompare(b.name));

    // Ensure destination directory exists
    const destDir = path.dirname(DEST_PATH);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    fs.writeFileSync(DEST_PATH, JSON.stringify(database, null, 2), 'utf-8');

    // Stats
    const sizeKB = (fs.statSync(DEST_PATH).size / 1024).toFixed(1);
    console.log(`✅ Generated rag-database.json`);
    console.log(`   → ${database.length} characters extracted`);
    console.log(`   → File size: ${sizeKB} KB`);
    console.log(`   → Output: ${DEST_PATH}`);
}

main();
