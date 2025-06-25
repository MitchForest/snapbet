# Sports Betting App: Camera Filters & Effects Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Dependencies](#setup--dependencies)
4. [Core Implementation](#core-implementation)
5. [Team Overlays](#team-overlays)
6. [Animated Effects](#animated-effects)
7. [Info Overlays](#info-overlays)
8. [Video Processing](#video-processing)
9. [Performance Optimization](#performance-optimization)
10. [Complete Example](#complete-example)

## Overview

This guide explains how to implement Snapchat-like filters and effects for a sports betting app using React Native and Expo. The system supports both photo and video capture with real-time overlays and animations.

### Key Features
- Real-time camera preview with overlays
- Animated victory/loss effects
- Team logos and VS graphics
- Betting information overlays
- Photo and video capture with effects burned in

## Architecture

```
┌─────────────────────────────────────┐
│         Camera View Layer           │
├─────────────────────────────────────┤
│      Overlay Rendering Layer        │ ← Skia Canvas
├─────────────────────────────────────┤
│      Animation Effects Layer        │ ← Reanimated
├─────────────────────────────────────┤
│        Capture & Save Layer         │ ← ViewShot
└─────────────────────────────────────┘
```

## Setup & Dependencies

### 1. Install Required Packages

```bash
# Core dependencies
expo install expo-camera expo-media-library expo-file-system

# Rendering and effects
npm install @shopify/react-native-skia react-native-reanimated

# Capture functionality
npm install react-native-view-shot

# Additional utilities
npm install react-native-svg react-native-fast-image
```

### 2. Configure Permissions (app.json)

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera for recording bet reactions"
        }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to save your photos and videos",
          "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos to your gallery"
        }
      ]
    ]
  }
}
```

## Core Implementation

### Main Camera Component Structure

```javascript
// components/BettingCamera/index.js
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Canvas } from '@shopify/react-native-skia';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

import TeamOverlays from './overlays/TeamOverlays';
import AnimatedEffects from './effects/AnimatedEffects';
import InfoOverlays from './overlays/InfoOverlays';
import CameraControls from './controls/CameraControls';

const BettingCamera = ({ bet, odds, teams, bankroll }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState('team');
  const [activeEffect, setActiveEffect] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  
  const cameraRef = useRef(null);
  const viewShotRef = useRef(null);
  
  // Effect states
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMoney, setShowMoney] = useState(false);
  const [showRain, setShowRain] = useState(false);
  const [showFire, setShowFire] = useState(false);

  if (!permission?.granted) {
    return <PermissionRequest onRequest={requestPermission} />;
  }

  return (
    <ViewShot ref={viewShotRef} style={styles.container} options={{ format: 'jpg', quality: 0.9 }}>
      {/* Camera Layer */}
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
        mode={isRecording ? "video" : "picture"}
      />
      
      {/* Overlay Layer - Static Graphics */}
      <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {activeOverlay === 'team' && <TeamOverlays teams={teams} />}
        {activeOverlay === 'info' && <InfoOverlays bet={bet} odds={odds} bankroll={bankroll} />}
      </Canvas>
      
      {/* Effects Layer - Animations */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {showConfetti && <AnimatedEffects.Confetti onComplete={() => setShowConfetti(false)} />}
        {showMoney && <AnimatedEffects.MoneyFall amount={bet.potentialWin} />}
        {showRain && <AnimatedEffects.Rain />}
        {showFire && <AnimatedEffects.Fire intensity={bet.streak} />}
      </View>
      
      {/* Controls */}
      <CameraControls
        onCapture={handleCapture}
        onRecord={handleRecord}
        onOverlayChange={setActiveOverlay}
        onEffectTrigger={triggerEffect}
        isRecording={isRecording}
      />
    </ViewShot>
  );
};
```

## Team Overlays

### Implementation with Skia

```javascript
// overlays/TeamOverlays.js
import React from 'react';
import { 
  Group, 
  Image, 
  Text, 
  RoundedRect, 
  Shadow,
  LinearGradient,
  vec,
  useImage,
  useFont
} from '@shopify/react-native-skia';

