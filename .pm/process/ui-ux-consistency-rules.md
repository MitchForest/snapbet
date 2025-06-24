# SnapBet UI/UX Consistency Rules

## Overview
This document establishes the UI/UX patterns and rules that must be followed across the entire SnapBet application to ensure consistency and maintainability.

## Component Library Rules

### 1. **Tamagui vs React Native Components**
- **Use Tamagui components** for all new UI development
- Import from `@tamagui/core`: `View`, `Text`, `Stack`, `XStack`, `YStack`
- Only use React Native components when Tamagui doesn't provide an equivalent
- Rationale: Tamagui provides better theming, performance, and consistency

### 2. **Navigation Components**

#### Screen Headers for Drawer Screens
Create a new `ScreenHeader` component specifically for drawer screens:
```tsx
// components/ui/ScreenHeader.tsx
import { View, Text } from '@tamagui/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({ title, showBack = true, rightElement }: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      backgroundColor={Colors.background}
      paddingTop={insets.top}
      borderBottomWidth={1}
      borderBottomColor={Colors.border}
    >
      <XStack 
        height={56} 
        alignItems="center" 
        paddingHorizontal={16}
      >
        {showBack && (
          <TouchableOpacity onPress={() => router.back()}>
            <Text fontSize={24} color={Colors.text}>←</Text>
          </TouchableOpacity>
        )}
        <Text 
          flex={1} 
          textAlign="center" 
          fontSize={18} 
          fontWeight="600"
          color={Colors.text}
        >
          {title}
        </Text>
        {showBack && <View width={24} />}
        {rightElement}
      </XStack>
    </View>
  );
}
```

### 3. **Navigation Patterns**
- **Always use `router` from expo-router** for navigation
- Use `router.back()` for back navigation
- Use `router.push()` for forward navigation
- Use `router.replace()` for replacing current screen
- Rationale: Expo Router is the primary navigation system

### 4. **Safe Area Handling**
- **Use `useSafeAreaInsets()` hook** with manual padding
- Apply safe area padding to the outermost container
- Don't use `SafeAreaView` component (causes nesting issues)
- Example:
```tsx
const insets = useSafeAreaInsets();
<View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
```

### 5. **Color System**
- **Always use the `Colors` constant** from `@/theme`
- Never use hardcoded color values
- Never use Tamagui tokens (like `$primary`) directly
- Example: `backgroundColor={Colors.primary}`
- Rationale: Single source of truth for colors

### 6. **Icon System**
- **Use text characters** for simple icons (←, →, ×, +, etc.)
- Use emoji for complex icons (🔔, 🏆, 🔥, etc.)
- Avoid external icon libraries unless absolutely necessary
- Rationale: Reduces bundle size, works everywhere

### 7. **Spacing & Layout**
- Standard padding: 16px
- Small padding: 8px
- Large padding: 24px
- Standard border radius: 12px
- Header height: 56px (not including safe area)
- Touch target minimum: 44px

### 8. **Typography**
- Use `Text` component from Tamagui
- Font sizes:
  - Title: 24px
  - Heading: 18px
  - Body: 16px
  - Small: 14px
  - Caption: 12px
- Font weights:
  - Regular: "400"
  - Medium: "500"
  - Semibold: "600"
  - Bold: "700"

## Specific Component Patterns

### 1. **Username Validation**
For the username input validation fix:
```tsx
// Only show "already taken" after:
// 1. User has stopped typing (debounce complete)
// 2. Availability check has run
// 3. Result is false

const [hasCheckedAvailability, setHasCheckedAvailability] = useState(false);

// In the availability check:
setHasCheckedAvailability(true);

// In the render:
{hasCheckedAvailability && !isAvailable && !validationError && value && (
  <Text color={Colors.error}>Username is already taken</Text>
)}
```

### 2. **Drawer Screen Structure**
All drawer screens should follow this pattern:
```tsx
import { View } from '@tamagui/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/theme';

export default function ScreenName() {
  const insets = useSafeAreaInsets();
  
  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader title="Screen Title" />
      <View flex={1} paddingHorizontal={16}>
        {/* Screen content */}
      </View>
      <View paddingBottom={insets.bottom} />
    </View>
  );
}
```

### 3. **Loading States**
- Use `ActivityIndicator` from React Native
- Center in container
- Use `Colors.primary` for color

### 4. **Error States**
- Use `Colors.error` for error text
- Show inline below relevant input
- Clear error when user starts typing again

## Testing Requirements

### Primary Testing
- **iOS Simulator** with iPhone 14 Pro (has notch)
- Test all gesture navigation
- Verify safe areas are respected
- Check touch targets are 44px minimum

### Secondary Testing
- Android testing can be deferred
- Focus on iOS first (primary platform)

## Implementation Priority

1. Fix username validation (add `hasCheckedAvailability` state)
2. Create `ScreenHeader` component
3. Apply to all drawer screens:
   - Notifications
   - Settings (all sub-screens)
   - Profile Edit
   - Following/Followers
   - How to Play
   - Invite
4. Fix navigation error (timing issue in `_layout.tsx`)

## Enforcement

- All PRs must follow these rules
- Lint rules should enforce imports from Tamagui
- Code reviews should check for consistency
- Update this document when patterns evolve

---

*Last Updated: January 2025*
*Version: 1.0* 