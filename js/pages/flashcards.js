// Flashcards Page
import { DateUtils } from '../utils/date.js';
import { db } from '../database.js';
import { Helpers } from '../utils/helpers.js';

export class FlashcardsPage {
    constructor() {
        this.container = null;
        this.decks = [];
        this.currentDeck = null;
        this.cards = [];
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.studyMode = false;
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'flashcards-page';
        this.container.innerHTML = `
            <div class="page-header">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-md);">
                    <div>
                        <h1 class="page-title">Flashcards</h1>
                        <p class="page-subtitle">Master your knowledge with spaced repetition</p>
                    </div>
                    <button class="btn btn-primary" onclick="flashcardsPage.createDeck()">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 4v12M4 10h12"/>
                        </svg>
                        <span>New Deck</span>
                    </button>
                </div>
            </div>
            
            <div class="flashcards-layout">
                <aside class="flashcards-sidebar">
                    <div class="decks-list" id="decks-list">
                        <!-- Decks will be rendered here -->
                    </div>
                </aside>
                
                <main class="flashcards-main">
                    <div id="flashcards-content">
                        <!-- Content will be rendered here -->
                    </div>
                </main>
            </div>
        `;
        
        return this.container;
    }

    async init() {
        await this.loadDecks();
        if (this.decks.length > 0) {
            await this.selectDeck(this.decks[0].id);
        } else {
            this.renderEmptyState();
        }
    }

    getTitle() {
        return 'Flashcards';
    }

