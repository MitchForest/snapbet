import React, { useState, useCallback, useEffect } from 'react';
import { View, Text } from '@tamagui/core';
import { TextInput, Image, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MemberSelector } from './MemberSelector';
import { Colors } from '@/theme';
import { GroupCreationData } from '@/types/messaging';

interface GroupCreationFlowProps {
  onComplete: (data: GroupCreationData & { photoFile?: File }) => void;
  onCancel: () => void;
}

type Step = 'members' | 'details';

export const GroupCreationFlow: React.FC<GroupCreationFlowProps> = ({ onComplete, onCancel }) => {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<Step>('members');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupPhoto, setGroupPhoto] = useState<{ uri: string; file?: File } | null>(null);
  const [expirationHours, setExpirationHours] = useState(24);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Immediate debug
  useEffect(() => {
    console.log('=== GroupCreationFlow MOUNTED ===');
    console.log('Initial selectedMembers:', selectedMembers);
    console.log('Length:', selectedMembers.length);
    console.log('Content:', JSON.stringify(selectedMembers));

    // Check if somehow current user is in there
    if (selectedMembers.length > 0) {
      console.log('WARNING: selectedMembers is not empty on mount!');
      console.log('First item:', selectedMembers[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug selected members
  const handleMemberSelect = useCallback((members: string[]) => {
    console.log('=== handleMemberSelect ===');
    console.log('New members:', members);
    console.log('Setting state...');
    setSelectedMembers(members);
  }, []);

  useEffect(() => {
    console.log('GroupCreationFlow - selectedMembers state:', selectedMembers);
  }, [selectedMembers]);

  // Pick group photo
  const pickGroupPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Convert to File for web/upload
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const file = new File([blob], 'group-photo.jpg', { type: 'image/jpeg' });

      setGroupPhoto({ uri: asset.uri, file });
    }
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep === 'members') {
      if (selectedMembers.length === 0) {
        Alert.alert('Select Members', 'Please select at least one member for the group');
        return;
      }
      setCurrentStep('details');
    }
  };

  // Handle back
  const handleBack = () => {
    if (currentStep === 'details') {
      setCurrentStep('members');
    } else {
      onCancel();
    }
  };

  // Handle create group
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Group Name Required', 'Please enter a name for the group');
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete({
        name: groupName.trim(),
        memberIds: selectedMembers,
        expirationHours,
        photoFile: groupPhoto?.file,
      });
    } catch (error) {
      console.error('Failed to create group:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <View flex={1} backgroundColor="$background">
      {/* Header */}
      <View
        paddingTop={insets.top}
        paddingHorizontal="$4"
        paddingBottom="$3"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        backgroundColor="$background"
      >
        <Pressable onPress={handleBack}>
          <Text fontSize="$4" color="$primary">
            {currentStep === 'members' ? 'Cancel' : 'Back'}
          </Text>
        </Pressable>
        <Text fontSize="$5" fontWeight="600">
          {currentStep === 'members' ? 'Select Members' : 'Group Details'}
        </Text>
        {currentStep === 'members' ? (
          <Pressable onPress={handleNext} disabled={selectedMembers.length === 0}>
            <Text
              fontSize="$4"
              color={selectedMembers.length > 0 ? '$primary' : '$gray11'}
              fontWeight="600"
            >
              Next
            </Text>
          </Pressable>
        ) : (
          <View width={60} />
        )}
      </View>

      {/* Content */}
      {currentStep === 'members' ? (
        <MemberSelector
          selectedUsers={selectedMembers}
          onSelect={handleMemberSelect}
          minMembers={1}
          maxMembers={49}
        />
      ) : (
        <View flex={1} paddingHorizontal="$4" paddingVertical="$4" gap="$4">
          {/* Group Photo */}
          <View alignItems="center" gap="$2">
            <Pressable onPress={pickGroupPhoto}>
              {groupPhoto ? (
                <Image source={{ uri: groupPhoto.uri }} style={styles.groupPhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text fontSize="$8">📷</Text>
                </View>
              )}
            </Pressable>
            <Text fontSize="$3" color="$gray11">
              Tap to add group photo (optional)
            </Text>
          </View>

          {/* Group Name */}
          <View gap="$2">
            <Text fontSize="$4" fontWeight="600">
              Group Name
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter group name..."
              value={groupName}
              onChangeText={setGroupName}
              maxLength={50}
              autoFocus
            />
            <Text fontSize="$2" color="$gray11" textAlign="right">
              {groupName.length}/50
            </Text>
          </View>

          {/* Message Expiration */}
          <View gap="$2">
            <Text fontSize="$4" fontWeight="600">
              Message Expiration
            </Text>
            <View flexDirection="row" gap="$2" flexWrap="wrap">
              {[1, 6, 24, 48, 168].map((hours) => (
                <Pressable
                  key={hours}
                  onPress={() => setExpirationHours(hours)}
                  style={[
                    styles.expirationOption,
                    expirationHours === hours && styles.selectedExpiration,
                  ]}
                >
                  <Text
                    color={expirationHours === hours ? 'white' : '$textPrimary'}
                    fontWeight={expirationHours === hours ? '600' : '400'}
                  >
                    {hours === 1 ? '1 hour' : hours === 168 ? '7 days' : `${hours} hours`}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Create Button */}
          <View flex={1} justifyContent="flex-end">
            <Pressable
              onPress={handleCreateGroup}
              disabled={!groupName.trim() || isSubmitting}
              style={[
                styles.createButton,
                (!groupName.trim() || isSubmitting) && styles.disabledButton,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text color="white" fontSize="$4" fontWeight="600">
                  Create Group ({selectedMembers.length + 1} members)
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  groupPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  expirationOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  selectedExpiration: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.gray[400],
  },
});
