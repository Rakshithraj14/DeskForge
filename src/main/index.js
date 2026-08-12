const { app } = require('electron');
const { createOverlayWindow, WIDTH, HEIGHT } = require('./overlay-window');
const { createTray } = require('./tray');
const { registerIpc } = require('./ipc');
const { createTickLoop } = require('./state/tick-loop');
const { createInitialState } = require('./state/character-state');
const { loadState, createPersistence } = require('./state/persistence');

app.whenReady().then(() => {
  const overlayWindow = createOverlayWindow();
  const initialStats = loadState(createInitialState());
  const tickLoop = createTickLoop(overlayWindow, { width: WIDTH, height: HEIGHT }, initialStats);
  const persistence = createPersistence(() => tickLoop.getStats());
  createTray();
  registerIpc(overlayWindow, tickLoop);

  overlayWindow.on('closed', () => tickLoop.stop());

  app.on('before-quit', () => {
    persistence.save();
    persistence.stop();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
