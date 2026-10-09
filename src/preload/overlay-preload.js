const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('deskforge', {
  startDrag: (screenX, screenY) => ipcRenderer.send('overlay:drag-start', screenX, screenY),
  dragTo: (screenX, screenY) => ipcRenderer.send('overlay:drag-move', screenX, screenY),
  endDrag: () => ipcRenderer.send('overlay:drag-end'),
  requestContextMenu: () => ipcRenderer.send('overlay:context-menu'),
  onStateUpdate: (callback) => ipcRenderer.on('character:state', (event, state) => callback(state)),
  getActiveCharacter: () => ipcRenderer.invoke('character:get-active'),
  onCharacterChanged: (callback) => ipcRenderer.on('character:changed', (event, id) => callback(id)),
  onMessage: (callback) => ipcRenderer.on('character:message', (event, text) => callback(text)),
  expandForPrompt: () => ipcRenderer.invoke('overlay:expand'),
  collapse: () => ipcRenderer.invoke('overlay:collapse'),
  sendPrompt: (text) => ipcRenderer.invoke('ai:prompt', text),
});
