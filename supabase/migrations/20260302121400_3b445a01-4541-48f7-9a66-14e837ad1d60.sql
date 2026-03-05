
ALTER TABLE public.chat_channels DROP CONSTRAINT chat_channels_type_check;
ALTER TABLE public.chat_channels ADD CONSTRAINT chat_channels_type_check CHECK (type = ANY (ARRAY['group'::text, 'announcement'::text, 'admin'::text, 'dm'::text, 'supplier'::text]));
