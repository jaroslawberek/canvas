import { Level } from '../Level.js';
import { Utils } from './utils.js';
export class LevelStorageManager {
  constructor(storageKey = 'jbGame.levels') {
    this.storageKey = storageKey;
  }

  getAll() {
    return JSON.parse(localStorage.getItem(this.storageKey)) || {};
  }

  listNames() {
    return Object.keys(this.getAll());
  }

  save(level) {
    if (!level || !level.name) throw new Error('Nie podano obiektu poziomu!');
    const all = this.getAll();
    all[level.name] = {
      ...level,
      modified: new Date().toISOString(),
      preview: level.preview || null,
    };
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  }

  load(name) {
    const all = this.getAll();
    if (!all[name]) return null;
    return new Level(all[name]);
  }

  delete(name) {
    const all = this.getAll();
    delete all[name];
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  }

  exportToFile() {
    const data = localStorage.getItem(this.storageKey);
    if (!data) {
      alert('Brak poziomów do eksportu!');
      return;
    }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jbGame_levels.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
