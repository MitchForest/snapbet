-- Make username nullable to support OAuth flow
-- Users will set username during onboarding after OAuth sign-in
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;

-- Add comment to clarify the field's purpose
COMMENT ON COLUMN users.username IS 'User-chosen username, set during onboarding. Must be unique and follow format constraints.'; 