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
bun install
3. Copy the environment variables:  
cp .env.example .env
4. Add your Supabase credentials to `.env`

### Running the App

# Start the development server
bun run start

# Run on iOS
bun run ios

# Run on Android
bun run android

# Run linting
bun run lint

# Run type checking
bun run typecheck

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