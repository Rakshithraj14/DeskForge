const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const open = require('open');

// Names an LLM is likely to say that don't match the actual Windows
// executable/command it needs to launch (e.g. Edge's binary is msedge, not edge).
const APP_ALIASES = {
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

// Built-in Windows (UWP) apps that have no launchable exe on PATH at all -
// they only open through their registered URI protocol.
const URI_ALIASES = {
  gallery: 'ms-photos:',
  photos: 'ms-photos:',
  'photo gallery': 'ms-photos:',
  settings: 'ms-settings:',
  'windows settings': 'ms-settings:',
  store: 'ms-windows-store:',
  'microsoft store': 'ms-windows-store:',
  camera: 'microsoft.windows.camera:',
};

// Many modern per-user installs (Telegram, etc.) never register on PATH or
// in the App Paths registry key, so a bare command name silently fails.
// Try the handful of directory shapes that cover most of them before giving up.
function findByCommonInstallPattern(name) {
  const local = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  const candidates = [
    path.join(local, 'Programs', name, `${name}.exe`),
    path.join(local, name, `${name}.exe`),
    path.join(local, `${name} Desktop`, `${name}.exe`),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function openApplication({ name, url }) {
  if (!name) throw new Error('open_application requires "name"');
  const key = name.trim().toLowerCase();

  if (URI_ALIASES[key]) {
    await open(URI_ALIASES[key]);
    return { opened: name };
  }

  const resolved = APP_ALIASES[key] || name;
  const appArguments = url ? [url] : [];

  try {
    await open.openApp(resolved, { arguments: appArguments });
  } catch (err) {
    const fallbackPath = findByCommonInstallPattern(resolved.replace(/\.exe$/i, ''));
    if (!fallbackPath) throw err;
    await open.openApp(fallbackPath, { arguments: appArguments });
  }

  return { opened: name, url };
}

module.exports = { openApplication };
