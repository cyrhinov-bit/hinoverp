import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import MinimalLayout from 'layouts/minimalLayout';

// pages
const LoginPage = Loadable(lazy(() => import('views/auth/Login')));
const RegisterPage = Loadable(lazy(() => import('views/auth/Register')));

// ==============================|| PAGES & AUTH ROUTES ||============================== //

const PagesRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: 'login',
      element: <LoginPage />
    },
    {
      path: 'register',
      element: <RegisterPage />
    },
    {
      path: 'pages/auth/login',
      element: <LoginPage />
    },
    {
      path: 'pages/auth/register',
      element: <RegisterPage />
    }
  ]
};

export default PagesRoutes;
