const fs = require('node:fs/promises');

async function listFiles({ path: dirPath }) {
  if (!dirPath) throw new Error('list_files requires "path"');
  const entries = await fs.readdir(dirPath);
  return { path: dirPath, files: entries };
}

module.exports = { listFiles };
