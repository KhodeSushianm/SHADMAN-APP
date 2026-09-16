const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  ready: () => ipcRenderer.invoke('app:ready'),
  query: (sql, params = []) => ipcRenderer.invoke('db:query', sql, params),
  run: (sql, params = []) => ipcRenderer.invoke('db:run', sql, params),
  transaction: statements => ipcRenderer.invoke('db:transaction', statements),
  getStorageInfo: () => ipcRenderer.invoke('db:info'),
  chooseFolder: () => ipcRenderer.invoke('db:choose-folder'),
  exportDatabase: () => ipcRenderer.invoke('db:export'),
  importDatabase: () => ipcRenderer.invoke('db:import'),
  openFolder: () => ipcRenderer.invoke('app:open-folder')
});
