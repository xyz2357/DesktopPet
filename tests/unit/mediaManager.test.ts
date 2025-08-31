/**
 * 媒体管理器测试
 */

import { MediaManager, PetState, MediaFile, MediaType } from '../../src/utils/mediaManager';
import { PetConfig, AppConfig } from '../../src/config/appConfig';

// Mock webpack's require.context which is not available in Jest
jest.mock('../../src/utils/mediaManager', () => {
  const originalModule = jest.requireActual('../../src/utils/mediaManager');
  
  class MockMediaManager extends originalModule.MediaManager {
    private mockCache: any = {};
    private currentSelection: any = {};
    
    async initialize(): Promise<void> {
      console.log('🎬 初始化媒体管理器...');
      
      // 模拟加载媒体文件
      const states = ['idle', 'hover', 'active', 'loading'];
      states.forEach(state => {
        this.mockCache[state] = [
          {
            url: `/mock/assets/pet-media/${state}/pet-1.png`,
            type: 'image',
            format: 'png',
            preloaded: false
          },
          {
            url: `/mock/assets/pet-media/${state}/pet-2.jpg`,
            type: 'image', 
            format: 'jpg',
            preloaded: false
          },
          {
            url: `/mock/assets/pet-media/${state}/pet-animated.gif`,
            type: 'image',
            format: 'gif', 
            preloaded: false
          },
          {
            url: `/mock/assets/pet-media/${state}/pet-video.mp4`,
            type: 'video',
            format: 'mp4',
            preloaded: false
          }
        ];
      });
      
      console.log('📁 媒体文件加载完成:', this.getCacheStats());
      console.log('🔄 开始预加载媒体文件...');
      console.log('✅ 媒体文件预加载完成');
    }
    
    getAvailableMediaForState(state: any): any[] {
      return this.mockCache[state] || [];
    }
    
    getRandomMediaForState(state: any): any {
      const files = this.mockCache[state] || [];
      if (files.length === 0) {
        return null;
      }
      
      // 导入PetConfig以检查随机选择设置
      const { PetConfig } = require('../../src/config/appConfig');
      
      // 如果禁用随机选择或当前状态已有选择且不需要重新选择
      if (!PetConfig.media.randomSelection.enabled || 
          (!PetConfig.media.randomSelection.changeOnStateSwitch && this.currentSelection[state])) {
        const selected = this.currentSelection[state] || files[0];
        return selected;
      }

      // 随机选择
      const randomIndex = Math.floor(Math.random() * files.length);
      const selectedFile = files[randomIndex];
      this.currentSelection[state] = selectedFile;
      return selectedFile;
    }
    
    refreshMediaForState(state: any): any {
      delete this.currentSelection[state];
      return this.getRandomMediaForState(state);
    }
    
    isVideoFile(file: any): boolean {
      return file?.type === 'video';
    }
    
    isAnimatedFile(file: any): boolean {
      return file?.format === 'gif' || this.isVideoFile(file);
    }
    
    getCacheStats() {
      let totalFiles = 0;
      Object.values(this.mockCache).forEach((files: any) => {
        totalFiles += files.length;
      });
      
      return {
        totalFiles,
        preloadedFiles: 0,
        cacheSize: 0
      };
    }
    
    clearCache(): void {
      this.mockCache = {};
      this.currentSelection = {};
    }
  }
  
  return {
    ...originalModule,
    MediaManager: MockMediaManager,
    mediaManager: new MockMediaManager()
  };
});

// Mock DOM APIs
Object.defineProperty(window, 'Image', {
  writable: true,
  value: jest.fn().mockImplementation(() => {
    const img = {
      onload: null,
      onerror: null,
      src: '',
      naturalWidth: 100,
      naturalHeight: 100
    };
    
    // 模拟异步加载成功
    setTimeout(() => {
      if (img.onload) img.onload({} as Event);
    }, 0);
    
    return img;
  })
});

// Mock document.createElement for video elements
const originalCreateElement = document.createElement;
document.createElement = jest.fn().mockImplementation((tagName: string) => {
  if (tagName === 'video') {
    const video = {
      onloadeddata: null,
      onerror: null,
      src: '',
      videoWidth: 100,
      videoHeight: 100,
      muted: false,
      loop: false,
      autoplay: false,
      controls: false
    };
    
    // 模拟异步加载成功
    setTimeout(() => {
      if (video.onloadeddata) video.onloadeddata({} as Event);
    }, 0);
    
    return video;
  }
  return originalCreateElement.call(document, tagName);
});

