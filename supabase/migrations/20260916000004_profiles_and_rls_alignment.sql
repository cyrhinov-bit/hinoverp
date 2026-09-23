-- ====================================================================
-- MIGRATION : ALIGNEMENT PROFILES, USER_MODULES, RLS ET SEED
-- ====================================================================

-- 0. Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Profiles lecture pour authentifiés" ON public.profiles;
DROP POLICY IF EXISTS "Profiles modifiables par admin ou soi-même" ON public.profiles;
DROP POLICY IF EXISTS "Profiles lecture pour tous" ON public.profiles;
DROP POLICY IF EXISTS "Profiles modifiables" ON public.profiles;

DROP POLICY IF EXISTS "Modules visibles par tous" ON public.modules;
DROP POLICY IF EXISTS "Modules gérés par admin" ON public.modules;
DROP POLICY IF EXISTS "Modules gérés" ON public.modules;

DROP POLICY IF EXISTS "User_modules visibles par tous authentifiés" ON public.user_modules;
DROP POLICY IF EXISTS "User_modules administrables par ADMIN" ON public.user_modules;
DROP POLICY IF EXISTS "User modules administrables par admin" ON public.user_modules;
DROP POLICY IF EXISTS "User modules visibles par utilisateur ou admin" ON public.user_modules;
DROP POLICY IF EXISTS "User_modules visibles par tous" ON public.user_modules;
DROP POLICY IF EXISTS "User_modules administrables" ON public.user_modules;

DROP POLICY IF EXISTS "Clients et fournisseurs gérés par admin" ON public.clients_fournisseurs;
DROP POLICY IF EXISTS "Clients et fournisseurs visibles par tous authentifiés" ON public.clients_fournisseurs;
DROP POLICY IF EXISTS "Clients/Fournisseurs tout accès" ON public.clients_fournisseurs;

DROP POLICY IF EXISTS "Articles gérés par admin" ON public.catalogue_articles;
DROP POLICY IF EXISTS "Articles visibles si module STOCKS actif" ON public.catalogue_articles;
DROP POLICY IF EXISTS "Catalogue Articles tout accès" ON public.catalogue_articles;

DROP POLICY IF EXISTS "Interventions gérées" ON public.interventions_maintenance;
DROP POLICY IF EXISTS "Interventions visibles si module MAINTENANCE actif" ON public.interventions_maintenance;
DROP POLICY IF EXISTS "Interventions tout accès" ON public.interventions_maintenance;

DROP POLICY IF EXISTS "Mouvements caisse gérés" ON public.mouvements_caisse;
DROP POLICY IF EXISTS "Mouvements caisse visibles si module CAISSE_DEPENSES actif" ON public.mouvements_caisse;
DROP POLICY IF EXISTS "Mouvements Caisse tout accès" ON public.mouvements_caisse;

DROP POLICY IF EXISTS "Prestations gérées" ON public.prestations_commandes;
DROP POLICY IF EXISTS "Prestations visibles si module PRESTATIONS actif" ON public.prestations_commandes;
DROP POLICY IF EXISTS "Prestations tout accès" ON public.prestations_commandes;

DROP POLICY IF EXISTS "Agents Commerciaux tout accès" ON public.agents_commerciaux;
DROP POLICY IF EXISTS "Commissions tout accès" ON public.commissions;

-- 0bis. Supprimer toutes les clés étrangères existantes avant modification des types
ALTER TABLE public.user_modules DROP CONSTRAINT IF EXISTS user_modules_user_id_fkey;
ALTER TABLE public.user_modules DROP CONSTRAINT IF EXISTS user_modules_module_id_fkey;

ALTER TABLE public.catalogue_articles DROP CONSTRAINT IF EXISTS catalogue_articles_fournisseur_id_fkey;

ALTER TABLE public.interventions_maintenance DROP CONSTRAINT IF EXISTS interventions_maintenance_client_id_fkey;

ALTER TABLE public.mouvements_caisse DROP CONSTRAINT IF EXISTS mouvements_caisse_tier_id_fkey;
ALTER TABLE public.mouvements_caisse DROP CONSTRAINT IF EXISTS mouvements_caisse_cree_par_fkey;

