const { Tray, Menu, app, nativeImage } = require('electron');
const path = require('node:path');

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'tray-icon.png'));
  const tray = new Tray(icon);
  tray.setToolTip('DeskForge');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Quit', click: () => app.quit() },
  ]));
  return tray;
}

module.exports = { createTray };
