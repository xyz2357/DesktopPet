# Testing Guide / 测试指南

[English](#english) | [中文](#中文)

---

## English

This document describes the testing setup and available test commands for the Japanese Pet desktop application.

---

## 中文

本文档描述日本宠物桌面应用程序的测试设置和可用的测试命令。

## Test Architecture

The project includes comprehensive testing coverage with:

- **Unit Tests**: Testing individual components and business logic
- **Integration Tests**: Testing component interactions
- **API Tests**: Testing Electron IPC communication
- **E2E Tests**: End-to-end testing setup (Playwright-based)

## Available Test Commands

```bash
# Run all unit tests
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run all tests (unit + coverage)
npm run test:all

# Run e2e tests (requires built application)
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui
```

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   └── app.spec.ts
├── unit/                   # Standalone unit tests (if needed)
└── README.md              # Testing documentation

src/
├── __tests__/             # App component tests
│   └── App.test.tsx
├── components/__tests__/   # Component unit tests
│   ├── Pet.test.tsx
│   ├── StudyCard.test.tsx
│   └── ContextMenu.test.tsx
├── data/__tests__/        # Business logic tests
│   └── cards.test.ts
├── api/__tests__/         # API tests
│   └── electronAPI.test.ts
└── setupTests.ts          # Test environment setup
```

## Current Test Coverage

The test suite includes 316 test cases across 23 test suites covering:

### Unit Tests (23 test suites)
- **Pet.test.tsx** - Pet emoji states, hover behavior, drag mechanics, mouse events
- **StudyCard.test.tsx** - Card rendering, translation toggle, answer buttons, keyboard shortcuts
- **ContextMenu.test.tsx** - Menu visibility, event listeners, click handling
- **App.test.tsx** - Main application component integration
- **cards.test.ts** - CardManager, SRS algorithm, review pool management
- **electronAPI.test.ts** - Electron IPC communication, error handling
- **items.test.ts** - Item data validation, types, effects, localization
- **itemManager.test.ts** - Item usage, cooldowns, statistics, event listeners
- **dragDropManager.test.ts** - Drag & drop functionality, drop zones, state management
- **itemImageManager.test.ts** - Image loading, caching, error handling
- **autonomousBehavior.test.ts** - AI behavior patterns, state transitions
- **mouseTracker.test.ts** - Mouse tracking, position updates
- **interactionManager.test.ts** - User interactions, time-based emotions
- **mediaManager.test.ts** - Pet media loading and management
- **appConfig.test.ts** - Application configuration validation
- **cardUtils.test.ts** - Card utility functions
- **useStudyCardState.test.ts** - React hooks for study cards
- **StudyCard.a11y.test.ts** - Accessibility testing

### Integration Tests (5 test suites)
- **item-system-integration.test.tsx** - Item panel & pet interaction
- **pet-autonomous-behavior.test.tsx** - Autonomous behavior integration
- **mouse-tracking-integration.test.tsx** - Mouse tracking with pet responses
- **easter-eggs-integration.test.tsx** - Hidden interaction features
- **time-emotion-integration.test.tsx** - Time-based emotional states

## Test Configuration

### Jest Configuration (jest.config.js)
- TypeScript support with ts-jest
- JSDOM environment for React testing
- CSS module mocking with identity-obj-proxy
- Test file patterns and exclusions
- Coverage collection settings

### Testing Libraries Used
- **Jest**: Test runner and assertion library
- **React Testing Library**: React component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers
- **Playwright**: E2E testing framework

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install
```

### Basic Testing
```bash
# Run all unit tests
npm test

# Expected output: All tests pass with 316 test cases across 23 suites
```

### Coverage Analysis
```bash
# Generate coverage report
npm run test:coverage

# Coverage includes:
# - Components: ~85% coverage
# - Business logic: ~94% coverage
# - Overall: ~62% (excluding main/renderer entry points)
```

### Watch Mode Development
```bash
# Start watch mode for test-driven development
npm run test:watch
```

## Test Best Practices

1. **Component Testing**: Tests focus on user interactions and component behavior
2. **Business Logic**: Comprehensive testing of the SRS learning algorithm
3. **Mock Management**: Clean mock setup and teardown in each test
4. **Event Testing**: Proper testing of keyboard and mouse events
5. **State Management**: Testing of component state changes and side effects

## Debugging Tests

### Common Issues
- **CSS Import Errors**: Resolved with identity-obj-proxy in Jest config
- **Electron API Mocking**: Handled in setupTests.ts
- **Async Operations**: Proper use of waitFor and async/await patterns

### Test Debugging
- Use `screen.debug()` to inspect rendered components
- Add console.log statements in test code for debugging
- Use `test.only()` to run specific tests in isolation

## Future Testing Enhancements

1. **E2E Testing**: Complete Electron-specific e2e test setup
2. **Visual Regression**: Screenshot-based testing for UI consistency
3. **Performance Testing**: Memory leak and performance benchmarks
4. **Integration**: CI/CD pipeline integration for automated testing

---

## 中文

本文档描述日本宠物桌面应用程序的测试设置和可用的测试命令。

## 测试架构

项目包含全面的测试覆盖：

- **单元测试**: 测试单个组件和业务逻辑
- **集成测试**: 测试组件交互
- **API测试**: 测试Electron IPC通信
- **E2E测试**: 端到端测试设置（基于Playwright）

## 可用测试命令

```bash
# 运行所有单元测试
npm test

# 监听模式运行测试（文件变化时重新运行）
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行所有测试（单元测试 + 覆盖率）
npm run test:all

# 运行e2e测试（需要构建的应用程序）
npm run test:e2e

# 运行带UI的e2e测试
npm run test:e2e:ui
```

## 测试结构

```
tests/
├── e2e/                    # 端到端测试
│   └── app.spec.ts
├── unit/                   # 独立单元测试（如需要）
└── README.md              # 测试文档

src/
├── __tests__/             # App组件测试
│   └── App.test.tsx
├── components/__tests__/   # 组件单元测试
│   ├── Pet.test.tsx
│   ├── StudyCard.test.tsx
│   └── ContextMenu.test.tsx
├── data/__tests__/        # 业务逻辑测试
│   └── cards.test.ts
├── api/__tests__/         # API测试
│   └── electronAPI.test.ts
└── setupTests.ts          # 测试环境设置
```

## 当前测试覆盖率

测试套件包含316个测试用例，分布在23个测试套件中，覆盖：

### 单元测试 (18个测试套件)
- **Pet.test.tsx** - 桌宠emoji状态、悬停行为、拖拽机制、鼠标事件
- **StudyCard.test.tsx** - 卡片渲染、翻译切换、答案按钮、键盘快捷键
- **ContextMenu.test.tsx** - 菜单可见性、事件监听器、点击处理
- **App.test.tsx** - 主应用组件集成
- **cards.test.ts** - 卡片管理器、SRS算法、复习池管理
- **electronAPI.test.ts** - Electron IPC通信、错误处理
- **items.test.ts** - 道具数据验证、类型、效果、本地化
- **itemManager.test.ts** - 道具使用、冷却时间、统计、事件监听器
- **dragDropManager.test.ts** - 拖拽功能、放置区域、状态管理
- **itemImageManager.test.ts** - 图像加载、缓存、错误处理
- **autonomousBehavior.test.ts** - AI行为模式、状态转换
- **mouseTracker.test.ts** - 鼠标跟踪、位置更新
- **interactionManager.test.ts** - 用户交互、基于时间的情绪
- **mediaManager.test.ts** - 桌宠媒体加载和管理
- **appConfig.test.ts** - 应用配置验证
- **cardUtils.test.ts** - 卡片工具函数
- **useStudyCardState.test.ts** - 学习卡片的React hooks
- **StudyCard.a11y.test.ts** - 无障碍功能测试

### 集成测试 (5个测试套件)
- **item-system-integration.test.tsx** - 道具面板与桌宠交互
- **pet-autonomous-behavior.test.tsx** - 自主行为集成
- **mouse-tracking-integration.test.tsx** - 鼠标跟踪与桌宠响应
- **easter-eggs-integration.test.tsx** - 隐藏互动功能
- **time-emotion-integration.test.tsx** - 基于时间的情绪状态

## 测试配置

### Jest配置 (jest.config.js)
- 使用ts-jest的TypeScript支持
- React测试的JSDOM环境
- 使用identity-obj-proxy的CSS模块模拟
- 测试文件模式和排除
- 覆盖率收集设置

### 使用的测试库
- **Jest**: 测试运行器和断言库
- **React Testing Library**: React组件测试工具
- **@testing-library/user-event**: 用户交互模拟
- **@testing-library/jest-dom**: 自定义Jest匹配器
- **Playwright**: E2E测试框架

## 运行测试

### 前提条件
```bash
# 安装依赖
npm install
```

### 基础测试
```bash
# 运行所有单元测试
npm test

# 预期输出：所有测试通过，23个套件中的316个测试用例
```

### 覆盖率分析
```bash
# 生成覆盖率报告
npm run test:coverage

# 覆盖率包括：
# - 组件：~85%覆盖率
# - 业务逻辑：~94%覆盖率
# - 总体：~62%（排除main/renderer入口点）
```

### 监听模式开发
```bash
# 启动监听模式进行测试驱动开发
npm run test:watch
```

## 测试最佳实践

1. **组件测试**: 测试专注于用户交互和组件行为
2. **业务逻辑**: SRS学习算法的全面测试
3. **Mock管理**: 每个测试中清洁的mock设置和清理
4. **事件测试**: 键盘和鼠标事件的适当测试
5. **状态管理**: 组件状态变化和副作用的测试

## 测试调试

### 常见问题
- **CSS导入错误**: 通过Jest配置中的identity-obj-proxy解决
- **Electron API模拟**: 在setupTests.ts中处理
- **异步操作**: 正确使用waitFor和async/await模式

### 测试调试
- 使用`screen.debug()`检查渲染的组件
- 在测试代码中添加console.log语句进行调试
- 使用`test.only()`单独运行特定测试

## 未来测试增强

1. **E2E测试**: 完整的Electron特定e2e测试设置
2. **视觉回归**: 基于截图的UI一致性测试
3. **性能测试**: 内存泄漏和性能基准测试
4. **集成**: 自动化测试的CI/CD管道集成