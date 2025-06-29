import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toastService } from '@/services/toastService';
import { supabase } from '@/services/supabase/client';
import { trackEvent } from '@/utils/analytics';

interface UseAICaptionOptions {
  bet?: any;
  postType: 'pick' | 'story' | 'post';
}

export function useAICaption(options: UseAICaptionOptions) {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [tapCount, setTapCount] = useState(0);

  const generateCaption = useCallback(async () => {
    if (!user) return;
    
    // Progressive enhancement
    if (tapCount >= 2) {
      toastService.show('Try writing your own! 💭', 'info');
      setTapCount(0);
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-caption', {
        body: {
          postType: options.postType,
          betDetails: options.bet,
          regenerate: tapCount > 0
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to generate caption');
      }
      
      setCaption(data.caption);
      setRemaining(data.remaining);
      setTapCount(prev => prev + 1);
      
      // Track analytics
      trackEvent('ai_caption_generated', {
        postType: options.postType,
        captionLength: data.caption.length,
        regenerated: tapCount > 0
      });
    } catch (err: any) {
      const message = err.message || 'Caption generation unavailable. Try again?';
      setError(message);
      toastService.show(message, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [user, options, tapCount]);

  return {
    caption,
    isGenerating,
    error,
    remaining,
    generateCaption,
    clearCaption: () => { setCaption(''); setTapCount(0); },
    setCaption
  };
}