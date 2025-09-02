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

The test suite includes 60+ test cases covering:

### Component Tests (Pet.test.tsx)
- Pet emoji states (idle, loading, active)
- Hover behavior and state changes
- Click vs drag differentiation
- Context menu functionality
- Drag and drop mechanics
- Mouse event handling

### Component Tests (StudyCard.test.tsx)
- Card rendering for different card types
- Translation toggle functionality
- Answer button interactions
- Keyboard shortcuts (Escape key)
- Overlay click handling
- TTS button interactions

### Component Tests (ContextMenu.test.tsx)
- Menu visibility and positioning
- Event listener setup and cleanup
- Click outside handling
- Menu item interactions

### Business Logic Tests (cards.test.ts)
- CardManager initialization and shuffling
- Card retrieval logic
- Review pool management
- SRS algorithm behavior
- Answer submission handling
- Probability-based review scheduling

### API Tests (electronAPI.test.ts)
- Electron IPC communication
- Mock API interactions
- Error handling
- Parameter validation

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

# Expected output: All tests pass with 60+ test cases
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

测试套件包含60+个测试用例，覆盖：

### 组件测试 (Pet.test.tsx)
- 桌宠emoji状态（空闲、加载、活跃）
- 悬停行为和状态变化
- 点击与拖拽区分
- 上下文菜单功能
- 拖拽机制
- 鼠标事件处理

### 组件测试 (StudyCard.test.tsx)
- 不同卡片类型的渲染
- 翻译切换功能
- 答案按钮交互
- 键盘快捷键（Escape键）
- 遮罩点击处理
- TTS按钮交互

### 组件测试 (ContextMenu.test.tsx)
- 菜单可见性和定位
- 事件监听器设置和清理
- 外部点击处理
- 菜单项交互

### 业务逻辑测试 (cards.test.ts)
- CardManager初始化和洗牌
- 卡片检索逻辑
- 复习池管理
- SRS算法行为
- 答案提交处理
- 基于概率的复习调度

### API测试 (electronAPI.test.ts)
- Electron IPC通信
- Mock API交互
- 错误处理
- 参数验证

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

# 预期输出：所有测试通过，60+个测试用例
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