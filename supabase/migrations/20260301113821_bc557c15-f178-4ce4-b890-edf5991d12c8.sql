
-- Add participants array to chat_channels for DM and private channel membership
ALTER TABLE public.chat_channels ADD COLUMN participants uuid[] DEFAULT '{}';

-- Allow members to insert DM channels (not just bussjef)
CREATE POLICY "Members can insert dm channels"
ON public.chat_channels
FOR INSERT
TO authenticated
WITH CHECK (
  is_member_of_group(auth.uid(), group_id)
  AND type = 'dm'
);

-- Update SELECT policy: members see group/announcement channels, plus dm/private where they are a participant
DROP POLICY IF EXISTS "Members can view channels" ON public.chat_channels;
CREATE POLICY "Members can view channels"
ON public.chat_channels
FOR SELECT
TO authenticated
USING (
  is_member_of_group(auth.uid(), group_id)
  AND (
    type IN ('group', 'announcement')
    OR (type IN ('dm', 'admin') AND auth.uid() = ANY(participants))
  )
);
