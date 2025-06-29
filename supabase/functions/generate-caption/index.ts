// Supabase Edge Function for caption generation
// @ts-expect-error - Deno types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-expect-error - Deno types
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface CaptionRequest {
  postType: 'pick' | 'story' | 'post';
  betDetails?: Record<string, unknown>;
  regenerate?: boolean;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // @ts-expect-error - Deno global
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // @ts-expect-error - Deno global
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
    } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Invalid token');
    }

    // Parse request body
    const { postType, betDetails, regenerate } = (await req.json()) as CaptionRequest;

    // Check rate limit
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabaseClient
      .from('caption_generation_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const currentCount = usage?.count || 0;
    if (currentCount >= 20) {
      return new Response(JSON.stringify({ error: 'Daily limit reached (20/20)' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's recent captions for style learning
    const { data: recentPosts } = await supabaseClient
      .from('posts')
      .select('content')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .limit(10);

    // Generate caption using OpenAI
    // @ts-expect-error - Deno global
    const openAIKey = Deno.env.get('OPENAI_API_KEY')!;

    const systemPrompt = `You are a witty sports betting caption writer. 
    Style: Short, punchy, confident. Use relevant emojis sparingly. 
    Max 100 characters. No hashtags.
    ${
      recentPosts && recentPosts.length > 0
        ? `User's caption style examples: ${recentPosts
            .map((p: { content: { caption?: string } }) => p.content?.caption)
            .filter(Boolean)
            .slice(0, 5)
            .join(', ')}`
        : ''
    }`;

    let userPrompt = `Generate a ${postType} caption`;
    if (betDetails) {
      userPrompt += ` for this bet: ${JSON.stringify(betDetails)}`;
    }
    if (regenerate) {
      userPrompt += ' (make it different from the previous one)';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 50,
        temperature: 0.8,
      }),
    });

    const aiResponse = await response.json();
    const caption = aiResponse.choices[0].message.content?.trim() || '';

    // Update usage count
    await supabaseClient.from('caption_generation_usage').upsert({
      user_id: user.id,
      date: today,
      count: currentCount + 1,
    });

    return new Response(JSON.stringify({ caption, remaining: 20 - currentCount - 1 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Caption generation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
