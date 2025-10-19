// classes/Camera.js — wersja "EditorOnly"
export class Camera {
  /**
   * Prosta kamera dla edytora kafelków:
   * - panning: x/y w współrzędnych świata
   * - zoom: scale (min/max)
   * - clamp: trzyma widok w granicach świata (uwzględnia skalę)
   * - apply(ctx): skaluje i przesuwa canvas
   *
   * Brak trybów follow/moveTo/shake/update — czysto pod edytor.
   */
  constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
    // Pozycja w świecie (lewy-górny róg viewportu)
    this.x = 0;
    this.y = 0;

    // Zoom
    this.scale = 1;
    this.minScale = 1;
    this.maxScale = 4;

    // Rozmiar viewportu (w pikselach ekranu/canvasu)
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    // Rozmiar świata (w pikselach świata)
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }

  /** Ustaw zoom w bezpiecznym zakresie */
  setScale(next) {
    this.scale = Math.min(this.maxScale, Math.max(this.minScale, next));
  }
  s;

  /**
   * Zoom "do kursora" — punkt pod kursorem pozostaje na miejscu.
   * @param {number} screenX - pozycja kursora (px na canvasie)
   * @param {number} screenY - pozycja kursora (px na canvasie)
   * @param {number} newScale - nowa wartość skali
   */
  zoomAt(screenX, screenY, newScale) {
    // punkt świata pod kursorem PRZED zmianą skali
    const worldBeforeX = this.x + screenX / this.scale;
    const worldBeforeY = this.y + screenY / this.scale;

    this.setScale(newScale);

    // ten sam punkt świata po zmianie skali
    const worldAfterX = this.x + screenX / this.scale;
    const worldAfterY = this.y + screenY / this.scale;

    // skompensuj różnicę tak, aby punkt pod kursorem się "nie ruszył"
    this.x += worldBeforeX - worldAfterX;
    this.y += worldBeforeY - worldAfterY;

    this.clamp();
  }

  /** Przesuń kamerę o wektor (dx, dy) w współrzędnych świata */
  panBy(dx, dy) {
    this.x += dx;
    this.y += dy;
    this.clamp();
  }

  /** Zastosuj transformacje kamery do kontekstu rysowania */
  apply(ctx) {
    // Uwaga: kolejność ma znaczenie — najpierw skala, potem przesunięcie
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.x, -this.y);
  }

  /** Aktualizacja rozmiaru viewportu (np. po resize okna) */
  resize(viewportWidth, viewportHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.clamp();
  }

  /**
   * Trzymaj widok w granicach świata (uwzględnia zoom).
   * x/y to lewy-górny róg viewportu w układzie świata.
   */
  clamp() {
    const maxX = Math.max(0, this.worldWidth - this.viewportWidth / this.scale);
    const maxY = Math.max(
      0,
      this.worldHeight - this.viewportHeight / this.scale
    );

    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x > maxX) this.x = maxX;
    if (this.y > maxY) this.y = maxY;
  }

  /** Pomocnicze: konwersje współrzędnych */
  screenToWorld(sx, sy) {
    return { x: this.x + sx / this.scale, y: this.y + sy / this.scale };
  }
  worldToScreen(wx, wy) {
    return { x: (wx - this.x) * this.scale, y: (wy - this.y) * this.scale };
  }
}

// export class Camera {
//   /**
//    * Kamera gry — śledzi obiekt (np. gracza), porusza się płynnie i ogranicza do świata gry.
//    */
//   constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
//     this.x = 0;
//     this.y = 0;
//     this.scale = 1; // 🔹 nowy parametr zoomu
//     this.viewportWidth = viewportWidth;
//     this.viewportHeight = viewportHeight;
//     this.worldWidth = worldWidth;
//     this.worldHeight = worldHeight;

//     this.margin = 300; // jak daleko gracz może się oddalić od środka, zanim kamera ruszy
//     this.center = { x: viewportWidth / 2, y: viewportHeight / 2 };

//     this.target = null; // śledzony obiekt (np. gracz)
//     this.mode = "follow"; // tryb pracy kamery: follow, moveTo, shake

//     // Efekty
//     this.shakeTime = 0;
//     this.shakePower = 0;
//     this.shakeOffset = { x: 0, y: 0 };

//     // Cinematic movement
//     this.moveToTarget = null;
//     this.moveSpeed = 0;
//   }

//   /** Ustaw, który obiekt kamera ma śledzić (np. gracza) */
//   follow(target) {
//     this.target = target;
//     this.mode = "follow";
//   }

//   setScale(factor) {
//     this.scale = Math.min(Math.max(factor, 1), 3); // zakres 0.5–3x
//   }

//   /** Natychmiast ustaw kamerę na celu (np. po respawnie) */
//   snapToTarget(mode = "platformer") {
//     if (!this.target) return;
//     if (mode === "platformer") {
//       this.x = this.target.center.x - this.viewportWidth / 2;
//       this.y = this.target.center.y - this.viewportHeight / 2;
//     } else {
//       this.x = this.target.center.x - this.viewportWidth / 2;
//       this.y = this.target.center.y - this.viewportHeight / 2;
//     }
//     this.clamp();
//   }

//   /** Uruchamia płynny ruch kamery w stronę punktu (x, y) */
//   moveTo(x, y, speed = 5) {
//     this.moveToTarget = { x, y };
//     this.moveSpeed = speed;
//     this.mode = "moveTo";
//   }

//   /** Efekt drgania kamery — np. przy kolizji lub eksplozji */
//   shake(duration = 400, power = 10) {
//     this.shakeTime = duration;
//     this.shakePower = power;
//   }

