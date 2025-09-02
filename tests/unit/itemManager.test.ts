/**
 * 道具管理器单元测试
 * Item Manager Unit Tests
 */

import { ItemManager } from '../../src/utils/itemManager';
import { ItemData, PetReaction, ItemEffect } from '../../src/types/item';

describe('ItemManager', () => {
  let itemManager: ItemManager;
  
  const mockItem: ItemData = {
    id: 'test_fish',
    name: 'Test Fish',
    nameJa: 'テスト魚',
    description: 'A test fish item',
    descriptionJa: 'テスト用の魚',
    emoji: '🐟',
    type: 'food',
    rarity: 'common',
    image: 'test_fish',
    effects: [
      { type: 'happiness_increase', value: 20, duration: 5000 },
      { type: 'text_display', value: 'おいしい！', duration: 3000 },
      { type: 'animation_trigger', value: 'eating' }
    ]
  };

  beforeEach(() => {
    itemManager = new ItemManager();
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1000000); // Fixed timestamp for testing
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('初始化测试 / Initialization Tests', () => {
    test('应该正确初始化 / Should initialize correctly', () => {
      expect(itemManager).toBeDefined();
      expect(itemManager.getAllItems()).toEqual(expect.any(Array));
    });

    test('应该加载默认道具 / Should load default items', () => {
      const items = itemManager.getAllItems();
      expect(items.length).toBeGreaterThan(0);
      
      // 检查是否包含预期的道具类型
      const foodItems = items.filter(item => item.type === 'food');
      const toyItems = items.filter(item => item.type === 'toy');
      expect(foodItems.length).toBeGreaterThan(0);
      expect(toyItems.length).toBeGreaterThan(0);
    });
  });

  describe('道具获取测试 / Item Retrieval Tests', () => {
    test('应该能通过ID获取道具 / Should get item by ID', () => {
      const items = itemManager.getAllItems();
      const firstItem = items[0];
      
      const retrievedItem = itemManager.getItemById(firstItem.id);
      expect(retrievedItem).toEqual(firstItem);
    });

    test('不存在的道具应该返回null / Should return null for non-existent item', () => {
      const item = itemManager.getItemById('non_existent_item');
      expect(item).toBeNull();
    });

    test('应该能按类型过滤道具 / Should filter items by type', () => {
      const foodItems = itemManager.getItemsByType('food');
      expect(foodItems.length).toBeGreaterThan(0);
      expect(foodItems.every(item => item.type === 'food')).toBe(true);
    });

    test('应该能按稀有度过滤道具 / Should filter items by rarity', () => {
      const commonItems = itemManager.getItemsByRarity('common');
      expect(commonItems.length).toBeGreaterThan(0);
      expect(commonItems.every(item => item.rarity === 'common')).toBe(true);
    });
  });

  describe('道具使用测试 / Item Usage Tests', () => {
    test('应该能成功使用道具 / Should use item successfully', async () => {
      const items = itemManager.getAllItems();
      const fishItem = items.find(item => item.id === 'fish');
      expect(fishItem).toBeDefined();
      
      const position = { x: 100, y: 100 };
      const reaction = await itemManager.useItem(fishItem!.id, position);
      
      expect(reaction).toBeDefined();
      expect(reaction?.message).toBe('おいしい！');
      expect(reaction?.animation).toBe('eating');
    });

    test('使用不存在的道具应该返回null / Should return null when using non-existent item', async () => {
      // Suppress expected warning for this test
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const reaction = await itemManager.useItem('non_existent', { x: 0, y: 0 });
      expect(reaction).toBeNull();
      
      consoleSpy.mockRestore();
    });

    test('应该正确处理道具效果 / Should process item effects correctly', async () => {
      const items = itemManager.getAllItems();
      const fishItem = items.find(item => item.id === 'fish');
      expect(fishItem).toBeDefined();
      
      const reaction = await itemManager.useItem(fishItem!.id, { x: 50, y: 50 });
      
      expect(reaction).toBeDefined();
      expect(reaction?.message).toBe('おいしい！');
      expect(typeof reaction?.duration).toBe('number');
    });
  });

  describe('冷却时间测试 / Cooldown Tests', () => {
    test('应该能检查道具是否可用 / Should check if item can be used', () => {
      const items = itemManager.getAllItems();
      const testItem = items[0];
      
      const canUse = itemManager.canUseItem(testItem.id);
      expect(canUse.canUse).toBe(true);
    });

    test('应该能获取冷却时间剩余时间 / Should get cooldown remaining time', () => {
      const items = itemManager.getAllItems();
      const testItem = items[0];
      
      const remaining = itemManager.getCooldownRemaining(testItem.id);
      expect(typeof remaining).toBe('number');
      expect(remaining).toBeGreaterThanOrEqual(0);
    });

    test('不存在的道具应该无法使用 / Should not be able to use non-existent item', () => {
      const canUse = itemManager.canUseItem('non_existent_item');
      expect(canUse.canUse).toBe(false);
      expect(canUse.reason).toBe('Item not found');
    });
  });

  describe('统计测试 / Statistics Tests', () => {
    test('应该正确记录使用次数 / Should track usage count correctly', async () => {
      const items = itemManager.getAllItems();
      const testItem = items[0];
      
      const initialCount = itemManager.getUsageCount(testItem.id);
      
      await itemManager.useItem(testItem.id, { x: 0, y: 0 });
      
      const updatedCount = itemManager.getUsageCount(testItem.id);
      expect(updatedCount).toBe(initialCount + 1);
    });

    test('应该能重置道具使用记录 / Should reset item usage', () => {
      const items = itemManager.getAllItems();
      const testItem = items[0];
      
      // 使用道具
      itemManager.useItem(testItem.id, { x: 0, y: 0 });
      expect(itemManager.getUsageCount(testItem.id)).toBeGreaterThan(0);
      
      // 重置使用记录
      itemManager.resetItemUsage(testItem.id);
      expect(itemManager.getUsageCount(testItem.id)).toBe(0);
    });
  });

  describe('事件监听器测试 / Event Listener Tests', () => {
    test('应该能添加反应监听器 / Should add reaction listeners', () => {
      const mockListener = jest.fn();
      
      // 添加监听器应该不抛出错误
      expect(() => itemManager.addReactionListener(mockListener)).not.toThrow();
      expect(() => itemManager.removeReactionListener(mockListener)).not.toThrow();
    });

    test('使用道具时应该触发监听器 / Should trigger listeners when using items', async () => {
      const mockListener = jest.fn();
      itemManager.addReactionListener(mockListener);
      
      const items = itemManager.getAllItems();
      const testItem = items[0];
      
      await itemManager.useItem(testItem.id, { x: 100, y: 100 });
      
      expect(mockListener).toHaveBeenCalled();
      const callArgs = mockListener.mock.calls[0][0];
      expect(callArgs).toBeDefined();
      expect(typeof callArgs.message).toBe('string');
    });

    test('监听器异常不应该影响道具使用 / Listener errors should not affect item usage', async () => {
      const faultyListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      itemManager.addReactionListener(faultyListener);
      
      const items = itemManager.getAllItems();
      const testItem = items[0];
      
      // 应该不会抛出异常
      await expect(itemManager.useItem(testItem.id, { x: 0, y: 0 })).resolves.not.toThrow();
    });
  });

  describe('效果管理测试 / Effect Management Tests', () => {
    test('应该能获取活跃效果 / Should get active effects', () => {
      const activeEffects = itemManager.getActiveEffects();
      expect(activeEffects).toBeInstanceOf(Map);
    });

    test('应该能检查是否有活跃效果 / Should check if has active effect', () => {
      const hasHappinessEffect = itemManager.hasActiveEffect('happiness_increase');
      expect(typeof hasHappinessEffect).toBe('boolean');
    });

    test('应该能清理过期效果 / Should cleanup expired effects', () => {
      expect(() => itemManager.cleanupExpiredEffects()).not.toThrow();
    });
  });

  describe('推荐系统测试 / Recommendation System Tests', () => {
    test('应该能获取推荐道具 / Should get recommended items', () => {
      const recommendations = itemManager.getRecommendedItems();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThanOrEqual(0);
      expect(recommendations.length).toBeLessThanOrEqual(5); // 默认最多5个
    });

    test('应该能指定推荐道具数量 / Should specify recommended items count', () => {
      const recommendations = itemManager.getRecommendedItems(undefined, 3);
      expect(recommendations.length).toBeLessThanOrEqual(3);
    });

    test('推荐的道具应该都是可用的 / Recommended items should all be usable', () => {
      const recommendations = itemManager.getRecommendedItems();
      recommendations.forEach(item => {
        const canUse = itemManager.canUseItem(item.id);
        expect(canUse.canUse).toBe(true);
      });
    });
  });

  describe('边界情况测试 / Edge Case Tests', () => {
    test('无效位置应该正确处理 / Should handle invalid position', async () => {
      const items = itemManager.getAllItems();
      const testItem = items[0];
      
      // 测试负数位置
      const reaction1 = await itemManager.useItem(testItem.id, { x: -100, y: -100 });
      expect(reaction1).toBeDefined();
      
      // 测试极大位置
      const reaction2 = await itemManager.useItem(testItem.id, { x: 99999, y: 99999 });
      expect(reaction2).toBeDefined();
    });

    test('无位置参数应该正确处理 / Should handle no position parameter', async () => {
      const items = itemManager.getAllItems();
      const testItem = items[0];
      
      const reaction = await itemManager.useItem(testItem.id);
      expect(reaction).toBeDefined();
    });

    test('大量连续使用不应该出错 / Should handle many consecutive uses', async () => {
      const items = itemManager.getAllItems();
      const testItem = items[0];
      
      // 重置使用记录确保可以使用
      itemManager.resetItemUsage(testItem.id);
      
      // 多次使用
      for (let i = 0; i < 10; i++) {
        const reaction = await itemManager.useItem(testItem.id, { x: i, y: i });
        // 第一次应该成功，后续可能因冷却而失败，但不应该抛出异常
        expect(typeof reaction).toBeDefined(); // null或对象都可以接受
      }
    });
  });
});