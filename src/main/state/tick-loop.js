const { screen } = require('electron');
const { applyFeed, applyPet, applySleepTick, applyDecay } = require('./character-state');
const { expandForPrompt, collapse } = require('../overlay-window');

const WALK_SPEED = 2; // px per tick
const TICK_MS = 150;
const PAUSE_MIN_TICKS = 15; // ~2.25s
const PAUSE_MAX_TICKS = 40; // ~6s
const REACTION_TICKS = Math.round(3000 / TICK_MS); // ~3s
const FOLLOW_OFFSET_X = 24;
const FOLLOW_OFFSET_Y = 24;
const IDLE_MESSAGE_MIN_TICKS = Math.round(30000 / TICK_MS); // ~30s
const IDLE_MESSAGE_MAX_TICKS = Math.round(90000 / TICK_MS); // ~90s

const IDLE_MESSAGES = [
  'Just vibing.',
  '*stretches*',
  'What are you working on?',
  "Don't forget to save your work!",
  'Meow?',
  '...',
];
const FEED_MESSAGES = ['Yum!', 'Thank you!', 'So good!'];
const PET_MESSAGES = ['That feels nice~', 'Purr...', 'More pets please!'];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomPause() {
  return PAUSE_MIN_TICKS + Math.floor(Math.random() * (PAUSE_MAX_TICKS - PAUSE_MIN_TICKS));
}

function randomIdleMessageTicks() {
  return IDLE_MESSAGE_MIN_TICKS + Math.floor(Math.random() * (IDLE_MESSAGE_MAX_TICKS - IDLE_MESSAGE_MIN_TICKS));
}

function workAreaBounds(windowSize) {
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;
  return {
    x,
    y,
    maxX: x + Math.max(1, width - windowSize.width),
    maxY: y + Math.max(1, height - windowSize.height),
  };
}

function pickTarget(windowSize) {
  const { x, y, maxX, maxY } = workAreaBounds(windowSize);
  return {
    x: x + Math.random() * (maxX - x),
    y: y + Math.random() * (maxY - y),
  };
}

function clampToWorkArea(point, windowSize) {
  const { x, y, maxX, maxY } = workAreaBounds(windowSize);
  return {
    x: Math.min(Math.max(point.x, x), maxX),
    y: Math.min(Math.max(point.y, y), maxY),
  };
}

function createTickLoop(overlayWindow, windowSize, initialStats) {
  let sleeping = false;
  let dragging = false;
  let promptOpen = false;
  let followCursor = false;
  let target = null;
  let pauseTicksLeft = randomPause();
  let idleMessageTicksLeft = randomIdleMessageTicks();
  let lastKey = null;
  let stats = initialStats;
  let reaction = null; // { animation: 'thinking' | 'success' | 'error', ticksLeft }
  let messageTimer = null;
  let messageShowing = false;

  function sendState(animation, facingLeft = false) {
    const key = `${animation}:${facingLeft}`;
    if (key === lastKey) return;
    lastKey = key;
    overlayWindow.webContents.send('character:state', { animation, facingLeft });
  }

  function showMessage(text, durationMs = 3500) {
    if (promptOpen || dragging) return;
    clearTimeout(messageTimer);
    messageShowing = true;
    expandForPrompt(overlayWindow);
    overlayWindow.webContents.send('character:message', text);
    messageTimer = setTimeout(() => {
      messageShowing = false;
      overlayWindow.webContents.send('character:message', null);
      if (!promptOpen && !dragging) collapse(overlayWindow);
    }, durationMs);
  }

  const interval = setInterval(() => {
    try {
      stats = sleeping ? applySleepTick(stats, TICK_MS) : applyDecay(stats, TICK_MS);

      if (reaction) {
        sendState(reaction.animation);
        reaction.ticksLeft -= 1;
        if (reaction.ticksLeft <= 0) reaction = null;
        return;
      }

      if (dragging || promptOpen || messageShowing) return;

      if (sleeping) {
        sendState('sleep');
        return;
      }

      idleMessageTicksLeft -= 1;
      if (idleMessageTicksLeft <= 0) {
        idleMessageTicksLeft = randomIdleMessageTicks();
        showMessage(pickRandom(IDLE_MESSAGES));
      }

      if (followCursor) {
        const cursor = screen.getCursorScreenPoint();
        target = clampToWorkArea(
          { x: cursor.x + FOLLOW_OFFSET_X, y: cursor.y + FOLLOW_OFFSET_Y },
          windowSize
        );
      } else if (!target) {
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
        if (!followCursor) {
          target = null;
          pauseTicksLeft = randomPause();
        }
        sendState('idle');
        return;
      }

      overlayWindow.setPosition(
        Math.round(curX + (dx / dist) * WALK_SPEED),
        Math.round(curY + (dy / dist) * WALK_SPEED)
      );
      sendState('walk', dx < 0);
    } catch (err) {
      console.error('tick loop error:', err);
    }
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
    setPromptOpen: (value) => {
      promptOpen = value;
      if (value) target = null;
    },
    toggleFollowCursor: () => {
      followCursor = !followCursor;
      target = null;
      return followCursor;
    },
    isFollowingCursor: () => followCursor,
    feed: () => {
      stats = applyFeed(stats);
      reaction = { animation: 'success', ticksLeft: REACTION_TICKS };
      showMessage(pickRandom(FEED_MESSAGES));
    },
    pet: () => {
      stats = applyPet(stats);
      reaction = { animation: 'success', ticksLeft: REACTION_TICKS };
      showMessage(pickRandom(PET_MESSAGES));
    },
    getStats: () => stats,
    reactThinking: () => {
      reaction = { animation: 'thinking', ticksLeft: Infinity };
    },
    reactSuccess: () => {
      reaction = { animation: 'success', ticksLeft: REACTION_TICKS };
    },
    reactError: () => {
      reaction = { animation: 'error', ticksLeft: REACTION_TICKS };
    },
  };
}

module.exports = { createTickLoop };
