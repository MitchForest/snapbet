# SnapFade

A social betting app that combines the ephemeral content style of Snapchat with sports betting picks sharing.

## Getting Started

### Prerequisites

- Node.js 18+
- Bun package manager
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

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

4. Add your Supabase credentials to `.env`

### Running the App

```bash
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
```

## Project Structure

```
snapfade/
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

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **UI**: Tamagui
- **Backend**: Supabase
- **State Management**: Zustand
- **Language**: TypeScript

## Development

This project uses:
- ESLint for linting
- Prettier for code formatting
- TypeScript for type safety

All imports use path aliases (e.g., `@/components/Button`). 