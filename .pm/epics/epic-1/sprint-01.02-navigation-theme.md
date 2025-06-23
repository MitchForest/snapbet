# Sprint 01.02: Navigation & Theme

## Sprint Overview

**Epic**: 01 - Foundation & Infrastructure  
**Sprint**: 01.02  
**Name**: Navigation & Theme  
**Status**: NOT STARTED  
**Estimated Duration**: 2 hours  
**Actual Duration**: -  

## Sprint Objectives

- Install and configure Tamagui for UI components
- Set up Expo Router navigation structure
- Create warm, light theme with SnapFade colors
- Implement drawer and tab navigation
- Create all placeholder screens

## Required Documentation

- **[UI/UX Design](.pm/docs/ui-ux.md)** - Complete design system, navigation patterns, component specs
- **[UI/UX Design System](.pm/docs/ui-ux.md#design-system)** - Color palette, typography, spacing
- **[Navigation Structure](.pm/docs/ui-ux.md#navigation-structure)** - App shell, header, tab bar specs

## Success Criteria

- [ ] Theme colors match warm, light design system
- [ ] Can navigate between all placeholder screens
- [ ] Drawer opens from left with profile info placeholder
- [ ] Bottom tabs show correct icons with emerald active state
- [ ] Camera button is raised with emerald background
- [ ] Header shows SnapFade logo in emerald

## Tasks

### 1. Install Tamagui
- [ ] Install core Tamagui packages:
  ```bash
  bun add @tamagui/core @tamagui/config @tamagui/animations-react-native
  bun add @tamagui/font-inter @tamagui/themes @tamagui/react-native-media-driver
  ```
- [ ] Install Expo-specific packages:
  ```bash
  bun add @tamagui/babel-plugin
  bunx expo install react-native-reanimated react-native-gesture-handler react-native-safe-area-context
  ```
- [ ] Configure babel.config.js for Tamagui
- [ ] Set up Tamagui provider in App.tsx

### 2. Create SnapFade Theme
- [ ] Create `theme/index.ts`
- [ ] **Reference [UI/UX Color Palette](.pm/docs/ui-ux.md#color-palette)** for exact color values
- [ ] Define color tokens (use exact hex values from ui-ux.md):
  ```typescript
  const colors = {
    // Primary
    emerald: '#059669',
    emeraldHover: '#047857',
    
    // Actions
    tail: '#3B82F6',
    tailHover: '#2563EB',
    fade: '#FB923C',
    fadeHover: '#F97316',
    
    // ... etc from ui-ux.md
  }
  ```
- [ ] Configure spacing scale per [UI/UX Spacing System](.pm/docs/ui-ux.md#spacing-system)
- [ ] Set up typography per [UI/UX Typography](.pm/docs/ui-ux.md#typography)
- [ ] Create component variants per [UI/UX Component Styles](.pm/docs/ui-ux.md#component-styles)

### 3. Set Up Expo Router Structure
- [ ] Configure `app/_layout.tsx` as root layout
- [ ] Create drawer layout structure:
  ```
  app/
    _layout.tsx              # Root layout
    (drawer)/
      _layout.tsx           # Drawer layout
      (tabs)/
        _layout.tsx         # Tab layout
        index.tsx           # Feed screen
        games.tsx           # Games screen
        messages.tsx        # Messages screen
        search.tsx          # Search screen
      camera.tsx            # Camera modal
      notifications.tsx     # Notifications
      profile/[username].tsx # Profile screen
  ```
- [ ] Configure drawer to open from left
- [ ] Set up modal presentation for camera

### 4. Create Navigation Components
- [ ] **Reference [UI/UX Header Component](.pm/docs/ui-ux.md#header-component)** for exact specs
- [ ] Create `Header` component:
  - [ ] Left: Profile avatar placeholder (32x32)
  - [ ] Center: SnapFade logo (emerald)
  - [ ] Right: Notification bell with badge
  - [ ] Height: 56px with border bottom
- [ ] **Reference [UI/UX Tab Bar](.pm/docs/ui-ux.md#tab-bar)** for exact specs
- [ ] Create custom `TabBar` component:
  - [ ] 5 tabs: Feed, Games, Camera, Messages, Search
  - [ ] Raised camera button (56x56, emerald)
  - [ ] Active state: emerald color
  - [ ] Inactive: gray (#6B7280)
- [ ] **Reference [UI/UX Profile Drawer](.pm/docs/ui-ux.md#profile-drawer-left-side)** for layout
- [ ] Create `DrawerContent` component:
  - [ ] Profile section at top
  - [ ] Menu items with icons
  - [ ] Bankroll display placeholder
  - [ ] Sign out at bottom

### 5. Create Placeholder Screens
- [ ] Feed screen with "Feed coming soon"
- [ ] Games screen with "Games coming soon"
- [ ] Messages screen with "Messages coming soon"
- [ ] Search screen with "Search coming soon"
- [ ] Camera modal with close button
- [ ] Notifications screen
- [ ] Profile screen with username param

### 6. Implement Navigation Logic
- [ ] Configure deep linking for profiles
- [ ] Set up tab press handlers
- [ ] Camera button opens modal
- [ ] Profile avatar opens drawer
- [ ] Back navigation from screens

### 7. Add Visual Polish
- [ ] Add screen transitions (300ms)
- [ ] Configure safe area handling
- [ ] Add loading states
- [ ] Test on different screen sizes
- [ ] Ensure 60fps animations
- [ ] Verify tab bar looks good on both iOS and Android
- [ ] Test safe area handling on devices with notches
- [ ] Check drawer animation smoothness on both platforms

### 8. Create Stories Bar Placeholder
- [ ] Create `StoriesBar` component
- [ ] Horizontal scroll with circles
- [ ] "Your Story" with + icon first
- [ ] Placeholder story items
- [ ] Place at top of feed screen

## Technical Decisions

### Navigation Structure
- Using Expo Router v3 for file-based routing
- Drawer wraps tabs for proper hierarchy
- Camera as modal for overlay effect
- Deep linking enabled for profiles

### Component Architecture
```typescript
// Reusable components in components/
components/
  ui/
    Header.tsx
    TabBar.tsx
    DrawerContent.tsx
    StoriesBar.tsx
  common/
    Avatar.tsx
    Button.tsx
    Card.tsx
```

### Theme Provider Setup
```typescript
// App.tsx
import { TamaguiProvider } from 'tamagui'
import { theme } from './theme'

export default function App() {
  return (
    <TamaguiProvider config={theme}>
      <Slot />
    </TamaguiProvider>
  )
}
```

## Known Issues & Blockers

- None identified yet

## Notes

- Using system fonts for native feel
- All monetary values will display with $ prefix
- Raised camera button needs custom tab bar
- Drawer width should be 80% of screen

## Handoff to Reviewer

**Status**: NOT STARTED

### What Was Implemented
[To be completed at sprint end]

### Files Modified/Created
[To be completed at sprint end]

### Key Decisions Made
[To be completed at sprint end]

### Testing Performed
[To be completed at sprint end]

---

*Sprint Started: -*  
*Sprint Completed: -* 