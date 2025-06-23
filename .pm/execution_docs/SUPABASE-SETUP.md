# Supabase Setup Instructions

## Prerequisites

- Supabase account (free tier is fine)
- Project .env file configured with Supabase credentials

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New project"
3. Fill in:
   - Project name: `snapfade`
   - Database password: (save this securely)
   - Region: Choose closest to your users
4. Click "Create new project"
5. Wait for project to initialize (~2 minutes)

## Step 2: Get API Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy these values to your `.env` file:
   - `EXPO_PUBLIC_SUPABASE_URL`: Your project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your anon/public key

## Step 3: Run Database Migration

1. In Supabase dashboard, go to SQL Editor
2. Click "New query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

## Step 4: Verify Tables Created

1. Go to Table Editor in Supabase dashboard
2. You should see all these tables:
   - users
   - bankrolls
   - games
   - bets
   - posts
   - stories
   - reactions
   - story_views
   - follows
   - pick_actions
   - chats
   - chat_members
   - messages
   - message_reads
   - notifications

## Step 5: Configure Storage Buckets

1. Go to Storage in Supabase dashboard
2. Create new bucket: `avatars`
   - Public bucket: Yes
   - File size limit: 5MB
   - Allowed MIME types: image/*
3. Create new bucket: `posts`
   - Public bucket: No (authenticated read)
   - File size limit: 50MB
   - Allowed MIME types: image/*, video/*
4. Create new bucket: `stories`
   - Public bucket: No (authenticated read)
   - File size limit: 50MB
   - Allowed MIME types: image/*, video/*

## Step 6: Set Storage Policies

For each bucket, add these policies:

### Avatars Bucket
- **SELECT**: Everyone can view avatars
  ```sql
  true
  ```
- **INSERT**: Authenticated users can upload their avatar
  ```sql
  auth.uid()::text = (storage.foldername(name))[1]
  ```
- **UPDATE**: Users can update their own avatar
  ```sql
  auth.uid()::text = (storage.foldername(name))[1]
  ```

### Posts Bucket
- **SELECT**: Authenticated users can view posts
  ```sql
  auth.role() = 'authenticated'
  ```
- **INSERT**: Users can upload to their folder
  ```sql
  auth.uid()::text = (storage.foldername(name))[1]
  ```

### Stories Bucket
- **SELECT**: Authenticated users can view stories
  ```sql
  auth.role() = 'authenticated'
  ```
- **INSERT**: Users can upload to their folder
  ```sql
  auth.uid()::text = (storage.foldername(name))[1]
  ```

## Step 7: Run Seed Data

1. In SQL Editor, create new query
2. Copy contents of `supabase/seed.sql`
3. Run the query
4. This creates:
   - System user for testing
   - Sample NBA and NFL games

## Step 8: Test Connection

Run the connection test script:

```bash
bun run test:connection
```

You should see:
- ✅ Connected to Supabase successfully!
- ✅ All tables listed as OK

## Step 9: Generate TypeScript Types

Install Supabase CLI if not already installed:
```bash
npm install -g supabase
```

Login to Supabase:
```bash
supabase login
```

Generate types:
```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

Replace `YOUR_PROJECT_ID` with your actual project ID from the dashboard URL.

## Step 10: Verify RLS Policies

1. In SQL Editor, run:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```
2. All tables should show `rowsecurity = true`

## Troubleshooting

### Connection Test Fails
- Check your .env file has correct values
- Ensure project is fully initialized in Supabase
- Check if RLS is blocking queries (try disabling temporarily for testing)

### Migration Errors
- Check for typos in SQL
- Ensure you're running in correct project
- Look for specific error messages in Supabase logs

### Type Generation Fails
- Ensure you're logged into Supabase CLI
- Check project ID is correct
- Make sure all migrations have been run

## Next Steps

1. Test RLS policies using guide in `docs/RLS-TESTING.md`
2. Create mock users (Sprint 01.03)
3. Set up authentication (Epic 2)

## Useful Supabase Dashboard Links

- SQL Editor: For running queries
- Table Editor: For viewing/editing data
- Authentication: For managing users
- Storage: For file management
- Logs: For debugging issues 