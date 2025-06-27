import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ViewProps } from '@tamagui/core';
import { Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { storageService } from '@/services/storage/storageService';
import {
  normalizeAvatarUrl,
  generateDicebearUrl,
  getInitials,
  isValidAvatarUrl,
} from '@/utils/avatar/avatarHelpers';

interface AvatarProps extends ViewProps {
  src?: string | null;
  fallback?: string;
  username?: string;
  size?: number;
  showPresence?: boolean;
  isOnline?: boolean;
}

// Cache for failed URLs to prevent repeated attempts
const failedUrlCache = new Set<string>();

// Loading timeout in milliseconds
const LOADING_TIMEOUT = 5000;

const styles = StyleSheet.create({
  fallbackText: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
});

export const Avatar: React.FC<AvatarProps> = ({
  src,
  fallback = '👤',
  username,
  size = 32,
  showPresence = false,
  isOnline = false,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  // Generate a deterministic fallback URL based on username
  const dicebearUrl = useMemo(() => {
    if (username) {
      return generateDicebearUrl(username, size);
    }
    return null;
  }, [username, size]);

  // Process and normalize the image URL
  const imageUrl = useMemo(() => {
    const normalized = normalizeAvatarUrl(src);

    if (!normalized || failedUrlCache.has(normalized) || !isValidAvatarUrl(normalized)) {
      return null;
    }

    const isUrl = normalized.startsWith('http://') || normalized.startsWith('https://');
    if (isUrl) {
      return normalized;
    }

    // Handle Supabase storage paths
    return storageService.getPublicUrl(normalized);
  }, [src]);

  // Check if the primary URL is already a Dicebear URL
  const isPrimaryDicebear = imageUrl?.includes('dicebear.com');

  // Determine what to show based on state
  const shouldShowImage = imageUrl && !imageError && !loadingTimedOut;
  const shouldShowDicebear =
    !shouldShowImage && dicebearUrl && !imageError && !isPrimaryDicebear && !loadingTimedOut;
  const shouldShowFallback = !shouldShowImage && !shouldShowDicebear;

  // Get the initials from username or fallback
  const initials = useMemo(() => {
    if (username) {
      return getInitials(username, 1);
    }
    if (typeof fallback === 'string' && fallback.length > 0 && !/\p{Emoji}/u.test(fallback)) {
      return getInitials(fallback, 1);
    }
    return null;
  }, [username, fallback]);

  // Check if the fallback is an emoji
  const isEmoji = fallback && fallback.length <= 2 && /\p{Emoji}/u.test(fallback);

  // Set up loading timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setLoadingTimedOut(true);
        setIsLoading(false);
      }, LOADING_TIMEOUT);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  // Reset states when URL changes
  useEffect(() => {
    setImageError(false);
    setLoadingTimedOut(false);
    setIsLoading(false);
  }, [imageUrl]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);

    // Cache the failed URL
    if (imageUrl) {
      failedUrlCache.add(imageUrl);
    }
  }, [imageUrl]);

  const handleImageLoadStart = useCallback(() => {
    setIsLoading(true);
    setLoadingTimedOut(false);
  }, []);

  const handleImageLoadEnd = useCallback(() => {
    setIsLoading(false);
    setLoadingTimedOut(false);
  }, []);

  return (
    <View
      width={size}
      height={size}
      borderRadius="$round"
      backgroundColor="$surfaceAlt"
      justifyContent="center"
      alignItems="center"
      overflow="hidden"
      {...props}
    >
      {/* Loading indicator - only show if not timed out */}
      {isLoading && !loadingTimedOut && (
        <View
          position="absolute"
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          backgroundColor="$surfaceAlt"
          zIndex={1}
        >
          <ActivityIndicator size="small" color={Colors.text.secondary} />
        </View>
      )}

      {/* Primary image */}
      {shouldShowImage && (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
          resizeMode="cover"
          onError={handleImageError}
          onLoadStart={handleImageLoadStart}
          onLoadEnd={handleImageLoadEnd}
        />
      )}

      {/* Dicebear fallback - only if primary isn't already dicebear */}
      {shouldShowDicebear && (
        <Image
          source={{ uri: dicebearUrl }}
          style={{ width: size, height: size }}
          resizeMode="cover"
          onError={() => setImageError(true)}
          onLoadStart={handleImageLoadStart}
          onLoadEnd={handleImageLoadEnd}
        />
      )}

      {/* Text/Emoji fallback */}
      {shouldShowFallback && (
        <>
          {isEmoji ? (
            <Text fontSize={size * 0.5}>{fallback}</Text>
          ) : initials ? (
            <Text fontSize={size * 0.4} style={styles.fallbackText}>
              {initials}
            </Text>
          ) : (
            <Text fontSize={size * 0.5}>{fallback}</Text>
          )}
        </>
      )}

      {/* Online presence indicator */}
      {showPresence && isOnline && (
        <View
          position="absolute"
          bottom={0}
          right={0}
          width={size * 0.25}
          height={size * 0.25}
          backgroundColor={Colors.success}
          borderRadius="$round"
          borderWidth={2}
          borderColor={Colors.background}
        />
      )}
    </View>
  );
};
