
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '/',
  icon text NOT NULL DEFAULT 'bell',
  read_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Members can view their own notifications
CREATE POLICY "Members can view own notifications"
ON public.notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = notifications.member_id
    AND m.user_id = auth.uid()
  )
);

-- Members can update own notifications (mark as read)
CREATE POLICY "Members can update own notifications"
ON public.notifications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.id = notifications.member_id
    AND m.user_id = auth.uid()
  )
);

-- Any authenticated group member can insert notifications for others in their group
CREATE POLICY "Members can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (
  is_member_of_group(auth.uid(), group_id)
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
