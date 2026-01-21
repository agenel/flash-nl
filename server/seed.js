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
    db.run("BEGIN TRANSACTION");

    const stmt = db.prepare("INSERT OR REPLACE INTO vocabulary (id, dutch, english, sentence, sentence_trans, category) VALUES (?, ?, ?, ?, ?, ?)");

    vocabList.forEach(item => {
        stmt.run(item.id, item.dutch, item.english, item.sentence, item.sentence_trans, item.category);
    });

    stmt.finalize();
    db.run("COMMIT", () => {
        console.log("Seeding complete.");
        db.close();
    });
});
