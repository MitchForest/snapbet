import { supabase } from '@/services/supabase/client';
import { GroupCreationData, GroupMember } from '@/types/messaging';
import { toastService } from '@/services/toastService';

class GroupService {
  /**
   * Upload a file to Supabase storage
   */
  private async uploadGroupPhoto(file: File, path: string): Promise<string> {
    const { error } = await supabase.storage.from('media').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.error('Error uploading group photo:', error);
      throw error;
    }

    const { data } = supabase.storage.from('media').getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Create a new group chat
   */
  async createGroupChat(data: GroupCreationData & { photoFile?: File }): Promise<string | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      // Upload group photo if provided
      let avatarUrl: string | undefined;
      if (data.photoFile) {
        const path = `groups/${Date.now()}/avatar.jpg`;
        avatarUrl = await this.uploadGroupPhoto(data.photoFile, path);
      }

      // Create group using RPC function for atomicity
      const { data: result, error } = await supabase.rpc('create_group_chat', {
        p_name: data.name.trim(),
        p_avatar_url: avatarUrl,
        p_created_by: user.id,
        p_member_ids: data.memberIds,
        p_settings: {
          expiration_hours: data.expirationHours || 24,
        },
      });

      if (error) {
        console.error('Error creating group:', error);
        throw error;
      }

      if (!result || result.length === 0) {
        throw new Error('Failed to create group');
      }

      toastService.showSuccess('Group created successfully');
      return result[0].id;
    } catch (error: unknown) {
      console.error('Failed to create group:', error);

      // Handle specific errors
      if (error instanceof Error) {
        if (error.message?.includes('At least one other member')) {
          toastService.showError('Please select at least one member');
        } else if (error.message?.includes('more than 50 members')) {
          toastService.showError('Groups cannot have more than 50 members');
        } else {
          toastService.showError('Failed to create group');
        }
      } else {
        toastService.showError('Failed to create group');
      }

      return null;
    }
  }

  /**
   * Get group members with user details
   */
  async getGroupMembers(chatId: string): Promise<GroupMember[]> {
    try {
      const { data, error } = await supabase
        .from('chat_members')
        .select(
          `
          *,
          user:users!chat_members_user_id_fkey (
            id,
            username,
            avatar_url,
            display_name
          )
        `
        )
        .eq('chat_id', chatId)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error fetching group members:', error);
        throw error;
      }

      // Get the group creator
      const { data: chat } = await supabase
        .from('chats')
        .select('created_by')
        .eq('id', chatId)
        .single();

      // Map to GroupMember type
      return (data || []).map((member) => {
        const typedMember = member as GroupMember;
        return {
          ...typedMember,
          isCreator: typedMember.user_id === chat?.created_by,
        };
      });
    } catch (error) {
      console.error('Failed to get group members:', error);
      toastService.showError('Failed to load group members');
      return [];
    }
  }

  /**
   * Add a member to a group (admin only)
   */
  async addGroupMember(chatId: string, userId: string): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      // Check if user is admin
      const { data: memberData } = await supabase
        .from('chat_members')
        .select('role')
        .eq('chat_id', chatId)
        .eq('user_id', user.id)
        .single();

      if (memberData?.role !== 'admin') {
        toastService.showError('Only group admins can add members');
        return false;
      }

      // Check current member count
      const { count } = await supabase
        .from('chat_members')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', chatId);

      if (count && count >= 50) {
        toastService.showError('Group has reached maximum capacity (50 members)');
        return false;
      }

      // Add the member
      const { error } = await supabase.from('chat_members').insert({
        chat_id: chatId,
        user_id: userId,
        role: 'member',
      });

      if (error) {
        if (error.code === '23505') {
          toastService.showError('User is already a member');
        } else {
          console.error('Error adding member:', error);
          throw error;
        }
        return false;
      }

      toastService.showSuccess('Member added successfully');
      return true;
    } catch (error) {
      console.error('Failed to add group member:', error);
      toastService.showError('Failed to add member');
      return false;
    }
  }

  /**
   * Remove a member from a group (admin only, or member leaving)
   */
  async removeGroupMember(chatId: string, userId: string): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      // Check if user is admin or removing themselves
      const { data: memberData } = await supabase
        .from('chat_members')
        .select('role')
        .eq('chat_id', chatId)
        .eq('user_id', user.id)
        .single();

      const isAdmin = memberData?.role === 'admin';
      const isSelf = userId === user.id;

      if (!isAdmin && !isSelf) {
        toastService.showError('Only group admins can remove members');
        return false;
      }

      // Remove the member
      const { error } = await supabase
        .from('chat_members')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing member:', error);
        throw error;
      }

      toastService.showSuccess(isSelf ? 'You left the group' : 'Member removed');
      return true;
    } catch (error) {
      console.error('Failed to remove group member:', error);
      toastService.showError('Failed to remove member');
      return false;
    }
  }

  /**
   * Update group details (admin only)
   */
  async updateGroupDetails(
    chatId: string,
    updates: { name?: string; photoFile?: File }
  ): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      // Check if user is admin
      const { data: memberData } = await supabase
        .from('chat_members')
        .select('role')
        .eq('chat_id', chatId)
        .eq('user_id', user.id)
        .single();

      if (memberData?.role !== 'admin') {
        toastService.showError('Only group admins can update group details');
        return false;
      }

      const updateData: Record<string, unknown> = {};

      if (updates.name) {
        updateData.name = updates.name.trim();
      }

      if (updates.photoFile) {
        const path = `groups/${chatId}/avatar.jpg`;
        updateData.avatar_url = await this.uploadGroupPhoto(updates.photoFile, path);
      }

      const { error } = await supabase.from('chats').update(updateData).eq('id', chatId);

      if (error) {
        console.error('Error updating group:', error);
        throw error;
      }

      toastService.showSuccess('Group updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update group:', error);
      toastService.showError('Failed to update group');
      return false;
    }
  }

  /**
   * Delete a group (admin only)
   */
  async deleteGroup(chatId: string): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      // Check if user is admin
      const { data: memberData } = await supabase
        .from('chat_members')
        .select('role')
        .eq('chat_id', chatId)
        .eq('user_id', user.id)
        .single();

      if (memberData?.role !== 'admin') {
        toastService.showError('Only group admins can delete the group');
        return false;
      }

      // Delete the chat (cascade will handle members and messages)
      const { error } = await supabase.from('chats').delete().eq('id', chatId);

      if (error) {
        console.error('Error deleting group:', error);
        throw error;
      }

      toastService.showSuccess('Group deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete group:', error);
      toastService.showError('Failed to delete group');
      return false;
    }
  }
}

export const groupService = new GroupService();
