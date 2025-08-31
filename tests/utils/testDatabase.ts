/**
 * 测试数据库 - 为测试提供一致的数据状态管理
 */

import { CardData } from '../types/card';
import { createMockCards } from './testUtils';

class TestDatabase {
  private static instance: TestDatabase;
  private cards: Map<string, CardData> = new Map();
  private snapshots: Map<string, Map<string, CardData>> = new Map();

  private constructor() {
    this.reset();
  }

  static getInstance(): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase();
    }
    return TestDatabase.instance;
  }

  // 重置数据库到初始状态
  reset(): void {
    this.cards.clear();
    this.snapshots.clear();
    
    // 添加默认测试数据
    const defaultCards = createMockCards(10);
    defaultCards.forEach(card => {
      this.cards.set(card.id, card);
    });
  }

  // 添加卡片
  addCard(card: CardData): void {
    this.cards.set(card.id, { ...card });
  }

  // 获取卡片
  getCard(id: string): CardData | undefined {
    const card = this.cards.get(id);
    return card ? { ...card } : undefined;
  }

  // 获取所有卡片
  getAllCards(): CardData[] {
    return Array.from(this.cards.values()).map(card => ({ ...card }));
  }

  // 按类型获取卡片
  getCardsByType(type: CardData['type']): CardData[] {
    return this.getAllCards().filter(card => card.type === type);
  }

  // 创建快照
  createSnapshot(name: string): void {
    this.snapshots.set(name, new Map(this.cards));
  }

  // 恢复快照
  restoreSnapshot(name: string): boolean {
    const snapshot = this.snapshots.get(name);
    if (snapshot) {
      this.cards = new Map(snapshot);
      return true;
    }
    return false;
  }

  // 删除快照
  deleteSnapshot(name: string): boolean {
    return this.snapshots.delete(name);
  }

  // 获取统计信息
  getStats() {
    const cards = this.getAllCards();
    const typeStats = cards.reduce((acc, card) => {
      acc[card.type] = (acc[card.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: cards.length,
      byType: typeStats,
      snapshots: this.snapshots.size
    };
  }
}

// 导出单例实例
export const testDb = TestDatabase.getInstance();

// 提供便捷的钩子函数
export const withTestDb = () => {
  beforeEach(() => {
    testDb.createSnapshot('beforeEach');
  });

  afterEach(() => {
    testDb.restoreSnapshot('beforeEach');
    testDb.deleteSnapshot('beforeEach');
  });
};

// 性能测试工具
export const measureTestPerformance = (testName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 100) { // 超过100ms的测试会被标记
      console.warn(`⚠️  Slow test detected: ${testName} took ${duration.toFixed(2)}ms`);
    } else if (process.env.NODE_ENV === 'test' && process.env.VERBOSE === 'true') {
      console.log(`✅ ${testName} completed in ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  };
};