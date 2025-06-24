export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUsername(username: string): ValidationResult {
  // Convert to lowercase for validation
  const normalized = username.toLowerCase();

  // Check length
  if (normalized.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (normalized.length > 20) {
    return { valid: false, error: 'Username must be 20 characters or less' };
  }

  // Check format - must start with a letter
  if (!/^[a-z]/.test(normalized)) {
    return { valid: false, error: 'Username must start with a letter' };
  }

  // Check allowed characters - only lowercase letters, numbers, and underscores
  if (!/^[a-z][a-z0-9_]*$/.test(normalized)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  // Check for consecutive underscores
  if (/__/.test(normalized)) {
    return { valid: false, error: 'Username cannot contain consecutive underscores' };
  }

  // Check for trailing underscore
  if (normalized.endsWith('_')) {
    return { valid: false, error: 'Username cannot end with an underscore' };
  }

  return { valid: true };
}
