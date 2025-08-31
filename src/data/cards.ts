import { CardData } from '../types/card';

// Hard-coded词汇数据用于MVP
export const cardData: CardData[] = [
  {
    id: 'w001',
    type: 'word',
    jp: '勉強',
    kana: 'べんきょう',
    romaji: 'benkyou',
    cn: '学习',
    example_jp: '日本語を勉強します。',
    example_cn: '我学习日语。',
    jlpt: 'N5'
  },
  {
    id: 'w002',
    type: 'word',
    jp: '友達',
    kana: 'ともだち',
    romaji: 'tomodachi',
    cn: '朋友',
    example_jp: '友達と映画を見ました。',
    example_cn: '和朋友一起看了电影。',
    jlpt: 'N5'
  },
  {
    id: 'w003',
    type: 'word',
    jp: '仕事',
    kana: 'しごと',
    romaji: 'shigoto',
    cn: '工作',
    example_jp: '仕事が忙しいです。',
    example_cn: '工作很忙。',
    jlpt: 'N5'
  },
  {
    id: 'w004',
    type: 'word',
    jp: '美味しい',
    kana: 'おいしい',
    romaji: 'oishii',
    cn: '好吃的',
    example_jp: 'このケーキは美味しいです。',
    example_cn: '这个蛋糕很好吃。',
    jlpt: 'N5'
  },
  {
    id: 'w005',
    type: 'word',
    jp: '大きい',
    kana: 'おおきい',
    romaji: 'ookii',
    cn: '大的',
    example_jp: '大きい家に住んでいます。',
    example_cn: '住在大房子里。',
    jlpt: 'N5'
  },
  {
    id: 's001',
    type: 'sentence',
    jp: 'おはようございます',
    kana: 'おはようございます',
    romaji: 'ohayou gozaimasu',
    cn: '早上好',
    jlpt: 'N5'
  },
  {
    id: 's002',
    type: 'sentence',
    jp: 'ありがとうございます',
    kana: 'ありがとうございます',
    romaji: 'arigatou gozaimasu',
    cn: '谢谢',
    jlpt: 'N5'
  },
  {
    id: 's003',
    type: 'sentence',
    jp: 'すみません',
    kana: 'すみません',
    romaji: 'sumimasen',
    cn: '对不起/不好意思',
    jlpt: 'N5'
  },
  {
    id: 'w006',
    type: 'word',
    jp: '先生',
    kana: 'せんせい',
    romaji: 'sensei',
    cn: '老师',
    example_jp: '田中先生は親切です。',
    example_cn: '田中老师很亲切。',
    jlpt: 'N5'
  },
  {
    id: 'w007',
    type: 'word',
    jp: '学校',
    kana: 'がっこう',
    romaji: 'gakkou',
    cn: '学校',
    example_jp: '学校に行きます。',
    example_cn: '去学校。',
    jlpt: 'N5'
  }
];

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
        if (Math.random() < 0.5) {
          this.reviewPool.push(card); // 50%概率再加一次
        }
        break;
      case 'later':
        // 稍后的卡片延迟一段时间后再次出现
        setTimeout(() => {
          this.reviewPool.push(card);
        }, 5 * 60 * 1000); // 5分钟后再次出现
        break;
      case 'know':
        // 会了的卡片减少出现频率，但仍会偶尔复习
        if (Math.random() < 0.2) {
          setTimeout(() => {
            this.reviewPool.push(card);
          }, 30 * 60 * 1000); // 30分钟后20%概率复习
        }
        break;
    }

    console.log(`Card ${cardId} answered: ${result}. Review pool size: ${this.reviewPool.length}`);
  }
}

// 全局卡片管理器实例
export const globalCardManager = new CardManager(cardData);