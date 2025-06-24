# Sprint 02.07: Deployment Preparation & Infrastructure Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: -  
**End Date**: -  
**Epic**: 02 - Authentication & User System

**Sprint Goal**: Set up deployment infrastructure and configurations while maintaining Expo Go compatibility for development. Prepare the project for future App Store and Play Store releases without breaking the development workflow. Complete deferred automation tasks from Sprint 02.06.

**User Story Contribution**: 
- Establishes deployment pipeline foundation
- Ensures smooth transition from development to production
- Maintains developer experience with Expo Go
- Completes automation infrastructure for production readiness

## Sprint Plan

### Objectives
1. Initialize EAS Build configuration ✓
2. Set up environment management system ✓
3. Configure app.json for production ✓
4. Create deployment documentation ✓
5. Set up deep linking for OAuth ✓
6. Prepare app store assets structure ✓
7. Configure CI/CD pipeline foundation ✓
8. Maintain Expo Go compatibility ✓
9. **[From 02.06] Migrate automation scripts to Supabase Edge Functions**
10. **[From 02.06] Create useUserList hook for code reuse**
11. **[From 02.06] Update deployment documentation with Edge Functions**

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `eas.json` | EAS Build configuration | NOT STARTED |
| `.env.example` | Environment variable template | NOT STARTED |
| `.env.development` | Development environment | NOT STARTED |
| `.env.staging` | Staging environment | NOT STARTED |
| `.env.production` | Production environment | NOT STARTED |
| `config/environment.js` | Environment management | NOT STARTED |
| `docs/DEPLOYMENT.md` | SnapBet-specific deployment guide | NOT STARTED |
| `.github/workflows/eas-preview.yml` | CI/CD for preview builds | NOT STARTED |
| `scripts/version-bump.js` | Version management script | NOT STARTED |
| `assets/app-store/README.md` | Asset requirements guide | NOT STARTED |
| `supabase/functions/update-badges/index.ts` | Badge automation function | NOT STARTED |
| `supabase/functions/settle-bets/index.ts` | Bet settlement function | NOT STARTED |
| `supabase/functions/add-games/index.ts` | Game data function | NOT STARTED |
| `hooks/useUserList.ts` | Shared user list hook | NOT STARTED |

### Files to Modify
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app.json` | Add production configuration | NOT STARTED |
| `.gitignore` | Add environment files | NOT STARTED |
| `package.json` | Add deployment scripts | NOT STARTED |
| `services/supabase/client.ts` | Use environment config | NOT STARTED |
| `app/(drawer)/followers.tsx` | Use useUserList hook | NOT STARTED |
| `app/(drawer)/following.tsx` | Use useUserList hook | NOT STARTED |
| `supabase/migrations/007_cron_triggers.sql` | Add cron triggers | NOT STARTED |

### Implementation Approach

#### Phase 1: EAS Setup (1 hour)
1. **Initialize EAS** (without breaking Expo Go):
   ```bash
   # Install EAS CLI globally
   npm install -g eas-cli
   
   # Login to Expo account
   eas login
   
   # Initialize EAS (creates eas.json)
   eas init
   ```

2. **Configure eas.json**:
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
         "env": {
           "EXPO_PUBLIC_APP_ENV": "development"
         }
       },
       "preview": {
         "distribution": "internal",
         "env": {
           "EXPO_PUBLIC_APP_ENV": "staging"
         },
         "channel": "preview"
       },
       "production": {
         "env": {
           "EXPO_PUBLIC_APP_ENV": "production"
         },
         "channel": "production",
         "autoIncrement": true
       }
     },
     "submit": {
       "production": {}
     }
   }
   ```

#### Phase 2: Environment Management (1.5 hours)
1. **Create environment files**:
   ```bash
   # .env.development
   EXPO_PUBLIC_APP_ENV=development
   EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
   
   # .env.staging
   EXPO_PUBLIC_APP_ENV=staging
   EXPO_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
   
   # .env.production
   EXPO_PUBLIC_APP_ENV=production
   EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
   ```

2. **Create environment config**:
   ```javascript
   // config/environment.js
   const ENV = {
     development: {
       supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
       supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
     },
     staging: {
       supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
       supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
     },
     production: {
       supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
       supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
     }
   };
   
   const getEnvironment = () => {
     const env = process.env.EXPO_PUBLIC_APP_ENV || 'development';
     return ENV[env];
   };
   
   export default getEnvironment();
   ```

#### Phase 3: App Configuration (1 hour)
1. **Update app.json** (keeping Expo Go compatibility):
   ```json
   {
     "expo": {
       "name": "SnapBet",
       "slug": "snapbet",
       "version": "1.0.0",
       "orientation": "portrait",
       "scheme": "snapbet",
       "userInterfaceStyle": "light",
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash-icon.png",
         "resizeMode": "contain",
         "backgroundColor": "#10B981"
       },
       "ios": {
         "supportsTablet": false,
         "bundleIdentifier": "com.snapbet.app",
         "config": {
           "usesNonExemptEncryption": false
         },
         "infoPlist": {
           "NSCameraUsageDescription": "SnapBet needs camera access to capture your betting moments",
           "NSPhotoLibraryUsageDescription": "SnapBet needs photo library access to save and share images"
         }
       },
       "android": {
         "adaptiveIcon": {
           "foregroundImage": "./assets/adaptive-icon.png",
           "backgroundColor": "#10B981"
         },
         "package": "com.snapbet.app",
         "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
       },
       "extra": {
         "eas": {
           "projectId": "auto-generated-on-first-build"
         }
       }
     }
   }
   ```