const TeamOverlays = ({ teams }) => {
  // Load team logos
  const homeLogo = useImage(teams.home.logoUrl);
  const awayLogo = useImage(teams.away.logoUrl);
  const font = useFont(require('../assets/fonts/SportsBold.ttf'), 24);
  
  return (
    <Group>
      {/* Home Team Logo with Shadow */}
      <Group>
        <Shadow dx={2} dy={2} blur={5} color="rgba(0,0,0,0.3)" />
        <Image 
          image={homeLogo} 
          x={20} 
          y={50} 
          width={80} 
          height={80}
          fit="contain"
        />
      </Group>
      
      {/* VS Graphic */}
      <Group transform={[{ translateX: 120 }, { translateY: 70 }]}>
        {/* Background gradient */}
        <RoundedRect x={0} y={0} width={60} height={40} r={8}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(60, 40)}
            colors={['#FFD700', '#FFA500']}
          />
        </RoundedRect>
        
        {/* VS Text */}
        <Text
          x={30}
          y={28}
          text="VS"
          font={font}
          color="white"
          origin={{ x: 15, y: 12 }}
        />
      </Group>
      
      {/* Away Team Logo */}
      <Group>
        <Shadow dx={2} dy={2} blur={5} color="rgba(0,0,0,0.3)" />
        <Image 
          image={awayLogo} 
          x={200} 
          y={50} 
          width={80} 
          height={80}
          fit="contain"
        />
      </Group>
    </Group>
  );
};

export default TeamOverlays;
```

## Animated Effects

### 1. Confetti Animation

```javascript
// effects/ConfettiEffect.js
import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 50;
const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFD700', '#FF69B4', '#00CED1'];

const ConfettiPiece = ({ delay, color, startX }) => {
  const translateY = useSharedValue(-100);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  useEffect(() => {
    // Vertical movement
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 100, {
        duration: 3000,
        easing: Easing.in(Easing.quad)
      })
    );
    
    // Horizontal sway
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(30, { duration: 500 }),
          withTiming(-30, { duration: 500 })
        ),
        6,
        true
      )
    );
    
    // Rotation
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: 1000 }),
        3
      )
    );
    
    // Fade out
    opacity.value = withDelay(
      delay + 2000,
      withTiming(0, { duration: 1000 })
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value + startX },
      { rotate: `${rotate.value}deg` }
    ],
    opacity: opacity.value
  }));
  
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 10,
          height: 10,
          backgroundColor: color,
        },
        animatedStyle
      ]}
    />
  );
};

const ConfettiEffect = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {Array(CONFETTI_COUNT).fill(0).map((_, index) => (
        <ConfettiPiece
          key={index}
          delay={index * 30}
          color={COLORS[index % COLORS.length]}
          startX={Math.random() * SCREEN_WIDTH}
        />
      ))}
    </View>
  );
};
```

### 2. Money Falling Effect

```javascript
// effects/MoneyFallEffect.js
import React, { useEffect } from 'react';
import { View, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MONEY_COUNT = 20;

const MoneyBill = ({ delay, startX, amount }) => {
  const translateY = useSharedValue(-150);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0);
  
  useEffect(() => {
    // Fall animation
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 150, {
        duration: 4000,
        easing: Easing.in(Easing.quad)
      })
    );
    
    // Sway animation
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(40, { duration: 800 }),
          withTiming(-40, { duration: 800 })
        ),
        5,
        true
      )
    );
    
    // 3D flip effect
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: 2000 }),
        2
      )
    );
    
    // Scale in
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 10 })
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value + startX },
      { rotateY: `${rotate.value}deg` },
      { scale: scale.value }
    ]
  }));
  
  return (
    <Animated.View style={[styles.moneyBill, animatedStyle]}>
      <Image 
        source={require('../assets/money-bill.png')} 
        style={styles.billImage}
      />
      <Text style={styles.amountText}>${amount}</Text>
    </Animated.View>
  );
};

const MoneyFallEffect = ({ amount }) => {
  const billAmount = Math.floor(amount / MONEY_COUNT);
  
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {Array(MONEY_COUNT).fill(0).map((_, index) => (
        <MoneyBill
          key={index}
          delay={index * 100}
          startX={Math.random() * SCREEN_WIDTH - 50}
          amount={billAmount}
        />
      ))}
    </View>
  );
};
```

### 3. Fire Effect with Particles

```javascript
// effects/FireEffect.js
import React from 'react';
import { Canvas, Group, Circle, Blur, Paint } from '@shopify/react-native-skia';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

const FireParticle = ({ x, y, size, delay }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  
  React.useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0, { duration: 500 })
        ),
        -1
      )
    );
    
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-50, { duration: 1000 }),
        -1
      )
    );
    
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.5, { duration: 500 }),
          withTiming(0.5, { duration: 500 })
        ),
        -1
      )
    );
  }, []);
  
  const paint = Paint();
  paint.setColor('rgba(255, 69, 0, 0.8)');
  
  return (
    <Group 
      transform={[
        { translateY: translateY.value },
        { scale: scale.value }
      ]}
      opacity={opacity.value}
    >
      <Circle cx={x} cy={y} r={size} paint={paint}>
        <Blur blur={4} />
      </Circle>
    </Group>
  );
};

