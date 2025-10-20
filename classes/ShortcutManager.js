export class ShortcutManager {
  constructor(input) {
    this.input = input; // referencja do InputManager
    this.shortcuts = {}; // np. "control+z": { name, callback, cooldown, lastTime }
  }

  /**
   * Rejestruje nowy skrót klawiszowy.
   * @param {string} combo - np. "Control+z"
   * @param {Function} callback - funkcja do wywołania
   * @param {number} cooldown - minimalny odstęp między wywołaniami (ms)
   * @param {string} name - czytelna nazwa akcji (np. "Undo")
   */
  register(combo, callback, cooldown = 200, name = "") {
    this.shortcuts[combo.toLowerCase()] = {
      name: name || combo, // jeśli brak nazwy, użyj kombinacji
      callback,
      cooldown,
      lastTime: 0,
    };
  }

  /** Sprawdza i odpala skróty, jeśli spełnione */
  update() {
    const keys = this.input.keys;
    const now = performance.now();

    for (const combo in this.shortcuts) {
      const shortcut = this.shortcuts[combo];
      const parts = combo.split("+"); // np. ["Control", "z"]

      // 🔹 Sprawdź, czy wszystkie klawisze są wciśnięte
      const allPressed = parts.every((key) => keys[key]);

      // 🔹 Jeśli tak i minął cooldown — wywołaj
      if (allPressed && now - shortcut.lastTime > shortcut.cooldown) {
        shortcut.callback();
        shortcut.lastTime = now;
        console.log(
          `%c⚡ Shortcut: ${shortcut.name} (${combo})`,
          "color: lime; font-weight: bold;"
        );
      }
    }
  }
}
