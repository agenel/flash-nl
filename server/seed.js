import db from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to safe-read JSON
const readJson = (relativePath) => {
    try {
        const fullPath = path.resolve(__dirname, relativePath);
        if (fs.existsSync(fullPath)) {
            const raw = fs.readFileSync(fullPath);
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error(`Error reading ${relativePath}:`, e.message);
    }
    return [];
};

const seed = async () => {
    console.log("Starting Seed Process...");

    // 1. Gather all data
    const vocabA2 = readJson('../src/data/vocab_a2.json');
    const expressions = readJson('../src/data/vocab_expressions.json');
    const expansion = readJson('../src/data/vocab_expansion.json');
    const expansion2 = readJson('../src/data/vocab_expansion_2.json');

    const totalList = [
        ...vocabA2,
        ...expressions,
        ...expansion,
        ...expansion2
    ];

    console.log(`Found ${totalList.length} items to seed.`);

    // 2. Initialize DB first
    await db.initialize();

    // 3. Send to DB
    try {
        await db.clearAndSeed(totalList);
        console.log("Seeding process completed successfully.");
    } catch (err) {
        console.error("Seeding failed:", err);
    }
};

// Run
seed();
