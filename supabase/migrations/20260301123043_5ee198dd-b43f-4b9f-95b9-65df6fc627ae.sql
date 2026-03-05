
-- Create roles table
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  permission_level text NOT NULL DEFAULT 'member',
  color text NOT NULL DEFAULT 'gray',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view roles" ON public.roles
  FOR SELECT USING (is_member_of_group(auth.uid(), group_id));

CREATE POLICY "Admin can insert roles" ON public.roles
  FOR INSERT WITH CHECK (is_bussjef_of_group(auth.uid(), group_id));

CREATE POLICY "Admin can update roles" ON public.roles
  FOR UPDATE USING (is_bussjef_of_group(auth.uid(), group_id));

CREATE POLICY "Admin can delete roles" ON public.roles
  FOR DELETE USING (is_bussjef_of_group(auth.uid(), group_id));

-- Seed default roles for all existing groups
INSERT INTO public.roles (group_id, name, permission_level, color, is_default)
SELECT id, 'Bussjef', 'admin', 'blue', true FROM public.groups
UNION ALL
SELECT id, 'Økonomisjef', 'admin', 'green', true FROM public.groups
UNION ALL
SELECT id, 'Musikksjef', 'admin', 'purple', true FROM public.groups
UNION ALL
SELECT id, 'Medlem', 'member', 'gray', true FROM public.groups;

-- Add role_id column to members
ALTER TABLE public.members ADD COLUMN role_id uuid REFERENCES public.roles(id);

-- Migrate existing role text values to role_id
UPDATE public.members m
SET role_id = r.id
FROM public.roles r
WHERE r.group_id = m.group_id
  AND (
    (m.role = 'bussjef' AND r.name = 'Bussjef')
    OR (m.role = 'medlem' AND r.name = 'Medlem')
  );

-- Map old kasserer/styremedlem/festsjef to Medlem role for now (they'll be reassigned)
UPDATE public.members m
SET role_id = r.id
FROM public.roles r
WHERE r.group_id = m.group_id
  AND r.name = 'Medlem'
  AND m.role_id IS NULL;

-- Create is_admin_of_group function that checks permission_level
CREATE OR REPLACE FUNCTION public.is_admin_of_group(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members m
    JOIN public.roles r ON r.id = m.role_id
    WHERE m.user_id = _user_id
      AND m.group_id = _group_id
      AND m.removed_at IS NULL
      AND r.permission_level = 'admin'
  )
$$;

-- Update is_bussjef_of_group to use permission_level (backward compat with role text fallback)
CREATE OR REPLACE FUNCTION public.is_bussjef_of_group(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members m
    LEFT JOIN public.roles r ON r.id = m.role_id
    WHERE m.user_id = _user_id
      AND m.group_id = _group_id
      AND m.removed_at IS NULL
      AND (
        r.permission_level = 'admin'
        OR m.role = 'bussjef'
      )
  )
$$;

-- Update is_member_of_group to exclude removed members
CREATE OR REPLACE FUNCTION public.is_member_of_group(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members
    WHERE user_id = _user_id
      AND group_id = _group_id
      AND removed_at IS NULL
  )
$$;

-- Enable realtime for roles
ALTER PUBLICATION supabase_realtime ADD TABLE public.roles;
