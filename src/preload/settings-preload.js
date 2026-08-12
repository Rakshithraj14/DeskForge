const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('deskforgeSettings', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (partial) => ipcRenderer.invoke('settings:save', partial),
});
