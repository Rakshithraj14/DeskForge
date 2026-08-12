const { app } = require('electron');
const { createOverlayWindow } = require('./overlay-window');
const { createTray } = require('./tray');
const { registerIpc } = require('./ipc');

app.whenReady().then(() => {
  const overlayWindow = createOverlayWindow();
  createTray();
  registerIpc(overlayWindow);
});

app.on('window-all-closed', () => {
  app.quit();
});
