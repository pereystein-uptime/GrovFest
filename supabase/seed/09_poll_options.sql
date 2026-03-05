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
