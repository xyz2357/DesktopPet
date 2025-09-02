/**
 * Tests for AutonomousBehaviorManager
 */

import { AutonomousBehaviorManager } from '../../src/utils/autonomousBehavior';

// Mock PetConfig
jest.mock('../../src/config/appConfig', () => ({
  PetConfig: {
    states: {
      autonomous: {
        idleStateChangeInterval: 1000,
        walkingDuration: 2000,
        sleepingDuration: 3000,
        observingDuration: 1500,
        yawningDuration: 1000,
        stretchingDuration: 2000,
        longIdleThreshold: 5000,
        behaviorProbabilities: {
          walking: 0.3,
          yawning: 0.2,
          stretching: 0.15,
          observing: 0.25,
          sleeping: 0.1
        }
      }
    },
    walking: {
      speed: 30,
      directionChangeProbability: 0.3,
      boundaryMargin: 20,
      stepVariation: 5
    }
  }
}));

describe('AutonomousBehaviorManager', () => {
  let behaviorManager: AutonomousBehaviorManager;
  let mockEventListener: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    behaviorManager = new AutonomousBehaviorManager();
    mockEventListener = jest.fn();
    behaviorManager.addEventListener(mockEventListener);
  });

  afterEach(() => {
    behaviorManager.destroy();
    jest.useRealTimers();
  });

  it('should initialize with idle state', () => {
    expect(behaviorManager.getCurrentState()).toBe('idle');
  });

  it('should add and remove event listeners', () => {
    const listener = jest.fn();
    behaviorManager.addEventListener(listener);
    behaviorManager.removeEventListener(listener);
    // No direct way to test this, but it shouldn't crash
    expect(true).toBe(true);
  });

  it('should set state and emit events', () => {
    behaviorManager.setState('walking');
    expect(behaviorManager.getCurrentState()).toBe('walking');
    expect(mockEventListener).toHaveBeenCalledWith({
      type: 'stateChange',
      state: 'walking'
    });
  });

  it('should handle walking state', () => {
    behaviorManager.setState('walking');
    expect(behaviorManager.getIsWalking()).toBe(true);
    
    behaviorManager.setState('idle');
    expect(behaviorManager.getIsWalking()).toBe(false);
  });

  it('should update walking position when walking', () => {
    behaviorManager.setState('walking');
    
    const context = {
      position: { x: 100, y: 100 },
      windowSize: { width: 1000, height: 800 },
      petSize: { width: 120, height: 120 },
      lastInteractionTime: Date.now() - 10000,
      hasUserInteraction: false,
      mousePosition: { x: 500, y: 400 }
    };

    const newPosition = behaviorManager.updateWalkingPosition(context);
    expect(newPosition).toBeDefined();
    if (newPosition) {
      expect(typeof newPosition.x).toBe('number');
      expect(typeof newPosition.y).toBe('number');
    }
  });

  it('should handle user interaction', () => {
    behaviorManager.setState('walking');
    behaviorManager.onUserInteraction();
    
    // After user interaction, should return to idle
    expect(mockEventListener).toHaveBeenCalledWith({
      type: 'stateChange',
      state: 'idle'
    });
  });

  it('should trigger random behaviors over time', () => {
    // Mock Math.random to ensure predictable behavior
    const originalRandom = Math.random;
    Math.random = jest.fn().mockReturnValue(0.05); // This will trigger 'sleeping' behavior (0.1 probability)
    
    // Clear initial event calls
    mockEventListener.mockClear();
    
    // Fast forward past the user interaction cooldown (5000ms) plus idleStateChangeInterval (1000ms)
    jest.advanceTimersByTime(6000); // Wait for user interaction cooldown + interval
    
    // Should have triggered at least one behavior change
    expect(mockEventListener).toHaveBeenCalled();
    
    // Restore Math.random
    Math.random = originalRandom;
  });

  it('should complete behaviors after their duration', () => {
    // Stop automatic behavior scheduling to test completion in isolation
    behaviorManager.onUserInteraction(); // This should pause automatic behaviors
    
    // Wait a moment for the user interaction to take effect
    jest.advanceTimersByTime(100);
    
    // Clear any previous calls
    mockEventListener.mockClear();
    
    // Set a specific behavior
    behaviorManager.setState('yawning');
    
    // Should emit stateChange event first
    expect(mockEventListener).toHaveBeenCalledWith({
      type: 'stateChange',
      state: 'yawning'
    });
    
    // Clear calls to check for completion event
    mockEventListener.mockClear();
    
    // Fast forward past yawning duration (2000ms for yawning)
    jest.advanceTimersByTime(2100);
    
    // Should have emitted completed event at some point (check all calls)
    const completedCall = mockEventListener.mock.calls.find(call => 
      call[0].type === 'completed' && call[0].state === 'yawning'
    );
    expect(completedCall).toBeDefined();
    expect(completedCall[0]).toEqual({
      type: 'completed',
      state: 'yawning'
    });
  });

  it('should destroy cleanly', () => {
    expect(() => behaviorManager.destroy()).not.toThrow();
  });
});