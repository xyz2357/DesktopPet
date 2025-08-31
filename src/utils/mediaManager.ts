/**
 * 媒体文件管理器
 * 负责媒体文件的加载、缓存、随机选择等功能
 */

import { PetConfig, AppConfig } from '../config/appConfig';

export type PetState = 'idle' | 'hover' | 'active' | 'loading';
export type MediaType = 'image' | 'video';

export interface MediaFile {
  url: string;
  type: MediaType;
  format: string;
  preloaded: boolean;
  loadPromise?: Promise<HTMLImageElement | HTMLVideoElement>;
}

export interface MediaCache {
  [state: string]: MediaFile[];
}

export class MediaManager {
  private cache: MediaCache = {};
  private currentSelection: { [state in PetState]?: MediaFile } = {};
  private preloadedElements: Map<string, HTMLImageElement | HTMLVideoElement> = new Map();

  /**
   * 初始化媒体管理器
   */
  async initialize(): Promise<void> {
    console.log('🎬 初始化媒体管理器...');
    
    try {
      await this.loadMediaFiles();
      console.log('📁 媒体文件加载完成:', this.getCacheStats());
      
      if (AppConfig.media.preloading.enabled) {
        console.log('🔄 开始预加载媒体文件...');
        await this.preloadMedia();
        console.log('✅ 媒体文件预加载完成');
      }
    } catch (error) {
      console.error('❌ 媒体管理器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 加载媒体文件列表
   */
  private async loadMediaFiles(): Promise<void> {
    const states: PetState[] = ['idle', 'hover', 'active', 'loading'];
    
    // 在浏览器环境中，我们需要通过webpack的require.context来加载媒体文件
    await Promise.all(states.map(async state => {
      this.cache[state] = await this.loadMediaFilesForState(state);
    }));
  }

  /**
   * 为指定状态加载媒体文件
   */
  private async loadMediaFilesForState(state: PetState): Promise<MediaFile[]> {
    const files: MediaFile[] = [];
    
    try {
      // 尝试加载该状态下的所有媒体文件
      // 由于浏览器限制，我们需要预先知道文件名或使用webpack的require.context
      const mediaContext = this.createMediaContext(state);
      
      if (mediaContext) {
        mediaContext.keys().forEach((filename: string) => {
          const url = mediaContext(filename);
          const format = this.getFileFormat(filename);
          const isVideo = ['mp4', 'webm'].includes(format);
          
          files.push({
            url: url.default || url, // webpack可能返回{default: url}格式
            type: isVideo ? 'video' : 'image',
            format,
            preloaded: false
          });
        });
      }
    } catch (error) {
      console.warn(`无法加载${state}状态的媒体文件:`, error);
      // 如果无法动态加载，回退到静态文件列表
      files.push(...this.getFallbackMediaFiles(state));
    }
    
    return files;
  }
  
  /**
   * 创建媒体文件上下文（用于webpack动态导入）
   */
  private createMediaContext(state: PetState) {
    try {
      // 尝试为每个状态创建require.context
      switch (state) {
        case 'idle':
          return (require as any).context('../assets/pet-media/idle', false, /\.(png|jpe?g|gif|webp|mp4|webm)$/i);
        case 'hover':
          return (require as any).context('../assets/pet-media/hover', false, /\.(png|jpe?g|gif|webp|mp4|webm)$/i);
        case 'active':
          return (require as any).context('../assets/pet-media/active', false, /\.(png|jpe?g|gif|webp|mp4|webm)$/i);
        case 'loading':
          return (require as any).context('../assets/pet-media/loading', false, /\.(png|jpe?g|gif|webp|mp4|webm)$/i);
        default:
          return null;
      }
    } catch (error) {
      console.warn(`无法创建${state}状态的媒体上下文:`, error);
      return null;
    }
  }
  
  /**
   * 获取文件格式
   */
  private getFileFormat(filename: string): string {
    const match = filename.match(/\.([^.]+)$/i);
    return match ? match[1].toLowerCase() : 'unknown';
  }
  
  /**
   * 获取回退媒体文件（当动态加载失败时）
   */
  private getFallbackMediaFiles(state: PetState): MediaFile[] {
    // 返回一些预知的文件路径作为回退
    const commonFiles = [
      'pet-1.png',
      'pet-2.png', 
      'pet-3.png',
      'pet-animated.gif',
      'pet-modern.webp'
    ];
    
    return commonFiles.map(filename => {
      const format = this.getFileFormat(filename);
      const isVideo = ['mp4', 'webm'].includes(format);
      
      return {
        url: `/src/assets/pet-media/${state}/${filename}`,
        type: isVideo ? 'video' : 'image',
        format,
        preloaded: false
      };
    });
  }

  /**
   * 预加载媒体文件
   */
  private async preloadMedia(): Promise<void> {
    const { priority, maxFiles } = AppConfig.media.preloading;
    let loadedCount = 0;

    for (const state of priority) {
      if (loadedCount >= maxFiles) break;
      
      const files = this.cache[state] || [];
      console.log(`⏳ 预加载${state}状态的媒体文件，共${files.length}个`);
      for (const file of files) {
        if (loadedCount >= maxFiles) break;
        
        try {
          await this.preloadFile(file);
          file.preloaded = true;
          loadedCount++;
        } catch (error) {
          console.warn(`Failed to preload ${file.url}:`, error);
        }
      }
    }
  }

  /**
   * 预加载单个文件
   */
  private async preloadFile(file: MediaFile): Promise<void> {
    if (this.preloadedElements.has(file.url)) {
      return;
    }

    const element = await this.loadMediaElement(file);
    this.preloadedElements.set(file.url, element);
  }

  /**
   * 加载媒体元素
   */
  private loadMediaElement(file: MediaFile): Promise<HTMLImageElement | HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout loading ${file.url}`));
      }, AppConfig.media.errorHandling.loadTimeout);

      if (file.type === 'video') {
        const video = document.createElement('video');
        video.muted = PetConfig.media.video.muted;
        video.loop = PetConfig.media.video.loop;
        video.autoplay = PetConfig.media.video.autoplay;
        video.controls = PetConfig.media.video.controls;
        
        video.onloadeddata = () => {
          clearTimeout(timeout);
          resolve(video);
        };
        video.onerror = () => {
          clearTimeout(timeout);
          reject(new Error(`Failed to load video: ${file.url}`));
        };
        
        video.src = file.url;
      } else {
        const img = new Image();
        img.onload = () => {
          clearTimeout(timeout);
          resolve(img);
        };
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error(`Failed to load image: ${file.url}`));
        };
        
        img.src = file.url;
      }
    });
  }

  /**
   * 获取指定状态的随机媒体文件
   */
  getRandomMediaForState(state: PetState): MediaFile | null {
    const files = this.cache[state] || [];
    console.log(`🎲 获取${state}状态的媒体文件，可用文件数: ${files.length}`);
    
    if (files.length === 0) {
      console.warn(`⚠️ ${state}状态没有可用的媒体文件`);
      return null;
    }

    // 如果禁用随机选择或当前状态已有选择且不需要重新选择
    if (!PetConfig.media.randomSelection.enabled || 
        (!PetConfig.media.randomSelection.changeOnStateSwitch && this.currentSelection[state])) {
      const selected = this.currentSelection[state] || files[0];
      console.log(`📌 使用已选择的${state}媒体文件:`, selected.url);
      return selected;
    }

    // 随机选择
    const randomIndex = Math.floor(Math.random() * files.length);
    const selectedFile = files[randomIndex];
    
    this.currentSelection[state] = selectedFile;
    console.log(`🎯 随机选择${state}媒体文件:`, selectedFile.url);
    return selectedFile;
  }

  /**
   * 获取预加载的元素
   */
  getPreloadedElement(url: string): HTMLImageElement | HTMLVideoElement | null {
    return this.preloadedElements.get(url) || null;
  }

  /**
   * 强制刷新指定状态的媒体选择
   */
  refreshMediaForState(state: PetState): MediaFile | null {
    delete this.currentSelection[state];
    return this.getRandomMediaForState(state);
  }

  /**
   * 获取指定状态的所有可用媒体文件
   */
  getAvailableMediaForState(state: PetState): MediaFile[] {
    return this.cache[state] || [];
  }

  /**
   * 检查媒体文件是否为视频格式
   */
  isVideoFile(file: MediaFile): boolean {
    return file.type === 'video';
  }

  /**
   * 检查媒体文件是否为动画格式
   */
  isAnimatedFile(file: MediaFile): boolean {
    return file.format === 'gif' || this.isVideoFile(file);
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache = {};
    this.currentSelection = {};
    this.preloadedElements.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { totalFiles: number; preloadedFiles: number; cacheSize: number } {
    let totalFiles = 0;
    let preloadedFiles = 0;
    
    Object.values(this.cache).forEach(files => {
      totalFiles += files.length;
      preloadedFiles += files.filter(f => f.preloaded).length;
    });

    return {
      totalFiles,
      preloadedFiles,
      cacheSize: this.preloadedElements.size
    };
  }
}

// 单例实例
export const mediaManager = new MediaManager();