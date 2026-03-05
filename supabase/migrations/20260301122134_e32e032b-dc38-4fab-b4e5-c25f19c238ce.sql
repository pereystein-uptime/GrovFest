
-- Add new fields to members table
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS removed_at timestamp with time zone DEFAULT NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone DEFAULT NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS invited_email text DEFAULT NULL;
