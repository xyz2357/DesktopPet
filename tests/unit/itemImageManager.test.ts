/**
 * 道具图像管理器测试
 * Item Image Manager Tests
 */

import { ItemImageManager } from '../../src/utils/itemImageManager';

describe('ItemImageManager', () => {
  let itemImageManager: ItemImageManager;

  beforeEach(() => {
    itemImageManager = new ItemImageManager();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('初始化测试 / Initialization Tests', () => {
    test('应该正确初始化 / Should initialize correctly', () => {
      expect(itemImageManager).toBeDefined();
    });

    test('应该能初始化图像缓存 / Should initialize image cache', async () => {
      // Mock Image constructor for this test
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        naturalWidth = 100;
        naturalHeight = 100;
        
        constructor() {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 1);
        }
      } as any;
      
      await itemImageManager.initialize();
      // 初始化不应该抛出错误
      expect(true).toBe(true);
    });
  });

  describe('图像获取测试 / Image Retrieval Tests', () => {
    test('应该能获取道具图像URL / Should get item image URL', () => {
      const imageUrl = itemImageManager.getItemImageUrl('fish');
      // Before initialization, should return null
      expect(imageUrl).toBeNull();
    });

    test('不存在的道具应该返回null / Non-existent item should return null', () => {
      const imageUrl = itemImageManager.getItemImageUrl('non_existent_item');
      expect(imageUrl).toBeNull();
    });

    test('获取道具图像对象 / Should get item image object', () => {
      const itemImage = itemImageManager.getItemImage('fish');
      expect(itemImage).toBeNull(); // Before initialization
    });

    test('检查是否有自定义图像 / Should check if has custom image', () => {
      const hasCustom = itemImageManager.hasCustomImage('fish');
      expect(hasCustom).toBe(false); // Before initialization
    });
  });

  describe('初始化和重新加载测试 / Initialization and Reload Tests', () => {
    beforeEach(() => {
      // Mock Image constructor
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        naturalWidth = 100;
        naturalHeight = 100;
        
        constructor() {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 10);
        }
      } as any;
    });

    test('应该能初始化并预加载道具图像 / Should initialize and preload item images', async () => {
      await expect(itemImageManager.initialize()).resolves.not.toThrow();
    });

    test('应该能重新加载单个道具图像 / Should reload single item image', async () => {
      await expect(itemImageManager.reloadItemImage('fish')).resolves.not.toThrow();
    });

    test('应该能重新加载所有图像 / Should reload all images', async () => {
      await expect(itemImageManager.reloadAllImages()).resolves.not.toThrow();
    });

    test('获取所有图像信息 / Should get all item images', async () => {
      await itemImageManager.initialize();
      const allImages = itemImageManager.getAllItemImages();
      expect(allImages).toBeInstanceOf(Map);
      expect(allImages.size).toBeGreaterThan(0);
    });
  });

  describe('缓存测试 / Cache Tests', () => {
    beforeEach(() => {
      // Mock Image constructor for successful loading
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        naturalWidth = 100;
        naturalHeight = 100;
        
        constructor() {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 10);
        }
      } as any;
    });

    test('应该缓存已加载的图像 / Should cache loaded images', async () => {
      await itemImageManager.initialize();
      const imageUrl1 = itemImageManager.getItemImageUrl('fish');
      const imageUrl2 = itemImageManager.getItemImageUrl('fish');
      
      expect(imageUrl1).toBe(imageUrl2);
    });

    test('应该能通过重新加载更新缓存 / Should update cache through reload', async () => {
      await itemImageManager.initialize();
      const initialUrl = itemImageManager.getItemImageUrl('fish');
      
      await itemImageManager.reloadItemImage('fish');
      const newUrl = itemImageManager.getItemImageUrl('fish');
      
      expect(typeof initialUrl).toBe('string');
      expect(typeof newUrl).toBe('string');
    });

    test('缓存应该包含预定义的道具 / Cache should contain predefined items', async () => {
      await itemImageManager.initialize();
      const allImages = itemImageManager.getAllItemImages();
      
      expect(allImages.has('fish')).toBe(true);
      expect(allImages.has('milk')).toBe(true);
      expect(allImages.has('ball')).toBe(true);
    });
  });

  describe('图像加载失败处理 / Image Loading Failure Handling', () => {
    beforeEach(() => {
      // Mock Image constructor that fails to load
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        naturalWidth = 0;
        naturalHeight = 0;
        
        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 10);
        }
      } as any;
    });

    test('图像加载失败应该正确处理 / Should handle image loading failure correctly', async () => {
      await itemImageManager.initialize();
      const imageUrl = itemImageManager.getItemImageUrl('fish');
      expect(imageUrl).toBeNull(); // Failed to load
    });

    test('检查自定义图像应该返回false / Should return false for custom image check', async () => {
      await itemImageManager.initialize();
      const hasCustom = itemImageManager.hasCustomImage('fish');
      expect(hasCustom).toBe(false); // Failed to load
    });
  });

  describe('错误处理测试 / Error Handling Tests', () => {
    test('无效输入应该正确处理 / Invalid input should be handled correctly', () => {
      expect(() => itemImageManager.getItemImageUrl(null as any)).not.toThrow();
      expect(() => itemImageManager.getItemImageUrl(undefined as any)).not.toThrow();
      expect(itemImageManager.getItemImageUrl('')).toBeNull();
    });

    test('获取不存在道具图像应该返回null / Getting non-existent item image should return null', () => {
      const imageUrl = itemImageManager.getItemImageUrl('non_existent_item');
      expect(imageUrl).toBeNull();
      
      const itemImage = itemImageManager.getItemImage('non_existent_item');
      expect(itemImage).toBeNull();
    });

    test('检查不存在道具的自定义图像应该返回false / Checking custom image for non-existent item should return false', () => {
      const hasCustom = itemImageManager.hasCustomImage('non_existent_item');
      expect(hasCustom).toBe(false);
    });
  });

  describe('性能测试 / Performance Tests', () => {
    test('获取图像URL应该快速 / Getting image URL should be fast', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        itemImageManager.getItemImageUrl(`item_${i}`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
    });

    test('初始化应该在合理时间内完成 / Initialization should complete in reasonable time', async () => {
      // Mock fast-loading images
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        naturalWidth = 100;
        naturalHeight = 100;
        
        constructor() {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 1);
        }
      } as any;
      
      const startTime = performance.now();
      await itemImageManager.initialize();
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 应该在5秒内完成
    });
  });

  describe('内存管理测试 / Memory Management Tests', () => {
    test('重新加载应该更新缓存 / Reloading should update cache', async () => {
      // Mock successful image loading
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        naturalWidth = 100;
        naturalHeight = 100;
        
        constructor() {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 1);
        }
      } as any;
      
      await itemImageManager.initialize();
      const initialSize = itemImageManager.getAllItemImages().size;
      expect(initialSize).toBeGreaterThan(0);
      
      await itemImageManager.reloadAllImages();
      const newSize = itemImageManager.getAllItemImages().size;
      expect(newSize).toBe(initialSize);
    });

    test('缓存应该包含预定义的道具ID / Cache should contain predefined item IDs', async () => {
      // Mock successful image loading
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        naturalWidth = 100;
        naturalHeight = 100;
        
        constructor() {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 1);
        }
      } as any;
      
      await itemImageManager.initialize();
      const allImages = itemImageManager.getAllItemImages();
      
      // 应该包含一些预定义的道具
      const expectedItems = ['fish', 'milk', 'ball', 'yarn'];
      expectedItems.forEach(itemId => {
        expect(allImages.has(itemId)).toBe(true);
      });
    });
  });

  describe('边界情况测试 / Edge Case Tests', () => {
    test('特殊字符在图像名中应该正确处理 / Special characters in image names should be handled correctly', () => {
      const specialNames = [
        'item-with-dashes',
        'item_with_underscores',
        'item.with.dots'
      ];
      
      specialNames.forEach(name => {
        expect(() => itemImageManager.getItemImageUrl(name)).not.toThrow();
        const url = itemImageManager.getItemImageUrl(name);
        expect(url).toBeNull(); // Not in cache
      });
    });

    test('空字符串应该正确处理 / Empty string should be handled correctly', () => {
      expect(() => itemImageManager.getItemImageUrl('')).not.toThrow();
      const url = itemImageManager.getItemImageUrl('');
      expect(url).toBeNull();
    });

    test('不同类型的输入应该正确处理 / Different input types should be handled correctly', () => {
      const testInputs = [null, undefined, 0, false, {}] as any[];
      
      testInputs.forEach(input => {
        expect(() => itemImageManager.getItemImageUrl(input)).not.toThrow();
        const url = itemImageManager.getItemImageUrl(input);
        expect(url).toBeNull();
      });
    });
  });
});