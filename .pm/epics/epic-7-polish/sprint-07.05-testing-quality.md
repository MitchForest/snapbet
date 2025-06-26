# Sprint 07.05: Testing & Quality Assurance

## Sprint Goal
Establish comprehensive testing coverage across all modules, implement quality gates, and ensure the migrated architecture meets all quality standards.

## Tasks

### 1. Unit Testing Implementation
- [ ] Write unit tests for all services
- [ ] Test all custom hooks
- [ ] Test store actions and selectors
- [ ] Test utility functions
- [ ] Test error scenarios
- [ ] Achieve 90% code coverage

**Service Testing Example:**
```typescript
// modules/betting/services/__tests__/bettingService.test.ts
describe('BettingService', () => {
  let service: BettingService;
  let mockApi: jest.Mocked<ApiClient>;
  let mockRepository: jest.Mocked<IBetRepository>;

  beforeEach(() => {
    mockApi = createMockApiClient();
    mockRepository = createMockBetRepository();
    service = new BettingService(mockApi, mockRepository);
  });

  describe('placeBet', () => {
    it('should validate bet amount', async () => {
      const invalidBet = { amount: -10, gameId: '123' };
      
      await expect(service.placeBet(invalidBet))
        .rejects.toThrow(ValidationError);
    });

    it('should check user balance before placing bet', async () => {
      mockRepository.getUserBalance.mockResolvedValue(50);
      const bet = { amount: 100, gameId: '123', userId: 'user1' };
      
      await expect(service.placeBet(bet))
        .rejects.toThrow(InsufficientFundsError);
    });

    it('should place bet successfully', async () => {
      const bet = { amount: 50, gameId: '123', userId: 'user1' };
      const expectedBet = { id: 'bet1', ...bet, status: 'pending' };
      
      mockRepository.getUserBalance.mockResolvedValue(100);
      mockRepository.create.mockResolvedValue(expectedBet);
      
      const result = await service.placeBet(bet);
      
      expect(result).toEqual(expectedBet);
      expect(mockRepository.create).toHaveBeenCalledWith(bet);
    });
  });
});
```

### 2. Component Testing Suite
- [ ] Test all UI components
- [ ] Test component interactions
- [ ] Test accessibility compliance
- [ ] Test responsive behavior
- [ ] Test error states
- [ ] Test loading states

**Component Testing Pattern:**
```typescript
// modules/betting/components/__tests__/BetSlip.test.tsx
describe('BetSlip', () => {
  const mockOnPlaceBet = jest.fn();
  
  const renderBetSlip = (props = {}) => {
    return render(
      <TestProviders>
        <BetSlip onPlaceBet={mockOnPlaceBet} {...props} />
      </TestProviders>
    );
  };

  it('should display bet items', () => {
    const { getByText } = renderBetSlip({
      items: [
        { id: '1', game: 'Lakers vs Bulls', amount: 50, odds: 1.5 }
      ]
    });
    
    expect(getByText('Lakers vs Bulls')).toBeTruthy();
    expect(getByText('$50')).toBeTruthy();
    expect(getByText('1.5')).toBeTruthy();
  });

  it('should calculate total payout', () => {
    const { getByTestId } = renderBetSlip({
      items: [
        { id: '1', amount: 50, odds: 1.5 },
        { id: '2', amount: 30, odds: 2.0 }
      ]
    });
    
    expect(getByTestId('total-payout')).toHaveTextContent('$135');
  });

  it('should be accessible', async () => {
    const { container } = renderBetSlip();
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
});
```

### 3. Integration Testing
- [ ] Test module interactions
- [ ] Test API integrations
- [ ] Test state synchronization
- [ ] Test navigation flows
- [ ] Test offline scenarios
- [ ] Test error recovery

**Integration Test Example:**
```typescript
// __tests__/integration/user-journey.test.ts
describe('User Betting Journey', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it('should complete full betting flow', async () => {
    // Login
    await act(async () => {
      await authStore.getState().login({
        email: 'test@example.com',
        password: 'password'
      });
    });

    // Navigate to games
    const { getByText, getByTestId } = render(<App />);
    fireEvent.press(getByText('Games'));

    // Select a game
    await waitFor(() => {
      fireEvent.press(getByTestId('game-Lakers-Bulls'));
    });

    // Place bet
    fireEvent.changeText(getByTestId('bet-amount'), '50');
    fireEvent.press(getByText('Place Bet'));

    // Verify bet placed
    await waitFor(() => {
      expect(getByText('Bet Confirmed')).toBeTruthy();
    });

    // Check bet history
    fireEvent.press(getByText('My Bets'));
    expect(getByText('Lakers vs Bulls - $50')).toBeTruthy();
  });
});
```

