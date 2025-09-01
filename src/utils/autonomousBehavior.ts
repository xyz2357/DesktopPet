/**
 * 自主行为管理器
 * 负责管理桌宠的自主行为，包括状态切换、行走、观察等
 */

import { PetConfig } from '../config/appConfig';
import { PetState } from './mediaManager';

export type AutonomousState = 'walking' | 'sleeping' | 'observing' | 'yawning' | 'stretching';

export interface BehaviorContext {
  /** 当前位置 */
  position: { x: number; y: number };
  /** 窗口尺寸 */
  windowSize: { width: number; height: number };
  /** 桌宠尺寸 */
  petSize: { width: number; height: number };
  /** 上次用户交互时间 */
  lastInteractionTime: number;
  /** 当前是否有用户交互 */
  hasUserInteraction: boolean;
  /** 鼠标位置 */
  mousePosition?: { x: number; y: number };
}

export interface BehaviorEvent {
  type: 'stateChange' | 'positionUpdate' | 'completed';
  state?: PetState;
  position?: { x: number; y: number };
  data?: any;
}

export class AutonomousBehaviorManager {
  private currentState: PetState = 'idle';
  private stateStartTime: number = Date.now();
  private lastUserInteractionTime: number = 0; // 跟踪真实用户交互时间
  private idleTimer: NodeJS.Timeout | null = null;
  private behaviorTimer: NodeJS.Timeout | null = null;
  private walkingDirection: { x: number; y: number } = { x: 1, y: 0 };
  private walkingTarget: { x: number; y: number } | null = null;
  private isWalking = false;
  private walkingStartPosition: { x: number; y: number } | null = null;

  private listeners: ((event: BehaviorEvent) => void)[] = [];

  constructor() {
    this.startIdleTimer();
  }

  /**
   * 添加事件监听器
   */
  addEventListener(listener: (event: BehaviorEvent) => void) {
    this.listeners.push(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listener: (event: BehaviorEvent) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: BehaviorEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  /**
   * 开始空闲计时器
   */
  private startIdleTimer() {
    this.clearTimers();
    
    this.idleTimer = setInterval(() => {
      if (!this.isUserInteracting()) {
        this.triggerRandomBehavior();
      }
    }, PetConfig.states.autonomous.idleStateChangeInterval);
  }

  /**
   * 触发随机行为
   */
  private triggerRandomBehavior() {
    const now = Date.now();
    const idleTime = now - this.stateStartTime;
    
    // 如果长时间无交互，增加睡眠概率
    let behaviors = { ...PetConfig.states.autonomous.behaviorProbabilities };
    if (idleTime > PetConfig.states.autonomous.longIdleThreshold) {
      behaviors.sleeping *= 2;
      behaviors.yawning *= 1.5;
    }

    const behaviorKeys = Object.keys(behaviors) as AutonomousState[];
    const weights = behaviorKeys.map(key => behaviors[key]);
    const selectedBehavior = this.weightedRandomChoice(behaviorKeys, weights);

    if (selectedBehavior && selectedBehavior !== this.currentState) {
      this.setState(selectedBehavior);
    }
  }

  /**
   * 权重随机选择
   */
  private weightedRandomChoice<T>(choices: T[], weights: number[]): T | null {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < choices.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return choices[i];
      }
    }

    return choices[choices.length - 1] || null;
  }

  /**
   * 设置状态
   */
  setState(newState: PetState) {
    if (newState === this.currentState) return;

    console.log(`🎭 桌宠状态变更: ${this.currentState} -> ${newState}`);
    
    this.currentState = newState;
    this.stateStartTime = Date.now();
    this.clearBehaviorTimer();

    // 根据状态设置持续时间
    const duration = this.getStateDuration(newState);
    if (duration > 0) {
      this.behaviorTimer = setTimeout(() => {
        this.completeBehavior();
      }, duration);
    }

    // 特殊状态处理
    if (newState === 'walking') {
      this.startWalking();
    } else {
      this.stopWalking();
    }

    this.emit({ type: 'stateChange', state: newState });
  }

  /**
   * 获取状态持续时间
   */
  private getStateDuration(state: PetState): number {
    const config = PetConfig.states.autonomous;
    switch (state) {
      case 'walking': return config.walkingDuration;
      case 'sleeping': return config.sleepingDuration;
      case 'observing': return config.observingDuration;
      case 'yawning': return config.yawningDuration;
      case 'stretching': return config.stretchingDuration;
      default: return 0;
    }
  }

