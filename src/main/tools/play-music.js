const open = require('open');

async function playMusic({ path }) {
  if (!path) throw new Error('play_music requires "path"');
  await open(path);
  return { playing: path };
}

module.exports = { playMusic };
