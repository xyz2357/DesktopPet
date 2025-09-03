/**
 * 桌宠数值管理系统
 * 负责管理桌宠的体力、饱腹度、心情等数值以及持久化存储
 */

export interface PetStats {
  happiness: number;    // 心情值 (0-100)
  hunger: number;       // 饱腹度 (0-100) 
  energy: number;       // 体力值 (0-100)
  health: number;       // 健康值 (0-100)
  cleanliness: number;  // 清洁度 (0-100)
  lastUpdated: number;  // 上次更新时间戳
}

export interface StatChange {
  stat: keyof Omit<PetStats, 'lastUpdated'>;
  amount: number;
  reason?: string;
}

export type PetCondition = 'excellent' | 'good' | 'normal' | 'poor' | 'critical';

export class PetStatsManager {
  private stats: PetStats;
  private listeners: ((stats: PetStats, changes?: StatChange[]) => void)[] = [];
  private decayTimer: NodeJS.Timeout | null = null;
  
  // 默认数值
  private readonly DEFAULT_STATS: PetStats = {
    happiness: 75,
    hunger: 80,
    energy: 85,
    health: 90,
    cleanliness: 70,
    lastUpdated: Date.now()
  };

  // 数值衰减配置 (每分钟的变化量)
  private readonly DECAY_RATES = {
    happiness: -0.5,   // 心情每分钟衰减0.5
    hunger: -1.2,      // 饥饿每分钟增加1.2 (数值越低越饿)
    energy: -0.8,      // 体力每分钟衰减0.8
    health: -0.1,      // 健康每分钟轻微衰减0.1
    cleanliness: -0.3  // 清洁度每分钟衰减0.3
  };

  // 数值影响关系
  private readonly STAT_EFFECTS = {
    // 饥饿过低影响健康和心情
    hunger: {
      health: { threshold: 20, effect: -0.2 },
      happiness: { threshold: 30, effect: -0.3 }
    },
    // 体力过低影响心情
    energy: {
      happiness: { threshold: 25, effect: -0.2 }
    },
    // 健康过低影响所有数值
    health: {
      happiness: { threshold: 30, effect: -0.4 },
      energy: { threshold: 40, effect: -0.2 }
    },
    // 清洁度过低影响健康和心情
    cleanliness: {
      health: { threshold: 25, effect: -0.1 },
      happiness: { threshold: 35, effect: -0.2 }
    }
  };

  constructor() {
    this.stats = this.loadStats();
    this.startDecayTimer();
    
    // 处理离线时间的数值变化
    this.handleOfflineTime();
  }

