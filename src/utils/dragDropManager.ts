import { ItemData, PetReaction } from '../types/item';

export interface DragData {
  item: ItemData;
  dragStartTime: number;
  startPosition: { x: number; y: number };
}

export interface DropZone {
  id: string;
  bounds: DOMRect;
  element: HTMLElement;
}

export class DragDropManager {
  private currentDragData: DragData | null = null;
  private dropZones: Map<string, DropZone> = new Map();
  private dragListeners: ((data: DragData | null) => void)[] = [];
  private dropListeners: ((item: ItemData, dropZone: DropZone, position: { x: number; y: number }) => void)[] = [];
  
  // 开始拖拽
  startDrag(item: ItemData, event: DragEvent): void {
    this.currentDragData = {
      item,
      dragStartTime: Date.now(),
      startPosition: { x: event.clientX, y: event.clientY }
    };

    // 设置拖拽数据
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify({
        type: 'pet-item',
        itemId: item.id
      }));
      event.dataTransfer.effectAllowed = 'copy';
      
      // 创建自定义拖拽图像
      this.createDragImage(event, item);
    }

    console.log('🎯 开始拖拽道具:', item.name);
    this.notifyDragListeners(this.currentDragData);
  }

  // 结束拖拽
  endDrag(): void {
    if (this.currentDragData) {
      console.log('🎯 结束拖拽道具:', this.currentDragData.item.name);
      this.currentDragData = null;
      this.notifyDragListeners(null);
    }
  }

  // 处理拖拽
  handleDrag(event: DragEvent): void {
    if (!this.currentDragData) return;
    
    // 更新拖拽位置等逻辑可以在这里处理
  }

  // 处理放置
  handleDrop(event: DragEvent): boolean {
    event.preventDefault();
    
    if (!event.dataTransfer || !this.currentDragData) {
      return false;
    }

    try {
      const dragData = JSON.parse(event.dataTransfer.getData('application/json'));
      if (dragData.type !== 'pet-item' || dragData.itemId !== this.currentDragData.item.id) {
        return false;
      }
    } catch {
      return false;
    }

    const dropPosition = { x: event.clientX, y: event.clientY };
    
    // 检查是否放置在有效的放置区域
    const targetDropZone = this.findDropZoneAt(dropPosition);
    if (targetDropZone) {
      console.log('🎯 道具放置在放置区域:', targetDropZone.id, this.currentDragData.item.name);
      this.notifyDropListeners(this.currentDragData.item, targetDropZone, dropPosition);
      this.endDrag();
      return true;
    }

    this.endDrag();
    return false;
  }

  // 注册放置区域
  registerDropZone(id: string, element: HTMLElement): void {
    const bounds = element.getBoundingClientRect();
    this.dropZones.set(id, {
      id,
      bounds,
      element
    });
    
    console.log('🎯 注册放置区域:', id, bounds);
  }

  // 取消注册放置区域
  unregisterDropZone(id: string): void {
    this.dropZones.delete(id);
    console.log('🎯 取消注册放置区域:', id);
  }

  // 更新放置区域位置
  updateDropZone(id: string, element: HTMLElement): void {
    const dropZone = this.dropZones.get(id);
    if (dropZone) {
      dropZone.bounds = element.getBoundingClientRect();
      dropZone.element = element;
    }
  }

  // 查找指定位置的放置区域
  private findDropZoneAt(position: { x: number; y: number }): DropZone | null {
    for (const dropZone of this.dropZones.values()) {
      const bounds = dropZone.bounds;
      if (
        position.x >= bounds.left &&
        position.x <= bounds.right &&
        position.y >= bounds.top &&
        position.y <= bounds.bottom
      ) {
        return dropZone;
      }
    }
    return null;
  }

  // 创建自定义拖拽图像
  private createDragImage(event: DragEvent, item: ItemData): void {
    if (!event.dataTransfer) return;

    // 创建拖拽图像元素
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.fontSize = '32px';
    dragImage.style.padding = '8px';
    dragImage.style.background = 'rgba(255, 255, 255, 0.9)';
    dragImage.style.borderRadius = '8px';
    dragImage.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    dragImage.style.border = '2px solid #4a90e2';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.zIndex = '9999';
    dragImage.textContent = item.emoji;

    document.body.appendChild(dragImage);

    // 设置自定义拖拽图像
    event.dataTransfer.setDragImage(dragImage, 20, 20);

    // 清理拖拽图像
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  }

  // 获取当前拖拽数据
  getCurrentDragData(): DragData | null {
    return this.currentDragData;
  }

  // 添加拖拽监听器
  addDragListener(listener: (data: DragData | null) => void): void {
    this.dragListeners.push(listener);
  }

  // 移除拖拽监听器
  removeDragListener(listener: (data: DragData | null) => void): void {
    const index = this.dragListeners.indexOf(listener);
    if (index > -1) {
      this.dragListeners.splice(index, 1);
    }
  }

  // 通知拖拽监听器
  private notifyDragListeners(data: DragData | null): void {
    this.dragListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in drag listener:', error);
      }
    });
  }

  // 添加放置监听器
  addDropListener(listener: (item: ItemData, dropZone: DropZone, position: { x: number; y: number }) => void): void {
    this.dropListeners.push(listener);
  }

  // 移除放置监听器
  removeDropListener(listener: (item: ItemData, dropZone: DropZone, position: { x: number; y: number }) => void): void {
    const index = this.dropListeners.indexOf(listener);
    if (index > -1) {
      this.dropListeners.splice(index, 1);
    }
  }

  // 通知放置监听器
  private notifyDropListeners(item: ItemData, dropZone: DropZone, position: { x: number; y: number }): void {
    this.dropListeners.forEach(listener => {
      try {
        listener(item, dropZone, position);
      } catch (error) {
        console.error('Error in drop listener:', error);
      }
    });
  }

  // 检查点是否在元素内
  isPointInElement(point: { x: number; y: number }, element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom
    );
  }
}

// 单例实例
export const dragDropManager = new DragDropManager();