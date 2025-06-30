# Camera Effects Implementation Guide

## Overview

This document outlines the implementation strategy for camera effects in SnapBet, moving from the current ViewShot approach to a more reliable overlay-based system that works for both photos and videos.

## Current Problem

The current implementation attempts to use `react-native-view-shot` to capture the camera view with effects composited together. This fails because:
- Camera feeds render in a native layer that ViewShot cannot access
- Results in blank white images with only the effect visible
- Doesn't support video recording with effects

## Proposed Solution

Implement an **overlay-based effect system** where:
1. Media is captured cleanly without effects
2. Effect ID is stored as metadata
3. Effects are rendered as overlays during display
4. Same pattern works for both photos and videos

## Implementation Details

### 1. Camera Capture Changes

**File: `components/camera/CameraView.tsx`**

Remove ViewShot and simplify capture:

```typescript
const handleCapture = async () => {
  if (isCapturing || isPreviewMode) return;

  setIsCapturing(true);
  try {
    if (mode === 'video') {
      if (isRecording) {
        stopRecording();
      } else {
        await startRecording();
      }
    } else {
      // Always use camera capture, never ViewShot
      await capturePhoto();
    }
  } catch (error) {
    console.error('Capture error:', error);
    Alert.alert('Error', 'Failed to capture media');
  } finally {
    setIsCapturing(false);
  }
};
```

The captured media already includes effectId:
```typescript
// In useCamera hook effect
React.useEffect(() => {
  if (capturedMedia) {
    onCapture({ ...capturedMedia, effectId: selectedEffectId });
  }
}, [capturedMedia, selectedEffectId, onCapture]);
```

### 2. Media Preview Updates

**File: `components/camera/MediaPreview.tsx`**

Display effects as overlay on preview:

```typescript
import { EmojiEffectsManager } from '../effects/EmojiEffectsManager';
import { getEffectById } from '../effects/constants/allEffects';

export function MediaPreview({ media, onRetake, onConfirm }: MediaPreviewProps) {
  const effect = media.effectId ? getEffectById(media.effectId) : null;

  return (
    <View style={styles.container}>
      {/* Base media */}
      {media.type === 'video' ? (
        <Video source={{ uri: media.uri }} style={styles.media} />
      ) : (
        <Image source={{ uri: media.uri }} style={styles.media} />
      )}
      
      {/* Effect overlay */}
      {effect && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <EmojiEffectsManager 
            effect={effect} 
            isActive={true} 
            performanceTier="high" 
          />
        </View>
      )}
      
      {/* Controls */}
      <MediaControls onRetake={onRetake} onConfirm={onConfirm} />
    </View>
  );
}
```

### 3. Post Creation Flow

**File: `app/(drawer)/camera/index.tsx`**

Ensure effect ID flows through post creation:

```typescript
const handleMediaConfirm = async (finalMedia: CapturedMedia) => {
  // Create post with effect metadata
  const post = await postService.createPost({
    media_url: uploadedUrl,
    media_type: finalMedia.type,
    effect_id: finalMedia.effectId, // Store in database
    caption: caption,
    // ... other fields
  });
};
```

### 4. Database Schema Update

**File: `supabase/migrations/038_add_effect_id_to_posts.sql`**

```sql
-- Add effect_id to posts and stories
ALTER TABLE posts 
ADD COLUMN effect_id TEXT;

ALTER TABLE stories 
ADD COLUMN effect_id TEXT;

-- Add index for analytics
CREATE INDEX idx_posts_effect_id ON posts(effect_id) 
WHERE effect_id IS NOT NULL;
```

### 5. Feed Display

**File: `components/content/PostCard.tsx`**

Render effects on posts in feed:

```typescript
export function PostCard({ post }: PostCardProps) {
  const effect = post.effect_id ? getEffectById(post.effect_id) : null;

  return (
    <Card>
      <View style={styles.mediaContainer}>
        {/* Media content */}
        {post.media_type === 'video' ? (
          <Video source={{ uri: post.media_url }} />
        ) : (
          <Image source={{ uri: post.media_url }} />
        )}
        
        {/* Effect overlay if exists */}
        {effect && (
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <EmojiEffectsManager 
              effect={effect} 
              isActive={true} 
              performanceTier="low" // Lower for feed performance
            />
          </View>
        )}
      </View>
      
      {/* Rest of post UI */}
    </Card>
  );
}
```

### 6. Story Display

**File: `app/(drawer)/story/[id].tsx`**

Similar pattern for stories:

```typescript
{story.effect_id && (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <EmojiEffectsManager 
      effect={getEffectById(story.effect_id)} 
      isActive={true} 
      performanceTier="high" 
    />
  </View>
)}
```

## Video Support

For videos with effects:

1. **Recording**: Record clean video, store effect ID
2. **Playback**: Overlay effect during playback
3. **Performance**: Effects automatically pause/resume with video

```typescript
// In Video component wrapper
const [isPlaying, setIsPlaying] = useState(true);

<Video 
  source={{ uri: media.uri }}
  onPlaybackStatusUpdate={(status) => {
    setIsPlaying(status.isPlaying);
  }}
/>

{effect && (
  <EmojiEffectsManager 
    effect={effect} 
    isActive={isPlaying} // Sync with video playback
  />
)}
```

## Benefits

