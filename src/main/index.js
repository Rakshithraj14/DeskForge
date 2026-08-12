const { app } = require('electron');
const { createOverlayWindow, WIDTH, HEIGHT } = require('./overlay-window');
const { createTray } = require('./tray');
const { registerIpc } = require('./ipc');
const { createTickLoop } = require('./state/tick-loop');

app.whenReady().then(() => {
  const overlayWindow = createOverlayWindow();
  const tickLoop = createTickLoop(overlayWindow, { width: WIDTH, height: HEIGHT });
  createTray();
  registerIpc(overlayWindow, tickLoop);

  overlayWindow.on('closed', () => tickLoop.stop());
});

app.on('window-all-closed', () => {
  app.quit();
});
