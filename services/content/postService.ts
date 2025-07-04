import { supabase } from '@/services/supabase';
import { PostType, PostWithType, CreatePostParams, Comment } from '@/types/content';
import { calculateExpiration } from '@/utils/content/postTypeHelpers';
import { withActiveContent } from '@/utils/database/archiveFilter';

export async function createPost(params: CreatePostParams): Promise<PostWithType> {
  const { post_type = PostType.CONTENT, bet_id, settled_bet_id, expires_at, ...rest } = params;

  const expiresAt = expires_at || calculateExpiration(post_type);

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...rest,
      user_id: user.id,
      post_type,
      bet_id: post_type === PostType.PICK ? bet_id : null,
      settled_bet_id: post_type === PostType.OUTCOME ? settled_bet_id : null,
      expires_at: expiresAt.toISOString(),
      comment_count: 0,
    })
    .select(
      `
      *,
      user:users(id, username, display_name, avatar_url)
    `
    )
    .single();

  if (error) throw error;

  const post = data as PostWithType;

  // Note: Embedding generation is handled by production jobs, not in the app
  // The embedding-generation.ts job processes archived content

  return post;
}

export async function getPostsByType(postType: PostType, limit = 20): Promise<PostWithType[]> {
  const { data, error } = await withActiveContent(
    supabase.from('posts').select(
      `
        *,
        user:users(id, username, display_name, avatar_url)
      `
    )
  )
    .eq('post_type', postType)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as PostWithType[];
}

export async function getAllPosts(limit = 20): Promise<PostWithType[]> {
  const { data, error } = await withActiveContent(
    supabase.from('posts').select(
      `
        *,
        user:users(id, username, display_name, avatar_url)
      `
    )
  )
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as PostWithType[];
}

export async function getPostById(postId: string): Promise<PostWithType | null> {
  const { data, error } = await withActiveContent(
    supabase.from('posts').select(
      `
        *,
        user:users(id, username, display_name, avatar_url)
      `
    )
  )
    .eq('id', postId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data as PostWithType;
}

export async function updatePost(
  postId: string,
  updates: Partial<PostWithType>
): Promise<PostWithType> {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select(
      `
      *,
      user:users(id, username, display_name, avatar_url)
    `
    )
    .single();

  if (error) throw error;
  return data as PostWithType;
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', postId);

  if (error) throw error;
}

// Comment-related functions
export async function createComment(postId: string, content: string): Promise<Comment> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create comment - the database trigger will handle updating the count
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
    })
    .select(
      `
      *,
      user:users(id, username, display_name, avatar_url)
    `
    )
    .single();

  if (commentError) throw commentError;

  return comment as Comment;
}

export async function getComments(postId: string, limit = 50): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(
      `
      *,
      user:users(id, username, display_name, avatar_url),
      post:posts!inner(archived, deleted_at)
    `
    )
    .eq('post_id', postId)
    .is('deleted_at', null)
    .eq('post.archived', false)
    .is('post.deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data || []) as Comment[];
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId);

  if (error) throw error;
}
