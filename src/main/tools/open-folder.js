const open = require('open');

async function openFolder({ path }) {
  if (!path) throw new Error('open_folder requires "path"');
  await open(path);
  return { opened: path };
}

module.exports = { openFolder };
