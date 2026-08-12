const os = require('node:os');
const path = require('node:path');
const open = require('open');

// Virtual Windows shell locations that have no real filesystem path -
// only reachable by pointing explorer at a shell: URI.
const SHELL_FOLDERS = {
  'this pc': 'shell:MyComputerFolder',
  'my computer': 'shell:MyComputerFolder',
  computer: 'shell:MyComputerFolder',
  'recycle bin': 'shell:RecycleBinFolder',
  'control panel': 'shell:ControlPanelFolder',
};

// Common folders under the user's home directory an LLM/user is likely to
// name in plain English rather than an absolute path.
const HOME_FOLDERS = {
  desktop: 'Desktop',
  documents: 'Documents',
  downloads: 'Downloads',
  pictures: 'Pictures',
  music: 'Music',
  videos: 'Videos',
};

async function openFolder({ path: target }) {
  if (!target) throw new Error('open_folder requires "path"');
  const key = target.trim().toLowerCase();

  if (SHELL_FOLDERS[key]) {
    await open.openApp('explorer', { arguments: [SHELL_FOLDERS[key]] });
    return { opened: target };
  }

  const resolved = HOME_FOLDERS[key] ? path.join(os.homedir(), HOME_FOLDERS[key]) : target;
  await open(resolved);
  return { opened: resolved };
}

module.exports = { openFolder };
