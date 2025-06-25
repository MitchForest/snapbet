import { supabase } from '@/services/supabase/client';
import { followService } from './followService';
import { differenceInDays } from 'date-fns';

export type FollowRequestStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface FollowRequest {
  id: string;
  requester_id: string;
  requested_id: string;
  status: FollowRequestStatus;
  created_at: string;
  updated_at: string;
  requester?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface FollowRequestState {
  canTransitionTo(newStatus: FollowRequestStatus): boolean;
  onTransition(request: FollowRequest, newStatus: FollowRequestStatus): Promise<void>;
}

class PendingState implements FollowRequestState {
  canTransitionTo(newStatus: FollowRequestStatus): boolean {
    return ['accepted', 'rejected', 'expired'].includes(newStatus);
  }

  async onTransition(request: FollowRequest, newStatus: FollowRequestStatus): Promise<void> {
    if (newStatus === 'accepted') {
      // The database trigger will handle creating the follow relationship and notification
      // No additional action needed here
    }
  }
}

class AcceptedState implements FollowRequestState {
  canTransitionTo(): boolean {
    return false; // Accepted is a final state
  }

  async onTransition(): Promise<void> {
    // No transitions allowed from accepted
  }
}

class RejectedState implements FollowRequestState {
  canTransitionTo(): boolean {
    return false; // Rejected is a final state
  }

  async onTransition(): Promise<void> {
    // No transitions allowed from rejected
  }
}

class ExpiredState implements FollowRequestState {
  canTransitionTo(): boolean {
    return false; // Expired is a final state
  }

  async onTransition(): Promise<void> {
    // No transitions allowed from expired
  }
}

class FollowRequestService {
  private static instance: FollowRequestService;
  private states: Map<FollowRequestStatus, FollowRequestState> = new Map([
    ['pending', new PendingState()],
    ['accepted', new AcceptedState()],
    ['rejected', new RejectedState()],
    ['expired', new ExpiredState()],
  ]);

  private constructor() {}

  static getInstance(): FollowRequestService {
    if (!this.instance) {
      this.instance = new FollowRequestService();
    }
    return this.instance;
  }

  async createFollowRequest(
    targetUserId: string
  ): Promise<{ success: boolean; error?: string; requestId?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Check if user is already following
      const followState = await followService.getFollowState(targetUserId, user.id);
      if (followState.isFollowing) {
        return { success: false, error: 'Already following this user' };
      }

      // Check for existing request
      const { data: existingRequest } = await supabase
        .from('follow_requests')
        .select('id, status, updated_at, created_at')
        .eq('requester_id', user.id)
        .eq('requested_id', targetUserId)
        .single();

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          return { success: false, error: 'Follow request already sent' };
        }

        if (existingRequest.status === 'rejected') {
          // Check if 7 days have passed
          const dateToCheck = existingRequest.updated_at || existingRequest.created_at;
          if (!dateToCheck) {
            // If somehow both dates are null, treat as old request
            await supabase.from('follow_requests').delete().eq('id', existingRequest.id);
          } else {
            const daysSinceRejection = differenceInDays(new Date(), new Date(dateToCheck));
            if (daysSinceRejection < 7) {
              return {
                success: false,
                error: `Can request again in ${7 - daysSinceRejection} days`,
              };
            }
            // Delete old request to create new one
            await supabase.from('follow_requests').delete().eq('id', existingRequest.id);
          }
        }
      }

      // Create new request
      const { data, error } = await supabase
        .from('follow_requests')
        .insert({
          requester_id: user.id,
          requested_id: targetUserId,
          status: 'pending' as FollowRequestStatus,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating follow request:', error);
        return { success: false, error: 'Failed to send follow request' };
      }

      return { success: true, requestId: data.id };
    } catch (error) {
      console.error('Error in createFollowRequest:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async handleFollowRequest(
    requestId: string,
    action: 'accept' | 'reject'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Get the request
      const { data: request, error: fetchError } = await supabase
        .from('follow_requests')
        .select('*')
        .eq('id', requestId)
        .eq('requested_id', user.id)
        .single();

      if (fetchError || !request) {
        return { success: false, error: 'Follow request not found' };
      }

      // Check if expired
      if (this.isExpired(request.created_at)) {
        await this.updateRequestStatus(requestId, 'expired');
        return { success: false, error: 'This follow request has expired' };
      }

      // Check state machine
      const currentState = this.states.get(request.status as FollowRequestStatus);
      const newStatus = action === 'accept' ? 'accepted' : 'rejected';

      if (!currentState?.canTransitionTo(newStatus as FollowRequestStatus)) {
        return { success: false, error: 'Invalid request state' };
      }

      // Update status
      const { error: updateError } = await supabase
        .from('follow_requests')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating follow request:', updateError);
        return { success: false, error: 'Failed to update request' };
      }

      // Handle state transition
      await currentState.onTransition(request as FollowRequest, newStatus as FollowRequestStatus);

      return { success: true };
    } catch (error) {
      console.error('Error in handleFollowRequest:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async getIncomingRequests(userId: string): Promise<FollowRequest[]> {
    try {
      // Check for expired requests and update them
      await this.cleanupExpiredRequests(userId);

      const { data, error } = await supabase
        .from('follow_requests')
        .select(
          `
          *,
          requester:users!requester_id(
            id,
            username,
            display_name,
            avatar_url
          )
        `
        )
        .eq('requested_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching follow requests:', error);
        return [];
      }

      return (data || []) as unknown as FollowRequest[];
    } catch (error) {
      console.error('Error in getIncomingRequests:', error);
      return [];
    }
  }

  async getRequestCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('follow_requests')
      .select('*', { count: 'exact', head: true })
      .eq('requested_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching request count:', error);
      return 0;
    }

    return count || 0;
  }

  async rejectAllRequests(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('follow_requests')
        .update({
          status: 'rejected' as FollowRequestStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('requested_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error rejecting all requests:', error);
        return { success: false, error: 'Failed to reject requests' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in rejectAllRequests:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async checkPendingRequest(requesterId: string, requestedId: string): Promise<boolean> {
    const { data } = await supabase
      .from('follow_requests')
      .select('id')
      .eq('requester_id', requesterId)
      .eq('requested_id', requestedId)
      .eq('status', 'pending')
      .single();

    return !!data;
  }

  private isExpired(createdAt: string | null): boolean {
    if (!createdAt) return true;
    const daysSince = differenceInDays(new Date(), new Date(createdAt));
    return daysSince > 30;
  }

  private async updateRequestStatus(requestId: string, status: FollowRequestStatus): Promise<void> {
    await supabase
      .from('follow_requests')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);
  }

  private async cleanupExpiredRequests(userId: string): Promise<void> {
    // Get pending requests older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await supabase
      .from('follow_requests')
      .update({
        status: 'expired' as FollowRequestStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('requested_id', userId)
      .eq('status', 'pending')
      .lt('created_at', thirtyDaysAgo.toISOString());
  }
}

export const followRequestService = FollowRequestService.getInstance();