ALTER TABLE public.prestations_commandes DROP CONSTRAINT IF EXISTS prestations_commandes_client_id_fkey;
ALTER TABLE public.prestations_commandes DROP CONSTRAINT IF EXISTS prestations_commandes_apporteur_id_fkey;
ALTER TABLE public.prestations_commandes DROP CONSTRAINT IF EXISTS prestations_commandes_commercial_id_fkey;
ALTER TABLE public.prestations_commandes DROP CONSTRAINT IF EXISTS prestations_commandes_responsable_service_id_fkey;

ALTER TABLE public.commissions DROP CONSTRAINT IF EXISTS commissions_prestation_id_fkey;
ALTER TABLE public.commissions DROP CONSTRAINT IF EXISTS commissions_mouvement_caisse_id_fkey;

-- 1. Adapter la table PROFILES
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telephone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS poste TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS actif BOOLEAN NOT NULL DEFAULT true;

-- 2. Adapter la table MODULES
ALTER TABLE public.modules DROP CONSTRAINT IF EXISTS modules_code_module_check;
ALTER TABLE public.modules ALTER COLUMN id TYPE TEXT USING id::text;

-- 3. Adapter la table USER_MODULES
ALTER TABLE public.user_modules ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.user_modules ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE public.user_modules ALTER COLUMN module_id TYPE TEXT USING module_id::text;

-- 4. Adapter les autres tables pour accepter les IDs texte de l'ERP
ALTER TABLE public.clients_fournisseurs ALTER COLUMN id TYPE TEXT USING id::text;

ALTER TABLE public.catalogue_articles ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.catalogue_articles ALTER COLUMN fournisseur_id TYPE TEXT USING fournisseur_id::text;

ALTER TABLE public.interventions_maintenance ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.interventions_maintenance ALTER COLUMN client_id TYPE TEXT USING client_id::text;

ALTER TABLE public.mouvements_caisse ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.mouvements_caisse ALTER COLUMN tier_id TYPE TEXT USING tier_id::text;
ALTER TABLE public.mouvements_caisse ALTER COLUMN cree_par TYPE TEXT USING cree_par::text;

ALTER TABLE public.prestations_commandes ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.prestations_commandes ALTER COLUMN client_id TYPE TEXT USING client_id::text;
ALTER TABLE public.prestations_commandes ALTER COLUMN apporteur_id TYPE TEXT USING apporteur_id::text;
ALTER TABLE public.prestations_commandes ALTER COLUMN commercial_id TYPE TEXT USING commercial_id::text;
ALTER TABLE public.prestations_commandes ALTER COLUMN responsable_service_id TYPE TEXT USING responsable_service_id::text;

ALTER TABLE public.agents_commerciaux ALTER COLUMN id TYPE TEXT USING id::text;

ALTER TABLE public.commissions ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.commissions ALTER COLUMN prestation_id TYPE TEXT USING prestation_id::text;
ALTER TABLE public.commissions ALTER COLUMN beneficiaire_id TYPE TEXT USING beneficiaire_id::text;
ALTER TABLE public.commissions ALTER COLUMN mouvement_caisse_id TYPE TEXT USING mouvement_caisse_id::text;

