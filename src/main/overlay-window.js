const { BrowserWindow, screen } = require('electron');
const path = require('node:path');

const WIDTH = 140;
const HEIGHT = 160;
const PROMPT_EXTRA_WIDTH = 220;

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

function expandForPrompt(win) {
  const [x, y] = win.getPosition();
  const { x: screenX, width: screenWidth } = screen.getPrimaryDisplay().workArea;
  const newWidth = WIDTH + PROMPT_EXTRA_WIDTH;
  const maxX = screenX + screenWidth - newWidth;
  const newX = Math.min(x, Math.max(screenX, maxX));
  win.setBounds({ x: newX, y, width: newWidth, height: HEIGHT });
}

function collapse(win) {
  const [x, y] = win.getPosition();
  win.setBounds({ x, y, width: WIDTH, height: HEIGHT });
}

module.exports = { createOverlayWindow, expandForPrompt, collapse, WIDTH, HEIGHT };
