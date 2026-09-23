import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  getPlatform: () => process.platform,
  getVersion: () => '1.0.0',
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  showNotification: (title: string, body: string) => ipcRenderer.send('show-notification', { title, body }),
  print: () => ipcRenderer.send('window-print'),
  onNavigate: (callback: (path: string) => void) => {
    const subscription = (_event: any, path: string) => callback(path);
    ipcRenderer.on('navigate', subscription);
    return () => ipcRenderer.removeListener('navigate', subscription);
  }
});


