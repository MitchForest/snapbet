# SnapFade Component Architecture Document

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Component Organization](#component-organization)
3. [Core Design System Components](#core-design-system-components)
4. [Feature Components](#feature-components)
5. [Screen Components](#screen-components)
6. [Composition Patterns](#composition-patterns)
7. [Props & Type Patterns](#props--type-patterns)
8. [Platform-Specific Components](#platform-specific-components)
9. [Performance Patterns](#performance-patterns)
10. [Component Testing Strategy](#component-testing-strategy)

## Architecture Overview

### Component Philosophy

1. **Atomic Design Principles**
   - Atoms: Basic UI elements (Button, Text, Input)
   - Molecules: Simple combinations (InputField, UserAvatar)
   - Organisms: Complex components (PostCard, BetSheet)
   - Templates: Layout components (FeedLayout, ProfileLayout)
   - Screens: Full page components

2. **Composition Over Inheritance**
   - Small, focused components
   - Compose complex UI from simple parts
   - Reusable across features

3. **Platform Awareness**
   - Shared logic, platform-specific rendering
   - Native feel on both iOS and Android

### Component Tree Structure

```
App
├── Navigation (Expo Router)
│   ├── TabNavigator
│   │   ├── FeedScreen
│   │   ├── GamesScreen
│   │   ├── CameraModal
│   │   ├── MessagesScreen
│   │   └── ExploreScreen
│   └── StackNavigator
│       ├── ProfileScreen
│       ├── ChatScreen
│       ├── NotificationsScreen
│       └── SettingsScreen
├── Providers
│   ├── ThemeProvider (Tamagui)
│   ├── QueryClientProvider (React Query)
│   ├── AuthProvider
│   └── RealtimeProvider
└── GlobalComponents
    ├── Toast
    ├── LoadingOverlay
    └── ErrorBoundary
```

## Component Organization

### Directory Structure

```
components/
├── core/                    # Design system components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.types.ts
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Text/
│   ├── Input/
│   ├── Card/
│   ├── Avatar/
│   ├── Badge/
│   └── Sheet/
├── shared/                  # Shared feature components
│   ├── UserAvatar/
│   ├── BankrollDisplay/
│   ├── OddsDisplay/
│   ├── TeamLogo/
│   ├── CountdownTimer/
│   └── EmptyState/
├── feed/                    # Feed-specific components
│   ├── PostCard/
│   ├── StoryBar/
│   ├── StoryCircle/
│   ├── TailFadeButtons/
│   ├── ReactionBar/
│   └── PostSkeleton/
├── betting/                 # Betting components
│   ├── GameCard/
│   ├── BetSlip/
│   ├── BetTypeSelector/
│   ├── StakeInput/
│   ├── OddsComparison/
│   └── BetConfirmation/
├── camera/                  # Camera components
│   ├── CameraView/
│   ├── MediaPreview/
│   ├── FilterCarousel/
│   ├── CaptionInput/
│   └── ShareOptions/
├── messaging/              # Chat components
│   ├── ChatList/
│   ├── ChatBubble/
│   ├── MessageInput/
│   ├── TypingIndicator/
│   ├── PickShareCard/
│   └── MessageReactions/
├── profile/                # Profile components
│   ├── ProfileHeader/
│   ├── StatsGrid/
│   ├── PerformanceChart/
│   ├── BadgeList/
│   └── BetHistory/
└── navigation/            # Navigation components
    ├── Header/
    ├── TabBar/
    ├── DrawerContent/
    └── BackButton/
```

## Core Design System Components

### Button Component

```typescript
// components/core/Button/Button.types.ts
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onPress: () => void;
  onLongPress?: () => void;
  haptic?: boolean;
  testID?: string;
  children: React.ReactNode;
}

// Usage
<Button
  variant="primary"
  size="large"
  icon={<TailIcon />}
  onPress={handleTail}
  haptic
>
  Tail ({tailCount})
</Button>
```

### Text Component

```typescript
// components/core/Text/Text.types.ts
export interface TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  selectable?: boolean;
  onPress?: () => void;
  testID?: string;
  children: React.ReactNode;
}

// Usage
<Text variant="h2" weight="bold" color="$primary">
  Lakers -5.5
</Text>
```

### Card Component

```typescript
// components/core/Card/Card.types.ts
export interface CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: SpacingToken;
  margin?: SpacingToken;
  onPress?: () => void;
  onLongPress?: () => void;
  testID?: string;
  children: React.ReactNode;
}

// Compound Components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Usage
<Card variant="elevated" onPress={handlePress}>
  <Card.Header>
    <UserInfo user={post.user} timestamp={post.createdAt} />
  </Card.Header>
  <Card.Body>
    <PostContent post={post} />
  </Card.Body>
  <Card.Footer>
    <TailFadeButtons post={post} />
  </Card.Footer>
</Card>
```

### Sheet Component

```typescript
// components/core/Sheet/Sheet.types.ts
export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: string[];
  initialSnapIndex?: number;
  backdropCloseable?: boolean;
  handleComponent?: React.ReactNode;
  children: React.ReactNode;
}

// Usage
<Sheet
  isOpen={isBetSheetOpen}
  onClose={closeBetSheet}
  snapPoints={['25%', '50%', '90%']}
>
  <BetSlip game={selectedGame} />
</Sheet>
```

## Feature Components

### PostCard Component

```typescript
// components/feed/PostCard/PostCard.types.ts
export interface PostCardProps {
  post: Post;
  onTail?: (postId: string) => void;
  onFade?: (postId: string) => void;
  onReact?: (postId: string, emoji: string) => void;
  onShare?: (postId: string) => void;
  onUserPress?: (userId: string) => void;
  isCompact?: boolean;
  showActions?: boolean;
}

// Component Structure
PostCard
├── PostHeader
│   ├── UserAvatar
│   ├── UserInfo (name + metric)
│   └── Timestamp
├── PostMedia
│   ├── Image/Video
│   └── BetOverlay (if pick post)
├── PostCaption
├── PostStats
│   ├── TailCount
│   └── FadeCount
└── PostActions
    ├── TailFadeButtons
    └── ReactionBar
```

### GameCard Component

```typescript
// components/betting/GameCard/GameCard.types.ts
export interface GameCardProps {
  game: Game;
  onPress?: (game: Game) => void;
  showOdds?: boolean;
  highlightTeam?: string;
  isLive?: boolean;
}

// Component Structure
GameCard
├── GameHeader
│   ├── SportBadge
│   └── GameTime
├── TeamSection
│   ├── TeamLogo (Away)
│   ├── TeamName + Record
│   ├── VS
│   ├── TeamLogo (Home)
│   └── TeamName + Record
├── OddsSection
│   ├── SpreadOdds
│   ├── TotalOdds
│   └── MoneylineOdds
└── QuickBetButton
```

### StoryBar Component

```typescript
// components/feed/StoryBar/StoryBar.types.ts
export interface StoryBarProps {
  stories: Story[];
  onStoryPress: (story: Story) => void;
  onAddStory: () => void;
}

// Component Structure
StoryBar
├── ScrollView (horizontal)
│   ├── AddStoryCircle
│   │   ├── UserAvatar
│   │   └── PlusIcon
│   └── StoryCircle[] (for each story)
│       ├── ProgressRing
│       ├── UserAvatar
│       └── LiveIndicator (if live)
```

### ChatBubble Component

```typescript
// components/messaging/ChatBubble/ChatBubble.types.ts
export interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  onLongPress?: (message: Message) => void;
}

// Component Variants
ChatBubble
├── TextBubble
├── MediaBubble
│   ├── Image
│   └── PlayButton (if video)
├── PickShareBubble
│   ├── BetDetails
│   └── TailFadeButtons
└── BubbleFooter
    ├── Timestamp
    └── ReadReceipt
```

## Screen Components

### FeedScreen Composition

```typescript
// screens/FeedScreen.tsx
FeedScreen
├── Header
│   ├── ProfileButton
│   ├── Logo
│   └── NotificationBell
├── StoryBar
├── FeedList (FlashList)
│   ├── PostCard[]
│   └── LoadMoreIndicator
├── RefreshControl
└── NewPostIndicator
```

### ProfileScreen Composition

```typescript
// screens/ProfileScreen.tsx
ProfileScreen
├── ScrollView
│   ├── ProfileHeader
│   │   ├── Avatar
│   │   ├── Username + Badges
│   │   ├── Stats (W-L, Profit, ROI)
│   │   └── ActionButtons
│   ├── TabSelector
│   └── TabContent
│       ├── PicksTab
│       │   └── PostList
│       └── PerformanceTab
│           ├── SportBreakdown
│           ├── BetTypeAnalysis
│           └── TailFadeImpact
```

### CameraModal Composition

```typescript
// screens/CameraModal.tsx
CameraModal
├── CameraView
│   ├── Camera (Expo Camera)
│   ├── TopControls
│   │   ├── CloseButton
│   │   ├── FlashButton
│   │   └── FlipButton
│   ├── FilterCarousel
│   └── BottomControls
│       ├── GalleryButton
│       ├── CaptureButton
│       └── ToggleVideoButton
└── MediaPreview (after capture)
    ├── MediaDisplay
    ├── EditControls
    ├── CaptionInput
    ├── BetAttachment
    └── ShareOptions
```

## Composition Patterns

### Compound Components

```typescript
// Example: Form compound component
const Form = {
  Root: FormRoot,
  Field: FormField,
  Label: FormLabel,
  Input: FormInput,
  Error: FormError,
  Submit: FormSubmit,
};

// Usage
<Form.Root onSubmit={handleSubmit}>
  <Form.Field name="stake">
    <Form.Label>Bet Amount</Form.Label>
    <Form.Input
      type="currency"
      placeholder="50"
      rules={{ min: 5, max: bankroll }}
    />
    <Form.Error />
  </Form.Field>
  <Form.Submit>Place Bet</Form.Submit>
</Form.Root>
```

### Render Props Pattern

```typescript
// Example: List with empty/error states
interface ListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  isLoading?: boolean;
  error?: Error;
}

// Usage
<List
  data={posts}
  renderItem={(post) => <PostCard post={post} />}
  renderEmpty={() => <EmptyFeed />}
  renderError={(error) => <ErrorState error={error} />}
  renderLoading={() => <FeedSkeleton />}
/>
```

### Provider Pattern

```typescript
// Example: Modal provider
const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<Modal[]>([]);
  
  const showModal = useCallback((modal: Modal) => {
    setModals(prev => [...prev, modal]);
  }, []);
  
  const hideModal = useCallback((id: string) => {
    setModals(prev => prev.filter(m => m.id !== id));
  }, []);
  
  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modals.map(modal => (
        <ModalRenderer key={modal.id} {...modal} />
      ))}
    </ModalContext.Provider>
  );
};
```

## Props & Type Patterns

### Base Component Props

```typescript
// Shared base props for all components
interface BaseComponentProps {
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
}

// Extend for specific components
interface ButtonProps extends BaseComponentProps, PressableProps {
  // Button-specific props
}
```

### Variant Props Pattern

```typescript
// Type-safe variant props
type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonVariants {
  primary: {
    bg: '$primary';
    color: '$white';
    borderColor: 'transparent';
  };
  // ... other variants
}

// Usage with discriminated unions
type ButtonProps = BaseComponentProps & {
  onPress: () => void;
} & (
  | { variant: 'primary'; isPrimary?: never }
  | { variant?: never; isPrimary: boolean }
);
```

### Event Handler Props

```typescript
// Consistent event handler naming
interface InteractiveProps {
  onPress?: () => void;
  onLongPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
}

// With parameters
interface PostActions {
  onTail?: (postId: string) => Promise<void>;
  onFade?: (postId: string) => Promise<void>;
  onShare?: (post: Post) => void;
}
```

## Platform-Specific Components

### Platform File Structure

```
components/
└── core/
    └── Button/
        ├── Button.tsx         # Shared logic
        ├── Button.ios.tsx     # iOS specific
        ├── Button.android.tsx # Android specific
        └── index.ts          # Export logic
```

### Platform-Specific Implementation

```typescript
// Button.ios.tsx
export const Button: React.FC<ButtonProps> = (props) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        // iOS-specific shadow
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      ]}
      {...props}
    />
  );
};

// Button.android.tsx
export const Button: React.FC<ButtonProps> = (props) => {
  return (
    <Pressable
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
      style={[
        styles.button,
        // Android elevation
        { elevation: 4 },
      ]}
      {...props}
    />
  );
};
```

### Platform-Specific Features

```typescript
// components/shared/Haptic/Haptic.ts
import { Platform } from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';

export const haptic = {
  light: () => {
    if (Platform.OS === 'ios') {
      HapticFeedback.trigger('impactLight');
    } else {
      HapticFeedback.trigger('soft');
    }
  },
  medium: () => {
    if (Platform.OS === 'ios') {
      HapticFeedback.trigger('impactMedium');
    } else {
      HapticFeedback.trigger('impactMedium');
    }
  },
  success: () => {
    if (Platform.OS === 'ios') {
      HapticFeedback.trigger('notificationSuccess');
    } else {
      HapticFeedback.trigger('effectTick');
    }
  },
};
```

## Performance Patterns

### Memoization Strategy

```typescript
// Expensive component with memo
export const PostCard = memo<PostCardProps>(({
  post,
  onTail,
  onFade,
  showActions = true,
}) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.tailCount === nextProps.post.tailCount &&
    prevProps.post.fadeCount === nextProps.post.fadeCount &&
    prevProps.showActions === nextProps.showActions
  );
});

// List item optimization
const renderItem = useCallback(({ item }: { item: Post }) => (
  <PostCard
    post={item}
    onTail={handleTail}
    onFade={handleFade}
  />
), [handleTail, handleFade]);
```

### Lazy Loading Components

```typescript
// Lazy load heavy screens
const ProfileScreen = lazy(() => import('@/screens/ProfileScreen'));
const CameraModal = lazy(() => import('@/screens/CameraModal'));
const StoryViewer = lazy(() => import('@/screens/StoryViewer'));

// Usage with Suspense
<Suspense fallback={<ScreenLoader />}>
  <ProfileScreen />
</Suspense>
```

### Image Optimization

```typescript
// components/shared/OptimizedImage/OptimizedImage.tsx
interface OptimizedImageProps {
  source: string;
  width: number;
  height: number;
  priority?: boolean;
  placeholder?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  width,
  height,
  priority = false,
  placeholder,
}) => {
  return (
    <Image
      source={source}
      style={{ width, height }}
      contentFit="cover"
      placeholder={placeholder}
      transition={200}
      priority={priority}
      cachePolicy="memory-disk"
    />
  );
};
```

### List Performance

```typescript
// components/shared/OptimizedList/OptimizedList.tsx
interface OptimizedListProps<T> {
  data: T[];
  renderItem: (props: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T) => string;
  estimatedItemSize: number;
}

export function OptimizedList<T>({
  data,
  renderItem,
  keyExtractor,
  estimatedItemSize,
}: OptimizedListProps<T>) {
  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={estimatedItemSize}
      drawDistance={500}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={10}
    />
  );
}
```

## Component Testing Strategy

### Testing Structure

```typescript
// components/core/Button/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(
      <Button onPress={jest.fn()}>Click me</Button>
    );
    
    expect(getByText('Click me')).toBeTruthy();
  });
  
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress}>Click me</Button>
    );
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  
  it('shows loading state', () => {
    const { getByTestId } = render(
      <Button onPress={jest.fn()} loading testID="button">
        Click me
      </Button>
    );
    
    expect(getByTestId('button-loading')).toBeTruthy();
  });
});
```

### Component Testing Utils

```typescript
// test-utils/component-wrapper.tsx
export const createComponentWrapper = ({
  theme = defaultTheme,
  queryClient = new QueryClient({ defaultOptions: testQueryConfig }),
}: WrapperOptions = {}) => {
  return ({ children }: { children: React.ReactNode }) => (
    <TamaguiProvider config={theme}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </TamaguiProvider>
  );
};

// Usage in tests
const wrapper = createComponentWrapper();
const { result } = renderHook(() => usePostCard(mockPost), { wrapper });
```

### Snapshot Testing

```typescript
// Complex component snapshots
it('matches snapshot for pick post', () => {
  const component = render(
    <PostCard post={mockPickPost} showActions />,
    { wrapper }
  );
  
  expect(component.toJSON()).toMatchSnapshot();
});

// Visual regression with specific props
it('renders correctly in compact mode', () => {
  const component = render(
    <PostCard post={mockPost} isCompact />,
    { wrapper }
  );
  
  expect(component.toJSON()).toMatchSnapshot();
});
```

---

This Component Architecture Document provides a comprehensive blueprint for building SnapFade's UI components with consistency, reusability, and performance in mind. The patterns and structures defined here will ensure a maintainable and scalable component library.