import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContextMenu from '../../src/components/ContextMenu';

const mockProps = {
  visible: true,
  x: 100,
  y: 200,
  onClose: jest.fn(),
  onQuit: jest.fn(),
};

describe('ContextMenu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders menu when visible', () => {
    render(<ContextMenu {...mockProps} />);
    
    expect(screen.getByText('放置Play')).toBeInTheDocument();
    expect(screen.getByText('🚪')).toBeInTheDocument();
  });

  it('does not render menu when not visible', () => {
    render(<ContextMenu {...mockProps} visible={false} />);
    
    expect(screen.queryByText('放置Play')).not.toBeInTheDocument();
  });

  it('positions menu correctly', () => {
    const { container } = render(<ContextMenu {...mockProps} />);
    
    const menu = container.querySelector('.context-menu');
    expect(menu).toHaveStyle({
      left: '100px',
      top: '200px',
    });
  });

  it('calls onQuit when quit menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<ContextMenu {...mockProps} />);
    
    const quitItem = screen.getByText('放置Play');
    await user.click(quitItem);
    
    expect(mockProps.onQuit).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside menu', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <ContextMenu {...mockProps} />
        <div data-testid="outside">Outside element</div>
      </div>
    );
    
    const outsideElement = screen.getByTestId('outside');
    await user.click(outsideElement);
    
    await waitFor(() => {
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<ContextMenu {...mockProps} />);
    
    await user.keyboard('{Escape}');
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking on menu itself', async () => {
    const user = userEvent.setup();
    render(<ContextMenu {...mockProps} />);
    
    const menuItem = screen.getByText('放置Play');
    const menuContainer = menuItem.closest('.context-menu');
    
    if (menuContainer) {
      await user.click(menuContainer);
      expect(mockProps.onClose).not.toHaveBeenCalled();
    }
  });

  it('has correct CSS classes and styling', () => {
    const { container } = render(<ContextMenu {...mockProps} />);
    
    const menu = container.querySelector('.context-menu');
    const menuItem = container.querySelector('.context-menu__item');
    
    expect(menu).toHaveClass('context-menu');
    expect(menuItem).toHaveClass('context-menu__item');
  });

  it('cleans up event listeners when unmounted', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = render(<ContextMenu {...mockProps} />);
    
    // Verify event listeners were added
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    // Unmount component
    unmount();
    
    // Verify event listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});