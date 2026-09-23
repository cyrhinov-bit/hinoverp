import { 
  ERPModule, 
  Profile, 
  UserModule, 
  ClientFournisseur, 
  CatalogueArticle, 
  InterventionMaintenance, 
  MouvementCaisse, 
  PrestationCommande,
  AgentCommercial,
  CommissionItem
} from '../types/database';

export const INITIAL_MODULES: ERPModule[] = [
  {
    id: 'mod-1',
    code_module: 'MAINTENANCE',
    nom: 'Maintenance & Interventions',
    description: 'Gestion des pannes, suivi des interventions sur sites et agences',
    icone: 'BuildTwoTone',
    ordre: 1
  },
  {
    id: 'mod-2',
    code_module: 'STOCKS',
    nom: 'Stocks & Consommables',
    description: 'Inventaire, suivi des articles, quantités et alertes de réapprovisionnement',
    icone: 'InventoryTwoTone',
    ordre: 2
  },
  {
    id: 'mod-3',
    code_module: 'CAISSE_DEPENSES',
    nom: 'Dépenses & Caisse',
    description: 'Journal de trésorerie, suivi des entrées et sorties en temps réel',
    icone: 'AccountBalanceWalletTwoTone',
    ordre: 3
  },
  {
    id: 'mod-4',
    code_module: 'PRESTATIONS',
    nom: 'Prestations & Commandes',
    description: 'Suivi des devis, commandes clients et calcul automatisé des marges',
    icone: 'ReceiptTwoTone',
    ordre: 4
  },
  {
    id: 'mod-5',
    code_module: 'CLIENTS_FOURNISSEURS',
    nom: 'Clients & Fournisseurs',
    description: 'Répertoire centralisé des tiers, contacts, coordonnées et historique croisé',
    icone: 'PeopleAltTwoTone',
    ordre: 5
  },
  {
    id: 'mod-6',
    code_module: 'COMMERCIAUX',
    nom: 'Agents Commerciaux',
    description: 'Gestion des agents commerciaux, portefeuille d\'affaires et performances',
    icone: 'BadgeTwoTone',
    ordre: 6
  },
  {
    id: 'mod-7',
    code_module: 'COMMISSIONS',
    nom: 'Gestion des Commissions',
    description: 'Suivi, validation et liquidation des commissions apporteurs et agents',
    icone: 'MonetizationOnTwoTone',
    ordre: 7
  }
];

// Profils pour l'initialisation Production
export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'usr-admin-1',
    nom: 'Evariste Gnonskan',
    poste: 'Directeur Général & Administrateur Principal',
    email: 'e.gnonskan@hinovgroup.com',
    password: '04041992',
    telephone: '+225 07 00 00 00 00',
    role: 'ADMIN',
    actif: true,
    avatar_url: '',
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-staff-2',
    nom: 'A. Bosso',
    poste: 'Collaborateur & Gestionnaire Opérationnel',
    email: 'a.bosso@hinovgroup.com',
    password: '123654',
    telephone: '+225 05 00 00 00 00',
    role: 'USER',
    actif: true,
    avatar_url: '',
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-admin-2',
    nom: 'Y. Ouattara',
    poste: 'Directeur Général & Administrateur',
    email: 'y.ouattara@hinovgroup.com',
    password: '123654',
    telephone: '+225 07 00 00 00 00',
    role: 'ADMIN',
    actif: true,
    avatar_url: '',
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-staff-3',
    nom: 'S. Diallo',
    poste: 'Collaborateur & Gestionnaire Opérationnel',
    email: 's.diallo@hinovgroup.com',
    password: '123654',
    telephone: '+225 07 00 00 00 00',
    role: 'USER',
    actif: true,
    avatar_url: '',
    created_at: new Date().toISOString()
  }
];

