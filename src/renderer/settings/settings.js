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
  const settings = await window.deskforgeDashboard.getSettings();

  document.getElementById('userName').value = settings.userName || '';
  document.getElementById('petName').value = settings.petName || '';

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

  refreshStats();
}

function setBar(id, value) {
  document.getElementById(id).style.width = `${Math.max(0, Math.min(100, value))}%`;
}

async function refreshStats() {
  const stats = await window.deskforgeDashboard.getStats();
  setBar('hunger-bar', stats.hunger);
  setBar('energy-bar', stats.energy);
  setBar('happiness-bar', stats.happiness);
}

document.getElementById('feed-btn').addEventListener('click', async () => {
  await window.deskforgeDashboard.feed();
  refreshStats();
});

document.getElementById('pet-btn').addEventListener('click', async () => {
  await window.deskforgeDashboard.pet();
  refreshStats();
});

document.getElementById('sleep-btn').addEventListener('click', async () => {
  await window.deskforgeDashboard.toggleSleep();
});

document.getElementById('test-connection').addEventListener('click', async () => {
  const statusEl = document.getElementById('connection-status');

  if (providerSelect.value !== 'ollama') {
    statusEl.textContent = 'Live testing is only available for Ollama right now - Claude/Codex keys are used on your next prompt.';
    statusEl.className = 'connection-status';
    return;
  }

  statusEl.textContent = 'Testing...';
  statusEl.className = 'connection-status';

  const baseUrl = document.getElementById('ollamaBaseUrl').value.trim();
  const result = await window.deskforgeDashboard.testConnection(baseUrl);
  statusEl.textContent = result.message;
  statusEl.className = `connection-status ${result.ok ? 'ok' : 'fail'}`;
});

saveButton.addEventListener('click', async () => {
  const partial = {
    userName: document.getElementById('userName').value.trim(),
    petName: document.getElementById('petName').value.trim(),
    provider: providerSelect.value,
    ollamaModel: document.getElementById('ollamaModel').value.trim(),
    ollamaBaseUrl: document.getElementById('ollamaBaseUrl').value.trim(),
    claudeModel: document.getElementById('claudeModel').value.trim(),
    codexModel: document.getElementById('codexModel').value.trim(),
    claudeApiKey: document.getElementById('claudeApiKey').value.trim(),
    codexApiKey: document.getElementById('codexApiKey').value.trim(),
  };
  await window.deskforgeDashboard.saveSettings(partial);
  document.getElementById('claudeApiKey').value = '';
  document.getElementById('codexApiKey').value = '';
  saveStatus.textContent = 'Saved.';
  setTimeout(() => { saveStatus.textContent = ''; }, 2500);
  init();
});

init();
setInterval(refreshStats, 3000);
