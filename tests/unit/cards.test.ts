import { CardManager, cardData } from '../../src/data/cards';
import { CardData } from '../../src/types/card';

const mockCard: CardData = {
  id: 'test-card-1',
  type: 'word',
  jp: 'テスト',
  kana: 'てすと',
  romaji: 'tesuto',
  cn: '测试',
  example_jp: 'これはテストです。',
  example_cn: '这是测试。',
  jlpt: 'N5',
};

const mockCards: CardData[] = [
  mockCard,
  {
    id: 'test-card-2',
    type: 'sentence',
    jp: 'こんにちは',
    kana: 'こんにちは',
    romaji: 'konnichiwa',
    cn: '你好',
    jlpt: 'N5',
  },
  {
    id: 'test-card-3',
    type: 'word',
    jp: '猫',
    kana: 'ねこ',
    romaji: 'neko',
    cn: '猫',
    jlpt: 'N5',
  },
];

describe('CardManager', () => {
  let cardManager: CardManager;

  beforeEach(() => {
    cardManager = new CardManager(mockCards);
  });

  describe('constructor', () => {
    it('initializes with provided cards', () => {
      const manager = new CardManager(mockCards);
      expect(manager).toBeInstanceOf(CardManager);
    });

    it('creates a copy of the cards array', () => {
      const originalCards = [...mockCards];
      const manager = new CardManager(mockCards);
      
      // Getting cards should not affect the original array
      manager.getNextCard();
      expect(mockCards).toEqual(originalCards);
    });
  });

  describe('getNextCard', () => {
    it('returns a card from the deck', () => {
      const card = cardManager.getNextCard();
      expect(card).toBeDefined();
      expect(card.id).toBeDefined();
      expect(card.jp).toBeDefined();
    });

    it('returns cards in sequence and loops back to start', () => {
      const cards = [];
      
      // Get all cards once
      for (let i = 0; i < mockCards.length; i++) {
        cards.push(cardManager.getNextCard());
      }
      
      // Should have gotten all cards
      expect(cards).toHaveLength(mockCards.length);
      
      // Getting next card should loop back and give us a card again
      const nextCard = cardManager.getNextCard();
      expect(nextCard).toBeDefined();
    });

    it('prioritizes review pool over main deck', () => {
      // First get a card and mark it for review
      const firstCard = cardManager.getNextCard();
      cardManager.submitAnswer(firstCard.id, 'unknown');
      
      // Next card should be from review pool (the same card)
      const reviewCard = cardManager.getNextCard();
      expect(reviewCard.id).toBe(firstCard.id);
    });

    it('shuffles cards when cycling through deck', () => {
      const firstRound = [];
      const secondRound = [];
      
      // Get first round of cards
      for (let i = 0; i < mockCards.length; i++) {
        firstRound.push(cardManager.getNextCard().id);
      }
      
      // Get second round of cards
      for (let i = 0; i < mockCards.length; i++) {
        secondRound.push(cardManager.getNextCard().id);
      }
      
      // Both rounds should have all cards, but potentially different order
      expect(firstRound.sort()).toEqual(mockCards.map(c => c.id).sort());
      expect(secondRound.sort()).toEqual(mockCards.map(c => c.id).sort());
    });
  });

  describe('submitAnswer', () => {
    let testCard: CardData;

    beforeEach(() => {
      testCard = cardManager.getNextCard();
    });

    it('handles "unknown" answer correctly', () => {
      cardManager.submitAnswer(testCard.id, 'unknown');
      
      // Next card should be from review pool (the same card we just answered)
      const nextCard = cardManager.getNextCard();
      expect(nextCard.id).toBe(testCard.id);
    });

    it('handles "know" answer correctly', () => {
      // Mock Math.random to control probability
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1); // Less than 0.2, so should schedule review
      
      cardManager.submitAnswer(testCard.id, 'know');
      
      // Should not immediately add to review pool
      const nextCard = cardManager.getNextCard();
      expect(nextCard.id).not.toBe(testCard.id);
      
      Math.random = originalRandom;
    });

    it('handles "later" answer correctly', () => {
      jest.useFakeTimers();
      
      cardManager.submitAnswer(testCard.id, 'later');
      
      // Should not immediately add to review pool
      const nextCard = cardManager.getNextCard();
      expect(nextCard.id).not.toBe(testCard.id);
      
      jest.useRealTimers();
    });

    it('ignores answer for non-existent card', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      cardManager.submitAnswer('non-existent-id', 'know');
      
      // Should not log anything for non-existent card
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('logs answer submission', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      cardManager.submitAnswer(testCard.id, 'know');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Card ${testCard.id} answered: know`)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('review pool management', () => {
    it('adds unknown cards to review pool multiple times with probability', () => {
      const testCard = cardManager.getNextCard();
      
      // Mock Math.random to control probability
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.3); // Less than 0.5, should add twice
      
      cardManager.submitAnswer(testCard.id, 'unknown');
      
      // Should get the same card twice from review pool
      const firstReview = cardManager.getNextCard();
      const secondReview = cardManager.getNextCard();
      
      expect(firstReview.id).toBe(testCard.id);
      expect(secondReview.id).toBe(testCard.id);
      
      Math.random = originalRandom;
    });

    it('handles empty review pool correctly', () => {
      // Initially review pool should be empty, so should get cards from main deck
      const card1 = cardManager.getNextCard();
      const card2 = cardManager.getNextCard();
      
      expect(card1).toBeDefined();
      expect(card2).toBeDefined();
    });
  });

  describe('probability-based behavior', () => {
    it('sometimes adds extra review for unknown cards', () => {
      const testCard = cardManager.getNextCard();
      
      // Test both probability outcomes
      const originalRandom = Math.random;
      
      // Test case where extra review is NOT added (random >= 0.5)
      Math.random = jest.fn(() => 0.7);
      cardManager.submitAnswer(testCard.id, 'unknown');
      
      const reviewCard = cardManager.getNextCard();
      expect(reviewCard.id).toBe(testCard.id);
      
      // Should not have another copy in review pool
      const nextCard = cardManager.getNextCard();
      expect(nextCard.id).not.toBe(testCard.id);
      
      Math.random = originalRandom;
    });

    it('sometimes schedules review for known cards', () => {
      const testCard = cardManager.getNextCard();
      
      const originalRandom = Math.random;
      const originalSetTimeout = global.setTimeout;
      
      // Mock setTimeout to capture the callback
      const timeoutCallbacks: Array<() => void> = [];
      global.setTimeout = jest.fn((callback, delay) => {
        timeoutCallbacks.push(callback);
        return 123 as any; // Mock timer ID
      }) as any;
      
      // Test case where review IS scheduled (random < 0.2)
      Math.random = jest.fn(() => 0.1);
      
      cardManager.submitAnswer(testCard.id, 'know');
      
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        30 * 60 * 1000 // 30 minutes
      );
      
      Math.random = originalRandom;
      global.setTimeout = originalSetTimeout;
    });
  });
});

describe('cardData', () => {
  it('contains valid card data', () => {
    expect(cardData).toBeDefined();
    expect(Array.isArray(cardData)).toBe(true);
    expect(cardData.length).toBeGreaterThan(0);
    
    cardData.forEach(card => {
      expect(card.id).toBeDefined();
      expect(card.type).toMatch(/^(word|sentence|example|grammar|image|audio|arrange)$/);
      expect(card.jp).toBeDefined();
      expect(card.cn).toBeDefined();
      expect(card.jlpt).toBeDefined();
      
      // kana 和 romaji 对于某些类型是可选的
      if (card.type === 'word' || card.type === 'sentence' || card.type === 'example' || card.type === 'image') {
        expect(card.kana).toBeDefined();
        expect(card.romaji).toBeDefined();
      }
      
      // 检查特殊字段
      if (card.type === 'grammar') {
        expect(card.grammar_pattern || card.grammar_explanation).toBeTruthy();
      }
      
      if (card.type === 'image') {
        expect(card.image_path).toBeDefined();
      }
      
      if (card.type === 'audio') {
        expect(card.audio_path).toBeDefined();
        expect(card.choices).toBeDefined();
        expect(card.correct_answer).toBeDefined();
      }
      
      if (card.type === 'arrange') {
        expect(card.words_to_arrange).toBeDefined();
        expect(card.correct_order).toBeDefined();
      }
    });
  });

  it('contains different types of cards', () => {
    const words = cardData.filter(card => card.type === 'word');
    const sentences = cardData.filter(card => card.type === 'sentence');
    const examples = cardData.filter(card => card.type === 'example');
    const grammars = cardData.filter(card => card.type === 'grammar');
    const images = cardData.filter(card => card.type === 'image');
    const audios = cardData.filter(card => card.type === 'audio');
    const arranges = cardData.filter(card => card.type === 'arrange');
    
    expect(words.length).toBeGreaterThan(0);
    expect(sentences.length).toBeGreaterThan(0);
    expect(examples.length).toBeGreaterThan(0);
    expect(grammars.length).toBeGreaterThan(0);
    expect(images.length).toBeGreaterThan(0);
    expect(audios.length).toBeGreaterThan(0);
    expect(arranges.length).toBeGreaterThan(0);
  });

  it('has unique card IDs', () => {
    const ids = cardData.map(card => card.id);
    const uniqueIds = [...new Set(ids)];
    
    expect(uniqueIds.length).toBe(ids.length);
  });
});