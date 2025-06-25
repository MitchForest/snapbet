# Sprint 03.04: Content Composition Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: 03 - Camera & Content Creation

**Sprint Goal**: Complete the content creation flow with caption input, sharing options, and database integration to enable users to create posts and stories.

**User Story Contribution**: 
- Completes Story 1: Social Pick Sharing - users can share content
- Enables Story 3: Ephemeral Content - posts have expiration times

## Sprint Plan

### Objectives
1. Add caption input to media preview
2. Implement post/story destination selection
3. Create database records for posts/stories
4. Show expiration information
5. Add success feedback and navigation

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/creation/CaptionInput.tsx` | Caption input with character counter | NOT STARTED |
| `components/creation/ShareDestination.tsx` | Post/Story toggle selector | NOT STARTED |
| `components/creation/ExpirationInfo.tsx` | Display when content expires | NOT STARTED |
| `services/content/postService.ts` | Create posts in database | NOT STARTED |
| `services/content/storyService.ts` | Create stories in database | NOT STARTED |
| `supabase/migrations/010_content_fields.sql` | Add missing post fields | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/camera/MediaPreview.tsx` | Add caption and destination UI | NOT STARTED |
| `app/(drawer)/camera.tsx` | Create DB records on share | NOT STARTED |
| `types/database.ts` | Add post type definitions | NOT STARTED |
| `hooks/useCamera.ts` | Track selected effect in media | NOT STARTED |

### Implementation Approach

**Phase 1: Database Migration**
```sql
-- Add missing fields to posts table
ALTER TABLE posts 
ADD COLUMN post_type TEXT NOT NULL DEFAULT 'content' 
  CHECK (post_type IN ('content', 'pick', 'outcome')),
ADD COLUMN effect_id TEXT,
ADD COLUMN comment_count INTEGER DEFAULT 0 CHECK (comment_count >= 0),
ADD COLUMN settled_bet_id UUID REFERENCES bets(id);

-- Add story content type
ALTER TABLE stories
ADD COLUMN story_content_type TEXT DEFAULT 'content'
  CHECK (story_content_type IN ('content', 'pick', 'outcome'));

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 280),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
```

**Phase 2: Caption Input Component**
```typescript
interface CaptionInputProps {
  value: string;
  onChange: (text: string) => void;
  maxLength?: number;
}

// Features:
// - 280 character limit
// - Character counter (shows when > 200 chars)
// - Emoji keyboard support
// - Auto-resize text area
// - Placeholder: "Add a caption..."
```

**Phase 3: Share Destination UI**
```typescript
interface ShareDestination {
  toFeed: boolean;
  toStory: boolean;
}

// UI Design:
// [ ] Feed    - Post disappears in 24 hours
// [ ] Story   - Visible for 24 hours at top
// 
// At least one must be selected
```

**Phase 4: Content Services**
```typescript
// postService.ts
async function createPost({
  userId: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  caption?: string;
  effectId?: string;
  postType: 'content' | 'pick' | 'outcome';
}): Promise<Post> {
  // Calculate expiration based on type
  const expiresAt = calculateExpiration(postType);
  
  // Insert into posts table
  // Return created post
}

// storyService.ts  
async function createStory({
  userId: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  caption?: string;
  effectId?: string;
  storyContentType: 'content' | 'pick' | 'outcome';
}): Promise<Story> {
  // Stories always expire in 24 hours
  // Insert into stories table
  // Return created story
}
```

**Phase 5: Expiration Display**
- Content posts: "Expires in 24 hours"
- Pick posts: "Expires at game time" (for now show 24h)
- Outcome posts: "Expires in 24 hours"
- Stories: "Story • 24h"

**Phase 6: Integration Flow**
1. User captures media with optional effect
2. MediaPreview shows with new UI sections
3. User adds caption (optional)
4. User selects destinations (feed/story)
5. On share:
   - Upload media (existing)
   - Create post record if toFeed
   - Create story record if toStory
   - Show success message
   - Navigate to feed

**Key Technical Decisions**:
- **Dual Sharing**: Allow both feed and story from same media
- **Effect Tracking**: Store effect_id for future analytics
- **Post Type**: Default to 'content' (pick/outcome in Epic 5)
- **Navigation**: Use replace to prevent back to camera

