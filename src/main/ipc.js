const { ipcMain } = require('electron');
const { showContextMenu } = require('./context-menu');
const { expandForPrompt, collapse } = require('./overlay-window');
const { getActionPlan } = require('./ai');
const { testConnection: testOllamaConnection } = require('./ai/ollama');
const { runTool } = require('./tools');
const { loadSettings, getSettingsForRenderer, saveSettings } = require('./settings-store');

function registerIpc(overlayWindow, tickLoop) {
  let dragOffset = null;

  ipcMain.on('overlay:drag-start', (event, cursorX, cursorY) => {
    const [winX, winY] = overlayWindow.getPosition();
    dragOffset = { dx: cursorX - winX, dy: cursorY - winY };
    tickLoop.setDragging(true);
  });

  ipcMain.on('overlay:drag-move', (event, cursorX, cursorY) => {
    if (!dragOffset) return;
    overlayWindow.setPosition(
      Math.round(cursorX - dragOffset.dx),
      Math.round(cursorY - dragOffset.dy)
    );
  });

  ipcMain.on('overlay:drag-end', () => {
    dragOffset = null;
    tickLoop.setDragging(false);
  });

  ipcMain.on('overlay:context-menu', () => {
    showContextMenu(overlayWindow, tickLoop);
  });

  ipcMain.handle('overlay:expand', () => {
    tickLoop.setPromptOpen(true);
    expandForPrompt(overlayWindow);
  });

  ipcMain.handle('overlay:collapse', () => {
    tickLoop.setPromptOpen(false);
    collapse(overlayWindow);
  });

  ipcMain.handle('settings:get', () => getSettingsForRenderer());

  ipcMain.handle('settings:save', (event, partial) => {
    saveSettings(partial || {});
  });

  ipcMain.handle('dashboard:set-opacity', (event, value) => {
    const opacity = Math.max(0.2, Math.min(1, Number(value) || 1));
    overlayWindow.setOpacity(opacity);
    saveSettings({ overlayOpacity: opacity });
    return opacity;
  });

  ipcMain.handle('dashboard:stats', () => tickLoop.getStats());
  ipcMain.handle('dashboard:feed', () => tickLoop.feed());
  ipcMain.handle('dashboard:pet', () => tickLoop.pet());
  ipcMain.handle('dashboard:toggle-sleep', () => tickLoop.toggleSleep());

  ipcMain.handle('dashboard:test-connection', async (event, ollamaBaseUrl) => {
    const settings = loadSettings();
    return testOllamaConnection(ollamaBaseUrl || settings.ollamaBaseUrl);
  });

  ipcMain.handle('ai:prompt', async (event, text) => {
    tickLoop.reactThinking();

    const settings = loadSettings();
    let plan;
    try {
      plan = await getActionPlan(settings.provider, text, settings);
    } catch (err) {
      tickLoop.reactError();
      return { reply: `Something went wrong talking to the AI: ${err.message}`, actions: [], results: [] };
    }

    const results = [];
    for (const action of plan.actions) {
      try {
        const result = await runTool(action.tool, action.args);
        results.push({ tool: action.tool, ok: true, result });
      } catch (err) {
        results.push({ tool: action.tool, ok: false, error: err.message });
      }
    }

    const failed = results.filter((r) => !r.ok);
    let reply = plan.reply;
    if (failed.length > 0) {
      tickLoop.reactError();
      reply += `\n\n${failed.map((r) => `Couldn't ${r.tool.replace('_', ' ')}: ${r.error}`).join('\n')}`;
    } else {
      tickLoop.reactSuccess();
    }

    return { reply, actions: plan.actions, results };
  });
}

module.exports = { registerIpc };
