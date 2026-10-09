const fs = require('node:fs');
const path = require('node:path');
const { app } = require('electron');

function statePath() {
  return path.join(app.getPath('userData'), 'state.json');
}

function loadState(defaultState) {
  try {
    const raw = fs.readFileSync(statePath(), 'utf8');
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function createPersistence(getState, { intervalMs = 10000 } = {}) {
  function save() {
    try {
      fs.writeFileSync(statePath(), JSON.stringify(getState()));
    } catch (err) {
      console.error('Failed to persist state:', err);
    }
  }

  const interval = setInterval(save, intervalMs);

  return {
    save,
    stop: () => clearInterval(interval),
  };
}

module.exports = { loadState, createPersistence };
