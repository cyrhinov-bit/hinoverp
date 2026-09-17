// Types TypeScript pour la base de données Supabase ERP Hinov Suivi

export type UserRole = 'ADMIN' | 'USER';

export type ModuleCode = 
  | 'MAINTENANCE' 
  | 'STOCKS' 
  | 'CAISSE_DEPENSES' 
  | 'PRESTATIONS' 
  | 'CLIENTS_FOURNISSEURS'
  | 'COMMERCIAUX'
  | 'COMMISSIONS';

export interface Profile {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
  password?: string;
  telephone?: string;
  poste?: string;
  actif?: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface ERPModule {
  id: string;
  code_module: ModuleCode;
  nom: string;
  description: string;
  icone?: string;
  ordre?: number;
  created_at?: string;
}

export interface UserModule {
  id: string;
  user_id: string;
  module_id: string;
  is_enabled: boolean;
  updated_at?: string;
}

export interface UserWithModules extends Profile {
  modules: {
    module_id: string;
    code_module: ModuleCode;
    nom: string;
    is_enabled: boolean;
  }[];
}

export type ThirdPartyType = 'CLIENT' | 'FOURNISSEUR' | 'PARTENAIRE';

export interface ClientFournisseur {
  id: string;
  type: ThirdPartyType;
  nom: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  ville?: string;
  total_chiffre_affaires?: number;
  total_depenses?: number;
  solde_en_cours?: number;
  commandes_count?: number;
  interventions_count?: number;
  articles_count?: number;
  notes?: string;
  cree_par?: string;
  cree_par_nom?: string;
  created_at?: string;
}

export type ArticleType = 'CONSOMMABLE' | 'EQUIPEMENT' | 'PIECE_DETACHEE' | 'MATERIEL';

export interface CatalogueArticle {
  id: string;
  code_article?: string;
  designation: string;
  type_article: ArticleType;
  quantite_stock: number;
  cout_unitaire_achat: number;
  prix_unitaire_vente: number;
  seuil_alerte: number;
  unite?: string;
  fournisseur_id?: string;
  fournisseur_nom?: string;
  created_at?: string;
  updated_at?: string;
}

export type InterventionStatut = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
export type InterventionPriorite = 'BASSE' | 'MOYENNE' | 'HAUTE' | 'URGENTE';

export interface InterventionMaintenance {
  id: string;
  site_agence: string;
  utilisateur_concerne?: string;
  equipement: string;
  observation?: string;
  travaux?: string;
  prix_unitaire?: number;
  quantite: number;
  prix: number; // Coût total de l'intervention (prix_unitaire * quantite)
  statut: InterventionStatut;
  priorite: InterventionPriorite;
  technicien_assigne?: string;
  client_id?: string;
  client_nom?: string;
  date_intervention: string;
  created_at?: string;
}

export type MouvementType = 'ENTREE' | 'SORTIE';
export type ModeReglement = 'ESPECES' | 'CHEQUE' | 'VIREMENT' | 'MOBILE_MONEY';

export interface MouvementCaisse {
  id: string;
  type: MouvementType;
  montant: number;
  motif: string;
  categorie?: string;
  module_code?: string; // Code du module rattaché (PRESTATIONS, MAINTENANCE, STOCKS, COMMISSIONS, GENERAL)
  beneficiaire_emetteur?: string;
  tier_id?: string;
  tier_type?: ThirdPartyType | 'AUTRE';
  tier_nom?: string;
  mode_reglement?: ModeReglement;
  date: string;
  cree_par?: string;
  cree_par_nom?: string;
  created_at?: string;
}

export type PrestationStatut = 'DEVIS' | 'CONFIRMEE' | 'EN_COURS' | 'FACTUREE' | 'PAYEE';

export interface PrestationCommande {
  id: string;
  reference: string;
  client_id?: string;
  client_nom?: string;
  
  // 1. DÉSIGNATIONS
  description: string;
  designation?: string; // Alias DÉSIGNATIONS

  // 2. QUANTITÉS
  quantite?: number; // Défaut : 1

  // 3 & 4. COÛT UNITAIRE & COÛT FINAL ACHAT
  cout_unitaire_achat?: number;
  cout_total_revient: number; // Coût final achat = quantite * cout_unitaire_achat

  // 5 & 6. MONTANT VENTE UNITAIRE & PRIX CLIENT FINAL
  prix_unitaire_vente?: number;
  montant_total_vente: number; // Prix client final = quantite * prix_unitaire_vente
  
  // 7. MARGE INTERNE
  marge_interne?: number; // Prix client final - Coût final achat
  marge_brute?: number; // Alias marge_interne

  // 8. COMMISSION APPORTEUR (10% par défaut)
  commission_apporteur_taux?: number; // Défaut : 10%
  commission_apporteur_montant?: number; // Calculé auto : montant_total_vente * (taux / 100)
  apporteur_id?: string;
  apporteur_nom?: string;
  
  // 9. COMMISSION RESPONSABLE SERVICE
  commission_responsable_montant?: number; // Saisie libre
  responsable_service_id?: string;
  responsable_service_nom?: string;

  // 10. COMMISSION AGENT COMMERCIAL
  commission_commercial_montant?: number; // Saisie libre
  commercial_id?: string;
  commercial_nom?: string;

  // 11. BÉNÉFICE RÉEL
  benefice_reel?: number; // Marge interne - (Comm Apporteur + Comm Responsable + Comm Commercial)
  marge_nette?: number; // Alias benefice_reel
  
  statut: PrestationStatut;
  date_commande: string;
  created_at?: string;
}

// ====================================================================
// NOUVEAUX TYPES : AGENTS COMMERCIAUX & COMMISSIONS
// ====================================================================

export interface AgentCommercial {
  id: string;
  matricule?: string;
  nom: string;
  prenom?: string;
  telephone: string;
  email?: string;
  zone_secteur?: string;
  taux_commission_defaut?: number; // ex: 5%
  actif: boolean;
  total_ventes?: number;
  total_commissions_dues?: number;
  total_commissions_payees?: number;
  contrats_clos_count?: number;
  created_at?: string;
}

export type CommissionType = 'APPORTEUR' | 'AGENT_COMMERCIAL' | 'RESPONSABLE';
export type CommissionStatut = 'A_VALIDER' | 'A_PAYER' | 'PAYEE' | 'ANNULEE';

export interface CommissionItem {
  id: string;
  prestation_id: string;
  prestation_ref: string;
  type: CommissionType;
  beneficiaire_id?: string;
  beneficiaire_nom: string;
  beneficiaire_contact?: string;
  montant_prestation: number;
  taux_pourcentage?: number;
  montant_commission: number;
  statut: CommissionStatut;
  date_reglement?: string;
  mode_reglement?: ModeReglement;
  mouvement_caisse_id?: string;
  note?: string;
  created_at: string;
}
