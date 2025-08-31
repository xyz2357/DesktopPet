import { renderHook, act } from '@testing-library/react';
import { useStudyCardState } from '../../src/hooks/useStudyCardState';
import { createMockCard, createArrangeCard, mockTimers } from '../utils/testUtils';

describe('useStudyCardState', () => {
  it('initializes with default state', () => {
    const card = createMockCard();
    const { result } = renderHook(() => useStudyCardState(card));

    expect(result.current.showTranslation).toBe(false);
    expect(result.current.selectedChoice).toBe(null);
    expect(result.current.showResult).toBe(false);
    expect(result.current.tooltip.show).toBe(false);
    expect(result.current.arrangeResult.show).toBe(false);
  });

  it('resets state when card changes', () => {
    const card1 = createMockCard({ id: 'card-1' });
    const card2 = createMockCard({ id: 'card-2' });
    
    const { result, rerender } = renderHook(
      ({ card }) => useStudyCardState(card),
      { initialProps: { card: card1 } }
    );

    // Set some state
    act(() => {
      result.current.setShowTranslation(true);
      result.current.setSelectedChoice('choice1');
    });

    expect(result.current.showTranslation).toBe(true);
    expect(result.current.selectedChoice).toBe('choice1');

    // Change card - should reset state
    rerender({ card: card2 });

    expect(result.current.showTranslation).toBe(false);
    expect(result.current.selectedChoice).toBe(null);
  });

  it('initializes arranged words for arrange cards', () => {
    const arrangeCard = createArrangeCard({
      words_to_arrange: ['私', 'は', '学生', 'です']
    });

    const { result } = renderHook(() => useStudyCardState(arrangeCard));

    expect(result.current.arrangedWords).toHaveLength(4);
    expect(result.current.arrangedWords).toContain('私');
    expect(result.current.arrangedWords).toContain('は');
    expect(result.current.arrangedWords).toContain('学生');
    expect(result.current.arrangedWords).toContain('です');
  });

  it('shuffles words for arrange cards', () => {
    const arrangeCard = createArrangeCard({
      words_to_arrange: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    });

    // Run multiple times to check shuffling
    let isShuffled = false;
    for (let i = 0; i < 10; i++) {
      const { result } = renderHook(() => useStudyCardState(arrangeCard));
      
      // Check if order is different from original
      const original = arrangeCard.words_to_arrange.join(',');
      const shuffled = result.current.arrangedWords.join(',');
      
      if (original !== shuffled) {
        isShuffled = true;
        break;
      }
    }
    
    expect(isShuffled).toBe(true);
  });

  it('clears timers on unmount', () => {
    const card = createMockCard();
    const timerUtils = mockTimers();

    const { result, unmount } = renderHook(() => useStudyCardState(card));

    // Set some timers (simulate setting them)
    act(() => {
      result.current.audioTimerRef.current = setTimeout(() => {}, 1000) as any;
      result.current.arrangeTimerRef.current = setTimeout(() => {}, 2000) as any;
    });

    unmount();

    timerUtils.restore();
  });

  it('clears all timers function works', () => {
    const card = createMockCard();

    const { result } = renderHook(() => useStudyCardState(card));

    // Set timers using real setTimeout
    act(() => {
      const timer1 = setTimeout(() => {}, 1000);
      const timer2 = setTimeout(() => {}, 2000);
      result.current.audioTimerRef.current = timer1 as any;
      result.current.arrangeTimerRef.current = timer2 as any;
    });

    // Clear all timers
    act(() => {
      result.current.clearAllTimers();
    });

    expect(result.current.audioTimerRef.current).toBe(null);
    expect(result.current.arrangeTimerRef.current).toBe(null);
  });

  it('updates tooltip state correctly', () => {
    const card = createMockCard();
    const { result } = renderHook(() => useStudyCardState(card));

    const newTooltip = {
      show: true,
      content: 'Test tooltip',
      x: 100,
      y: 200
    };

    act(() => {
      result.current.setTooltip(newTooltip);
    });

    expect(result.current.tooltip).toEqual(newTooltip);
  });

  it('updates arrange result state correctly', () => {
    const card = createMockCard();
    const { result } = renderHook(() => useStudyCardState(card));

    const newResult = {
      show: true,
      isCorrect: true
    };

    act(() => {
      result.current.setArrangeResult(newResult);
    });

    expect(result.current.arrangeResult).toEqual(newResult);
  });
});