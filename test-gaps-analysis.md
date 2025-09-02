# Test Coverage Gaps Analysis for PRD v0.3 / PRD v0.3测试覆盖率缺口分析

[English](#english) | [中文](#中文)

---

## English

## Critical Missing Tests

### 1. Autonomous Behavior Timing Tests
**Current Issue**: Tests verify behavior changes happen, but not at correct intervals

**Missing Tests:**
```javascript
// Should verify 30-second walking trigger interval
it('should trigger walking behavior every 30 seconds', () => {
  const mockEventListener = jest.fn();
  behaviorManager.addEventListener(mockEventListener);
  
  // Fast forward exactly 30 seconds
  jest.advanceTimersByTime(30000);
  expect(mockEventListener).toHaveBeenCalledWith(
    expect.objectContaining({ state: 'walking' })
  );
});

// Should verify long idle threshold (2 minutes) triggers sleep
it('should enter sleep state after 2 minutes of inactivity', () => {
  jest.advanceTimersByTime(120000); // 2 minutes
  expect(behaviorManager.getCurrentState()).toBe('sleeping');
});
```

### 2. Mouse Tracking Integration Tests
**Current Issue**: Mouse tracking exists but doesn't integrate with pet visuals

**Missing Tests:**
```javascript
// Should verify mouse position affects pet look direction
it('should update pet look direction when mouse moves', async () => {
  render(<Pet {...mockProps} />);
  
  // Simulate mouse movement
  fireEvent.mouseMove(document, { clientX: 500, clientY: 300 });
  
  // Pet should visually respond (CSS transform, animation, etc.)
  const petElement = screen.getByTitle('随意玩弄她吧');
  await waitFor(() => {
    expect(petElement).toHaveStyle(expect.stringContaining('transform'));
  });
});
```

### 3. Time-based Emotion Integration Tests  
**Current Issue**: Emotions are calculated but don't affect pet behavior

**Missing Tests:**
```javascript  
// Should verify time periods trigger appropriate behaviors
it('should show different behaviors for different time periods', async () => {
  // Mock morning time (8 AM)
  jest.spyOn(Date.prototype, 'getHours').mockReturnValue(8);
  
  render(<Pet {...mockProps} />);
  
  // Should show morning-appropriate behaviors/text
  expect(screen.getByText(/早上好|早安/)).toBeInTheDocument();
});
```

### 4. State-Media Integration Tests
**Current Issue**: State changes don't properly update media display

**Missing Tests:**
```javascript
// Should verify autonomous state changes update pet media
it('should display walking media when in walking state', async () => {
  mockMediaManager.getRandomMediaForState.mockReturnValue('/assets/walking.gif');
  
  render(<Pet {...mockProps} />);
  
  // Trigger walking state
  behaviorManager.setState('walking');
  
  // Should request walking media and display it
  await waitFor(() => {
    expect(mockMediaManager.getRandomMediaForState).toHaveBeenCalledWith('walking');
  });
});
```

### 5. Easter Egg Visual Feedback Tests
**Current Issue**: Easter eggs are detected but don't provide visual feedback

**Missing Tests:**
```javascript
// Should verify easter eggs show visual feedback
it('should show special animation for triple click easter egg', async () => {
  render(<Pet {...mockProps} />);
  const petElement = screen.getByTitle('随意玩弄她吧');
  
  // Trigger triple click
  await user.tripleClick(petElement);
  
  // Should show special easter egg visual feedback
  expect(petElement).toHaveClass('pet--easter-egg');
  expect(screen.getByText('三连击！厉害！✨')).toBeInTheDocument();
});
```

## Test Quality Issues

### 1. Mock Misalignment
**Problem**: Mocks don't reflect actual implementation behavior
- MouseTracker mock is too simplified 
- InteractionManager mock doesn't test real click history logic
- MediaManager mock doesn't test actual file loading

### 2. Integration Testing Missing
**Problem**: Components are tested in isolation, not as a system
- Pet + AutonomousBehaviorManager integration
- MouseTracker + Pet visual feedback integration  
- InteractionManager + Pet state integration

### 3. Timing Tests Are Fragile
**Problem**: Timer-based tests use arbitrary timeouts
- Should use deterministic time mocking
- Should test exact timing requirements from PRD
- Should verify cleanup happens correctly

### 4. Missing Edge Cases
**Problem**: Happy path testing only
- What happens when multiple timers conflict?
- How do user interactions interrupt autonomous behaviors?
- What happens when media files are missing for a state?

## Recommendations

1. **Add Integration Test Suite**: Create comprehensive tests that verify the full user experience
2. **Fix Timer Testing**: Use proper timer mocking for deterministic timing tests
3. **Test Visual Changes**: Verify that internal state changes actually affect the visual presentation
4. **Add E2E Tests**: Test the complete autonomous behavior cycle from user perspective
5. **Mock Cleanup**: Make mocks more realistic and closer to actual implementation

---

## 中文

## 关键缺失测试

### 1. 自主行为时序测试
**当前问题**: 测试验证行为变化发生，但不验证正确的间隔时间

**缺失测试:**
```javascript
// 应验证30秒行走触发间隔
it('should trigger walking behavior every 30 seconds', () => {
  const mockEventListener = jest.fn();
  behaviorManager.addEventListener(mockEventListener);
  
  // 快进正好30秒
  jest.advanceTimersByTime(30000);
  expect(mockEventListener).toHaveBeenCalledWith(
    expect.objectContaining({ state: 'walking' })
  );
});

// 应验证长时间空闲阈值（2分钟）触发睡眠
it('should enter sleep state after 2 minutes of inactivity', () => {
  jest.advanceTimersByTime(120000); // 2分钟
  expect(behaviorManager.getCurrentState()).toBe('sleeping');
});
```

### 2. 鼠标跟踪集成测试
**当前问题**: 鼠标跟踪存在但不与桌宠视觉效果集成

### 3. 基于时间的情绪集成测试  
**当前问题**: 情绪被计算但不影响桌宠行为

### 4. 状态-媒体集成测试
**当前问题**: 状态变化不能正确更新媒体显示

### 5. 彩蛋视觉反馈测试
**当前问题**: 彩蛋被检测但不提供视觉反馈

## 测试质量问题

### 1. Mock不匹配
**问题**: Mock不反映实际实现行为
- MouseTracker mock过于简化 
- InteractionManager mock不测试真实点击历史逻辑
- MediaManager mock不测试实际文件加载

### 2. 缺失集成测试
**问题**: 组件被孤立测试，而不是作为系统

### 3. 时序测试脆弱
**问题**: 基于计时器的测试使用任意超时

## 建议

1. **添加集成测试套件**: 创建验证完整用户体验的综合测试
2. **修复计时器测试**: 使用适当的计时器mock进行确定性时序测试
3. **测试视觉变化**: 验证内部状态变化实际影响视觉呈现
4. **添加E2E测试**: 从用户角度测试完整的自主行为循环
5. **Mock清理**: 使mock更现实，更接近实际实现