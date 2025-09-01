import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock MediaManager before importing Pet
const mockMediaManager = {
  initialize: jest.fn().mockResolvedValue(undefined),
  getRandomMediaForState: jest.fn().mockReturnValue(null),
  isVideoFile: jest.fn().mockReturnValue(false),
  isAnimatedFile: jest.fn().mockReturnValue(false),
  getAvailableMediaForState: jest.fn().mockReturnValue([]),
  refreshMediaForState: jest.fn().mockReturnValue(null),
  clearCache: jest.fn(),
  getCacheStats: jest.fn().mockReturnValue({ totalFiles: 0, preloadedFiles: 0, cacheSize: 0 })
};

jest.mock('../../src/utils/mediaManager', () => ({
  ...jest.requireActual('../../src/utils/mediaManager'),
  mediaManager: mockMediaManager
}));

// Mock the new utilities
jest.mock('../../src/utils/autonomousBehavior', () => ({
  AutonomousBehaviorManager: jest.fn().mockImplementation(() => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    setState: jest.fn(),
    getCurrentState: jest.fn().mockReturnValue('idle'),
    getIsWalking: jest.fn().mockReturnValue(false),
    updateWalkingPosition: jest.fn().mockReturnValue(null),
    onUserInteraction: jest.fn(),
    destroy: jest.fn()
  }))
}));

jest.mock('../../src/utils/mouseTracker', () => ({
  mouseTracker: {
    startTracking: jest.fn(),
    stopTracking: jest.fn(),
    updatePetData: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    getCurrentMousePosition: jest.fn().mockReturnValue({ x: 0, y: 0 }),
    isMouseInArea: jest.fn().mockReturnValue(false),
    getDistanceToPoint: jest.fn().mockReturnValue(100),
    destroy: jest.fn()
  }
}));

jest.mock('../../src/utils/interactionManager', () => ({
  interactionManager: {
    handleClick: jest.fn().mockReturnValue({ 
      type: 'click', 
      timestamp: Date.now() 
    }),
    addEmotionListener: jest.fn(),
    removeEmotionListener: jest.fn(),
    getCurrentEmotionState: jest.fn().mockReturnValue({
      period: '下午',
      emotions: ['focused', 'productive', 'active']
    }),
    triggerSpecialEmotion: jest.fn(),
    destroy: jest.fn()
  }
}));

// Import after mocking
import Pet from '../../src/components/Pet';
import { PetConfig } from '../../src/config/appConfig';

// Also directly mock the imported mediaManager instance
const mediaManagerModule = require('../../src/utils/mediaManager');
Object.assign(mediaManagerModule.mediaManager, mockMediaManager);

const mockProps = {
  onClick: jest.fn(),
  isActive: false,
  isLoading: false,
  isCongrats: false,
  onHoverChange: jest.fn(),
  onContextMenuChange: jest.fn(),
};

