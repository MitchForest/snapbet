# Getting Started with Snapbet

This guide will walk you through setting up Snapbet from scratch, including cloning the repository, setting up the development environment, building the app, and populating it with demo content.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Bun** (latest version) - [Install Bun](https://bun.sh/)
- **Git**
- **Xcode** (for iOS development on macOS)
- **Android Studio** (for Android development)
- **Expo CLI** - Will be installed with the project

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/[YOUR-GITHUB-USERNAME]/snapbet.git

# Navigate to the project directory
cd snapbet
```

## Step 2: Install Dependencies

```bash
# Install all dependencies using Bun
bun install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..
```

## Step 3: Environment Setup

### 3.1 Create Environment File

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

### 3.2 Configure Environment Variables

Edit `.env` and add your Supabase credentials:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Sentry (Optional)
SENTRY_DSN=your-sentry-dsn

# API Keys
THE_ODDS_API_KEY=your-odds-api-key
```

### 3.3 Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or use existing
3. Go to Settings → API
4. Copy:
   - `URL` → `EXPO_PUBLIC_SUPABASE_URL`
   - `anon public` → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_KEY`

## Step 4: Database Setup

### 4.1 Run Database Migrations

```bash
# Apply all database migrations
bun run supabase db push

# Or if using Supabase CLI
supabase db push --linked
```

### 4.2 Seed Mock Users

```bash
# Create 30 mock users with personalities
bun run scripts/seed-mock-users.ts
```

## Step 5: Build and Run the App

### 5.1 Start the Development Server

```bash
# Start Expo development server
bun run start

# Or specific platform
bun run ios      # iOS Simulator
bun run android  # Android Emulator
```

### 5.2 Run on Physical Device

1. Download **Expo Go** app on your phone
2. Scan the QR code from the terminal
3. The app will load on your device

### 5.3 Development Builds (Recommended)

For full functionality including native features:

```bash
# Create a development build
bun run build:dev

# ios simulator build
eas build --profile development-simulator --platform ios
# Then: Install and run it
eas build:run -p ios --latest

# iOS development build
eas build --platform ios --profile development

# Android development build  
eas build --platform android --profile development
```

## Step 6: Populate with Demo Content

### 6.1 Quick Setup - Everything at Once

```bash
# Run complete demo setup with your username
bun run demo:setup --username=YOUR_USERNAME

# Or if you prefer using your Supabase UUID:
# bun run demo:setup --user-id=YOUR_SUPABASE_USER_ID
```

This command will:
- ✅ Create posts with betting picks
- ✅ Generate group chats with messages
- ✅ Add mock users placing bets
- ✅ Create reactions and comments
- ✅ Add you to all demo chat groups

### 6.2 Test Your Own Content

1. **Create a post or place a bet in the app**

2. **Trigger community reactions:**
```bash
bun run demo:reactions --username=YOUR_USERNAME
```

This will generate:
- 🔥 Reactions to your posts
- 💬 Comments from mock users
- 👥 Tail/fade actions on your picks
- 💭 Chat discussions about your activity

### 6.3 Ongoing Activity

Start the hourly activity generator:

```bash
# Run in a separate terminal
bun run jobs:runner
```

This creates natural activity patterns throughout the day.

## Step 7: Common Development Tasks

### Running Tests

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage
```

### Code Quality Checks

```bash
# Run linter
bun run lint

# Run type checking
bun run typecheck

# Fix formatting
bun run format
```

### Database Management

```bash
# Generate TypeScript types from database
bun run supabase:types

# Create a new migration
supabase migration new your_migration_name

# Reset database (WARNING: Deletes all data)
supabase db reset
```

## Step 8: Troubleshooting

### Common Issues

#### 1. **Metro bundler issues**
```bash
# Clear cache and restart
bun run start --clear
```

#### 2. **iOS build fails**
```bash
# Clean and rebuild
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
bun run ios
```

#### 3. **Android build fails**
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
bun run android
```

#### 4. **Mock users not found**
```bash
# Re-run seed script
bun run scripts/seed-mock-users.ts
```

#### 5. **Can't see demo chats**
```bash
# Make sure to use your actual username
bun run demo:setup --username=YOUR_USERNAME
```

## Project Structure

```
snapbet/
├── app/                 # Expo Router app directory
│   ├── (tabs)/         # Tab navigation screens
│   ├── (auth)/         # Authentication screens
│   └── _layout.tsx     # Root layout
├── components/          # Reusable React components
├── services/           # API and service layers
│   ├── supabase/      # Supabase client and queries
│   └── realtime/      # WebSocket services
├── hooks/              # Custom React hooks
├── scripts/            # Development scripts
│   ├── mock/          # Mock ecosystem scripts
│   └── jobs/          # Background job scripts
├── docs/               # Documentation
├── supabase/          # Database migrations
└── types/             # TypeScript type definitions
```

## Next Steps

1. **Explore the App**
   - Browse the timeline
   - Check out group chats
   - Place some bets
   - Create posts

2. **Customize Mock Content**
   - Edit templates in `scripts/mock/templates.ts`
   - Adjust activity patterns in `scripts/mock/activity-generator.ts`
   - Add new personalities

3. **Development**
   - Check out existing issues on GitHub
   - Read the contribution guidelines
   - Start building new features!

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `bun run start` | Start Expo dev server |
| `bun run ios` | Run on iOS simulator |
| `bun run android` | Run on Android emulator |
| `bun run demo:setup` | Set up complete demo environment |
| `bun run demo:reactions` | Trigger reactions to your content |
| `bun run jobs:runner` | Start background jobs |
| `bun run lint` | Run code linter |
| `bun run typecheck` | Check TypeScript types |
| `bun run test` | Run test suite |

## Getting Help

- **Documentation**: Check the `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/[YOUR-GITHUB-USERNAME]/snapbet/issues)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Expo Docs**: [docs.expo.dev](https://docs.expo.dev)

---

Happy coding! 🎉 Welcome to the Snapbet development team!