//   /**
//    * Efekt drgania kamery z płynnym wygaszaniem (fade-out)
//    * @param {number} duration - czas w ms
//    * @param {number} power - maksymalna siła drgań
//    */
//   shakeSmooth(duration = 600, power = 10) {
//     this.shakeTime = duration;
//     this.shakePower = power;
//     this.shakeFade = true; // 🔹 flaga aktywująca fade-out
//   }

//   /**
//    * Aktualizacja położenia kamery (każda klatka)
//    * @param {number} dt - deltaTime (sekundy)
//    * @param {string} mode - tryb gry: "platformer" | "topdown"
//    */
//   update(dt, mode = "platformer") {
//     // 🔹 0️⃣ Zabezpieczenie — brak celu

//     // 🔹 1️⃣ Ustal pozycję środka celu (działa i dla gracza, i dla edytora)
//     const targetCenterX = this.target.center
//       ? this.target.center.x
//       : this.target.x + (this.target.width || 0) / 2;
//     const targetCenterY = this.target.center
//       ? this.target.center.y
//       : this.target.y + (this.target.height || 0) / 2;

//     // 🔹 2️⃣ Tryb śledzenia celu
//     if (this.mode === "follow") {
//       if (mode === "platformer") {
//         this.x += (this.target.x - this.x - this.margin) * 0.1;
//         this.y += (targetCenterY - this.y - this.viewportHeight / 2) * 0.1;
//       } else {
//         this.x += (targetCenterX - this.x - this.viewportWidth / 2) * 0.1;
//         this.y += (targetCenterY - this.y - this.viewportHeight / 2) * 0.1;
//       }
//     }
//     if (this.mode === "manual") {
//       this.clamp();
//       return;
//     }
//     if (!this.target) return;

//     // 🔹 3️⃣ Tryb cinematic (moveTo)
//     if (this.mode === "moveTo" && this.moveToTarget) {
//       this.x += (this.moveToTarget.x - this.x) / this.moveSpeed;
//       this.y += (this.moveToTarget.y - this.y) / this.moveSpeed;

//       if (
//         Math.abs(this.moveToTarget.x - this.x) < 2 &&
//         Math.abs(this.moveToTarget.y - this.y) < 2
//       ) {
//         this.mode = "follow";
//         this.moveToTarget = null;
//       }
//     }

//     // 🔹 4️⃣ Ograniczenie do świata
//     this.clamp();

//     // 🔹 5️⃣ Efekt drgań
//     if (this.shakeTime > 0) {
//       this.shakeTime -= dt * 1000;
//       let currentPower = this.shakePower;

//       if (this.shakeFade) {
//         const fadeRatio = Math.max(0, this.shakeTime / 600);
//         currentPower *= fadeRatio;
//         if (this.shakeTime <= 0) this.shakeFade = false;
//       }

//       this.shakeOffset.x = (Math.random() - 0.5) * currentPower;
//       this.shakeOffset.y = (Math.random() - 0.5) * currentPower;
//     } else {
//       this.shakeOffset.x = 0;
//       this.shakeOffset.y = 0;
//     }
//   }

// update(dt, mode = "platformer") {
//     if (!this.target) return; // <— DODAJ TO!
//     // 1️⃣ Tryb śledzenia gracza (płynne LERP)
//     if (this.mode === "follow" && this.target) {
//         if (mode === "platformer") {
//             this.x += (this.target.x - this.x - this.margin) * 0.1;
//             this.y += (this.target.center.y - this.y - this.viewportHeight / 2) * 0.1;
//         } else {
//             this.x += (this.target.center.x - this.x - this.viewportWidth / 2) * 0.1;
//             this.y += (this.target.center.y - this.y - this.viewportHeight / 2) * 0.1;
//         }
//     }

//     // 2️⃣ Tryb cinematic — automatyczny ruch kamery
//     if (this.mode === "moveTo" && this.moveToTarget) {
//         this.x += (this.moveToTarget.x - this.x) / this.moveSpeed;
//         this.y += (this.moveToTarget.y - this.y) / this.moveSpeed;

//         if (Math.abs(this.moveToTarget.x - this.x) < 2 && Math.abs(this.moveToTarget.y - this.y) < 2) {
//             this.mode = "follow";
//             this.moveToTarget = null;
//         }
//     }

//     // 3️⃣ Ogranicz kamerę do granic świata
//     this.clamp();

//     // 4️⃣ Efekt drgania
//     if (this.shakeTime > 0) {
//         this.shakeTime -= dt * 1000;

//         let currentPower = this.shakePower;

//         // 🔹 Jeśli fade aktywny – siła maleje proporcjonalnie do czasu
//         if (this.shakeFade) {
//             const fadeRatio = Math.max(0, this.shakeTime / 600); // im bliżej końca, tym mniejsze drgania
//             currentPower *= fadeRatio;
//             if (this.shakeTime <= 0) this.shakeFade = false;
//         }

//         this.shakeOffset.x = (Math.random() - 0.5) * currentPower;
//         this.shakeOffset.y = (Math.random() - 0.5) * currentPower;
//     } else {
//         this.shakeOffset.x = 0;
//         this.shakeOffset.y = 0;
//     }

// }
/** Zastosuj transformację kamery do kontekstu rysowania */
// apply(ctx) {
//   ctx.scale(this.scale, this.scale);
//   ctx.translate(-this.x + this.shakeOffset.x, -this.y + this.shakeOffset.y);
// }

/** Zabezpieczenie przed wyjechaniem kamery poza świat gry */
//   clamp() {
//     if (this.x < 0) this.x = 0;
//     if (this.y < 0) this.y = 0;
//     if (this.x > this.worldWidth - this.viewportWidth)
//       this.x = this.worldWidth - this.viewportWidth;
//     if (this.y > this.worldHeight - this.viewportHeight)
//       this.y = this.worldHeight - this.viewportHeight;
//   }
// }
