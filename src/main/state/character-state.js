const MIN_STAT = 0;
const MAX_STAT = 100;

const HUNGER_DECAY_PER_MIN = 1;
const ENERGY_DECAY_PER_MIN = 0.5;
const HAPPINESS_DECAY_PER_MIN = 0.5;
const ENERGY_REGEN_PER_MIN = 5;

function clamp(value) {
  return Math.min(MAX_STAT, Math.max(MIN_STAT, value));
}

function createInitialState() {
  return { hunger: 100, energy: 100, happiness: 100 };
}

function applyFeed(state) {
  return {
    ...state,
    hunger: clamp(state.hunger + 20),
    happiness: clamp(state.happiness + 5),
    energy: clamp(state.energy + 2),
  };
}

function applyPet(state) {
  return { ...state, happiness: clamp(state.happiness + 10) };
}

function applySleepTick(state, elapsedMs) {
  const minutes = elapsedMs / 60000;
  return { ...state, energy: clamp(state.energy + ENERGY_REGEN_PER_MIN * minutes) };
}

function applyDecay(state, elapsedMs) {
  const minutes = elapsedMs / 60000;
  return {
    ...state,
    hunger: clamp(state.hunger - HUNGER_DECAY_PER_MIN * minutes),
    energy: clamp(state.energy - ENERGY_DECAY_PER_MIN * minutes),
    happiness: clamp(state.happiness - HAPPINESS_DECAY_PER_MIN * minutes),
  };
}

module.exports = {
  createInitialState,
  applyFeed,
  applyPet,
  applySleepTick,
  applyDecay,
};
