const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('shadmanAuth', {
  login: (username, password) => ipcRenderer.invoke('auth:login', username, password)
});