  /**
   * 完成当前行为
   */
  private completeBehavior() {
    console.log(`✅ 桌宠行为完成: ${this.currentState}`);
    this.emit({ type: 'completed', state: this.currentState });
    this.setState('idle');
  }

  /**
   * 开始行走
   */
  private startWalking() {
    this.isWalking = true;
    console.log('🚶 开始行走行为');
  }

  /**
   * 停止行走
   */
  private stopWalking() {
    this.isWalking = false;
    this.walkingTarget = null;
    this.walkingStartPosition = null;
  }

  /**
   * 更新行走位置
   */
  updateWalkingPosition(context: BehaviorContext): { x: number; y: number } | null {
    if (!this.isWalking || this.currentState !== 'walking') {
      return null;
    }

    const { position, windowSize, petSize } = context;

    // 如果没有目标，生成一个随机目标
    if (!this.walkingTarget) {
      this.walkingTarget = this.generateWalkingTarget(position, windowSize, petSize);
      this.walkingStartPosition = { ...position };
    }

    // 计算移动向量
    const dx = this.walkingTarget.x - position.x;
    const dy = this.walkingTarget.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果接近目标，生成新目标
    if (distance < 10) {
      this.walkingTarget = this.generateWalkingTarget(position, windowSize, petSize);
      return position;
    }

    // 计算移动步长
    const speed = PetConfig.walking.speed / 60; // 转换为每帧像素数（假设60fps）
    const stepX = (dx / distance) * speed;
    const stepY = (dy / distance) * speed;

    // 添加一些随机性
    const variation = PetConfig.walking.stepVariation;
    const randomX = (Math.random() - 0.5) * variation;
    const randomY = (Math.random() - 0.5) * variation;

    const newPosition = {
      x: position.x + stepX + randomX,
      y: position.y + stepY + randomY
    };

    // 边界检查
    const margin = PetConfig.walking.boundaryMargin;
    newPosition.x = Math.max(margin, Math.min(newPosition.x, windowSize.width - petSize.width - margin));
    newPosition.y = Math.max(margin, Math.min(newPosition.y, windowSize.height - petSize.height - margin));

    this.emit({ type: 'positionUpdate', position: newPosition });
    return newPosition;
  }

  /**
   * 生成行走目标位置
   */
  private generateWalkingTarget(currentPosition: { x: number; y: number }, windowSize: { width: number; height: number }, petSize: { width: number; height: number }): { x: number; y: number } {
    const margin = PetConfig.walking.boundaryMargin;
    const maxX = windowSize.width - petSize.width - margin;
    const maxY = windowSize.height - petSize.height - margin;

    // 生成在可移动范围内的随机位置
    return {
      x: margin + Math.random() * (maxX - margin),
      y: margin + Math.random() * (maxY - margin)
    };
  }

  /**
   * 用户交互通知
   */
  onUserInteraction() {
    console.log('👆 用户交互，暂停自主行为');
    this.lastUserInteractionTime = Date.now(); // 只更新用户交互时间
    
    // 如果在自主行为状态，返回到idle
    if (this.isAutonomousState(this.currentState)) {
      this.setState('idle');
    }
  }

  /**
   * 判断是否为自主行为状态
   */
  private isAutonomousState(state: PetState): boolean {
    return ['walking', 'sleeping', 'observing', 'yawning', 'stretching'].includes(state);
  }

  /**
   * 检查是否有用户交互
   */
  private isUserInteracting(): boolean {
    const now = Date.now();
    const timeSinceLastUserInteraction = now - this.lastUserInteractionTime;
    
    // 如果用户最近有交互，暂停自主行为
    return timeSinceLastUserInteraction < 5000; // 用户交互后5秒内不触发新行为
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): PetState {
    return this.currentState;
  }

  /**
   * 是否正在行走
   */
  getIsWalking(): boolean {
    return this.isWalking;
  }

  /**
   * 清理所有计时器
   */
  private clearTimers() {
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
      this.idleTimer = null;
    }
    this.clearBehaviorTimer();
  }

  /**
   * 清理行为计时器
   */
  private clearBehaviorTimer() {
    if (this.behaviorTimer) {
      clearTimeout(this.behaviorTimer);
      this.behaviorTimer = null;
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.clearTimers();
    this.stopWalking();
    this.listeners = [];
  }
}