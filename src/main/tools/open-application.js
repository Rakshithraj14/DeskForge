const open = require('open');

// Names an LLM is likely to say that don't match the actual Windows
// executable/command it needs to launch (e.g. Edge's binary is msedge, not edge).
const ALIASES = {
  edge: 'msedge',
  'microsoft edge': 'msedge',
  'google chrome': 'chrome',
  'file explorer': 'explorer',
  'this pc': 'explorer',
  'my computer': 'explorer',
  vscode: 'code',
  'vs code': 'code',
  'visual studio code': 'code',
  calculator: 'calc',
};

async function openApplication({ name }) {
  if (!name) throw new Error('open_application requires "name"');
  const resolved = ALIASES[name.trim().toLowerCase()] || name;
  await open.openApp(resolved);
  return { opened: name };
}

module.exports = { openApplication };
