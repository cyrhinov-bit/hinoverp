"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let mainWindow = null;
function getHtmlEntryPath() {
    // Chemins possibles selon le mode (Dev, Packagé, Monorepo)
    const pathsToTry = [
        path.join(__dirname, '../../web/dist/index.html'),
        path.join(__dirname, '../web/dist/index.html'),
        path.join(electron_1.app.getAppPath(), 'apps/web/dist/index.html'),
        path.join(electron_1.app.getAppPath(), 'web/dist/index.html'),
        path.join(process.resourcesPath, 'app/apps/web/dist/index.html'),
        path.join(process.resourcesPath, 'apps/web/dist/index.html')
    ];
    for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
            return p;
        }
    }
    // Repli par défaut
    return path.join(__dirname, '../../web/dist/index.html');
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
    const isDev = process.env.NODE_ENV !== 'production' && !electron_1.app.isPackaged;
    const webUrl = process.env.VITE_DEV_SERVER_URL;
    if (isDev && webUrl) {
        mainWindow.loadURL(webUrl);
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        const indexPath = getHtmlEntryPath();
        mainWindow.loadFile(indexPath).catch((err) => {
            console.warn('Echec chargement fichier HTML local:', err);
        });
    }
    // Configuration du menu applicatif natif
    const template = [
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
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// Gestion des événements IPC
electron_1.ipcMain.on('window-minimize', () => mainWindow?.minimize());
electron_1.ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    }
    else {
        mainWindow?.maximize();
    }
});
electron_1.ipcMain.on('window-close', () => mainWindow?.close());
electron_1.ipcMain.handle('window-is-maximized', () => mainWindow?.isMaximized() || false);
electron_1.ipcMain.on('show-notification', (_event, { title, body }) => {
    if (electron_1.Notification.isSupported()) {
        new electron_1.Notification({ title, body }).show();
    }
});
electron_1.ipcMain.on('window-print', () => {
    mainWindow?.webContents.print({ silent: false, printBackground: true });
});
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