  /**
   * 从localStorage加载数值
   */
  private loadStats(): PetStats {
    try {
      const saved = localStorage.getItem('petStats');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 确保所有必需字段都存在
        return {
          ...this.DEFAULT_STATS,
          ...parsed,
          lastUpdated: parsed.lastUpdated || Date.now()
        };
      }
    } catch (error) {
      console.warn('载入桌宠数值失败，使用默认值:', error);
    }
    return { ...this.DEFAULT_STATS };
  }

  /**
   * 保存数值到localStorage
   */
  private saveStats(): void {
    try {
      this.stats.lastUpdated = Date.now();
      localStorage.setItem('petStats', JSON.stringify(this.stats));
    } catch (error) {
      console.error('保存桌宠数值失败:', error);
    }
  }

  /**
   * 处理离线时间造成的数值变化
   */
  private handleOfflineTime(): void {
    const now = Date.now();
    const offlineMinutes = (now - this.stats.lastUpdated) / (1000 * 60);
    
    if (offlineMinutes > 1) { // 离线超过1分钟才处理
      console.log(`🕐 检测到离线时间: ${Math.round(offlineMinutes)} 分钟`);
      
      const changes: StatChange[] = [];
      
      // 应用离线衰减
      Object.entries(this.DECAY_RATES).forEach(([stat, rate]) => {
        const change = rate * offlineMinutes;
        const newValue = Math.max(0, Math.min(100, this.stats[stat as keyof typeof this.DECAY_RATES] + change));
        
        if (Math.abs(change) > 0.1) { // 变化超过0.1才记录
          changes.push({
            stat: stat as keyof Omit<PetStats, 'lastUpdated'>,
            amount: newValue - this.stats[stat as keyof typeof this.DECAY_RATES],
            reason: '离线时间'
          });
        }
        
        this.stats[stat as keyof typeof this.DECAY_RATES] = newValue;
      });
      
      if (changes.length > 0) {
        this.saveStats();
        this.notifyListeners(changes);
      }
    }
  }

  /**
   * 开始数值衰减定时器
   */
  private startDecayTimer(): void {
    // 每30秒更新一次数值
    this.decayTimer = setInterval(() => {
      this.applyDecay();
    }, 30000);
  }

  /**
   * 应用数值衰减
   */
  private applyDecay(): void {
    const changes: StatChange[] = [];
    const decayFactor = 0.5; // 30秒 = 0.5分钟
    
    // 基础衰减
    Object.entries(this.DECAY_RATES).forEach(([stat, rate]) => {
      const change = rate * decayFactor;
      const currentValue = this.stats[stat as keyof typeof this.DECAY_RATES];
      const newValue = Math.max(0, Math.min(100, currentValue + change));
      
      if (newValue !== currentValue) {
        changes.push({
          stat: stat as keyof Omit<PetStats, 'lastUpdated'>,
          amount: newValue - currentValue,
          reason: '时间流逝'
        });
        this.stats[stat as keyof typeof this.DECAY_RATES] = newValue;
      }
    });

    // 应用数值间的相互影响
    this.applyStatEffects(changes);

    if (changes.length > 0) {
      this.saveStats();
      this.notifyListeners(changes);
    }
  }

  /**
   * 应用数值间的相互影响
   */
  private applyStatEffects(changes: StatChange[]): void {
    Object.entries(this.STAT_EFFECTS).forEach(([sourceStat, effects]) => {
      const sourceValue = this.stats[sourceStat as keyof PetStats];
      
      Object.entries(effects).forEach(([targetStat, config]) => {
        if (sourceValue < config.threshold) {
          const currentValue = this.stats[targetStat as keyof PetStats];
          const newValue = Math.max(0, Math.min(100, currentValue + config.effect));
          
          if (newValue !== currentValue) {
            changes.push({
              stat: targetStat as keyof Omit<PetStats, 'lastUpdated'>,
              amount: newValue - currentValue,
              reason: `${sourceStat}过低`
            });
            this.stats[targetStat as keyof PetStats] = newValue;
          }
        }
      });
    });
  }

  /**
   * 修改数值
   */
  public changeStat(stat: keyof Omit<PetStats, 'lastUpdated'>, amount: number, reason?: string): void {
    const currentValue = this.stats[stat];
    const newValue = Math.max(0, Math.min(100, currentValue + amount));
    
    if (newValue !== currentValue) {
      const change: StatChange = { stat, amount: newValue - currentValue, reason };
      this.stats[stat] = newValue;
      this.saveStats();
      this.notifyListeners([change]);
      
      console.log(`📊 数值变化: ${stat} ${currentValue.toFixed(1)} → ${newValue.toFixed(1)} (${reason || '未知原因'})`);
    }
  }

  /**
   * 批量修改数值
   */
  public changeStats(changes: StatChange[]): void {
    const actualChanges: StatChange[] = [];
    
    changes.forEach(change => {
      const currentValue = this.stats[change.stat];
      const newValue = Math.max(0, Math.min(100, currentValue + change.amount));
      
      if (newValue !== currentValue) {
        actualChanges.push({
          ...change,
          amount: newValue - currentValue
        });
        this.stats[change.stat] = newValue;
      }
    });

    if (actualChanges.length > 0) {
      this.saveStats();
      this.notifyListeners(actualChanges);
    }
  }

  /**
   * 获取当前数值
   */
  public getStats(): PetStats {
    return { ...this.stats };
  }

  /**
   * 获取桌宠整体状况
   */
  public getOverallCondition(): PetCondition {
    const average = (this.stats.happiness + this.stats.hunger + this.stats.energy + this.stats.health + this.stats.cleanliness) / 5;
    
    if (average >= 90) return 'excellent';
    if (average >= 75) return 'good';
    if (average >= 50) return 'normal';
    if (average >= 25) return 'poor';
    return 'critical';
  }

  /**
   * 获取数值颜色（用于UI显示）
   */
  public getStatColor(value: number): string {
    if (value >= 75) return '#4CAF50'; // 绿色
    if (value >= 50) return '#FF9800'; // 橙色
    if (value >= 25) return '#FF5722'; // 红橙色
    return '#F44336'; // 红色
  }

  /**
   * 获取数值状态文本
   */
  public getStatStatus(stat: keyof Omit<PetStats, 'lastUpdated'>, value: number): string {
    const statTexts = {
      happiness: {
        excellent: '非常开心', good: '心情不错', normal: '普通', poor: '有点沮丧', critical: '很不开心'
      },
      hunger: {
        excellent: '很饱', good: '饱腹', normal: '一般', poor: '有点饿', critical: '非常饿'
      },
      energy: {
        excellent: '精力充沛', good: '体力不错', normal: '一般', poor: '有点累', critical: '很疲惫'
      },
      health: {
        excellent: '非常健康', good: '健康', normal: '一般', poor: '不太好', critical: '很不好'
      },
      cleanliness: {
        excellent: '很干净', good: '比较干净', normal: '一般', poor: '有点脏', critical: '很脏'
      }
    };

    const texts = statTexts[stat];
    if (value >= 90) return texts.excellent;
    if (value >= 75) return texts.good;
    if (value >= 50) return texts.normal;
    if (value >= 25) return texts.poor;
    return texts.critical;
  }

  /**
   * 添加数值变化监听器
   */
  public addListener(listener: (stats: PetStats, changes?: StatChange[]) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除数值变化监听器
   */
  public removeListener(listener: (stats: PetStats, changes?: StatChange[]) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(changes?: StatChange[]): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getStats(), changes);
      } catch (error) {
        console.error('数值监听器错误:', error);
      }
    });
  }

  /**
   * 重置所有数值
   */
  public resetStats(): void {
    this.stats = { ...this.DEFAULT_STATS, lastUpdated: Date.now() };
    this.saveStats();
    this.notifyListeners();
    console.log('🔄 桌宠数值已重置');
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    if (this.decayTimer) {
      clearInterval(this.decayTimer);
      this.decayTimer = null;
    }
    this.listeners = [];
  }
}

// 单例实例
export const petStatsManager = new PetStatsManager();