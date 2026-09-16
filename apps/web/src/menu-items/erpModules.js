import BuildIcon from '@mui/icons-material/Build';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const erpModules = {
  id: 'erp-services',
  title: 'SERVICES & MÉTIERS',
  type: 'group',
  children: [
    {
      id: 'module-tiers',
      title: 'Clients & Fournisseurs',
      type: 'item',
      url: '/tiers',
      icon: PeopleIcon,
      moduleCode: 'CLIENTS_FOURNISSEURS',
      caption: 'Annuaire & contacts croisés'
    },
    {
      id: 'module-commerciaux',
      title: 'Agents Commerciaux',
      type: 'item',
      url: '/commerciaux',
      icon: BadgeIcon,
      moduleCode: 'COMMERCIAUX',
      caption: 'Équipe de vente & objectifs'
    },
    {
      id: 'module-prestations',
      title: 'Prestations & Commandes',
      type: 'item',
      url: '/prestations',
      icon: ReceiptLongIcon,
      moduleCode: 'PRESTATIONS',
      caption: 'Devis, marges et commissions'
    },
    {
      id: 'module-commissions',
      title: 'Gestion des Commissions',
      type: 'item',
      url: '/commissions',
      icon: MonetizationOnIcon,
      moduleCode: 'COMMISSIONS',
      caption: 'Apporteurs (10%) & règlements'
    },
    {
      id: 'module-caisse',
      title: 'Dépenses & Caisse',
      type: 'item',
      url: '/caisse',
      icon: AccountBalanceWalletIcon,
      moduleCode: 'CAISSE_DEPENSES',
      caption: 'Journal & trésorerie live'
    },
    {
      id: 'module-stocks',
      title: 'Stocks & Consommables',
      type: 'item',
      url: '/stocks',
      icon: Inventory2Icon,
      moduleCode: 'STOCKS',
      caption: 'Catalogue & alertes stock'
    },
    {
      id: 'module-maintenance',
      title: 'Maintenance & Pannes',
      type: 'item',
      url: '/maintenance',
      icon: BuildIcon,
      moduleCode: 'MAINTENANCE',
      caption: 'Sites, pannes, interventions'
    }
  ]
};

export default erpModules;