#### Phase 4: Deep Linking Setup (0.5 hours)
1. **Configure OAuth deep links**:
   ```javascript
   // Keep existing OAuth configuration
   // Just document the deep link setup for production builds
   
   // OAuth redirect URLs:
   // Development: exp://localhost:19000/--/auth/callback
   // Production: snapbet://auth/callback
   ```

#### Phase 5: CI/CD Foundation (1 hour)
1. **GitHub Actions for preview builds**:
   ```yaml
   # .github/workflows/eas-preview.yml
   name: EAS Preview Build
   
   on:
     pull_request:
       types: [opened, synchronize]
   
   jobs:
     preview:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node
           uses: actions/setup-node@v3
           with:
             node-version: 18
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Run tests
           run: npm test
         
         - name: Setup EAS
           uses: expo/expo-github-action@v8
           with:
             eas-version: latest
             token: ${{ secrets.EXPO_TOKEN }}
         
         # Only build on PR approval to save resources
         - name: Comment on PR
           uses: actions/github-script@v6
           with:
             script: |
               github.rest.issues.createComment({
                 issue_number: context.issue.number,
                 owner: context.repo.owner,
                 repo: context.repo.repo,
                 body: '🚀 Preview build available! Run `eas build --profile preview` to create a testable build.'
               })
   ```

#### Phase 6: Documentation (1 hour)
1. **Create SnapBet deployment guide**:
   ```markdown
   # SnapBet Deployment Guide
   
   ## Development Workflow
   - Continue using Expo Go for development
   - Use `npm start` as usual
   - OAuth works with Expo Go redirects
   
   ## Building for Testing
   ```bash
   # Create a preview build for TestFlight/Internal Testing
   eas build --profile preview --platform ios
   eas build --profile preview --platform android
   ```
   
   ## Environment Variables
   - Development: Local Supabase
   - Staging: Supabase free tier
   - Production: Supabase Pro tier (future)
   
   ## OAuth Configuration
   - Development: Uses Expo proxy
   - Production: Direct OAuth with deep links
   ```

#### Phase 7: Edge Functions Migration [From 02.06] (2 hours)
1. **Create Edge Functions structure**:
   ```bash
   mkdir -p supabase/functions/update-badges
   mkdir -p supabase/functions/settle-bets
   mkdir -p supabase/functions/add-games
   ```

2. **Migrate update-badges script**:
   ```typescript
   // supabase/functions/update-badges/index.ts
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
   
   serve(async (req) => {
     // Verify bearer token
     // Calculate badges for all users
     // Update badge tables
     // Return success/error
   })
   ```

3. **Create cron triggers migration**:
   ```sql
   -- 007_cron_triggers.sql
   SELECT cron.schedule('update-badges', '0 * * * *', 
     'SELECT net.http_post(
       url := current_setting('app.settings.supabase_url') || '/functions/v1/update-badges',
       headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.edge_function_token'))
     )'
   );
   ```

#### Phase 8: Code Refactoring [From 02.06] (1 hour)
1. **Create useUserList hook**:
   ```typescript
   // hooks/useUserList.ts
   export function useUserList(type: 'followers' | 'following') {
     // Shared logic for fetching and managing user lists
     // Handle loading, error, and pagination
   }
   ```

2. **Update components to use hook**:
   - Refactor followers.tsx
   - Refactor following.tsx
   - Remove duplicate code

### Key Technical Decisions
- **Maintain Expo Go**: All configs compatible with Expo Go for development
- **EAS Ready**: Infrastructure ready for builds when needed
- **Environment Isolation**: Clear separation between dev/staging/prod
- **No Breaking Changes**: Developers can continue current workflow

### Dependencies & Risks
**Dependencies**:
- Expo account (free)
- EAS CLI installation

**Identified Risks**:
- None - all changes are additive
- Expo Go compatibility maintained
- No production credentials needed yet

### Quality Requirements
- Expo Go still works for development
- Environment switching is seamless
- Documentation is clear
- CI/CD foundation is testable

## Success Criteria
- [ ] Can still run `npm start` and use Expo Go
- [ ] EAS configuration is valid
- [ ] Environment variables are properly structured
- [ ] Deep linking is documented
- [ ] CI/CD workflow is ready
- [ ] Team can create preview builds when needed

## Important Notes

### What This Sprint Does NOT Do
- Does NOT require Apple Developer account yet
- Does NOT require Google Play account yet
- Does NOT break Expo Go development
- Does NOT deploy to production
- Does NOT require production Supabase

### When You'll Need Developer Accounts
- **Apple Developer**: When ready for TestFlight (Epic 4-5)
- **Google Play**: When ready for Internal Testing (Epic 4-5)
- **Production Supabase**: When ready for beta users (Epic 6)

### Development Workflow Remains Unchanged
```bash
# Developers can still use:
npm start
# Scan QR code with Expo Go
# OAuth still works via Expo proxy
```

---

*Sprint Started: -*  
*Sprint Completed: -*  
*Final Status: NOT STARTED* 