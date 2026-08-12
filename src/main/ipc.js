const { ipcMain } = require('electron');
const { showContextMenu } = require('./context-menu');

function registerIpc(overlayWindow, tickLoop) {
  let dragOffset = null;

  ipcMain.on('overlay:drag-start', (event, cursorX, cursorY) => {
    const [winX, winY] = overlayWindow.getPosition();
    dragOffset = { dx: cursorX - winX, dy: cursorY - winY };
    tickLoop.setDragging(true);
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
    tickLoop.setDragging(false);
  });

  ipcMain.on('overlay:context-menu', () => {
    showContextMenu(overlayWindow, tickLoop);
  });
}

module.exports = { registerIpc };
