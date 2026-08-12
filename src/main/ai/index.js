const providers = {
  ollama: require('./ollama'),
  claude: require('./claude'),
  codex: require('./codex'),
};

async function getActionPlan(providerName, userPrompt, settings) {
  const provider = providers[providerName];
  if (!provider || typeof provider.getActionPlan !== 'function') {
    throw new Error(`AI provider not available: ${providerName}`);
  }
  return provider.getActionPlan(userPrompt, settings);
}

module.exports = { getActionPlan };
