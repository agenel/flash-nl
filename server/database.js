import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'database.sqlite');
const verboseSqlite = sqlite3.verbose();

const db = new verboseSqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

db.serialize(() => {
    // Users Table - UPDATED for Auth
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email TEXT UNIQUE,
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Vocabulary Table
    db.run(`CREATE TABLE IF NOT EXISTS vocabulary (
        id INTEGER PRIMARY KEY,
        dutch TEXT,
        english TEXT,
        sentence TEXT,
        sentence_trans TEXT,
        category TEXT
    )`);

    // Progress Table
    db.run(`CREATE TABLE IF NOT EXISTS progress (
        user_id INTEGER,
        vocab_id INTEGER,
        level INTEGER DEFAULT 0,
        in_word_bank BOOLEAN DEFAULT 0,
        last_reviewed DATETIME,
        PRIMARY KEY (user_id, vocab_id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(vocab_id) REFERENCES vocabulary(id)
    )`);
});

export default db;
