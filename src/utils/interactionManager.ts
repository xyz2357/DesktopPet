/**
 * 交互管理器
 * 负责管理特殊交互、彩蛋、时间感知等高级功能
 */

import { PetConfig } from '../config/appConfig';
import { PetTexts } from '../config/petTexts';

export interface InteractionEvent {
  type: 'click' | 'doubleClick' | 'tripleClick' | 'longPress' | 'rapidClick' | 'timeBasedEmotion';
  timestamp: number;
  data?: any;
}

export interface TimeBasedEmotion {
  emotion: string;
  text: string;
  duration: number;
}

export class InteractionManager {
  private clickHistory: number[] = [];
  private longPressTimer: NodeJS.Timeout | null = null;
  private rapidClickCount = 0;
  private rapidClickTimer: NodeJS.Timeout | null = null;
  private lastClickTime = 0;
  private emotionListeners: ((emotion: TimeBasedEmotion) => void)[] = [];
  private timeEmotionTimer: NodeJS.Timeout | null = null;

  // 时间段配置
  private readonly TIME_PERIODS = {
    morning: { start: 6, end: 11, emotions: ['energetic', 'fresh', 'motivated'] },
    afternoon: { start: 12, end: 17, emotions: ['focused', 'productive', 'active'] },
    evening: { start: 18, end: 22, emotions: ['relaxed', 'cozy', 'calm'] },
    night: { start: 23, end: 5, emotions: ['sleepy', 'dreamy', 'quiet'] }
  };

  // 特殊日期配置
  private readonly SPECIAL_DATES = {
    '0101': { name: '新年', emotions: ['excited', 'hopeful', 'festive'] },
    '0214': { name: '情人节', emotions: ['romantic', 'sweet', 'loving'] },
    '1225': { name: '圣诞节', emotions: ['joyful', 'festive', 'magical'] },
    '1031': { name: '万圣节', emotions: ['spooky', 'playful', 'mysterious'] }
  };

  constructor() {
    this.startTimeBasedEmotionLoop();
  }

  /**
   * 处理点击事件
   */
  handleClick(): InteractionEvent {
    const now = Date.now();
    this.clickHistory.push(now);
    
    // 清理超过5秒的点击历史
    this.clickHistory = this.clickHistory.filter(time => now - time <= 5000);
    
    // 检测快速连击
    const timeSinceLastClick = now - this.lastClickTime;
    if (timeSinceLastClick < 500) { // 500ms内的连击
      this.rapidClickCount++;
      this.resetRapidClickTimer();
    } else {
      this.rapidClickCount = 1;
    }
    
    this.lastClickTime = now;

    // 判断点击类型
    if (this.rapidClickCount >= 10) {
      this.rapidClickCount = 0;
      return this.createEasterEgg('rapidClick', { count: this.rapidClickCount });
    } else if (this.clickHistory.length >= 3 && this.isTripleClick()) {
      return this.createEasterEgg('tripleClick', {});
    } else if (this.clickHistory.length >= 2 && this.isDoubleClick()) {
      return this.createEasterEgg('doubleClick', {});
    }

    // 设置长按检测
    this.startLongPressTimer();

    return { type: 'click', timestamp: now };
  }

  /**
   * 检测双击
   */
  private isDoubleClick(): boolean {
    if (this.clickHistory.length < 2) return false;
    const [secondLast, last] = this.clickHistory.slice(-2);
    return last - secondLast < 400; // 400ms内双击
  }

  /**
   * 检测三击
   */
  private isTripleClick(): boolean {
    if (this.clickHistory.length < 3) return false;
    const [thirdLast, secondLast, last] = this.clickHistory.slice(-3);
    return (last - thirdLast < 800) && (secondLast - thirdLast < 400); // 800ms内三击
  }

  /**
   * 开始长按计时器
   */
  private startLongPressTimer() {
    this.clearLongPressTimer();
    this.longPressTimer = setTimeout(() => {
      this.triggerLongPress();
    }, 1000); // 1秒长按
  }

  /**
   * 清除长按计时器
   */
  private clearLongPressTimer() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /**
   * 触发长按事件
   */
  private triggerLongPress() {
    // 长按彩蛋逻辑
    console.log('🔥 检测到长按！触发特殊互动');
  }

  /**
   * 重置快速点击计时器
   */
  private resetRapidClickTimer() {
    if (this.rapidClickTimer) {
      clearTimeout(this.rapidClickTimer);
    }
    
    this.rapidClickTimer = setTimeout(() => {
      this.rapidClickCount = 0;
    }, 2000); // 2秒后重置计数
  }

  /**
   * 创建彩蛋事件
   */
  private createEasterEgg(type: string, data: any): InteractionEvent {
    console.log(`🥚 触发彩蛋: ${type}`, data);
    
    return {
      type: type as any,
      timestamp: Date.now(),
      data: {
        ...data,
        easterEgg: true,
        message: this.getEasterEggMessage(type)
      }
    };
  }

  /**
   * 获取彩蛋消息
   */
  private getEasterEggMessage(type: string): string {
    switch (type) {
      case 'doubleClick':
        return '双击发现！🎉';
      case 'tripleClick':
        return '三连击！厉害！✨';
      case 'rapidClick':
        return '哇！你的手速好快！🔥';
      case 'longPress':
        return '长按的秘密～💫';
      default:
        return '特殊互动！🎈';
    }
  }

  /**
   * 开始时间感知情绪循环
   */
  private startTimeBasedEmotionLoop() {
    // 立即执行一次
    this.updateTimeBasedEmotion();
    
    // 每30分钟检查一次时间感知情绪
    this.timeEmotionTimer = setInterval(() => {
      this.updateTimeBasedEmotion();
    }, 30 * 60 * 1000);
  }

