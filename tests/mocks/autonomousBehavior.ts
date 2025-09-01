/**
 * Mock for AutonomousBehaviorManager
 */

export const mockAutonomousBehaviorManager = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  setState: jest.fn(),
  getCurrentState: jest.fn().mockReturnValue('idle'),
  getIsWalking: jest.fn().mockReturnValue(false),
  updateWalkingPosition: jest.fn().mockReturnValue(null),
  onUserInteraction: jest.fn(),
  destroy: jest.fn()
};

export class MockAutonomousBehaviorManager {
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  setState = jest.fn();
  getCurrentState = jest.fn().mockReturnValue('idle');
  getIsWalking = jest.fn().mockReturnValue(false);
  updateWalkingPosition = jest.fn().mockReturnValue(null);
  onUserInteraction = jest.fn();
  destroy = jest.fn();
}

// Mock the entire module
export const AutonomousBehaviorManager = MockAutonomousBehaviorManager;