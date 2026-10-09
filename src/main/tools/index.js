const { openApplication } = require('./open-application');
const { openFile } = require('./open-file');
const { openFolder } = require('./open-folder');
const { listFiles } = require('./list-files');
const { playMusic } = require('./play-music');

const TOOLS = {
  open_application: openApplication,
  open_file: openFile,
  open_folder: openFolder,
  list_files: listFiles,
  play_music: playMusic,
};

async function runTool(name, args) {
  const tool = TOOLS[name];
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return tool(args || {});
}

module.exports = { TOOLS, runTool };
