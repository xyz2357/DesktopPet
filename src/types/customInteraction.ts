/**
 * 自定义互动系统类型定义
 */

export interface CustomInteraction {
  id: string;
  name: string;
  nameJa?: string;
  description: string;
  descriptionJa?: string;
  
  // 触发条件
  triggers: InteractionTrigger[];
  
  // 反应
  reaction: InteractionReaction;
  
  // 冷却时间（毫秒）
  cooldown?: number;
  
  // 权重（用于随机选择，数值越高越容易被选中）
  weight?: number;
  
  // 启用状态
  enabled?: boolean;
}

export interface InteractionTrigger {
  type: TriggerType;
  value?: string | number | string[];
  condition?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex';
}

export type TriggerType =
  | 'click'           // 点击
  | 'hover'           // 鼠标悬停
  | 'time'            // 时间触发
  | 'state'           // 状态触发
  | 'item_use'        // 道具使用
  | 'text_input'      // 文本输入
  | 'keyboard'        // 键盘按键
  | 'random'          // 随机触发
  | 'custom';         // 自定义条件

export interface InteractionReaction {
  // 状态变化
  state?: string;
  stateDuration?: number;
  
  // 显示文本
  text?: string;
  textJa?: string;
  textDuration?: number;
  textStyle?: TextStyle;
  
  // 媒体文件
  media?: MediaMapping;
  
  // 声音效果
  sound?: string;
  
  // 动画效果
  animation?: AnimationEffect;
  
  // 链式反应（后续触发其他互动）
  chain?: string[]; // 其他互动的ID
  
  // 属性变化
  attributes?: AttributeChange[];
}

export interface TextStyle {
  color?: string;
  fontSize?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  background?: string;
  animation?: 'fade' | 'slide' | 'bounce' | 'shake';
}

export interface MediaMapping {
  // 直接指定媒体文件
  file?: string;
  
  // 指定媒体文件夹（随机选择）
  folder?: string;
  
  // 条件映射
  conditional?: ConditionalMedia[];
  
  // 回退选项
  fallback?: string;
}

export interface ConditionalMedia {
  condition: MediaCondition;
  media: string;
}

export interface MediaCondition {
  type: 'time' | 'state' | 'attribute' | 'random' | 'custom';
  value?: any;
  operator?: 'equals' | 'greater' | 'less' | 'contains';
}

export interface AnimationEffect {
  type: 'shake' | 'bounce' | 'rotate' | 'scale' | 'slide' | 'fade' | 'pulse';
  duration?: number;
  intensity?: number;
  repeat?: number;
}

export interface AttributeChange {
  name: string;
  operation: 'set' | 'add' | 'subtract' | 'multiply';
  value: number | string;
  duration?: number; // 临时变化的持续时间
}

export interface CustomInteractionConfig {
  version: string;
  name: string;
  description: string;
  author?: string;
  
  // 全局设置
  settings: {
    enabled: boolean;
    debugMode?: boolean;
    maxConcurrentInteractions?: number;
  };
  
  // 自定义属性定义
  attributes?: CustomAttribute[];
  
  // 互动定义
  interactions: CustomInteraction[];
}

export interface CustomAttribute {
  name: string;
  displayName: string;
  displayNameJa?: string;
  type: 'number' | 'string' | 'boolean';
  defaultValue: any;
  min?: number;
  max?: number;
  description?: string;
}

export interface InteractionContext {
  // 当前状态
  currentState: string;
  
  // 鼠标位置
  mousePosition: { x: number; y: number };
  
  // 桌宠位置
  petPosition: { x: number; y: number };
  
  // 时间信息
  time: {
    hour: number;
    minute: number;
    dayOfWeek: number;
    timestamp: number;
  };
  
  // 当前时间戳
  timestamp: number;
  
  // 最后互动时间
  lastInteraction?: number;
  
  // 自定义属性
  attributes: Map<string, any>;
  
  // 最近使用的道具
  lastUsedItem?: string;
  
  // 用户输入
  userInput?: string;
}

export interface InteractionResult {
  success: boolean;
  reaction?: InteractionReaction;
  error?: string;
  nextInteractions?: string[];
}