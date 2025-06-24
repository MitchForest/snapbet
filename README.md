# SnapBet

A social betting app that combines the ephemeral content style of Snapchat with sports betting picks sharing.

## Getting Started

### Prerequisites

* Node.js 18+
* Bun package manager
* iOS Simulator (for iOS development)
* Android Studio (for Android development)

### Installation

1. Clone the repository
2. Install dependencies:  
```bash
bun install
```
3. Copy the environment variables:  
```bash
cp .env.example .env
```
4. Add your Supabase credentials to `.env`:
   - `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - OAuth provider credentials (see OAuth Setup section below)

### Running the App

```bash
# Start the development server (for development builds)
bun expo start --dev-client

# Run on iOS
bun run ios

# Run on Android
bun run android

# Run linting
bun run lint

# Run type checking
bun run typecheck
```

### OAuth Setup

This app uses OAuth authentication with Google and Twitter. To set up OAuth:

1. **Development Build Required**: OAuth does not work with Expo Go. You need to create a development build:
   ```bash
   # Install EAS CLI globally
   bun install -g eas-cli
   
   # Build for iOS Simulator
   eas build --profile development-simulator --platform ios
   ```

2. **Configure OAuth Providers**:
   - Set up OAuth apps in Google Cloud Console and Twitter Developer Portal
   - Add the redirect URLs to your Supabase project
   - Add the client IDs and secrets to your `.env` file

3. **Deep Linking**: The app uses `snapbet://` URL scheme for OAuth redirects

## Project Structure

```
snapbet/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth group
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── components/            # UI components
├── hooks/                 # React hooks
├── services/              # API/Supabase
├── stores/                # Zustand stores
├── utils/                 # Helpers
├── types/                 # TypeScript
├── assets/                # Media files
├── scripts/               # Dev scripts
└── supabase/             # Supabase config

```

## Tech Stack

* **Frontend**: React Native with Expo
* **Navigation**: Expo Router
* **UI**: Tamagui
* **Backend**: Supabase
* **State Management**: Zustand
* **Language**: TypeScript

## Development

This project uses:

* ESLint for linting
* Prettier for code formatting
* TypeScript for type safety

All imports use path aliases (e.g., `@/components/Button`).

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