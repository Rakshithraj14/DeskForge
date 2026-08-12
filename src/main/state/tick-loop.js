const { screen } = require('electron');

const WALK_SPEED = 2; // px per tick
const TICK_MS = 150;
const PAUSE_MIN_TICKS = 15; // ~2.25s
const PAUSE_MAX_TICKS = 40; // ~6s

function randomPause() {
  return PAUSE_MIN_TICKS + Math.floor(Math.random() * (PAUSE_MAX_TICKS - PAUSE_MIN_TICKS));
}

function pickTarget(windowSize) {
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;
  const maxX = x + Math.max(1, width - windowSize.width);
  const maxY = y + Math.max(1, height - windowSize.height);
  return {
    x: x + Math.random() * (maxX - x),
    y: y + Math.random() * (maxY - y),
  };
}

function createTickLoop(overlayWindow, windowSize) {
  let sleeping = false;
  let dragging = false;
  let target = null;
  let pauseTicksLeft = randomPause();
  let lastKey = null;

  function sendState(animation, facingLeft = false) {
    const key = `${animation}:${facingLeft}`;
    if (key === lastKey) return;
    lastKey = key;
    overlayWindow.webContents.send('character:state', { animation, facingLeft });
  }

  const interval = setInterval(() => {
    if (dragging) return;

    if (sleeping) {
      sendState('sleep');
      return;
    }

    if (!target) {
      if (pauseTicksLeft > 0) {
        pauseTicksLeft -= 1;
        sendState('idle');
        return;
      }
      target = pickTarget(windowSize);
    }

    const [curX, curY] = overlayWindow.getPosition();
    const dx = target.x - curX;
    const dy = target.y - curY;
    const dist = Math.hypot(dx, dy);

    if (dist < WALK_SPEED) {
      overlayWindow.setPosition(Math.round(target.x), Math.round(target.y));
      target = null;
      pauseTicksLeft = randomPause();
      sendState('idle');
      return;
    }

    overlayWindow.setPosition(
      Math.round(curX + (dx / dist) * WALK_SPEED),
      Math.round(curY + (dy / dist) * WALK_SPEED)
    );
    sendState('walk', dx < 0);
  }, TICK_MS);

  return {
    stop: () => clearInterval(interval),
    setDragging: (value) => {
      dragging = value;
      if (value) target = null;
    },
    toggleSleep: () => {
      sleeping = !sleeping;
      if (sleeping) target = null;
    },
    isSleeping: () => sleeping,
  };
}

module.exports = { createTickLoop };
