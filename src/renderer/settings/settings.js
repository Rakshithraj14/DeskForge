const providerSelect = document.getElementById('provider');
const saveButton = document.getElementById('save');
const saveStatus = document.getElementById('save-status');

const fieldGroups = {
  ollama: document.getElementById('ollama-fields'),
  claude: document.getElementById('claude-fields'),
  codex: document.getElementById('codex-fields'),
};

function showFieldsFor(provider) {
  for (const [name, el] of Object.entries(fieldGroups)) {
    el.style.display = name === provider ? 'block' : 'none';
  }
}

providerSelect.addEventListener('change', () => showFieldsFor(providerSelect.value));

async function init() {
  const settings = await window.deskforgeSettings.getSettings();
  providerSelect.value = settings.provider;
  showFieldsFor(settings.provider);

  document.getElementById('ollamaModel').value = settings.ollamaModel || '';
  document.getElementById('ollamaBaseUrl').value = settings.ollamaBaseUrl || '';
  document.getElementById('claudeModel').value = settings.claudeModel || '';
  document.getElementById('codexModel').value = settings.codexModel || '';

  document.getElementById('claude-key-status').textContent = settings.has_claudeApiKey
    ? 'API key saved.'
    : 'No API key saved yet.';
  document.getElementById('codex-key-status').textContent = settings.has_codexApiKey
    ? 'API key saved.'
    : 'No API key saved yet.';
}

saveButton.addEventListener('click', async () => {
  const partial = {
    provider: providerSelect.value,
    ollamaModel: document.getElementById('ollamaModel').value.trim(),
    ollamaBaseUrl: document.getElementById('ollamaBaseUrl').value.trim(),
    claudeModel: document.getElementById('claudeModel').value.trim(),
    codexModel: document.getElementById('codexModel').value.trim(),
    claudeApiKey: document.getElementById('claudeApiKey').value.trim(),
    codexApiKey: document.getElementById('codexApiKey').value.trim(),
  };
  await window.deskforgeSettings.saveSettings(partial);
  document.getElementById('claudeApiKey').value = '';
  document.getElementById('codexApiKey').value = '';
  saveStatus.textContent = 'Saved.';
  setTimeout(() => { saveStatus.textContent = ''; }, 2500);
  init();
});

init();
