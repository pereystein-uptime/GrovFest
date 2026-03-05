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
