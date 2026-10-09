const test = require('node:test');
const assert = require('node:assert/strict');
const { validateActionPlan } = require('../src/main/ai/validate');

test('accepts a well-formed plan', () => {
  const plan = validateActionPlan(
    JSON.stringify({
      reply: 'On it!',
      actions: [{ tool: 'open_application', args: { name: 'vscode' } }],
    })
  );
  assert.equal(plan.reply, 'On it!');
  assert.deepEqual(plan.actions, [{ tool: 'open_application', args: { name: 'vscode' } }]);
});

test('falls back to an empty plan on malformed JSON', () => {
  const plan = validateActionPlan('not json at all {');
  assert.equal(plan.actions.length, 0);
  assert.equal(typeof plan.reply, 'string');
});

test('drops actions with an unknown tool name but keeps valid ones', () => {
  const plan = validateActionPlan(
    JSON.stringify({
      reply: 'done',
      actions: [
        { tool: 'delete_everything', args: {} },
        { tool: 'play_music', args: { path: '/music/song.mp3' } },
      ],
    })
  );
  assert.deepEqual(plan.actions, [{ tool: 'play_music', args: { path: '/music/song.mp3' } }]);
});

test('handles garbage input without throwing', () => {
  const plan = validateActionPlan(undefined);
  assert.deepEqual(plan.actions, []);
  assert.equal(typeof plan.reply, 'string');
});

test('extracts JSON embedded in surrounding prose or markdown fences', () => {
  const plan = validateActionPlan(
    '```json\n' + JSON.stringify({ reply: 'sure', actions: [] }) + '\n```'
  );
  assert.equal(plan.reply, 'sure');
});

test('drops actions missing an args object', () => {
  const plan = validateActionPlan(
    JSON.stringify({ reply: 'hm', actions: [{ tool: 'open_file' }] })
  );
  assert.deepEqual(plan.actions, []);
});
