import sqlite3 from 'sqlite3';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB_MODE: 'sqlite' or 'postgres'
const DB_MODE = process.env.DATABASE_URL ? 'postgres' : 'sqlite';

console.log(`[Database] Initializing in ${DB_MODE.toUpperCase()} mode.`);

let db;

if (DB_MODE === 'sqlite') {
    const dbPath = path.resolve(__dirname, 'flashnl.db');
    const verboseSqlite = sqlite3.verbose();
    db = new verboseSqlite.Database(dbPath, (err) => {
        if (err) console.error('[SQLite] Connection error:', err);
        else console.log('[SQLite] Connected.');
    });
} else {
    // PostgreSQL Pool
    db = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Neon/Render
    });
}

// Helper to run queries (abstracting differences)
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        if (DB_MODE === 'sqlite') {
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            } else {
                db.run(sql, params, function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, changes: this.changes });
                });
            }
        } else {
            // Postgres
            // Convert ? to $1, $2, etc.
            let paramIndex = 1;
            const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

            db.query(pgSql, params)
                .then(res => resolve(res.rows)) // pg returns rows for SELECT and RETURNING
                .catch(err => reject(err));
        }
    });
};

// Database Interface
const database = {
    initialize: async () => {
        const usersTable = DB_MODE === 'sqlite'
            ? `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                email TEXT UNIQUE,
                password_hash TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
               )`
            : `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT,
                email TEXT UNIQUE,
                password_hash TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
               )`;

        const vocabTable = DB_MODE === 'sqlite'
            ? `CREATE TABLE IF NOT EXISTS vocabulary (
                id INTEGER PRIMARY KEY,
                dutch TEXT,
                english TEXT,
                sentence TEXT,
                sentence_trans TEXT,
                category TEXT
               )`
            : `CREATE TABLE IF NOT EXISTS vocabulary (
                id SERIAL PRIMARY KEY,
                dutch TEXT,
                english TEXT,
                sentence TEXT,
                sentence_trans TEXT,
                category TEXT
               )`;

        const progressTable = DB_MODE === 'sqlite'
            ? `CREATE TABLE IF NOT EXISTS progress (
                user_id INTEGER,
                vocab_id INTEGER,
                level INTEGER DEFAULT 0,
                in_word_bank BOOLEAN DEFAULT 0,
                last_reviewed DATETIME,
                PRIMARY KEY (user_id, vocab_id),
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(vocab_id) REFERENCES vocabulary(id)
               )`
            : `CREATE TABLE IF NOT EXISTS progress (
                user_id INTEGER,
                vocab_id INTEGER,
                level INTEGER DEFAULT 0,
                in_word_bank BOOLEAN DEFAULT FALSE,
                last_reviewed TIMESTAMP,
                PRIMARY KEY (user_id, vocab_id),
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(vocab_id) REFERENCES vocabulary(id)
               )`;

        await runQuery(usersTable);
        await runQuery(vocabTable);
        await runQuery(progressTable);
        console.log('[Database] Tables initialized.');
    },

    createUser: async (username, email, hash) => {
        if (DB_MODE === 'sqlite') {
            const res = await runQuery("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [username, email, hash]);
            return { id: res.id, username, email };
        } else {
            const rows = await runQuery("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?) RETURNING id, username, email", [username, email, hash]);
            return rows[0];
        }
    },

    findUserByIdentifier: async (identifier) => {
        const rows = await runQuery("SELECT * FROM users WHERE email = ? OR username = ?", [identifier, identifier]);
        return rows[0]; // Returns undefined if not found
    },

    getAllVocabulary: async () => {
        return await runQuery("SELECT * FROM vocabulary");
    },

    // Batch upsert progress
    upsertProgressBatch: async (userId, updates) => {
        // Updates: [{ vocabId, level, inWordBank }]

        if (updates.length === 0) return;

        if (DB_MODE === 'sqlite') {
            // SQLite Transaction
            return new Promise((resolve, reject) => {
                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");
                    const stmt = db.prepare("INSERT OR REPLACE INTO progress (user_id, vocab_id, level, in_word_bank, last_reviewed) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)");
                    updates.forEach(item => {
                        stmt.run(userId, item.vocabId, item.level, item.inWordBank ? 1 : 0);
                    });
                    stmt.finalize();
                    db.run("COMMIT", (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            });
        } else {
            // PostgreSQL Batch (Using looping queries for simplicity in this migration, 
            // highly optimized would be unnesting arrays but this is sufficient)
            const client = await db.connect();
            try {
                await client.query('BEGIN');
                const queryText = `
                    INSERT INTO progress (user_id, vocab_id, level, in_word_bank, last_reviewed)
                    VALUES ($1, $2, $3, $4, NOW())
                    ON CONFLICT (user_id, vocab_id) 
                    DO UPDATE SET level = EXCLUDED.level, in_word_bank = EXCLUDED.in_word_bank, last_reviewed = NOW()
                `;

                for (const item of updates) {
                    await client.query(queryText, [userId, item.vocabId, item.level, item.inWordBank]);
                }
                await client.query('COMMIT');
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        }
    },

    getUserProgress: async (userId) => {
        const rows = await runQuery("SELECT * FROM progress WHERE user_id = ?", [userId]);

        const progressMap = {};
        const wordBank = [];

        rows.forEach(row => {
            // Normalizing boolean for SQLite (0/1) vs PG (true/false)
            const isInBank = DB_MODE === 'sqlite' ? row.in_word_bank === 1 : row.in_word_bank;

            progressMap[row.vocab_id] = {
                level: row.level,
                lastReviewed: row.last_reviewed
            };
            if (isInBank) {
                wordBank.push(row.vocab_id);
            }
        });

        return { progressMap, wordBank };
    },

    // Seeding API
    clearAndSeed: async (vocabList) => {
        // 1. Clear
        await runQuery("DELETE FROM vocabulary");

        // 2. Insert (Batch)
        console.log(`[Database] Seeding ${vocabList.length} items...`);

        if (DB_MODE === 'sqlite') {
            return new Promise((resolve, reject) => {
                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");
                    const stmt = db.prepare("INSERT INTO vocabulary (dutch, english, sentence, sentence_trans, category) VALUES (?, ?, ?, ?, ?)");
                    vocabList.forEach(item => {
                        stmt.run(item.dutch, item.english, item.sentence, item.sentence_trans, item.category);
                    });
                    stmt.finalize();
                    db.run("COMMIT", (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            });
        } else {
            const client = await db.connect();
            try {
                await client.query('BEGIN');
                const queryText = "INSERT INTO vocabulary (dutch, english, sentence, sentence_trans, category) VALUES ($1, $2, $3, $4, $5)";
                for (const item of vocabList) {
                    await client.query(queryText, [item.dutch, item.english, item.sentence, item.sentence_trans, item.category]);
                }
                await client.query('COMMIT');
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        }
    }
};

// Auto-init on load
database.initialize();

export default database;