### 4. E2E Testing Setup
- [ ] Configure Detox for React Native
- [ ] Write critical user flows
- [ ] Test cross-platform behavior
- [ ] Test deep linking
- [ ] Test push notifications
- [ ] Test biometric authentication

**E2E Test Configuration:**
```javascript
// e2e/config/detox.config.js
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config/jest.config.js',
  apps: {
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/Snapbet.app',
      build: 'xcodebuild -workspace ios/Snapbet.xcworkspace -scheme Snapbet -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_31'
      }
    }
  }
};
```

### 5. Performance Testing
- [ ] Setup performance benchmarks
- [ ] Test app startup time
- [ ] Test screen load times
- [ ] Test list scrolling performance
- [ ] Test memory usage
- [ ] Test battery consumption

**Performance Test Suite:**
```typescript
// __tests__/performance/app-performance.test.ts
describe('App Performance', () => {
  it('should start app within 2 seconds', async () => {
    const startTime = performance.now();
    await initializeApp();
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(2000);
  });

  it('should render 1000 items smoothly', async () => {
    const items = generateMockItems(1000);
    const { getByTestId } = render(
      <FlashList data={items} renderItem={renderItem} />
    );

    const metrics = await measurePerformance(() => {
      scrollList(getByTestId('list'), { to: 'bottom' });
    });

    expect(metrics.fps).toBeGreaterThan(55);
    expect(metrics.jsFrameRate).toBeGreaterThan(55);
  });
});
```

### 6. Code Quality Gates
- [ ] Setup SonarQube integration
- [ ] Configure code complexity limits
- [ ] Add security scanning
- [ ] Setup dependency auditing
- [ ] Configure bundle size limits
- [ ] Add type coverage requirements

**Quality Gate Configuration:**
```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates
on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Code Coverage
        run: |
          npm test -- --coverage
          if [ $(cat coverage/coverage-summary.json | jq '.total.lines.pct') -lt 80 ]; then
            echo "Code coverage below 80%"
            exit 1
          fi
      
      - name: Type Coverage
        run: |
          npx type-coverage --at-least 95
      
      - name: Bundle Size
        run: |
          npm run build
          npx bundlesize
      
      - name: Security Audit
        run: npm audit --audit-level=moderate
      
      - name: Code Complexity
        run: npx complexity-report --max-complexity 10
```

### 7. Documentation & Reporting
- [ ] Generate test coverage reports
- [ ] Create performance dashboards
- [ ] Document testing strategies
- [ ] Create test plan templates
- [ ] Setup automated reporting
- [ ] Create quality metrics dashboard

**Test Documentation Structure:**
```markdown
# Testing Strategy

## Test Levels
1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: Module interactions
3. **E2E Tests**: User journeys
4. **Performance Tests**: Speed and efficiency

## Coverage Requirements
- Unit Tests: 90% minimum
- Integration Tests: 80% minimum
- E2E Tests: Critical paths only
- Performance: All user-facing operations

## Testing Tools
- Jest: Unit and integration testing
- React Native Testing Library: Component testing
- Detox: E2E testing
- React Native Performance: Performance monitoring
```

## Definition of Done
- [ ] All test suites passing
- [ ] Code coverage > 85% overall
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Quality gates configured
- [ ] Documentation complete

## Testing Metrics
- Unit test coverage: 90%+
- Integration test coverage: 80%+
- E2E test coverage: Critical paths
- Zero high-severity bugs
- Performance regression < 5%

## Risk Factors
- E2E test flakiness
- Performance test environment variations
- Test maintenance overhead
- CI/CD pipeline duration

## Success Criteria
- Automated test suite runs < 10 minutes
- Zero production bugs from migrated code
- Developer confidence in test suite
- Clear quality metrics visibility
- Sustainable test maintenance