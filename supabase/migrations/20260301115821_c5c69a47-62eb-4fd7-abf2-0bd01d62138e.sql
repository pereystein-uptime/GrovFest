
-- New table: budget payment schedule (sub-payments per budget item)
CREATE TABLE public.budget_payment_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_item_id uuid NOT NULL REFERENCES public.budget_items(id) ON DELETE CASCADE,
  description text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'upcoming',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.budget_payment_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view budget schedules"
ON public.budget_payment_schedule FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.budget_items bi
  WHERE bi.id = budget_payment_schedule.budget_item_id
  AND is_member_of_group(auth.uid(), bi.group_id)
));

CREATE POLICY "Bussjef can insert budget schedules"
ON public.budget_payment_schedule FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.budget_items bi
  WHERE bi.id = budget_payment_schedule.budget_item_id
  AND is_bussjef_of_group(auth.uid(), bi.group_id)
));

CREATE POLICY "Bussjef can update budget schedules"
ON public.budget_payment_schedule FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.budget_items bi
  WHERE bi.id = budget_payment_schedule.budget_item_id
  AND is_bussjef_of_group(auth.uid(), bi.group_id)
));

CREATE POLICY "Bussjef can delete budget schedules"
ON public.budget_payment_schedule FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.budget_items bi
  WHERE bi.id = budget_payment_schedule.budget_item_id
  AND is_bussjef_of_group(auth.uid(), bi.group_id)
));

-- Add effective_from to payment_plan
ALTER TABLE public.payment_plan ADD COLUMN effective_from date;

-- Plan change log
CREATE TABLE public.plan_change_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  old_amount numeric NOT NULL DEFAULT 0,
  new_amount numeric NOT NULL DEFAULT 0,
  effective_from date NOT NULL,
  reason text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view plan change log"
ON public.plan_change_log FOR SELECT
USING (is_member_of_group(auth.uid(), group_id));

CREATE POLICY "Bussjef can insert plan change log"
ON public.plan_change_log FOR INSERT
WITH CHECK (is_bussjef_of_group(auth.uid(), group_id));

-- Add description column to budget_items for detail panel
ALTER TABLE public.budget_items ADD COLUMN description text DEFAULT '';
