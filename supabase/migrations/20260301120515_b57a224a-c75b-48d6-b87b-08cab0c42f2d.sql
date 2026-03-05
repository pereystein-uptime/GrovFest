
-- Add financial impact fields to polls
ALTER TABLE public.polls ADD COLUMN has_financial_impact boolean NOT NULL DEFAULT false;
ALTER TABLE public.polls ADD COLUMN financial_amount numeric;
ALTER TABLE public.polls ADD COLUMN financial_budget_item_id uuid REFERENCES public.budget_items(id);
ALTER TABLE public.polls ADD COLUMN financial_due_date date;

-- Add source tracking to budget_items
ALTER TABLE public.budget_items ADD COLUMN source_type text NOT NULL DEFAULT 'manual';
ALTER TABLE public.budget_items ADD COLUMN source_poll_id uuid REFERENCES public.polls(id);
