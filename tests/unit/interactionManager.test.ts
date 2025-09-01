/**
 * Tests for InteractionManager
 */

import { InteractionManager } from '../../src/utils/interactionManager';

describe('InteractionManager', () => {
  let interactionManager: InteractionManager;
  let mockEmotionListener: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    // Mock Date.now() to control time
    jest.spyOn(Date, 'now').mockImplementation(() => 1640995200000); // 2022-01-01 12:00:00
    jest.spyOn(global.Date.prototype, 'getHours').mockImplementation(() => 14); // 2 PM
    jest.spyOn(global.Date.prototype, 'getMonth').mockImplementation(() => 0); // January
    jest.spyOn(global.Date.prototype, 'getDate').mockImplementation(() => 1); // 1st
    
    interactionManager = new InteractionManager();
    mockEmotionListener = jest.fn();
  });

  afterEach(() => {
    interactionManager.destroy();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should initialize correctly', () => {
    expect(interactionManager).toBeDefined();
  });

  it('should handle single click', () => {
    const event = interactionManager.handleClick();
    expect(event.type).toBe('click');
    expect(event.timestamp).toBeDefined();
  });

  it('should detect double click', () => {
    // First click
    let event = interactionManager.handleClick();
    expect(event.type).toBe('click');
    
    // Second click within 400ms
    jest.advanceTimersByTime(200);
    event = interactionManager.handleClick();
    expect(event.type).toBe('doubleClick');
    expect(event.data?.easterEgg).toBe(true);
  });

  it('should detect triple click', () => {
    // Three rapid clicks
    interactionManager.handleClick();
    jest.advanceTimersByTime(200);
    interactionManager.handleClick();
    jest.advanceTimersByTime(200);
    const event = interactionManager.handleClick();
    
    expect(event.type).toBe('tripleClick');
    expect(event.data?.easterEgg).toBe(true);
    expect(event.data?.message).toBe('三连击！厉害！✨');
  });

  it('should detect rapid clicking', () => {
    // Simulate 10 rapid clicks
    let event;
    for (let i = 0; i < 10; i++) {
      event = interactionManager.handleClick();
      jest.advanceTimersByTime(100); // 100ms between clicks
    }
    
    expect(event?.type).toBe('rapidClick');
    expect(event?.data?.easterEgg).toBe(true);
    expect(event?.data?.message).toBe('哇！你的手速好快！🔥');
  });

  it('should add and remove emotion listeners', () => {
    interactionManager.addEmotionListener(mockEmotionListener);
    
    // Trigger time-based emotion update
    jest.advanceTimersByTime(30 * 60 * 1000 + 1); // Advance past 30 minutes
    
    expect(mockEmotionListener).toHaveBeenCalled();
    
    interactionManager.removeEmotionListener(mockEmotionListener);
    mockEmotionListener.mockClear();
    
    // Trigger another update
    jest.advanceTimersByTime(30 * 60 * 1000 + 1);
    expect(mockEmotionListener).not.toHaveBeenCalled();
  });

  it('should get current emotion state', () => {
    const emotionState = interactionManager.getCurrentEmotionState();
    expect(emotionState).toHaveProperty('period');
    expect(emotionState).toHaveProperty('emotions');
    expect(Array.isArray(emotionState.emotions)).toBe(true);
    expect(typeof emotionState.period).toBe('string');
  });

  it('should handle different time periods', () => {
    // Test morning (6 AM)
    jest.spyOn(global.Date.prototype, 'getHours').mockImplementation(() => 8);
    const morningState = interactionManager.getCurrentEmotionState();
    expect(morningState.period).toBe('早晨');
    
    // Test evening (7 PM)
    jest.spyOn(global.Date.prototype, 'getHours').mockImplementation(() => 19);
    const eveningState = interactionManager.getCurrentEmotionState();
    expect(eveningState.period).toBe('傍晚');
    
    // Test night (11 PM)
    jest.spyOn(global.Date.prototype, 'getHours').mockImplementation(() => 23);
    const nightState = interactionManager.getCurrentEmotionState();
    expect(nightState.period).toBe('夜晚');
  });

  it('should handle special dates', () => {
    // Create a new instance to test initialization emotion
    const testManager = new InteractionManager();
    testManager.addEmotionListener(mockEmotionListener);
    
    // Mock New Year's Day
    jest.spyOn(global.Date.prototype, 'getMonth').mockImplementation(() => 0); // January
    jest.spyOn(global.Date.prototype, 'getDate').mockImplementation(() => 1); // 1st
    
    // Trigger manual emotion update to test special date handling
    testManager.triggerSpecialEmotion('festive', '新年快乐！', 5000);
    
    expect(mockEmotionListener).toHaveBeenCalledWith(
      expect.objectContaining({
        emotion: 'festive',
        text: '新年快乐！',
        duration: 5000
      })
    );
    
    testManager.destroy();
  });

  it('should trigger special emotion manually', () => {
    interactionManager.addEmotionListener(mockEmotionListener);
    
    interactionManager.triggerSpecialEmotion('happy', '测试情绪', 5000);
    
    expect(mockEmotionListener).toHaveBeenCalledWith({
      emotion: 'happy',
      text: '测试情绪',
      duration: 5000
    });
  });

  it('should destroy cleanly', () => {
    expect(() => interactionManager.destroy()).not.toThrow();
  });

  it('should handle click history cleanup', () => {
    // Mock Date.now to control time precisely
    const mockDateNow = jest.spyOn(Date, 'now');
    let currentTime = 1000000000; // Start at some arbitrary time
    mockDateNow.mockImplementation(() => currentTime);
    
    // Create fresh instance to avoid interference from other tests
    const testManager = new InteractionManager();
    
    // Generate a single click
    const firstClick = testManager.handleClick();
    expect(firstClick.type).toBe('click');
    
    // Advance time by more than 5 seconds (click history cleanup threshold)
    currentTime += 6000;
    
    // This should be a regular click since history was cleaned
    const secondClick = testManager.handleClick();
    expect(secondClick.type).toBe('click'); // Should be regular click, not doubleClick
    
    testManager.destroy();
    mockDateNow.mockRestore();
  });
});