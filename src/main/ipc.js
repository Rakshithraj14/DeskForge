const { ipcMain } = require('electron');
const { showContextMenu } = require('./context-menu');
const { expandForPrompt, collapse } = require('./overlay-window');
const { getActionPlan } = require('./ai');
const { runTool } = require('./tools');

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

  ipcMain.handle('ai:prompt', async (event, text) => {
    tickLoop.reactThinking();

    let plan;
    try {
      plan = await getActionPlan('ollama', text, {});
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

    if (results.some((r) => !r.ok)) {
      tickLoop.reactError();
    } else {
      tickLoop.reactSuccess();
    }

    return { reply: plan.reply, actions: plan.actions, results };
  });
}

module.exports = { registerIpc };
