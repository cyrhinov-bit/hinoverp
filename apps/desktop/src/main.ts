import { app, BrowserWindow, ipcMain, Menu, Notification } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;

function getHtmlEntryPath(): string {
  // Chemins possibles selon le mode (Dev, Packagé ASAR, Packagé Dir, Monorepo)
  const pathsToTry = [
    path.join(app.getAppPath(), 'dist/index.html'),
    path.join(__dirname, '../dist/index.html'),
    path.join(__dirname, '../../web/dist/index.html'),
    path.join(__dirname, '../web/dist/index.html'),
    path.join(app.getAppPath(), 'apps/web/dist/index.html'),
    path.join(app.getAppPath(), 'web/dist/index.html'),
    path.join(process.resourcesPath, 'app.asar/dist/index.html'),
    path.join(process.resourcesPath, 'app/dist/index.html'),
    path.join(process.resourcesPath, 'apps/web/dist/index.html')
  ];

  for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Repli par défaut
  return path.join(app.getAppPath(), 'dist/index.html');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
    title: 'Hinov ERP - Plateforme Multi-Services Desktop',
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
  const webUrl = process.env.VITE_DEV_SERVER_URL;

  if (isDev && webUrl) {
    mainWindow.loadURL(webUrl);
  } else {
    const indexPath = getHtmlEntryPath();
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('Echec chargement fichier HTML local:', err);
    });
  }

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('Erreur chargement Electron:', errorCode, errorDescription, validatedURL);
  });

  // Configuration du menu applicatif natif
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Fichier',
      submenu: [
        { label: 'Recharger', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Plein écran', accelerator: 'F11', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Imprimer / Exporter PDF', accelerator: 'CmdOrCtrl+P', click: () => mainWindow?.webContents.print() },
        { type: 'separator' },
        { label: 'Quitter', accelerator: 'CmdOrCtrl+Q', role: 'quit' }
      ]
    },
    {
      label: 'Modules ERP',
      submenu: [
        { label: 'Tableau de bord', click: () => mainWindow?.webContents.send('navigate', '/') },
        { label: 'Clients & Fournisseurs', click: () => mainWindow?.webContents.send('navigate', '/tiers') },
        { label: 'Agents Commerciaux', click: () => mainWindow?.webContents.send('navigate', '/commerciaux') },
        { label: 'Prestations & Commandes', click: () => mainWindow?.webContents.send('navigate', '/prestations') },
        { label: 'Gestion des Commissions', click: () => mainWindow?.webContents.send('navigate', '/commissions') },
        { label: 'Dépenses & Caisse', click: () => mainWindow?.webContents.send('navigate', '/caisse') },
        { label: 'Stocks & Consommables', click: () => mainWindow?.webContents.send('navigate', '/stocks') },
        { label: 'Maintenance & Pannes', click: () => mainWindow?.webContents.send('navigate', '/maintenance') },
        { type: 'separator' },
        { label: 'Administration des Utilisateurs', click: () => mainWindow?.webContents.send('navigate', '/admin/users') },
        { label: 'Gestion des Permissions', click: () => mainWindow?.webContents.send('navigate', '/admin/permissions') }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { label: 'Zoom +', role: 'zoomIn' },
        { label: 'Zoom -', role: 'zoomOut' },
        { label: 'Réinitialiser le Zoom', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Outils Développeur', role: 'toggleDevTools' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handlers IPC pour la communication avec le front-end React
ipcMain.handle('app:version', () => app.getVersion());
ipcMain.handle('app:isPackaged', () => app.isPackaged);

ipcMain.on('app:notify', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title: title || 'Hinov ERP', body: body || '' }).show();
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
