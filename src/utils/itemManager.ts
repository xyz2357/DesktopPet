import { ItemData, ItemUsage, ItemInventory, PetReaction, ItemEffect } from '../types/item';
import { defaultItems } from '../data/items';
import { PetState } from './mediaManager';

export class ItemManager {
  private inventory: ItemInventory;
  private activeEffects: Map<string, { effect: ItemEffect; endTime: number }> = new Map();
  private listeners: ((reaction: PetReaction) => void)[] = [];

  constructor() {
    this.inventory = {
      items: [...defaultItems],
      usageHistory: []
    };
  }

  // 获取所有道具
  getAllItems(): ItemData[] {
    return this.inventory.items;
  }

  // 根据ID获取道具
  getItemById(itemId: string): ItemData | null {
    return this.inventory.items.find(item => item.id === itemId) || null;
  }

  // 根据类型获取道具
  getItemsByType(type: ItemData['type']): ItemData[] {
    return this.inventory.items.filter(item => item.type === type);
  }

  // 根据稀有度获取道具
  getItemsByRarity(rarity: ItemData['rarity']): ItemData[] {
    return this.inventory.items.filter(item => item.rarity === rarity);
  }

  // 检查道具是否可用（考虑冷却时间和使用限制）
  canUseItem(itemId: string): { canUse: boolean; reason?: string; cooldownRemaining?: number } {
    const item = this.getItemById(itemId);
    if (!item) {
      return { canUse: false, reason: 'Item not found' };
    }

    const usage = this.getItemUsage(itemId);
    const now = Date.now();

    // 检查使用次数限制
    if (item.usageLimit && usage.usageCount >= item.usageLimit) {
      return { canUse: false, reason: 'Usage limit exceeded' };
    }

    // 检查冷却时间
    if (item.cooldown && usage.lastUsed) {
      const cooldownRemaining = (usage.lastUsed + item.cooldown) - now;
      if (cooldownRemaining > 0) {
        return { 
          canUse: false, 
          reason: 'Item is on cooldown',
          cooldownRemaining 
        };
      }
    }

    return { canUse: true };
  }

  // 使用道具
  async useItem(itemId: string, targetPosition?: { x: number; y: number }): Promise<PetReaction | null> {
    const canUse = this.canUseItem(itemId);
    if (!canUse.canUse) {
      console.warn(`Cannot use item ${itemId}: ${canUse.reason}`);
      return null;
    }

    const item = this.getItemById(itemId);
    if (!item) return null;

    // 更新使用记录
    this.updateItemUsage(itemId);

    // 处理道具效果
    const reaction = this.processItemEffects(item, targetPosition);

    // 通知监听器
    this.notifyListeners(reaction);

    return reaction;
  }

  // 处理道具效果
  private processItemEffects(item: ItemData, targetPosition?: { x: number; y: number }): PetReaction {
    const reaction: PetReaction = {};
    const now = Date.now();

    for (const effect of item.effects) {
      switch (effect.type) {
        case 'text_display':
          reaction.message = effect.value as string;
          reaction.duration = effect.duration || 3000;
          break;

        case 'state_change':
          reaction.animation = effect.value as string;
          reaction.duration = effect.duration || 5000;
          break;

        case 'animation_trigger':
          reaction.animation = effect.value as string;
          reaction.duration = effect.duration || 3000;
          break;

        case 'sound_play':
          reaction.sound = effect.value as string;
          break;

        case 'mood_boost':
        case 'happiness_increase':
        case 'energy_restore':
          // 这些效果可以被外部系统读取和应用
          if (effect.duration) {
            this.activeEffects.set(`${item.id}_${effect.type}`, {
              effect,
              endTime: now + effect.duration
            });
          }
          break;

        case 'temporary_ability':
        case 'behavior_modify':
          // 临时能力和行为修改
          if (effect.duration) {
            this.activeEffects.set(`${item.id}_${effect.type}`, {
              effect,
              endTime: now + effect.duration
            });
          }
          break;
      }
    }

    return reaction;
  }

  // 获取当前活跃的效果
  getActiveEffects(): Map<string, { effect: ItemEffect; endTime: number }> {
    const now = Date.now();
    // 清除过期的效果
    for (const [key, activeEffect] of this.activeEffects.entries()) {
      if (now >= activeEffect.endTime) {
        this.activeEffects.delete(key);
      }
    }
    return new Map(this.activeEffects);
  }

  // 检查是否有特定类型的活跃效果
  hasActiveEffect(effectType: ItemEffect['type']): boolean {
    const activeEffects = this.getActiveEffects();
    for (const [_, activeEffect] of activeEffects.entries()) {
      if (activeEffect.effect.type === effectType) {
        return true;
      }
    }
    return false;
  }

  // 获取道具使用记录
  private getItemUsage(itemId: string): ItemUsage {
    let usage = this.inventory.usageHistory.find(u => u.itemId === itemId);
    if (!usage) {
      usage = {
        itemId,
        timestamp: Date.now(),
        usageCount: 0,
        lastUsed: 0
      };
      this.inventory.usageHistory.push(usage);
    }
    return usage;
  }

  // 更新道具使用记录
  private updateItemUsage(itemId: string): void {
    const usage = this.getItemUsage(itemId);
    usage.usageCount++;
    usage.lastUsed = Date.now();
  }

  // 添加监听器
  addReactionListener(listener: (reaction: PetReaction) => void): void {
    this.listeners.push(listener);
  }

  // 移除监听器
  removeReactionListener(listener: (reaction: PetReaction) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // 通知所有监听器
  private notifyListeners(reaction: PetReaction): void {
    this.listeners.forEach(listener => {
      try {
        listener(reaction);
      } catch (error) {
        console.error('Error in item reaction listener:', error);
      }
    });
  }

  // 获取冷却时间剩余
  getCooldownRemaining(itemId: string): number {
    const item = this.getItemById(itemId);
    if (!item || !item.cooldown) return 0;

    const usage = this.getItemUsage(itemId);
    if (!usage.lastUsed) return 0;

    const remaining = (usage.lastUsed + item.cooldown) - Date.now();
    return Math.max(0, remaining);
  }

  // 获取使用次数
  getUsageCount(itemId: string): number {
    const usage = this.getItemUsage(itemId);
    return usage.usageCount;
  }

  // 重置道具使用记录（调试用）
  resetItemUsage(itemId: string): void {
    const usageIndex = this.inventory.usageHistory.findIndex(u => u.itemId === itemId);
    if (usageIndex > -1) {
      this.inventory.usageHistory.splice(usageIndex, 1);
    }
  }

  // 获取推荐道具（基于当前状态）
  getRecommendedItems(currentState?: PetState, maxItems: number = 5): ItemData[] {
    // 简单的推荐逻辑，可以根据需要扩展
    const availableItems = this.inventory.items.filter(item => 
      this.canUseItem(item.id).canUse
    );

    // 根据稀有度排序，普通道具优先
    availableItems.sort((a, b) => {
      const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });

    return availableItems.slice(0, maxItems);
  }

  // 清理过期效果
  cleanupExpiredEffects(): void {
    this.getActiveEffects(); // 这会自动清理过期效果
  }
}

// 单例实例
export const itemManager = new ItemManager();