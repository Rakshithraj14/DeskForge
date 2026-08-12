const VALID_TOOLS = new Set([
  'open_application',
  'open_file',
  'open_folder',
  'list_files',
  'play_music',
]);

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return text;
  return text.slice(start, end + 1);
}

function validateActionPlan(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(extractJson(String(rawText ?? '')));
  } catch {
    return { reply: "I couldn't understand that.", actions: [] };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { reply: "I couldn't understand that.", actions: [] };
  }

  const reply = typeof parsed.reply === 'string' ? parsed.reply : '';
  const rawActions = Array.isArray(parsed.actions) ? parsed.actions : [];

  const actions = rawActions.filter(
    (action) =>
      action &&
      typeof action === 'object' &&
      VALID_TOOLS.has(action.tool) &&
      typeof action.args === 'object' &&
      action.args !== null
  );

  return { reply, actions };
}

module.exports = { validateActionPlan };
