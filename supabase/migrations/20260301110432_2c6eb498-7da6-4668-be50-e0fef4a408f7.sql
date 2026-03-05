
-- Tables first
CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  year int NOT NULL,
  city text,
  member_count int NOT NULL DEFAULT 1,
  total_budget numeric DEFAULT 0,
  invite_code text UNIQUE NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  role text NOT NULL DEFAULT 'medlem',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE public.budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payment_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  due_date date NOT NULL,
  amount_per_member numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plan ENABLE ROW LEVEL SECURITY;

-- Helper functions (tables exist now)
CREATE OR REPLACE FUNCTION public.is_member_of_group(_user_id uuid, _group_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.members WHERE user_id = _user_id AND group_id = _group_id);
$$;

CREATE OR REPLACE FUNCTION public.is_bussjef_of_group(_user_id uuid, _group_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.members WHERE user_id = _user_id AND group_id = _group_id AND role = 'bussjef');
$$;

-- RLS: groups
CREATE POLICY "Anyone can select groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Auth users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Bussjef can update group" ON public.groups FOR UPDATE USING (public.is_bussjef_of_group(auth.uid(), id));

-- RLS: members
CREATE POLICY "Members can view group members" ON public.members FOR SELECT USING (public.is_member_of_group(auth.uid(), group_id));
CREATE POLICY "Users can insert themselves or bussjef can insert" ON public.members FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can update members" ON public.members FOR UPDATE USING (public.is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can delete members" ON public.members FOR DELETE USING (public.is_bussjef_of_group(auth.uid(), group_id));

-- RLS: budget_items
CREATE POLICY "Members can view budget" ON public.budget_items FOR SELECT USING (public.is_member_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can insert budget" ON public.budget_items FOR INSERT WITH CHECK (public.is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can update budget" ON public.budget_items FOR UPDATE USING (public.is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can delete budget" ON public.budget_items FOR DELETE USING (public.is_bussjef_of_group(auth.uid(), group_id));

-- RLS: payment_plan
CREATE POLICY "Members can view payment plan" ON public.payment_plan FOR SELECT USING (public.is_member_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can insert payment plan" ON public.payment_plan FOR INSERT WITH CHECK (public.is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can update payment plan" ON public.payment_plan FOR UPDATE USING (public.is_bussjef_of_group(auth.uid(), group_id));
CREATE POLICY "Bussjef can delete payment plan" ON public.payment_plan FOR DELETE USING (public.is_bussjef_of_group(auth.uid(), group_id));
