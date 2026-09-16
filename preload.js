const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  loadDatabase: () => ipcRenderer.invoke('db:get'),
  saveDatabase: (base64) => ipcRenderer.invoke('db:save', base64),
  chooseFolder: () => ipcRenderer.invoke('db:choose-folder'),
  getStorageInfo: () => ipcRenderer.invoke('db:info'),
});
