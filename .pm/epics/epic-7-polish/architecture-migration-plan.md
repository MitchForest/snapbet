# Comprehensive Architecture Migration Plan

## Executive Summary
This document outlines the complete migration strategy for restructuring the Snapbet codebase from its current component-based architecture to a feature-first, domain-driven architecture with proper separation of concerns.

## Current State Analysis

### Strengths
- Modern tech stack (React Native, Expo, TypeScript)
- Good component organization by feature
- Consistent naming conventions
- Proper TypeScript usage

### Weaknesses
- Minimal test coverage (1 test file)
- Limited state management (2 Zustand stores)
- No centralized error handling
- Direct Supabase usage throughout
- Missing development tooling
- No performance monitoring

## Target Architecture

### Core Principles
1. **Feature-First Organization**: Self-contained modules with all related code
2. **Layered Architecture**: Clear separation between UI, business logic, and infrastructure
3. **Dependency Inversion**: Core business logic independent of external services
4. **Test-Driven Development**: Comprehensive test coverage at all levels
5. **Performance First**: Monitoring, optimization, and lazy loading

### Directory Structure
```
src/
├── modules/                 # Feature modules
│   ├── auth/
│   │   ├── components/     # UI components
│   │   ├── screens/        # Screen components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utilities
│   │   ├── __tests__/      # Tests
│   │   └── index.ts        # Public API
│   ├── betting/
│   ├── messaging/
│   ├── social/
│   └── shared/             # Shared module
├── core/                   # Core business logic
│   ├── entities/           # Domain entities
│   ├── repositories/       # Repository interfaces
│   ├── use-cases/          # Business rules
│   └── types/              # Core types
├── infrastructure/         # External integrations
│   ├── api/               # API client and configuration
│   ├── database/          # Database adapters
│   ├── storage/           # Local storage
│   ├── analytics/         # Analytics integration
│   └── monitoring/        # Error and performance monitoring
├── design-system/         # UI component library
│   ├── components/        # Base components
│   ├── tokens/            # Design tokens
│   ├── themes/            # Theme configuration
│   └── utils/             # UI utilities
├── navigation/            # Navigation configuration
├── config/                # App configuration
├── utils/                 # Global utilities
└── __tests__/            # Global test utilities
```

## Migration Phases

### Phase 1: Foundation Setup (Week 1)
1. **Project Restructuring**
   - Create new directory structure
   - Setup path aliases in TypeScript config
   - Configure module resolution

2. **Development Tooling**
   - ESLint with custom rules
   - Prettier configuration
   - Husky pre-commit hooks
   - Commitlint for conventional commits

3. **Testing Infrastructure**
   - Jest configuration
   - React Native Testing Library setup
   - Mock utilities and fixtures
   - Coverage reporting

4. **CI/CD Pipeline**
   - GitHub Actions workflow
   - Automated testing
   - Build verification
   - Deploy previews

### Phase 2: Core Infrastructure (Week 2)
1. **API Client Layer**
   - Abstract Supabase client
   - Request/response interceptors
   - Error handling middleware
   - Retry logic

2. **State Management Architecture**
   - Root store setup
   - Store composition patterns
   - Persistence layer
   - DevTools integration

3. **Error Handling System**
   - Global error boundary
   - Feature-level error boundaries
   - Error reporting service
   - User-friendly error messages

4. **Performance Monitoring**
   - React Native Performance API
   - Custom performance marks
   - Bundle size tracking
   - Memory leak detection

### Phase 3: Module Migration - Core Features (Weeks 3-4)
1. **Auth Module**
   - Extract auth components
   - Create auth store
   - Implement auth service
   - Add comprehensive tests

2. **Betting Module**
   - Migrate betting components
   - Implement betting store
   - Create betting services
   - Add business logic tests

3. **Messaging Module**
   - Extract chat components
   - Implement message store
   - Create real-time services
   - Add integration tests

