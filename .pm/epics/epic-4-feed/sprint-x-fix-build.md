# Sprint X - Fix Build Issues

## Executive Summary

The Snapbet app is experiencing critical build issues preventing it from running properly on iOS devices. The primary issue is MMKV (react-native-mmkv) failing to initialize due to running in remote debugger mode, which cascades into multiple route loading failures. Additionally, there are questions about whether the camera module was properly included in the latest EAS development build.

## Current State

### Build Information
- **Platform**: iOS Development Build
- **Build Tool**: EAS Build
- **Build Profile**: Development
- **Last Build Command**: `eas build --platform ios --profile development`
- **Build Purpose**: Include camera native modules (expo-camera)

### Error Summary
1. **Primary Error**: MMKV initialization failure
2. **Secondary Errors**: Route default export warnings (false positives)
3. **Tertiary Error**: ExpoCamera native module not found
4. **Result**: White screen, app non-functional

## Detailed Error Analysis

### 1. MMKV Initialization Error

**Error Message**:
```
Error: Failed to create a new MMKV instance: React Native is not running on-device. 
MMKV can only be used when synchronous method invocations (JSI) are possible. 
If you are using a remote debugger (e.g. Chrome), switch to an on-device debugger (e.g. Flipper) instead.
```

**Root Cause**:
- MMKV requires JSI (JavaScript Interface) which is only available when running directly on device
- Remote debugging (Chrome DevTools) doesn't support JSI
- MMKV instances are created at module level in `services/storage/storageService.ts`

**Affected Files**:
- `services/storage/storageService.ts` (lines 3-17) - Creates MMKV instances at module load
- `services/social/followService.ts` - Imports Storage service
- Any file that imports these services directly or indirectly

### 2. Route Default Export Warnings

**Error Pattern**:
```
Route "./(drawer)/(tabs)/index.tsx" is missing the required default export
```

**Analysis**:
- These are FALSE POSITIVES
- All route files DO have default exports (verified)
- The errors occur because MMKV failure prevents modules from loading properly
- Expo Router can't load the routes due to the cascade failure

**Affected Routes**:
- `app/(drawer)/(tabs)/index.tsx`
- `app/(drawer)/(tabs)/search.tsx`
- `app/(drawer)/_layout.tsx`
- `app/(drawer)/camera.tsx`
- `app/(drawer)/follow-requests.tsx`
- `app/(drawer)/followers.tsx`
- `app/(drawer)/following.tsx`
- `app/(drawer)/profile/[username].tsx`
- `app/(drawer)/settings/privacy.tsx`

### 3. Camera Module Error

**Error Message**:
```
Error: Cannot find native module 'ExpoCamera'
```

**Possible Causes**:
1. Camera module wasn't included in the EAS build despite our configuration
2. JavaScript bundle is cached and doesn't match the native build
3. Development build needs to be refreshed

## Timeline of Events

1. **Initial Issue**: App showing errors "Cannot read property 'S' of undefined"
2. **Quick Fix Attempt**: Changed package.json main entry (reverted)
3. **Root Cause Found**: Tamagui theme tokens had incorrect `$` prefixes
4. **Camera Issue**: Discovered missing native camera modules
5. **Build Solution**: Created new EAS development build specifically to include camera
6. **Current State**: New build installed but still showing errors

## Debugging Steps Taken

1. ✅ Fixed Tamagui theme configuration (removed `$` prefixes)
2. ✅ Cleared all caches (.tamagui, node_modules/.cache, .expo)
3. ✅ Created new EAS development build with camera modules
4. ✅ Installed new build on device
5. ❌ App still showing MMKV errors and white screen

## Solutions

### Immediate Fix (Recommended)

**Stop Using Remote Debugger**:
1. Shake device to open developer menu
2. Select "Stop Remote JS Debugging" if enabled
3. Force quit the app
4. Reopen the app
5. The MMKV errors should disappear

