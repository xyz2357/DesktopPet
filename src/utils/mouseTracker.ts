/**
 * 鼠标跟踪管理器
 * 负责跟踪鼠标位置并计算桌宠的注视方向
 */

import { PetConfig } from '../config/appConfig';

export interface MouseTrackingData {
  /** 鼠标位置 */
  mousePosition: { x: number; y: number };
  /** 桌宠位置 */
  petPosition: { x: number; y: number };
  /** 桌宠尺寸 */
  petSize: { width: number; height: number };
  /** 是否在跟踪范围内 */
  isInTrackingRange: boolean;
  /** 注视角度（弧度） */
  lookAngle: number;
  /** 注视方向（标准化向量） */
  lookDirection: { x: number; y: number };
}

export class MouseTracker {
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private isTracking: boolean = false;
  private listeners: ((data: MouseTrackingData) => void)[] = [];
  private animationFrame: number | null = null;

  constructor() {
    this.initializeTracking();
  }

  /**
   * 初始化鼠标跟踪
   */
  private initializeTracking() {
    if (!PetConfig.mouseTracking.enabled) {
      return;
    }

    // 监听全局鼠标移动
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    console.log('👀 鼠标跟踪已启用');
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove(event: MouseEvent) {
    this.mousePosition = {
      x: event.clientX,
      y: event.clientY
    };

    // 如果正在跟踪，触发更新
    if (this.isTracking) {
      this.requestUpdate();
    }
  }

  /**
   * 请求更新（防抖）
   */
  private requestUpdate() {
    if (this.animationFrame) {
      return;
    }

    this.animationFrame = requestAnimationFrame(() => {
      this.updateTracking();
      this.animationFrame = null;
    });
  }

  /**
   * 更新跟踪数据
   */
  private updateTracking() {
    // 这里需要当前的桌宠位置和尺寸，通过listeners获取
    this.listeners.forEach(listener => {
      // 这个会在Pet组件中提供具体的位置数据
      listener(this.calculateTrackingData({ x: 0, y: 0 }, { width: 120, height: 120 }));
    });
  }

  /**
   * 计算跟踪数据
   */
  calculateTrackingData(petPosition: { x: number; y: number }, petSize: { width: number; height: number }): MouseTrackingData {
    // 计算桌宠中心点
    const petCenter = {
      x: petPosition.x + petSize.width / 2,
      y: petPosition.y + petSize.height / 2
    };

    // 计算鼠标到桌宠中心的距离
    const dx = this.mousePosition.x - petCenter.x;
    const dy = this.mousePosition.y - petCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 判断是否在跟踪范围内
    const isInTrackingRange = distance <= PetConfig.mouseTracking.trackingRadius;

    // 计算注视角度和方向
    const lookAngle = Math.atan2(dy, dx);
    const lookDirection = distance > 0 ? {
      x: dx / distance,
      y: dy / distance
    } : { x: 0, y: 0 };

    return {
      mousePosition: { ...this.mousePosition },
      petPosition: { ...petPosition },
      petSize: { ...petSize },
      isInTrackingRange,
      lookAngle,
      lookDirection
    };
  }

  /**
   * 开始跟踪
   */
  startTracking(petPosition: { x: number; y: number }, petSize: { width: number; height: number }) {
    this.isTracking = true;
    
    // 立即计算一次
    const trackingData = this.calculateTrackingData(petPosition, petSize);
    this.emitTrackingData(trackingData);
  }

  /**
   * 停止跟踪
   */
  stopTracking() {
    this.isTracking = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * 更新桌宠位置和尺寸
   */
  updatePetData(petPosition: { x: number; y: number }, petSize: { width: number; height: number }) {
    if (!this.isTracking) {
      return;
    }

    const trackingData = this.calculateTrackingData(petPosition, petSize);
    this.emitTrackingData(trackingData);
  }

  /**
   * 发送跟踪数据给监听器
   */
  private emitTrackingData(data: MouseTrackingData) {
    this.listeners.forEach(listener => listener(data));
  }

  /**
   * 添加跟踪数据监听器
   */
  addListener(listener: (data: MouseTrackingData) => void) {
    this.listeners.push(listener);
  }

  /**
   * 移除跟踪数据监听器
   */
  removeListener(listener: (data: MouseTrackingData) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 获取当前鼠标位置
   */
  getCurrentMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  /**
   * 检查鼠标是否在指定区域内
   */
  isMouseInArea(area: { x: number; y: number; width: number; height: number }): boolean {
    return this.mousePosition.x >= area.x &&
           this.mousePosition.x <= area.x + area.width &&
           this.mousePosition.y >= area.y &&
           this.mousePosition.y <= area.y + area.height;
  }

  /**
   * 计算鼠标到点的距离
   */
  getDistanceToPoint(point: { x: number; y: number }): number {
    const dx = this.mousePosition.x - point.x;
    const dy = this.mousePosition.y - point.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 销毁鼠标跟踪器
   */
  destroy() {
    this.stopTracking();
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.listeners = [];
    console.log('👀 鼠标跟踪已销毁');
  }
}

// 导出单例实例
export const mouseTracker = new MouseTracker();