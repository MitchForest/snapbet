# Mock Ecosystem Documentation

The mock ecosystem provides realistic demo content and activity for Snapbet, creating a vibrant community feel for demos and new user experiences.

## Quick Start

### Three-Stage Mock System

The mock ecosystem now has three stages to demonstrate all features of the app:

#### 1. Setup Stage
```bash
# Set up everything with your username
bun run mock:setup --username=YOUR_USERNAME

# Example:
bun run mock:setup --username=mitchforest
```

This creates:
- ✅ 30 mock users with profile pictures (using dicebear avatars)
- ✅ Real games from odds API
- ✅ Bidirectional follow relationships
- ✅ Hot Bettors (5 users with 70%+ win rate in last 7 days)
- ✅ Fade Gods (3 users with poor records that others fade)
- ✅ Trending picks (posts with 15-25 tails in 24h)
- ✅ Rising stars (new users with good performance)
- ✅ Stories, posts, chats, and notifications
- ✅ Populated explore/search sections

#### 2. Progress Stage
```bash
# Simulate time passing and activity
bun run mock:progress
```

This simulates progression:
- ✅ Settles games that started 3+ hours ago
- ✅ Updates user bankrolls based on bet outcomes
- ✅ Creates outcome posts (celebrations/commiserations)
- ✅ Adds new games and bets
- ✅ Generates more tails/fades on recent picks
- ✅ New followers for the user
- ✅ Fresh messages in chats
- ✅ Continued activity to keep app feeling alive

#### 3. Cleanup Stage
```bash
# Remove all mock data to start fresh
bun run mock:cleanup
```

This removes everything except mock users (for quick re-setup).

## Architecture

### Mock Scripts Organization

```
scripts/mock/
├── data/                 # Mock data definitions
│   ├── users.ts         # 30 mock users with personalities
│   └── games.ts         # Game generation logic
├── generators/          # Individual content generators
│   ├── users.ts        # Seeds mock users with avatars
│   └── ...             # Other generators
├── orchestrators/       # High-level workflow scripts
│   ├── setup.ts        # Complete environment setup
│   ├── settle.ts       # Game settlement & activity
│   └── cleanup.ts      # Remove all mock data
└── templates.ts         # Content templates
```

### Mock Users (30 Total)

Each mock user has:
- **Profile Picture**: Consistent avatar from dicebear API
- **Personality**: Defines behavior patterns
- **Bio**: Personality-appropriate description
- **Bankroll**: Starting balance based on betting style

The system uses 30 pre-defined mock users with distinct personalities:

- **Sharp Bettors** (4): Data-driven, analytical, post early morning
- **Degens** (5): High-energy, emotional, active late night
- **Fade Material** (4): Overconfident, often wrong, make bad parlays
- **Contrarians** (3): Fade public sentiment, look for value
- **Homers** (3): Bet on favorite teams, biased but passionate
- **Live Bettors** (3): Focus on in-game betting, active during games
- **Parlay Degens** (3): Love long-shot parlays, dream big

### Avatar Generation

Mock users have consistent, attractive avatars generated using the dicebear API:

```typescript
const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${username}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
```

This ensures:
- Consistent avatars across app restarts
- Attractive, professional-looking profiles
- Unique avatar for each username
- No external image hosting required

### What Gets Created

The unified setup creates:

1. **Social Graph**
   - 15 mock users follow you
   - You follow 25 mock users
   - Ensures your feed is populated

2. **Stories** (15 active)
   - Mix of betting picks and general content
   - Photo and video stories
   - Recent (within last 2 hours)

3. **Posts** (20 recent)
   - 10 pick posts with associated bets
   - 10 general reaction posts
   - Each with 3-8 reactions
   - Each with 1-4 comments
   - Pick posts have 2-5 tail/fade actions

4. **Chats**
   - 3 group chats: "NBA Degens 🏀", "Saturday Squad 🏈", "Degen Support Group 🫂"
   - 5 direct message conversations
   - Recent message history in each

5. **Notifications**
   - Follow notifications
   - Reaction notifications
   - Tail/fade notifications
   - Message notifications

### Content Templates

Over 200+ template variations ensure natural-feeling content:

