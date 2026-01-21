import db from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vocabPath = path.resolve(__dirname, '../src/data/vocab_a2.json');
const rawData = fs.readFileSync(vocabPath);
const vocabList = JSON.parse(rawData);

console.log(`Seeding ${vocabList.length} items...`);

db.serialize(() => {
    // Clear existing data to avoid duplicates
    db.run("DELETE FROM vocabulary", (err) => {
        if (err) console.error("Error clearing vocabulary:", err);
        else console.log("Vocabulary table cleared.");
    });

    db.run("BEGIN TRANSACTION");

    const stmt = db.prepare("INSERT OR REPLACE INTO vocabulary (dutch, english, sentence, sentence_trans, category) VALUES (?, ?, ?, ?, ?)");

    const processItem = (item) => {
        stmt.run(item.dutch, item.english, item.sentence, item.sentence_trans, item.category);
    };

    // Seed Part 1 (Basic)
    vocabList.forEach(processItem);

    // Seed Part 2 (Expressions - New)
    try {
        const expressionsPath = path.resolve(__dirname, '../src/data/vocab_expressions.json');
        if (fs.existsSync(expressionsPath)) {
            const rawExp = fs.readFileSync(expressionsPath);
            const expList = JSON.parse(rawExp);
            console.log(`Adding ${expList.length} expressions...`);
            expList.forEach(processItem);
        }
    } catch (e) {
        console.error("Error seeding expressions:", e);
    }

    // Seed Part 3 (Expansion - New)
    try {
        const expansionPath = path.resolve(__dirname, '../src/data/vocab_expansion.json');
        if (fs.existsSync(expansionPath)) {
            const rawExp = fs.readFileSync(expansionPath);
            const expList = JSON.parse(rawExp);
            console.log(`Adding ${expList.length} expansion items...`);
            expList.forEach(processItem);
        }
    } catch (e) {
        console.error("Error seeding expansion:", e);
    }

    // Seed Part 4 (Large Expansion - New)
    try {
        const expansion2Path = path.resolve(__dirname, '../src/data/vocab_expansion_2.json');
        if (fs.existsSync(expansion2Path)) {
            const rawExp2 = fs.readFileSync(expansion2Path);
            const expList2 = JSON.parse(rawExp2);
            console.log(`Adding ${expList2.length} extra expansion items...`);
            expList2.forEach(processItem);
        }
    } catch (e) {
        console.error("Error seeding large expansion:", e);
    }

    stmt.finalize();
    db.run("COMMIT", () => {
        console.log("Seeding complete.");
        db.close();
    });
});