const FireEffect = ({ intensity = 5 }) => {
  const particles = Array(intensity * 10).fill(0).map((_, i) => ({
    x: Math.random() * 300 + 50,
    y: 400 + Math.random() * 100,
    size: Math.random() * 20 + 10,
    delay: Math.random() * 1000
  }));
  
  return (
    <Canvas style={StyleSheet.absoluteFillObject}>
      {particles.map((particle, index) => (
        <FireParticle key={index} {...particle} />
      ))}
    </Canvas>
  );
};
```

## Info Overlays

### Betting Information Display

```javascript
// overlays/InfoOverlays.js
import React from 'react';
import { 
  Group, 
  Text, 
  RoundedRect, 
  LinearGradient,
  Shadow,
  Path,
  Skia,
  vec,
  useFont
} from '@shopify/react-native-skia';

const InfoOverlays = ({ bet, odds, bankroll }) => {
  const titleFont = useFont(require('../assets/fonts/Bold.ttf'), 18);
  const valueFont = useFont(require('../assets/fonts/Regular.ttf'), 24);
  
  // Create pill-shaped background path
  const createPillPath = (x, y, width, height) => {
    const path = Skia.Path.Make();
    const radius = height / 2;
    path.addRRect({
      rect: { x, y, width, height },
      rx: radius,
      ry: radius
    });
    return path;
  };
  
  return (
    <Group>
      {/* Odds Display */}
      <Group transform={[{ translateY: 100 }]}>
        <Shadow dx={0} dy={4} blur={8} color="rgba(0,0,0,0.25)" />
        
        {/* Background */}
        <RoundedRect x={20} y={0} width={180} height={70} r={12}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(180, 70)}
            colors={['#1a1a2e', '#16213e']}
          />
        </RoundedRect>
        
        {/* Title */}
        <Text
          x={30}
          y={25}
          text="CURRENT ODDS"
          font={titleFont}
          color="#FFD700"
        />
        
        {/* Value */}
        <Text
          x={30}
          y={50}
          text={odds}
          font={valueFont}
          color="white"
        />
      </Group>
      
      {/* Bet Details */}
      <Group transform={[{ translateY: 190 }]}>
        <Shadow dx={0} dy={4} blur={8} color="rgba(0,0,0,0.25)" />
        
        <RoundedRect x={20} y={0} width={200} height={90} r={12}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(200, 90)}
            colors={['#0f4c75', '#3282b8']}
          />
        </RoundedRect>
        
        <Text x={30} y={25} text="BET AMOUNT" font={titleFont} color="#BBE1FA" />
        <Text x={30} y={45} text={`$${bet.amount}`} font={valueFont} color="white" />
        
        <Text x={30} y={65} text="POTENTIAL WIN" font={titleFont} color="#BBE1FA" />
        <Text x={30} y={85} text={`$${bet.potentialWin}`} font={valueFont} color="#4FFF4F" />
      </Group>
      
      {/* Bankroll Badge */}
      <Group transform={[{ translateX: 240 }, { translateY: 100 }]}>
        <Path path={createPillPath(0, 0, 100, 40)} color="rgba(255, 255, 255, 0.9)">
          <Shadow dx={0} dy={2} blur={4} color="rgba(0,0,0,0.2)" />
        </Path>
        
        <Text
          x={50}
          y={28}
          text={`$${bankroll}`}
          font={valueFont}
          color="#2C3E50"
          origin={{ x: 25, y: 12 }}
        />
      </Group>
    </Group>
  );
};
```

## Video Processing

### Capture and Save Implementation

```javascript
// utils/MediaCapture.js
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';

