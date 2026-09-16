import PeopleIcon from '@mui/icons-material/People';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import StorageIcon from '@mui/icons-material/Storage';

const admin = {
  id: 'admin-section',
  title: 'ADMINISTRATION SYSTÈME',
  type: 'group',
  adminOnly: true,
  children: [
    {
      id: 'admin-users',
      title: 'Gestion des Utilisateurs',
      type: 'item',
      url: '/admin/users',
      icon: PeopleIcon,
      caption: 'Comptes, rôles & affectations'
    },
    {
      id: 'admin-permissions',
      title: 'Gestion des Permissions',
      type: 'item',
      url: '/admin/permissions',
      icon: ToggleOnIcon,
      caption: 'Toggles activation modules'
    },
    {
      id: 'admin-supabase',
      title: 'État Supabase & Données',
      type: 'item',
      url: '/admin/supabase',
      icon: StorageIcon,
      caption: 'Connexion & synchronisation'
    }
  ]
};

export default admin;
