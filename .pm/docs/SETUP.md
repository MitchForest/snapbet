# SnapFade Setup Guide

## Prerequisites

- Node.js 18+ or Bun runtime
- iOS Simulator (Mac) or Android Studio (for Android testing)
- Supabase account (free tier is fine)
- Git

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase (get these from your Supabase project settings)
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional for development
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## First Time Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/snapfade.git
   cd snapfade
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Set up the database**
   ```bash
   bun run db:setup
   ```

5. **Seed mock data**
   ```bash
   bun run db:seed
   ```

6. **Start the development server**
   ```bash
   bun start
   ```

## Common Commands

### Development
- `bun start` - Start Expo development server
- `bun run ios` - Open in iOS simulator
- `bun run android` - Open in Android emulator
- `bun run web` - Open in web browser

### Database
- `bun run db:setup` - Initial database setup
- `bun run db:seed` - Add mock users and data
- `bun run db:reset` - Clear and reseed database
- `bun run db:add-games` - Add games for today

### Code Quality
- `bun run lint` - Run ESLint
- `bun run typecheck` - Check TypeScript types
- `bun run format` - Format code with Prettier

### Testing
- `bun run test:connection` - Test Supabase connection
- `bun run test:rls` - Test Row Level Security policies

## Project Structure

```
snapfade/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── services/              # API and external services
│   └── supabase/         # Supabase client and helpers
├── stores/                # Zustand state management
├── types/                 # TypeScript type definitions
├── scripts/               # Development scripts
└── supabase/             # Database migrations and seeds
```

## Troubleshooting

### Supabase Connection Issues
1. Check your `.env` file has correct credentials
2. Ensure your Supabase project is active
3. Run `bun run test:connection` to debug

### Expo Issues
1. Clear cache: `expo start -c`
2. Reset Metro bundler: `watchman watch-del-all`
3. Delete node_modules and reinstall: `rm -rf node_modules && bun install`

### Database Issues
1. Check RLS policies: `bun run test:rls`
2. View Supabase logs in dashboard
3. Ensure migrations ran: Check supabase/migrations folder

### TypeScript Errors
1. Regenerate types: `bun run types:generate`
2. Restart TS server in VS Code: Cmd+Shift+P → "Restart TS Server"

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test locally**

3. **Run checks before committing**
   ```bash
   bun run lint
   bun run typecheck
   ```

4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve issue"
   git commit -m "docs: update readme"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Useful Resources

- [Expo Router Docs](https://expo.github.io/router/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tamagui Docs](https://tamagui.dev)
- [Zustand Docs](https://github.com/pmndrs/zustand)

## Notes

- All monetary values are stored in cents (integer)
- Posts and stories expire after 24 hours
- Mock users have `is_mock: true` in database
- Use path aliases for imports: `@/components/Button` 