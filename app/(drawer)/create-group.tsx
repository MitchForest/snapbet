import React from 'react';
import { useRouter } from 'expo-router';
import { GroupCreationFlow } from '@/components/messaging/GroupCreationFlow';
import { groupService } from '@/services/messaging/groupService';
import { GroupCreationData } from '@/types/messaging';

export default function CreateGroupScreen() {
  const router = useRouter();

  const handleCreateGroup = async (data: GroupCreationData & { photoFile?: File }) => {
    const chatId = await groupService.createGroupChat(data);

    if (chatId) {
      // Navigate to the new group chat
      router.replace(`/chat/${chatId}`);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return <GroupCreationFlow onComplete={handleCreateGroup} onCancel={handleCancel} />;
}
