/**
 * Mock for InteractionManager
 */

export const mockInteractionManager = {
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
};

export class MockInteractionManager {
  handleClick = jest.fn().mockReturnValue({ 
    type: 'click', 
    timestamp: Date.now() 
  });
  addEmotionListener = jest.fn();
  removeEmotionListener = jest.fn();
  getCurrentEmotionState = jest.fn().mockReturnValue({
    period: '下午',
    emotions: ['focused', 'productive', 'active']
  });
  triggerSpecialEmotion = jest.fn();
  destroy = jest.fn();
}

export const interactionManager = mockInteractionManager;