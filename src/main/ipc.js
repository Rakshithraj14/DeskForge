const { ipcMain } = require('electron');

function registerIpc(overlayWindow) {
  let dragOffset = null;

  ipcMain.on('overlay:drag-start', (event, cursorX, cursorY) => {
    const [winX, winY] = overlayWindow.getPosition();
    dragOffset = { dx: cursorX - winX, dy: cursorY - winY };
  });

  ipcMain.on('overlay:drag-move', (event, cursorX, cursorY) => {
    if (!dragOffset) return;
    overlayWindow.setPosition(
      Math.round(cursorX - dragOffset.dx),
      Math.round(cursorY - dragOffset.dy)
    );
  });

  ipcMain.on('overlay:drag-end', () => {
    dragOffset = null;
  });
}

module.exports = { registerIpc };
