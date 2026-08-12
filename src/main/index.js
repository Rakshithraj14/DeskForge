const { app } = require('electron');
const { createOverlayWindow, WIDTH, HEIGHT } = require('./overlay-window');
const { createTray } = require('./tray');
const { registerIpc } = require('./ipc');
const { createTickLoop } = require('./state/tick-loop');
const { createInitialState } = require('./state/character-state');
const { loadState, createPersistence } = require('./state/persistence');

let overlayWindow = null;

// Launching the installed app a second time (e.g. double-clicking the shortcut
// while it's already running) would otherwise spawn a whole separate process
// with its own overlay window - a second cat. Only the first instance keeps
// the lock; every later launch just quits after nudging the original window.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!overlayWindow) return;
    if (overlayWindow.isMinimized()) overlayWindow.restore();
    overlayWindow.show();
    overlayWindow.focus();
  });

  app.whenReady().then(() => {
    overlayWindow = createOverlayWindow();
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
}
