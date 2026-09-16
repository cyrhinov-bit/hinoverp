import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import MainLayout from 'layouts/MainLayout';
import ModuleGuard from 'components/guards/ModuleGuard';

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
      element: (
        <ModuleGuard adminOnly>
          <UsersManager />
        </ModuleGuard>
      )
    },
    {
      path: '/admin/permissions',
      element: (
        <ModuleGuard adminOnly>
          <PermissionsManager />
        </ModuleGuard>
      )
    },
    {
      path: '/admin/supabase',
      element: (
        <ModuleGuard adminOnly>
          <SupabaseStatus />
        </ModuleGuard>
      )
    },
    {
      path: '/tiers',
      element: (
        <ModuleGuard moduleCode="CLIENTS_FOURNISSEURS">
          <TiersModule />
        </ModuleGuard>
      )
    },
    {
      path: '/commerciaux',
      element: (
        <ModuleGuard moduleCode="COMMERCIAUX">
          <CommerciauxModule />
        </ModuleGuard>
      )
    },
    {
      path: '/commissions',
      element: (
        <ModuleGuard moduleCode="COMMISSIONS">
          <CommissionsModule />
        </ModuleGuard>
      )
    },
    {
      path: '/prestations',
      element: (
        <ModuleGuard moduleCode="PRESTATIONS">
          <PrestationsModule />
        </ModuleGuard>
      )
    },
    {
      path: '/caisse',
      element: (
        <ModuleGuard moduleCode="CAISSE_DEPENSES">
          <CaisseModule />
        </ModuleGuard>
      )
    },
    {
      path: '/stocks',
      element: (
        <ModuleGuard moduleCode="STOCKS">
          <StocksModule />
        </ModuleGuard>
      )
    },
    {
      path: '/maintenance',
      element: (
        <ModuleGuard moduleCode="MAINTENANCE">
          <MaintenanceModule />
        </ModuleGuard>
      )
    }
  ]
};

export default MainRoutes;
