/**
 * 集成测试设置文件
 * 为集成测试提供优化的环境配置
 */

import { cleanup } from '@testing-library/react';

// 每次测试后清理
afterEach(() => {
  cleanup();
  
  // 清理定时器
  jest.clearAllTimers();
  
  // 恢复所有mock
  jest.restoreAllMocks();
  
  // 清理DOM
  document.body.innerHTML = '';
});

// 全局测试超时设置
jest.setTimeout(10000);

// Mock performance API for older environments
if (!global.performance) {
  global.performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn()
  } as any;
}

// 优化测试渲染性能
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // 在测试中静默某些无关的警告
  console.error = (message: any, ...args: any[]) => {
    if (
      typeof message === 'string' &&
      (message.includes('Warning: ReactDOM.render is no longer supported') ||
       message.includes('Warning: componentWillMount has been renamed'))
    ) {
      return;
    }
    originalConsoleError(message, ...args);
  };
  
  console.warn = (message: any, ...args: any[]) => {
    if (
      typeof message === 'string' &&
      message.includes('deprecated')
    ) {
      return;
    }
    originalConsoleWarn(message, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});