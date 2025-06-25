# Complete Deployment Guide: React Native + Expo + Supabase

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Supabase Configuration](#supabase-configuration)
5. [Expo & EAS Build Setup](#expo--eas-build-setup)
6. [Build Configuration](#build-configuration)
7. [Building Your App](#building-your-app)
8. [Testing & Quality Assurance](#testing--quality-assurance)
9. [App Store Submission](#app-store-submission)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Monitoring & Analytics](#monitoring--analytics)
12. [Over-the-Air Updates](#over-the-air-updates)
13. [Security Best Practices](#security-best-practices)
14. [Troubleshooting](#troubleshooting)
15. [Deployment Checklist](#deployment-checklist)

## Overview

This guide covers the complete deployment process for a React Native app built with Expo and Supabase, from development to production release on iOS App Store and Google Play Store.

### Deployment Flow

```
Local Development
      ↓
Environment Configuration
      ↓
Build with EAS
      ↓
Internal Testing
      ↓
Beta Testing (TestFlight/Play Console)
      ↓
Production Release
      ↓
Monitoring & Updates
```

## Prerequisites

### Required Tools
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- EAS CLI
- Supabase CLI
- Git

### Required Accounts
- Expo account
- Apple Developer account ($99/year)
- Google Play Developer account ($25 one-time)
- Supabase account

### Installation Commands
```bash
# Install Expo CLI
npm install -g expo-cli

# Install EAS CLI
npm install -g eas-cli

# Install Supabase CLI
npm install -g supabase

# Login to services
expo login
eas login
supabase login
```

## Environment Setup

### 1. Environment Variables Structure

Create the following files in your project root:

```bash
# .env.development
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
EXPO_PUBLIC_API_URL=https://dev-api.yourapp.com

# .env.staging
EXPO_PUBLIC_APP_ENV=staging
EXPO_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
EXPO_PUBLIC_API_URL=https://staging-api.yourapp.com

# .env.production
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
EXPO_PUBLIC_API_URL=https://api.yourapp.com
```

### 2. Environment Configuration File

```javascript
// config/environment.js
const getEnvironment = () => {
  const env = process.env.EXPO_PUBLIC_APP_ENV || 'development';
  
  const environments = {
    development: {
      name: 'Development',
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      enableDevTools: true,
      enableLogs: true,
    },
    staging: {
      name: 'Staging',
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      enableDevTools: false,
      enableLogs: true,
    },
    production: {
      name: 'Production',
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      enableDevTools: false,
      enableLogs: false,
    },
  };
  
  return environments[env] || environments.development;
};

export default getEnvironment();
```

### 3. Supabase Client Configuration

```javascript
// services/supabase.js
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import environment from '../config/environment';

const supabaseUrl = environment.supabaseUrl;
const supabaseAnonKey = environment.supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Supabase Configuration

### 1. Database Migration Setup

```bash
# Initialize Supabase in your project
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Create a new migration
supabase migration new create_initial_schema

# Apply migrations to remote database
supabase db push

# Pull remote schema changes
supabase db pull

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts
```

### 2. Supabase Project Structure

```
supabase/
├── config.toml
├── migrations/
│   ├── 20240101000000_create_users_table.sql
│   ├── 20240101000001_create_profiles_table.sql
│   └── 20240101000002_enable_rls.sql
├── functions/
│   ├── hello-world/
│   │   └── index.ts
│   └── send-notification/
│       └── index.ts
└── seed.sql
```

### 3. Row Level Security (RLS) Configuration

```sql
-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

### 4. Edge Functions Deployment

```bash
# Deploy a single function
supabase functions deploy hello-world

# Deploy all functions
supabase functions deploy

# Set function secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

## Expo & EAS Build Setup

### 1. Initialize EAS Build

```bash
# Initialize EAS in your project
eas init

# Configure build profiles
eas build:configure
```

### 2. App Configuration (app.json)

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.yourapp",
      "buildNumber": "1.0.0",
      "config": {
        "usesNonExemptEncryption": false
      },
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to capture photos and videos.",
        "NSPhotoLibraryUsageDescription": "This app needs access to your photo library to save images.",
        "NSLocationWhenInUseUsageDescription": "This app uses your location to provide location-based features."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.yourapp",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ],
      "googleServicesFile": "./google-services.json"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-camera",
      "expo-location",
      "expo-media-library",
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "13.0",
            "useFrameworks": "static"
          },
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "minSdkVersion": 21,
            "kotlinVersion": "1.8.0"
          }
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    },
    "updates": {
      "enabled": true,
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/your-project-id"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

## Build Configuration

### 1. EAS Build Configuration (eas.json)

```json
{
  "cli": {
    "version": ">= 5.0.0",
    "promptToConfigurePushNotifications": false
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true,
        "enterpriseProvisioning": "adhoc"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "development"
      },
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "enterpriseProvisioning": "adhoc"
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "staging"
      },
      "channel": "preview"
    },
    "production": {
      "ios": {
        "simulator": false,
        "enterpriseProvisioning": "universal",
        "autoIncrement": true
      },
      "android": {
        "buildType": "app-bundle",
        "autoIncrement": true
      },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production"
      },
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./credentials/android-service-account.json",
        "track": "production",
        "releaseStatus": "completed",
        "rollout": 0.1
      }
    }
  }
}
```

### 2. Build-time Secrets

```bash
# Set build secrets
eas secret:create --scope project --name SENTRY_DSN --value your-sentry-dsn
eas secret:create --scope project --name AMPLITUDE_API_KEY --value your-api-key

# List secrets
eas secret:list

# Delete a secret
eas secret:delete --id SECRET_ID
```

## Building Your App

### 1. Development Builds

```bash
# iOS Development Build
eas build --profile development --platform ios

# Android Development Build
eas build --profile development --platform android

# Both platforms
eas build --profile development --platform all
```

### 2. Preview/Staging Builds

```bash
# Create preview builds for testing
eas build --profile preview --platform all

# With specific channel
eas build --profile preview --platform all --channel preview
```

### 3. Production Builds

```bash
# Production build with auto-increment version
eas build --profile production --platform ios --auto-submit

# Android production build
eas build --profile production --platform android

# Both platforms without auto-submit
eas build --profile production --platform all
```

### 4. Local Builds (Optional)

```bash
# Build locally if needed
eas build --profile production --platform ios --local
```

## Testing & Quality Assurance

### 1. Internal Testing Setup

```javascript
// __tests__/setup.js
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}));
```

### 2. Testing Checklist

```markdown
## Pre-Release Testing Checklist

### Functionality Testing
- [ ] User authentication flow
- [ ] Core features working
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Deep linking
- [ ] In-app purchases (if applicable)

### Performance Testing
- [ ] App launch time < 3 seconds
- [ ] Smooth scrolling (60 FPS)
- [ ] Memory usage acceptable
- [ ] No memory leaks
- [ ] Battery usage optimized

### Device Testing
- [ ] iPhone (various models)
- [ ] iPad (if supported)
- [ ] Android phones (various manufacturers)
- [ ] Android tablets (if supported)
- [ ] Different OS versions

### Network Testing
- [ ] 3G/4G/5G
- [ ] WiFi
- [ ] Offline mode
- [ ] Poor connectivity handling
```

### 3. Beta Testing Distribution

```bash
# iOS TestFlight
eas build --profile preview --platform ios
eas submit -p ios --profile preview

# Android Internal Testing
eas build --profile preview --platform android
eas submit -p android --profile preview --track internal
```

## App Store Submission

### 1. iOS App Store

#### App Store Connect Setup
```bash
# Automatic submission
eas submit -p ios --profile production

# Manual submission with specific build
eas submit -p ios --id=BUILD_ID
```

#### Required Information
- App name and subtitle
- App description (up to 4000 characters)
- Keywords (100 characters max)
- Support URL
- Marketing URL (optional)
- Privacy Policy URL
- Screenshots for all supported devices
- App preview videos (optional)

#### Screenshot Requirements
- iPhone 6.7" (1290 x 2796)
- iPhone 6.5" (1242 x 2688 or 1284 x 2778)
- iPhone 5.5" (1242 x 2208)
- iPad Pro 12.9" (2048 x 2732)

### 2. Google Play Store

#### Play Console Setup
```bash
# Submit to Play Store
eas submit -p android --profile production

# Submit to specific track
eas submit -p android --track internal --profile production
```

#### Required Information
- App name (30 characters)
- Short description (80 characters)
- Full description (4000 characters)
- App icon (512x512 PNG)
- Feature graphic (1024x500)
- Screenshots (minimum 2, maximum 8 per device type)
- Privacy Policy URL
- App category
- Content rating questionnaire

#### Release Management
```javascript
// Staged rollout configuration
{
  "submit": {
    "production": {
      "android": {
        "track": "production",
        "releaseStatus": "inProgress",
        "rollout": 0.1 // 10% rollout
      }
    }
  }
}
```

## CI/CD Pipeline

### 1. GitHub Actions Configuration

```yaml
# .github/workflows/eas-build.yml
name: EAS Build and Deploy

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    types: [opened, synchronize]

env:
  EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v3

      - name: 🟢 Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🧪 Run tests
        run: npm test

      - name: 🔍 Run linter
        run: npm run lint

      - name: 📊 Run TypeScript check
        run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v3

      - name: 🟢 Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🏗️ Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: 📱 Build iOS app
        run: eas build --platform ios --profile production --non-interactive

      - name: 🤖 Build Android app
        run: eas build --platform android --profile production --non-interactive

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v3

      - name: 🏗️ Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: 🚀 Submit to App Store
        run: eas submit -p ios --profile production --non-interactive

      - name: 🚀 Submit to Play Store
        run: eas submit -p android --profile production --non-interactive

      - name: 📱 Publish OTA Update
        run: eas update --branch production --message "Automated update from CI"
```

### 2. GitLab CI Configuration

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"
  EAS_VERSION: "latest"

.node_setup: &node_setup
  image: node:${NODE_VERSION}
  before_script:
    - npm ci
    - npm install -g eas-cli@${EAS_VERSION}
    - eas login --token $EXPO_TOKEN

test:
  <<: *node_setup
  stage: test
  script:
    - npm run lint
    - npm run type-check
    - npm test
  only:
    - merge_requests
    - develop
    - main

build:ios:
  <<: *node_setup
  stage: build
  script:
    - eas build --platform ios --profile production --non-interactive
  only:
    - main

build:android:
  <<: *node_setup
  stage: build
  script:
    - eas build --platform android --profile production --non-interactive
  only:
    - main

deploy:
  <<: *node_setup
  stage: deploy
  script:
    - eas submit -p ios --profile production --latest --non-interactive
    - eas submit -p android --profile production --latest --non-interactive
    - eas update --branch production --message "Deployment from GitLab CI"
  only:
    - main
```

## Monitoring & Analytics

### 1. Sentry Integration

```bash
npx expo install sentry-expo
```

```javascript
// App.js
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: __DEV__,
  environment: process.env.EXPO_PUBLIC_APP_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Native.ReactNativeTracing({
      tracingOrigins: ['localhost', /^https:\/\/yourapi\.com/],
      routingInstrumentation: new Sentry.Native.ReactNavigationInstrumentation(
        navigation,
      ),
    }),
  ],
});

// Wrap your app
export default Sentry.Native.wrap(App);
```

### 2. Analytics Setup

```javascript
// services/analytics.js
import * as Analytics from 'expo-firebase-analytics';
import { Platform } from 'react-native';
import environment from '../config/environment';

class AnalyticsService {
  async logEvent(eventName, params = {}) {
    if (!environment.enableLogs) return;
    
    try {
      await Analytics.logEvent(eventName, {
        ...params,
        platform: Platform.OS,
        environment: environment.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  async setUserId(userId) {
    if (!environment.enableLogs) return;
    await Analytics.setUserId(userId);
  }

  async setUserProperties(properties) {
    if (!environment.enableLogs) return;
    await Analytics.setUserProperties(properties);
  }

  // Screen tracking
  async logScreenView(screenName, screenClass) {
    await this.logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenClass,
    });
  }

  // E-commerce events
  async logPurchase(value, currency, items) {
    await this.logEvent('purchase', {
      value,
      currency,
      items,
    });
  }
}

export default new AnalyticsService();
```

### 3. Performance Monitoring

```javascript
// hooks/usePerformanceMonitoring.js
import { useEffect } from 'react';
import * as Sentry from 'sentry-expo';

export const usePerformanceMonitoring = (screenName) => {
  useEffect(() => {
    const transaction = Sentry.startTransaction({
      name: screenName,
      op: 'navigation',
    });

    Sentry.getCurrentHub().configureScope((scope) => {
      scope.setSpan(transaction);
    });

    return () => {
      transaction.finish();
    };
  }, [screenName]);
};
```

## Over-the-Air Updates

### 1. Configure OTA Updates

```javascript
// app.json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 30000,
      "url": "https://u.expo.dev/your-project-id"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

### 2. Update Implementation

```javascript
// services/updates.js
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

export const checkForUpdates = async () => {
  if (__DEV__) return;
  
  try {
    const update = await Updates.checkForUpdateAsync();
    
    if (update.isAvailable) {
      Alert.alert(
        'Update Available',
        'A new version of the app is available. Would you like to update?',
        [
          { text: 'Later', style: 'cancel' },
          { 
            text: 'Update', 
            onPress: async () => {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
            }
          },
        ]
      );
    }
  } catch (error) {
    console.error('Update check failed:', error);
  }
};
```

### 3. Publishing Updates

```bash
# Publish to production channel
eas update --branch production --message "Bug fixes and improvements"

# Publish to preview channel
eas update --branch preview --message "Testing new features"

# Publish with specific runtime version
eas update --branch production --runtime-version "1.0.0"
```

## Security Best Practices

### 1. Code Obfuscation

```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      mangle: {
        toplevel: true,
      },
      output: {
        ascii_only: true,
        quote_style: 3,
        wrap_iife: true,
      },
      sourceMap: {
        includeSources: false,
      },
      toplevel: false,
      compress: {
        reduce_funcs: true,
      },
    },
  },
};
```

### 2. API Key Security

```javascript
// services/api.js
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';

