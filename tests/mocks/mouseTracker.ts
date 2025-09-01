/**
 * Mock for MouseTracker
 */

export const mockMouseTracker = {
  startTracking: jest.fn(),
  stopTracking: jest.fn(),
  updatePetData: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  getCurrentMousePosition: jest.fn().mockReturnValue({ x: 0, y: 0 }),
  isMouseInArea: jest.fn().mockReturnValue(false),
  getDistanceToPoint: jest.fn().mockReturnValue(100),
  destroy: jest.fn()
};

export class MockMouseTracker {
  startTracking = jest.fn();
  stopTracking = jest.fn();
  updatePetData = jest.fn();
  addListener = jest.fn();
  removeListener = jest.fn();
  getCurrentMousePosition = jest.fn().mockReturnValue({ x: 0, y: 0 });
  isMouseInArea = jest.fn().mockReturnValue(false);
  getDistanceToPoint = jest.fn().mockReturnValue(100);
  destroy = jest.fn();
}

export const mouseTracker = mockMouseTracker;