import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Hinov ERP - Plateforme Multi-Services',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
  const webUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';

  if (isDev) {
    mainWindow.loadURL(webUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../web/dist/index.html'));
  }

  // Configuration du menu applicatif natif
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Fichier',
      submenu: [
        { label: 'Recharger', role: 'reload' },
        { label: 'Plein écran', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Quitter', role: 'quit' }
      ]
    },
    {
      label: 'Modules ERP',
      submenu: [
        { label: 'Tableau de bord', click: () => mainWindow?.webContents.send('navigate', '/') },
        { label: 'Maintenance & Interventions', click: () => mainWindow?.webContents.send('navigate', '/maintenance') },
        { label: 'Stocks & Consommables', click: () => mainWindow?.webContents.send('navigate', '/stocks') },
        { label: 'Dépenses & Caisse', click: () => mainWindow?.webContents.send('navigate', '/caisse') },
        { label: 'Prestations & Commandes', click: () => mainWindow?.webContents.send('navigate', '/prestations') },
        { label: 'Administration & Permissions', click: () => mainWindow?.webContents.send('navigate', '/admin/permissions') }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Gestion des événements IPC
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow?.close());

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

