"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    isDesktop: true,
    getPlatform: () => process.platform,
    getVersion: () => '1.0.0',
    minimize: () => electron_1.ipcRenderer.send('window-minimize'),
    maximize: () => electron_1.ipcRenderer.send('window-maximize'),
    close: () => electron_1.ipcRenderer.send('window-close'),
    isMaximized: () => electron_1.ipcRenderer.invoke('window-is-maximized'),
    showNotification: (title, body) => electron_1.ipcRenderer.send('show-notification', { title, body }),
    print: () => electron_1.ipcRenderer.send('window-print'),
    onNavigate: (callback) => {
        const subscription = (_event, path) => callback(path);
        electron_1.ipcRenderer.on('navigate', subscription);
        return () => electron_1.ipcRenderer.removeListener('navigate', subscription);
    }
});
