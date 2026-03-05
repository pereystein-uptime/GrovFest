
-- Add phone and avatar_url to members
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add logo_url and archived_at to groups
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone;

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(member_id, notification_type)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own preferences"
ON public.notification_preferences
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.members m
  WHERE m.id = notification_preferences.member_id AND m.user_id = auth.uid()
));

CREATE POLICY "Members can insert own preferences"
ON public.notification_preferences
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.members m
  WHERE m.id = notification_preferences.member_id AND m.user_id = auth.uid()
));

CREATE POLICY "Members can update own preferences"
ON public.notification_preferences
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.members m
  WHERE m.id = notification_preferences.member_id AND m.user_id = auth.uid()
));

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create group-logos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('group-logos', 'group-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Storage policies for group-logos
CREATE POLICY "Anyone can view group logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'group-logos');

CREATE POLICY "Authenticated users can upload group logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'group-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update group logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'group-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete group logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'group-logos' AND auth.role() = 'authenticated');