4. **Social Module**
   - Migrate social features
   - Implement social store
   - Create engagement services
   - Add user flow tests

### Phase 4: Module Migration - Supporting Features (Week 5)
1. **Profile Module**
   - User profile components
   - Profile management store
   - Profile services
   - Avatar/media handling

2. **Settings Module**
   - Settings screens
   - Preferences store
   - Configuration services
   - Feature flags

3. **Search Module**
   - Search components
   - Search state management
   - Search algorithms
   - Result caching

4. **Shared Module**
   - Common components
   - Shared hooks
   - Utility functions
   - Type definitions

### Phase 5: Testing & Quality Assurance (Week 6)
1. **Unit Testing**
   - Component tests
   - Hook tests
   - Service tests
   - Store tests

2. **Integration Testing**
   - API integration tests
   - Module integration tests
   - Navigation flow tests
   - State synchronization tests

3. **E2E Testing**
   - Critical user flows
   - Cross-platform testing
   - Performance benchmarks
   - Accessibility tests

4. **Code Quality**
   - Code coverage analysis
   - Complexity metrics
   - Bundle size optimization
   - Documentation generation

### Phase 6: Performance & Polish (Week 7-8)
1. **Performance Optimization**
   - Implement code splitting
   - Lazy load routes
   - Optimize images
   - Reduce bundle size

2. **Developer Experience**
   - Storybook setup
   - Component documentation
   - Development guides
   - Architecture decision records

3. **Production Readiness**
   - Security audit
   - Performance benchmarks
   - Load testing
   - Rollback procedures

4. **Launch Preparation**
   - Feature flags setup
   - Gradual rollout plan
   - Monitoring dashboards
   - Incident response plan

## Detailed Implementation Guide

### 1. API Client Implementation
```typescript
// infrastructure/api/client/ApiClient.ts
export class ApiClient {
  private client: SupabaseClient;
  private interceptors: Interceptor[] = [];

  constructor(config: ApiConfig) {
    this.client = createClient(config.url, config.key);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Auth interceptor
    this.addInterceptor({
      request: async (config) => {
        const token = await getAuthToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      response: (response) => response,
      error: async (error) => {
        if (error.status === 401) {
          await refreshToken();
          return this.retry(error.config);
        }
        throw error;
      }
    });
  }

  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.executeRequest(config);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }
}
```

### 2. State Management Pattern
```typescript
// modules/betting/store/bettingStore.ts
interface BettingState {
  bets: Bet[];
  activeBetSlip: BetSlip | null;
  isLoading: boolean;
  error: Error | null;
}

interface BettingActions {
  loadBets: () => Promise<void>;
  placeBet: (bet: BetInput) => Promise<void>;
  updateBetSlip: (item: BetSlipItem) => void;
  clearBetSlip: () => void;
}

export const useBettingStore = create<BettingState & BettingActions>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        bets: [],
        activeBetSlip: null,
        isLoading: false,
        error: null,

        // Actions
        loadBets: async () => {
          set({ isLoading: true, error: null });
          try {
            const bets = await bettingService.getUserBets();
            set({ bets, isLoading: false });
          } catch (error) {
            set({ error, isLoading: false });
          }
        },

        placeBet: async (betInput) => {
          const optimisticBet = createOptimisticBet(betInput);
          set(state => ({ 
            bets: [...state.bets, optimisticBet],
            activeBetSlip: null 
          }));

          try {
            const bet = await bettingService.placeBet(betInput);
            set(state => ({
              bets: state.bets.map(b => 
                b.id === optimisticBet.id ? bet : b
              )
            }));
          } catch (error) {
            set(state => ({
              bets: state.bets.filter(b => b.id !== optimisticBet.id),
              error
            }));
          }
        }
      }),
      {
        name: 'betting-store',
        partialize: (state) => ({ bets: state.bets })
      }
    )
  )
);
```

