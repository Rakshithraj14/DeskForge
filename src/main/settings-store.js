const fs = require('node:fs');
const path = require('node:path');
const { app, safeStorage } = require('electron');

const KEY_FIELDS = ['claudeApiKey', 'codexApiKey'];

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function defaultSettings() {
  return {
    userName: '',
    petName: 'Mochi',
    provider: 'ollama',
    ollamaModel: 'llama3.2',
    ollamaBaseUrl: 'http://localhost:11434',
    claudeModel: 'claude-sonnet-4-5',
    codexModel: 'gpt-4o-mini',
    overlayOpacity: 1,
  };
}

function encryptValue(value) {
  if (safeStorage.isEncryptionAvailable()) {
    return { enc: true, data: safeStorage.encryptString(value).toString('base64') };
  }
  console.warn('safeStorage encryption unavailable - storing API key as plaintext');
  return { enc: false, data: value };
}

function decryptValue(field) {
  if (!field) return '';
  if (!field.enc) return field.data;
  try {
    return safeStorage.decryptString(Buffer.from(field.data, 'base64'));
  } catch {
    return '';
  }
}

function readRaw() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
  } catch {
    return {};
  }
}

function writeRaw(raw) {
  fs.writeFileSync(settingsPath(), JSON.stringify(raw));
}

// Full settings with real decrypted API keys - main process use only (AI calls).
function loadSettings() {
  const raw = readRaw();
  const settings = { ...defaultSettings(), ...raw };
  for (const field of KEY_FIELDS) {
    settings[field] = decryptValue(raw[field]);
  }
  return settings;
}

// Same settings but with key fields replaced by a presence flag - safe to
// send to the renderer, since the real secret should never round-trip there.
function getSettingsForRenderer() {
  const settings = loadSettings();
  const safe = { ...settings };
  for (const field of KEY_FIELDS) {
    safe[`has_${field}`] = Boolean(settings[field]);
    delete safe[field];
  }
  return safe;
}

// partial: plain fields overwrite directly. For key fields, an empty/missing
// value means "leave the stored key untouched" (blank = unchanged in the UI).
function saveSettings(partial) {
  const raw = readRaw();
  const merged = { ...raw, ...partial };
  for (const field of KEY_FIELDS) {
    if (!partial[field]) {
      merged[field] = raw[field];
    } else {
      merged[field] = encryptValue(partial[field]);
    }
  }
  writeRaw(merged);
}

module.exports = { loadSettings, getSettingsForRenderer, saveSettings };