    renderEmptyState() {
        const content = document.getElementById('flashcards-content');
        if (!content) return;

        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎴</div>
                <div class="empty-state-title">No decks yet</div>
                <div class="empty-state-description">Create your first deck to start studying</div>
                <button class="btn btn-primary" onclick="flashcardsPage.createDeck()">Create Deck</button>
            </div>
        `;
    }

    async loadDecks() {
        this.decks = await db.getDecks();
        const container = document.getElementById('decks-list');
        if (!container) return;

        if (this.decks.length === 0) {
            container.innerHTML = '<p class="text-tertiary" style="padding: var(--spacing-md); font-size: var(--font-size-sm);">No decks yet</p>';
            return;
        }

        // Get card counts for all decks
        const decksWithCounts = await Promise.all(
            this.decks.map(async (deck) => {
                const cards = await db.getFlashcardsByDeck(deck.id);
                return { ...deck, cardCount: cards.length };
            })
        );

        container.innerHTML = decksWithCounts.map(deck => {
            return `
                <div class="deck-item ${this.currentDeck === deck.id ? 'active' : ''}" 
                     onclick="flashcardsPage.selectDeck('${deck.id}')"
                     style="display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-md); border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-fast); margin-bottom: var(--spacing-sm); ${this.currentDeck === deck.id ? 'background: var(--color-bg-hover);' : ''}">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: var(--font-weight-medium); color: var(--color-text-primary); margin-bottom: var(--spacing-xs);">${deck.name}</div>
                        <div style="font-size: var(--font-size-sm); color: var(--color-text-tertiary);">${deck.cardCount} cards</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async selectDeck(deckId) {
        this.currentDeck = deckId;
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.studyMode = false;
        
        await this.loadDecks();
        await this.loadCards();
        this.renderDeckView();
    }

    async loadCards() {
        if (!this.currentDeck) return;
        this.cards = await db.getFlashcardsByDeck(this.currentDeck);
    }

    renderDeckView() {
        const content = document.getElementById('flashcards-content');
        if (!content) return;

        if (this.cards.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <div class="empty-state-title">No cards in this deck</div>
                    <div class="empty-state-description">Add cards to start studying</div>
                    <button class="btn btn-primary" onclick="flashcardsPage.createCard()">Add Card</button>
                </div>
            `;
            return;
        }

        const deck = this.decks.find(d => d.id === this.currentDeck);
        content.innerHTML = `
            <div class="deck-header" style="margin-bottom: var(--spacing-xl);">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-md);">
                    <div>
                        <h2 class="section-title">${deck?.name || 'Deck'}</h2>
                        <p class="section-description">${this.cards.length} cards</p>
                    </div>
                    <div style="display: flex; gap: var(--spacing-sm);">
                        <button class="btn btn-primary" onclick="flashcardsPage.startStudy()">Study</button>
                        <button class="btn btn-secondary" onclick="flashcardsPage.createCard()">Add Card</button>
                    </div>
                </div>
            </div>
            
            <div class="cards-list" id="cards-list">
                ${this.cards.map((card, index) => `
                    <div class="card" style="margin-bottom: var(--spacing-md);">
                        <div class="card-header">
                            <div style="flex: 1; min-width: 0;">
                                <div class="card-title">${card.front || 'Card ' + (index + 1)}</div>
                                <div class="card-description">${this.stripHtml(card.back || '').substring(0, 100)}</div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="card-meta">
                                <span>Card ${index + 1} of ${this.cards.length}</span>
                            </div>
                            <div class="list-item-actions" style="opacity: 1;">
                                <button class="btn btn-sm btn-ghost" onclick="flashcardsPage.editCard('${card.id}')">Edit</button>
                                <button class="btn btn-sm btn-ghost" onclick="flashcardsPage.deleteCard('${card.id}')">Delete</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderStudyMode() {
        const content = document.getElementById('flashcards-content');
        if (!content || this.cards.length === 0) return;

        const card = this.cards[this.currentCardIndex];
        const progress = ((this.currentCardIndex + 1) / this.cards.length) * 100;

        content.innerHTML = `
            <div class="study-container">
                <div class="study-header" style="margin-bottom: var(--spacing-xl);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-md);">
                        <span class="text-secondary">Card ${this.currentCardIndex + 1} of ${this.cards.length}</span>
                        <button class="btn btn-sm btn-ghost" onclick="flashcardsPage.exitStudy()">Exit</button>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="flashcard" onclick="flashcardsPage.flipCard()">
                    <div class="flashcard-inner ${this.isFlipped ? 'flipped' : ''}">
                        <div class="flashcard-front">
                            <div class="flashcard-content">
                                ${card.front || 'Card ' + (this.currentCardIndex + 1)}
                            </div>
                        </div>
                        <div class="flashcard-back">
                            <div class="flashcard-content">
                                ${card.back || ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="study-controls" style="display: flex; justify-content: center; gap: var(--spacing-md); margin-top: var(--spacing-xl);">
                    <button class="btn btn-secondary" onclick="flashcardsPage.prevCard()" ${this.currentCardIndex === 0 ? 'disabled' : ''}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 4l-6 6 6 6"/>
                        </svg>
                        <span>Previous</span>
                    </button>
                    <button class="btn btn-primary" onclick="flashcardsPage.flipCard()">
                        <span>Flip Card</span>
                    </button>
                    <button class="btn btn-secondary" onclick="flashcardsPage.nextCard()" ${this.currentCardIndex === this.cards.length - 1 ? 'disabled' : ''}>
                        <span>Next</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 4l6 6-6 6"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    startStudy() {
        if (this.cards.length === 0) return;
        this.studyMode = true;
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.renderStudyMode();
    }

    exitStudy() {
        this.studyMode = false;
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.renderDeckView();
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        const flashcard = this.container.querySelector('.flashcard-inner');
        if (flashcard) {
            flashcard.classList.toggle('flipped', this.isFlipped);
        }
    }

    prevCard() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.isFlipped = false;
            this.renderStudyMode();
        }
    }

    nextCard() {
        if (this.currentCardIndex < this.cards.length - 1) {
            this.currentCardIndex++;
            this.isFlipped = false;
            this.renderStudyMode();
        }
    }

    async createDeck() {
        const name = prompt('Enter deck name:');
        if (!name) return;

        const deck = {
            id: Helpers.generateId(),
            name,
            description: '',
            createdAt: Date.now()
        };

        await db.saveDeck(deck);
        await this.loadDecks();
        await this.selectDeck(deck.id);
        toast.success('Deck created', `"${name}" has been created`);
    }

    async createCard() {
        if (!this.currentDeck) return;

        const content = `
            <form id="card-form" onsubmit="event.preventDefault(); flashcardsPage.saveCard();">
                <div class="form-group">
                    <label class="form-label form-label-required">Front</label>
                    <textarea class="form-textarea" id="card-front" rows="3" placeholder="Question or term..." required></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label form-label-required">Back</label>
                    <textarea class="form-textarea" id="card-back" rows="3" placeholder="Answer or definition..." required></textarea>
                </div>
            </form>
        `;

        modal.open({
            title: 'Add Card',
            content,
            size: 'md',
            footer: `
                <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
                <button class="btn btn-primary" onclick="flashcardsPage.saveCard()">Add Card</button>
            `
        });
    }

    async saveCard(cardId = null) {
        const front = document.getElementById('card-front')?.value || '';
        const back = document.getElementById('card-back')?.value || '';

        if (!front || !back) {
            toast.error('Error', 'Please fill in both sides of the card');
            return;
        }

        const card = {
            id: cardId || Helpers.generateId(),
            deckId: this.currentDeck,
            front,
            back,
            createdAt: cardId ? undefined : Date.now(),
            updatedAt: Date.now()
        };

        await db.saveFlashcard(card);
        toast.success('Card saved', 'Your flashcard has been created');
        modal.close();
        await this.loadCards();
        this.renderDeckView();
    }

    async editCard(cardId) {
        const card = await db.getFlashcard(cardId);
        if (!card) return;

        const content = `
            <form id="card-form" onsubmit="event.preventDefault(); flashcardsPage.saveCard('${cardId}');">
                <div class="form-group">
                    <label class="form-label form-label-required">Front</label>
                    <textarea class="form-textarea" id="card-front" rows="3" placeholder="Question or term..." required>${card.front || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label form-label-required">Back</label>
                    <textarea class="form-textarea" id="card-back" rows="3" placeholder="Answer or definition..." required>${card.back || ''}</textarea>
                </div>
            </form>
        `;

        modal.open({
            title: 'Edit Card',
            content,
            size: 'md',
            footer: `
                <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
                <button class="btn btn-primary" onclick="flashcardsPage.saveCard('${cardId}')">Save Changes</button>
            `
        });
    }

    async deleteCard(cardId) {
        if (!confirm('Are you sure you want to delete this card?')) return;

        await db.deleteFlashcard(cardId);
        await this.loadCards();
        this.renderDeckView();
        toast.success('Card deleted', 'The card has been removed');
    }

    stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }
}

// Make it globally accessible
window.flashcardsPage = new FlashcardsPage();