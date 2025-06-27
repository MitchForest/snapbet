import { supabase } from '@/services/supabase';
import { PostType, StoryWithType } from '@/types/content';

interface CreateStoryParams {
  media_url: string;
  media_type: 'photo' | 'video' | 'gif';
  thumbnail_url?: string;
  caption?: string;
  effect_id?: string;
  story_content_type?: PostType;
  bet_id?: string;
}

export async function createStory(params: CreateStoryParams): Promise<StoryWithType> {
  const { story_content_type = PostType.CONTENT, effect_id, bet_id, ...rest } = params;

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Stories always expire in 24 hours
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Store effect_id and bet_id in metadata
  const metadata = {
    effect_id: effect_id || null,
    bet_id: bet_id || null,
  };

  const { data, error } = await supabase
    .from('stories')
    .insert({
      ...rest,
      user_id: user.id,
      story_content_type,
      expires_at: expiresAt.toISOString(),
      view_count: 0,
      metadata,
    })
    .select(
      `
      *,
      user:users(id, username, avatar_url)
    `
    )
    .single();

  if (error) throw error;
  return data as unknown as StoryWithType;
}

export async function getActiveStories(limit = 50): Promise<StoryWithType[]> {
  const { data, error } = await supabase
    .from('stories')
    .select(
      `
      *,
      user:users(id, username, avatar_url)
    `
    )
    .is('deleted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as unknown as StoryWithType[];
}

export async function getUserStories(userId: string): Promise<StoryWithType[]> {
  const { data, error } = await supabase
    .from('stories')
    .select(
      `
      *,
      user:users(id, username, avatar_url)
    `
    )
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as StoryWithType[];
}

export async function incrementStoryView(storyId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Record the view
  await supabase.from('story_views').insert({
    story_id: storyId,
    viewer_id: user.id,
  });

  // Increment view count
  await supabase.rpc('increment_counter', {
    table_name: 'stories',
    column_name: 'view_count',
    row_id: storyId,
  });
}
