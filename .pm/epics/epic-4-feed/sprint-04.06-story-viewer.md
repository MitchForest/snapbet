# Sprint 04.06: Story Viewer Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 4 - Feed & Social Engagement

**Sprint Goal**: Build a full-screen immersive story viewing experience with progress bars, gesture controls, view tracking, and seamless navigation between stories.

**User Story Contribution**: 
- Enables Story 1: Social Pick Sharing - Complete story viewing experience
- Enables Story 3: Ephemeral Content - Stories with 24-hour expiration and view tracking

## Sprint Plan

### Objectives
1. Create full-screen story viewer screen
2. Implement progress bars with auto-advance
3. Add gesture controls (tap, swipe, long press)
4. Track story views and show view count
5. Add reply functionality (creates DM in Epic 7)
6. Implement story reactions
7. Handle story expiration gracefully
8. Add mute user's stories option

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `app/(drawer)/story/[id].tsx` | Full-screen story viewer screen | NOT STARTED |
| `hooks/useStoryViewer.ts` | Story viewer state and controls | NOT STARTED |
| `components/story/StoryProgressBar.tsx` | Animated progress bars | NOT STARTED |
| `components/story/StoryControls.tsx` | Overlay controls for story | NOT STARTED |
| `components/story/StoryViewerGestures.tsx` | Gesture handler wrapper | NOT STARTED |
| `services/story/storyViewService.ts` | View tracking and story fetching | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/content/StoryBar.tsx` | Navigate to story viewer on tap | NOT STARTED |
| `components/content/StoryCircle.tsx` | Show viewed/unviewed state | NOT STARTED |
| `hooks/useStories.ts` | Add view tracking logic | NOT STARTED |

### Implementation Approach

1. **Story Viewer Layout**:
   ```
   StoryViewer
   ├── StatusBar (hidden)
   ├── ProgressBars (top)
   ├── UserHeader
   │   ├── Avatar + Username
   │   ├── Time ago
   │   └── Close button
   ├── MediaDisplay (full screen)
   │   ├── Image/Video
   │   └── Caption overlay
   └── Footer Controls
       ├── Reply input (placeholder)
       ├── Reaction button
       └── More options (...)
   ```

2. **Progress Bar Logic**:
   - 5-second timer per story
   - Pause on long press
   - Resume on release
   - Smooth animation
   - Multiple bars for multiple stories

3. **Gesture Controls**:
   - Tap right: Next story/user
   - Tap left: Previous story/user
   - Swipe down: Dismiss viewer
   - Long press: Pause
   - Swipe up: Reply (future)

4. **View Tracking**:
   - Track view after 1 second
   - Show view count to story owner
   - Mark as viewed in story bar
   - Real-time view count updates

**Key Technical Decisions**:
- Use react-native-gesture-handler for smooth gestures
- Preload next story for seamless transition
- Track views server-side to prevent duplicates
- Cache viewed stories locally for instant UI updates

### Dependencies & Risks
**Dependencies**:
- Story creation from Epic 3
- Gesture handler library
- Video player for video stories
- Navigation from story bar

**Identified Risks**:
- Video loading performance
- Gesture conflicts with system gestures
- Memory usage with multiple media files
- Ensuring smooth transitions

## Implementation Log

### Day-by-Day Progress
**[Date]**:
- Started: [What was begun]
- Completed: [What was finished]
- Blockers: [Any issues]
- Decisions: [Any changes to plan]

### Reality Checks & Plan Updates

**Reality Check 1** - [Date]
- Issue: [What wasn't working]
- Options Considered:
  1. [Option 1] - Pros/Cons
  2. [Option 2] - Pros/Cons
- Decision: [What was chosen]
- Plan Update: [How sprint plan changed]
- Epic Impact: [Any epic updates needed]

### Code Quality Checks

**Linting Results**:
- [ ] Initial run: [X errors, Y warnings]
- [ ] Final run: [Should be 0 errors]

**Type Checking Results**:
- [ ] Initial run: [X errors]
- [ ] Final run: [Should be 0 errors]

**Build Results**:
- [ ] Development build passes
- [ ] Production build passes

## Key Code Additions

### New Functions/Components
```typescript
// hooks/useStoryViewer.ts
export function useStoryViewer(initialStoryId: string) {
  // Purpose: Manage story viewer state and navigation
  // Returns: { currentStory, progress, next, previous, pause, resume }
}

// components/story/StoryProgressBar.tsx
interface StoryProgressBarProps {
  stories: Story[];
  currentIndex: number;
  progress: number;
}

// services/story/storyViewService.ts
export async function trackStoryView(storyId: string) {
  // Purpose: Track that user viewed a story
  // Returns: { success: boolean }
}

export async function getStoriesForUser(userId: string) {
  // Purpose: Get all active stories for a user
  // Returns: Story[]
}
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| POST | /stories/:id/views | - | `{ success: boolean }` | PLANNED |
| GET | /stories/user/:userId | - | `{ stories: Story[] }` | PLANNED |
| GET | /stories/:id/viewers | - | `{ viewers: User[] }` | PLANNED |

### State Management
- Current story and progress in useStoryViewer
- Viewed stories cached in MMKV
- Preload adjacent stories
- Clean up on unmount

## Testing Performed

### Manual Testing
- [ ] Stories open in full screen
- [ ] Progress bars animate smoothly
- [ ] Auto-advance after 5 seconds
- [ ] Tap navigation works correctly
- [ ] Swipe down dismisses viewer
- [ ] Long press pauses progress
- [ ] Views track correctly
- [ ] Expired stories handled gracefully

### Edge Cases Considered
- Single story from user: No next/previous
- Story expires while viewing: Show expiration message
- Network failure: Show cached story if available
- Video loading slowly: Show loading state
- Rapid navigation: Cancel previous loads

## Documentation Updates

- [ ] Gesture controls documented
- [ ] View tracking logic documented
- [ ] Story viewer navigation flow documented
- [ ] Progress bar timing documented

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created
**Created**:
- `[file1.ts]` - [Purpose]

**Modified**:
- `[file3.ts]` - [What changed and why]

### Key Decisions Made
1. [Decision]: [Rationale and impact]

### Deviations from Original Plan
- [Deviation 1]: [Why it was necessary]

### Known Issues/Concerns
- [Any issues the reviewer should know about]

### Suggested Review Focus
- Gesture handler performance
- Memory management with media
- View tracking accuracy

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: R persona  
**Review Date**: TBD

### Review Checklist
- [ ] Code matches sprint objectives
- [ ] All planned files created/modified
- [ ] Follows established patterns
- [ ] No unauthorized scope additions
- [ ] Code is clean and maintainable
- [ ] No obvious bugs or issues
- [ ] Integrates properly with existing code

### Review Outcome

**Status**: PENDING

### Feedback
[Review feedback will go here]

---

## Sprint Metrics

**Duration**: Planned 1.5 hours | Actual TBD  
**Scope Changes**: 0  
**Review Cycles**: 0  
**Files Touched**: TBD  
**Lines Added**: TBD  
**Lines Removed**: TBD

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: TBD*  
*Sprint Completed: TBD*  
*Final Status: NOT STARTED* 