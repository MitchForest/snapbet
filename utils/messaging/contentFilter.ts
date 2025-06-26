// Basic profanity filter for messaging
// This is a simple implementation - in production, consider using a more comprehensive solution

// Common profanity patterns (keeping it minimal for demo)
const PROFANITY_LIST = [
  'fuck',
  'shit',
  'ass',
  'bitch',
  'damn',
  'hell',
  'crap',
  'piss',
  'dick',
  'cock',
  'pussy',
  'bastard',
  'slut',
  'whore',
];

// Severe profanity that should trigger immediate hiding
const SEVERE_PROFANITY = ['nigger', 'nigga', 'faggot', 'fag', 'retard', 'cunt'];

/**
 * Filter profanity from text by replacing with asterisks
 */
export const filterContent = (text: string): string => {
  let filtered = text;

  // Create a combined list for filtering
  const allProfanity = [...PROFANITY_LIST, ...SEVERE_PROFANITY];

  allProfanity.forEach((word) => {
    // Create regex that matches whole words only (with word boundaries)
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });

  return filtered;
};

/**
 * Count severe profanity occurrences
 */
export const countSevereProfanity = (text: string): number => {
  let count = 0;

  SEVERE_PROFANITY.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      count += matches.length;
    }
  });

  return count;
};

/**
 * Determine if a message should be hidden based on content and reports
 */
export const shouldHideMessage = (
  messageContent: string,
  reportCount: number = 0,
  reportThreshold: number = 3
): boolean => {
  // Hide if reported by multiple users
  if (reportCount >= reportThreshold) {
    return true;
  }

  // Check for severe profanity
  const severeProfanityCount = countSevereProfanity(messageContent);
  if (severeProfanityCount > 2) {
    return true;
  }

  // Check for spam patterns (repeated characters, all caps with profanity)
  if (isLikelySpam(messageContent)) {
    return true;
  }

  return false;
};

/**
 * Check if message appears to be spam
 */
const isLikelySpam = (text: string): boolean => {
  // Check for excessive repeated characters (e.g., "aaaaaaa")
  const repeatedCharsRegex = /(.)\1{7,}/;
  if (repeatedCharsRegex.test(text)) {
    return true;
  }

  // Check for all caps with profanity
  if (text === text.toUpperCase() && text.length > 10) {
    const profanityCount = PROFANITY_LIST.filter((word) =>
      new RegExp(`\\b${word}\\b`, 'i').test(text)
    ).length;
    if (profanityCount > 0) {
      return true;
    }
  }

  return false;
};

/**
 * Get filtered version of text for display
 */
export const getFilteredText = (text: string): string => {
  // First check if it should be hidden entirely
  if (shouldHideMessage(text)) {
    return '[Message hidden due to inappropriate content]';
  }

  // Otherwise, just filter profanity
  return filterContent(text);
};
