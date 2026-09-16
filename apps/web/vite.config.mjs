import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const APP_BASE_URL = env.VITE_APP_BASE_URL || '/';
  const PORT = 3000;

  return {
    server: {
      open: false,
      port: PORT,
      host: true
    },
    preview: {
      open: false,
      host: true
    },
    define: {
      global: 'window'
    },
    base: APP_BASE_URL,
    plugins: [react(), jsconfigPaths()]
  };
});
