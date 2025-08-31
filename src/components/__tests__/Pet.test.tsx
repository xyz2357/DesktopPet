import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pet from '../Pet';

const mockProps = {
  onClick: jest.fn(),
  isActive: false,
  isLoading: false,
  onHoverChange: jest.fn(),
  onContextMenuChange: jest.fn(),
};

describe('Pet Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pet emoji correctly in idle state', () => {
    render(<Pet {...mockProps} />);
    
    const emoji = screen.getByText('😴');
    expect(emoji).toBeInTheDocument();
  });

  it('renders pet emoji correctly in loading state', () => {
    render(<Pet {...mockProps} isLoading={true} />);
    
    const emoji = screen.getByText('🤔');
    expect(emoji).toBeInTheDocument();
  });

  it('renders pet emoji correctly in active state', () => {
    render(<Pet {...mockProps} isActive={true} />);
    
    const emoji = screen.getByText('😊');
    expect(emoji).toBeInTheDocument();
  });

  it('shows hover emoji when mouse enters', async () => {
    const user = userEvent.setup();
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    await user.hover(petElement);
    
    expect(screen.getByText('😸')).toBeInTheDocument();
    expect(mockProps.onHoverChange).toHaveBeenCalledWith(true);
  });

  it('calls onHoverChange when mouse leaves', async () => {
    const user = userEvent.setup();
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    await user.hover(petElement);
    await user.unhover(petElement);
    
    expect(mockProps.onHoverChange).toHaveBeenCalledWith(false);
  });

  it('shows correct bubble text for different states', async () => {
    const user = userEvent.setup();
    
    // Loading state
    const { rerender } = render(<Pet {...mockProps} isLoading={true} />);
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    await user.hover(petElement);
    expect(screen.getByText('思考中...')).toBeInTheDocument();
    
    // Active state
    rerender(<Pet {...mockProps} isActive={true} />);
    await user.hover(petElement);
    expect(screen.getByText('来学习吧！')).toBeInTheDocument();
    
    // Hover state
    rerender(<Pet {...mockProps} />);
    await user.hover(petElement);
    expect(screen.getByText('拖拽/点击/右键')).toBeInTheDocument();
  });

  it('calls onClick when clicked without dragging', async () => {
    const user = userEvent.setup();
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    await user.click(petElement);
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('shows context menu on right click', async () => {
    const user = userEvent.setup();
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    await user.pointer({ keys: '[MouseRight]', target: petElement });
    
    expect(screen.getByText('退出桌宠')).toBeInTheDocument();
  });

  it('calls onContextMenuChange when context menu visibility changes', async () => {
    const user = userEvent.setup();
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    
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
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    
    // Right click to open context menu
    await user.pointer({ keys: '[MouseRight]', target: petElement });
    expect(mockProps.onContextMenuChange).toHaveBeenCalledWith(true);
    
    // Click quit menu item
    const quitItem = screen.getByText('退出桌宠');
    await user.click(quitItem);
    
    // Should call onContextMenuChange(false) when menu closes
    await waitFor(() => {
      expect(mockProps.onContextMenuChange).toHaveBeenCalledWith(false);
    });
  });

  it('closes context menu when clicking outside', async () => {
    const user = userEvent.setup();
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    
    // Open context menu
    await user.pointer({ keys: '[MouseRight]', target: petElement });
    expect(screen.getByText('退出桌宠')).toBeInTheDocument();
    
    // Click outside to close
    await user.click(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('退出桌宠')).not.toBeInTheDocument();
    });
  });

  it('applies dragging class when dragging', async () => {
    render(<Pet {...mockProps} />);
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    
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
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    
    // Start drag and move significantly
    fireEvent.mouseDown(petElement, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 120, clientY: 120 });
    fireEvent.mouseUp(document);
    
    // Should not call onClick after dragging
    expect(mockProps.onClick).not.toHaveBeenCalled();
  });
});