```typescript
// Example templates by personality
'sharp-bettor': {
  greeting: ["Line value on {team} looking good", "Early money coming in"],
  reaction: ["Called it 📊", "Numbers don't lie", "Value was there"],
  discussion: ["Check the reverse line movement", "Sharp action on the under"]
}

'degen': {
  greeting: ["WHO'S READY TO EAT?? 🍽️", "FEELING LUCKY TODAY"],
  reaction: ["LFG!!! 🚀🚀🚀", "PAIN.", "Why do I do this to myself"],
  discussion: ["Tailing whoever's hot 🔥", "Last leg prayer circle 🙏"]
}
```

## Usage

### Initial Setup

1. **Run the complete setup**:
   ```bash
   bun run mock:setup --username=YOUR_USERNAME
   ```

2. **Open the app** - You should see:
   - A populated feed with recent posts
   - Active stories at the top with profile pictures
   - Notifications waiting for you
   - Group chats with conversations
   - Direct messages from mock users

### Individual Commands

For specific tasks:

```bash
# Just seed mock users with avatars
bun run mock:users

# Add games only
bun run db:add-games

# Clean up all mock data
bun run mock:cleanup
```

### Customization

The setup can be customized by editing `scripts/mock/orchestrators/setup.ts` or the unified setup configuration.

## Troubleshooting

### Username Not Found
```bash
❌ User with username "YOUR_USERNAME" not found
```
Make sure you're using your actual username, not user ID. Check your profile in the app to confirm your username.

### No Mock Users Found
```bash
❌ No mock users found. Please run: bun run mock:users
```
The mock users should be created automatically, but you can run the seed script manually if needed.

### Environment Variables Required
The mock scripts require both environment variables in your `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key_here
```

The service key is needed for admin operations to create content across all mock users.

## Technical Details

### Database Tables Used
- `users` - Mock user accounts with avatars and follow relationships
- `bankrolls` - User bankroll information
- `follows` - Follow relationships
- `stories` - Story content
- `posts` - Content and pick shares
- `messages` - Chat messages
- `chats` - Group chat rooms
- `chat_members` - Chat membership
- `bets` - Betting activity
- `pick_actions` - Tail/fade relationships
- `comments` - Post comments
- `reactions` - Emoji reactions
- `notifications` - User notifications
- `games` - Sports games for betting

### Performance Considerations
- Batched operations where possible
- Respects Supabase rate limits
- Efficient queries with proper indexes
- Uses upsert for idempotent operations

### Scripts Architecture
The mock scripts use a separate Node.js-compatible Supabase client (`scripts/supabase-client.ts`) that avoids React Native dependencies. This allows them to run in the Node.js environment via bun without import errors.

## Key Features for Demo

The mock ecosystem ensures all app features are demonstrable:

### Explore/Search Page Sections
- **🔥 Hot Bettors**: 5 users with 70%+ win rate and 5+ bets in last 7 days
- **📈 Trending Picks**: Posts with 15-25 tails in last 24 hours
- **🎪 Fade Gods**: 3 users with poor records that others successfully fade
- **⭐ Rising Stars**: 3 new users (joined < 7 days ago) with 75%+ win rate

### Social Proof
- Posts with high engagement (reactions, comments, tails/fades)
- Active group chats with ongoing conversations
- Stories from various personality types
- Follow relationships creating a connected network

### Betting Ecosystem
- Historical bet data showing wins/losses
- Pending bets on upcoming games
- Outcome posts celebrating wins or commiserating losses
- Bankroll changes reflecting betting activity

## Best Practices

1. **Run setup once** - Creates a complete baseline of content
2. **Username required** - Always use --username parameter
3. **Run progress periodically** - Simulates time passing and activity
4. **Check all sections** - Feed, stories, chats, explore, notifications
5. **Clean up between demos** - Start fresh for each demonstration

## Troubleshooting Explore Sections

If explore sections appear empty:

1. **Check timing** - Hot bettors need bets from last 7 days
2. **Run setup fresh** - `bun run mock:cleanup` then `bun run mock:setup`
3. **Verify data** - Check that mock users have proper win/loss records
4. **Progress simulation** - Run `bun run mock:progress` to create more activity