// Habilitations initiales
export const INITIAL_USER_MODULES: UserModule[] = [
  { id: 'um-1', user_id: 'usr-admin-1', module_id: 'mod-1', is_enabled: true },
  { id: 'um-2', user_id: 'usr-admin-1', module_id: 'mod-2', is_enabled: true },
  { id: 'um-3', user_id: 'usr-admin-1', module_id: 'mod-3', is_enabled: true },
  { id: 'um-4', user_id: 'usr-admin-1', module_id: 'mod-4', is_enabled: true },
  { id: 'um-5', user_id: 'usr-admin-1', module_id: 'mod-5', is_enabled: true },
  { id: 'um-6', user_id: 'usr-admin-1', module_id: 'mod-6', is_enabled: true },
  { id: 'um-7', user_id: 'usr-admin-1', module_id: 'mod-7', is_enabled: true },
  { id: 'um-8', user_id: 'usr-staff-2', module_id: 'mod-1', is_enabled: true }, // Maintenance
  { id: 'um-9', user_id: 'usr-staff-2', module_id: 'mod-2', is_enabled: true }, // Stocks
  { id: 'um-10', user_id: 'usr-staff-2', module_id: 'mod-3', is_enabled: true }, // Dépenses & Caisse
  { id: 'um-11', user_id: 'usr-staff-2', module_id: 'mod-4', is_enabled: false }, // Prestations & Commandes (DÉSACTIVÉ)
  { id: 'um-12', user_id: 'usr-staff-2', module_id: 'mod-5', is_enabled: true }, // Clients & Fournisseurs
  { id: 'um-13', user_id: 'usr-staff-2', module_id: 'mod-6', is_enabled: false }, // Agents Commerciaux (DÉSACTIVÉ)
  { id: 'um-14', user_id: 'usr-staff-2', module_id: 'mod-7', is_enabled: false }, // Gestion des Commissions (DÉSACTIVÉ)
  { id: 'um-15', user_id: 'usr-admin-2', module_id: 'mod-1', is_enabled: true }, // Maintenance
  { id: 'um-16', user_id: 'usr-admin-2', module_id: 'mod-2', is_enabled: true }, // Stocks
  { id: 'um-17', user_id: 'usr-admin-2', module_id: 'mod-3', is_enabled: true }, // Dépenses & Caisse
  { id: 'um-18', user_id: 'usr-admin-2', module_id: 'mod-4', is_enabled: true }, // Prestations & Commandes
  { id: 'um-19', user_id: 'usr-admin-2', module_id: 'mod-5', is_enabled: true }, // Clients & Fournisseurs
  { id: 'um-20', user_id: 'usr-admin-2', module_id: 'mod-6', is_enabled: true }, // Agents Commerciaux
  { id: 'um-21', user_id: 'usr-admin-2', module_id: 'mod-7', is_enabled: true }, // Gestion des Commissions
  { id: 'um-22', user_id: 'usr-staff-3', module_id: 'mod-1', is_enabled: true }, // Maintenance
  { id: 'um-23', user_id: 'usr-staff-3', module_id: 'mod-2', is_enabled: true }, // Stocks
  { id: 'um-24', user_id: 'usr-staff-3', module_id: 'mod-3', is_enabled: true }, // Dépenses & Caisse
  { id: 'um-25', user_id: 'usr-staff-3', module_id: 'mod-4', is_enabled: true }, // Prestations & Commandes
  { id: 'um-26', user_id: 'usr-staff-3', module_id: 'mod-5', is_enabled: true }, // Clients & Fournisseurs
  { id: 'um-27', user_id: 'usr-staff-3', module_id: 'mod-6', is_enabled: true }, // Agents Commerciaux
  { id: 'um-28', user_id: 'usr-staff-3', module_id: 'mod-7', is_enabled: true }  // Gestion des Commissions
];

// Données Métier de Démonstration & Initialisation
export const INITIAL_CLIENTS_FOURNISSEURS: ClientFournisseur[] = [
  {
    id: 'a1111111-0000-0000-0000-000000000001',
    type: 'CLIENT',
    nom: 'Société Générale de Banque',
    telephone: '+225 07 01 02 03 04',
    email: 'contact@sgb-ci.com',
    adresse: 'Plateau Avenue Chardy',
    ville: 'Abidjan',
    cree_par: 'usr-admin-1',
    cree_par_nom: 'Evariste Gnonskan'
  },
  {
    id: 'a1111111-0000-0000-0000-000000000002',
    type: 'CLIENT',
    nom: 'Hôtel Ivoire Palace',
    telephone: '+225 05 55 44 33 22',
    email: 'logistique@ivoirepalace.com',
    adresse: 'Cocody Boulevard Hassan II',
    ville: 'Abidjan',
    cree_par: 'usr-staff-2',
    cree_par_nom: 'A. Bosso'
  },
  {
    id: 'a1111111-0000-0000-0000-000000000003',
    type: 'FOURNISSEUR',
    nom: 'Afric Distribution Matériel',
    telephone: '+225 01 02 03 04 05',
    email: 'commandes@africdistrib.ci',
    adresse: 'Zone Industrielle Yopougon',
    ville: 'Abidjan',
    cree_par: 'usr-staff-2',
    cree_par_nom: 'A. Bosso'
  },
  {
    id: 'a1111111-0000-0000-0000-000000000004',
    type: 'FOURNISSEUR',
    nom: 'Tech & Energy Solutions',
    telephone: '+225 07 77 88 99 00',
    email: 'support@techenergy.ci',
    adresse: 'Treichville Rue 12',
    ville: 'Abidjan',
    cree_par: 'usr-admin-1',
    cree_par_nom: 'Evariste Gnonskan'
  },
  {
    id: 'a1111111-0000-0000-0000-000000000005',
    type: 'PARTENAIRE',
    nom: 'InovTech Télécoms SA',
    telephone: '+225 27 20 21 22 23',
    email: 'direction@inovtech-ci.com',
    adresse: 'Deux Plateaux Vallon',
    ville: 'Abidjan',
    cree_par: 'usr-staff-2',
    cree_par_nom: 'A. Bosso'
  }
];

