// czy w ktoryms elemencie jest "!"
//if (this.tablica_dwuwymiarowa.some((row) => row.some((cell) => cell === '1')));

class Tricks {
  static containsExclamationMark(array) {
    return array.some((row) => row.some((cell) => cell === '!'));
  }
}

class GameLevel {
  constructor(level = {}) {
    this.level = levelName ?? 'Unknown';
    this.tileSize = tileSize ?? 16;
    this.width = width ?? 10;
    this.height = height ?? 10;
    this.gridObjects = gridObjects ?? [];
    this.collisionMap = collisionMap ?? [];
    this.platforms = platforms ?? [];
    this.backgounds = backgounds ?? {};
    this.status = cos.ddd;
    this.wordWidth = null;
  }
}
