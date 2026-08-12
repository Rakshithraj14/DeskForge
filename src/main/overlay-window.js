const { BrowserWindow, screen } = require('electron');
const path = require('node:path');

const WIDTH = 140;
const HEIGHT = 160;

function createOverlayWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    x: Math.round((screenWidth - WIDTH) / 2),
    y: Math.round((screenHeight - HEIGHT) / 2),
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, '..', 'preload', 'overlay-preload.js'),
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile(path.join(__dirname, '..', 'renderer', 'overlay', 'index.html'));

  return win;
}

module.exports = { createOverlayWindow, WIDTH, HEIGHT };
