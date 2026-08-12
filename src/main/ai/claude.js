const { buildSystemPrompt } = require('./prompt-template');
const { validateActionPlan } = require('./validate');

async function getActionPlan(userPrompt, settings = {}) {
  if (!settings.claudeApiKey) {
    throw new Error('No Claude API key set - add one in Settings');
  }

  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: settings.claudeApiKey });

  const response = await client.messages.create({
    model: settings.claudeModel || 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: buildSystemPrompt(settings),
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return validateActionPlan(text);
}

module.exports = { getActionPlan };
