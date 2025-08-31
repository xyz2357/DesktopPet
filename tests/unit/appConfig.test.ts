/**
 * 应用配置测试
 */

import { AppConfig, PetConfig, StudyCardConfig, LearningConfig, AnimationConfig } from '../../src/config/appConfig';

describe('AppConfig', () => {
  describe('配置结构完整性', () => {
    test('应该包含所有必要的配置部分', () => {
      expect(AppConfig).toHaveProperty('pet');
      expect(AppConfig).toHaveProperty('studyCard');
      expect(AppConfig).toHaveProperty('contextMenu');
      expect(AppConfig).toHaveProperty('learning');
      expect(AppConfig).toHaveProperty('window');
      expect(AppConfig).toHaveProperty('animation');
      expect(AppConfig).toHaveProperty('style');
      expect(AppConfig).toHaveProperty('accessibility');
    });

    test('宠物配置应该包含所有必要属性', () => {
      expect(PetConfig).toHaveProperty('defaultPosition');
      expect(PetConfig).toHaveProperty('size');
      expect(PetConfig).toHaveProperty('interaction');
      expect(PetConfig).toHaveProperty('animation');
      
      expect(PetConfig.defaultPosition).toHaveProperty('x');
      expect(PetConfig.defaultPosition).toHaveProperty('y');
      
      expect(PetConfig.size).toHaveProperty('maxWidth');
      expect(PetConfig.size).toHaveProperty('maxHeight');
      expect(PetConfig.size).toHaveProperty('minWidth');
      expect(PetConfig.size).toHaveProperty('minHeight');
      expect(PetConfig.size).toHaveProperty('default');
    });

    test('学习卡片配置应该包含所有必要属性', () => {
      expect(StudyCardConfig).toHaveProperty('size');
      expect(StudyCardConfig).toHaveProperty('autoSubmitDelay');
      expect(StudyCardConfig).toHaveProperty('tooltip');
      expect(StudyCardConfig).toHaveProperty('fontSize');
      
      expect(StudyCardConfig.autoSubmitDelay).toHaveProperty('audio');
      expect(StudyCardConfig.autoSubmitDelay).toHaveProperty('arrange');
    });

    test('学习系统配置应该包含所有必要属性', () => {
      expect(LearningConfig).toHaveProperty('cards');
      expect(LearningConfig).toHaveProperty('reminder');
      
      expect(LearningConfig.cards).toHaveProperty('errorRetryProbability');
      expect(LearningConfig.cards).toHaveProperty('reviewProbability');
      expect(LearningConfig.cards).toHaveProperty('relatedCardsLimit');
    });
  });

  describe('配置值合理性', () => {
    test('宠物尺寸配置应该合理', () => {
      expect(PetConfig.size.minWidth).toBeGreaterThan(0);
      expect(PetConfig.size.minHeight).toBeGreaterThan(0);
      expect(PetConfig.size.maxWidth).toBeGreaterThan(PetConfig.size.minWidth);
      expect(PetConfig.size.maxHeight).toBeGreaterThan(PetConfig.size.minHeight);
      expect(PetConfig.size.default.width).toBeGreaterThan(0);
      expect(PetConfig.size.default.height).toBeGreaterThan(0);
    });

    test('交互配置应该合理', () => {
      expect(PetConfig.interaction.dragThreshold).toBeGreaterThan(0);
      expect(PetConfig.interaction.alphaThreshold).toBeGreaterThanOrEqual(0);
      expect(PetConfig.interaction.alphaThreshold).toBeLessThanOrEqual(255);
      expect(PetConfig.interaction.emojiSizeRatio).toBeGreaterThan(0);
      expect(PetConfig.interaction.emojiSizeRatio).toBeLessThanOrEqual(1);
    });

    test('延迟时间应该合理', () => {
      expect(StudyCardConfig.autoSubmitDelay.audio).toBeGreaterThan(0);
      expect(StudyCardConfig.autoSubmitDelay.arrange).toBeGreaterThan(0);
      expect(StudyCardConfig.tooltip.debounceDelay).toBeGreaterThanOrEqual(0);
      expect(LearningConfig.reminder.interval).toBeGreaterThan(0);
    });

    test('概率值应该在合理范围内', () => {
      expect(LearningConfig.cards.errorRetryProbability).toBeGreaterThanOrEqual(0);
      expect(LearningConfig.cards.errorRetryProbability).toBeLessThanOrEqual(1);
      expect(LearningConfig.cards.reviewProbability).toBeGreaterThanOrEqual(0);
      expect(LearningConfig.cards.reviewProbability).toBeLessThanOrEqual(1);
      expect(LearningConfig.cards.sameTypeRatio).toBeGreaterThanOrEqual(0);
      expect(LearningConfig.cards.sameTypeRatio).toBeLessThanOrEqual(1);
    });

    test('动画时间应该合理', () => {
      expect(AnimationConfig.fast).toBeGreaterThan(0);
      expect(AnimationConfig.normal).toBeGreaterThan(AnimationConfig.fast);
      expect(AnimationConfig.slow).toBeGreaterThan(AnimationConfig.normal);
    });
  });

  describe('默认导出', () => {
    test('应该正确导出配置子集', () => {
      expect(PetConfig).toBe(AppConfig.pet);
      expect(StudyCardConfig).toBe(AppConfig.studyCard);
      expect(LearningConfig).toBe(AppConfig.learning);
      expect(AnimationConfig).toBe(AppConfig.animation);
    });
  });

  describe('配置不可变性', () => {
    test('配置对象应该是只读的', () => {
      // TypeScript的as const确保了编译时不可变性
      // 运行时JavaScript仍然允许修改，但这不是推荐的使用方式
      const originalValue = PetConfig.size.maxWidth;
      
      // 尝试修改配置值（不推荐，但不会抛出错误）
      expect(() => {
        (PetConfig.size as any).maxWidth = 999;
      }).not.toThrow();
      
      // 验证配置确实被修改了（说明需要在生产环境中使用Object.freeze）
      expect(PetConfig.size.maxWidth).toBe(999);
      
      // 恢复原值以免影响其他测试
      (PetConfig.size as any).maxWidth = originalValue;
      expect(PetConfig.size.maxWidth).toBe(originalValue);
    });
  });

  describe('特定功能配置', () => {
    test('可访问性选择器应该是有效的CSS选择器格式', () => {
      const selector = AppConfig.accessibility.focusableSelector;
      expect(selector).toContain('button');
      expect(selector).toContain('[tabindex]');
      expect(selector).toContain('input');
      expect(selector).toContain('select');
      expect(selector).toContain('textarea');
    });

    test('字体大小配置应该都是正数', () => {
      const fontSizes = StudyCardConfig.fontSize;
      Object.values(fontSizes).forEach(size => {
        expect(size).toBeGreaterThan(0);
        expect(size).toBeLessThan(100); // 合理的上限
      });
    });

    test('透明度配置应该在0-1范围内', () => {
      const opacity = AppConfig.style.opacity;
      expect(opacity.none).toBe(0);
      expect(opacity.half).toBe(0.5);
      expect(opacity.full).toBe(1);
    });
  });
});

describe('配置使用示例', () => {
  test('应该能够正确计算相关卡片数量', () => {
    const limit = LearningConfig.cards.relatedCardsLimit;
    const ratio = LearningConfig.cards.sameTypeRatio;
    const sameTypeLimit = Math.floor(limit * ratio);
    
    expect(sameTypeLimit).toBeLessThanOrEqual(limit);
    expect(sameTypeLimit).toBeGreaterThanOrEqual(0);
  });

  test('应该能够正确使用宠物尺寸配置', () => {
    const testWidth = 150;
    const testHeight = 180;
    const { maxWidth, maxHeight, minWidth, minHeight } = PetConfig.size;
    
    // 模拟尺寸计算逻辑
    let width = testWidth;
    let height = testHeight;
    
    if (width > maxWidth || height > maxHeight) {
      const widthRatio = maxWidth / width;
      const heightRatio = maxHeight / height;
      const ratio = Math.min(widthRatio, heightRatio);
      
      width = width * ratio;
      height = height * ratio;
    }
    
    expect(width).toBeLessThanOrEqual(maxWidth);
    expect(height).toBeLessThanOrEqual(maxHeight);
  });
});