### Dependencies & Risks
**Dependencies**:
- Camera and media upload (complete)
- Database tables for posts/stories
- Supabase client setup

**Identified Risks**:
- **Double Upload**: Same media uploaded twice for post+story
  - Mitigation: Upload once, reference same URL
- **Navigation Timing**: Replace can fail if too quick
  - Mitigation: Add 100ms delay before navigation

## Implementation Log

### Day-by-Day Progress
**[Date TBD]**:
- Started: 
- Completed: 
- Blockers: 
- Decisions: 

### Reality Checks & Plan Updates
[To be filled during implementation]

### Code Quality Checks

**Linting Results**:
- [ ] Initial run: 
- [ ] Final run: 0 errors, 0 warnings

**Type Checking Results**:
- [ ] Initial run: 
- [ ] Final run: 0 errors

**Build Results**:
- [ ] Development build passes
- [ ] Production build passes

## Key Code Additions

### Updated MediaPreview Structure
```typescript
<KeyboardAvoidingView>
  {/* Existing media display */}
  
  {/* New: Caption Input */}
  <CaptionInput 
    value={caption}
    onChange={setCaption}
    maxLength={280}
  />
  
  {/* New: Share Destinations */}
  <ShareDestination
    toFeed={shareToFeed}
    toStory={shareToStory}
    onFeedChange={setShareToFeed}
    onStoryChange={setShareToStory}
  />
  
  {/* New: Expiration Info */}
  <ExpirationInfo postType="content" />
  
  {/* Updated Next button */}
  <Button onPress={handleShare} loading={isSharing}>
    Share
  </Button>
</KeyboardAvoidingView>
```

### Post Creation Flow
```typescript
const handleShare = async () => {
  setIsSharing(true);
  
  try {
    // Upload media (existing)
    const mediaUrl = await uploadWithRetry(media.uri, path);
    
    // Create posts/stories
    const promises = [];
    
    if (shareToFeed) {
      promises.push(postService.createPost({
        userId: user.id,
        mediaUrl,
        mediaType: media.type,
        caption,
        effectId: media.effectId,
        postType: 'content'
      }));
    }
    
    if (shareToStory) {
      promises.push(storyService.createStory({
        userId: user.id,
        mediaUrl,
        mediaType: media.type,
        caption,
        effectId: media.effectId,
        storyContentType: 'content'
      }));
    }
    
    await Promise.all(promises);
    
    // Success!
    Alert.alert('Success!', 'Your content has been shared.');
    
    // Navigate after delay
    setTimeout(() => {
      router.replace('/(drawer)/(tabs)/');
    }, 100);
    
  } catch (error) {
    Alert.alert('Error', 'Failed to share. Please try again.');
  } finally {
    setIsSharing(false);
  }
};
```

## Testing Performed

### Manual Testing
- [ ] Caption input works with emoji
- [ ] Character counter appears correctly
- [ ] Can select feed, story, or both
- [ ] Posts created in database
- [ ] Stories created in database
- [ ] Success message shows
- [ ] Navigation works properly

### Edge Cases Considered
- No caption (should work)
- Very long caption (limited to 280)
- No destination selected (show error)
- Upload fails (show error)
- Database insert fails (show error)

## Documentation Updates

- [ ] Document post creation flow
- [ ] Add content service API docs
- [ ] Update type definitions
- [ ] Document expiration rules

## Handoff to Reviewer

### What Will Be Implemented
- Complete content composition UI in MediaPreview
- Caption input with character limit
- Feed/Story destination selection
- Database integration for posts and stories
- Proper expiration times
- Success feedback and navigation

### Success Criteria
- Users can add captions to media
- Users can share to feed, story, or both
- Posts/stories appear in database
- Expiration times are correct
- Smooth navigation after sharing

### Testing Instructions
1. Capture a photo/video
2. Add a caption with emojis
3. Select feed and/or story
4. Tap share
5. Verify records in database
6. Check navigation to feed

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [TBD]

### Review Checklist
- [ ] Caption input UX is smooth
- [ ] Database integration correct
- [ ] Error handling comprehensive
- [ ] Navigation timing proper
- [ ] Type safety maintained

### Review Outcome

**Status**: [TBD]

---

*Sprint Created: 2025-01-20*  
*Sprint Started: [TBD]*  
*Sprint Completed: [TBD]* 