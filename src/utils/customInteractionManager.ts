/**
 * 自定义互动管理器
 * 负责加载、解析和执行用户自定义的互动逻辑
 */

import { 
  CustomInteractionConfig, 
  CustomInteraction, 
  InteractionContext, 
  InteractionResult,
  InteractionTrigger,
  InteractionReaction,
  CustomAttribute,
  TriggerType
} from '../types/customInteraction';

export class CustomInteractionManager {
  private config: CustomInteractionConfig | null = null;
  private interactions: Map<string, CustomInteraction> = new Map();
  private attributes: Map<string, any> = new Map();
  private customAttributes: Map<string, CustomAttribute> = new Map();
  private cooldowns: Map<string, number> = new Map();
  private enabled: boolean = true;
  private debugMode: boolean = false;
  private listeners: ((result: InteractionResult) => void)[] = [];

  /**
   * 初始化自定义互动管理器
   */
  async initialize(): Promise<void> {
    console.log('🎭 初始化自定义互动管理器...');
    
    try {
      // 尝试加载默认配置
      await this.loadConfig('default.json');
      
      // 尝试加载用户自定义配置
      await this.loadUserConfig();
      
      console.log('✅ 自定义互动管理器初始化完成');
    } catch (error) {
      console.warn('⚠️ 自定义互动管理器初始化失败:', error);
      this.enabled = false;
    }
  }

