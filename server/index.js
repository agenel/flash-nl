import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import db from './database.js';

const app = express();
const PORT = 3001;

console.log("------------------------------------------");
console.log("   FlashNL Backend Starting...");
console.log("   Auth System: ENABLED (v2.0 Flexible Auth)");
console.log("------------------------------------------");

app.use(cors());
app.use(bodyParser.json());

// --- Auth Routes ---

// Register
app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const hash = bcrypt.hashSync(password, 8);

    db.run("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [username, email, hash], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: "Email already exists" });
            }
            return res.status(500).json({ error: err.message });
        }

        // Return user info (no password)
        res.json({
            message: "User created",
            user: { id: this.lastID, username, email }
        });
    });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ error: "Username/Email and password required" });
    }

    db.get("SELECT * FROM users WHERE email = ? OR username = ?", [identifier, identifier], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isValid = bcrypt.compareSync(password, user.password_hash);
        if (!isValid) return res.status(401).json({ error: "Invalid password" });

        fetchUserProgress(user, res);
    });
});

// --- Data Routes ---

// Get All Vocabulary
app.get('/api/vocabulary', (req, res) => {
    db.all("SELECT * FROM vocabulary", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "success", data: rows });
    });
});

// Sync Progress
app.post('/api/progress', (req, res) => {
    const { userId, updates } = req.body;

    if (!userId || !updates) {
        res.status(400).json({ error: "Missing data" });
        return;
    }

    const stmt = db.prepare("INSERT OR REPLACE INTO progress (user_id, vocab_id, level, in_word_bank, last_reviewed) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)");

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        updates.forEach(item => {
            stmt.run(userId, item.vocabId, item.level, item.inWordBank ? 1 : 0);
        });
        db.run("COMMIT");
        stmt.finalize();
    });

    res.json({ message: "Progress synced" });
});

// Helper
function fetchUserProgress(user, res) {
    db.all("SELECT * FROM progress WHERE user_id = ?", [user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const progressMap = {};
        const wordBank = [];

        rows.forEach(row => {
            progressMap[row.vocab_id] = {
                level: row.level,
                lastReviewed: row.last_reviewed
            };
            if (row.in_word_bank) {
                wordBank.push(row.vocab_id);
            }
        });

        res.json({
            message: "success",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                progress: progressMap,
                wordBank: wordBank
            }
        });
    });
}

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error('ERROR: Port 3001 is already in use!');
    } else {
        console.error('Server Error:', e);
    }
});
