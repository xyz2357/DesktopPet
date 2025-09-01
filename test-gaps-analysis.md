# Test Coverage Gaps Analysis for PRD v0.3

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