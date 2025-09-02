/**
 * 拖拽管理器单元测试
 * Drag Drop Manager Unit Tests
 */

import { DragDropManager, DropZone } from '../../src/utils/dragDropManager';
import { ItemData } from '../../src/types/item';

// Mock HTML5 drag events
const createMockDragEvent = (type: string, dataTransfer?: any): DragEvent => {
  const event = new Event(type) as DragEvent;
  Object.defineProperty(event, 'dataTransfer', {
    value: dataTransfer || {
      setData: jest.fn(),
      getData: jest.fn(),
      setDragImage: jest.fn(),
      effectAllowed: 'all',
      dropEffect: 'move'
    },
    writable: true
  });
  return event;
};

describe('DragDropManager', () => {
  let dragDropManager: DragDropManager;
  let mockDropListener: jest.Mock;
  
  const mockItem: ItemData = {
    id: 'test_item',
    name: 'Test Item',
    nameJa: 'テストアイテム',
    description: 'A test item for drag and drop',
    descriptionJa: 'ドラッグアンドドロップのテストアイテム',
    emoji: '🧪',
    type: 'tool',
    rarity: 'common',
    image: 'test_item',
    effects: []
  };

  let mockElement: HTMLElement;
  
  beforeAll(() => {
    // Mock getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: jest.fn()
    } as DOMRect));
  });

  beforeEach(() => {
    dragDropManager = new DragDropManager();
    mockDropListener = jest.fn();
    
    // Setup DOM
    document.body.innerHTML = '';
    mockElement = document.createElement('div');
    mockElement.id = 'test-container';
    document.body.appendChild(mockElement);
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  describe('初始化测试 / Initialization Tests', () => {
    test('应该正确初始化 / Should initialize correctly', () => {
      expect(dragDropManager).toBeDefined();
      expect(dragDropManager.getCurrentDragData()).toBeNull();
    });

    test('应该能注册放置区域 / Should register drop zones', () => {
      expect(() => dragDropManager.registerDropZone('test-zone', mockElement)).not.toThrow();
    });

    test('应该能注销放置区域 / Should unregister drop zones', () => {
      dragDropManager.registerDropZone('test-zone', mockElement);
      expect(() => dragDropManager.unregisterDropZone('test-zone')).not.toThrow();
    });
  });

  describe('拖拽开始测试 / Drag Start Tests', () => {
    test('应该能开始拖拽道具 / Should start dragging item', () => {
      const mockDataTransfer = {
        setData: jest.fn(),
        setDragImage: jest.fn(),
        effectAllowed: 'copy'
      };
      
      const event = createMockDragEvent('dragstart', mockDataTransfer);
      Object.defineProperty(event, 'clientX', { value: 50 });
      Object.defineProperty(event, 'clientY', { value: 50 });
      
      expect(() => dragDropManager.startDrag(mockItem, event)).not.toThrow();
      expect(dragDropManager.getCurrentDragData()).toBeTruthy();
      expect(mockDataTransfer.setData).toHaveBeenCalledWith('application/json', 
        JSON.stringify({ type: 'pet-item', itemId: mockItem.id }));
    });

    test('应该设置自定义拖拽图像 / Should set custom drag image', () => {
      const mockDataTransfer = {
        setData: jest.fn(),
        setDragImage: jest.fn(),
        effectAllowed: 'copy'
      };
      
      const event = createMockDragEvent('dragstart', mockDataTransfer);
      Object.defineProperty(event, 'clientX', { value: 50 });
      Object.defineProperty(event, 'clientY', { value: 50 });
      
      dragDropManager.startDrag(mockItem, event);
      
      expect(mockDataTransfer.setDragImage).toHaveBeenCalled();
      const setDragImageCall = mockDataTransfer.setDragImage.mock.calls[0];
      expect(setDragImageCall[0]).toBeInstanceOf(HTMLElement);
    });

    test('无效参数应该正确处理 / Should handle invalid parameters gracefully', () => {
      const event = createMockDragEvent('dragstart', null);
      
      expect(() => dragDropManager.startDrag(mockItem, event)).not.toThrow();
      // Even with null dataTransfer, startDrag still creates drag data but without setting dataTransfer
      expect(dragDropManager.getCurrentDragData()).toBeTruthy();
    });
  });

  describe('放置检测测试 / Drop Detection Tests', () => {
    beforeEach(() => {
      dragDropManager.registerDropZone('test-zone', mockElement);
      dragDropManager.addDropListener(mockDropListener);
    });

    test('应该检测到有效的放置 / Should detect valid drop', () => {
      // 模拟拖拽开始
      const mockDataTransfer = {
        setData: jest.fn(),
        getData: jest.fn().mockReturnValue(JSON.stringify({ type: 'pet-item', itemId: mockItem.id })),
        setDragImage: jest.fn(),
        effectAllowed: 'copy'
      };
      
      const startEvent = createMockDragEvent('dragstart', mockDataTransfer);
      Object.defineProperty(startEvent, 'clientX', { value: 50 });
      Object.defineProperty(startEvent, 'clientY', { value: 50 });
      dragDropManager.startDrag(mockItem, startEvent);
      
      // 模拟放置
      const dropEvent = createMockDragEvent('drop', mockDataTransfer);
      Object.defineProperty(dropEvent, 'clientX', { value: 50 });
      Object.defineProperty(dropEvent, 'clientY', { value: 50 });
      
      const result = dragDropManager.handleDrop(dropEvent);
      
      expect(result).toBe(true);
      expect(mockDropListener).toHaveBeenCalled();
    });

    test('超出放置区域应该返回false / Should return false when dropping outside zones', () => {
      const mockDataTransfer = {
        setData: jest.fn(),
        getData: jest.fn().mockReturnValue(JSON.stringify({ type: 'pet-item', itemId: mockItem.id })),
        setDragImage: jest.fn(),
        effectAllowed: 'copy'
      };
      
      const startEvent = createMockDragEvent('dragstart', mockDataTransfer);
      Object.defineProperty(startEvent, 'clientX', { value: 50 });
      Object.defineProperty(startEvent, 'clientY', { value: 50 });
      dragDropManager.startDrag(mockItem, startEvent);
      
      // 在放置区域外放置
      const dropEvent = createMockDragEvent('drop', mockDataTransfer);
      Object.defineProperty(dropEvent, 'clientX', { value: 200 });
      Object.defineProperty(dropEvent, 'clientY', { value: 200 });
      
      const result = dragDropManager.handleDrop(dropEvent);
      
      expect(result).toBe(false);
      expect(mockDropListener).not.toHaveBeenCalled();
    });

    test('无拖拽数据时应该返回false / Should return false with no drag data', () => {
      const mockDataTransfer = {
        getData: jest.fn().mockReturnValue(''),
        setData: jest.fn(),
        setDragImage: jest.fn()
      };
      
      const dropEvent = createMockDragEvent('drop', mockDataTransfer);
      
      const result = dragDropManager.handleDrop(dropEvent);
      
      expect(result).toBe(false);
    });
  });

  describe('拖拽状态管理测试 / Drag State Management Tests', () => {
    test('应该正确跟踪拖拽状态 / Should track dragging state correctly', () => {
      expect(dragDropManager.getCurrentDragData()).toBeNull();
      
      const mockDataTransfer = {
        setData: jest.fn(),
        setDragImage: jest.fn(),
        effectAllowed: 'copy'
      };
      
      const startEvent = createMockDragEvent('dragstart', mockDataTransfer);
      Object.defineProperty(startEvent, 'clientX', { value: 50 });
      Object.defineProperty(startEvent, 'clientY', { value: 50 });
      dragDropManager.startDrag(mockItem, startEvent);
      
      expect(dragDropManager.getCurrentDragData()).toBeTruthy();
      
      dragDropManager.endDrag();
      
      expect(dragDropManager.getCurrentDragData()).toBeNull();
    });

    test('应该在放置后结束拖拽 / Should end drag after drop', () => {
      dragDropManager.registerDropZone('test-zone', mockElement);
      
      const mockDataTransfer = {
        setData: jest.fn(),
        getData: jest.fn().mockReturnValue(JSON.stringify({ type: 'pet-item', itemId: mockItem.id })),
        setDragImage: jest.fn(),
        effectAllowed: 'copy'
      };
      
      const startEvent = createMockDragEvent('dragstart', mockDataTransfer);
      Object.defineProperty(startEvent, 'clientX', { value: 50 });
      Object.defineProperty(startEvent, 'clientY', { value: 50 });
      dragDropManager.startDrag(mockItem, startEvent);
      
      expect(dragDropManager.getCurrentDragData()).toBeTruthy();
      
      const dropEvent = createMockDragEvent('drop', mockDataTransfer);
      Object.defineProperty(dropEvent, 'clientX', { value: 50 });
      Object.defineProperty(dropEvent, 'clientY', { value: 50 });
      
      dragDropManager.handleDrop(dropEvent);
      
      expect(dragDropManager.getCurrentDragData()).toBeNull();
    });
  });

  describe('事件监听器测试 / Event Listener Tests', () => {
    test('应该能添加和移除放置监听器 / Should add and remove drop listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      expect(() => dragDropManager.addDropListener(listener1)).not.toThrow();
      expect(() => dragDropManager.addDropListener(listener2)).not.toThrow();
      
      expect(() => dragDropManager.removeDropListener(listener1)).not.toThrow();
    });

    test('多个监听器应该都被调用 / Multiple listeners should all be called', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      dragDropManager.addDropListener(listener1);
      dragDropManager.addDropListener(listener2);
      dragDropManager.registerDropZone('test-zone', mockElement);
      
      const mockDataTransfer = {
        setData: jest.fn(),
        getData: jest.fn().mockReturnValue(JSON.stringify({ type: 'pet-item', itemId: mockItem.id })),
        setDragImage: jest.fn(),
        effectAllowed: 'copy'
      };
      
      const startEvent = createMockDragEvent('dragstart', mockDataTransfer);
      Object.defineProperty(startEvent, 'clientX', { value: 50 });
      Object.defineProperty(startEvent, 'clientY', { value: 50 });
      dragDropManager.startDrag(mockItem, startEvent);
      
      const dropEvent = createMockDragEvent('drop', mockDataTransfer);
      Object.defineProperty(dropEvent, 'clientX', { value: 50 });
      Object.defineProperty(dropEvent, 'clientY', { value: 50 });
      
      dragDropManager.handleDrop(dropEvent);
      
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    test('监听器异常不应该影响其他监听器 / Listener errors should not affect other listeners', () => {
      const faultyListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = jest.fn();
      
      dragDropManager.addDropListener(faultyListener);
      dragDropManager.addDropListener(normalListener);
      dragDropManager.registerDropZone('test-zone', mockElement);
      
      const mockDataTransfer = {
        setData: jest.fn(),
        getData: jest.fn().mockReturnValue(JSON.stringify({ type: 'pet-item', itemId: mockItem.id })),
        setDragImage: jest.fn(),
        effectAllowed: 'copy'
      };
      
      const startEvent = createMockDragEvent('dragstart', mockDataTransfer);
      Object.defineProperty(startEvent, 'clientX', { value: 50 });
      Object.defineProperty(startEvent, 'clientY', { value: 50 });
      dragDropManager.startDrag(mockItem, startEvent);
      
      const dropEvent = createMockDragEvent('drop', mockDataTransfer);
      Object.defineProperty(dropEvent, 'clientX', { value: 50 });
      Object.defineProperty(dropEvent, 'clientY', { value: 50 });
      
      // 应该不会抛出异常
      expect(() => dragDropManager.handleDrop(dropEvent)).not.toThrow();
      
      expect(faultyListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });
  });

  describe('区域检测测试 / Zone Detection Tests', () => {
    test('应该正确检测点是否在元素内 / Should correctly detect if point is in element', () => {
      const testElement = document.createElement('div');
      
      // 测试区域内的点
      expect(dragDropManager.isPointInElement({ x: 50, y: 50 }, testElement)).toBe(true);
      expect(dragDropManager.isPointInElement({ x: 0, y: 0 }, testElement)).toBe(true);
      expect(dragDropManager.isPointInElement({ x: 100, y: 100 }, testElement)).toBe(true);
      
      // 测试区域外的点
      expect(dragDropManager.isPointInElement({ x: -1, y: 50 }, testElement)).toBe(false);
      expect(dragDropManager.isPointInElement({ x: 50, y: -1 }, testElement)).toBe(false);
      expect(dragDropManager.isPointInElement({ x: 101, y: 50 }, testElement)).toBe(false);
      expect(dragDropManager.isPointInElement({ x: 50, y: 101 }, testElement)).toBe(false);
    });

    test('应该能更新放置区域 / Should update drop zone', () => {
      const testElement = document.createElement('div');
      
      dragDropManager.registerDropZone('test-zone', testElement);
      expect(() => dragDropManager.updateDropZone('test-zone', testElement)).not.toThrow();
    });
  });

  describe('拖拽监听器测试 / Drag Listener Tests', () => {
    test('应该能添加和移除拖拽监听器 / Should add and remove drag listeners', () => {
      const listener = jest.fn();
      
      expect(() => dragDropManager.addDragListener(listener)).not.toThrow();
      expect(() => dragDropManager.removeDragListener(listener)).not.toThrow();
    });

    test('拖拽监听器应该被调用 / Drag listeners should be called', () => {
      const listener = jest.fn();
      
      dragDropManager.addDragListener(listener);
      
      const mockDataTransfer = {
        setData: jest.fn(),
        setDragImage: jest.fn(),
        effectAllowed: 'copy'
      };
      
      const startEvent = createMockDragEvent('dragstart', mockDataTransfer);
      Object.defineProperty(startEvent, 'clientX', { value: 50 });
      Object.defineProperty(startEvent, 'clientY', { value: 50 });
      
      dragDropManager.startDrag(mockItem, startEvent);
      
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        item: mockItem
      }));
    });
  });
});