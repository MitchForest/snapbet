import { validateUsername } from '@/utils/validation/username';

export function generateUsernameSuggestions(base: string): string[] {
  const suggestions: string[] = [];
  const normalized = base.toLowerCase();
  const currentYear = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of year

  // Strategy 1: Add underscore between words if possible
  if (normalized.length >= 4 && !normalized.includes('_')) {
    const midPoint = Math.floor(normalized.length / 2);
    const withUnderscore = normalized.slice(0, midPoint) + '_' + normalized.slice(midPoint);
    if (validateUsername(withUnderscore).valid) {
      suggestions.push(withUnderscore);
    }
  }

  // Strategy 2: Add trailing numbers (current year)
  const withYear = normalized + currentYear;
  if (validateUsername(withYear).valid) {
    suggestions.push(withYear);
  }

  // Strategy 3: Add prefix 'the'
  const withThe = 'the' + normalized;
  if (validateUsername(withThe).valid) {
    suggestions.push(withThe);
  }

  // Strategy 4: Add common number substitutions
  const numberSubs: Record<string, string> = {
    e: '3',
    a: '4',
    i: '1',
    o: '0',
    s: '5',
  };

  // Try substituting one letter with a number
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (numberSubs[char]) {
      const substituted = normalized.slice(0, i) + numberSubs[char] + normalized.slice(i + 1);
      if (validateUsername(substituted).valid && !suggestions.includes(substituted)) {
        suggestions.push(substituted);
        break; // Only do one substitution
      }
    }
  }

  // Strategy 5: Add random 2-digit number
  const randomNum = Math.floor(Math.random() * 90) + 10; // 10-99
  const withRandom = normalized + randomNum;
  if (validateUsername(withRandom).valid && !suggestions.includes(withRandom)) {
    suggestions.push(withRandom);
  }

  // Return up to 5 unique suggestions
  return suggestions.slice(0, 5);
}
