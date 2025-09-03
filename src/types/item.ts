export interface ItemData {
  id: string;
  name: string;
  nameJa?: string;
  description: string;
  descriptionJa?: string;
  emoji: string;
  type: ItemType;
  rarity: ItemRarity;
  effects: ItemEffect[];
  cooldown?: number; // 冷却时间（毫秒）
  usageLimit?: number; // 使用次数限制，undefined表示无限制
  image?: string; // 可选的图片路径
}

export type ItemType = 
  | 'food'      // 食物类
  | 'toy'       // 玩具类  
  | 'tool'      // 工具类
  | 'medicine'  // 药品类
  | 'decoration' // 装饰类
  | 'special';  // 特殊类

export type ItemRarity = 
  | 'common'    // 普通
  | 'uncommon'  // 不常见
  | 'rare'      // 稀有
  | 'epic'      // 史诗
  | 'legendary'; // 传说

export interface ItemEffect {
  type: ItemEffectType;
  duration?: number; // 效果持续时间（毫秒）
  value?: number | string; // 效果值
  target?: 'pet' | 'mood' | 'energy' | 'happiness' | 'state';
}

export type ItemEffectType =
  | 'mood_boost'        // 心情提升
  | 'energy_restore'    // 能量恢复
  | 'happiness_increase' // 快乐增加
  | 'hunger_restore'    // 饥饿恢复
  | 'health_restore'    // 健康恢复
  | 'cleanliness_boost' // 清洁提升
  | 'state_change'      // 状态改变
  | 'animation_trigger' // 触发动画
  | 'sound_play'        // 播放声音
  | 'text_display'      // 显示文字
  | 'behavior_modify'   // 行为修改
  | 'temporary_ability'; // 临时能力

export interface ItemUsage {
  itemId: string;
  timestamp: number;
  usageCount: number;
  lastUsed: number;
}

export interface ItemInventory {
  items: ItemData[];
  usageHistory: ItemUsage[];
}

export interface PetReaction {
  animation?: string;
  emotion?: string;
  message?: string;
  messageJa?: string;
  sound?: string;
  duration?: number;
}