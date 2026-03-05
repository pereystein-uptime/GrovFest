
-- Create supplier_contacts table
CREATE TABLE public.supplier_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  avatar_color text NOT NULL DEFAULT '#1a1f36',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view supplier contacts"
ON public.supplier_contacts FOR SELECT
USING (true);

-- Add supplier_id to chat_channels
ALTER TABLE public.chat_channels ADD COLUMN supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- Add supplier_contact_id to chat_messages (for messages sent by supplier contacts)
ALTER TABLE public.chat_messages ADD COLUMN supplier_contact_id uuid REFERENCES public.supplier_contacts(id) ON DELETE SET NULL;

-- Allow member_id to be nullable for supplier messages
ALTER TABLE public.chat_messages ALTER COLUMN member_id DROP NOT NULL;

-- Update chat_messages insert policy to allow supplier contact messages
DROP POLICY IF EXISTS "Members can insert messages" ON public.chat_messages;
CREATE POLICY "Members can insert messages"
ON public.chat_messages FOR INSERT
WITH CHECK (
  (
    -- Regular member messages
    (member_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM members m WHERE m.id = chat_messages.member_id AND m.user_id = auth.uid()
    ) AND EXISTS (
      SELECT 1 FROM chat_channels ch WHERE ch.id = chat_messages.channel_id AND is_member_of_group(auth.uid(), ch.group_id)
    ))
    OR
    -- Supplier contact messages (bussjef can insert on behalf)
    (supplier_contact_id IS NOT NULL AND member_id IS NULL AND EXISTS (
      SELECT 1 FROM chat_channels ch WHERE ch.id = chat_messages.channel_id AND is_bussjef_of_group(auth.uid(), ch.group_id)
    ))
  )
);

-- Update chat_channels view policy to include supplier channels
DROP POLICY IF EXISTS "Members can view channels" ON public.chat_channels;
CREATE POLICY "Members can view channels"
ON public.chat_channels FOR SELECT
USING (
  is_member_of_group(auth.uid(), group_id) AND (
    type IN ('group', 'announcement', 'supplier')
    OR (type IN ('dm', 'admin') AND auth.uid() = ANY(participants))
  )
);
