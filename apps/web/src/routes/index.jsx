import { createBrowserRouter, createHashRouter } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import PagesRoutes from './PagesRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const isElectron = typeof window !== 'undefined' && (
  Boolean(window.electronAPI) ||
  window.location.protocol === 'file:' ||
  navigator.userAgent.includes('Electron')
);

const createRouterFn = isElectron ? createHashRouter : createBrowserRouter;

const router = createRouterFn([MainRoutes, PagesRoutes], {
  basename: isElectron ? undefined : import.meta.env.VITE_APP_BASE_URL
});

export default router;

