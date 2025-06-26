# Sprint 07.02: Core Infrastructure

## Sprint Goal
Build the core infrastructure layer including API client abstraction, enhanced state management, error handling system, and dependency injection.

## Tasks

### 1. API Client Abstraction Layer
- [ ] Create base ApiClient class
- [ ] Implement request/response interceptors
- [ ] Add retry logic with exponential backoff
- [ ] Create error transformation layer
- [ ] Implement request cancellation
- [ ] Add request/response logging

**Implementation Structure:**
```typescript
// infrastructure/api/client/ApiClient.ts
export class ApiClient {
  private interceptors: InterceptorManager;
  private retryConfig: RetryConfig;
  
  async request<T>(config: RequestConfig): Promise<ApiResponse<T>>;
  addInterceptor(interceptor: Interceptor): void;
  cancelRequest(requestId: string): void;
}

// infrastructure/api/interceptors/
├── authInterceptor.ts
├── errorInterceptor.ts
├── loggingInterceptor.ts
└── retryInterceptor.ts
```

### 2. Repository Pattern Implementation
- [ ] Define repository interfaces in core layer
- [ ] Implement Supabase repositories
- [ ] Create mock repositories for testing
- [ ] Add caching layer to repositories
- [ ] Implement data transformation layer
- [ ] Create repository factory

**Repository Structure:**
```typescript
// core/repositories/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// infrastructure/repositories/UserRepository.ts
export class UserRepository implements IUserRepository {
  constructor(private api: ApiClient) {}
  
  async findById(id: string): Promise<User> {
    const response = await this.api.get(`/users/${id}`);
    return UserMapper.toDomain(response.data);
  }
}
```

### 3. Enhanced State Management Architecture
- [ ] Create root store with modules
- [ ] Implement store composition pattern
- [ ] Add persistence middleware
- [ ] Create store devtools
- [ ] Implement optimistic updates
- [ ] Add state synchronization

**Store Architecture:**
```typescript
// infrastructure/store/RootStore.ts
export class RootStore {
  auth: AuthStore;
  betting: BettingStore;
  messaging: MessagingStore;
  ui: UIStore;
  
  constructor(private services: ServiceContainer) {
    this.setupStores();
    this.setupSynchronization();
  }
}

// modules/betting/store/bettingStore.ts
export const createBettingStore = (services: BettingServices) => {
  return create<BettingState>()(
    devtools(
      persist(
        subscribeWithSelector((set, get) => ({
          // State and actions
        }))
      )
    )
  );
};
```

### 4. Error Handling System
- [ ] Create custom error classes
- [ ] Implement global error boundary
- [ ] Add feature-level error boundaries
- [ ] Create error reporting service
- [ ] Implement user-friendly error messages
- [ ] Add error recovery strategies

**Error Handling Structure:**
```typescript
// core/errors/
├── AppError.ts
├── NetworkError.ts
├── ValidationError.ts
├── AuthenticationError.ts
└── BusinessError.ts

// infrastructure/errors/ErrorHandler.ts
export class ErrorHandler {
  handle(error: Error): ErrorResponse {
    if (error instanceof NetworkError) {
      return this.handleNetworkError(error);
    }
    // ... other error types
  }
}
```

### 5. Dependency Injection Container
- [ ] Create DI container implementation
- [ ] Define service tokens
- [ ] Implement service registration
- [ ] Add lifecycle management
- [ ] Create injection decorators
- [ ] Setup module initialization

**DI Implementation:**
```typescript
// infrastructure/di/Container.ts
export class Container {
  private services = new Map<ServiceToken, ServiceFactory>();
  private singletons = new Map<ServiceToken, any>();
  
  register<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): void;
  resolve<T>(token: ServiceToken<T>): T;
  createScope(): Container;
}

// infrastructure/di/tokens.ts
export const API_CLIENT = new ServiceToken<ApiClient>('ApiClient');
export const USER_REPOSITORY = new ServiceToken<IUserRepository>('UserRepository');
```

### 6. Configuration Management
- [ ] Create environment configuration
- [ ] Implement feature flags system
- [ ] Add remote configuration support
- [ ] Create configuration validation
- [ ] Setup configuration hot reload
- [ ] Add configuration encryption

**Configuration Structure:**
```typescript
// config/index.ts
export interface AppConfig {
  api: ApiConfig;
  features: FeatureFlags;
  performance: PerformanceConfig;
  security: SecurityConfig;
}

// config/featureFlags.ts
export class FeatureFlagService {
  async isEnabled(flag: FeatureFlag): Promise<boolean>;
  async getVariant(flag: FeatureFlag): Promise<string>;
  onUpdate(callback: (flags: FeatureFlags) => void): void;
}
```

### 7. Logging & Monitoring Infrastructure
- [ ] Create structured logging system
- [ ] Implement log levels and filtering
- [ ] Add performance monitoring
- [ ] Create custom metrics tracking
- [ ] Setup remote logging
- [ ] Add debug mode tools

**Logging System:**
```typescript
// infrastructure/logging/Logger.ts
export class Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  
  performance(metric: PerformanceMetric): void;
  analytics(event: AnalyticsEvent): void;
}
```

## Definition of Done
- [ ] All infrastructure services are implemented
- [ ] Unit tests written with >90% coverage
- [ ] Integration tests for critical paths
- [ ] Documentation completed
- [ ] Code reviewed and approved
- [ ] Performance benchmarks met

## Technical Decisions
1. **DI Container**: Custom lightweight implementation
2. **Error Handling**: Centralized with error boundaries
3. **API Client**: Axios-like interface with Supabase
4. **Logging**: Structured JSON logging
5. **Configuration**: Environment-based with overrides

## Dependencies
- Sprint 07.01 must be completed
- Supabase client library
- Zustand and middleware
- Sentry SDK

## Risk Factors
- [ ] API client abstraction may impact performance
- [ ] State synchronization complexity
- [ ] DI container learning curve
- [ ] Error handling edge cases

## Success Criteria
- API calls 30% faster with caching
- Zero unhandled errors in production
- State persistence working offline
- All services properly injected
- Configuration changes without deploy