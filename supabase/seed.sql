-- ====================================================================
-- SEED DATA - DONNÉES DE DÉMONSTRATION HINOV SUIVI ERP
-- ====================================================================

-- 1. INSERTION DES MODULES ERP STANDARD
INSERT INTO public.modules (id, code_module, nom, description, icone, ordre)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'MAINTENANCE', 'Maintenance & Interventions', 'Gestion des pannes, suivi des interventions sur sites et agences', 'BuildTwoTone', 1),
    ('22222222-2222-2222-2222-222222222222', 'STOCKS', 'Stocks & Consommables', 'Inventaire, suivi des articles, quantités et alertes de réapprovisionnement', 'InventoryTwoTone', 2),
    ('33333333-3333-3333-3333-333333333333', 'CAISSE_DEPENSES', 'Dépenses & Caisse', 'Journal de trésorerie, suivi des entrées et sorties en temps réel', 'AccountBalanceWalletTwoTone', 3),
    ('44444444-4444-4444-4444-444444444444', 'PRESTATIONS', 'Prestations & Commandes', 'Suivi des devis, commandes clients et calcul automatisé des marges', 'ReceiptTwoTone', 4),
    ('55555555-5555-5555-5555-555555555555', 'CLIENTS_FOURNISSEURS', 'Clients & Fournisseurs', 'Répertoire centralisé des tiers, contacts, coordonnées et historique croisé', 'PeopleAltTwoTone', 5),
    ('66666666-6666-6666-6666-666666666666', 'COMMERCIAUX', 'Agents Commerciaux', 'Gestion des agents commerciaux, portefeuille d''affaires et performances', 'BadgeTwoTone', 6),
    ('77777777-7777-7777-7777-777777777777', 'COMMISSIONS', 'Gestion des Commissions', 'Suivi, validation et liquidation des commissions apporteurs et agents', 'MonetizationOnTwoTone', 7)
ON CONFLICT (code_module) DO UPDATE 
SET nom = EXCLUDED.nom, description = EXCLUDED.description, icone = EXCLUDED.icone, ordre = EXCLUDED.ordre;

-- 2. INSERTION CLIENTS & FOURNISSEURS
INSERT INTO public.clients_fournisseurs (id, type, nom, telephone, email, adresse, ville)
VALUES
    ('a1111111-0000-0000-0000-000000000001', 'CLIENT', 'Société Générale de Banque', '+225 07 01 02 03 04', 'contact@sgb-ci.com', 'Plateau Avenue Chardy', 'Abidjan'),
    ('a1111111-0000-0000-0000-000000000002', 'CLIENT', 'Hôtel Ivoire Palace', '+225 05 55 44 33 22', 'logistique@ivoirepalace.com', 'Cocody Boulevard Hassan II', 'Abidjan'),
    ('a1111111-0000-0000-0000-000000000003', 'FOURNISSEUR', 'Afric Distribution Matériel', '+225 01 02 03 04 05', 'commandes@africdistrib.ci', 'Zone Industrielle Yopougon', 'Abidjan'),
    ('a1111111-0000-0000-0000-000000000004', 'FOURNISSEUR', 'Tech & Energy Solutions', '+225 07 77 88 99 00', 'support@techenergy.ci', 'Treichville Rue 12', 'Abidjan'),
    ('a1111111-0000-0000-0000-000000000005', 'PARTENAIRE', 'InovTech Télécoms SA', '+225 27 20 21 22 23', 'direction@inovtech-ci.com', 'Deux Plateaux Vallon', 'Abidjan')
ON CONFLICT (id) DO NOTHING;

