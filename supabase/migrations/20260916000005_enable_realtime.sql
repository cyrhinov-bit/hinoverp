-- ====================================================================
-- MIGRATION : ACTIVATION DU TEMPS RÉEL (SUPABASE REALTIME) & REPLICA IDENTITY
-- ====================================================================

-- 1. Configuration REPLICA IDENTITY FULL pour propager toutes les colonnes sur UPDATE et DELETE
ALTER TABLE IF EXISTS public.profiles REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.modules REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.user_modules REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.clients_fournisseurs REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.catalogue_articles REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.interventions_maintenance REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.mouvements_caisse REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.prestations_commandes REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.agents_commerciaux REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.commissions REPLICA IDENTITY FULL;

-- 2. Ajout de toutes les tables métiers à la publication supabase_realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'modules') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.modules;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_modules') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_modules;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'clients_fournisseurs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clients_fournisseurs;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'catalogue_articles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.catalogue_articles;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'interventions_maintenance') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.interventions_maintenance;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'mouvements_caisse') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mouvements_caisse;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'prestations_commandes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.prestations_commandes;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'agents_commerciaux') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.agents_commerciaux;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'commissions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.commissions;
  END IF;
END $$;
