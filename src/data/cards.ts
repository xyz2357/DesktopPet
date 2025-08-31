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
  },
  // 例句卡
  {
    id: 'e001',
    type: 'example',
    jp: '部屋が明るいです。',
    kana: 'へやがあかるいです。',
    romaji: 'heya ga akarui desu.',
    cn: '房间很明亮。',
    jlpt: 'N5'
  },
  {
    id: 'e002',
    type: 'example',
    jp: '今日はいい天気ですね。',
    kana: 'きょうはいいてんきですね。',
    romaji: 'kyou wa ii tenki desu ne.',
    cn: '今天天气真好呢。',
    jlpt: 'N5'
  },
  {
    id: 'e003',
    type: 'example',
    jp: '母は料理を作っています。',
    kana: 'はははりょうりをつくっています。',
    romaji: 'haha wa ryouri wo tsukutte imasu.',
    cn: '妈妈在做料理。',
    jlpt: 'N5'
  },
  // 语法卡
  {
    id: 'g001',
    type: 'grammar',
    jp: '〜ている',
    cn: '进行状态',
    grammar_pattern: 'V-ている',
    grammar_explanation: '表示动作正在进行或状态的持续',
    example_jp: '今、勉強しています。',
    example_cn: '现在正在学习。',
    jlpt: 'N5'
  },
  {
    id: 'g002',
    type: 'grammar',
    jp: '〜たことがある',
    cn: '有过...的经历',
    grammar_pattern: 'V-たことがある',
    grammar_explanation: '表示过去的经历或体验',
    example_jp: '日本に行ったことがあります。',
    example_cn: '我去过日本。',
    jlpt: 'N4'
  },
  {
    id: 'g003',
    type: 'grammar',
    jp: '〜と思います',
    cn: '我觉得...',
    grammar_pattern: 'V/Adj+と思います',
    grammar_explanation: '表示自己的想法或意见',
    example_jp: 'この映画は面白いと思います。',
    example_cn: '我觉得这部电影很有趣。',
    jlpt: 'N4'
  },
  // 图片卡
  {
    id: 'i001',
    type: 'image',
    jp: '食べ物',
    kana: 'たべもの',
    romaji: 'tabemono',
    cn: '食物',
    image_path: 'assets/images/food_01.empty.jpg',
    jlpt: 'N5'
  },
  {
    id: 'i002',
    type: 'image',
    jp: '学校',
    kana: 'がっこう',
    romaji: 'gakkou',
    cn: '学校',
    image_path: 'assets/images/school_01.empty.jpg',
    jlpt: 'N5'
  },
  {
    id: 'i003',
    type: 'image',
    jp: '天気',
    kana: 'てんき',
    romaji: 'tenki',
    cn: '天气',
    image_path: 'assets/images/weather_01.empty.jpg',
    jlpt: 'N5'
  },
  // 音频卡
  {
    id: 'a001',
    type: 'audio',
    jp: '音声練習',
    cn: '音频练习',
    audio_path: 'assets/audio/word_01.empty.mp3',
    choices: ['あかるい', 'あかりい', 'あかるび', 'あかるし'],
    correct_answer: 'あかるい',
    example_jp: '部屋が明るいです。',
    example_cn: '房间很明亮。',
    jlpt: 'N5'
  },
  {
    id: 'a002',
    type: 'audio',
    jp: '発音練習',
    cn: '发音练习',
    audio_path: 'assets/audio/sentence_01.empty.mp3',
    choices: ['ともだち', 'ともたち', 'とのだち', 'ともらち'],
    correct_answer: 'ともだち',
    example_jp: '友達と映画を見ました。',
    example_cn: '和朋友一起看了电影。',
    jlpt: 'N5'
  },
  // 拖拽拼句卡
  {
    id: 'ar001',
    type: 'arrange',
    jp: '私は学校に行きます。',
    cn: '我去学校。',
    words_to_arrange: ['私は', '学校に', '行きます', '。'],
    correct_order: [0, 1, 2, 3],
    jlpt: 'N5'
  },
  {
    id: 'ar002',
    type: 'arrange',
    jp: 'これは美味しいケーキです。',
    cn: '这是好吃的蛋糕。',
    words_to_arrange: ['これは', '美味しい', 'ケーキです', '。'],
    correct_order: [0, 1, 2, 3],
    jlpt: 'N5'
  },
  {
    id: 'ar003',
    type: 'arrange',
    jp: '友達と映画を見ました。',
    cn: '和朋友一起看了电影。',
    words_to_arrange: ['友達と', '映画を', '見ました', '。'],
    correct_order: [0, 1, 2, 3],
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