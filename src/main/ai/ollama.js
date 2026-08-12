const { buildSystemPrompt } = require('./prompt-template');
const { validateActionPlan } = require('./validate');

// Plain format: 'json' only guarantees syntactically valid JSON, not this
// specific shape - small local models reliably ignore prose instructions
// like "url is a separate field" and cram it into "name" instead. A JSON
// Schema constrains the actual token generation, not just parseability.
const ACTION_PLAN_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tool: {
            type: 'string',
            enum: ['open_application', 'open_file', 'open_folder', 'list_files', 'play_music'],
          },
          args: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              url: { type: 'string' },
              path: { type: 'string' },
            },
          },
        },
        required: ['tool', 'args'],
      },
    },
  },
  required: ['reply', 'actions'],
};

async function getActionPlan(userPrompt, settings = {}) {
  const model = settings.ollamaModel || 'llama3.2';
  const baseUrl = settings.ollamaBaseUrl || 'http://localhost:11434';

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: buildSystemPrompt(settings) },
        { role: 'user', content: userPrompt },
      ],
      stream: false,
      format: ACTION_PLAN_SCHEMA,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`);
  }

  const data = await response.json();
  return validateActionPlan(data.message?.content ?? '');
}

async function testConnection(baseUrl) {
  try {
    const response = await fetch(`${baseUrl || 'http://localhost:11434'}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    return {
      ok: response.ok,
      message: response.ok ? 'Ollama is reachable.' : `Ollama responded with status ${response.status}.`,
    };
  } catch (err) {
    return { ok: false, message: `Could not reach Ollama: ${err.message}` };
  }
}

module.exports = { getActionPlan, testConnection };
