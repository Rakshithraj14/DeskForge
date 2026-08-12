const { SYSTEM_PROMPT } = require('./prompt-template');
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
        { role: 'system', content: SYSTEM_PROMPT },
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

module.exports = { getActionPlan };
