const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createInitialState,
  applyFeed,
  applyPet,
  applySleepTick,
  applyDecay,
} = require('../src/main/state/character-state');

test('createInitialState returns full stats', () => {
  assert.deepEqual(createInitialState(), { hunger: 100, energy: 100, happiness: 100 });
});

test('applyFeed applies exact deltas when below the clamp', () => {
  const next = applyFeed({ hunger: 50, energy: 50, happiness: 50 });
  assert.equal(next.hunger, 70);
  assert.equal(next.energy, 52);
  assert.equal(next.happiness, 55);
});

test('applyFeed clamps at 100', () => {
  const next = applyFeed({ hunger: 90, energy: 99, happiness: 97 });
  assert.equal(next.hunger, 100);
  assert.equal(next.energy, 100);
  assert.equal(next.happiness, 100);
});

test('applyPet raises happiness by 10 and clamps at 100', () => {
  assert.equal(applyPet({ hunger: 50, energy: 50, happiness: 50 }).happiness, 60);
  assert.equal(applyPet({ hunger: 50, energy: 50, happiness: 95 }).happiness, 100);
});

test('applyDecay reduces stats over time and clamps at 0', () => {
  const next = applyDecay({ hunger: 1, energy: 1, happiness: 1 }, 10 * 60000);
  assert.equal(next.hunger, 0);
  assert.equal(next.energy, 0);
  assert.equal(next.happiness, 0);
});

test('applySleepTick regenerates energy without exceeding 100', () => {
  const next = applySleepTick({ hunger: 50, energy: 90, happiness: 50 }, 5 * 60000);
  assert.equal(next.energy, 100);
});

test('applySleepTick does not touch hunger or happiness', () => {
  const next = applySleepTick({ hunger: 40, energy: 10, happiness: 40 }, 60000);
  assert.equal(next.hunger, 40);
  assert.equal(next.happiness, 40);
});
