// Supabase Edge Function for caption generation
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { postType, betDetails, regenerate } = await req.json();

    // Get the JWT from the Authorization header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check rate limit
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase
      .from('caption_generation_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const currentCount = usage?.count || 0;
    if (currentCount >= 20) {
      return new Response(JSON.stringify({ error: 'AI caption limit reached (20/20 today)' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's caption style from last 10 posts
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('caption')
      .eq('user_id', user.id)
      .not('caption', 'is', null)
      .gte('caption', 20) // Length >= 20 chars
      .order('created_at', { ascending: false })
      .limit(10);

    // Generate caption using OpenAI
    const openAIKey = Deno.env.get('OPENAI_API_KEY')!;
    const caption = await generateCaption(
      {
        postType,
        betDetails,
        userStyle: recentPosts?.map((p) => p.caption) || [],
        regenerate,
      },
      openAIKey
    );

    // Update rate limit
    await supabase.from('caption_generation_usage').upsert({
      user_id: user.id,
      date: today,
      count: currentCount + 1,
    });

    return new Response(
      JSON.stringify({
        caption,
        remaining: 19 - currentCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Caption generation unavailable. Try again?' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function generateCaption(params: any, apiKey: string): Promise<string> {
  const { postType, betDetails, userStyle, regenerate } = params;

  // Construct style analysis
  const styleAnalysis =
    userStyle.length > 0
      ? `Based on these previous captions, match the user's style:\n${userStyle.slice(0, 5).join('\n')}`
      : 'Create a punchy, engaging caption.';

  // Different prompts for different post types
  let contextPrompt = '';
  switch (postType) {
    case 'pick':
      contextPrompt = `Generate a confident betting caption for: ${betDetails.team} ${betDetails.betType} ${betDetails.line || ''}`;
      break;
    case 'outcome':
      contextPrompt = `Generate a ${betDetails.won ? 'winning celebration' : 'loss reaction'} caption for a $${betDetails.amount} ${betDetails.won ? 'win' : 'loss'}`;
      break;
    default:
      contextPrompt = 'Generate an engaging sports betting caption';
  }

  const prompt = `${contextPrompt}\n\n${styleAnalysis}\n\nRequirements:\n- Maximum 100 characters\n- Use appropriate emojis\n- Be ${regenerate ? 'different from previous suggestions' : 'engaging and confident'}\n\nCaption:`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a witty sports betting caption writer. Keep it short and punchy.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 50,
      temperature: regenerate ? 0.9 : 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content.trim().slice(0, 100);
}
