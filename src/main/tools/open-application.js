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
// `open`'s Windows launcher is fire-and-forget (a hidden PowerShell wrapper
// with stdio ignored) and resolves as soon as PowerShell itself starts, not
// when the target actually launches - so a try/catch around it never sees a
// failure. Check the disk ourselves first instead of trusting an exception.
function findByCommonInstallPattern(name) {
  const local = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  const candidates = [
    path.join(local, 'Programs', name, `${name}.exe`),
    path.join(local, name, `${name}.exe`),
    path.join(local, `${name} Desktop`, `${name}.exe`),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

// Local models in particular sometimes ignore the "url" field and cram the
// target URL into "name" instead - recover it rather than silently losing it.
const URL_PATTERN = /(https?:\/\/\S+|www\.\S+)/i;

async function openApplication({ name, url }) {
  if (!name) throw new Error('open_application requires "name"');

  let appName = name.trim();
  let target = url ? url.trim() : '';

  if (!target) {
    const match = appName.match(URL_PATTERN);
    if (match) {
      target = match[0];
      appName = appName.replace(URL_PATTERN, '').trim();
    }
  }

  if (!appName && target) {
    await open(target);
    return { opened: name, url: target };
  }

  const key = appName.toLowerCase();

  if (URI_ALIASES[key]) {
    await open(URI_ALIASES[key]);
    return { opened: name };
  }

  const resolved = APP_ALIASES[key] || appName;
  const localPath = findByCommonInstallPattern(resolved.replace(/\.exe$/i, ''));
  const appArguments = target ? [target] : [];

  await open.openApp(localPath || resolved, { arguments: appArguments });
  return { opened: name, url: target || undefined };
}

module.exports = { openApplication };
