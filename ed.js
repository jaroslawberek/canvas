import { Grid } from "./grid.js";
class Edytor {
  constructor(width = 2000, height = 2000) {
    this.wordWidth = width;
    this.wordHeight = height;
    this.canvas = document.querySelector("#canvas");
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
    this.context2d = this.canvas.getContext("2d");
    this.grid = null;
    this.objects = [];
    this.angle = 0;

    // 👇 ważne — związanie kontekstu
    this.appLoop = this.appLoop.bind(this);
    this.context = {
      canvas: this.canvas,
      ctx: this.context2d,
      wordWidth: this.wordWidth,
      wordHeight: this.wordHeight,
    };
    this.init();
  }

  init() {
    this.grid = new Grid();
    this.objects.push(this.grid);
    window.requestAnimationFrame(this.appLoop);
  }

  appUpdate() {
    // tu można dodać logikę aktualizacji
  }

  appDraw() {
    const ctx = this.context2d;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.objects.forEach((obj) => {
      obj.draw(this.context);
    });
  }

  appLoop() {
    this.appUpdate();
    this.appDraw();
    window.requestAnimationFrame(this.appLoop);
  }

  test(ctx) {
    // 🔹 Linia 1
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.moveTo(1, 1);
    ctx.lineTo(250, 100);
    ctx.stroke();

    // 🔹 Linia 2
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.setLineDash([15, 10]);
    ctx.moveTo(50, 150);
    ctx.lineTo(250, 200);
    ctx.stroke();
    ctx.setLineDash([]); // reset kreskowania

    // 🔹 Linia 3 — animowana
    // 🔹 Linia 3 — animowana zielona (powinna się obracać)
    const cx = 400;
    const cy = 300;
    const radius = 100;

    // punkt końcowy obraca się wokół (cx, cy)
    const x2 = cx + Math.cos(this.angle) * radius;
    const y2 = cy + Math.sin(this.angle) * radius;

    ctx.beginPath();
    ctx.strokeStyle = "green";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";

    ctx.moveTo(cx, cy);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 🔄 zwiększamy kąt (animacja)
    this.angle += 0.05;
  }
}

const e = new Edytor();
