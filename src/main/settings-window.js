const { BrowserWindow } = require('electron');
const path = require('node:path');

let settingsWindow = null;

function openSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    settingsWindow.focus();
    return settingsWindow;
  }

  settingsWindow = new BrowserWindow({
    width: 400,
    height: 660,
    minWidth: 360,
    minHeight: 480,
    resizable: true,
    title: 'DeskForge Dashboard',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, '..', 'preload', 'settings-preload.js'),
    },
  });

  settingsWindow.setMenuBarVisibility(false);
  settingsWindow.loadFile(path.join(__dirname, '..', 'renderer', 'settings', 'index.html'));

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  return settingsWindow;
}

module.exports = { openSettingsWindow };
