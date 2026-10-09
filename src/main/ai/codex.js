const { buildSystemPrompt } = require('./prompt-template');
const { validateActionPlan } = require('./validate');

async function getActionPlan(userPrompt, settings = {}) {
  if (!settings.codexApiKey) {
    throw new Error('No Codex/OpenAI API key set - add one in Settings');
  }

  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey: settings.codexApiKey });

  const response = await client.chat.completions.create({
    model: settings.codexModel || 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt(settings) },
      { role: 'user', content: userPrompt },
    ],
  });

  const text = response.choices[0]?.message?.content ?? '';
  return validateActionPlan(text);
}

module.exports = { getActionPlan };