export class MediaCapture {
  static async capturePhoto(viewRef, metadata) {
    try {
      // Capture the view
      const uri = await captureRef(viewRef, {
        format: 'jpg',
        quality: 0.9,
        result: 'tmpfile'
      });
      
      // Add metadata
      const finalUri = await this.addMetadata(uri, metadata);
      
      // Save to gallery
      const asset = await MediaLibrary.createAssetAsync(finalUri);
      
      // Create album
      const album = await MediaLibrary.getAlbumAsync('BetSnaps');
      if (!album) {
        await MediaLibrary.createAlbumAsync('BetSnaps', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      
      // Clean up temp file
      await FileSystem.deleteAsync(uri, { idempotent: true });
      
      return asset;
    } catch (error) {
      console.error('Capture error:', error);
      throw error;
    }
  }
  
  static async recordVideo(cameraRef, viewRef, options) {
    const { maxDuration = 30, quality = '720p' } = options;
    
    try {
      // Start recording
      const video = await cameraRef.recordAsync({
        maxDuration,
        quality,
        codec: 'h264' // Better compatibility
      });
      
      // Capture overlay screenshot
      const overlayUri = await captureRef(viewRef, {
        format: 'jpg',
        quality: 0.8
      });
      
      // Save both
      const videoAsset = await MediaLibrary.createAssetAsync(video.uri);
      const overlayAsset = await MediaLibrary.createAssetAsync(overlayUri);
      
      // Link them with metadata
      await this.saveVideoMetadata({
        videoId: videoAsset.id,
        overlayId: overlayAsset.id,
        ...options.metadata
      });
      
      return { video: videoAsset, overlay: overlayAsset };
    } catch (error) {
      console.error('Record error:', error);
      throw error;
    }
  }
  
  static async addMetadata(uri, metadata) {
    // Implementation depends on platform
    // For now, we'll save metadata separately
    const metadataUri = `${FileSystem.documentDirectory}metadata_${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(
      metadataUri,
      JSON.stringify(metadata)
    );
    return uri;
  }
  
  static async saveVideoMetadata(data) {
    const key = `video_metadata_${data.videoId}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }
}
```

## Performance Optimization

### Best Practices

```javascript
// hooks/useOptimizedAnimation.js
import { useEffect, useRef } from 'react';
import { runOnJS, runOnUI } from 'react-native-reanimated';

export const useOptimizedAnimation = (callback, deps) => {
  const frameCount = useRef(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      'worklet';
      runOnUI(() => {
        frameCount.current++;
        // Skip frames for performance
        if (frameCount.current % 2 === 0) {
          runOnJS(callback)();
        }
      })();
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, deps);
};

// Asset preloading
export const preloadAssets = async (teams) => {
  const assets = [
    ...teams.map(team => ({ uri: team.logoUrl })),
    require('../assets/money-bill.png'),
    require('../assets/confetti.png')
  ];
  
  await Promise.all(
    assets.map(asset => 
      asset.uri 
        ? Image.prefetch(asset.uri)
        : Asset.fromModule(asset).downloadAsync()
    )
  );
};

// Memory management
export const cleanupTempFiles = async () => {
  const tempDir = `${FileSystem.cacheDirectory}viewshots/`;
  try {
    const files = await FileSystem.readDirectoryAsync(tempDir);
    await Promise.all(
      files.map(file => 
        FileSystem.deleteAsync(`${tempDir}${file}`, { idempotent: true })
      )
    );
  } catch (error) {
    // Directory doesn't exist
  }
};
```

## Complete Example

### Full Implementation

```javascript
// screens/BettingCameraScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Canvas } from '@shopify/react-native-skia';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

// Import all components
import TeamOverlays from '../components/overlays/TeamOverlays';
import InfoOverlays from '../components/overlays/InfoOverlays';
import { ConfettiEffect, MoneyFallEffect, RainEffect, FireEffect } from '../components/effects';
import { MediaCapture, preloadAssets } from '../utils';

const BettingCameraScreen = ({ route }) => {
  const { bet, odds, teams, bankroll } = route.params;
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState('team');
  const [activeEffect, setActiveEffect] = useState(null);
  
  // Refs
  const cameraRef = useRef(null);
  const viewShotRef = useRef(null);
  
  // Permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  
  // Preload assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        await preloadAssets(teams);
        setIsLoading(false);
      } catch (error) {
        console.error('Asset loading error:', error);
        setIsLoading(false);
      }
    };
    loadAssets();
  }, []);
  
  // Capture photo with effects
  const capturePhoto = async () => {
    try {
      const asset = await MediaCapture.capturePhoto(viewShotRef.current, {
        bet,
        odds,
        teams: teams.map(t => t.name),
        timestamp: Date.now(),
        overlay: activeOverlay,
        effect: activeEffect
      });
      
      Alert.alert('Success!', 'Your BetSnap has been saved to gallery!');
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };
  
  // Record video
  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      try {
        const result = await MediaCapture.recordVideo(
          cameraRef.current,
          viewShotRef.current,
          {
            maxDuration: 30,
            quality: '720p',
            metadata: {
              bet,
              odds,
              teams: teams.map(t => t.name),
              overlay: activeOverlay
            }
          }
        );
        
        Alert.alert('Success!', 'Your video has been saved!');
      } catch (error) {
        Alert.alert('Error', 'Failed to save video');
      }
    } else {
      setIsRecording(true);
      cameraRef.current.recordAsync({
        maxDuration: 30,
        quality: '720p'
      });
    }
  };
  
  // Trigger effects based on bet result
  const triggerResultEffect = (result) => {
    switch (result) {
      case 'win':
        setActiveEffect('confetti');
        break;
      case 'bigWin':
        setActiveEffect('money');
        break;
      case 'loss':
        setActiveEffect('rain');
        break;
      case 'hotStreak':
        setActiveEffect('fire');
        break;
    }
    
    // Auto-clear effect after animation
    setTimeout(() => setActiveEffect(null), 5000);
  };
  
  if (!cameraPermission?.granted || !mediaPermission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          We need camera and gallery permissions to continue
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={() => {
            requestCameraPermission();
            requestMediaPermission();
          }}
        >
          <Text style={styles.permissionButtonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading assets...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ViewShot 
        ref={viewShotRef} 
        style={StyleSheet.absoluteFillObject}
        options={{ format: 'jpg', quality: 0.9 }}
      >
        {/* Camera View */}
        <CameraView 
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
        />
        
        {/* Overlays */}
        <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {activeOverlay === 'team' && <TeamOverlays teams={teams} />}
          {activeOverlay === 'info' && (
            <InfoOverlays bet={bet} odds={odds} bankroll={bankroll} />
          )}
        </Canvas>
        
        {/* Effects */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {activeEffect === 'confetti' && <ConfettiEffect />}
          {activeEffect === 'money' && <MoneyFallEffect amount={bet.potentialWin} />}
          {activeEffect === 'rain' && <RainEffect />}
          {activeEffect === 'fire' && <FireEffect intensity={bet.streak || 3} />}
        </View>
      </ViewShot>
      
      {/* Controls */}
      <View style={styles.controls}>
        {/* Overlay Selector */}
        <View style={styles.overlaySelector}>
          <TouchableOpacity
            style={[styles.overlayButton, activeOverlay === 'team' && styles.activeOverlay]}
            onPress={() => setActiveOverlay('team')}
          >
            <Text style={styles.overlayButtonText}>Teams</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.overlayButton, activeOverlay === 'info' && styles.activeOverlay]}
            onPress={() => setActiveOverlay('info')}
          >
            <Text style={styles.overlayButtonText}>Bet Info</Text>
          </TouchableOpacity>
        </View>
        
        {/* Effect Triggers */}
        <View style={styles.effectTriggers}>
          <TouchableOpacity 
            style={styles.effectButton}
            onPress={() => triggerResultEffect('win')}
          >
            <Text style={styles.effectButtonText}>🎉</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.effectButton}
            onPress={() => triggerResultEffect('bigWin')}
          >
            <Text style={styles.effectButtonText}>💰</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.effectButton}
            onPress={() => triggerResultEffect('loss')}
          >
            <Text style={styles.effectButtonText}>🌧️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.effectButton}
            onPress={() => triggerResultEffect('hotStreak')}
          >
            <Text style={styles.effectButtonText}>🔥</Text>
          </TouchableOpacity>
        </View>
        
        {/* Capture Controls */}
        <View style={styles.captureControls}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={capturePhoto}
            disabled={isRecording}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={toggleRecording}
            onLongPress={() => {
              if (!isRecording) {
                toggleRecording();
              }
            }}
          >
            <View style={[styles.recordInner, isRecording && styles.recordingInner]} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 50,
  },
  overlaySelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  overlayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 5,
    borderRadius: 20,
  },
  activeOverlay: {
    backgroundColor: 'rgba(255, 215, 0, 0.6)',
  },
  overlayButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  effectTriggers: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  effectButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  effectButtonText: {
    fontSize: 24,
  },
  captureControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    padding: 3,
    marginHorizontal: 20,
  },
  captureInner: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'red',
    padding: 3,
    marginHorizontal: 20,
  },
  recordingButton: {
    backgroundColor: 'darkred',
  },
  recordInner: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: 'red',
  },
  recordingInner: {
    borderRadius: 10,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
  },
});

export default BettingCameraScreen;
```

## Summary

This implementation provides:

1. **Real-time camera preview** with overlays
2. **Multiple overlay types** (team logos, betting info)
3. **Animated effects** triggered by bet results
4. **Photo capture** with effects burned in
5. **Video recording** with overlay metadata
6. **Performance optimization** for smooth experience
7. **Proper asset management** and preloading

The architecture uses:
- **React Native Skia** for GPU-accelerated graphics
- **Reanimated** for smooth animations
- **ViewShot** for capturing composed views
- **Expo Camera** for camera functionality
- **Media Library** for saving to device

This approach ensures high performance while maintaining flexibility for adding new effects and overlays.