### 3. Testing Strategy
```typescript
// modules/betting/__tests__/BettingModule.test.tsx
describe('BettingModule', () => {
  const mockBettingService = createMockBettingService();
  
  beforeEach(() => {
    jest.clearAllMocks();
    setupTestStore();
  });

  describe('Bet Placement Flow', () => {
    it('should place a bet successfully', async () => {
      const { getByText, getByTestId } = render(
        <TestProviders>
          <BettingScreen />
        </TestProviders>
      );

      // Select game
      fireEvent.press(getByTestId('game-card-1'));
      
      // Enter bet amount
      fireEvent.changeText(getByTestId('bet-amount'), '50');
      
      // Place bet
      fireEvent.press(getByText('Place Bet'));

      // Verify optimistic update
      expect(getByText('Bet Pending')).toBeTruthy();

      // Wait for server response
      await waitFor(() => {
        expect(getByText('Bet Confirmed')).toBeTruthy();
      });

      // Verify service called correctly
      expect(mockBettingService.placeBet).toHaveBeenCalledWith({
        gameId: '1',
        amount: 50,
        type: 'spread'
      });
    });
  });
});
```

### 4. Module Structure Example
```typescript
// modules/betting/index.ts
// Public API for betting module
export * from './components';
export * from './hooks';
export * from './types';
export { useBettingStore } from './store';
export { bettingService } from './services';

// modules/betting/hooks/usePlaceBet.ts
export function usePlaceBet() {
  const { placeBet, isLoading, error } = useBettingStore();
  const analytics = useAnalytics();

  const handlePlaceBet = useCallback(async (betInput: BetInput) => {
    analytics.track('bet_placement_started', { 
      amount: betInput.amount 
    });

    try {
      await placeBet(betInput);
      analytics.track('bet_placement_success');
    } catch (error) {
      analytics.track('bet_placement_failed', { error });
      throw error;
    }
  }, [placeBet, analytics]);

  return {
    placeBet: handlePlaceBet,
    isLoading,
    error
  };
}
```

## Migration Checklist

### Pre-Migration
- [ ] Full backup of current codebase
- [ ] Document current API contracts
- [ ] Inventory all third-party dependencies
- [ ] Create migration branch
- [ ] Set up new project structure
- [ ] Configure development environment

### During Migration
- [ ] Maintain feature parity
- [ ] Write tests for migrated code
- [ ] Update documentation
- [ ] Regular code reviews
- [ ] Daily progress tracking
- [ ] Performance benchmarking

### Post-Migration
- [ ] Full regression testing
- [ ] Performance validation
- [ ] Security audit
- [ ] Documentation review
- [ ] Team training
- [ ] Gradual rollout

## Success Metrics
1. **Code Quality**
   - Test coverage > 80%
   - Zero critical ESLint errors
   - TypeScript strict mode compliance

2. **Performance**
   - App startup time < 2s
   - Screen transition < 300ms
   - Memory usage optimized

3. **Developer Experience**
   - Build time < 60s
   - Hot reload working consistently
   - Clear error messages

4. **Maintainability**
   - Reduced code duplication
   - Consistent patterns
   - Self-documenting code

## Rollback Plan
1. Maintain parallel branches during migration
2. Feature flags for new architecture
3. Incremental deployment strategy
4. Automated rollback triggers
5. Data migration reversibility

## Team Responsibilities
- **Lead Developer**: Architecture decisions, code reviews
- **Frontend Developers**: Module migration, testing
- **QA Engineer**: Test planning, regression testing
- **DevOps**: CI/CD setup, monitoring

## Timeline Summary
- Week 1: Foundation & Setup
- Week 2: Core Infrastructure
- Weeks 3-4: Core Module Migration
- Week 5: Supporting Module Migration
- Week 6: Testing & Quality
- Weeks 7-8: Performance & Polish

Total Duration: 8 weeks with 2-3 developers