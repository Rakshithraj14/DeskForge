const open = require('open');

async function openFile({ path }) {
  if (!path) throw new Error('open_file requires "path"');
  await open(path);
  return { opened: path };
}

module.exports = { openFile };
