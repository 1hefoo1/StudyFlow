// Flashcards Module - Business logic for flashcards
export class FlashcardsModule {
    constructor() {
        this.decks = [];
        this.cards = [];
        this.currentDeck = null;
    }

    async init() {
        await this.loadDecks();
    }

    // Load decks
    async loadDecks() {
        this.decks = await db.getDecks();
    }

    // Load cards for a deck
    async loadCards(deckId) {
        this.cards = await db.getFlashcardsByDeck(deckId);
    }

    // Get deck by ID
    getDeck(deckId) {
        return this.decks.find(deck => deck.id === deckId);
    }

    // Get cards for current deck
    getCards() {
        return this.cards;
    }

    // Create deck
    async createDeck(data = {}) {
        const deck = {
            id: Helpers.generateId(),
            name: data.name || 'New Deck',
            description: data.description || '',
            createdAt: Date.now()
        };

        await db.saveDeck(deck);
        await this.loadDecks();
        return deck;
    }

    // Update deck
    async updateDeck(deckId, updates) {
        const deck = await db.getDeck(deckId);
        if (!deck) return null;

        Object.assign(deck, updates, { updatedAt: Date.now() });
        await db.saveDeck(deck);
        await this.loadDecks();
        return deck;
    }

    // Delete deck
    async deleteDeck(deckId) {
        await db.deleteDeck(deckId);
        await this.loadDecks();
        this.currentDeck = null;
        this.cards = [];
    }

    // Select deck
    async selectDeck(deckId) {
        this.currentDeck = deckId;
        await this.loadCards(deckId);
    }

    // Create card
    async createCard(data = {}) {
        if (!this.currentDeck) return null;

        const card = {
            id: Helpers.generateId(),
            deckId: this.currentDeck,
            front: data.front || '',
            back: data.back || '',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await db.saveFlashcard(card);
        await this.loadCards(this.currentDeck);
        return card;
    }

    // Update card
    async updateCard(cardId, updates) {
        const card = await db.getFlashcard(cardId);
        if (!card) return null;

        Object.assign(card, updates, { updatedAt: Date.now() });
        await db.saveFlashcard(card);
        await this.loadCards(this.currentDeck);
        return card;
    }

    // Delete card
    async deleteCard(cardId) {
        await db.deleteFlashcard(cardId);
        await this.loadCards(this.currentDeck);
    }

    // Get card by ID
    getCard(cardId) {
        return this.cards.find(card => card.id === cardId);
    }

    // Get deck statistics
    getDeckStats(deckId) {
        const cards = this.cards;
        const totalCards = cards.length;
        
        return {
            totalCards,
            deckName: this.getDeck(deckId)?.name || 'Unknown'
        };
    }

    // Shuffle cards
    shuffleCards() {
        this.cards = Helpers.shuffle([...this.cards]);
    }

    // Sort cards
    sortCards(sortBy = 'createdAt') {
        this.cards = Helpers.sortBy(this.cards, sortBy, 'desc');
    }

    // Search cards
    searchCards(query) {
        if (!query) return this.cards;
        
        const lowerQuery = query.toLowerCase();
        return this.cards.filter(card => 
            card.front?.toLowerCase().includes(lowerQuery) ||
            card.back?.toLowerCase().includes(lowerQuery)
        );
    }

    // Export deck
    async exportDeck(deckId) {
        const deck = this.getDeck(deckId);
        const cards = this.cards;
        
        return {
            deck,
            cards,
            exportedAt: Date.now()
        };
    }

    // Import deck
    async importDeck(data) {
        if (!data.deck) return null;

        const deck = await this.createDeck(data.deck);
        
        if (data.cards) {
            for (const card of data.cards) {
                await this.createCard(card);
            }
        }
        
        return deck;
    }

    // Get study progress
    getStudyProgress() {
        if (this.cards.length === 0) return 0;
        
        // This is a simplified version - in a real app, you'd track which cards have been studied
        return {
            total: this.cards.length,
            studied: 0,
            remaining: this.cards.length,
            percentage: 0
        };
    }

    // Reset deck progress
    async resetProgress() {
        // In a real app, this would reset study progress for the deck
        await this.loadCards(this.currentDeck);
    }

    // Duplicate card
    async duplicateCard(cardId) {
        const card = this.getCard(cardId);
        if (!card) return null;

        return await this.createCard({
            front: card.front,
            back: card.back
        });
    }

    // Get cards by difficulty (for spaced repetition)
    getCardsByDifficulty(difficulty) {
        // Placeholder for future spaced repetition implementation
        return this.cards;
    }

    // Update card difficulty
    async updateCardDifficulty(cardId, difficulty) {
        // Placeholder for future spaced repetition implementation
        const card = await db.getFlashcard(cardId);
        if (card) {
            card.difficulty = difficulty;
            card.lastReviewed = Date.now();
            await db.saveFlashcard(card);
            await this.loadCards(this.currentDeck);
        }
    }
}

// Singleton instance
export const flashcardsModule = new FlashcardsModule();