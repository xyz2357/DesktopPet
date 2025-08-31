import { CardData } from '../types/card';

/**
 * 测试工具函数集合
 */

// Mock卡片数据生成器
export const createMockCard = (overrides: Partial<CardData> = {}): CardData => {
  const baseCard = {
    id: `test-card-${Math.random().toString(36).substr(2, 9)}`,
    type: 'word' as const,
    jp: 'テスト',
    kana: 'てすと', 
    romaji: 'tesuto',
    cn: '测试',
    jlpt: 'N5' as const,
    ...overrides
  };
  
  return baseCard;
};

// 创建特定类型卡片
export const createWordCard = (overrides: Partial<CardData> = {}): CardData =>
  createMockCard({ type: 'word', ...overrides });

export const createAudioCard = (overrides: Partial<CardData> = {}): CardData =>
  createMockCard({ 
    type: 'audio', 
    audio_path: 'test.empty',
    choices: ['选项1', '选项2', '选项3'],
    correct_answer: '选项1',
    ...overrides 
  });

export const createArrangeCard = (overrides: Partial<CardData> = {}): CardData =>
  createMockCard({ 
    type: 'arrange',
    words_to_arrange: ['私', 'は', '学生', 'です'],
    correct_order: [0, 1, 2, 3],
    ...overrides 
  });

export const createImageCard = (overrides: Partial<CardData> = {}): CardData =>
  createMockCard({ 
    type: 'image',
    image_path: 'test.empty',
    kana: 'ねこ',
    romaji: 'neko',
    ...overrides 
  });

// Timer工具函数
export const mockTimers = () => {
  const timers: Array<{ callback: Function; delay: number }> = [];
  const originalSetTimeout = global.setTimeout;
  
  global.setTimeout = jest.fn((callback, delay) => {
    const id = timers.length;
    timers.push({ callback, delay });
    return id as any;
  }) as any;
  
  const triggerTimer = (index: number = 0) => {
    if (timers[index]) {
      timers[index].callback();
    }
  };
  
  const restore = () => {
    global.setTimeout = originalSetTimeout;
  };
  
  return { timers, triggerTimer, restore };
};

// 随机数Mock工具
export const mockRandom = (value: number) => {
  const originalRandom = Math.random;
  Math.random = jest.fn(() => value);
  return () => { Math.random = originalRandom; };
};

// 断言工具
export const expectCardValid = (card: CardData) => {
  expect(card.id).toBeTruthy();
  expect(card.type).toMatch(/^(word|sentence|example|grammar|image|audio|arrange)$/);
  expect(card.jp).toBeTruthy();
  expect(card.cn).toBeTruthy();
  expect(card.jlpt).toMatch(/^N[1-5]$/);
};

// 性能测试工具
export const measurePerformance = async (fn: () => Promise<void> | void) => {
  const start = performance.now();
  await fn();
  return performance.now() - start;
};

// 批量测试数据生成
export const createMockCards = (count: number, type?: CardData['type']): CardData[] => {
  return Array.from({ length: count }, (_, i) => 
    createMockCard({ 
      id: `test-card-${i}`, 
      jp: `テスト${i}`,
      ...(type && { type })
    })
  );
};