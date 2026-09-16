-- ====================================================================
-- MIGRATION : RELATIONS CROISÉES CLIENTS & FOURNISSEURS (TIERS)
-- ====================================================================

-- 1. Mettre à jour la table MODULES pour inclure CLIENTS_FOURNISSEURS
INSERT INTO public.modules (id, code_module, nom, description, icone, ordre)
VALUES
    ('55555555-5555-5555-5555-555555555555', 'CLIENTS_FOURNISSEURS', 'Clients & Fournisseurs', 'Répertoire centralisé des tiers, contacts, coordonnées et historique croisé', 'PeopleAltTwoTone', 5)
ON CONFLICT (code_module) DO UPDATE 
SET nom = EXCLUDED.nom, description = EXCLUDED.description, icone = EXCLUDED.icone, ordre = EXCLUDED.ordre;

-- 2. Ajouter les clés étrangères et colonnes sur CATALOGUE_ARTICLES (Fournisseur par défaut)
ALTER TABLE public.catalogue_articles 
ADD COLUMN IF NOT EXISTS fournisseur_id UUID REFERENCES public.clients_fournisseurs(id) ON DELETE SET NULL;

-- 3. Ajouter les clés étrangères et colonnes sur INTERVENTIONS_MAINTENANCE (Client/Site concerné)
ALTER TABLE public.interventions_maintenance 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients_fournisseurs(id) ON DELETE SET NULL;

-- 4. Ajouter les colonnes de liaison sur MOUVEMENTS_CAISSE (Tiers émetteur/bénéficiaire)
ALTER TABLE public.mouvements_caisse 
ADD COLUMN IF NOT EXISTS tier_id UUID REFERENCES public.clients_fournisseurs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tier_type TEXT CHECK (tier_type IN ('CLIENT', 'FOURNISSEUR', 'PARTENAIRE', 'AUTRE'));

-- Index de performance pour les jointures rapides
CREATE INDEX IF NOT EXISTS idx_articles_fournisseur ON public.catalogue_articles(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_interventions_client ON public.interventions_maintenance(client_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_tier ON public.mouvements_caisse(tier_id);
CREATE INDEX IF NOT EXISTS idx_prestations_client ON public.prestations_commandes(client_id);

