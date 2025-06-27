# Mock Ecosystem Documentation

The mock ecosystem provides realistic demo content and activity for Snapbet, creating a vibrant community feel for demos and new user experiences.

## Quick Start

### One-Command Setup

To set up a complete demo environment with all content:

```bash
# Set up everything: users, posts, chats, bets, reactions
bun run demo:setup

# Or with explicit user ID to join chats
bun run demo:setup --user-id=YOUR_USER_ID
```

This single command will:
- ✅ Verify mock users exist
- ✅ Create recent posts with picks
- ✅ Generate active group chats
- ✅ Add betting activity
- ✅ Create reactions and comments
- ✅ Add you to demo chat groups

### Trigger Reactions to Your Activity

After you create posts or place bets, trigger community reactions:

```bash
# Generate reactions to your recent activity
bun run demo:reactions --user-id=YOUR_USER_ID
```

This will:
- 🔥 Add emoji reactions to your posts
- 💬 Generate comments on your content
- 👥 Create tail/fade actions on your picks
- 💭 Start chat discussions about your bets

## Architecture

### Mock Users (30 Total)

The system uses 30 pre-seeded mock users with distinct personalities:

- **Sharp Bettors** (4): Data-driven, analytical, post early morning
- **Degens** (5): High-energy, emotional, active late night
- **Fade Material** (4): Overconfident, often wrong, make bad parlays
- **Contrarians** (3): Fade public sentiment, look for value
- **Homers** (3): Bet on favorite teams, biased but passionate
- **Live Bettors** (3): Focus on in-game betting, active during games
- **Parlay Degens** (3): Love long-shot parlays, dream big

### Activity Types

1. **Posts**
   - Pick shares (betting selections with analysis)
   - Outcome posts (win/loss reactions)
   - General reactions (game commentary)

2. **Messages**
   - Group chat participation
   - Personality-based responses
   - Game discussions

3. **Reactions**
   - Emoji reactions on posts (🔥, 💯, 📊, etc.)
   - Personality-specific patterns

4. **Tail/Fade Actions**
   - Following or opposing betting picks
   - Based on personality traits

5. **Comments**
   - Engaging discussions on posts
   - Personality-driven responses

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

## Available Commands

### Setup Commands

| Command | Description |
|---------|-------------|
| `bun run demo:setup` | Complete demo environment setup |
| `bun run demo:setup --user-id=ID` | Setup + add user to chats |

### Scenario Commands

| Command | Description |
|---------|-------------|
| `bun run demo:new-user` | Fresh user experience with recent activity |
| `bun run demo:saturday` | Saturday football betting rush |
| `bun run demo:chat` | Active chat discussions |

### Activity Commands

| Command | Description |
|---------|-------------|
| `bun run mock:activity` | Generate one hour of activity |
| `bun run demo:reactions --user-id=ID` | Trigger reactions to user's content |
| `bun run jobs:runner` | Start hourly activity generation |

## Demo Scenarios

### New User Experience
Creates a welcoming environment for new users:
- 5 recent posts with picks
- Active "NBA Degens 🏀" chat
- Fresh content from last hour

### Saturday Football
Simulates pre-game betting excitement:
- 10 users placing NFL bets
- 5 pick posts being shared
- "Saturday Squad 🏈" group discussion
- Betting rush atmosphere

### Active Chat
Focuses on live chat engagement:
- 20 recent messages
- Multiple personalities discussing
- Real-time feel

## Hourly Activity Job

The mock activity job runs every hour (except 2-6 AM) and generates:
- 30% activity chance per active user
- Personality-based activity patterns
- Natural time-of-day variations

### Activity Schedule

```
Morning (6 AM - 12 PM): Sharp bettors active, analytical posts
Afternoon (12 PM - 6 PM): Mixed activity, general discussions  
Evening (6 PM - 12 AM): Degens active, emotional reactions
Late Night (12 AM - 2 AM): Parlay degens, wild bets
```

## Integration Tips

### Adding Users to Chats

The setup script automatically adds the current user to demo chats:
- NBA Degens 🏀
- Saturday Squad 🏈  
- Degen Support Group 🫂

### Customizing Activity

Edit activity patterns in `scripts/mock/activity-generator.ts`:

```typescript
const activityPatterns = {
  'sharp-bettor': {
    morning: { post: 0.3, message: 0.2, reaction: 0.2, tailFade: 0.2, comment: 0.1 },
    // Adjust weights to change behavior
  }
}
```

### Adding New Templates

Add templates in `scripts/mock/templates.ts`:

```typescript
export const messageTemplates = {
  'new-personality': {
    greeting: ["Your templates here"],
    reaction: ["Reaction templates"],
    discussion: ["Discussion starters"]
  }
}
```

## Troubleshooting

### No Mock Users Found
```bash
# Seed mock users first
bun run scripts/seed-mock-users.ts
```

### User Not Added to Chats
```bash
# Run with explicit user ID
bun run demo:setup --user-id=YOUR_SUPABASE_USER_ID
```

### React Native Errors
The scripts may show React Native errors when run directly. Use the npm/bun scripts in package.json instead of running files directly.

## Best Practices

1. **Run setup once** - Creates a good baseline of content
2. **Use reactions trigger** - After creating your own content
3. **Let hourly job run** - For ongoing natural activity
4. **Vary scenarios** - Mix different demo types for variety

## Technical Details

### Database Tables Used
- `users` - Mock user accounts
- `posts` - Content and pick shares
- `messages` - Chat messages
- `chats` - Group chat rooms
- `chat_members` - Chat membership
- `bets` - Betting activity
- `pick_actions` - Tail/fade relationships
- `comments` - Post comments
- `reactions` - Emoji reactions

### Performance Considerations
- Batched operations where possible
- Respects Supabase rate limits
- Efficient queries with proper indexes
- Cleanup of old activity built-in

## Future Enhancements

Potential improvements for later:
- Real-time WebSocket activity
- AI-powered conversations
- Sport-specific content
- Live game simulations
- Trending topics system