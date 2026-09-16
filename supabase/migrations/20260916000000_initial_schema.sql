-- ====================================================================
-- SCHÉMA DE BASE DE DONNÉES SUPABASE - ERP HINOV SUIVI
-- ====================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLE : PROFILES (Utilisateurs de l'ERP)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nom TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABLE : MODULES (Liste des modules configurables dans l'ERP)
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_module TEXT UNIQUE NOT NULL CHECK (code_module IN ('MAINTENANCE', 'STOCKS', 'CAISSE_DEPENSES', 'PRESTATIONS')),
    nom TEXT NOT NULL,
    description TEXT,
    icone TEXT,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLE : USER_MODULES (Gestion des permissions par interrupteur Toggle)
CREATE TABLE IF NOT EXISTS public.user_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_module UNIQUE (user_id, module_id)
);

-- 4. TABLE : CLIENTS_FOURNISSEURS (Tiers de l'ERP)
CREATE TABLE IF NOT EXISTS public.clients_fournisseurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('CLIENT', 'FOURNISSEUR', 'PARTENAIRE')),
    nom TEXT NOT NULL,
    telephone TEXT,
    email TEXT,
    adresse TEXT,
    ville TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLE : CATALOGUE_ARTICLES (Gestion des stocks et consommables)
CREATE TABLE IF NOT EXISTS public.catalogue_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_article TEXT UNIQUE,
    designation TEXT NOT NULL,
    type_article TEXT NOT NULL DEFAULT 'CONSOMMABLE',
    quantite_stock NUMERIC(12, 2) NOT NULL DEFAULT 0,
    cout_unitaire_achat NUMERIC(12, 2) NOT NULL DEFAULT 0,
    prix_unitaire_vente NUMERIC(12, 2) NOT NULL DEFAULT 0,
    seuil_alerte NUMERIC(12, 2) NOT NULL DEFAULT 5,
    unite TEXT DEFAULT 'Unité',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABLE : INTERVENTIONS_MAINTENANCE (Suivi technique & pannes)
CREATE TABLE IF NOT EXISTS public.interventions_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_agence TEXT NOT NULL,
    utilisateur_concerne TEXT,
    equipement TEXT NOT NULL,
    observation TEXT,
    travaux TEXT,
    prix NUMERIC(12, 2) NOT NULL DEFAULT 0,
    quantite NUMERIC(12, 2) NOT NULL DEFAULT 1,
    statut TEXT NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'EN_COURS', 'TERMINEE', 'ANNULEE')),
    priorite TEXT NOT NULL DEFAULT 'MOYENNE' CHECK (priorite IN ('BASSE', 'MOYENNE', 'HAUTE', 'URGENTE')),
    technicien_assigne TEXT,
    date_intervention TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABLE : MOUVEMENTS_CAISSE (Journal de trésorerie Entrées / Sorties)
CREATE TABLE IF NOT EXISTS public.mouvements_caisse (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('ENTREE', 'SORTIE')),
    montant NUMERIC(12, 2) NOT NULL CHECK (montant >= 0),
    motif TEXT NOT NULL,
    categorie TEXT DEFAULT 'GENERAL',
    beneficiaire_emetteur TEXT,
    mode_reglement TEXT DEFAULT 'ESPECES' CHECK (mode_reglement IN ('ESPECES', 'CHEQUE', 'VIREMENT', 'MOBILE_MONEY')),
    date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    cree_par UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABLE : PRESTATIONS_COMMANDES (Prestations de services et marges)
