const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('deskforgeDashboard', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (partial) => ipcRenderer.invoke('settings:save', partial),
  getStats: () => ipcRenderer.invoke('dashboard:stats'),
  feed: () => ipcRenderer.invoke('dashboard:feed'),
  pet: () => ipcRenderer.invoke('dashboard:pet'),
  toggleSleep: () => ipcRenderer.invoke('dashboard:toggle-sleep'),
  testConnection: (ollamaBaseUrl) => ipcRenderer.invoke('dashboard:test-connection', ollamaBaseUrl),
  setOpacity: (value) => ipcRenderer.invoke('dashboard:set-opacity', value),
});