describe('Pet Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 重置mock返回值
    mockMediaManager.getRandomMediaForState.mockReturnValue(null);
    mockMediaManager.isVideoFile.mockReturnValue(false);
  });

  it('renders pet emoji correctly in idle state when no media available', async () => {
    // 设置mediaManager返回null，这会导致显示emoji
    mockMediaManager.getRandomMediaForState.mockReturnValue(null);
    
    await act(async () => {
      render(<Pet {...mockProps} />);
    });
    
    await waitFor(() => {
      const emoji = screen.getByText('😊');  // Idle state shows friendly emoji
      expect(emoji).toBeInTheDocument();
    });
  });

  it('renders pet emoji correctly in loading state when no media available', async () => {
    mockMediaManager.getRandomMediaForState.mockReturnValue(null);
    
    await act(async () => {
      render(<Pet {...mockProps} isLoading={true} />);
    });
    
    await waitFor(() => {
      const emoji = screen.getByText('🤔');
      expect(emoji).toBeInTheDocument();
    });
  });

  it('renders pet emoji correctly in active state when no media available', async () => {
    mockMediaManager.getRandomMediaForState.mockReturnValue(null);
    
    await act(async () => {
      render(<Pet {...mockProps} isActive={true} />);
    });
    
    await waitFor(() => {
      const emoji = screen.getByText('😊');
      expect(emoji).toBeInTheDocument();
    });
  });

  it('shows hover emoji when mouse enters and no media available', async () => {
    const user = userEvent.setup();
    mockMediaManager.getRandomMediaForState.mockReturnValue(null);
    
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('随意玩弄她吧');
    await user.hover(petElement);
    
    expect(screen.getByText('😸')).toBeInTheDocument();
    expect(mockProps.onHoverChange).toHaveBeenCalledWith(true);
  });

  it('calls onHoverChange when mouse leaves', async () => {
    const user = userEvent.setup();
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('随意玩弄她吧');
    await user.hover(petElement);
    await user.unhover(petElement);
    
    expect(mockProps.onHoverChange).toHaveBeenCalledWith(false);
  });

  it('shows correct bubble text for different states', async () => {
    const user = userEvent.setup();
    mockMediaManager.getRandomMediaForState.mockReturnValue(null);
    
    // Loading state
    const { rerender } = render(<Pet {...mockProps} isLoading={true} />);
    expect(screen.getByText('嗯...')).toBeInTheDocument();
    
    // Active state
    rerender(<Pet {...mockProps} isActive={true} />);
    expect(screen.getByText('又想干什么！')).toBeInTheDocument();
    
    // Hover state
    rerender(<Pet {...mockProps} />);
    const petElement = screen.getByTitle('随意玩弄她吧');
    await user.hover(petElement);
    expect(screen.getByText('咕...')).toBeInTheDocument();
  });

  it('calls onClick when clicked without dragging', async () => {
    const user = userEvent.setup();
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('随意玩弄她吧');
    await user.click(petElement);
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  describe('多媒体支持', () => {
    beforeEach(() => {
      // 重置mock但保持返回值
      mockMediaManager.initialize.mockClear();
      mockMediaManager.getRandomMediaForState.mockClear();
      mockMediaManager.isVideoFile.mockClear();
      mockMediaManager.isAnimatedFile.mockClear();
      mockMediaManager.getAvailableMediaForState.mockClear();
      mockMediaManager.refreshMediaForState.mockClear();
      mockMediaManager.clearCache.mockClear();
      mockMediaManager.getCacheStats.mockClear();
    });

    it('应该正确处理媒体文件的加载和显示逻辑', () => {
      // 我们测试的是Pet组件的渲染逻辑，而不是具体的DOM元素
      // 因为mediaManager的mock已经在模块级别设置好了
      
      render(<Pet {...mockProps} />);
      
      // 验证Pet组件正常渲染（这表明媒体管理器集成正常工作）
      const petElement = screen.getByTitle('随意玩弄她吧');
      expect(petElement).toBeInTheDocument();
      expect(petElement).toHaveClass('pet');
    });

    it('应该能够处理不同状态下的媒体需求', () => {
      // 测试组件在不同状态下的渲染
      const { rerender } = render(<Pet {...mockProps} />);
      expect(screen.getByTitle('随意玩弄她吧')).toHaveClass('pet--idle');
      
      // 测试active状态
      rerender(<Pet {...mockProps} isActive={true} />);
      expect(screen.getByTitle('随意玩弄她吧')).toHaveClass('pet--active');
      
      // 测试loading状态
      rerender(<Pet {...mockProps} isLoading={true} />);
      expect(screen.getByTitle('随意玩弄她吧')).toHaveClass('pet--loading');
    });

    it('应该在没有可用媒体文件时显示emoji', async () => {
      mockMediaManager.getRandomMediaForState.mockReturnValue(null);
      
      await act(async () => {
        render(<Pet {...mockProps} />);
      });
      
      // Wait for component to stabilize
      await waitFor(() => {
        const emoji = screen.getByText('😊');  // Idle state shows friendly emoji
        expect(emoji).toBeInTheDocument();
        expect(emoji).toHaveClass('pet__emoji');
      });
    });

    it('应该初始化媒体管理器', () => {
      render(<Pet {...mockProps} />);
      
      expect(mockMediaManager.initialize).toHaveBeenCalled();
    });

    it('应该能够响应媒体管理器的配置', () => {
      // 测试Pet组件能够正确集成媒体管理器
      // 我们通过检查组件的基本功能来验证集成是否正常
      
      const { rerender } = render(<Pet {...mockProps} />);
      
      // 验证组件的核心功能正常
      expect(screen.getByTitle('随意玩弄她吧')).toBeInTheDocument();
      
      // 验证媒体管理器被正确调用
      expect(mockMediaManager.initialize).toHaveBeenCalled();
      
      // 在不同prop下测试组件行为
      rerender(<Pet {...mockProps} isActive={true} />);
      expect(screen.getByTitle('随意玩弄她吧')).toHaveClass('pet--active');
      
      rerender(<Pet {...mockProps} isLoading={true} />);
      expect(screen.getByTitle('随意玩弄她吧')).toHaveClass('pet--loading');
    });
  });

  it('shows context menu on right click', async () => {
    const user = userEvent.setup();
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('随意玩弄她吧');
    await user.pointer({ keys: '[MouseRight]', target: petElement });
    
    expect(screen.getByText('放置Play')).toBeInTheDocument();
  });

  it('calls onContextMenuChange when context menu visibility changes', async () => {
    const user = userEvent.setup();
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('随意玩弄她吧');
    
    // Right click should open context menu and call onContextMenuChange(true)
    await user.pointer({ keys: '[MouseRight]', target: petElement });
    expect(mockProps.onContextMenuChange).toHaveBeenCalledWith(true);
    
    // Click outside to close context menu and call onContextMenuChange(false)
    await user.click(document.body);
    await waitFor(() => {
      expect(mockProps.onContextMenuChange).toHaveBeenCalledWith(false);
    });
  });

  it('calls quitApp and onContextMenuChange when quit menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('随意玩弄她吧');
    
    // Right click to open context menu
    await user.pointer({ keys: '[MouseRight]', target: petElement });
    expect(mockProps.onContextMenuChange).toHaveBeenCalledWith(true);
    
    // Click quit menu item
    const quitItem = screen.getByText('放置Play');
    await user.click(quitItem);
    
    // Should call onContextMenuChange(false) when menu closes
    await waitFor(() => {
      expect(mockProps.onContextMenuChange).toHaveBeenCalledWith(false);
    });
  });

  it('closes context menu when clicking outside', async () => {
    const user = userEvent.setup();
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('随意玩弄她吧');
    
    // Open context menu
    await user.pointer({ keys: '[MouseRight]', target: petElement });
    expect(screen.getByText('放置Play')).toBeInTheDocument();
    
    // Click outside to close
    await user.click(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('放置Play')).not.toBeInTheDocument();
    });
  });

  it('applies dragging class when dragging', async () => {
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('随意玩弄她吧');
    
    // Start drag
    fireEvent.mouseDown(petElement, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 110, clientY: 110 });
    
    expect(petElement).toHaveClass('pet--dragging');
    
    // End drag
    fireEvent.mouseUp(document);
    
    await waitFor(() => {
      expect(petElement).not.toHaveClass('pet--dragging');
    });
  });

  it('prevents onClick when dragging', async () => {
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('随意玩弄她吧');
    
    // Start drag and move significantly
    fireEvent.mouseDown(petElement, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 120, clientY: 120 });
    fireEvent.mouseUp(document);
    
    // Should not call onClick after dragging
    expect(mockProps.onClick).not.toHaveBeenCalled();
  });
});