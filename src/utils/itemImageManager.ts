/**
 * 道具图标管理器
 * 负责道具图标的加载和管理
 */

export interface ItemImage {
  url: string;
  loaded: boolean;
  loadPromise?: Promise<HTMLImageElement>;
}

export class ItemImageManager {
  private imageCache: Map<string, ItemImage> = new Map();
  private baseUrl = './assets/items/';

  /**
   * 初始化道具图标管理器
   */
  async initialize(): Promise<void> {
    // 预定义的道具ID列表
    const itemIds = [
      'fish', 'milk', 'cake', 'ball', 'yarn', 'toy_mouse',
      'brush', 'thermometer', 'vitamin', 'flower', 'crown',
      'magic_wand', 'rainbow'
    ];

    // 为每个道具预加载图标
    const loadPromises = itemIds.map(id => this.loadItemImage(id));
    await Promise.allSettled(loadPromises);
  }

  /**
   * 加载指定道具的图标
   */
  private async loadItemImage(itemId: string): Promise<ItemImage> {
    if (this.imageCache.has(itemId)) {
      return this.imageCache.get(itemId)!;
    }

    const itemImage: ItemImage = {
      url: '',
      loaded: false
    };

    this.imageCache.set(itemId, itemImage);

    // 尝试加载用户自定义图片
    const loadPromise = this.tryLoadImage(itemId);
    itemImage.loadPromise = loadPromise;

    try {
      const img = await loadPromise;
      itemImage.url = img.src;
      itemImage.loaded = true;
      console.log(`✅ 成功加载道具图标: ${itemId}`);
    } catch (error) {
      console.warn(`⚠️ 无法加载道具图标 ${itemId}:`, error);
      // 如果加载失败，使用默认的emoji显示
      itemImage.loaded = false;
    }

    return itemImage;
  }

  /**
   * 尝试按优先级加载图片
   */
  private async tryLoadImage(itemId: string): Promise<HTMLImageElement> {
    // 支持的图片格式，按优先级排序
    const extensions = ['jpg', 'png', 'gif', 'webp'];
    
    for (const ext of extensions) {
      try {
        const url = `${this.baseUrl}${itemId}.${ext}`;
        const img = await this.loadSingleImage(url);
        return img;
      } catch (error) {
        // 继续尝试下一个格式
        continue;
      }
    }
    
    throw new Error(`No image found for item: ${itemId}`);
  }

  /**
   * 加载单个图片
   */
  private loadSingleImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // 检查图片是否为空占位图（尺寸很小或透明）
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          reject(new Error('Empty placeholder image'));
          return;
        }
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });
  }

  /**
   * 获取道具图标
   */
  getItemImage(itemId: string): ItemImage | null {
    return this.imageCache.get(itemId) || null;
  }

  /**
   * 检查道具是否有自定义图标
   */
  hasCustomImage(itemId: string): boolean {
    const itemImage = this.imageCache.get(itemId);
    return itemImage ? itemImage.loaded : false;
  }

  /**
   * 获取道具图标URL
   */
  getItemImageUrl(itemId: string): string | null {
    const itemImage = this.imageCache.get(itemId);
    return itemImage && itemImage.loaded ? itemImage.url : null;
  }

  /**
   * 重新加载指定道具的图标（用于用户更新图片后）
   */
  async reloadItemImage(itemId: string): Promise<void> {
    this.imageCache.delete(itemId);
    await this.loadItemImage(itemId);
  }

  /**
   * 重新加载所有道具图标
   */
  async reloadAllImages(): Promise<void> {
    this.imageCache.clear();
    await this.initialize();
  }

  /**
   * 获取所有已加载的道具图标信息
   */
  getAllItemImages(): Map<string, ItemImage> {
    return new Map(this.imageCache);
  }
}

// 单例实例
export const itemImageManager = new ItemImageManager();