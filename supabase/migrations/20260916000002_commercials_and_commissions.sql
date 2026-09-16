-- ====================================================================
-- MIGRATION : MODULES AGENTS COMMERCIAUX & GESTION DES COMMISSIONS
-- ====================================================================

-- 1. Enregistrement des 2 nouveaux modules ERP dans la table MODULES
INSERT INTO public.modules (id, code_module, nom, description, icone, ordre)
VALUES
    ('66666666-6666-6666-6666-666666666666', 'COMMERCIAUX', 'Agents Commerciaux', 'Gestion des agents commerciaux, portefeuille d''affaires et performances', 'BadgeTwoTone', 6),
    ('77777777-7777-7777-7777-777777777777', 'COMMISSIONS', 'Gestion des Commissions', 'Suivi, validation et liquidation des commissions apporteurs et agents', 'MonetizationOnTwoTone', 7)
ON CONFLICT (code_module) DO UPDATE 
SET nom = EXCLUDED.nom, description = EXCLUDED.description, icone = EXCLUDED.icone, ordre = EXCLUDED.ordre;

-- 2. TABLE : AGENTS_COMMERCIAUX
CREATE TABLE IF NOT EXISTS public.agents_commerciaux (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricule TEXT UNIQUE,
    nom TEXT NOT NULL,
    prenom TEXT,
    telephone TEXT NOT NULL,
    email TEXT,
    zone_secteur TEXT,
    taux_commission_defaut NUMERIC(5, 2) DEFAULT 5.00,
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Colonnes supplémentaires sur PRESTATIONS_COMMANDES pour les commissions & intervenants
ALTER TABLE public.prestations_commandes 
ADD COLUMN IF NOT EXISTS commission_apporteur_taux NUMERIC(5, 2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS commission_apporteur_montant NUMERIC(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS apporteur_id UUID REFERENCES public.clients_fournisseurs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS apporteur_nom TEXT,
ADD COLUMN IF NOT EXISTS commission_commercial_montant NUMERIC(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS commercial_id UUID REFERENCES public.agents_commerciaux(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS commercial_nom TEXT,
ADD COLUMN IF NOT EXISTS commission_responsable_montant NUMERIC(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS responsable_service_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS responsable_service_nom TEXT,
ADD COLUMN IF NOT EXISTS marge_brute NUMERIC(12, 2);

-- 4. TABLE : COMMISSIONS (Suivi et liquidation financière)
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prestation_id UUID REFERENCES public.prestations_commandes(id) ON DELETE CASCADE,
    prestation_ref TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('APPORTEUR', 'AGENT_COMMERCIAL', 'RESPONSABLE')),
    beneficiaire_id UUID,
    beneficiaire_nom TEXT NOT NULL,
    beneficiaire_contact TEXT,
    montant_prestation NUMERIC(12, 2) NOT NULL DEFAULT 0,
    taux_pourcentage NUMERIC(5, 2),
    montant_commission NUMERIC(12, 2) NOT NULL DEFAULT 0,
    statut TEXT NOT NULL DEFAULT 'A_VALIDER' CHECK (statut IN ('A_VALIDER', 'A_PAYER', 'PAYEE', 'ANNULEE')),
    date_reglement TIMESTAMPTZ,
    mode_reglement TEXT CHECK (mode_reglement IN ('ESPECES', 'CHEQUE', 'VIREMENT', 'MOBILE_MONEY')),
    mouvement_caisse_id UUID REFERENCES public.mouvements_caisse(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index de performance
CREATE INDEX IF NOT EXISTS idx_commissions_prestation ON public.commissions(prestation_id);
CREATE INDEX IF NOT EXISTS idx_commissions_statut ON public.commissions(statut);
CREATE INDEX IF NOT EXISTS idx_prestations_commercial ON public.prestations_commandes(commercial_id);
CREATE INDEX IF NOT EXISTS idx_prestations_apporteur ON public.prestations_commandes(apporteur_id);

-- RLS
ALTER TABLE public.agents_commerciaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents commerciaux tout accès" ON public.agents_commerciaux FOR ALL TO authenticated USING (true);
CREATE POLICY "Commissions tout accès" ON public.commissions FOR ALL TO authenticated USING (true);

