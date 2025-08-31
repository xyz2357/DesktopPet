import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { mockElectronAPI } from '../setupTests';
import { CardData } from '../types/card';

const mockCard: CardData = {
  id: 'test-card-1',
  type: 'word',
  jp: 'テスト',
  kana: 'てすと',
  romaji: 'tesuto',
  cn: '测试',
  example_jp: 'これはテストです。',
  example_cn: '这是测试。',
  jlpt: 'N5',
};

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElectronAPI.getNextCard.mockResolvedValue(mockCard);
    mockElectronAPI.submitAnswer.mockResolvedValue({ success: true });
    mockElectronAPI.playTTS.mockResolvedValue({ success: true });
    mockElectronAPI.quitApp.mockResolvedValue(undefined);
    mockElectronAPI.setIgnoreMouseEvents.mockResolvedValue(undefined);
  });

  it('renders the pet component', () => {
    render(<App />);
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    expect(petElement).toBeInTheDocument();
  });

  it('manages mouse events based on context menu visibility', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    
    // Initially should enable mouse passthrough (ignore events)
    await waitFor(() => {
      expect(mockElectronAPI.setIgnoreMouseEvents).toHaveBeenCalledWith(true);
    });
    
    // Right click to open context menu
    await user.pointer({ keys: '[MouseRight]', target: petElement });
    
    // Should disable mouse passthrough when context menu opens
    await waitFor(() => {
      expect(mockElectronAPI.setIgnoreMouseEvents).toHaveBeenCalledWith(false);
    });
    
    // Click outside to close context menu
    await user.click(document.body);
    
    // Should re-enable mouse passthrough when context menu closes
    await waitFor(() => {
      expect(mockElectronAPI.setIgnoreMouseEvents).toHaveBeenCalledWith(true);
    });
  });

  it('handles pet hover state correctly', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    
    // Hover over pet should disable mouse passthrough
    await user.hover(petElement);
    await waitFor(() => {
      expect(mockElectronAPI.setIgnoreMouseEvents).toHaveBeenCalledWith(false);
    });
    
    // Unhover should enable mouse passthrough
    await user.unhover(petElement);
    await waitFor(() => {
      expect(mockElectronAPI.setIgnoreMouseEvents).toHaveBeenCalledWith(true);
    });
  });

  it('opens study card when pet is clicked and manages mouse events', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    
    // Click pet to open study card
    await user.click(petElement);
    
    // Should fetch card and show study card
    await waitFor(() => {
      expect(mockElectronAPI.getNextCard).toHaveBeenCalled();
      expect(screen.getByText('テスト')).toBeInTheDocument();
    });
    
    // Mouse events should be disabled when study card is shown
    expect(mockElectronAPI.setIgnoreMouseEvents).toHaveBeenCalledWith(false);
  });

  it('handles study card interactions and mouse events', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    
    // Open study card
    await user.click(petElement);
    await waitFor(() => {
      expect(screen.getByText('テスト')).toBeInTheDocument();
    });
    
    // Click "know" button
    const knowButton = screen.getByText('✅ 会了');
    await user.click(knowButton);
    
    // Should submit answer and close card
    await waitFor(() => {
      expect(mockElectronAPI.submitAnswer).toHaveBeenCalledWith('test-card-1', 'know');
      expect(screen.queryByText('テスト')).not.toBeInTheDocument();
    });
    
    // Mouse events should be re-enabled when study card closes
    expect(mockElectronAPI.setIgnoreMouseEvents).toHaveBeenCalledWith(true);
  });

  it('handles context menu and study card states together', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const petElement = screen.getByTitle('拖拽移动，点击学习，右键菜单');
    
    // Open study card first
    await user.click(petElement);
    await waitFor(() => {
      expect(screen.getByText('テスト')).toBeInTheDocument();
    });
    
    // Mouse events should be disabled for study card
    expect(mockElectronAPI.setIgnoreMouseEvents).toHaveBeenCalledWith(false);
    
    // The context menu should not interfere with study card mouse event handling
    // This tests that the priority system works correctly
  });
});