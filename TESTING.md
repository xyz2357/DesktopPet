# Testing Guide

This document describes the testing setup and available test commands for the Japanese Pet desktop application.

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