import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import MainLayout from 'layouts/MainLayout';

// ERP Pages
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/default')));
const UserProfile = Loadable(lazy(() => import('views/profile/UserProfile')));
const UsersManager = Loadable(lazy(() => import('views/admin/UsersManager')));
const PermissionsManager = Loadable(lazy(() => import('views/admin/PermissionsManager')));
const SupabaseStatus = Loadable(lazy(() => import('views/admin/SupabaseStatus')));
const TiersModule = Loadable(lazy(() => import('views/modules/tiers')));
const CommerciauxModule = Loadable(lazy(() => import('views/modules/commerciaux')));
const CommissionsModule = Loadable(lazy(() => import('views/modules/commissions')));
const PrestationsModule = Loadable(lazy(() => import('views/modules/prestations')));
const CaisseModule = Loadable(lazy(() => import('views/modules/caisse')));
const StocksModule = Loadable(lazy(() => import('views/modules/stocks')));
const MaintenanceModule = Loadable(lazy(() => import('views/modules/maintenance')));

// ==============================|| MAIN ROUTES ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: '/dashboard/default',
      element: <DashboardDefault />
    },
    {
      path: '/profile',
      element: <UserProfile />
    },
    {
      path: '/admin/users',
      element: <UsersManager />
    },
    {
      path: '/admin/permissions',
      element: <PermissionsManager />
    },
    {
      path: '/admin/supabase',
      element: <SupabaseStatus />
    },
    {
      path: '/tiers',
      element: <TiersModule />
    },
    {
      path: '/commerciaux',
      element: <CommerciauxModule />
    },
    {
      path: '/commissions',
      element: <CommissionsModule />
    },
    {
      path: '/prestations',
      element: <PrestationsModule />
    },
    {
      path: '/caisse',
      element: <CaisseModule />
    },
    {
      path: '/stocks',
      element: <StocksModule />
    },
    {
      path: '/maintenance',
      element: <MaintenanceModule />
    }
  ]
};

export default MainRoutes;
