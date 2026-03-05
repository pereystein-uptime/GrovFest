-- Seed: auth.users
-- Test password for all users: testpassword
-- Idempotent: ON CONFLICT (id) DO NOTHING

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change_token_new, email_change
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'a67c864e-8b20-4f84-9419-bdfb80a9226f',
    'authenticated', 'authenticated',
    'kristoffer@ohg2027.no',
    crypt('testpassword', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    false, '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '3966ff23-f66b-48db-9bb2-3da9a82c5a14',
    'authenticated', 'authenticated',
    'test@test.no',
    crypt('testpassword', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    false, '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '401e26e7-2f7c-468b-9e5f-1e8d966718e2',
    'authenticated', 'authenticated',
    'test@russeos.no',
    crypt('testpassword', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    false, '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at, provider_id
) VALUES
  (
    'a67c864e-8b20-4f84-9419-bdfb80a9226f',
    'a67c864e-8b20-4f84-9419-bdfb80a9226f',
    '{"sub":"a67c864e-8b20-4f84-9419-bdfb80a9226f","email":"kristoffer@ohg2027.no"}',
    'email', now(), now(), now(),
    'kristoffer@ohg2027.no'
  ),
  (
    '3966ff23-f66b-48db-9bb2-3da9a82c5a14',
    '3966ff23-f66b-48db-9bb2-3da9a82c5a14',
    '{"sub":"3966ff23-f66b-48db-9bb2-3da9a82c5a14","email":"test@test.no"}',
    'email', now(), now(), now(),
    'test@test.no'
  ),
  (
    '401e26e7-2f7c-468b-9e5f-1e8d966718e2',
    '401e26e7-2f7c-468b-9e5f-1e8d966718e2',
    '{"sub":"401e26e7-2f7c-468b-9e5f-1e8d966718e2","email":"test@russeos.no"}',
    'email', now(), now(), now(),
    'test@russeos.no'
  )
ON CONFLICT (id) DO NOTHING;
-- Seed: suppliers (global reference table)
-- Idempotent: ON CONFLICT (id) DO NOTHING

INSERT INTO public.suppliers (
  id, name, category, description, rating, verified,
  location, contact_email, contact_phone, website, org_nr,
  address, tags, warnings, complaint_count, logo_color, logo_initials, price_guide
) VALUES
  (
    '34ca967b-484c-4b81-949a-8eed550cd939',
    'Fristil AS', 'Bussutleie og transport',
    'Norges største russebussutleier. Leverer ferdig oppbygde busser med lyd, lys og wrapping. Alt-i-ett-løsning.',
    4.8, true, 'Bergen', 'post@fristil.no', '+47 55 32 10 00', 'fristil.no', '912 345 678',
    'Damsgårdsveien 82, Bergen',
    ARRAY['Bussutleie', 'Wrapping', 'Lyd & lys'],
    ARRAY[]::text[], 0, '#1a1f36', 'F',
    '[{"price":"450 000 – 800 000 kr","service":"Bussleie standard"},{"price":"700 000 – 1 200 000 kr","service":"Komplett pakke"},{"price":"40 000 – 80 000 kr","service":"Wrapping"},{"price":"25 000 – 50 000 kr","service":"Serviceavtale"}]'::jsonb
  ),
  (
    '61457532-6957-4d3e-ad68-b0bb57ba94f6',
    'Russedress AS', 'Russeklær og merch',
    'Markedsleder på russedresser i Norge. Kvalitetsprodukter med kort leveringstid og mulighet for full tilpasning.',
    4.9, true, 'Oslo', 'hei@russedress.no', '+47 22 44 55 66', 'russedress.no', '923 456 789',
    'Storgata 12, Oslo',
    ARRAY['Russedress', 'Merch', 'Tilpasning'],
    ARRAY[]::text[], 0, '#c41e3a', 'R',
    '[{"price":"1 200 – 1 800 kr/stk","service":"Standard dress"},{"price":"1 800 – 2 500 kr/stk","service":"Premium dress"},{"price":"150 – 300 kr/stk","service":"Russelue"},{"price":"200 – 500 kr/stk","service":"Merch-pakke"}]'::jsonb
  ),
  (
    'ce58ca1f-4ba5-40a6-886c-b2e435446a5b',
    'Busskompaniet', 'Bussutleie og oppbygging',
    'Spesialisert på skreddersydde russebusser. Tilbyr fleksible betalingsplaner og teknisk support gjennom hele russetiden.',
    4.6, true, 'Oslo', 'info@busskompaniet.no', '+47 21 33 44 55', 'busskompaniet.no', '934 567 890',
    'Brobekkveien 54, Oslo',
    ARRAY['Bussutleie', 'Oppbygging', 'Support'],
    ARRAY[]::text[], 0, '#2563eb', 'BK',
    '[{"price":"400 000 – 750 000 kr","service":"Bussleie"},{"price":"600 000 – 1 000 000 kr","service":"Oppbygging"},{"price":"30 000 – 60 000 kr","service":"Teknisk support"}]'::jsonb
  ),
  (
    '2f34b4b1-f8b5-4dd1-aeb9-e47356649132',
    'Merkbart', 'Design og trykk',
    'Logodesign, wrapping-design, russekort og merch-trykk. Erfarne designere som har jobbet med hundrevis av russegrupper.',
    4.7, true, 'Trondheim', 'hello@merkbart.no', '+47 73 50 60 70', 'merkbart.no', '945 678 901',
    'Fjordgata 30, Trondheim',
    ARRAY['Logo', 'Wrapping', 'Russekort'],
    ARRAY[]::text[], 0, '#7c3aed', 'M',
    '[{"price":"8 000 – 25 000 kr","service":"Logodesign"},{"price":"15 000 – 35 000 kr","service":"Wrapping-design"},{"price":"3 000 – 6 000 kr","service":"Russekort 1000 stk"},{"price":"5 000 – 15 000 kr","service":"Merch-design"}]'::jsonb
  ),
  (
    'd921fdf0-81f9-47b6-b5c7-73bce9a5cc2e',
    'Russeservice', 'Lyd, lys og teknisk',
    'Komplett lydanlegg, lysrigg og teknisk installasjon for russebusser. Tilbyr serviceavtaler gjennom hele russetiden.',
    4.5, true, 'Landsdekkende', 'kontakt@russeservice.no', '+47 40 00 50 60', 'russeservice.no', '956 789 012',
    'Landsdekkende, Drammen',
    ARRAY['Lyd', 'Lys', 'Installasjon'],
    ARRAY[]::text[], 0, '#059669', 'RS',
    '[{"price":"80 000 – 200 000 kr","service":"Lydanlegg komplett"},{"price":"40 000 – 100 000 kr","service":"Lysrigg"},{"price":"20 000 – 40 000 kr","service":"Installasjon"},{"price":"15 000 – 30 000 kr","service":"Serviceavtale"}]'::jsonb
  ),
  (
    '2c39475e-c10f-403e-92ec-1a634706323d',
    'Russens Bestevenn', 'Bussutleie',
    'Flere rapporter om forsinket levering, skjulte kostnader i kontrakter, og manglende teknisk support underveis i russetiden.',
    1.8, false, NULL, NULL, NULL, NULL, NULL, NULL,
    ARRAY[]::text[],
    ARRAY['Forsinket levering (8 rapporter)', 'Skjulte kostnader i kontrakt', 'Manglende support'],
    12, '#fce4e4', 'RB', '[]'::jsonb
  ),
  (
    'e75c1296-a7ff-4717-beca-04e6ce4d5044',
    'Centrum Records', 'Musikk og artister',
    'Booking av artister som ikke dukker opp, dårlig kommunikasjon og manglende refusjon ved avlysning.',
    1.5, false, NULL, NULL, NULL, NULL, NULL, NULL,
    ARRAY[]::text[],
    ARRAY['Artister møtte ikke opp (5 rapporter)', 'Nekter refusjon ved avlysning'],
    9, '#fce4e4', 'CR', '[]'::jsonb
  ),
  (
    '3b994059-a93f-4e5a-a21e-5d4b7323bc3c',
    '151 Records', 'Musikk og artister',
    'Overprisede bookinger, aggressive salgsmetoder rettet mot unge. Bruker press og FOMO-taktikker for å signere kontrakter raskt.',
    2.0, false, NULL, NULL, NULL, NULL, NULL, NULL,
    ARRAY[]::text[],
    ARRAY['Overpriset sammenlignet med markedet', 'Aggressive salgsmetoder', 'Låser grupper i lange kontrakter'],
    15, '#fce4e4', '151', '[]'::jsonb
  ),
  (
    'f059694a-68ac-4f7a-935b-77fff1a17eb9',
    'Edge', 'Events og arrangementer',
    'Lover store arrangementer som aldri blir som lovet. Dårlig sikkerhet, underdimensjonert kapasitet, og uklare vilkår for refusjon.',
    2.1, false, NULL, NULL, NULL, NULL, NULL, NULL,
    ARRAY[]::text[],
    ARRAY['Arrangementer leverer ikke som lovet', 'Mangelfull sikkerhet'],
    7, '#fce4e4', 'E', '[]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
-- Seed: supplier_contacts
-- Reconstructed from chat message content
-- Idempotent: ON CONFLICT (id) DO NOTHING

INSERT INTO public.supplier_contacts (id, supplier_id, name, role, avatar_color, created_at)
VALUES
  (
    'a1b2c3d4-0001-4000-a000-000000000001',
    '61457532-6957-4d3e-ad68-b0bb57ba94f6',
    'Henrik', 'Kundeansvarlig', '#c41e3a',
    '2026-03-02 12:00:00+00'
  ),
  (
    'a1b2c3d4-0002-4000-a000-000000000002',
    '34ca967b-484c-4b81-949a-8eed550cd939',
    'Lars Erik', 'Prosjektleder', '#1a1f36',
    '2026-03-02 12:00:00+00'
  ),
  (
    'a1b2c3d4-0003-4000-a000-000000000003',
    'ce58ca1f-4ba5-40a6-886c-b2e435446a5b',
    'Martin', 'Teknisk ansvarlig', '#2563eb',
    '2026-03-02 12:00:00+00'
  )
ON CONFLICT (id) DO NOTHING;
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
-- Seed: members
-- role_id set to NULL — is_bussjef_of_group() falls back to role text field
-- Idempotent: ON CONFLICT (id) DO NOTHING

INSERT INTO public.members (
  id, group_id, user_id, name, email, role,
  joined_at, removed_at, last_login_at, invited_email,
  role_id, phone, avatar_url
) VALUES
  (
    '5380ab14-ecb5-4de2-aca4-3affe245f251',
    'aec743b6-fceb-46ce-bfa0-bb962f43da9e',
    'a67c864e-8b20-4f84-9419-bdfb80a9226f',
    'Kristoffer Viken', 'kristoffer@ohg2027.no', 'bussjef',
    '2026-03-01 11:19:54.470465+00', NULL, NULL, NULL,
    NULL, NULL, NULL
  ),
  (
    '1b45581f-baf8-4f7e-87ed-3a0b6fd50b54',
    '3db7b2e5-e376-4d98-bbbc-8c2d964ea849',
    '3966ff23-f66b-48db-9bb2-3da9a82c5a14',
    'Test testesen', 'test@test.no', 'bussjef',
    '2026-03-02 13:52:15.528568+00', NULL, NULL, NULL,
    NULL, NULL, NULL
  ),
  (
    'b817804a-c3e5-4fbe-b2ed-aa2543fe1588',
    '1db6db46-a08e-4985-b8ab-44c4b1d1f5e6',
    '401e26e7-2f7c-468b-9e5f-1e8d966718e2',
    'Test Bruker', 'test@russeos.no', 'bussjef',
    '2026-03-04 11:29:41.398785+00', NULL, NULL, NULL,
    NULL, NULL, NULL
  )
ON CONFLICT (id) DO NOTHING;
-- Seed: budget_items
-- Idempotent: ON CONFLICT (id) DO NOTHING

INSERT INTO public.budget_items (
  id, group_id, name, amount, created_at, description, source_type, source_poll_id
) VALUES
  ('6356f971-c419-4aa5-90c8-acda2ad98fd2', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', 'Lyd og lys', 500000, '2026-03-01 11:19:54.624634+00', '', 'manual', NULL),
  ('ad796999-7e71-444b-b182-a088707f1c86', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', 'Musikk', 350000, '2026-03-01 11:19:54.624634+00', '', 'manual', NULL),
  ('f6613ad4-8600-4400-bf44-fdffa1868922', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', 'Sjåfør', 200000, '2026-03-01 11:19:54.624634+00', '', 'manual', NULL),
  ('7ea69c43-f172-4fdb-9785-d5fa4a944fb4', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', 'Krisekasse', 150000, '2026-03-01 11:19:54.624634+00', '', 'manual', NULL),
  ('90c62b06-1269-4d50-bc00-cf11d78a4c83', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', 'Leie buss', 1500000, '2026-03-01 11:19:54.624634+00', '', 'manual', NULL),
  ('64ec3062-cad5-4ec7-b6f2-16a034c03c64', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', 'Kjøp av maling', 50000, '2026-03-03 13:39:37.863086+00', '', 'manual', NULL),
  ('01c92f88-60a2-4692-8798-d54a5628f1a5', '3db7b2e5-e376-4d98-bbbc-8c2d964ea849', 'Leie av russebuss', 500000, '2026-03-02 13:52:15.873693+00', '', 'manual', NULL),
  ('dde5fa13-e616-4a63-873f-a44410a05d7b', '3db7b2e5-e376-4d98-bbbc-8c2d964ea849', 'Artister', 350000, '2026-03-02 13:52:15.873693+00', '', 'manual', NULL),
  ('46d266fd-4b51-4965-b0fd-b6418614a873', '3db7b2e5-e376-4d98-bbbc-8c2d964ea849', 'Lyd og lys', 350000, '2026-03-02 13:52:15.873693+00', '', 'manual', NULL),
  ('13b98541-e12e-445a-824d-310181e81cde', '3db7b2e5-e376-4d98-bbbc-8c2d964ea849', 'Annet', 300000, '2026-03-02 13:52:15.873693+00', '', 'manual', NULL),
  ('7197abb2-feb6-4dbe-af1c-f4abfb550b39', '1db6db46-a08e-4985-b8ab-44c4b1d1f5e6', 'Russebuss', 200000, '2026-03-04 11:29:41.566317+00', '', 'manual', NULL),
  ('b4163813-8bf9-428d-a953-3b6ef79f224e', '1db6db46-a08e-4985-b8ab-44c4b1d1f5e6', 'Diverse', 300000, '2026-03-04 11:29:41.566317+00', '', 'manual', NULL)
ON CONFLICT (id) DO NOTHING;
-- Seed: budget_payment_schedule
-- Idempotent: ON CONFLICT (id) DO NOTHING

INSERT INTO public.budget_payment_schedule (
  id, budget_item_id, description, amount, due_date, status, created_at
) VALUES
  ('5b503b6c-66bc-46da-b0d3-a3e307075d24', '90c62b06-1269-4d50-bc00-cf11d78a4c83', 'Depositum',    500000, '2026-05-15', 'upcoming', '2026-03-01 12:02:38.402857+00'),
  ('91064619-53b1-46ed-ac24-c60151fc648c', '90c62b06-1269-4d50-bc00-cf11d78a4c83', 'Betaling',     300000, '2026-06-18', 'upcoming', '2026-03-01 12:02:38.402857+00'),
  ('de897127-c2ba-43c4-99b7-6a9836cd75ee', '90c62b06-1269-4d50-bc00-cf11d78a4c83', 'Restbetaling', 700000, '2026-08-15', 'upcoming', '2026-03-01 12:02:38.402857+00')
ON CONFLICT (id) DO NOTHING;
-- Seed: payment_plan
-- Idempotent: ON CONFLICT (id) DO NOTHING

INSERT INTO public.payment_plan (
  id, group_id, due_date, amount_per_member, created_at, effective_from
) VALUES
  -- Ohg gutter 2027 (original plan)
  ('5346fa97-014b-4a84-b065-66a3bff001cf', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2025-09-01', 10000, '2026-03-01 11:19:54.781175+00', NULL),
  ('aca15323-9753-47ae-9ce5-34ddcd5383d3', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2025-10-01', 10000, '2026-03-01 11:19:54.781175+00', NULL),
  ('b6d5fd2e-cba5-4ec7-bce4-55ea6e9a4c95', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2025-11-01', 10000, '2026-03-01 11:19:54.781175+00', NULL),
  ('bdfc74b0-4a7e-4ddc-aed6-791e4b1c72ec', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2025-12-01', 10000, '2026-03-01 11:19:54.781175+00', NULL),
  ('809229f7-a0c3-4d4d-a5b7-11d4429d1617', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-01-01', 10000, '2026-03-01 11:19:54.781175+00', NULL),
  ('9c760359-e989-4f30-af7e-13daeb1757a7', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-02-01', 10000, '2026-03-01 11:19:54.781175+00', NULL),
  ('8e648a04-c990-4837-b2f4-1b3c6789d527', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-03-01', 10000, '2026-03-01 11:19:54.781175+00', NULL),
  ('284274fe-fe62-4b41-928c-330b61b4c5b5', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-04-01', 10000, '2026-03-01 11:19:54.781175+00', NULL),
  ('a26ff38f-25ae-4638-9960-994140c7cdf1', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-05-01', 10000, '2026-03-01 11:19:54.781175+00', NULL),
  -- Ohg gutter 2027 (revised plan from 2026-05-03)
  ('867e9701-b628-4069-baa7-ff34e439c43f', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-06-03', 10000, '2026-03-03 13:37:26.30452+00',  '2026-05-03'),
  ('4c9cb23f-fcdb-4690-85c5-78a6f5735b61', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-07-03', 10000, '2026-03-03 13:37:26.46837+00',  '2026-05-03'),
  ('96aef877-02e1-4c77-9986-078b423af785', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-08-03', 10000, '2026-03-03 13:37:26.621711+00', '2026-05-03'),
  ('e79987ef-a4e5-41fe-944f-1abeb9081fd7', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-09-03', 10000, '2026-03-03 13:37:26.789274+00', '2026-05-03'),
  ('989900f5-5db5-42b7-a4d8-689994a0ccd8', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-10-03', 10000, '2026-03-03 13:37:26.944576+00', '2026-05-03'),
  ('4f3ae5f9-4bdd-4915-8140-a6fe9940f12c', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-11-03', 10000, '2026-03-03 13:37:27.126927+00', '2026-05-03'),
  ('840a26d9-cec3-4aad-8838-7250f6890273', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-12-03', 10000, '2026-03-03 13:37:27.282421+00', '2026-05-03'),
  ('5160968f-fbed-4795-ba18-0abf28971d55', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2027-01-03', 10000, '2026-03-03 13:37:27.438917+00', '2026-05-03'),
  ('f272f6a9-c2f3-471c-b06a-d7e1313ab1ec', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-06-03', 10000, '2026-03-03 13:37:27.56084+00',  '2026-05-03'),
  ('605becd8-5c9f-42fb-94db-26a9055b0977', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2027-02-03', 10000, '2026-03-03 13:37:27.585019+00', '2026-05-03'),
  ('57c19856-ed3d-4a10-9935-2bdb7b656128', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-07-03', 10000, '2026-03-03 13:37:27.697036+00', '2026-05-03'),
  ('26737d35-6ed7-4fac-ad03-89211d807f7b', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2027-03-03', 10000, '2026-03-03 13:37:27.698567+00', '2026-05-03'),
  ('ff913047-7566-4a73-a01d-b77bcd269dd2', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-08-03', 10000, '2026-03-03 13:37:27.81145+00',  '2026-05-03'),
  ('a401c671-61ee-46ca-973d-d3d9b186362e', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-09-03', 10000, '2026-03-03 13:37:27.935338+00', '2026-05-03'),
  ('3fa5b20b-703f-41df-a497-48115299706a', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-10-03', 10000, '2026-03-03 13:37:28.0699+00',   '2026-05-03'),
  ('69ae5fc7-f121-4e88-808c-4152b4630f45', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-11-03', 10000, '2026-03-03 13:37:28.179788+00', '2026-05-03'),
  ('830f8e7c-fbe2-4de6-a352-678ccba5cc0a', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-06-03', 10000, '2026-03-03 13:37:28.212406+00', '2026-05-03'),
  ('11bb29ae-9898-4a4c-bf3e-ffbf3cda85a9', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-12-03', 10000, '2026-03-03 13:37:28.307049+00', '2026-05-03'),
  ('d4be888c-0c85-4db4-8039-e67392ebc22b', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-07-03', 10000, '2026-03-03 13:37:28.320547+00', '2026-05-03'),
  ('047e04e7-3667-47ab-813b-670be7c3112c', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-08-03', 10000, '2026-03-03 13:37:28.518971+00', '2026-05-03'),
  ('14aa4c68-762f-41be-a8b6-e87d8dd865e4', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2027-01-03', 10000, '2026-03-03 13:37:28.519312+00', '2026-05-03'),
  ('4cab7cbd-d71d-41ee-ada1-5751dfc07fce', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2027-02-03', 10000, '2026-03-03 13:37:28.643064+00', '2026-05-03'),
  ('875f8c84-8ad1-47c1-a926-ac2565d30cb0', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-09-03', 10000, '2026-03-03 13:37:28.643599+00', '2026-05-03'),
  ('ea50b821-6506-4573-943f-22e070be9b51', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-10-03', 10000, '2026-03-03 13:37:28.761183+00', '2026-05-03'),
  ('18369228-9bd2-4bdd-aff2-91e79d170b2b', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2027-03-03', 10000, '2026-03-03 13:37:28.805032+00', '2026-05-03'),
  ('457d74ba-f977-4199-823f-a006655bf8e8', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-11-03', 10000, '2026-03-03 13:37:28.902576+00', '2026-05-03'),
  ('742a8c7b-3401-435f-ab49-54953f7b9b93', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2026-12-03', 10000, '2026-03-03 13:37:29.031056+00', '2026-05-03'),
  ('0f3cfd40-a827-4ba2-9359-39f180acda52', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2027-01-03', 10000, '2026-03-03 13:37:29.45833+00',  '2026-05-03'),
  ('e2b6a608-e570-4168-82da-4e5e660e7d07', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2027-02-03', 10000, '2026-03-03 13:37:29.55804+00',  '2026-05-03'),
  ('e77f91e1-0b46-4177-9e0d-1d9fa4b22b48', 'aec743b6-fceb-46ce-bfa0-bb962f43da9e', '2027-03-03', 10000, '2026-03-03 13:37:29.668555+00', '2026-05-03'),
  -- Test gruppe 123
  ('d1acb8fe-fe4d-46da-ab63-47fae871f836', '3db7b2e5-e376-4d98-bbbc-8c2d964ea849', '2026-04-01', 6944, '2026-03-02 13:52:16.185004+00', NULL),
  ('93df7b06-1bf0-4768-a042-07c4e626d4d0', '3db7b2e5-e376-4d98-bbbc-8c2d964ea849', '2026-05-01', 6944, '2026-03-02 13:52:16.185004+00', NULL),
  ('fab64afa-c590-48d7-abd2-3a931a55753f', '3db7b2e5-e376-4d98-bbbc-8c2d964ea849', '2026-06-01', 6944, '2026-03-02 13:52:16.185004+00', NULL),
  ('e68333be-2871-43e9-9fd2-2e7cd27a83c9', '3db7b2e5-e376-4d98-bbbc-8c2d964ea849', '2026-07-01', 6944, '2026-03-02 13:52:16.185004+00', NULL),
  ('cedf8b62-e187-4eaa-a71d-8a275bcdc0bc', '3db7b2e5-e376-4d98-bbbc-8c2d964ea849', '2026-08-01', 6944, '2026-03-02 13:52:16.185004+00', NULL),
  ('e94f834a-b7f6-47cf-a05d-19853b49350b', '3db7b2e5-e376-4d98-bbbc-8c2d964ea849', '2026-09-01', 6944, '2026-03-02 13:52:16.185004+00', NULL),
  ('c15e0c43-31cc-48c5-84e9-6f05073e55f2', '3db7b2e5-e376-4d98-bbbc-8c2d964ea849', '2026-10-01', 6944, '2026-03-02 13:52:16.185004+00', NULL),
  ('3524c4ab-3abf-4999-919f-42b168ac1383', '3db7b2e5-e376-4d98-bbbc-8c2d964ea849', '2026-11-01', 6944, '2026-03-02 13:52:16.185004+00', NULL),
  ('15f14b20-acc2-4e62-9982-667c31012165', '3db7b2e5-e376-4d98-bbbc-8c2d964ea849', '2026-12-01', 6948, '2026-03-02 13:52:16.185004+00', NULL),
  -- Elvebakken
  ('23ac5de5-3ad6-434c-8683-5e3347eb3a53', '1db6db46-a08e-4985-b8ab-44c4b1d1f5e6', '2025-08-01', 2315, '2026-03-04 11:29:41.756995+00', NULL),
  ('60c04502-ebbf-4e6b-a288-61a05820a9f5', '1db6db46-a08e-4985-b8ab-44c4b1d1f5e6', '2025-09-01', 2315, '2026-03-04 11:29:41.756995+00', NULL),
  ('7c4cde5a-0b6c-424f-97c5-c348bbbd6b45', '1db6db46-a08e-4985-b8ab-44c4b1d1f5e6', '2025-10-01', 2315, '2026-03-04 11:29:41.756995+00', NULL),
  ('db4b50fc-d204-45b8-91cb-ad928d5e0c51', '1db6db46-a08e-4985-b8ab-44c4b1d1f5e6', '2025-11-01', 2315, '2026-03-04 11:29:41.756995+00', NULL),
  ('f6738163-0d61-4bfd-a953-cd857e1e19e5', '1db6db46-a08e-4985-b8ab-44c4b1d1f5e6', '2025-12-01', 2315, '2026-03-04 11:29:41.756995+00', NULL),
  ('20531ad2-200f-492b-b216-b60d26506931', '1db6db46-a08e-4985-b8ab-44c4b1d1f5e6', '2026-01-01', 2315, '2026-03-04 11:29:41.756995+00', NULL),
  ('7ade0b19-363d-453b-8ac1-f3d303e95dd9', '1db6db46-a08e-4985-b8ab-44c4b1d1f5e6', '2026-02-01', 2315, '2026-03-04 11:29:41.756995+00', NULL),
  ('b7423365-23d7-436e-9905-17637097c221', '1db6db46-a08e-4985-b8ab-44c4b1d1f5e6', '2026-03-01', 2315, '2026-03-04 11:29:41.756995+00', NULL),
  ('932d7181-ba29-469e-af93-636677d50d20', '1db6db46-a08e-4985-b8ab-44c4b1d1f5e6', '2026-04-01', 2313, '2026-03-04 11:29:41.756995+00', NULL)
ON CONFLICT (id) DO NOTHING;
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
-- Seed: poll_options
-- Idempotent: ON CONFLICT (id) DO NOTHING

INSERT INTO public.poll_options (id, poll_id, label, sort_order)
VALUES
  ('c6e3c43a-01f2-4693-9d9a-a2ab0557e0e4', '9b5a2586-036e-45c8-b4b3-7ec97c634ec0', 'Russedress',       0),
  ('dd014de9-f3e1-4755-80ae-8074d81486d6', '9b5a2586-036e-45c8-b4b3-7ec97c634ec0', 'Russeprofilering', 1),
  ('1fb88c46-e02f-48eb-85b0-8512c96b3668', '7a057896-6ae6-483e-a334-29df05b8432d', 'FT Utleie',        0),
  ('8b749300-a7d0-45c2-8337-849c8502715b', '7a057896-6ae6-483e-a334-29df05b8432d', 'Busskompaniet',    1),
  ('0f267bcf-dcec-4bcb-836c-04933e682b2f', 'a78f2872-e656-417f-9021-b6e0ae308313', 'Ja',               0),
  ('382b785f-fdf5-4378-a2f9-0fc27cf63f45', 'a78f2872-e656-417f-9021-b6e0ae308313', 'Nei',              1),
  ('9de6af5e-9a3e-4da0-a966-90da573385a3', 'b6979f64-394f-4773-b297-0d509add76fe', 'Ja',               0),
  ('1f1905ba-f964-4c72-b506-88b25a5dadfa', 'b6979f64-394f-4773-b297-0d509add76fe', 'Nei',              1),
  ('e8202808-c365-40ea-a6ff-6767a6c62b7e', '004a0c65-9bfd-4e44-b850-264167e26df9', 'Ja',               0),
  ('4d68b9f4-315f-4519-8b39-9f12a1b3947b', '004a0c65-9bfd-4e44-b850-264167e26df9', 'Nei',              1)
ON CONFLICT (id) DO NOTHING;
-- Seed: chat_channels
-- Idempotent: ON CONFLICT (id) DO NOTHING

INSERT INTO public.chat_channels (
  id, group_id, name, type, created_at, participants, created_by, supplier_id
) VALUES
  (
    '2983e8f1-ce82-4e5f-b5aa-4a9697e1a7de',
    'aec743b6-fceb-46ce-bfa0-bb962f43da9e',
    'Felleschat', 'group', '2026-03-01 11:39:38.286715+00',
    '{}', NULL, NULL
  ),
  (
    '3df49148-7553-4a33-9f5b-045954409d07',
    'aec743b6-fceb-46ce-bfa0-bb962f43da9e',
    'Kunngjøringer', 'announcement', '2026-03-01 11:39:44.570264+00',
    '{}', NULL, NULL
  ),
  (
    'b1b2c3d4-0001-4000-b000-000000000001',
    'aec743b6-fceb-46ce-bfa0-bb962f43da9e',
    'Russedress AS', 'supplier', '2026-03-02 12:15:05.554852+00',
    '{}', NULL, '61457532-6957-4d3e-ad68-b0bb57ba94f6'
  ),
  (
    'b1b2c3d4-0002-4000-b000-000000000002',
    'aec743b6-fceb-46ce-bfa0-bb962f43da9e',
    'Fristil AS', 'supplier', '2026-03-02 12:15:05.554852+00',
    '{}', NULL, '34ca967b-484c-4b81-949a-8eed550cd939'
  ),
  (
    'b1b2c3d4-0003-4000-b000-000000000003',
    'aec743b6-fceb-46ce-bfa0-bb962f43da9e',
    'Busskompaniet', 'supplier', '2026-03-02 12:15:05.554852+00',
    '{}', NULL, 'ce58ca1f-4ba5-40a6-886c-b2e435446a5b'
  )
ON CONFLICT (id) DO NOTHING;
-- Seed: chat_messages
-- Idempotent: ON CONFLICT (id) DO NOTHING

INSERT INTO public.chat_messages (
  id, channel_id, member_id, content, created_at,
  reply_to, forwarded_from, edited_at, deleted_at, supplier_contact_id
) VALUES
  -- Kunngjøringer
  ('d815eeea-4e7c-443f-8a3b-55b7428b438e', '3df49148-7553-4a33-9f5b-045954409d07', '5380ab14-ecb5-4de2-aca4-3affe245f251', 'Test kunngjøring for alle', '2026-03-01 11:39:50.520137+00', NULL, NULL, NULL, NULL, NULL),
  -- Felleschat
  ('bb3ad9ef-fe9a-4cb5-a070-f1a87576807e', '2983e8f1-ce82-4e5f-b5aa-4a9697e1a7de', '5380ab14-ecb5-4de2-aca4-3affe245f251', 'test', '2026-03-01 11:49:11.714859+00', NULL, NULL, NULL, NULL, NULL),
  -- Russedress AS (supplier channel)
  ('f54cc606-483f-4e6c-bbca-76412af86c02', 'b1b2c3d4-0001-4000-b000-000000000001', NULL, 'Hei Bergansen! Velkommen som kunde 🎉 Jeg er kontaktpersonen deres hos Russedress. Spør meg om hva som helst — leveringstider, størrelser, tilpasninger osv.', '2026-02-10 10:15:00+00', NULL, NULL, NULL, NULL, 'a1b2c3d4-0001-4000-a000-000000000001'),
  ('7147a836-cb28-4232-aa24-e70ae6a4b83e', 'b1b2c3d4-0001-4000-b000-000000000001', '5380ab14-ecb5-4de2-aca4-3affe245f251', 'Hei Henrik! Vi er 24 stk, kan vi få en oversikt over størrelsesguiden?', '2026-02-10 12:30:00+00', NULL, NULL, NULL, NULL, NULL),
  ('4d30d116-db47-40d9-aa01-9490b94f1be9', 'b1b2c3d4-0001-4000-b000-000000000001', NULL, 'Selvfølgelig! Her er størrelsesguiden 👇', '2026-02-10 12:45:00+00', NULL, NULL, NULL, NULL, 'a1b2c3d4-0001-4000-a000-000000000001'),
  ('51fec287-905c-4321-b5a1-e142bc80f2b0', 'b1b2c3d4-0001-4000-b000-000000000001', NULL, 'Anbefaler at alle måler seg og sender inn størrelse innen 1. mars for å sikre leveranse i god tid.', '2026-02-10 12:46:00+00', NULL, NULL, NULL, NULL, 'a1b2c3d4-0001-4000-a000-000000000001'),
  ('4449d290-6dec-48f3-b2cc-0444867e20de', 'b1b2c3d4-0001-4000-b000-000000000001', '5380ab14-ecb5-4de2-aca4-3affe245f251', 'Alle har sendt inn! 24 dresser, se vedlagt liste.', '2026-02-12 09:00:00+00', NULL, NULL, NULL, NULL, NULL),
  ('ba331c60-fb0e-4f47-a8c3-77e3cc067b91', 'b1b2c3d4-0001-4000-b000-000000000001', NULL, 'Mottatt ✅ Dressene bestilles i dag. Estimert leveranse: uke 11 (9.–13. mars).', '2026-02-12 10:20:00+00', NULL, NULL, NULL, NULL, 'a1b2c3d4-0001-4000-a000-000000000001'),
  ('e525c498-8087-4303-8955-065f89a280ad', 'b1b2c3d4-0001-4000-b000-000000000001', NULL, 'Hei! Dressene er sendt i dag, sporingsnummer: RF2026-4521. Forventet levering torsdag. 📦', '2026-03-01 14:30:00+00', NULL, NULL, NULL, NULL, 'a1b2c3d4-0001-4000-a000-000000000001'),
  -- Fristil AS (supplier channel)
  ('722a6c5c-4c83-4343-aa25-95b78a1f9d8e', 'b1b2c3d4-0002-4000-b000-000000000002', NULL, 'Hei Bergansen! Bussen deres er nå i produksjon. Jeg holder dere oppdatert med bilder underveis. 🚌', '2026-01-05 09:00:00+00', NULL, NULL, NULL, NULL, 'a1b2c3d4-0002-4000-a000-000000000002'),
  ('9fc6cdba-7509-41b3-be78-48cbdd6ffe70', 'b1b2c3d4-0002-4000-b000-000000000002', NULL, 'Litt progress-bilder fra verkstedet!', '2026-01-20 11:00:00+00', NULL, NULL, NULL, NULL, 'a1b2c3d4-0002-4000-a000-000000000002'),
  ('784ec4cc-5436-44ea-8f60-3fae14277f6a', 'b1b2c3d4-0002-4000-b000-000000000002', '5380ab14-ecb5-4de2-aca4-3affe245f251', 'Daaaaamn 🔥🔥🔥', '2026-01-20 11:15:00+00', NULL, NULL, NULL, NULL, NULL),
  ('bb69e44b-43cc-4580-a5d5-03e4c80bf09b', 'b1b2c3d4-0002-4000-b000-000000000002', NULL, 'Wrapping-dag er bekreftet 15. mars kl 09:00 hos oss i Damsgårdsveien. Ta med god stemning, vi ordner pizza 🍕 Hele gruppen er velkommen til å være med!', '2026-02-15 13:00:00+00', NULL, NULL, NULL, NULL, 'a1b2c3d4-0002-4000-a000-000000000002'),
  ('e6bb6b55-4d16-487c-aba0-5148a6e0bebf', 'b1b2c3d4-0002-4000-b000-000000000002', '5380ab14-ecb5-4de2-aca4-3affe245f251', 'Vi kommer alle! Gleder oss enormt', '2026-02-15 13:10:00+00', NULL, NULL, NULL, NULL, NULL),
  ('a47f0f93-feb3-43b1-8384-38f03df30ab5', 'b1b2c3d4-0002-4000-b000-000000000002', '5380ab14-ecb5-4de2-aca4-3affe245f251', 'Kan vi filme wrappingen for TikTok?', '2026-02-15 13:12:00+00', NULL, NULL, NULL, NULL, NULL),
  ('703a4985-b64b-4203-91c7-bea75b97cec6', 'b1b2c3d4-0002-4000-b000-000000000002', NULL, 'Absolutt! Vi har faktisk egen fotograf der som kan ta bilder av dere også 📸', '2026-02-15 13:20:00+00', NULL, NULL, NULL, NULL, 'a1b2c3d4-0002-4000-a000-000000000002'),
  -- Busskompaniet (supplier channel)
  ('c90e5f91-5a7e-4f44-bbb4-16268fb2737b', 'b1b2c3d4-0003-4000-b000-000000000003', NULL, 'Hei! Martin her fra Busskompaniet. Vi leverer lydanlegget til bussen deres. Har noen spørsmål om oppsettet?', '2026-02-08 10:00:00+00', NULL, NULL, NULL, NULL, 'a1b2c3d4-0003-4000-a000-000000000003'),
  ('b603869c-5d7b-43d8-b60b-2c5e74c70688', 'b1b2c3d4-0003-4000-b000-000000000003', '5380ab14-ecb5-4de2-aca4-3affe245f251', 'Hei Martin! Vi lurte på om det er mulig å oppgradere til det større anlegget? Hva koster det?', '2026-02-08 14:00:00+00', NULL, NULL, NULL, NULL, NULL),
  ('0358fe85-2363-4947-b561-663f938d5463', 'b1b2c3d4-0003-4000-b000-000000000003', NULL, 'Den store pakken er 45 000 kr mer enn det dere har nå. Inkluderer dobbelt så mange høyttalere og en skikkelig subwoofer. Anbefales 👌', '2026-02-08 14:30:00+00', NULL, NULL, NULL, NULL, 'a1b2c3d4-0003-4000-a000-000000000003'),
  ('3692e258-6cfa-4f7e-838e-00786efc31ab', 'b1b2c3d4-0003-4000-b000-000000000003', '5380ab14-ecb5-4de2-aca4-3affe245f251', 'Da må vi ta en avstemning i gruppen. Kommer tilbake!', '2026-02-08 14:35:00+00', NULL, NULL, NULL, NULL, NULL),
  ('2b2bba50-b1d8-40cf-a2c1-e3b18a07cce3', 'b1b2c3d4-0003-4000-b000-000000000003', NULL, 'Noen oppdatering på oppgraderingen? Må bestille innen 10. mars for å rekke installasjon.', '2026-02-25 09:00:00+00', NULL, NULL, NULL, NULL, 'a1b2c3d4-0003-4000-a000-000000000003'),
  ('7527c794-e030-484b-9595-b9b710f1697a', 'b1b2c3d4-0003-4000-b000-000000000003', '5380ab14-ecb5-4de2-aca4-3affe245f251', 'Gruppen stemte ja! Vi oppgraderer 🎉', '2026-02-25 16:00:00+00', NULL, NULL, NULL, NULL, NULL),
  ('dd6868bf-a583-4527-b9ca-10085998c496', 'b1b2c3d4-0003-4000-b000-000000000003', NULL, 'Sender over oppdatert serviceavtale i morgen', '2026-02-26 08:30:00+00', NULL, NULL, NULL, NULL, 'a1b2c3d4-0003-4000-a000-000000000003')
ON CONFLICT (id) DO NOTHING;
-- Seed: message_reads
-- Idempotent: ON CONFLICT (id) DO NOTHING

INSERT INTO public.message_reads (id, message_id, member_id, read_at)
VALUES
  ('fcd6193c-2389-4c0a-972b-af246adc3293', 'f54cc606-483f-4e6c-bbca-76412af86c02', '5380ab14-ecb5-4de2-aca4-3affe245f251', '2026-03-02 12:20:13.1307+00'),
  ('0a7a0645-d45e-4d00-87ec-dd8b50415246', '4d30d116-db47-40d9-aa01-9490b94f1be9', '5380ab14-ecb5-4de2-aca4-3affe245f251', '2026-03-02 12:20:13.1307+00'),
  ('f2e72ff6-8d9a-4911-83ce-04a46f0e4ea7', '51fec287-905c-4321-b5a1-e142bc80f2b0', '5380ab14-ecb5-4de2-aca4-3affe245f251', '2026-03-02 12:20:13.1307+00'),
  ('c4554e0e-ad4d-4330-80cd-9306199c0e62', 'ba331c60-fb0e-4f47-a8c3-77e3cc067b91', '5380ab14-ecb5-4de2-aca4-3affe245f251', '2026-03-02 12:20:13.1307+00'),
  ('6bdf093f-26de-42dd-8a55-b84b7463da34', 'e525c498-8087-4303-8955-065f89a280ad', '5380ab14-ecb5-4de2-aca4-3affe245f251', '2026-03-02 12:20:13.1307+00'),
  ('1de140b0-60a8-4410-b164-6f95ab672d14', '722a6c5c-4c83-4343-aa25-95b78a1f9d8e', '5380ab14-ecb5-4de2-aca4-3affe245f251', '2026-03-02 12:20:13.960439+00'),
  ('e1479028-259d-4c59-9143-ff20cbd63f2d', '9fc6cdba-7509-41b3-be78-48cbdd6ffe70', '5380ab14-ecb5-4de2-aca4-3affe245f251', '2026-03-02 12:20:13.960439+00'),
  ('80f7edf6-dd83-4577-acc7-21082905a818', 'bb69e44b-43cc-4580-a5d5-03e4c80bf09b', '5380ab14-ecb5-4de2-aca4-3affe245f251', '2026-03-02 12:20:13.960439+00'),
  ('0732d6d0-c338-432a-9614-afb3318f77b7', '703a4985-b64b-4203-91c7-bea75b97cec6', '5380ab14-ecb5-4de2-aca4-3affe245f251', '2026-03-02 12:20:13.960439+00'),
  ('ac64523a-f8fa-44b4-b184-cdf5ae0e55d9', 'c90e5f91-5a7e-4f44-bbb4-16268fb2737b', '5380ab14-ecb5-4de2-aca4-3affe245f251', '2026-03-02 12:20:14.644148+00'),
  ('df01156d-2f5e-472b-a4c0-55e799f44523', '0358fe85-2363-4947-b561-663f938d5463', '5380ab14-ecb5-4de2-aca4-3affe245f251', '2026-03-02 12:20:14.644148+00'),
  ('74d90608-462a-4911-9dd9-5176ef155a7e', '2b2bba50-b1d8-40cf-a2c1-e3b18a07cce3', '5380ab14-ecb5-4de2-aca4-3affe245f251', '2026-03-02 12:20:14.644148+00'),
  ('3547eb22-983c-4fe7-82f4-d1e50f7a3246', 'dd6868bf-a583-4527-b9ca-10085998c496', '5380ab14-ecb5-4de2-aca4-3affe245f251', '2026-03-02 12:20:14.644148+00')
ON CONFLICT (id) DO NOTHING;
