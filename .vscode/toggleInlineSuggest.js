const fs = require('fs');
const path = require('path');

const settingsPath = path.join(process.env.APPDATA, 'Code', 'User', 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const key = 'editor.inlineSuggest.enabled';

settings[key] = !settings[key];
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

console.log(`[TOGGLE] ${key} → ${settings[key]}`);