-- 5. POLITIQUES RLS PERMISSIVES POUR L'ERP (anon & authenticated)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles lecture pour tous" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Profiles modifiables" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules visibles par tous" ON public.modules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Modules gérés" ON public.modules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User_modules visibles par tous" ON public.user_modules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "User_modules administrables" ON public.user_modules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.clients_fournisseurs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients/Fournisseurs tout accès" ON public.clients_fournisseurs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.catalogue_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalogue Articles tout accès" ON public.catalogue_articles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.interventions_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Interventions tout accès" ON public.interventions_maintenance FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.mouvements_caisse ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mouvements Caisse tout accès" ON public.mouvements_caisse FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.prestations_commandes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prestations tout accès" ON public.prestations_commandes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.agents_commerciaux ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents Commerciaux tout accès" ON public.agents_commerciaux FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Commissions tout accès" ON public.commissions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 6. INSERTION / MISE À JOUR DES MODULES ERP STANDARD
INSERT INTO public.modules (id, code_module, nom, description, icone, ordre)
VALUES
    ('mod-1', 'MAINTENANCE', 'Maintenance & Interventions', 'Gestion des pannes, suivi des interventions sur sites et agences', 'BuildTwoTone', 1),
    ('mod-2', 'STOCKS', 'Stocks & Consommables', 'Inventaire, suivi des articles, quantités et alertes de réapprovisionnement', 'InventoryTwoTone', 2),
    ('mod-3', 'CAISSE_DEPENSES', 'Dépenses & Caisse', 'Journal de trésorerie, suivi des entrées et sorties en temps réel', 'AccountBalanceWalletTwoTone', 3),
    ('mod-4', 'PRESTATIONS', 'Prestations & Commandes', 'Suivi des devis, commandes clients et calcul automatisé des marges', 'ReceiptTwoTone', 4),
    ('mod-5', 'CLIENTS_FOURNISSEURS', 'Clients & Fournisseurs', 'Répertoire centralisé des tiers, contacts, coordonnées et historique croisé', 'PeopleAltTwoTone', 5),
    ('mod-6', 'COMMERCIAUX', 'Agents Commerciaux', 'Gestion des agents commerciaux, portefeuille d''affaires et performances', 'BadgeTwoTone', 6),
    ('mod-7', 'COMMISSIONS', 'Gestion des Commissions', 'Suivi, validation et liquidation des commissions apporteurs et agents', 'MonetizationOnTwoTone', 7)
ON CONFLICT (code_module) DO UPDATE 
SET id = EXCLUDED.id, nom = EXCLUDED.nom, description = EXCLUDED.description, icone = EXCLUDED.icone, ordre = EXCLUDED.ordre;

-- 7. SEED INITIAL DES PROFILS OFFICIELS
INSERT INTO public.profiles (id, nom, poste, email, password, telephone, role, actif)
VALUES
    ('usr-admin-1', 'Evariste Gnonskan', 'Directeur Général & Administrateur Principal', 'e.gnonskan@hinovgroup.com', '04041992', '+225 07 00 00 00 00', 'ADMIN', true),
    ('usr-admin-2', 'Y. Ouattara', 'Directeur Général & Administrateur', 'y.ouattara@hinovgroup.com', '123654', '+225 07 00 00 00 00', 'ADMIN', true),
    ('usr-staff-2', 'A. Bosso', 'Collaborateur & Gestionnaire Opérationnel', 'a.bosso@hinovgroup.com', '123654', '+225 05 00 00 00 00', 'USER', true)
ON CONFLICT (id) DO UPDATE
SET nom = EXCLUDED.nom, poste = EXCLUDED.poste, email = EXCLUDED.email, password = EXCLUDED.password, role = EXCLUDED.role, actif = EXCLUDED.actif;

-- 8. SEED INITIAL DES PERMISSIONS (USER_MODULES)
INSERT INTO public.user_modules (id, user_id, module_id, is_enabled)
VALUES
    ('um-1', 'usr-admin-1', 'mod-1', true),
    ('um-2', 'usr-admin-1', 'mod-2', true),
    ('um-3', 'usr-admin-1', 'mod-3', true),
    ('um-4', 'usr-admin-1', 'mod-4', true),
    ('um-5', 'usr-admin-1', 'mod-5', true),
    ('um-6', 'usr-admin-1', 'mod-6', true),
    ('um-7', 'usr-admin-1', 'mod-7', true),
    ('um-8', 'usr-staff-2', 'mod-1', true),
    ('um-9', 'usr-staff-2', 'mod-2', true),
    ('um-10', 'usr-staff-2', 'mod-3', true),
    ('um-11', 'usr-staff-2', 'mod-4', false),
    ('um-12', 'usr-staff-2', 'mod-5', true),
    ('um-13', 'usr-staff-2', 'mod-6', false),
    ('um-14', 'usr-staff-2', 'mod-7', false),
    ('um-15', 'usr-admin-2', 'mod-1', true),
    ('um-16', 'usr-admin-2', 'mod-2', true),
    ('um-17', 'usr-admin-2', 'mod-3', true),
    ('um-18', 'usr-admin-2', 'mod-4', true),
    ('um-19', 'usr-admin-2', 'mod-5', true),
    ('um-20', 'usr-admin-2', 'mod-6', true),
    ('um-21', 'usr-admin-2', 'mod-7', true)
ON CONFLICT (user_id, module_id) DO UPDATE
SET is_enabled = EXCLUDED.is_enabled;
