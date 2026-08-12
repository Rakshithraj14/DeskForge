const { Menu, app } = require('electron');

function showContextMenu(overlayWindow, tickLoop) {
  const menu = Menu.buildFromTemplate([
    { label: 'Toggle Sleep', click: () => tickLoop.toggleSleep() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  menu.popup({ window: overlayWindow });
}

module.exports = { showContextMenu };
