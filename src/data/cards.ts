import { CardData } from '../types/card';
import { LearningConfig } from '../config/appConfig';
import { allCards, cardsByType, getRandomCard, getRelatedCards } from './cards/index';

// 导出所有卡片数据（向后兼容）
export const cardData: CardData[] = allCards;

// 导出按类型分组的数据
export { cardsByType, getRandomCard, getRelatedCards };

// 简单的学习进度管理类
export class CardManager {
  private cards: CardData[];
  private currentIndex: number = 0;
  private reviewPool: CardData[] = [];

  constructor(cards: CardData[]) {
    this.cards = [...cards];
    this.shuffleCards();
  }

  private shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  getNextCard(): CardData {
    // 优先从复习池获取
    if (this.reviewPool.length > 0) {
      return this.reviewPool.shift()!;
    }

    // 从主卡池获取
    if (this.currentIndex >= this.cards.length) {
      this.currentIndex = 0;
      this.shuffleCards();
    }

    return this.cards[this.currentIndex++];
  }

  submitAnswer(cardId: string, result: 'know' | 'unknown' | 'later'): void {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return;

    switch (result) {
      case 'unknown':
        // 不会的卡片加入复习池，增加复习频率
        this.reviewPool.push(card);
        if (Math.random() < LearningConfig.cards.errorRetryProbability) {
          this.reviewPool.push(card);
        }
        break;
      case 'later':
        // 稍后的卡片延迟一段时间后再次出现
        setTimeout(() => {
          this.reviewPool.push(card);
        }, LearningConfig.cards.errorRetryDelay);
        break;
      case 'know':
        // 会了的卡片减少出现频率，但仍会偶尔复习
        if (Math.random() < LearningConfig.cards.reviewProbability) {
          setTimeout(() => {
            this.reviewPool.push(card);
          }, LearningConfig.cards.reviewDelay);
        }
        break;
    }

    console.log(`Card ${cardId} answered: ${result}. Review pool size: ${this.reviewPool.length}`);
  }
  
  // 新增：按类型获取卡片
  getCardsByType(type: string): CardData[] {
    return this.cards.filter(card => card.type === type);
  }
  
  // 新增：按难度获取卡片
  getCardsByDifficulty(difficulty: number): CardData[] {
    return this.cards.filter(card => (card as any).difficulty === difficulty);
  }
  
  // 新增：获取随机特定类型的卡片
  getRandomCardByType(type?: string): CardData {
    if (type) {
      const typeCards = this.getCardsByType(type);
      if (typeCards.length > 0) {
        return typeCards[Math.floor(Math.random() * typeCards.length)];
      }
    }
    return this.getNextCard();
  }
}

// 全局卡片管理器实例
export const globalCardManager = new CardManager(cardData);