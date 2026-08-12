const fs = require('node:fs');
const path = require('node:path');

const CHARACTERS_DIR = path.join(__dirname, '..', '..', 'characters');

function listCharacters() {
  return fs.readdirSync(CHARACTERS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const jsonPath = path.join(CHARACTERS_DIR, entry.name, 'character.json');
      try {
        const { name } = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        return { id: entry.name, name: name || entry.name };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

module.exports = { listCharacters };
