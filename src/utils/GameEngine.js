export class GameEngine {
    constructor(deck, userProgress = {}, userWordBank = [], onSaveProgress) {
        this.deck = deck;
        this.progress = userProgress;
        this.wordBank = userWordBank; // Array of IDs of failed words
        this.onSaveProgress = onSaveProgress; // Callback to save to user profile
        this.sessionQueue = this.createSessionQueue();
    }

    createSessionQueue() {
        // Priority 1: Word Bank (Failed words)
        const wordBankCards = this.deck.filter(card => this.wordBank.includes(card.id));

        // Priority 2: New/Due cards from Deck (Simplified randomization for now)
        const newCards = this.deck.filter(card => !this.wordBank.includes(card.id));
        const shuffledNew = [...newCards].sort(() => Math.random() - 0.5);

        // Mix: 50% Word Bank, 50% New
        return [...wordBankCards, ...shuffledNew];
    }

    getNextItem() {
        if (this.sessionQueue.length === 0) return null;

        const card = this.sessionQueue[0];

        // ALWAYS return hybrid data (Card + Quiz Options)
        const quizData = this.generateQuizOptions(card);

        return {
            type: 'hybrid', // Unified type
            data: {
                ...card,
                quiz: quizData
            }
        };
    }

    generateQuizOptions(correctCard) {
        // Select 3 distractors
        const distractors = this.deck
            .filter(c => c.id !== correctCard.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const options = [...distractors, correctCard].sort(() => Math.random() - 0.5);

        return {
            question: correctCard.dutch,
            answerId: correctCard.id,
            options: options.map(opt => ({ id: opt.id, text: opt.english }))
        };
    }

    processResult(cardId, success) {
        const currentLevel = this.progress[cardId]?.level || 0;
        let newLevel = currentLevel;

        if (success) {
            newLevel = Math.min(currentLevel + 1, 5);
            const bankIndex = this.wordBank.indexOf(cardId);
            if (bankIndex > -1) {
                this.wordBank.splice(bankIndex, 1);
            }
        } else {
            newLevel = Math.max(0, currentLevel - 1);
            if (!this.wordBank.includes(cardId)) {
                this.wordBank.push(cardId);
            }
        }

        this.progress[cardId] = {
            level: newLevel,
            lastReviewed: Date.now()
        };

        if (this.onSaveProgress) {
            // New signature: (changedItemId, newLevel, newWordBankStatus)
            this.onSaveProgress(cardId, newLevel, !success);
        }

        this.sessionQueue.shift();

        if (!success) {
            const card = this.deck.find(c => c.id === cardId);
            if (card) {
                const insertIndex = Math.min(this.sessionQueue.length, 3);
                this.sessionQueue.splice(insertIndex, 0, card);
            }
        }
    }

    getStats() {
        const total = this.deck.length;
        // Changed threshold: Level >= 1 is considered "Learned" (at least one correct answer)
        const learned = Object.values(this.progress).filter(p => p.level >= 1).length;
        const needsReview = this.wordBank.length;
        return { total, learned, needsReview };
    }

    getLists() {
        const learnedIds = Object.keys(this.progress).filter(id => this.progress[id].level >= 1).map(Number);

        const learned = this.deck.filter(c => learnedIds.includes(c.id));
        const wordBank = this.deck.filter(c => this.wordBank.includes(c.id));

        return { learned, wordBank };
    }
}
