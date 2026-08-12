const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('deskforge', {
  startDrag: (screenX, screenY) => ipcRenderer.send('overlay:drag-start', screenX, screenY),
  dragTo: (screenX, screenY) => ipcRenderer.send('overlay:drag-move', screenX, screenY),
  endDrag: () => ipcRenderer.send('overlay:drag-end'),
  requestContextMenu: () => ipcRenderer.send('overlay:context-menu'),
  onStateUpdate: (callback) => ipcRenderer.on('character:state', (event, state) => callback(state)),
});
