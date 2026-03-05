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