class SecureAPI {
  constructor() {
    this.apiKey = Constants.manifest.extra.apiKey;
    this.apiSecret = Constants.manifest.extra.apiSecret;
  }

  async generateSignature(data) {
    const timestamp = Date.now();
    const message = `${timestamp}:${JSON.stringify(data)}`;
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${message}:${this.apiSecret}`,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
    
    return {
      timestamp,
      signature,
    };
  }

  async secureRequest(endpoint, data) {
    const { timestamp, signature } = await this.generateSignature(data);
    
    return fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
      },
      body: JSON.stringify(data),
    });
  }
}
```

### 3. Certificate Pinning

```javascript
// For iOS (in app.json)
{
  "expo": {
    "ios": {
      "config": {
        "networkSecurityConfig": {
          "domains": {
            "api.yourapp.com": {
              "includeSubdomains": true,
              "pinnedDomainPublicKeyHashes": [
                "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
                "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB="
              ]
            }
          }
        }
      }
    }
  }
}
```

## Troubleshooting

### Common Build Issues

#### 1. iOS Build Failures

```bash
# Clear cache and rebuild
rm -rf ios/Pods
cd ios && pod install && cd ..
eas build --clear-cache --platform ios

# Check provisioning profiles
eas credentials
```

#### 2. Android Build Failures

```bash
# Clear gradle cache
cd android && ./gradlew clean && cd ..

# Update gradle wrapper
cd android && ./gradlew wrapper --gradle-version=8.0 && cd ..
```

#### 3. Metro Bundler Issues

```bash
# Clear all caches
npx expo start --clear
rm -rf node_modules
npm install
watchman watch-del-all
```

### Debug Production Builds

```javascript
// Enable production debugging
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  
  // But keep Sentry logging
  global.console = {
    ...console,
    error: (...args) => {
      Sentry.captureException(new Error(args.join(' ')));
    },
  };
}
```

## Deployment Checklist

### Pre-Deployment Checklist

```markdown
## Code & Configuration
- [ ] All environment variables configured
- [ ] API endpoints pointing to production
- [ ] Remove all console.log statements
- [ ] Enable production error reporting
- [ ] Update app version and build number
- [ ] Review and update app permissions

## Testing
- [ ] Run full test suite
- [ ] Test on physical devices
- [ ] Test all critical user flows
- [ ] Verify offline functionality
- [ ] Check performance metrics
- [ ] Test push notifications

## Supabase
- [ ] Production database migrated
- [ ] RLS policies enabled and tested
- [ ] Edge functions deployed
- [ ] Backup strategy configured
- [ ] Rate limiting configured
- [ ] Database indexes optimized

## Security
- [ ] API keys secured
- [ ] SSL certificate valid
- [ ] Authentication flow secure
- [ ] Sensitive data encrypted
- [ ] Code obfuscation enabled
- [ ] Remove development tools

## Assets
- [ ] App icon (all sizes)
- [ ] Splash screen
- [ ] Store screenshots
- [ ] App preview video
- [ ] Marketing materials
- [ ] Privacy policy updated
- [ ] Terms of service updated

## Store Listings
- [ ] App name finalized
- [ ] App description written
- [ ] Keywords researched
- [ ] Categories selected
- [ ] Content rating completed
- [ ] Pricing configured

## Monitoring
- [ ] Sentry configured
- [ ] Analytics configured
- [ ] Performance monitoring enabled
- [ ] Crash reporting enabled
- [ ] User feedback mechanism
- [ ] Health check endpoints

## Post-Deployment
- [ ] Monitor crash reports
- [ ] Check user reviews
- [ ] Monitor server load
- [ ] Track key metrics
- [ ] Prepare hotfix process
- [ ] Document known issues
```

### Version Management Script

```javascript
// scripts/version.js
const fs = require('fs');
const path = require('path');

const bumpVersion = (type = 'patch') => {
  const appJsonPath = path.join(__dirname, '../app.json');
  const packageJsonPath = path.join(__dirname, '../package.json');
  
  // Read files
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Parse current version
  const [major, minor, patch] = appJson.expo.version.split('.').map(Number);
  
  // Calculate new version
  let newVersion;
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }
  
  // Update versions
  appJson.expo.version = newVersion;
  appJson.expo.ios.buildNumber = newVersion;
  appJson.expo.android.versionCode += 1;
  packageJson.version = newVersion;
  
  // Write files
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log(`Version bumped to ${newVersion}`);
  console.log(`Android versionCode: ${appJson.expo.android.versionCode}`);
};

// Run with: node scripts/version.js [major|minor|patch]
const versionType = process.argv[2] || 'patch';
bumpVersion(versionType);
```

## Conclusion

This deployment guide covers the complete process of deploying a React Native + Expo + Supabase application. Key points to remember:

1. **Environment Management**: Keep development, staging, and production environments strictly separated
2. **Security**: Never commit sensitive data, use environment variables and secure storage
3. **Testing**: Thoroughly test on real devices before deployment
4. **Monitoring**: Set up comprehensive monitoring before going live
5. **Updates**: Plan for both app store updates and OTA updates
6. **Documentation**: Keep your deployment process well-documented for team members

Regular deployment cycles and automated CI/CD pipelines will help maintain code quality and reduce deployment friction. Always have a rollback plan ready in case issues arise in production.