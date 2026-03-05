
-- Add missing columns to chat_channels
ALTER TABLE public.chat_channels ADD COLUMN IF NOT EXISTS created_by uuid;

-- Add missing columns to chat_messages
ALTER TABLE public.chat_messages ADD COLUMN reply_to uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL;
ALTER TABLE public.chat_messages ADD COLUMN forwarded_from uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL;
ALTER TABLE public.chat_messages ADD COLUMN edited_at timestamptz;
ALTER TABLE public.chat_messages ADD COLUMN deleted_at timestamptz;

-- Create message_attachments table
CREATE TABLE public.message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  file_type text NOT NULL DEFAULT 'file',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view attachments"
ON public.message_attachments FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM chat_messages cm
  JOIN chat_channels ch ON ch.id = cm.channel_id
  WHERE cm.id = message_attachments.message_id
  AND is_member_of_group(auth.uid(), ch.group_id)
));

CREATE POLICY "Members can insert attachments"
ON public.message_attachments FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM chat_messages cm
  JOIN chat_channels ch ON ch.id = cm.channel_id
  WHERE cm.id = message_attachments.message_id
  AND is_member_of_group(auth.uid(), ch.group_id)
));

-- Create message_reactions table
CREATE TABLE public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id, member_id, emoji)
);
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view reactions"
ON public.message_reactions FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM chat_messages cm
  JOIN chat_channels ch ON ch.id = cm.channel_id
  WHERE cm.id = message_reactions.message_id
  AND is_member_of_group(auth.uid(), ch.group_id)
));

CREATE POLICY "Members can insert reactions"
ON public.message_reactions FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM members m WHERE m.id = message_reactions.member_id AND m.user_id = auth.uid()
));

CREATE POLICY "Members can delete own reactions"
ON public.message_reactions FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM members m WHERE m.id = message_reactions.member_id AND m.user_id = auth.uid()
));

-- Create message_reads table
CREATE TABLE public.message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id, member_id)
);
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view reads"
ON public.message_reads FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM chat_messages cm
  JOIN chat_channels ch ON ch.id = cm.channel_id
  WHERE cm.id = message_reads.message_id
  AND is_member_of_group(auth.uid(), ch.group_id)
));

CREATE POLICY "Members can insert reads"
ON public.message_reads FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM members m WHERE m.id = message_reads.member_id AND m.user_id = auth.uid()
));

-- Allow members to update own messages (for edit/delete)
CREATE POLICY "Members can update own messages"
ON public.chat_messages FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM members m WHERE m.id = chat_messages.member_id AND m.user_id = auth.uid()
));

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload chat files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

CREATE POLICY "Anyone can view chat files"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_attachments;
