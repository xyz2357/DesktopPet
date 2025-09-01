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

// Mock require.context for webpack dynamic imports
(global as any).require = {
  context: jest.fn(() => ({
    keys: () => [],
    resolve: jest.fn()
  }))
};

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 0);
  return 1;
});
global.cancelAnimationFrame = jest.fn();

// Use real timers for now to avoid timeout issues
// jest.useFakeTimers();

// Suppress console.log/warn/error messages during tests unless needed
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
  console.error = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('Warning: componentWillMount has been renamed') ||
       message.includes('Warning: ReactDOM.render is no longer supported') ||
       message.includes('An update to Pet inside a test was not wrapped in act') ||
       message.includes('An update to App inside a test was not wrapped in act') ||
       message.includes('无法创建') ||
       message.includes('媒体文件加载失败'))
    ) {
      return;
    }
    originalConsoleError(...args);
  };
  
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('无法创建') ||
       message.includes('媒体文件加载失败') ||
       message.includes('状态的媒体文件夹不存在') ||
       message.includes('⚠️') ||
       message.includes('状态没有可用的媒体文件'))
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };
  
  console.log = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('🎬') ||
       message.includes('📁') ||
       message.includes('🔄') ||
       message.includes('✅') ||
       message.includes('👀') ||
       message.includes('⏰') ||
       message.includes('🎭') ||
       message.includes('🎯') ||
       message.includes('🎲') ||
       message.includes('⏳') ||
       message.includes('👆') ||
       message.includes('🥚') ||
       message.includes('🚶') ||
       message.includes('😊') ||
       message.includes('🔥') ||
       message.includes('🥚') ||
       message.includes('收到') ||
       message.includes('桌宠状态变更') ||
       message.includes('触发彩蛋') ||
       message.includes('检测到长按') ||
       message.includes('Enabling mouse events') ||
       message.includes('Disabling mouse events'))
    ) {
      return;
    }
    originalConsoleLog(...args);
  };
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Export for use in tests
export { mockElectronAPI };