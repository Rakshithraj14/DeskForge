const open = require('open');

async function openApplication({ name }) {
  if (!name) throw new Error('open_application requires "name"');
  await open.openApp(name);
  return { opened: name };
}

module.exports = { openApplication };
