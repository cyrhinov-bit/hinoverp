-- ====================================================================
-- SCHÉMA DE BASE DE DONNÉES SUPABASE - ERP HINOV SUIVI
-- ====================================================================

-- Activer l'extension pgcrypto pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLE : PROFILES (Utilisateurs de l'ERP)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT,
    telephone TEXT,
    poste TEXT,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
    actif BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABLE : MODULES (Liste des modules configurables dans l'ERP)
CREATE TABLE IF NOT EXISTS public.modules (
    id TEXT PRIMARY KEY,
    code_module TEXT UNIQUE NOT NULL CHECK (code_module IN ('MAINTENANCE', 'STOCKS', 'CAISSE_DEPENSES', 'PRESTATIONS', 'CLIENTS_FOURNISSEURS', 'COMMERCIAUX', 'COMMISSIONS')),
    nom TEXT NOT NULL,
    description TEXT,
    icone TEXT,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLE : USER_MODULES (Gestion des permissions par interrupteur Toggle)
CREATE TABLE IF NOT EXISTS public.user_modules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_module UNIQUE (user_id, module_id)
);

-- 4. TABLE : CLIENTS_FOURNISSEURS (Tiers de l'ERP)
CREATE TABLE IF NOT EXISTS public.clients_fournisseurs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('CLIENT', 'FOURNISSEUR', 'PARTENAIRE')),
    nom TEXT NOT NULL,
    telephone TEXT,
    email TEXT,
    adresse TEXT,
    ville TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLE : CATALOGUE_ARTICLES (Gestion des stocks et consommables)
CREATE TABLE IF NOT EXISTS public.catalogue_articles (
    id TEXT PRIMARY KEY,
    code_article TEXT,
    designation TEXT NOT NULL,
    type_article TEXT NOT NULL DEFAULT 'CONSOMMABLE',
    quantite_stock NUMERIC(12, 2) NOT NULL DEFAULT 0,
    cout_unitaire_achat NUMERIC(12, 2) NOT NULL DEFAULT 0,
    prix_unitaire_vente NUMERIC(12, 2) NOT NULL DEFAULT 0,
    seuil_alerte NUMERIC(12, 2) NOT NULL DEFAULT 5,
    unite TEXT DEFAULT 'Pièce',
    fournisseur_id TEXT REFERENCES public.clients_fournisseurs(id) ON DELETE SET NULL,
    fournisseur_nom TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABLE : INTERVENTIONS_MAINTENANCE (Suivi technique & pannes)
CREATE TABLE IF NOT EXISTS public.interventions_maintenance (
    id TEXT PRIMARY KEY,
    site_agence TEXT NOT NULL,
    utilisateur_concerne TEXT,
    client_id TEXT REFERENCES public.clients_fournisseurs(id) ON DELETE SET NULL,
    client_nom TEXT,
    equipement TEXT NOT NULL,
    observation TEXT,
    travaux TEXT,
    prix_unitaire NUMERIC(12, 2) DEFAULT 0,
    quantite NUMERIC(12, 2) NOT NULL DEFAULT 1,
    prix NUMERIC(12, 2) NOT NULL DEFAULT 0,
    statut TEXT NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'EN_COURS', 'TERMINEE', 'ANNULEE')),
    priorite TEXT NOT NULL DEFAULT 'MOYENNE' CHECK (priorite IN ('BASSE', 'MOYENNE', 'HAUTE', 'URGENTE')),
    technicien_assigne TEXT,
    date_intervention TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABLE : MOUVEMENTS_CAISSE (Journal de trésorerie Entrées / Sorties)
CREATE TABLE IF NOT EXISTS public.mouvements_caisse (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('ENTREE', 'SORTIE')),
    montant NUMERIC(12, 2) NOT NULL CHECK (montant >= 0),
    motif TEXT NOT NULL,
    categorie TEXT DEFAULT 'GENERAL',
    module_code TEXT DEFAULT 'GENERAL',
    tier_id TEXT REFERENCES public.clients_fournisseurs(id) ON DELETE SET NULL,
    tier_type TEXT CHECK (tier_type IN ('CLIENT', 'FOURNISSEUR', 'PARTENAIRE', 'AUTRE')),
    tier_nom TEXT,
    beneficiaire_emetteur TEXT,
    mode_reglement TEXT DEFAULT 'ESPECES' CHECK (mode_reglement IN ('ESPECES', 'CHEQUE', 'VIREMENT', 'MOBILE_MONEY')),
    date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    cree_par TEXT,
    cree_par_nom TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABLE : PRESTATIONS_COMMANDES (Prestations de services et marges 11 colonnes)
CREATE TABLE IF NOT EXISTS public.prestations_commandes (
    id TEXT PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL,
    client_id TEXT REFERENCES public.clients_fournisseurs(id) ON DELETE SET NULL,
    client_nom TEXT,
    description TEXT,
    designation TEXT,
    quantite NUMERIC(12, 2) DEFAULT 1,
    cout_unitaire_achat NUMERIC(12, 2) DEFAULT 0,
    cout_total_revient NUMERIC(12, 2) NOT NULL DEFAULT 0,
    prix_unitaire_vente NUMERIC(12, 2) DEFAULT 0,
    montant_total_vente NUMERIC(12, 2) NOT NULL DEFAULT 0,
    marge_interne NUMERIC(12, 2) DEFAULT 0,
    marge_brute NUMERIC(12, 2) DEFAULT 0,
    commission_apporteur_taux NUMERIC(5, 2) DEFAULT 10,
    commission_apporteur_montant NUMERIC(12, 2) DEFAULT 0,
    apporteur_id TEXT,
    apporteur_nom TEXT,
    commission_responsable_montant NUMERIC(12, 2) DEFAULT 0,
    responsable_service_id TEXT,
    responsable_service_nom TEXT,
    commission_commercial_montant NUMERIC(12, 2) DEFAULT 0,
    commercial_id TEXT,
    commercial_nom TEXT,
    benefice_reel NUMERIC(12, 2) DEFAULT 0,
    marge_nette NUMERIC(12, 2) DEFAULT 0,
    statut TEXT NOT NULL DEFAULT 'DEVIS' CHECK (statut IN ('DEVIS', 'CONFIRMEE', 'EN_COURS', 'FACTUREE', 'PAYEE')),
    date_commande TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. TABLE : AGENTS_COMMERCIAUX (Force de vente)
CREATE TABLE IF NOT EXISTS public.agents_commerciaux (
    id TEXT PRIMARY KEY,
    matricule TEXT UNIQUE,
    nom TEXT NOT NULL,
    prenom TEXT,
    telephone TEXT NOT NULL,
    email TEXT,
    zone_secteur TEXT,
    taux_commission_defaut NUMERIC(5, 2) DEFAULT 5.00,
    actif BOOLEAN NOT NULL DEFAULT true,
    total_ventes NUMERIC(12, 2) DEFAULT 0,
    total_commissions_dues NUMERIC(12, 2) DEFAULT 0,
    total_commissions_payees NUMERIC(12, 2) DEFAULT 0,
    contrats_clos_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. TABLE : COMMISSIONS (Apporteurs, Agents et Responsables)
CREATE TABLE IF NOT EXISTS public.commissions (
    id TEXT PRIMARY KEY,
    prestation_id TEXT REFERENCES public.prestations_commandes(id) ON DELETE CASCADE,
    prestation_ref TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('APPORTEUR', 'AGENT_COMMERCIAL', 'RESPONSABLE')),
    beneficiaire_id TEXT,
    beneficiaire_nom TEXT NOT NULL,
    beneficiaire_contact TEXT,
    montant_prestation NUMERIC(12, 2) NOT NULL DEFAULT 0,
    taux_pourcentage NUMERIC(5, 2) DEFAULT 10.00,
    montant_commission NUMERIC(12, 2) NOT NULL DEFAULT 0,
    statut TEXT NOT NULL DEFAULT 'A_VALIDER' CHECK (statut IN ('A_VALIDER', 'A_PAYER', 'PAYEE', 'ANNULEE')),
    date_reglement TIMESTAMPTZ,
    mode_reglement TEXT CHECK (mode_reglement IN ('ESPECES', 'CHEQUE', 'VIREMENT', 'MOBILE_MONEY')),
    mouvement_caisse_id TEXT REFERENCES public.mouvements_caisse(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- TRIGGERS AUTOMATIQUES
-- ====================================================================

-- Trigger pour créer automatiquement le profil utilisateur et assigner les modules lors de l'inscription
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

    -- 1. Créer le profil
    INSERT INTO public.profiles (id, nom, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nom', split_part(NEW.email, '@', 1)),
        NEW.email,
        user_role
    );

    -- 2. Initialiser les permissions de modules (activés si ADMIN, désactivés par défaut si USER)
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
ALTER TABLE public.agents_commerciaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture et écriture ouvertes aux utilisateurs authentifiés
CREATE POLICY "Profiles lecture pour authentifiés" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles modifiables par admin ou soi-même" ON public.profiles FOR ALL TO authenticated USING (
    auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

CREATE POLICY "Modules visibles par tous" ON public.modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Modules gérés par admin" ON public.modules FOR ALL TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

CREATE POLICY "User_modules visibles par tous authentifiés" ON public.user_modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "User_modules administrables par ADMIN" ON public.user_modules FOR ALL TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

-- Politiques Métier : Accessibles aux utilisateurs authentifiés
CREATE POLICY "Clients/Fournisseurs tout accès" ON public.clients_fournisseurs FOR ALL TO authenticated USING (true);
CREATE POLICY "Catalogue Articles tout accès" ON public.catalogue_articles FOR ALL TO authenticated USING (true);
CREATE POLICY "Interventions tout accès" ON public.interventions_maintenance FOR ALL TO authenticated USING (true);
CREATE POLICY "Mouvements Caisse tout accès" ON public.mouvements_caisse FOR ALL TO authenticated USING (true);
CREATE POLICY "Prestations tout accès" ON public.prestations_commandes FOR ALL TO authenticated USING (true);
CREATE POLICY "Agents Commerciaux tout accès" ON public.agents_commerciaux FOR ALL TO authenticated USING (true);
CREATE POLICY "Commissions tout accès" ON public.commissions FOR ALL TO authenticated USING (true);

