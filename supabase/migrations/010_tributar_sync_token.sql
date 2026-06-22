-- Agrega sync_token para vincular empresa de Sueldos 360 con TRIBUT.AR
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS sync_token TEXT;

UPDATE public.companies
SET sync_token = upper(substr(md5(id::text || random()::text), 1, 8))
WHERE sync_token IS NULL;

CREATE OR REPLACE FUNCTION public.generate_sync_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sync_token IS NULL THEN
    NEW.sync_token = upper(substr(md5(gen_random_uuid()::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_sync_token_on_insert ON public.companies;
CREATE TRIGGER set_sync_token_on_insert
  BEFORE INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_sync_token();