CREATE TABLE IF NOT EXISTS public.prestations_commandes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients_fournisseurs(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    montant_total_vente NUMERIC(12, 2) NOT NULL DEFAULT 0,
    cout_total_revient NUMERIC(12, 2) NOT NULL DEFAULT 0,
    marge_nette NUMERIC(12, 2) GENERATED ALWAYS AS (montant_total_vente - cout_total_revient) STORED,
    statut TEXT NOT NULL DEFAULT 'DEVIS' CHECK (statut IN ('DEVIS', 'CONFIRMEE', 'EN_COURS', 'FACTUREE', 'PAYEE')),
    date_commande TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- TRIGGERS AUTOMATIQUES
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    mod_rec RECORD;
    is_first_user BOOLEAN;
    user_role TEXT;
BEGIN
    SELECT COUNT(*) = 0 INTO is_first_user FROM public.profiles;
    IF is_first_user THEN
        user_role := 'ADMIN';
    ELSE
        user_role := 'USER';
    END IF;

    INSERT INTO public.profiles (id, nom, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nom', split_part(NEW.email, '@', 1)),
        NEW.email,
        user_role
    );

    FOR mod_rec IN SELECT id FROM public.modules LOOP
        INSERT INTO public.user_modules (user_id, module_id, is_enabled)
        VALUES (NEW.id, mod_rec.id, (user_role = 'ADMIN'))
        ON CONFLICT (user_id, module_id) DO NOTHING;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients_fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mouvements_caisse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prestations_commandes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles lecture pour authentifiés') THEN
        CREATE POLICY "Profiles lecture pour authentifiés" ON public.profiles FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles modifiables par admin ou soi-même') THEN
        CREATE POLICY "Profiles modifiables par admin ou soi-même" ON public.profiles FOR ALL TO authenticated USING (
            auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modules' AND policyname = 'Modules visibles par tous') THEN
        CREATE POLICY "Modules visibles par tous" ON public.modules FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modules' AND policyname = 'Modules gérés par admin') THEN
        CREATE POLICY "Modules gérés par admin" ON public.modules FOR ALL TO authenticated USING (
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_modules' AND policyname = 'User_modules visibles par tous authentifiés') THEN
        CREATE POLICY "User_modules visibles par tous authentifiés" ON public.user_modules FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_modules' AND policyname = 'User_modules administrables par ADMIN') THEN
        CREATE POLICY "User_modules administrables par ADMIN" ON public.user_modules FOR ALL TO authenticated USING (
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients_fournisseurs' AND policyname = 'Clients/Fournisseurs tout accès') THEN
        CREATE POLICY "Clients/Fournisseurs tout accès" ON public.clients_fournisseurs FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catalogue_articles' AND policyname = 'Catalogue Articles tout accès') THEN
        CREATE POLICY "Catalogue Articles tout accès" ON public.catalogue_articles FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interventions_maintenance' AND policyname = 'Interventions tout accès') THEN
        CREATE POLICY "Interventions tout accès" ON public.interventions_maintenance FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mouvements_caisse' AND policyname = 'Mouvements Caisse tout accès') THEN
        CREATE POLICY "Mouvements Caisse tout accès" ON public.mouvements_caisse FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prestations_commandes' AND policyname = 'Prestations tout accès') THEN
        CREATE POLICY "Prestations tout accès" ON public.prestations_commandes FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- 9. INSERTION DES MODULES ERP STANDARD
INSERT INTO public.modules (id, code_module, nom, description, icone, ordre)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'MAINTENANCE', 'Maintenance & Interventions', 'Gestion des pannes, suivi des interventions sur sites et agences', 'BuildTwoTone', 1),
    ('22222222-2222-2222-2222-222222222222', 'STOCKS', 'Stocks & Consommables', 'Inventaire, suivi des articles, quantités et alertes de réapprovisionnement', 'InventoryTwoTone', 2),
    ('33333333-3333-3333-3333-333333333333', 'CAISSE_DEPENSES', 'Dépenses & Caisse', 'Journal de trésorerie, suivi des entrées et sorties en temps réel', 'AccountBalanceWalletTwoTone', 3),
    ('44444444-4444-4444-4444-444444444444', 'PRESTATIONS', 'Prestations & Commandes', 'Suivi des devis, commandes clients et calcul automatisé des marges', 'ReceiptTwoTone', 4)
ON CONFLICT (code_module) DO UPDATE 
SET nom = EXCLUDED.nom, description = EXCLUDED.description, icone = EXCLUDED.icone, ordre = EXCLUDED.ordre;

