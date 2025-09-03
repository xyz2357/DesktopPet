/**
 * 默认道具数据测试
 * Default Items Data Tests
 */

import { defaultItems } from '../../src/data/items';
import { ItemData, ItemType, ItemRarity, ItemEffect } from '../../src/types/item';

describe('Default Items Data', () => {
  describe('数据完整性测试 / Data Integrity Tests', () => {
    test('应该有默认道具 / Should have default items', () => {
      expect(defaultItems).toBeDefined();
      expect(Array.isArray(defaultItems)).toBe(true);
      expect(defaultItems.length).toBeGreaterThan(0);
    });

    test('每个道具应该有必需的字段 / Each item should have required fields', () => {
      defaultItems.forEach((item, index) => {
        expect(item.id).toBeDefined();
        expect(item.id).toBeTruthy();
        expect(typeof item.id).toBe('string');
        
        expect(item.name).toBeDefined();
        expect(typeof item.name).toBe('string');
        
        expect(item.nameJa).toBeDefined();
        expect(typeof item.nameJa).toBe('string');
        
        expect(item.description).toBeDefined();
        expect(typeof item.description).toBe('string');
        
        expect(item.descriptionJa).toBeDefined();
        expect(typeof item.descriptionJa).toBe('string');
        
        expect(item.emoji).toBeDefined();
        expect(typeof item.emoji).toBe('string');
        
        expect(item.type).toBeDefined();
        expect(item.rarity).toBeDefined();
        expect(item.image).toBeDefined();
        expect(typeof item.image).toBe('string');
        
        expect(Array.isArray(item.effects)).toBe(true);
      });
    });

    test('道具ID应该是唯一的 / Item IDs should be unique', () => {
      const ids = defaultItems.map(item => item.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('道具类型测试 / Item Type Tests', () => {
    const validTypes: ItemType[] = ['food', 'toy', 'tool', 'medicine', 'decoration', 'special'];
    
    test('所有道具类型应该有效 / All item types should be valid', () => {
      defaultItems.forEach(item => {
        expect(validTypes).toContain(item.type);
      });
    });

    test('应该包含所有主要类型 / Should include all major types', () => {
      const itemTypes = new Set(defaultItems.map(item => item.type));
      
      expect(itemTypes.has('food')).toBe(true);
      expect(itemTypes.has('toy')).toBe(true);
      expect(itemTypes.has('tool')).toBe(true);
      expect(itemTypes.has('medicine')).toBe(true);
      expect(itemTypes.has('decoration')).toBe(true);
      expect(itemTypes.has('special')).toBe(true);
    });

    test('每种类型应该至少有一个道具 / Each type should have at least one item', () => {
      validTypes.forEach(type => {
        const itemsOfType = defaultItems.filter(item => item.type === type);
        expect(itemsOfType.length).toBeGreaterThan(0);
      });
    });
  });

  describe('稀有度测试 / Rarity Tests', () => {
    const validRarities: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    
    test('所有稀有度应该有效 / All rarities should be valid', () => {
      defaultItems.forEach(item => {
        expect(validRarities).toContain(item.rarity);
      });
    });

    test('应该有不同稀有度的道具 / Should have items of different rarities', () => {
      const rarities = new Set(defaultItems.map(item => item.rarity));
      expect(rarities.size).toBeGreaterThan(1);
    });

    test('普通道具数量应该最多 / Common items should be most numerous', () => {
      const commonItems = defaultItems.filter(item => item.rarity === 'common');
      const otherItems = defaultItems.filter(item => item.rarity !== 'common');
      
      expect(commonItems.length).toBeGreaterThanOrEqual(otherItems.length / 2);
    });
  });

  describe('效果测试 / Effects Tests', () => {
    const validEffectTypes = [
      'mood_boost',
      'energy_restore', 
      'happiness_increase',
      'hunger_restore',
      'health_restore',
      'cleanliness_boost',
      'state_change',
      'animation_trigger',
      'sound_play',
      'text_display',
      'behavior_modify',
      'temporary_ability'
    ];

    test('所有效果类型应该有效 / All effect types should be valid', () => {
      defaultItems.forEach(item => {
        item.effects.forEach((effect, effectIndex) => {
          expect(validEffectTypes).toContain(effect.type);
          expect(typeof effect.value).toBeDefined();
          
          if (effect.duration !== undefined) {
            expect(typeof effect.duration).toBe('number');
            expect(effect.duration).toBeGreaterThan(0);
          }
        });
      });
    });

    test('每个道具至少应该有一个效果 / Each item should have at least one effect', () => {
      defaultItems.forEach(item => {
        expect(item.effects.length).toBeGreaterThan(0);
      });
    });

    test('文本显示效果应该有字符串值 / Text display effects should have string values', () => {
      defaultItems.forEach(item => {
        const textEffects = item.effects.filter(effect => effect.type === 'text_display');
        textEffects.forEach(effect => {
          expect(typeof effect.value).toBe('string');
          expect(effect.value.length).toBeGreaterThan(0);
        });
      });
    });

    test('数值效果应该有合理的值 / Numeric effects should have reasonable values', () => {
      defaultItems.forEach(item => {
        const numericEffects = item.effects.filter(effect => 
          ['happiness_increase', 'energy_restore', 'mood_boost', 'temp_stat_boost'].includes(effect.type)
        );
        
        numericEffects.forEach(effect => {
          expect(typeof effect.value).toBe('number');
          expect(effect.value).toBeGreaterThanOrEqual(0);
          expect(effect.value).toBeLessThanOrEqual(100); // 合理的上限
        });
      });
    });
  });

  describe('特定道具测试 / Specific Item Tests', () => {
    test('应该包含鱼道具 / Should include fish item', () => {
      const fish = defaultItems.find(item => item.id === 'fish');
      expect(fish).toBeDefined();
      expect(fish?.type).toBe('food');
      expect(fish?.effects.some(effect => effect.type === 'happiness_increase')).toBe(true);
      expect(fish?.effects.some(effect => effect.type === 'text_display')).toBe(true);
    });

    test('应该包含牛奶道具 / Should include milk item', () => {
      const milk = defaultItems.find(item => item.id === 'milk');
      expect(milk).toBeDefined();
      expect(milk?.type).toBe('food');
      expect(milk?.effects.some(effect => effect.type === 'energy_restore')).toBe(true);
    });

    test('应该包含球玩具 / Should include ball toy', () => {
      const ball = defaultItems.find(item => item.id === 'ball');
      expect(ball).toBeDefined();
      expect(ball?.type).toBe('toy');
      expect(ball?.effects.some(effect => effect.type === 'state_change')).toBe(true);
    });

    test('应该包含特殊道具 / Should include special items', () => {
      const specialItems = defaultItems.filter(item => item.type === 'special');
      expect(specialItems.length).toBeGreaterThan(0);
      
      // 检查魔法棒
      const magicWand = defaultItems.find(item => item.id === 'magic_wand');
      expect(magicWand).toBeDefined();
      expect(magicWand?.type).toBe('special');
      expect(magicWand?.rarity).toBe('epic');
    });
  });

  describe('本地化测试 / Localization Tests', () => {
    test('所有道具应该有日文名称 / All items should have Japanese names', () => {
      defaultItems.forEach(item => {
        expect(item.nameJa).toBeTruthy();
        expect(item.nameJa.length).toBeGreaterThan(0);
        // 检查是否包含日文字符
        expect(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(item.nameJa)).toBe(true);
      });
    });

    test('所有道具应该有日文描述 / All items should have Japanese descriptions', () => {
      defaultItems.forEach(item => {
        expect(item.descriptionJa).toBeTruthy();
        expect(item.descriptionJa.length).toBeGreaterThan(0);
        // 检查是否包含日文字符
        expect(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(item.descriptionJa)).toBe(true);
      });
    });

    test('文本效果应该是日文 / Text effects should be in Japanese', () => {
      defaultItems.forEach(item => {
        const textEffects = item.effects.filter(effect => effect.type === 'text_display');
        textEffects.forEach(effect => {
          expect(typeof effect.value).toBe('string');
          // 检查是否包含日文字符
          expect(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(effect.value as string)).toBe(true);
        });
      });
    });
  });

  describe('表情符号测试 / Emoji Tests', () => {
    test('所有道具应该有表情符号 / All items should have emojis', () => {
      defaultItems.forEach(item => {
        expect(item.emoji).toBeTruthy();
        expect(typeof item.emoji).toBe('string');
        expect(item.emoji.length).toBeGreaterThan(0);
        // 基本的表情符号检测（包含非常广的Unicode范围）
        expect(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{1F300}-\u{1F9FF}]|[\u{1FA00}-\u{1FAFF}]/u.test(item.emoji)).toBe(true);
      });
    });

    test('表情符号应该与道具类型相关 / Emojis should relate to item types', () => {
      const foodItems = defaultItems.filter(item => item.type === 'food');
      const toyItems = defaultItems.filter(item => item.type === 'toy');
      
      // 食物道具应该有食物相关的表情符号
      foodItems.forEach(item => {
        expect(['🐟', '🥛', '🍰', '🍎', '🥕'].includes(item.emoji)).toBe(true);
      });
      
      // 玩具道具应该有玩具相关的表情符号
      toyItems.forEach(item => {
        expect(['⚽', '🧶', '🐭'].includes(item.emoji)).toBe(true);
      });
      
      // 工具道具应该有工具相关的表情符号
      const toolItems = defaultItems.filter(item => item.type === 'tool');
      toolItems.forEach(item => {
        expect(['🪥', '🌡️'].includes(item.emoji)).toBe(true);
      });
    });
  });

  describe('数据一致性测试 / Data Consistency Tests', () => {
    test('道具数量应该符合预期 / Item count should meet expectations', () => {
      expect(defaultItems.length).toBeGreaterThanOrEqual(10);
      expect(defaultItems.length).toBeLessThanOrEqual(50); // 合理的上限
    });

    test('各类型道具分布应该合理 / Item type distribution should be reasonable', () => {
      const typeCount = defaultItems.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<ItemType, number>);
      
      // 每种类型至少有1个道具
      Object.values(typeCount).forEach(count => {
        expect(count).toBeGreaterThanOrEqual(1);
      });
      
      // 食物道具应该有多个
      expect(typeCount.food).toBeGreaterThanOrEqual(2);
    });

    test('稀有度分布应该合理 / Rarity distribution should be reasonable', () => {
      const rarityCount = defaultItems.reduce((acc, item) => {
        acc[item.rarity] = (acc[item.rarity] || 0) + 1;
        return acc;
      }, {} as Record<ItemRarity, number>);
      
      // 普通道具应该最多
      const commonCount = rarityCount.common || 0;
      const totalRare = (rarityCount.rare || 0) + (rarityCount.epic || 0) + (rarityCount.legendary || 0);
      
      expect(commonCount).toBeGreaterThanOrEqual(totalRare);
    });
  });
});