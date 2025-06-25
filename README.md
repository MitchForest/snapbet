# SnapBet

A social betting app that combines the ephemeral content style of Snapchat with sports betting picks sharing.

## Quick Start

### Prerequisites

- Node.js 18+
- Bun package manager
- Xcode (for iOS) or Android Studio (for Android)

### Setup & Run

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/snapbet.git
cd snapbet

# 2. Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# 3. Install dependencies
bun install

# 4. Set up environment variables
echo "EXPO_PUBLIC_SUPABASE_URL=https://dummy.supabase.co" > .env
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=dummy_key" >> .env

# 5. Run in simulator
bun run ios    # For iOS Simulator
# OR
bun run android  # For Android Emulator
```

### First Time Setup

**iOS**: Make sure Xcode is installed with iOS Simulator
- If simulator not found: Xcode → Settings → Platforms → Download iOS Simulator

**Android**: Make sure Android Studio is installed with an AVD
- If emulator not found: Android Studio → AVD Manager → Create Virtual Device

### Troubleshooting

```bash
# Clear cache if you encounter issues
bun expo start -c

# Check for TypeScript errors
bun run typecheck

# Run linter
bun run lint
```

## Development

### Project Structure

```
snapbet/
├── app/          # Expo Router screens
├── components/   # UI components
├── hooks/        # React hooks
├── services/     # API/Supabase
├── stores/       # Zustand stores
├── types/        # TypeScript
└── supabase/     # Database migrations
```

### Available Scripts

```bash
bun start         # Start Expo dev server
bun run ios       # Run on iOS Simulator
bun run android   # Run on Android Emulator
bun run lint      # Run ESLint
bun run typecheck # Run TypeScript checks
```

### Tech Stack

- **Frontend**: React Native with Expo
- **UI**: Tamagui
- **Backend**: Supabase
- **State**: Zustand
- **Language**: TypeScript

## Notes

- OAuth authentication requires a development build (not Expo Go)
- The app uses `snapbet://` URL scheme for deep linking
- Mock data is included for testing without a real Supabase instance

## About

 No description, website, or topics provided.

### Resources

 Readme 

###  Uh oh!

There was an error while loading. Please reload this page.

Activity 

### Stars

**0** stars 

### Watchers

**0** watching 

### Forks

**0** forks 

 Report repository 

## Releases

No releases published

## Packages0

 No packages published   

## Languages

* TypeScript 80.0%
* PLpgSQL 18.7%
* JavaScript 1.3%

## Footer

 © 2025 GitHub, Inc. 

### Footer navigation

* Terms
* Privacy
* Security
* Status
* Docs
* Contact
* Manage cookies
* Do not share my personal information

 You can't perform that action at this time. 