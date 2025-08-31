# 测试目录结构

这个目录包含了Japanese Pet应用的各类测试文件，组织结构如下：

## 📁 目录结构

```
tests/
├── e2e/                    # 端到端测试
│   └── app.spec.ts        # 主应用E2E测试
└── unit/                  # 独立单元测试（如果需要）
    └── (暂时为空)

src/
├── __tests__/             # App组件相关测试
├── components/__tests__/  # React组件单元测试
├── api/__tests__/        # API相关测试
└── data/__tests__/       # 业务逻辑测试
```

## 🧪 测试类型说明

### 单元测试 (Unit Tests)
- **位置**: `src/**/__tests__/`
- **命名**: `*.test.ts` 或 `*.test.tsx`
- **运行**: `npm test`
- **覆盖**: React组件、业务逻辑、API函数

### 端到端测试 (E2E Tests)
- **位置**: `tests/e2e/`
- **命名**: `*.spec.ts`
- **运行**: `npm run test:e2e`
- **覆盖**: 完整的用户交互流程

## 🚀 运行测试

```bash
# 运行所有单元测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行端到端测试
npm run test:e2e

# 运行所有测试
npm run test:all
```

## 📋 测试文件列表

### 单元测试
- `src/__tests__/App.test.tsx` - App组件测试
- `src/components/__tests__/Pet.test.tsx` - Pet组件测试
- `src/components/__tests__/StudyCard.test.tsx` - StudyCard组件测试
- `src/components/__tests__/ContextMenu.test.tsx` - ContextMenu组件测试
- `src/data/__tests__/cards.test.ts` - CardManager业务逻辑测试
- `src/api/__tests__/electronAPI.test.ts` - Electron API测试

### E2E测试
- `tests/e2e/app.spec.ts` - 主应用端到端测试

## 🔧 配置文件

- `jest.config.js` - Jest单元测试配置
- `playwright.config.ts` - Playwright E2E测试配置
- `src/setupTests.ts` - Jest测试环境设置