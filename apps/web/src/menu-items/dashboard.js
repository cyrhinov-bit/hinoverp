import DashboardIcon from '@mui/icons-material/Dashboard';

const dashboard = {
  id: 'dashboard-group',
  title: 'NAVIGATION PRINCIPALE',
  type: 'group',
  children: [
    {
      id: 'default-dashboard',
      title: 'Tableau de bord',
      type: 'item',
      url: '/',
      icon: DashboardIcon,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
