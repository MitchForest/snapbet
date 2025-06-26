# Sprint X - Fix Build & Runtime Issues

## Executive Summary

The Snapbet app was experiencing critical build and runtime issues preventing it from running on iOS. The primary issues were a crash on launch due to the MMKV storage library, a secondary crash due to missing native modules, and a cascade of follow-on errors related to service dependencies and navigation. All major architectural issues and type errors have been resolved, and the app is now in a stable, functional state.

---

## Architectural Decisions & Key Fixes

1.  **Debugger-Safe Storage Layer (Completed):**
    *   **Problem:** The app crashed when a remote debugger was attached because `react-native-mmkv` was initialized eagerly.
    *   **Decision:** The storage service (`storageService.ts`) was rewritten to be environment-aware. It now uses lazy initialization and falls back to an in-memory store during debugging. This makes the app robust for development while retaining native performance in production.

2.  **Native Module Linking (Completed):**
    *   **Problem:** The app was crashing with `Cannot find native module 'ExpoCamera'` and `AutoLayoutView` errors.
    *   **Decision:** The root cause was a stale native project. This was fixed by running `bun expo prebuild --platform ios --clean`, which regenerated the `ios` directory and correctly linked all native dependencies.

3.  **Service-Layer Dependency Cycles (Completed):**
    *   **Problem:** The `followService`, `privacyService`, and `followRequestService` had circular dependencies, creating a fragile architecture.
    *   **Decision:** I applied the **Dependency Inversion** principle. Instead of services calling each other, the responsibility was moved to the UI layer (`useFollowState` hook). The hook now fetches the necessary data from multiple services and passes it down. This creates a cleaner, unidirectional data flow.

4.  **Modal Navigation (Completed):**
    *   **Problem:** The camera screen was implemented with a manual `<Modal>` component, causing the `GO_BACK` action to fail.
    *   **Decision:** The camera screen was refactored into a proper **nested stack navigator** (`app/(drawer)/camera/_layout.tsx`). This is the idiomatic Expo Router approach, which allows the navigator to manage the presentation and dismissal of the modal correctly.

5.  **Browser-Specific API Removal (Completed):**
    *   **Problem:** A `window.addEventListener` call in `useFeed.ts` was causing a runtime crash.
    *   **Decision:** The browser-only code was removed. A platform-agnostic event emitter will be implemented later.

6.  **Final Type Safety (Completed):**
    *   **Problem:** A number of type errors remained after the major refactoring.
    *   **Decision:** All remaining type errors, including duplicate imports and incorrect enum usage, were resolved. The codebase now passes `bun typecheck` with zero errors.

---

## Final Outcome

All build-blocking issues, runtime crashes, and type errors have been successfully resolved. The application is now considered stable and ready for further development and testing.

---

## Development Workflow Guide

*This section remains the same as the previous version and provides guidance on local development, native changes, and EAS builds.*
