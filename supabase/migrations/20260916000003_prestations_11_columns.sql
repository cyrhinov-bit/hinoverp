-- ====================================================================
-- MIGRATION : GRILLE PRESTATIONS À 11 COLONNES FINANCIÈRES
-- ====================================================================

ALTER TABLE public.prestations_commandes
ADD COLUMN IF NOT EXISTS designation TEXT,
ADD COLUMN IF NOT EXISTS quantite NUMERIC(10, 2) DEFAULT 1,
ADD COLUMN IF NOT EXISTS cout_unitaire_achat NUMERIC(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS prix_unitaire_vente NUMERIC(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS marge_interne NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS benefice_reel NUMERIC(12, 2);

-- Synchronisation des colonnes existantes pour compatibilité
UPDATE public.prestations_commandes
SET 
  designation = COALESCE(designation, description),
  quantite = COALESCE(quantite, 1),
  cout_unitaire_achat = CASE WHEN COALESCE(quantite, 1) > 0 THEN ROUND(cout_total_revient / COALESCE(quantite, 1), 2) ELSE cout_total_revient END,
  prix_unitaire_vente = CASE WHEN COALESCE(quantite, 1) > 0 THEN ROUND(montant_total_vente / COALESCE(quantite, 1), 2) ELSE montant_total_vente END,
  marge_interne = COALESCE(marge_interne, marge_brute, montant_total_vente - cout_total_revient),
  benefice_reel = COALESCE(benefice_reel, marge_nette, (montant_total_vente - cout_total_revient - COALESCE(commission_apporteur_montant, 0) - COALESCE(commission_commercial_montant, 0) - COALESCE(commission_responsable_montant, 0)))
WHERE designation IS NULL OR quantite IS NULL;

