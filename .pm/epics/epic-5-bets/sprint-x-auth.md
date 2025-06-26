# Sprint X: Auth System Overhaul

**Objective:** To refactor and improve the authentication system to be more robust, maintainable, and provide a better user experience. This plan addresses the root causes of the Twitter login issue and other identified weaknesses.

**QA & Product Lead:** Gemini

---

## Phase 1: Simplify and Stabilize the Core Authentication Flow

This phase focuses on removing complexity and fragility, creating a solid foundation.

### 1.1: Refactor `services/auth/authService.ts`

-   [ ] **Remove Manual Redirect Handling:** Delete the global `Linking.addEventListener`. It is redundant with `WebBrowser.openAuthSessionAsync` and creates race conditions.
-   [ ] **Simplify `signInWithOAuth`:**
    -   Remove the complex promise race with a timeout.
    -   Remove manual URL parsing and session setting from the `WebBrowser` result. The Supabase client should handle this.
    -   Rely *only* on the Supabase client's ability to handle the OAuth callback and session creation.
-   [ ] **Configure Supabase Client for Expo:**
    -   Ensure the Supabase client is initialized with `detectSessionInUrl: false` as we are using `openAuthSessionAsync` and not a standard web redirect.
    -   The key is to let Supabase generate the URL and then pass the resulting URL from the browser session back to Supabase.

### 1.2: Centralize Redirect and Session Logic

-   [ ] **Create `useAuthRedirector` Hook:**
    -   This new hook will be the single source of truth for navigation logic based on auth state.
    -   It will listen to `useAuthStore` for changes in `isAuthenticated`, `isLoading`, and `user` (for onboarding status).
    -   It will replace the logic currently in `useRequireAuth`.
-   [ ] **Integrate `useAuthRedirector` into `AuthProvider.tsx`:**
    -   The `AuthProvider` will use this hook to manage the root navigation state, ensuring a clean separation of concerns.
-   [ ] **Deprecate `useRequireAuth.ts`:**
    -   Once the new hook is in place, this file will be removed to eliminate duplicated logic.

### 1.3: Streamline Session Management

-   [ ] **Single Source of Truth:**
    -   Solidify `AuthProvider` as the component responsible for interacting with `supabase.auth.onAuthStateChange`.
    -   The `AuthProvider` will call `authStore.setSession` to update the global state.
-   [ ] **Refactor `authStore.ts`:**
    -   Remove the `checkSession` action. The initial session check will be handled by the `AuthProvider` on mount. This simplifies the store and prevents race conditions.

---

## Phase 2: Enhance User Experience

This phase focuses on making the app more user-friendly, especially in non-ideal conditions.

### 2.1: Add Offline Support

-   [ ] **Integrate `NetInfo`:** Use `@react-native-community/netinfo` to get real-time network status.
-   [ ] **Create `useNetworkStatus` Hook:** A simple hook to provide network status to any component.
-   [ ] **Display Offline Indicator:** Show a global toast or banner when the user is offline.
-   [ ] **Graceful Degradation:** Disable buttons (e.g., Login) that require a network connection when offline, preventing errors.

### 2.2: Improve Error Handling

-   [ ] **User-Friendly Messages:** Create a mapping of `CustomAuthError` codes to clear, user-facing messages.
-   [ ] **Toast Notifications:** Use the existing `ToastProvider` to display auth errors instead of just logging them to the user.
-   [ ] **Clear Errors:** Ensure errors are cleared from the `authStore` when a new auth action is initiated.

---

## Phase 3: Improve Maintainability and Testability

This phase ensures the long-term health of the auth system.

### 3.1: Unit & Integration Testing

-   [ ] **`authService.ts` Tests:** Write Jest tests to mock the Supabase client and verify that `signInWithOAuth` and `signOut` are called correctly.
-   [ ] **`authStore.ts` Tests:** Write tests for the Zustand store to ensure state transitions are correct based on auth actions.
-   [ ] **`useAuthRedirector` Hook Tests:** Test the navigation logic of the new hook using `react-hooks-testing-library`.

### 3.2: End-to-End (E2E) Testing (Optional but Recommended)

-   [ ] **Develop E2E Test Suite:** Use a framework like Detox or Maestro to create tests for the full login flow.
-   [ ] **Test Cases:**
    -   Successful login with Google.
    -   Successful login with Twitter.
    -   Failed login (e.g., user cancels).
    -   Redirect to onboarding for new user.
    -   Redirect to home screen for existing user.
