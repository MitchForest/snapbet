# Sprint X - Fix Build Issues

## Executive Summary

The Snapbet app was experiencing critical build and runtime issues preventing it from running on iOS. The primary issues were a crash on launch due to the MMKV storage library, and a secondary crash due to missing native modules for `expo-camera` and other libraries. Both issues have been resolved, and the app is now functional.

## Root Causes & Resolutions

1.  **MMKV Initialization Failure**: The app was crashing on launch when a remote debugger was attached. This was because `react-native-mmkv` was being initialized eagerly at the module level, which is incompatible with the remote debugging environment.
    *   **Fix**: The `services/storage/storageService.ts` file was completely rewritten to use a lazy-initialization pattern. The storage instances are now only created when they are first accessed. The service also now detects if a remote debugger is active and falls back to a simple in-memory store, preventing the crash entirely.

2.  **Missing Native Modules (`ExpoCamera`, `AutoLayoutView`)**: The app was crashing with errors like `Cannot find native module 'ExpoCamera'` because the native iOS project was stale and out of sync with the `package.json` dependencies.
    *   **Fix**: We performed a clean prebuild using `bun expo prebuild --platform ios --clean`. This command deleted the existing `ios` directory and regenerated it from scratch, correctly linking all native modules specified in the project's dependencies.

3.  **Browser-Specific API Usage (`window.addEventListener`)**: A `TypeError: window.addEventListener is not a function` error was discovered, caused by code in `hooks/useFeed.ts` that was intended for a web environment.
    *   **Fix**: The browser-specific code was removed from the hook. A more robust, platform-agnostic solution for event handling will be implemented separately.

4.  **Miscellaneous Type Errors**: Several TypeScript errors were introduced and subsequently fixed during the debugging process.
    *   **Fix**: All type errors were resolved, and the codebase now passes a `bun typecheck` command.

## Final Verification

*   [x] App opens without a white screen.
*   [x] No MMKV errors in the console.
*   [x] Camera functionality is working.
*   [x] All routes load properly.

---

## Development Workflow Guide

To avoid these issues in the future, please adhere to the following workflows for local development and testing.

### A. Local Development (iOS Simulator)

This is the most common workflow for day-to-day development.

1.  **Start the development server:**
    ```bash
    bun expo start --clear
    ```
    *   The `--clear` flag is recommended to avoid Metro bundler cache issues.

2.  **Run on the simulator:**
    *   Press `i` in the terminal where `expo start` is running.

**When to use this:** Use this for all UI changes, business logic updates, and any work that does **not** involve adding or updating a library with native code.

### B. Local Development with Native Changes

Use this workflow whenever you add, remove, or update a dependency in `package.json` that contains native iOS or Android code (e.g., `expo-camera`, `react-native-reanimated`).

1.  **Clean all caches (optional but recommended):**
    ```bash
    rm -rf .expo node_modules/.cache .tamagui ios/build android/build
    ```

2.  **Force a clean prebuild:** This is the **most critical step**. It rebuilds the native project.
    ```bash
    bun expo prebuild --platform ios --clean
    ```

3.  **Run the app on the simulator:** This will build the new native code and install the updated app.
    ```bash
    bun expo run:ios
    ```

**Key takeaway:** If you see errors like `Cannot find native module`, your first step should always be to run the `prebuild --clean` command.

### C. Creating a Full Development Build for Your Phone (EAS)

Use this when you need to test on a physical device, especially for features like the camera, push notifications, or for sharing a build with others.

1.  **Ensure your code is committed to Git.** EAS Build works best with a clean Git history.

2.  **Make sure `eas.json` is configured correctly.** The `development` profile should be set up for your intended platform.

3.  **Start the build:**
    ```bash
    eas build --platform ios --profile development
    ```
    *   This will create a new build using the Expo Application Services (EAS) cloud. It will install all dependencies, run `prebuild`, and compile the native app.

4.  **Install on your device:** Once the build is complete, you will get a QR code or a link. Open this on your phone to install the app.

By following these distinct workflows, you can ensure a stable and predictable development environment.
