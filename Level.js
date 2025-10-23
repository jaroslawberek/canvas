export class Level {
  constructor(data = {}) {
    this.name = data.name || '';
    this.width = data.width || 0;
    this.height = data.height || 0;
    this.tileSize = data.tileSize || 16;
    this.tiles = data.tiles || [];
    this.collisions = data.collisions || [];
    this.resources = data.resources || {};
    this.preview = data.preview || null;
  }

  /** Utwórz nowy poziom */
  create(name, width = 50, height = 50, tileSize, tileObject) {
    this.name = name.trim();
    if (!this.name) throw new Error('Nie podano nazwy poziomu!');
    this.width = width;
    this.height = height;
    this.tiles = tileObject;
    this.tileSize = tileSize;
  }
}
