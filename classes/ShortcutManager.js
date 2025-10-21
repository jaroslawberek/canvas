export class ShortcutManager {
  constructor(input) {
    this.input = input; // referencja do InputManager
    this.shortcuts = {}; // np. "control+z": { name, callback, cooldown, lastTime }
  }

  /**
   * Rejestruje nowy skrót (klawiatura, mysz lub kombinacja)
   * @param {string} combo - np. "Control+z", "LeftClick", "Ctrl+LeftClick", "WheelUp"
   * @param {Function} callback - funkcja do wywołania
   * @param {number} cooldown - minimalny odstęp między wywołaniami (ms)
   * @param {string} name - czytelna nazwa akcji (np. "Undo")
   */
  register(combo, callback, cooldown = 200, name = '') {
    this.shortcuts[combo.toLowerCase()] = {
      name: name || combo,
      callback,
      cooldown,
      lastTime: 0,
    };
  }

  /** Główna pętla sprawdzająca skróty */
  update() {
    const keys = Object.keys(this.input.keys).reduce((acc, k) => {
      acc[k.toLowerCase()] = this.input.keys[k];
      return acc;
    }, {});
    const mouse = this.input.mouse;
    const now = performance.now();

    const parseCombo = (combo) => {
      const c = combo.trim().toLowerCase();
      if (c === '+') return ['+']; // specjalny przypadek dla "+"
      return c.split(/\s*\+\s*/);
    };

    let mouseClickHandled = false; // 👈 kontroluje priorytet kliknięć

    for (const combo in this.shortcuts) {
      const shortcut = this.shortcuts[combo];
      const parts = parseCombo(combo);

      const allPressed = parts.every((part) => {
        // 🔹 Klawiatura
        if (keys[part]) return true;

        // 🔹 Mysz
        switch (part) {
          case 'leftclick':
            return mouse.leftclick;
          case 'rightclick':
            return mouse.rightclick;
          case 'middleclick':
            return mouse.middleclick;

          case 'left':
            // 👇 jeśli już był obsłużony „click”, nie reaguj na „left”
            return !mouseClickHandled && mouse.left;
          case 'right':
            return !mouseClickHandled && mouse.right;
          case 'middle':
            return !mouseClickHandled && mouse.middle;

          case 'wheelup':
            return mouse.wheelDelta < 0;
          case 'wheeldown':
            return mouse.wheelDelta > 0;
          default:
            return false;
        }
      });

      // 🟢 Aktywacja skrótu, jeśli warunki spełnione i minął cooldown
      if (allPressed && now - shortcut.lastTime > shortcut.cooldown) {
        shortcut.callback();
        shortcut.lastTime = now;

        console.log(`%c⚡ Shortcut: ${shortcut.name} (${combo})`, 'color: lime; font-weight: bold;');

        // 🔸 Jeśli to był klik (a nie trzymanie) — blokuj inne kombinacje z tym samym przyciskiem
        if (combo.includes('click')) mouseClickHandled = true;
      }
    }
  }

  // update() {
  //   const keys = Object.keys(this.input.keys).reduce((acc, k) => {
  //     acc[k.toLowerCase()] = this.input.keys[k];
  //     return acc;
  //   }, {});
  //   const mouse = this.input.mouse;
  //   const now = performance.now();

  //   // 🔹 Pomocnicza funkcja — dzieli combo np. "Ctrl+Z" → ["ctrl","z"]
  //   const parseCombo = (combo) => {
  //     const c = combo.trim().toLowerCase();
  //     if (c === '+') return ['+']; // specjalny przypadek dla "+"
  //     return c.split(/\s*\+\s*/);
  //   };

  //   for (const combo in this.shortcuts) {
  //     const shortcut = this.shortcuts[combo];
  //     const parts = parseCombo(combo);

  //     // 🧩 Sprawdź, czy wszystkie elementy kombinacji są aktywne
  //     const allPressed = parts.every((part) => {
  //       // 🔸 Klawiatura
  //       if (keys[part]) return true;

  //       // 🔸 Mysz
  //       switch (part) {
  //         case 'leftclick':
  //           return mouse.leftclick;
  //         case 'rightclick':
  //           return mouse.rightclick;
  //         case 'middleclick':
  //           return mouse.middleclick;
  //         case 'left':
  //           return mouse.left;
  //         case 'right':
  //           return mouse.right;
  //         case 'middle':
  //           return mouse.middle;
  //         case 'wheelup':
  //           return mouse.wheelDelta < 0;
  //         case 'wheeldown':
  //           return mouse.wheelDelta > 0;
  //         default:
  //           return false;
  //       }
  //     });

  //     // 🟢 Jeśli wszystkie klawisze spełnione + cooldown minął → aktywuj
  //     if (allPressed && now - shortcut.lastTime > shortcut.cooldown) {
  //       shortcut.callback();
  //       shortcut.lastTime = now;
  //       console.log(`%c⚡ Shortcut: ${shortcut.name} (${combo})`, 'color: lime; font-weight: bold;');
  //     }
  //   }
  // }
}

/*export class ShortcutManager {
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
// register(combo, callback, cooldown = 200, name = '') {
//   this.shortcuts[combo.toLowerCase()] = {
//     name: name || combo, // jeśli brak nazwy, użyj kombinacji
//     callback,
//     cooldown,
//     lastTime: 0,
//   };
// }

// Sprawdza i odpala skróty, jeśli spełnione
// update() {
//   // 1) normalizacja mapy wciśnięć
//   const keys = Object.keys(this.input.keys).reduce((acc, k) => {
//     acc[k.toLowerCase()] = this.input.keys[k];
//     return acc;
//   }, {});
//   const now = performance.now();

// 2) parser combo (obsługa jedynego klawisza "+")
//     const parseCombo = (combo) => {
//       const c = combo.trim().toLowerCase();
//       if (c === '+') return ['+']; // 👈 ważne!
//       return c.split(/\s*\+\s*/); // separatorem jest „+” (z odstępami opcjonalnie)
//     };

//     for (const combo in this.shortcuts) {
//       const shortcut = this.shortcuts[combo];
//       const parts = parseCombo(combo); // np. ["control","z"] albo ["+"]
//       const allPressed = parts.every((k) => keys[k]); //every - musza wszytskie warunki sie spełnic

//       if (allPressed && now - shortcut.lastTime > shortcut.cooldown) {
//         shortcut.callback();
//         shortcut.lastTime = now;
//         console.log(`%c⚡ Shortcut: ${shortcut.name} (${combo})`, 'color: lime; font-weight: bold;');
//       }
//     }
//   }
// }