### Alternative Solutions

#### Option 1: Lazy Load MMKV (Code Fix)
Modify `services/storage/storageService.ts` to lazy initialize:

```typescript
// Instead of immediate initialization
let feedStorage: MMKV | null = null;
let settingsStorage: MMKV | null = null;
let generalStorage: MMKV | null = null;

const getStorageInstance = (id: string) => {
  // Check if running in remote debugger
  if (__DEV__ && typeof global.nativeCallSyncHook === 'undefined') {
    console.warn('MMKV not available in remote debugger, using in-memory storage');
    return createInMemoryStorage();
  }
  
  return new MMKV({ id: `snapbet-${id}`, encryptionKey: undefined });
};

// Lazy getters
const getFeedStorage = () => {
  if (!feedStorage) feedStorage = getStorageInstance('feed');
  return feedStorage;
};
```

#### Option 2: Development-Only Fallback
Create a storage abstraction that falls back to AsyncStorage in development:

```typescript
const createStorage = () => {
  const canUseMMKV = typeof global.nativeCallSyncHook !== 'undefined';
  
  if (!canUseMMKV) {
    return createAsyncStorageAdapter();
  }
  
  return createMMKVAdapter();
};
```

#### Option 3: Conditional Import
Use dynamic imports to prevent MMKV from loading in incompatible environments:

```typescript
let Storage: StorageInterface;

if (__DEV__ && typeof global.nativeCallSyncHook === 'undefined') {
  Storage = require('./mockStorage').default;
} else {
  Storage = require('./mmkvStorage').default;
}
```

### Camera Module Verification

1. **Verify Build Configuration**:
   - Check `eas.json` includes camera plugin
   - Ensure `app.json` has camera permissions

2. **Clear JavaScript Bundle**:
   ```bash
   # Kill Metro bundler
   # Clear all caches
   rm -rf .expo
   rm -rf node_modules/.cache
   rm -rf ios/build
   rm -rf ~/Library/Developer/Xcode/DerivedData
   
   # Restart Metro with clear cache
   bun expo start --clear
   ```

3. **Verify Native Modules**:
   - In the app, check if camera module exists:
   ```javascript
   import { Camera } from 'expo-camera';
   console.log('Camera available:', !!Camera);
   ```

## Best Practices Going Forward

### 1. Development Setup
- Always use on-device debugging (Flipper or React Native Debugger)
- Avoid Chrome remote debugging when using native modules
- Keep development builds up to date with package changes

### 2. Storage Architecture
- Implement lazy loading for storage services
- Add environment detection for storage initialization
- Provide fallback mechanisms for development

### 3. Build Management
- Document all native module requirements
- Version control `eas.json` configuration
- Test builds immediately after creation

### 4. Error Handling
- Add try-catch blocks around native module initialization
- Provide meaningful error messages
- Implement graceful degradation

## Quick Reference Commands

```bash
# Clear all caches
rm -rf .expo node_modules/.cache .tamagui ios/build android/build

# Start Metro with clear cache
bun expo start --clear

# Create new development build
eas build --platform ios --profile development

# Check native module availability
npx expo prebuild --clean
npx expo run:ios
```

## Verification Checklist

- [ ] Remote debugger is disabled
- [ ] App opens without white screen
- [ ] No MMKV errors in console
- [ ] Camera functionality works
- [ ] All routes load properly
- [ ] Feed displays content
- [ ] Navigation works

## Next Steps

1. **Immediate**: Disable remote debugger and test
2. **Short-term**: Implement MMKV lazy loading
3. **Medium-term**: Add proper error boundaries
4. **Long-term**: Create development-specific storage adapter

## Additional Resources

- [MMKV Documentation](https://github.com/mrousavy/react-native-mmkv)
- [Expo Camera Setup](https://docs.expo.dev/versions/latest/sdk/camera/)
- [EAS Build Configuration](https://docs.expo.dev/build/introduction/)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