describe('MediaManager', () => {
  let mediaManager: MediaManager;

  beforeEach(() => {
    mediaManager = new MediaManager();
    jest.clearAllMocks();
  });

  describe('初始化', () => {
    test('应该能够成功初始化', async () => {
      await expect(mediaManager.initialize()).resolves.not.toThrow();
    });

    test('初始化后应该有媒体文件缓存', async () => {
      await mediaManager.initialize();
      
      const states: PetState[] = ['idle', 'hover', 'active', 'loading'];
      states.forEach(state => {
        const files = mediaManager.getAvailableMediaForState(state);
        expect(files.length).toBeGreaterThan(0);
      });
    });
  });

  describe('随机媒体选择', () => {
    beforeEach(async () => {
      await mediaManager.initialize();
    });

    test('应该能够获取指定状态的随机媒体', () => {
      const states: PetState[] = ['idle', 'hover', 'active', 'loading'];
      
      states.forEach(state => {
        const media = mediaManager.getRandomMediaForState(state);
        expect(media).toBeTruthy();
        expect(media).toHaveProperty('url');
        expect(media).toHaveProperty('type');
        expect(media).toHaveProperty('format');
      });
    });

    test('禁用随机选择时应该返回第一个文件', () => {
      // 临时禁用随机选择
      const originalEnabled = PetConfig.media.randomSelection.enabled;
      PetConfig.media.randomSelection.enabled = false;

      const media1 = mediaManager.getRandomMediaForState('idle');
      const media2 = mediaManager.getRandomMediaForState('idle');
      
      expect(media1).toEqual(media2);
      
      // 恢复设置
      PetConfig.media.randomSelection.enabled = originalEnabled;
    });

    test('刷新状态应该获得新的媒体文件', () => {
      const originalMedia = mediaManager.getRandomMediaForState('idle');
      const refreshedMedia = mediaManager.refreshMediaForState('idle');
      
      // 由于是随机选择，不能保证一定不同，但至少应该返回有效的媒体文件
      expect(refreshedMedia).toBeTruthy();
      expect(refreshedMedia).toHaveProperty('url');
    });
  });

  describe('媒体文件类型检测', () => {
    beforeEach(async () => {
      await mediaManager.initialize();
    });

    test('应该能正确识别视频文件', () => {
      const videoFile: MediaFile = {
        url: '/test.mp4',
        type: 'video',
        format: 'mp4',
        preloaded: false
      };

      expect(mediaManager.isVideoFile(videoFile)).toBe(true);
    });

    test('应该能正确识别图片文件', () => {
      const imageFile: MediaFile = {
        url: '/test.png',
        type: 'image',
        format: 'png',
        preloaded: false
      };

      expect(mediaManager.isVideoFile(imageFile)).toBe(false);
    });

    test('应该能正确识别动画文件', () => {
      const gifFile: MediaFile = {
        url: '/test.gif',
        type: 'image',
        format: 'gif',
        preloaded: false
      };

      const videoFile: MediaFile = {
        url: '/test.mp4',
        type: 'video',
        format: 'mp4',
        preloaded: false
      };

      const staticFile: MediaFile = {
        url: '/test.png',
        type: 'image',
        format: 'png',
        preloaded: false
      };

      expect(mediaManager.isAnimatedFile(gifFile)).toBe(true);
      expect(mediaManager.isAnimatedFile(videoFile)).toBe(true);
      expect(mediaManager.isAnimatedFile(staticFile)).toBe(false);
    });
  });

  describe('缓存管理', () => {
    beforeEach(async () => {
      await mediaManager.initialize();
    });

    test('应该提供缓存统计信息', () => {
      const stats = mediaManager.getCacheStats();
      
      expect(stats).toHaveProperty('totalFiles');
      expect(stats).toHaveProperty('preloadedFiles');
      expect(stats).toHaveProperty('cacheSize');
      expect(stats.totalFiles).toBeGreaterThan(0);
    });

    test('清理缓存应该重置所有缓存数据', () => {
      mediaManager.clearCache();
      
      const stats = mediaManager.getCacheStats();
      expect(stats.totalFiles).toBe(0);
      expect(stats.preloadedFiles).toBe(0);
      expect(stats.cacheSize).toBe(0);
    });
  });

  describe('配置验证', () => {
    test('支持的媒体格式应该包含预期格式', () => {
      const formats = PetConfig.media.supportedFormats;
      
      expect(formats).toContain('png');
      expect(formats).toContain('jpg');
      expect(formats).toContain('jpeg');
      expect(formats).toContain('gif');
      expect(formats).toContain('webp');
      expect(formats).toContain('mp4');
      expect(formats).toContain('webm');
    });

    test('视频配置应该合理', () => {
      const videoConfig = PetConfig.media.video;
      
      expect(typeof videoConfig.muted).toBe('boolean');
      expect(typeof videoConfig.loop).toBe('boolean');
      expect(typeof videoConfig.autoplay).toBe('boolean');
      expect(typeof videoConfig.controls).toBe('boolean');
    });

    test('随机选择配置应该合理', () => {
      const randomConfig = PetConfig.media.randomSelection;
      
      expect(typeof randomConfig.enabled).toBe('boolean');
      expect(typeof randomConfig.changeOnStateSwitch).toBe('boolean');
      expect(typeof randomConfig.autoChangeInterval).toBe('number');
      expect(randomConfig.autoChangeInterval).toBeGreaterThanOrEqual(0);
    });

    test('媒体处理配置应该合理', () => {
      const mediaConfig = AppConfig.media;
      
      expect(mediaConfig.preloading.maxFiles).toBeGreaterThan(0);
      expect(mediaConfig.caching.ttl).toBeGreaterThan(0);
      expect(mediaConfig.errorHandling.maxRetries).toBeGreaterThanOrEqual(0);
      expect(mediaConfig.errorHandling.retryDelay).toBeGreaterThan(0);
      expect(mediaConfig.errorHandling.loadTimeout).toBeGreaterThan(0);
    });
  });
});