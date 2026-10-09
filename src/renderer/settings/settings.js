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

document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    if (btn.dataset.tab === 'pets') renderPets();
  });
});

const petsList = document.getElementById('pets-list');
let currentCharacterId = null;

async function renderPets() {
  const characters = await window.deskforgeDashboard.listCharacters();
  petsList.innerHTML = '';

  for (const char of characters) {
    const dir = `../../../characters/${char.id}/`;
    const meta = await fetch(dir + 'character.json').then((r) => r.json());
    const idle = meta.animations.idle;
    const nativeW = meta.frameWidth || meta.frameSize;
    const nativeH = meta.frameHeight || meta.frameSize;
    const fit = Math.min(56 / nativeW, 56 / nativeH);
    const dispW = nativeW * fit;
    const dispH = nativeH * fit;
    const isActive = char.id === currentCharacterId;

    const card = document.createElement('div');
    card.className = `pet-card${isActive ? ' active' : ''}`;

    const preview = document.createElement('div');
    preview.className = 'pet-preview';
    preview.style.width = `${dispW}px`;
    preview.style.height = `${dispH}px`;
    preview.style.backgroundImage = `url(${dir}${idle.sheet})`;
    preview.style.backgroundSize = `${dispW * idle.frames}px ${dispH}px`;

    const info = document.createElement('div');
    info.className = 'pet-info';
    info.innerHTML = `<div class="pet-name">${meta.name}</div>${isActive ? '<div class="pet-current-tag">Currently active</div>' : ''}`;

    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.className = 'secondary pet-select-btn';
    selectBtn.textContent = isActive ? 'Selected' : 'Select';
    selectBtn.disabled = isActive;
    selectBtn.addEventListener('click', async () => {
      await window.deskforgeDashboard.selectCharacter(char.id);
      currentCharacterId = char.id;
      renderPets();
    });

    card.append(preview, info, selectBtn);
    petsList.appendChild(card);
  }
}

async function init() {
  const settings = await window.deskforgeDashboard.getSettings();

  currentCharacterId = settings.characterId;
  document.getElementById('userName').value = settings.userName || '';
  document.getElementById('petName').value = settings.petName || '';
  document.getElementById('opacity').value = settings.overlayOpacity ?? 1;

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

document.getElementById('opacity').addEventListener('input', (event) => {
  window.deskforgeDashboard.setOpacity(Number(event.target.value));
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
