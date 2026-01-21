import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import db from './database.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3001;

console.log("------------------------------------------");
console.log("   FlashNL Backend Starting...");
console.log("   Auth System: ENABLED (v2.0 Flexible Auth)");
console.log("------------------------------------------");

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

// Security: Rate Limiter for Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: "Too many login attempts, please try again later."
});

// --- Auth Routes ---

// Register
app.post('/api/auth/register', authLimiter, async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hash = bcrypt.hashSync(password, 8);

    try {
        const user = await db.createUser(username, email, hash);
        res.json({ message: "User created", user });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE') || (err.code && err.code === '23505')) {
            return res.status(400).json({ error: "Email or Username already exists" });
        }
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ error: "Username/Email and password required" });
    }

    try {
        const user = await db.findUserByIdentifier(identifier);

        if (!user) return res.status(404).json({ error: "User not found" });

        const isValid = bcrypt.compareSync(password, user.password_hash);
        if (!isValid) return res.status(401).json({ error: "Invalid password" });

        // Get Progress
        const { progressMap, wordBank } = await db.getUserProgress(user.id);

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

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Data Routes ---

// Get All Vocabulary
app.get('/api/vocabulary', async (req, res) => {
    try {
        const rows = await db.getAllVocabulary();
        res.json({ message: "success", data: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sync Progress
app.post('/api/progress', async (req, res) => {
    const { userId, updates } = req.body;

    if (!userId || !updates) {
        res.status(400).json({ error: "Missing data" });
        return;
    }

    try {
        await db.upsertProgressBatch(userId, updates);
        res.json({ message: "Progress synced" });
    } catch (err) {
        console.error("Sync Error:", err);
        res.status(500).json({ error: "Failed to sync" });
    }
});

// Helper


const startServer = async () => {
    try {
        await db.initialize();
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
    } catch (err) {
        console.error("Failed to start server:", err);
    }
};

startServer();
