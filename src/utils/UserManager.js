const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class UserManager {
    constructor() {
        this.currentUser = null;
    }

    async getAllUsers() {
        try {
            const response = await fetch(`${API_URL}/users`);
            const json = await response.json();
            return json.data || [];
        } catch (error) {
            console.error('Failed to load users:', error);
            return [];
        }
    }

    // Register
    async register(username, email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Registration failed');

            this.currentUser = data.user;
            this._saveSession(this.currentUser.id);
            return this.currentUser;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Login
    async login(identifier, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');

            this.currentUser = data.user;
            this._saveSession(this.currentUser.id);
            return this.currentUser;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Sync Progress
    async saveProgress(userId, progressUpdates) {
        // progressUpdates should be an array of { vocabId, level, inWordBank }
        // The Engine typically updates the entire progress object.
        // We need to adapt the Engine or this Manager.

        // For efficiency, we just send what changed, but the Engine currently passes the whole state.
        // Let's modify App/Engine to pass delta, OR we just ignore this for now and use the API 
        // that accepts a "sync" format.

        // Actually, the Engine logic calls onSaveProgress(newProgress, newWordBank).
        // Sending the WHOLE progress every time is inefficient but simplest for now given the lack of diffing in Engine.
        // BUT, my API expects `updates` array.

        // Let's do a simple transformation here if possible, OR mostly:
        // The API endpoint `POST /api/progress` is designed for batched updates.

        // Strategy: We will modify App.jsx/GameEngine to pass the specific item that changed.

        // For now, let's keep this method generic.
        try {
            await fetch(`${API_URL}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, updates: progressUpdates })
            });
        } catch (error) {
            console.error('Save progress error:', error);
        }
    }

    async getVocabulary() {
        try {
            const response = await fetch(`${API_URL}/vocabulary`);
            const json = await response.json();
            return json.data;
        } catch (error) {
            console.error('Failed to load vocab:', error);
            return [];
        }
    }

    // --- Session Management ---

    _saveSession(userId) {
        localStorage.setItem('flashnl_user_id', userId);
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('flashnl_user_id');
    }

    async checkForSession() {
        const userId = localStorage.getItem('flashnl_user_id');
        if (!userId) return null;

        try {
            const response = await fetch(`${API_URL}/users/${userId}`);
            if (!response.ok) {
                // Invalid session (user deleted?)
                this.logout();
                return null;
            }
            const data = await response.json();
            this.currentUser = data.user;
            return this.currentUser;
        } catch (err) {
            console.error("Session restore failed:", err);
            return null;
        }
    }

    async keepAlive() {
        try {
            // Remove '/api' from the end to get the base URL
            const baseUrl = API_URL.replace(/\/api$/, '');
            const response = await fetch(`${baseUrl}/health`);
            if (response.ok) {
                console.log('Health check: OK');
            }
        } catch (err) {
            console.error('Health check failed:', err);
        }
    }
}
