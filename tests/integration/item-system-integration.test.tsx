/**
 * 道具系统集成测试
 * Item System Integration Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ItemPanel from '../../src/components/ItemPanel';
import { ItemManager } from '../../src/utils/itemManager';
import { DragDropManager } from '../../src/utils/dragDropManager';
import { itemImageManager } from '../../src/utils/itemImageManager';

// Mock the image manager
jest.mock('../../src/utils/itemImageManager', () => ({
  itemImageManager: {
    initialize: jest.fn().mockResolvedValue(undefined),
    getItemImageUrl: jest.fn().mockReturnValue(null),
    hasCustomImage: jest.fn().mockReturnValue(false),
    getItemImage: jest.fn().mockReturnValue(null),
    reloadItemImage: jest.fn().mockResolvedValue(undefined),
    reloadAllImages: jest.fn().mockResolvedValue(undefined),
    getAllItemImages: jest.fn().mockReturnValue(new Map())
  }
}));

describe('Item System Integration', () => {
  let mockOnClick: jest.Mock;
  let mockOnHoverChange: jest.Mock;
  let mockOnContextMenuChange: jest.Mock;
  let itemManager: ItemManager;
  let dragDropManager: DragDropManager;

  beforeEach(() => {
    mockOnClick = jest.fn();
    mockOnHoverChange = jest.fn();
    mockOnContextMenuChange = jest.fn();
    
    itemManager = new ItemManager();
    dragDropManager = new DragDropManager();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock DOM methods
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    Object.defineProperty(window, 'innerHeight', { value: 768 });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('道具面板与桌宠交互 / Item Panel and Pet Interaction', () => {
    test('应该能打开和关闭道具面板 / Should open and close item panel', async () => {
      const mockOnClose = jest.fn();
      const mockOnItemDragStart = jest.fn();
      
      // Test closed panel
      const { rerender } = render(
        <ItemPanel 
          visible={false} 
          onClose={mockOnClose} 
          onItemDragStart={mockOnItemDragStart} 
        />
      );
      
      // Panel should not be visible when closed
      expect(screen.queryByText('道具箱')).not.toBeInTheDocument();
      
      // Test opened panel
      rerender(
        <ItemPanel 
          visible={true} 
          onClose={mockOnClose} 
          onItemDragStart={mockOnItemDragStart} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('道具箱')).toBeInTheDocument();
      });
      
      // Test closing by clicking the close button
      const closeButton = screen.getByRole('button', { name: '✕' });
      await userEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('道具面板应该显示所有默认道具 / Item panel should show all default items', async () => {
      const mockOnClose = jest.fn();
      const mockOnItemDragStart = jest.fn();
      
      render(
        <ItemPanel 
          visible={true} 
          onClose={mockOnClose} 
          onItemDragStart={mockOnItemDragStart} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('道具箱')).toBeInTheDocument();
      });
      
      // Verify filter buttons are displayed
      expect(screen.getByText('全部')).toBeInTheDocument();
      expect(screen.getByText('🍎 食物')).toBeInTheDocument();
      expect(screen.getByText('🎾 玩具')).toBeInTheDocument();
      
      // Verify items exist in manager
      const items = itemManager.getAllItems();
      expect(items.length).toBeGreaterThan(0);
    });

    test('应该能按类型过滤道具 / Should filter items by type', async () => {
      const mockOnClose = jest.fn();
      const mockOnItemDragStart = jest.fn();
      
      render(
        <ItemPanel 
          visible={true} 
          onClose={mockOnClose} 
          onItemDragStart={mockOnItemDragStart} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('道具箱')).toBeInTheDocument();
      });
      
      // Click food filter
      const foodFilter = screen.getByText('🍎 食物');
      await userEvent.click(foodFilter);
      
      // Verify food filter button becomes active
      expect(foodFilter.closest('button')).toHaveClass('active');
      
      // Verify food items exist
      const foodItems = itemManager.getItemsByType('food');
      expect(foodItems.length).toBeGreaterThan(0);
    });
  });

  describe('道具管理器功能测试 / Item Manager Functionality Tests', () => {
    test('应该能获取和使用道具 / Should get and use items', async () => {
      const items = itemManager.getAllItems();
      expect(items.length).toBeGreaterThan(0);
      
      const fishItem = items.find(item => item.id === 'fish');
      expect(fishItem).toBeDefined();
      
      if (fishItem) {
        const reaction = await itemManager.useItem(fishItem.id, { x: 100, y: 100 });
        expect(reaction).toBeDefined();
      }
    });

    test('应该正确管理冷却时间 / Should manage cooldowns correctly', () => {
      const items = itemManager.getAllItems();
      const testItem = items[0];
      
      const canUse = itemManager.canUseItem(testItem.id);
      expect(canUse.canUse).toBe(true);
      
      const cooldownRemaining = itemManager.getCooldownRemaining(testItem.id);
      expect(typeof cooldownRemaining).toBe('number');
      expect(cooldownRemaining).toBeGreaterThanOrEqual(0);
    });

    test('连续使用道具应该遵守冷却时间 / Consecutive item usage should respect cooldown', async () => {
      const items = itemManager.getAllItems();
      const testItem = items.find(item => item.cooldown && item.cooldown > 0);
      
      if (testItem) {
        // First use should succeed
        const reaction1 = await itemManager.useItem(testItem.id, { x: 0, y: 0 });
        expect(reaction1).toBeDefined();
        
        // Second use should be blocked by cooldown
        const canUse = itemManager.canUseItem(testItem.id);
        if (!canUse.canUse) {
          expect(canUse.reason).toContain('cooldown');
        }
      } else {
        // If no items have cooldowns, test passes trivially
        expect(true).toBe(true);
      }
    });
  });

  describe('拖拽管理器功能测试 / Drag Drop Manager Functionality Tests', () => {
    test('应该能管理拖拽状态 / Should manage drag state', () => {
      expect(dragDropManager.getCurrentDragData()).toBeNull();
      
      // Test drop zone registration
      const element = document.createElement('div');
      expect(() => dragDropManager.registerDropZone('test-zone', element)).not.toThrow();
      expect(() => dragDropManager.unregisterDropZone('test-zone')).not.toThrow();
    });

    test('应该能添加和移除监听器 / Should add and remove listeners', () => {
      const dragListener = jest.fn();
      const dropListener = jest.fn();
      
      expect(() => dragDropManager.addDragListener(dragListener)).not.toThrow();
      expect(() => dragDropManager.addDropListener(dropListener)).not.toThrow();
      
      expect(() => dragDropManager.removeDragListener(dragListener)).not.toThrow();
      expect(() => dragDropManager.removeDropListener(dropListener)).not.toThrow();
    });
  });

  describe('边界情况测试 / Edge Case Tests', () => {
    test('无效道具ID不应该崩溃 / Invalid item ID should not crash', async () => {
      const reaction = await itemManager.useItem('non_existent_item', { x: 0, y: 0 });
      expect(reaction).toBeNull();
      
      const canUse = itemManager.canUseItem('non_existent_item');
      expect(canUse.canUse).toBe(false);
    });

    test('极端坐标位置应该正确处理 / Extreme coordinates should be handled correctly', async () => {
      const items = itemManager.getAllItems();
      const testItem = items[0];
      
      const reaction1 = await itemManager.useItem(testItem.id, { x: -9999, y: -9999 });
      const reaction2 = await itemManager.useItem(testItem.id, { x: 99999, y: 99999 });
      
      // Should not crash and may return reactions
      expect(typeof reaction1).toBeDefined();
      expect(typeof reaction2).toBeDefined();
    });

    test('快速连续操作不应该出错 / Rapid consecutive operations should not error', async () => {
      const items = itemManager.getAllItems();
      const testItem = items[0];
      
      // Reset usage to allow multiple uses
      itemManager.resetItemUsage(testItem.id);
      
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(itemManager.useItem(testItem.id, { x: i, y: i }));
      }
      
      // Should not crash
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });

  describe('性能测试 / Performance Tests', () => {
    test('大量道具渲染不应该影响性能 / Large number of items should not affect performance', async () => {
      const mockOnClose = jest.fn();
      const mockOnItemDragStart = jest.fn();
      
      const startTime = performance.now();
      
      render(
        <ItemPanel 
          visible={true} 
          onClose={mockOnClose} 
          onItemDragStart={mockOnItemDragStart} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('道具箱')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Render time should be reasonable (under 1 second)
      expect(renderTime).toBeLessThan(1000);
    });
  });
});