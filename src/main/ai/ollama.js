const { buildSystemPrompt } = require('./prompt-template');
const { validateActionPlan } = require('./validate');

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
      format: 'json',
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