  /**
   * 加载配置文件
   */
  private async loadConfig(filename: string): Promise<void> {
    try {
      const response = await fetch(`./assets/interactions/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const config: CustomInteractionConfig = await response.json();
      await this.applyConfig(config);
      
      console.log(`📁 已加载互动配置: ${config.name}`);
    } catch (error) {
      console.warn(`⚠️ 无法加载配置文件 ${filename}:`, error);
      throw error;
    }
  }

  /**
   * 尝试加载用户自定义配置
   */
  private async loadUserConfig(): Promise<void> {
    const userConfigs = ['custom.json', 'user.json', 'my_interactions.json'];
    
    for (const filename of userConfigs) {
      try {
        const response = await fetch(`./assets/interactions/${filename}`);
        if (response.ok) {
          const config: CustomInteractionConfig = await response.json();
          await this.applyConfig(config, true); // 合并模式
          console.log(`👤 已加载用户配置: ${config.name}`);
          return;
        }
      } catch (error) {
        // 忽略用户配置加载失败
        continue;
      }
    }
    
    console.log('💡 未找到用户自定义配置，使用默认配置');
  }

  /**
   * 应用配置
   */
  private async applyConfig(config: CustomInteractionConfig, merge: boolean = false): Promise<void> {
    if (!merge) {
      this.config = config;
      this.interactions.clear();
      this.customAttributes.clear();
      this.attributes.clear();
    }

    // 应用全局设置
    this.enabled = config.settings.enabled;
    this.debugMode = config.settings.debugMode || false;

    // 设置自定义属性
    if (config.attributes) {
      for (const attr of config.attributes) {
        this.customAttributes.set(attr.name, attr);
        if (!this.attributes.has(attr.name)) {
          this.attributes.set(attr.name, attr.defaultValue);
        }
      }
    }

    // 加载互动
    for (const interaction of config.interactions) {
      if (interaction.enabled !== false) {
        this.interactions.set(interaction.id, interaction);
        
        if (this.debugMode) {
          console.log(`🎯 已注册互动: ${interaction.name || interaction.id}`);
        }
      }
    }
  }

  /**
   * 检查触发器是否匹配
   */
  private checkTrigger(trigger: InteractionTrigger, context: InteractionContext): boolean {
    switch (trigger.type) {
      case 'click':
        return true; // 由外部调用时已经确认是点击

      case 'hover':
        return true; // 由外部调用时已经确认是悬停

      case 'time':
        return this.checkTimeTrigger(trigger.value as string, context);

      case 'state':
        return context.currentState === trigger.value;

      case 'item_use':
        return context.lastUsedItem === trigger.value;

      case 'keyboard':
        return context.userInput === trigger.value; // 检查按键代码是否匹配

      case 'random':
        const chance = typeof trigger.value === 'number' ? trigger.value : 0.1;
        return Math.random() < chance;

      case 'custom':
        return this.evaluateCustomCondition(trigger.value as string, context);

      default:
        return false;
    }
  }

  /**
   * 检查时间触发器
   */
  private checkTimeTrigger(timeValue: string, context: InteractionContext): boolean {
    if (timeValue.includes('-')) {
      // 时间范围 "06:00-10:00"
      const [startTime, endTime] = timeValue.split('-');
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const currentMinutes = context.time.hour * 60 + context.time.minute;
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (startMinutes <= endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      } else {
        // 跨午夜的时间范围
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      }
    } else if (timeValue.startsWith('idle_timeout_')) {
      // 空闲超时 "idle_timeout_300000"
      const timeout = parseInt(timeValue.replace('idle_timeout_', ''));
      const idleTime = context.timestamp - (context.lastInteraction || 0);
      return idleTime >= timeout;
    }
    
    return false;
  }

  /**
   * 评估自定义条件
   */
  private evaluateCustomCondition(condition: string, context: InteractionContext): boolean {
    try {
      // 简单的条件评估器
      // 注意: 在实际应用中应该使用更安全的表达式评估器
      
      // 替换变量
      let expr = condition;
      
      // 替换属性值
      for (const [name, value] of this.attributes.entries()) {
        expr = expr.replace(new RegExp(`\\b${name}\\b`, 'g'), String(value));
      }
      
      // 替换上下文变量
      expr = expr.replace(/\bcurrentState\b/g, `'${context.currentState}'`);
      expr = expr.replace(/\bhour\b/g, String(context.time.hour));
      expr = expr.replace(/\bminute\b/g, String(context.time.minute));
      
      // 安全的评估（仅支持基本运算符）
      if (!/^[0-9\s+\-*/<>=!&|()'"a-zA-Z_]+$/.test(expr)) {
        console.warn('⚠️ 不安全的自定义条件:', condition);
        return false;
      }
      
      // 使用Function构造器评估表达式
      return new Function('return ' + expr)();
    } catch (error) {
      console.warn('⚠️ 自定义条件评估失败:', condition, error);
      return false;
    }
  }

  /**
   * 触发互动
   */
  async triggerInteraction(
    triggerType: TriggerType, 
    context: InteractionContext,
    specificId?: string
  ): Promise<InteractionResult[]> {
    if (!this.enabled || !this.config) {
      return [];
    }

    const results: InteractionResult[] = [];
    const candidates: { item: CustomInteraction; weight: number }[] = [];

    // 收集候选互动
    for (const [id, interaction] of this.interactions.entries()) {
      if (specificId && id !== specificId) {
        continue;
      }

      // 检查冷却时间
      const lastUsed = this.cooldowns.get(id) || 0;
      const cooldown = interaction.cooldown || 0;
      if (Date.now() - lastUsed < cooldown) {
        continue;
      }

      // 检查触发器
      const triggered = interaction.triggers.some(trigger => {
        if (trigger.type === triggerType || trigger.type === 'custom') {
          return this.checkTrigger(trigger, context);
        }
        return false;
      });

      if (triggered) {
        candidates.push({
          item: interaction,
          weight: interaction.weight || 1
        });
      }
    }

    // 根据权重随机选择
    const maxConcurrent = this.config.settings.maxConcurrentInteractions || 1;
    const selected = this.selectWeightedRandom(candidates, Math.min(maxConcurrent, candidates.length));

    // 执行选中的互动
    for (const { item: interaction } of selected) {
      const result = await this.executeInteraction(interaction, context);
      results.push(result);

      if (result.success) {
        this.cooldowns.set(interaction.id, Date.now());
        
        if (this.debugMode) {
          console.log(`🎭 执行互动: ${interaction.name || interaction.id}`);
        }
      }
    }

    return results;
  }

  /**
   * 权重随机选择
   */
  private selectWeightedRandom<T>(
    items: { item: T; weight: number }[], 
    count: number
  ): { item: T }[] {
    if (items.length === 0 || count === 0) return [];

    const selected: { item: T }[] = [];
    const remaining = [...items];

    for (let i = 0; i < count && remaining.length > 0; i++) {
      const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;

      for (let j = 0; j < remaining.length; j++) {
        random -= remaining[j].weight;
        if (random <= 0) {
          selected.push({ item: remaining[j].item });
          remaining.splice(j, 1);
          break;
        }
      }
    }

    return selected;
  }

  /**
   * 执行互动
   */
  private async executeInteraction(
    interaction: CustomInteraction, 
    context: InteractionContext
  ): Promise<InteractionResult> {
    try {
      const reaction = interaction.reaction;
      
      // 应用属性变化
      if (reaction.attributes) {
        for (const change of reaction.attributes) {
          this.applyAttributeChange(change);
        }
      }

      // 处理链式反应
      const nextInteractions: string[] = [];
      if (reaction.chain) {
        nextInteractions.push(...reaction.chain);
      }

      const result: InteractionResult = {
        success: true,
        reaction,
        nextInteractions
      };

      // 通知监听器
      this.notifyListeners(result);

      return result;
    } catch (error) {
      console.error('❌ 互动执行失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 应用属性变化
   */
  private applyAttributeChange(change: any): void {
    const currentValue = this.attributes.get(change.name) || 0;
    let newValue = currentValue;

    switch (change.operation) {
      case 'set':
        newValue = change.value;
        break;
      case 'add':
        newValue = currentValue + change.value;
        break;
      case 'subtract':
        newValue = currentValue - change.value;
        break;
      case 'multiply':
        newValue = currentValue * change.value;
        break;
    }

    // 应用属性限制
    const attr = this.customAttributes.get(change.name);
    if (attr && typeof attr.min === 'number' && typeof attr.max === 'number') {
      newValue = Math.max(attr.min, Math.min(attr.max, newValue));
    }

    this.attributes.set(change.name, newValue);

    if (this.debugMode) {
      console.log(`📊 属性变化: ${change.name} = ${newValue} (${change.operation} ${change.value})`);
    }

    // 处理临时变化
    if (change.duration) {
      setTimeout(() => {
        this.attributes.set(change.name, currentValue);
        if (this.debugMode) {
          console.log(`⏰ 属性恢复: ${change.name} = ${currentValue}`);
        }
      }, change.duration);
    }
  }

  /**
   * 获取属性值
   */
  getAttribute(name: string): any {
    return this.attributes.get(name);
  }

  /**
   * 设置属性值
   */
  setAttribute(name: string, value: any): void {
    this.attributes.set(name, value);
  }

  /**
   * 获取所有属性
   */
  getAllAttributes(): Map<string, any> {
    return new Map(this.attributes);
  }

  /**
   * 添加监听器
   */
  addListener(listener: (result: InteractionResult) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除监听器
   */
  removeListener(listener: (result: InteractionResult) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(result: InteractionResult): void {
    this.listeners.forEach(listener => {
      try {
        listener(result);
      } catch (error) {
        console.error('❌ 监听器执行失败:', error);
      }
    });
  }

  /**
   * 获取调试信息
   */
  getDebugInfo(): any {
    return {
      enabled: this.enabled,
      debugMode: this.debugMode,
      configName: this.config?.name,
      interactionCount: this.interactions.size,
      attributes: Object.fromEntries(this.attributes),
      cooldowns: Object.fromEntries(this.cooldowns)
    };
  }

  /**
   * 重新加载配置
   */
  async reload(): Promise<void> {
    this.interactions.clear();
    this.attributes.clear();
    this.customAttributes.clear();
    this.cooldowns.clear();
    
    await this.initialize();
  }
}

// 单例实例
export const customInteractionManager = new CustomInteractionManager();