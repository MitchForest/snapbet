# SnapBet Setup Guide

## Environment Setup

### Prerequisites

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **Bun** (latest version)
   - Install: `curl -fsSL https://bun.sh/install | bash`
   - Verify: `bun --version`

3. **Expo CLI**
   - Installed automatically with project dependencies

4. **Platform-specific requirements**:
   - **iOS**: Xcode (Mac only) with iOS Simulator
   - **Android**: Android Studio with Android Virtual Device

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd snapbet
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   - `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Running the Project

1. **Start the development server**
   ```bash
   bun run start
   ```

2. **Run on specific platform**
   - iOS: Press `i` or run `bun run ios`
   - Android: Press `a` or run `bun run android`
   - Web: Press `w` or run `bun run web`

### Development Scripts

- `bun run lint` - Run ESLint
- `bun run typecheck` - Run TypeScript type checking
- `bun run db:setup` - Set up database (Sprint 01.01)
- `bun run db:seed` - Seed mock data (Sprint 01.03)

## Project Structure

The project uses a clean, organized structure:

- **`app/`** - Expo Router screens (file-based routing)
- **`components/`** - Reusable UI components
- **`services/`** - API and Supabase logic
- **`stores/`** - Zustand state management
- **`hooks/`** - Custom React hooks
- **`utils/`** - Helper functions
- **`types/`** - TypeScript type definitions
- **`scripts/`** - Development and build scripts
- **`supabase/`** - Database migrations and config

## Path Aliases

The project uses TypeScript path aliases for clean imports:

```typescript
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   - Clear cache: `npx expo start -c`
   - Delete node_modules and reinstall: `rm -rf node_modules && bun install`

2. **TypeScript errors**
   - Run `bun run typecheck` to see all errors
   - Ensure your editor has TypeScript support enabled

3. **iOS Simulator not opening**
   - Make sure Xcode is installed
   - Open Xcode once to accept licenses
   - Try running `npx expo run:ios`

4. **Android emulator not found**
   - Ensure Android Studio is installed
   - Create an AVD in Android Studio
   - Start the emulator before running the app

## Next Steps

After setup, you'll move to Sprint 01.01 which will:
- Set up the Supabase backend
- Create database schema
- Configure authentication

## Notes

- The project uses Expo SDK 53 with the new architecture enabled
- Bun is used instead of npm/yarn for faster installs
- All code follows TypeScript strict mode
- ESLint and Prettier are pre-configured 