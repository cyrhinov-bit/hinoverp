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
  { id: 'um-8', user_id: 'usr-staff-2', module_id: 'mod-1', is_enabled: true },
  { id: 'um-9', user_id: 'usr-staff-2', module_id: 'mod-2', is_enabled: true },
  { id: 'um-10', user_id: 'usr-staff-2', module_id: 'mod-3', is_enabled: true },
  { id: 'um-11', user_id: 'usr-staff-2', module_id: 'mod-4', is_enabled: true },
  { id: 'um-12', user_id: 'usr-staff-2', module_id: 'mod-5', is_enabled: true },
  { id: 'um-13', user_id: 'usr-staff-2', module_id: 'mod-6', is_enabled: true },
  { id: 'um-14', user_id: 'usr-staff-2', module_id: 'mod-7', is_enabled: true }
];

// Données Métier de Production : Vides pour saisie des données réelles
export const INITIAL_AGENTS_COMMERCIAUX: AgentCommercial[] = [];

export const INITIAL_CLIENTS_FOURNISSEURS: ClientFournisseur[] = [];

export const INITIAL_PRESTATIONS: PrestationCommande[] = [];

export const INITIAL_COMMISSIONS: CommissionItem[] = [];

export const INITIAL_ARTICLES: CatalogueArticle[] = [];

export const INITIAL_INTERVENTIONS: InterventionMaintenance[] = [];

export const INITIAL_MOUVEMENTS: MouvementCaisse[] = [];