export const INITIAL_ARTICLES: CatalogueArticle[] = [
  {
    id: 'b1111111-0000-0000-0000-000000000001',
    code_article: 'ART-001',
    designation: 'Câble Réseau RJ45 Cat6 (Bobine 100m)',
    type_article: 'CONSOMMABLE',
    quantite_stock: 18,
    cout_unitaire_achat: 25000,
    prix_unitaire_vente: 45000,
    seuil_alerte: 5,
    unite: 'Bobine',
    fournisseur_id: 'a1111111-0000-0000-0000-000000000003',
    fournisseur_nom: 'Afric Distribution Matériel'
  },
  {
    id: 'b1111111-0000-0000-0000-000000000002',
    code_article: 'ART-002',
    designation: 'Switch 24 Ports Gigabit PoE+',
    type_article: 'EQUIPEMENT',
    quantite_stock: 4,
    cout_unitaire_achat: 120000,
    prix_unitaire_vente: 185000,
    seuil_alerte: 3,
    unite: 'Pièce',
    fournisseur_id: 'a1111111-0000-0000-0000-000000000004',
    fournisseur_nom: 'Tech & Energy Solutions'
  },
  {
    id: 'b1111111-0000-0000-0000-000000000003',
    code_article: 'ART-003',
    designation: 'Onduleur 1500VA APC Smart-UPS',
    type_article: 'EQUIPEMENT',
    quantite_stock: 2,
    cout_unitaire_achat: 160000,
    prix_unitaire_vente: 240000,
    seuil_alerte: 3,
    unite: 'Pièce',
    fournisseur_id: 'a1111111-0000-0000-0000-000000000004',
    fournisseur_nom: 'Tech & Energy Solutions'
  },
  {
    id: 'b1111111-0000-0000-0000-000000000004',
    code_article: 'ART-004',
    designation: 'Disjoncteur Différentiel 32A Schneider',
    type_article: 'PIECE_DETACHEE',
    quantite_stock: 15,
    cout_unitaire_achat: 14000,
    prix_unitaire_vente: 22000,
    seuil_alerte: 6,
    unite: 'Pièce',
    fournisseur_id: 'a1111111-0000-0000-0000-000000000004',
    fournisseur_nom: 'Tech & Energy Solutions'
  },
  {
    id: 'b1111111-0000-0000-0000-000000000005',
    code_article: 'ART-005',
    designation: 'Ampoule LED Industrielle 50W',
    type_article: 'CONSOMMABLE',
    quantite_stock: 3,
    cout_unitaire_achat: 4500,
    prix_unitaire_vente: 8000,
    seuil_alerte: 10,
    unite: 'Pièce',
    fournisseur_id: 'a1111111-0000-0000-0000-000000000003',
    fournisseur_nom: 'Afric Distribution Matériel'
  }
];

export const INITIAL_AGENTS_COMMERCIAUX: AgentCommercial[] = [];
export const INITIAL_PRESTATIONS: PrestationCommande[] = [];
export const INITIAL_INTERVENTIONS: InterventionMaintenance[] = [
  {
    id: 'c1111111-0000-0000-0000-000000000001',
    client_id: 'a1111111-0000-0000-0000-000000000001',
    client_nom: 'Société Générale de Banque',
    site_agence: 'Agence Centrale Plateau',
    utilisateur_concerne: 'Mme Kouassi (Chef d\'agence)',
    equipement: 'Climatiseur Split 24000 BTU',
    observation: 'Fuite de gaz réfrigérant et arrêt complet du compresseur',
    travaux: 'Recharge fluide R410A, remplacement raccord et test étanchéité',
    quantite: 1,
    prix_unitaire: 85000,
    prix: 85000,
    statut: 'EN_COURS',
    priorite: 'HAUTE',
    technicien_assigne: 'Koffi Paul (Tech Froid)',
    date_intervention: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'c1111111-0000-0000-0000-000000000002',
    client_id: 'a1111111-0000-0000-0000-000000000002',
    client_nom: 'Hôtel Ivoire Palace',
    site_agence: 'Site Principal Cocody',
    utilisateur_concerne: 'Direction Générale',
    equipement: 'Serveur Baie de Brassage & Onduleur',
    observation: 'Micro-coupures répétées lors des variations réseau',
    travaux: 'Remplacement batteries onduleur et rééquilibrage de phase',
    quantite: 1,
    prix_unitaire: 145000,
    prix: 145000,
    statut: 'EN_ATTENTE',
    priorite: 'URGENTE',
    technicien_assigne: 'Yao Marc (Tech Réseau)',
    date_intervention: new Date().toISOString()
  },
  {
    id: 'c1111111-0000-0000-0000-000000000003',
    client_id: 'a1111111-0000-0000-0000-000000000001',
    client_nom: 'Société Générale de Banque',
    site_agence: 'Agence Yopougon',
    utilisateur_concerne: 'Service Caisse',
    equipement: 'Imprimante Réseau HP LaserJet Pro',
    observation: 'Bourrage papier systématique bac 2',
    travaux: 'Changement galets d\'entraînement et dépoussiérage optique',
    quantite: 1,
    prix_unitaire: 35000,
    prix: 35000,
    statut: 'TERMINEE',
    priorite: 'MOYENNE',
    technicien_assigne: 'Touré Ibrahim',
    date_intervention: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_COMMISSIONS: CommissionItem[] = [];
export const INITIAL_MOUVEMENTS: MouvementCaisse[] = [];



