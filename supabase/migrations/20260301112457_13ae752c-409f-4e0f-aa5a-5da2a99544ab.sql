
-- Transactions table
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('in', 'out')),
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view transactions" ON public.transactions FOR SELECT USING (is_member_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can insert transactions" ON public.transactions FOR INSERT WITH CHECK (is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can update transactions" ON public.transactions FOR UPDATE USING (is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can delete transactions" ON public.transactions FOR DELETE USING (is_bussjef_of_group(auth.uid(), group_id));

-- Polls table
CREATE TABLE public.polls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  question text NOT NULL,
  threshold integer NOT NULL DEFAULT 50,
  deadline timestamp with time zone NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view polls" ON public.polls FOR SELECT USING (is_member_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can insert polls" ON public.polls FOR INSERT WITH CHECK (is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can update polls" ON public.polls FOR UPDATE USING (is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can delete polls" ON public.polls FOR DELETE USING (is_bussjef_of_group(auth.uid(), group_id));

-- Poll options
CREATE TABLE public.poll_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view poll options" ON public.poll_options FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.polls p WHERE p.id = poll_id AND is_member_of_group(auth.uid(), p.group_id))
);
CREATE POLICY "Bussjef can insert poll options" ON public.poll_options FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.polls p WHERE p.id = poll_id AND is_bussjef_of_group(auth.uid(), p.group_id))
);

-- Poll votes
CREATE TABLE public.poll_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_option_id uuid NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(poll_option_id, member_id)
);
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view poll votes" ON public.poll_votes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.poll_options po JOIN public.polls p ON p.id = po.poll_id WHERE po.id = poll_option_id AND is_member_of_group(auth.uid(), p.group_id))
);
CREATE POLICY "Members can insert own vote" ON public.poll_votes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.members m WHERE m.id = member_id AND m.user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.poll_options po JOIN public.polls p ON p.id = po.poll_id WHERE po.id = poll_option_id AND is_member_of_group(auth.uid(), p.group_id))
);

-- Contracts
CREATE TABLE public.contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'internkontrakt',
  template_id uuid,
  parties text,
  signed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view contracts" ON public.contracts FOR SELECT USING (is_member_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can insert contracts" ON public.contracts FOR INSERT WITH CHECK (is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can update contracts" ON public.contracts FOR UPDATE USING (is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can delete contracts" ON public.contracts FOR DELETE USING (is_bussjef_of_group(auth.uid(), group_id));

-- Contract signatures
CREATE TABLE public.contract_signatures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  opened_at timestamp with time zone,
  signed_at timestamp with time zone
);
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view contract sigs" ON public.contract_signatures FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.contracts c WHERE c.id = contract_id AND is_member_of_group(auth.uid(), c.group_id))
);
CREATE POLICY "Members can update own sig" ON public.contract_signatures FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.members m WHERE m.id = member_id AND m.user_id = auth.uid())
);
CREATE POLICY "Bussjef can insert sigs" ON public.contract_signatures FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.contracts c WHERE c.id = contract_id AND is_bussjef_of_group(auth.uid(), c.group_id))
);

-- Chat channels
CREATE TABLE public.chat_channels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'group' CHECK (type IN ('group', 'announcement', 'admin', 'dm')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view channels" ON public.chat_channels FOR SELECT USING (is_member_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can insert channels" ON public.chat_channels FOR INSERT WITH CHECK (is_bussjef_of_group(auth.uid(), group_id));

-- Chat messages
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id uuid NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view messages" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_channels ch WHERE ch.id = channel_id AND is_member_of_group(auth.uid(), ch.group_id))
);
CREATE POLICY "Members can insert messages" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.members m WHERE m.id = member_id AND m.user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.chat_channels ch WHERE ch.id = channel_id AND is_member_of_group(auth.uid(), ch.group_id))
);

-- Events
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_type text NOT NULL DEFAULT 'event' CHECK (event_type IN ('payment', 'event', 'deadline', 'meeting')),
  event_date timestamp with time zone NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view events" ON public.events FOR SELECT USING (is_member_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can insert events" ON public.events FOR INSERT WITH CHECK (is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can update events" ON public.events FOR UPDATE USING (is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can delete events" ON public.events FOR DELETE USING (is_bussjef_of_group(auth.uid(), group_id));

-- Suppliers (global table)
CREATE TABLE public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  rating numeric DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  location text,
  contact_email text,
  contact_phone text,
  website text,
  org_nr text,
  address text,
  tags text[] DEFAULT '{}',
  warnings text[] DEFAULT '{}',
  complaint_count integer DEFAULT 0,
  logo_color text,
  logo_initials text,
  price_guide jsonb DEFAULT '[]'
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view suppliers" ON public.suppliers FOR SELECT USING (true);

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