  /**
   * 更新基于时间的情绪
   */
  private updateTimeBasedEmotion() {
    const now = new Date();
    const currentHour = now.getHours();
    const monthDay = String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
    
    let emotions: string[] = [];
    let contextName = '';

    // 检查特殊日期
    if (this.SPECIAL_DATES[monthDay as keyof typeof this.SPECIAL_DATES]) {
      const special = this.SPECIAL_DATES[monthDay as keyof typeof this.SPECIAL_DATES];
      emotions = special.emotions;
      contextName = special.name;
    } else {
      // 根据时间段确定情绪
      const period = this.getCurrentTimePeriod(currentHour);
      emotions = this.TIME_PERIODS[period].emotions;
      contextName = this.getTimePeriodName(period);
    }

    // 随机选择一个情绪
    const selectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const emotionData: TimeBasedEmotion = {
      emotion: selectedEmotion,
      text: this.getEmotionText(selectedEmotion, contextName),
      duration: 10000 // 10秒显示时间
    };

    console.log(`⏰ 时间感知情绪更新: ${selectedEmotion} (${contextName})`);
    this.emitTimeBasedEmotion(emotionData);
  }

  /**
   * 获取当前时间段
   */
  private getCurrentTimePeriod(hour: number): keyof typeof this.TIME_PERIODS {
    if (hour >= 6 && hour <= 11) return 'morning';
    if (hour >= 12 && hour <= 17) return 'afternoon';
    if (hour >= 18 && hour <= 22) return 'evening';
    return 'night';
  }

  /**
   * 获取时间段名称
   */
  private getTimePeriodName(period: keyof typeof this.TIME_PERIODS): string {
    switch (period) {
      case 'morning': return '早晨';
      case 'afternoon': return '下午';
      case 'evening': return '傍晚';
      case 'night': return '夜晚';
    }
  }

  /**
   * 获取情绪对应的文本
   */
  private getEmotionText(emotion: string, context: string): string {
    const emotionTexts: { [key: string]: string[] } = {
      energetic: [`${context}好有活力！`, '精神满满～', '充满能量！'],
      fresh: [`${context}的新鲜空气～`, '感觉很清新', '心情舒畅'],
      motivated: ['今天要加油！', '动力满满', '充满干劲'],
      focused: ['专注模式开启', '认真工作中', '集中精神'],
      productive: ['效率很高呢', '今天很有成就感', '工作很顺利'],
      active: ['活跃状态', '精力充沛', '状态很好'],
      relaxed: ['放松一下～', '很舒服的感觉', '悠闲时光'],
      cozy: ['温馨的氛围', '很舒适', '暖暖的感觉'],
      calm: ['内心平静', '安详的感觉', '很宁静'],
      sleepy: ['有点困了...', '想睡觉', '眼皮好重'],
      dreamy: ['梦幻的感觉', '像在梦中', '朦朦胧胧'],
      quiet: ['安静的夜晚', '很宁静', '静谧时光'],
      excited: ['好兴奋！', '心情激动', '特别开心'],
      hopeful: ['满怀希望', '充满期待', '对未来乐观'],
      festive: ['节日快乐！', '庆祝时刻', '欢乐氛围'],
      romantic: ['浪漫的氛围', '爱意满满', '甜蜜时光'],
      sweet: ['甜甜的感觉', '很温馨', '暖心时刻'],
      loving: ['充满爱意', '温暖的关怀', '深深的情意'],
      joyful: ['快乐满满', '喜悦之情', '开心极了'],
      magical: ['神奇的感觉', '魔法般的体验', '奇妙时刻'],
      spooky: ['神秘的氛围', '有点吓人', '诡异的感觉'],
      playful: ['想要玩耍', '调皮模式', '充满乐趣'],
      mysterious: ['神秘莫测', '谜一般的感觉', '充满未知']
    };

    const texts = emotionTexts[emotion] || ['心情不错'];
    return texts[Math.floor(Math.random() * texts.length)];
  }

  /**
   * 发送时间感知情绪事件
   */
  private emitTimeBasedEmotion(emotion: TimeBasedEmotion) {
    this.emotionListeners.forEach(listener => listener(emotion));
  }

  /**
   * 添加情绪监听器
   */
  addEmotionListener(listener: (emotion: TimeBasedEmotion) => void) {
    this.emotionListeners.push(listener);
  }

  /**
   * 移除情绪监听器
   */
  removeEmotionListener(listener: (emotion: TimeBasedEmotion) => void) {
    const index = this.emotionListeners.indexOf(listener);
    if (index > -1) {
      this.emotionListeners.splice(index, 1);
    }
  }

  /**
   * 获取当前情绪状态
   */
  getCurrentEmotionState(): { period: string; emotions: string[] } {
    const currentHour = new Date().getHours();
    const period = this.getCurrentTimePeriod(currentHour);
    return {
      period: this.getTimePeriodName(period),
      emotions: this.TIME_PERIODS[period].emotions
    };
  }

  /**
   * 手动触发特殊情绪（用于调试或特殊事件）
   */
  triggerSpecialEmotion(emotion: string, text: string, duration = 5000) {
    const emotionData: TimeBasedEmotion = { emotion, text, duration };
    this.emitTimeBasedEmotion(emotionData);
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.clearLongPressTimer();
    
    if (this.rapidClickTimer) {
      clearTimeout(this.rapidClickTimer);
    }
    
    if (this.timeEmotionTimer) {
      clearInterval(this.timeEmotionTimer);
    }
    
    this.emotionListeners = [];
    this.clickHistory = [];
  }
}

// 导出单例实例
export const interactionManager = new InteractionManager();