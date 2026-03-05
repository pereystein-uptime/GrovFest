-- Seed: polls
-- Idempotent: ON CONFLICT (id) DO NOTHING

INSERT INTO public.polls (
  id, group_id, question, threshold, deadline,
  created_by, created_at,
  has_financial_impact, financial_amount, financial_budget_item_id, financial_due_date
) VALUES
  (
    '9b5a2586-036e-45c8-b4b3-7ec97c634ec0',
    'aec743b6-fceb-46ce-bfa0-bb962f43da9e',
    'Hvem skal vi bruke som klesleverandør?', 50,
    '2026-03-08 11:36:00.593+00',
    'a67c864e-8b20-4f84-9419-bdfb80a9226f',
    '2026-03-01 11:36:00.717627+00',
    false, NULL, NULL, NULL
  ),
  (
    '7a057896-6ae6-483e-a334-29df05b8432d',
    'aec743b6-fceb-46ce-bfa0-bb962f43da9e',
    'Hvem skal vi bruke til leie av buss?', 66,
    '2026-03-08 11:36:17.906+00',
    'a67c864e-8b20-4f84-9419-bdfb80a9226f',
    '2026-03-01 11:36:18.024877+00',
    false, NULL, NULL, NULL
  ),
  (
    'a78f2872-e656-417f-9021-b6e0ae308313',
    'aec743b6-fceb-46ce-bfa0-bb962f43da9e',
    'Øke budsjettet for å kjøpe klistremerker med 20k?', 75,
    '2026-03-08 12:16:34.202+00',
    'a67c864e-8b20-4f84-9419-bdfb80a9226f',
    '2026-03-01 12:16:34.324956+00',
    true, 20000, NULL, '2026-05-01'
  ),
  (
    'b6979f64-394f-4773-b297-0d509add76fe',
    'aec743b6-fceb-46ce-bfa0-bb962f43da9e',
    'Kjøpe nytt utstyr', 75,
    '2026-03-10 13:41:04.795+00',
    'a67c864e-8b20-4f84-9419-bdfb80a9226f',
    '2026-03-03 13:41:05.037342+00',
    true, 50000, NULL, '2026-03-05'
  ),
  (
    '004a0c65-9bfd-4e44-b850-264167e26df9',
    'aec743b6-fceb-46ce-bfa0-bb962f43da9e',
    'Kjøpe nytt utstyr', 75,
    '2026-03-10 13:41:05.474+00',
    'a67c864e-8b20-4f84-9419-bdfb80a9226f',
    '2026-03-03 13:41:05.680809+00',
    true, 50000, NULL, '2026-03-05'
  )
ON CONFLICT (id) DO NOTHING;
