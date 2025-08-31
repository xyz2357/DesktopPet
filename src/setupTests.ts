import '@testing-library/jest-dom';

// Mock electron APIs
const mockElectronAPI = {
  getNextCard: jest.fn(),
  submitAnswer: jest.fn(),
  playTTS: jest.fn(),
  quitApp: jest.fn(),
  setIgnoreMouseEvents: jest.fn(),
};

// Mock window.electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

// Export for use in tests
export { mockElectronAPI };