import { Utils } from './utils.js';

export class InputManager {
  constructor(canvas, c = null) {
    this.c = c;
    this.keys = {};

    this.mouse = {
      x: 0,
      y: 0,
      left: false,
      right: false,
      middle: false,
      leftclick: false,
      rightclick: false,
      middleclick: false,
      wheelDelta: 0,
      historyLength: 2,
      canvasActive: false,
    };

    this.lastMove = performance.now();
    this.canvas = canvas;
    this.rect = this.canvas.getBoundingClientRect();

    this.initListeners();
  }

  /** Uruchamia nasłuchiwanie zdarzeń */
  initListeners() {
    // 🎹 Klawiatura
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    // 🖱️ Mysz
    this.mouse.prevX = 0;
    this.mouse.prevY = 0;
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    this.mouse.prevClick = { x: null, y: null };
    this.mouse.click = { x: null, y: null };
    this.mouse.clickHistory = [];

    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.canvasActive = true;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 🔹 oblicz różnicę względem poprzedniej klatki (dla panoramowania)
      if (this.mouse.middle) {
        this.mouse.deltaX = x - this.mouse.prevX;
        this.mouse.deltaY = y - this.mouse.prevY;
      } else {
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
      }

      // 🔹 zapisz nową pozycję
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.prevX = x;
      this.mouse.prevY = y;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.canvasActive = false;
    });

    // 🔸 kliknięcia i przyciski
    this.canvas.addEventListener('mousedown', (e) => {
      switch (e.button) {
        case 0: // 🖱️ lewy
          if (!this.mouse.left) this.mouse.leftclick = true; // 👈 tylko raz przy wciśnięciu
          this.mouse.left = true;

          // historia kliknięć (dla selekcji itp.)
          if (this.mouse.historyLength > 1) {
            this.mouse.clickHistory.push([this.mouse.x, this.mouse.y]);
            if (this.mouse.clickHistory.length > this.mouse.historyLength) this.mouse.clickHistory.shift();
          }
          break;

        case 1: // 🖱️ środkowy
          if (!this.mouse.middle) this.mouse.middleclick = true; // 👈 tylko raz przy kliknięciu
          this.mouse.middle = true;
          break;

        case 2: // 🖱️ prawy
          if (!this.mouse.right) this.mouse.rightclick = true; // 👈 tylko raz przy kliknięciu
          this.mouse.right = true;
          break;
      }
    });

    // this.canvas.addEventListener('mousedown', (e) => {
    //   if (e.button === 0) {
    //     this.mouse.left = true;
    //     this.mouse.leftclick = true; // 👈 klik jednorazowy

    //     // historia kliknięć (dla selekcji)
    //     if (this.mouse.historyLength > 1) {
    //       this.mouse.clickHistory.push([this.mouse.x, this.mouse.y]);
    //       if (this.mouse.clickHistory.length > this.mouse.historyLength) this.mouse.clickHistory.shift();
    //     }
    //   }
    //   if (e.button === 1) {
    //     this.mouse.middle = true;
    //     this.mouse.middleclick = true;
    //   }
    //   if (e.button === 2) {
    //     this.mouse.right = true;
    //     this.mouse.rightclick = true;
    //   }
    // });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.left = false;
      if (e.button === 1) this.mouse.middle = false;
      if (e.button === 2) this.mouse.right = false;
    });

    // 🔄 Scroll
    this.canvas.addEventListener('wheel', (e) => {
      this.mouse.wheelDelta = e.deltaY;
    });

    // ⚠️ Blokuj menu kontekstowe
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /** Czy dany klawisz jest wciśnięty */
  isKeyPressed(key) {
    return !!this.keys[key];
  }

  /** Reset stanu przewijania i jednorazowych kliknięć */
  update() {
    // 🔹 Scroll
    this.mouse.wheelDelta *= 0.9;
    if (Math.abs(this.mouse.wheelDelta) < 1) this.mouse.wheelDelta = 0;

    // 🔹 Reset jednorazowych kliknięć (muszą trwać tylko 1 klatkę)
    this.mouse.leftclick = false;
    this.mouse.rightclick = false;
    this.mouse.middleclick = false;
  }
}

/*import { Utils } from './utils.js';

export class InputManager {
  constructor(canvas, c = null) {
    this.c = c;
    this.keys = {};
    this.mouse = {
      x: 0,
      y: 0,
      left: false,
      right: false,
      middle: false,
      wheelDelta: 0,
      historyLength: 2,
      canvasActive: false,
    };
    this.lastMove = performance.now();
    // canvas potrzebny do przeliczenia pozycji myszy na współrzędne gry
    this.canvas = canvas;
    this.rect = this.canvas.getBoundingClientRect();
    this.initListeners();
  }


  initListeners() {
    // 🎹 Klawiatura
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
    // 🖱️ Mysz
    // w InputManager.initListeners()
    this.mouse.leftclick = false;
    this.mouse.rightclick = false;
    this.mouse.middleclick = false;

    // w mouseup
   
    this.mouse.prevX = 0;
    this.mouse.prevY = 0;
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    this.mouse.prevClick = { x: null, y: null };
    this.mouse.click = { x: null, y: null };
    this.mouse.clickHistory = [];
    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.canvasActive = true;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // 🔹 oblicz różnicę względem poprzedniej klatki
      if (this.mouse.middle) {
        this.mouse.deltaX = x - this.mouse.prevX;
        this.mouse.deltaY = y - this.mouse.prevY;
      } else {
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
      }
      // 🔹 zapisz nową pozycję
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.prevX = x;
      this.mouse.prevY = y;
      //Utils.cl(this.mouse.x + " " + this.mouse.y, true)
      // this.c.needsRedraw = true;
    });
    this.canvas.addEventListener('mouseleave', (e) => {
      this.mouse.canvasActive = false;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.left = true;
        if (this.mouse.historyLength > 1) {
          this.mouse.clickHistory.push([this.mouse.x, this.mouse.y]);
          if (this.mouse.clickHistory.length == this.mouse.historyLength + 1) {
            this.mouse.clickHistory.shift();
            //Utils.cl(this.mouse.clickHistory)
          }
        }
        // this.mouse.prevClick = this.mouse.click
          //       this.mouse.click = { x: this.mouse.x, y: this.mouse.y }
      }
      if (e.button === 1) this.mouse.middle = true;
      if (e.button === 2) this.mouse.right = true;
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouse.left = false;
      }
      if (e.button === 1) this.mouse.middle = false;
      if (e.button === 2) this.mouse.right = false;
    });
    // 🔄 Scroll
    this.canvas.addEventListener('wheel', (e) => {
      this.mouse.wheelDelta = e.deltaY;
    });
    // ⚠️ Blokuj menu kontekstowe (prawy przycisk)
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Czy dany klawisz jest wciśnięty 
  isKeyPressed(key) {
    return !!this.keys[key];
  }

 Reset przewijania po każdej klatce 
  update() {
    // this.mouse.wheelDelta = 0;
    this.mouse.wheelDelta *= 0.9;
    // jeśli jest bardzo małe – wyzeruj
    if (Math.abs(this.mouse.wheelDelta) < 1) this.mouse.wheelDelta = 0;
  }
}*/
