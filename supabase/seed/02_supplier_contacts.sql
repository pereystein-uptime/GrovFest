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
