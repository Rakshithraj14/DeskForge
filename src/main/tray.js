const { Tray, Menu, app, nativeImage } = require('electron');
const path = require('node:path');
const { openSettingsWindow } = require('./settings-window');

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'tray-icon.png'));
  const tray = new Tray(icon);
  tray.setToolTip('DeskForge');
  tray.on('click', () => openSettingsWindow());
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Dashboard', click: () => openSettingsWindow() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]));
  return tray;
}

module.exports = { createTray };