-- 3. INSERTION CATALOGUE ARTICLES
INSERT INTO public.catalogue_articles (id, code_article, designation, type_article, quantite_stock, cout_unitaire_achat, prix_unitaire_vente, seuil_alerte, unite, fournisseur_id)
VALUES
    ('b1111111-0000-0000-0000-000000000001', 'ART-001', 'Câble Réseau RJ45 Cat6 (Bobine 100m)', 'CONSOMMABLE', 18, 25000, 45000, 5, 'Bobine', 'a1111111-0000-0000-0000-000000000003'),
    ('b1111111-0000-0000-0000-000000000002', 'ART-002', 'Switch 24 Ports Gigabit PoE+', 'EQUIPEMENT', 4, 120000, 185000, 3, 'Pièce', 'a1111111-0000-0000-0000-000000000004'),
    ('b1111111-0000-0000-0000-000000000003', 'ART-003', 'Onduleur 1500VA APC Smart-UPS', 'EQUIPEMENT', 2, 160000, 240000, 3, 'Pièce', 'a1111111-0000-0000-0000-000000000004'),
    ('b1111111-0000-0000-0000-000000000004', 'ART-004', 'Disjoncteur Différentiel 32A Schneider', 'PIECE_DETACHEE', 15, 14000, 22000, 6, 'Pièce', 'a1111111-0000-0000-0000-000000000004'),
    ('b1111111-0000-0000-0000-000000000005', 'ART-005', 'Ampoule LED Industrielle 50W', 'CONSOMMABLE', 3, 4500, 8000, 10, 'Pièce', 'a1111111-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- 4. INSERTION INTERVENTIONS MAINTENANCE
INSERT INTO public.interventions_maintenance (id, site_agence, utilisateur_concerne, client_id, equipement, observation, travaux, prix, quantite, statut, priorite, technicien_assigne, date_intervention)
VALUES
    ('c1111111-0000-0000-0000-000000000001', 'Agence Centrale Plateau', 'Mme Kouassi (Chef d''agence)', 'a1111111-0000-0000-0000-000000000001', 'Climatiseur Split 24000 BTU', 'Fuite de gaz réfrigérant et arrêt complet du compresseur', 'Recharge fluide R410A, remplacement raccord et test étanchéité', 85000, 1, 'EN_COURS', 'HAUTE', 'Koffi Paul (Tech Froid)', now() - interval '1 day'),
    ('c1111111-0000-0000-0000-000000000002', 'Site Principal Cocody', 'Direction Générale', 'a1111111-0000-0000-0000-000000000002', 'Serveur Baie de Brassage & Onduleur', 'Micro-coupures répétées lors des variations réseau', 'Remplacement batteries onduleur et rééquilibrage de phase', 145000, 1, 'EN_ATTENTE', 'URGENTE', 'Yao Marc (Tech Réseau)', now() - interval '3 hours'),
    ('c1111111-0000-0000-0000-000000000003', 'Agence Yopougon', 'Service Caisse', 'a1111111-0000-0000-0000-000000000001', 'Imprimante Réseau HP LaserJet Pro', 'Bourrage papier systématique bac 2', 'Changement galets d''entraînement et dépoussiérage optique', 35000, 1, 'TERMINEE', 'MOYENNE', 'Touré Ibrahim', now() - interval '3 days')
ON CONFLICT (id) DO NOTHING;

-- 5. INSERTION MOUVEMENTS DE CAISSE
INSERT INTO public.mouvements_caisse (id, type, montant, motif, categorie, tier_id, tier_type, beneficiaire_emetteur, mode_reglement, date)
VALUES
    ('d1111111-0000-0000-0000-000000000001', 'ENTREE', 1500000, 'Apport initial caisse centrale début de mois', 'FONDS_ROULEMENT', NULL, 'AUTRE', 'Direction Financière', 'VIREMENT', now() - interval '10 days'),
    ('d1111111-0000-0000-0000-000000000002', 'SORTIE', 85000, 'Achat fournitures d''entretien et consommables urgents', 'ACHATS', 'a1111111-0000-0000-0000-000000000003', 'FOURNISSEUR', 'Afric Distribution Matériel', 'ESPECES', now() - interval '5 days'),
    ('d1111111-0000-0000-0000-000000000003', 'ENTREE', 320000, 'Règlement acompte Prestation Réseau Hôtel Ivoire', 'PRESTATION', 'a1111111-0000-0000-0000-000000000002', 'CLIENT', 'Hôtel Ivoire Palace', 'CHEQUE', now() - interval '3 days'),
    ('d1111111-0000-0000-0000-000000000004', 'SORTIE', 45000, 'Frais de déplacement équipe technique maintenance', 'TRANSPORT', NULL, 'AUTRE', 'Koffi Paul', 'MOBILE_MONEY', now() - interval '1 day'),
    ('d1111111-0000-0000-0000-000000000005', 'SORTIE', 120000, 'Achat pièces de rechange onduleur et disjoncteurs', 'MAINTENANCE', 'a1111111-0000-0000-0000-000000000004', 'FOURNISSEUR', 'Tech & Energy Solutions', 'ESPECES', now() - interval '4 hours')
ON CONFLICT (id) DO NOTHING;

-- 6. INSERTION PRESTATIONS & COMMANDES
INSERT INTO public.prestations_commandes (id, reference, client_id, description, montant_total_vente, cout_total_revient, statut, date_commande)
VALUES
    ('e1111111-0000-0000-0000-000000000001', 'CMD-2026-001', 'a1111111-0000-0000-0000-000000000001', 'Câblage structuré baie informatique 24 postes + certification réseau', 850000, 480000, 'CONFIRMEE', now() - interval '7 days'),
    ('e1111111-0000-0000-0000-000000000002', 'CMD-2026-002', 'a1111111-0000-0000-0000-000000000002', 'Audit électrique et mise à niveau des parafoudres agence', 620000, 290000, 'FACTUREE', now() - interval '4 days'),
    ('e1111111-0000-0000-0000-000000000003', 'CMD-2026-003', 'a1111111-0000-0000-0000-000000000001', 'Maintenance préventive trimestrielle parc informatique (15 machines)', 450000, 150000, 'DEVIS', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;
