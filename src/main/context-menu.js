const { Menu, app } = require('electron');

function showContextMenu(overlayWindow, tickLoop) {
  const menu = Menu.buildFromTemplate([
    { label: 'Feed', click: () => tickLoop.feed() },
    { label: 'Pet', click: () => tickLoop.pet() },
    { type: 'separator' },
    { label: 'Toggle Sleep', click: () => tickLoop.toggleSleep() },
    { label: 'Follow Cursor', type: 'checkbox', checked: tickLoop.isFollowingCursor(), click: () => tickLoop.toggleFollowCursor() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  menu.popup({ window: overlayWindow });
}

module.exports = { showContextMenu };
