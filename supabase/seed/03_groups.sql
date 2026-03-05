-- Seed: groups
-- Idempotent: ON CONFLICT (id) DO NOTHING

INSERT INTO public.groups (
  id, name, year, city, member_count, total_budget,
  invite_code, created_by, created_at, logo_url, archived_at
) VALUES
  (
    'aec743b6-fceb-46ce-bfa0-bb962f43da9e',
    'Ohg gutter 2027', 2027, 'Oslo Handelsgymnasium', 30, 2700000,
    'OHGG-2027-WYJZ', 'a67c864e-8b20-4f84-9419-bdfb80a9226f',
    '2026-03-01 11:19:54.290963+00', NULL, NULL
  ),
  (
    '3db7b2e5-e376-4d98-bbbc-8c2d964ea849',
    'Test gruppe 123', 2026, 'Oslo', 24, 1500000,
    'TEST-2026-72QL', '3966ff23-f66b-48db-9bb2-3da9a82c5a14',
    '2026-03-02 13:52:14.909763+00', NULL, NULL
  ),
  (
    '1db6db46-a08e-4985-b8ab-44c4b1d1f5e6',
    'Elvebakken', 2026, 'Oslo', 24, 500000,
    'ELVE-2026-MQHH', '401e26e7-2f7c-468b-9e5f-1e8d966718e2',
    '2026-03-04 11:29:41.01248+00', NULL, NULL
  )
ON CONFLICT (id) DO NOTHING;