1. **Reliability**: No more blank captures, camera always works
2. **Flexibility**: Effects can be changed or removed later
3. **Performance**: No heavy image processing during capture
4. **Consistency**: Same approach for photos and videos
5. **Future-proof**: Can add server-side compositing later

## Migration Strategy

1. **Phase 1**: Implement overlay system (1-2 hours)
   - Update CameraView to remove ViewShot
   - Update MediaPreview to show overlays
   - Test capture flow

2. **Phase 2**: Update display components (1-2 hours)
   - Update PostCard
   - Update Story viewer
   - Add effect_id to database

3. **Phase 3**: Handle existing content (30 min)
   - Existing posts without effect_id work normally
   - New posts use the overlay system

## Performance Considerations

- Use `performanceTier` prop on EmojiEffectsManager:
  - `"high"` for camera and full-screen views
  - `"medium"` for preview screens
  - `"low"` for feed where multiple posts visible

- Effects automatically optimize based on device capabilities
- Consider disabling effects in feed if performance issues

## Testing Checklist

- [ ] Photo capture with effects shows correctly in preview
- [ ] Video recording with effects works
- [ ] Effects display in feed
- [ ] Effects display in story viewer
- [ ] Performance acceptable on older devices
- [ ] Existing posts without effects still work
- [ ] Effect preview mode still functions

## Future Enhancements

1. **Server-side compositing**: Process and save effects permanently
2. **Effect variations**: Different effect styles based on context
3. **Video filters**: Real-time video filters during recording
4. **Effect analytics**: Track popular effects usage

## Known Issues & Fixes

### Issue 1: Post Creation Success But Not Visible

**Symptom**: Toast shows "post successfully created" but post doesn't appear on profile

**Potential Causes**:
- Navigation happens too quickly (100ms delay) before post is fully created
- Local cache not updating after post creation
- Post might be created but feed not refreshing

**Investigation Steps**:
1. Check Supabase dashboard to verify if post was actually created
2. Check network tab for API response
3. Add console.log to verify `createPost` response

**Potential Fixes**:
```typescript
// In app/(drawer)/camera/index.tsx
// Increase navigation delay
setTimeout(() => {
  router.replace('/(drawer)/(tabs)/');
}, 500); // Increase from 100ms

// Or better: Wait for confirmation
const result = await createPost(postData);
if (result) {
  // Invalidate feed cache or trigger refresh
  router.replace('/(drawer)/(tabs)/');
}
```

### Issue 2: Effects Menu Blocks Camera Button

**Symptom**: When effects panel is open, camera capture button is hidden behind the menu

**Root Cause**: `EffectSelector` doesn't trigger panel close when effect is selected

**Fix**: Auto-close effects panel on selection

```typescript
// In components/camera/CameraView.tsx
// Update the EffectSelector props:
<EffectSelector
  onSelectEffect={(effectId) => {
    setSelectedEffectId(effectId);
    setEffectsPanelOpen(false); // Add this line
  }}
  currentEffectId={selectedEffectId}
  onPreviewLocked={(effect) => {
    handlePreviewLocked(effect);
    setEffectsPanelOpen(false); // Also close on preview
  }}
/>
```

### Issue 3: Video Recording Shows Only Progress Circle

**Symptom**: Pressing record for video shows loading spinner, no video captured

**Root Cause**: `recordAsync()` is a blocking call that waits for recording to complete

**Current Implementation Issue**:
```typescript
// This blocks until recording stops
const video = await cameraRef.current.recordAsync({
  maxDuration: 30,
});
```

**Solutions**:

1. **Add Recording Indicator**:
```typescript
// In CameraControls.tsx
{isRecording && (
  <View style={styles.recordingIndicator}>
    <View style={styles.recordingDot} />
    <Text style={styles.recordingText}>Recording...</Text>
  </View>
)}
```

2. **Fix Async Flow**:
```typescript
// In useCamera.ts
const startRecording = async () => {
  if (!cameraRef.current || isRecording) return;
  
  try {
    setIsRecording(true);
    
    // Don't await here - let it run in background
    cameraRef.current.recordAsync({
      maxDuration: 30,
    }).then((video) => {
      if (video) {
        setCapturedMedia({
          uri: video.uri,
          type: 'video',
          duration: 30,
        });
      }
    }).catch((error) => {
      console.error('Recording error:', error);
      setIsRecording(false);
    });
    
    // Set up auto-stop timer
    recordingTimeoutRef.current = setTimeout(() => {
      stopRecording();
    }, 30000);
    
  } catch (error) {
    console.error('Error starting recording:', error);
    setIsRecording(false);
  }
};
```

3. **Add Visual Feedback**:
```typescript
// Show recording timer
const [recordingDuration, setRecordingDuration] = useState(0);

// In startRecording
const startTime = Date.now();
recordingIntervalRef.current = setInterval(() => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  setRecordingDuration(elapsed);
}, 1000);
```

### Additional Debugging Tips

1. **Enable Expo Camera Logs**:
```typescript
// Add to camera component
console.log('Camera ready:', cameraRef.current);
console.log('Recording state:', isRecording);
```

2. **Check Permissions**:
- Verify both camera AND microphone permissions for video
- iOS requires explicit microphone permission for video recording

3. **Test on Real Device**:
- Some camera features work differently on simulator vs device
- Video recording especially needs real device testing 