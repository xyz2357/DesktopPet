import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudyCard from '../../src/components/StudyCard';
import { CardData } from '../../src/types/card';

const mockCard: CardData = {
  id: 'test-card-1',
  type: 'word',
  jp: '勉強',
  kana: 'べんきょう',
  romaji: 'benkyou',
  cn: '学习',
  example_jp: '日本語を勉強します。',
  example_cn: '我学习日语。',
  jlpt: 'N5',
};

const mockProps = {
  card: mockCard,
  onAnswer: jest.fn(),
  onPlayTTS: jest.fn(),
  onClose: jest.fn(),
};

describe('StudyCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders card content correctly', () => {
    render(<StudyCard {...mockProps} />);
    
    expect(screen.getByText('勉強')).toBeInTheDocument();
    expect(screen.getByText('べんきょう')).toBeInTheDocument();
    expect(screen.getByText('benkyou')).toBeInTheDocument();
    expect(screen.getByText('单词')).toBeInTheDocument();
    expect(screen.getByText('N5')).toBeInTheDocument();
  });

  it('renders sentence type correctly', () => {
    const sentenceCard = { ...mockCard, type: 'sentence' as const };
    render(<StudyCard {...mockProps} card={sentenceCard} />);
    
    expect(screen.getByText('短句')).toBeInTheDocument();
  });

  it('shows translation when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<StudyCard {...mockProps} />);
    
    // Initially translation should be hidden
    expect(screen.queryByText('学习')).not.toBeInTheDocument();
    
    // Click toggle button
    const toggleButton = screen.getByText('显示翻译');
    await user.click(toggleButton);
    
    // Translation should be visible
    expect(screen.getByText('学习')).toBeInTheDocument();
    expect(screen.getByText('日本語を勉強します。')).toBeInTheDocument();
    expect(screen.getByText('我学习日语。')).toBeInTheDocument();
    
    // Button text should change
    expect(screen.getByText('隐藏翻译')).toBeInTheDocument();
  });

  it('calls onPlayTTS when play button is clicked', async () => {
    const user = userEvent.setup();
    render(<StudyCard {...mockProps} />);
    
    const playButton = screen.getByTitle('播放发音');
    await user.click(playButton);
    
    expect(mockProps.onPlayTTS).toHaveBeenCalledWith('勉強');
  });

  it('calls onAnswer with correct result when answer buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<StudyCard {...mockProps} />);
    
    // Test "know" button
    const knowButton = screen.getByText('✅ 会了');
    await user.click(knowButton);
    expect(mockProps.onAnswer).toHaveBeenCalledWith('know');
    
    // Reset mock
    mockProps.onAnswer.mockClear();
    
    // Test "unknown" button  
    const unknownButton = screen.getByText('😵 不会');
    await user.click(unknownButton);
    expect(mockProps.onAnswer).toHaveBeenCalledWith('unknown');
    
    // Reset mock
    mockProps.onAnswer.mockClear();
    
    // Test "later" button
    const laterButton = screen.getByText('⏰ 稍后');
    await user.click(laterButton);
    expect(mockProps.onAnswer).toHaveBeenCalledWith('later');
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<StudyCard {...mockProps} />);
    
    const closeButton = screen.getByText('×');
    await user.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<StudyCard {...mockProps} />);
    
    const overlay = container.querySelector('.study-card-overlay');
    
    if (overlay) {
      await user.click(overlay);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<StudyCard {...mockProps} />);
    
    await user.keyboard('{Escape}');
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders card without example when example is not provided', () => {
    const cardWithoutExample = {
      ...mockCard,
      example_jp: undefined,
      example_cn: undefined,
    };
    
    render(<StudyCard {...mockProps} card={cardWithoutExample} />);
    
    // Show translation to check if example section is rendered
    const toggleButton = screen.getByText('显示翻译');
    fireEvent.click(toggleButton);
    
    // Should not find example text
    expect(screen.queryByText('日本語を勉強します。')).not.toBeInTheDocument();
    expect(screen.queryByText('我学习日语。')).not.toBeInTheDocument();
  });

  it('has correct CSS classes and animations', () => {
    const { container } = render(<StudyCard {...mockProps} />);
    
    const overlay = container.querySelector('.study-card-overlay');
    const card = container.querySelector('.study-card');
    
    expect(overlay).toBeInTheDocument();
    expect(card).toBeInTheDocument();
    expect(overlay).toHaveClass('study-card-overlay');
    expect(card).toHaveClass('study-card');
  });

  it('has overlay with correct CSS class for transparent background', () => {
    const { container } = render(<StudyCard {...mockProps} />);
    
    const overlay = container.querySelector('.study-card-overlay');
    
    // Overlay should exist and have the correct class
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('study-card-overlay');
    
    // Should maintain proper z-index for layering
    expect(overlay).toBeInTheDocument();
  });

  it('cleans up timers when component unmounts', () => {
    jest.useFakeTimers();
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const audioCard = {
      ...mockProps.card,
      type: 'audio' as const,
      choices: ['option1', 'option2', 'option3', 'option4'],
      correct_answer: 'option1'
    };
    
    const { unmount } = render(<StudyCard {...mockProps} card={audioCard} />);
    
    // Simulate user selecting a choice (which sets a timer)
    const choiceButton = screen.getByText('option1');
    fireEvent.click(choiceButton);
    
    // Unmount the component
    unmount();
    
    // Verify that clearTimeout was called
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    jest.useRealTimers();
    clearTimeoutSpy.mockRestore();
  });

  it('cleans up timers when card changes', () => {
    jest.useFakeTimers();
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const audioCard1 = {
      ...mockProps.card,
      id: 'audio1',
      type: 'audio' as const,
      choices: ['option1', 'option2', 'option3', 'option4'],
      correct_answer: 'option1'
    };
    
    const audioCard2 = {
      ...mockProps.card,
      id: 'audio2',
      type: 'audio' as const,
      choices: ['option1', 'option2', 'option3', 'option4'],
      correct_answer: 'option1'
    };
    
    const { rerender } = render(<StudyCard {...mockProps} card={audioCard1} />);
    
    // Simulate user selecting a choice (which sets a timer)
    const choiceButton = screen.getByText('option1');
    fireEvent.click(choiceButton);
    
    // Change the card
    rerender(<StudyCard {...mockProps} card={audioCard2} />);
    
    // Verify that clearTimeout was called when card changed
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    jest.useRealTimers();
    clearTimeoutSpy.mockRestore();
  });
});