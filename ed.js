import { Grid } from "./grid.js";
import { Camera } from "./classes/Camera.js";
import { InputManager } from "./classes/InputManager.js";
import { Physics } from "./classes/Physics.js";
import { Utils } from "./classes/utils.js";
class Edytor {
  constructor(tittleSize = 16, width = 400, height = 400) {
    this.wordWidth = 2000;
    this.wordHeight = 2000;
    this.canvas = document.querySelector("#canvas");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context2d = this.canvas.getContext("2d");
    this.bgColor = "#e7e5e5ff"; // domyślny kolor tła
    this.tittleSize = tittleSize;
    this.needsRedraw = true;
    this.grid = null;
    this.objects = [];
    this.angle = 0;
    this.accumulator = 0;
    this.lastTime = 0;
    this.input = new InputManager(this.canvas, this);
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
    this.grid = new Grid(this.tittleSize, this.width, this.height);
    this.objects.push(this.grid);
    window.requestAnimationFrame(this.appLoop);
  }
  clear(ctx) {
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  appUpdate(dt) {
    const mouse = this.input.mouse;
    const keys = this.input.keys;
    //this.test_keys(keys);
    // this.test_mouse(mouse, keys);
    //this.calculateTittlePos(mouse, keys)
  }

  appDraw(dt) {
    const ctx = this.context2d;
    const mouse = this.input.mouse;
    const keys = this.input.keys;
    this.clear(ctx);
    this.objects.forEach((obj) => {
      obj.draw(this.context);
    });

    this.drawSelectTitel(mouse, ctx);
  }

  drawSelectTitel(mouse, ctx) {
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;
    const titleX = Math.floor(mouse.x / this.tittleSize);
    const titley = Math.floor(mouse.y / this.tittleSize);
    const x = titleX == 0 ? 0 : titleX * this.tittleSize;
    const y = titley == 0 ? 0 : titley * this.tittleSize;
    ctx.strokeRect(x, y, this.tittleSize, this.tittleSize);
  }


  appLoop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.accumulator += delta;
    if (this.accumulator >= 16) {
      this.appUpdate(delta);
      // if (this.needsRedraw) {
      this.appDraw(delta);
      this.needsRedraw = false;
      //}
    }
    window.requestAnimationFrame(this.appLoop);
  }
  // this.test(ctx);
  //this.drawRects(ctx);
  //this.drawAll(ctx);
  //this.drawTextExamples(ctx)
  //this.textOnBackground(ctx);

  /********************************************FUNKCJE DO TESTOW*****************************************************************/
  /**********************************************************************************************/
  /*************************************************************************************************************/
  /*************************************************************************************************************/
  /*************************************************************************************************************/
  /*************************************************************************************************************/
  /*************************************************************************************************************/
  textOnBackground(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // półprzezroczyste tło
    ctx.fillRect(10, 10, 200, 40);

    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Punkty: 1250", 20, 38);
  }

  test(ctx) {
    // 🔹 Linia 1
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.shadowColor = "rgba(0,0,0,1)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.moveTo(100, 100);
    ctx.lineTo(250, 100);
    ctx.stroke();
    ctx.shadowColor = "transparent";


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
  drawTextExamples(ctx) {

    // 🔹 1. Tekst podstawowy (fill)
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "darkblue";
    ctx.fillText("Canvas: tekst wypełniony", 50, 60);

    // 🔹 2. Tekst z obrysem
    ctx.font = "bold 32px Verdana";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeText("Tekst z obrysem", 50, 120);

    // 🔹 3. Tekst wyśrodkowany poziomo
    ctx.font = "italic 28px Georgia";
    ctx.fillStyle = "green";
    ctx.textAlign = "center";
    ctx.fillText("Wyśrodkowany tekst", this.canvas.width / 2, 200);

    // 🔹 4. Tekst wyśrodkowany pionowo
    ctx.font = "24px Courier New";
    ctx.fillStyle = "purple";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("Baseline = middle", 50, this.canvas.height / 2);

    // 🔹 5. Pomiar tekstu
    ctx.font = "bold 20px monospace";
    const sample = "Pomiar szerokości tekstu";
    const metrics = ctx.measureText(sample);
    ctx.fillStyle = "black";
    ctx.fillText(sample, 50, 330);
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 330 - 20, metrics.width, 24);

    // 🔹 6. Tekst z gradientem
    const gradient = ctx.createLinearGradient(50, 380, 450, 380);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.5, "orange");
    gradient.addColorStop(1, "gold");
    ctx.font = "bold 36px Verdana";
    ctx.fillStyle = gradient;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Tekst z gradientem 🎨", 50, 380);

    // 🔹 7. Tekst z cieniem
    ctx.save();
    ctx.font = "bold 40px Georgia";
    ctx.fillStyle = "#0066cc";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillText("Tekst z cieniem 💡", 50, 440);
    ctx.restore();

    // 🔹 8. Tekst po łuku
    this.drawTextOnArc(
      "Canvas tekst po okręgu 🌀",
      this.canvas.width / 2,
      520,
      180,
      Math.PI * 1.2,
      Math.PI * 1.8,
      "24px Arial",
      "#009900"
    );
  }

  /**
   * Rysuje tekst po łuku między kątami startAngle i endAngle
   */
  drawTextOnArc(text, centerX, centerY, radius, startAngle, endAngle, font, color) {
    const ctx = this.context2d;
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textLength = text.length;
    const totalAngle = endAngle - startAngle;
    const anglePerChar = totalAngle / textLength;

    for (let i = 0; i < textLength; i++) {
      const char = text[i];
      const angle = startAngle + i * anglePerChar;

      ctx.save();
      ctx.translate(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
      ctx.rotate(angle + Math.PI / 2); // ustawienie litery prostopadle do promienia
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }
  drawRects(ctx) {

    // 🔹 1. Prostokąt z samym wypełnieniem
    ctx.fillStyle = "orange";
    ctx.fillRect(50, 50, 150, 100);

    // 🔹 2. Prostokąt tylko z obrysem
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 64, 64);

    // 🔹 3. Prostokąt z obrysem i wypełnieniem
    ctx.fillStyle = "limegreen";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.fillRect(450, 50, 150, 100);
    ctx.strokeRect(450, 50, 150, 100);

    // 🔹 4. Kwadrat z półprzezroczystym wypełnieniem i grubym obrysem
    ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
    ctx.strokeStyle = "darkred";
    ctx.lineWidth = 8;
    ctx.fillRect(650, 50, 100, 100);
    ctx.strokeRect(650, 50, 100, 100);

    // 🔹 5. Prostokąt tworzony manualnie przez ścieżkę
    ctx.beginPath();
    ctx.rect(100, 200, 200, 120); // dodajemy prostokąt do path
    ctx.fillStyle = "#00bcd4";
    ctx.fill(); // wypełnienie
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#004d40";
    ctx.stroke(); // obrys
  }
  drawAll(ctx) {

    // 🔹 1. Zwykły prostokąt
    ctx.fillStyle = "orange";
    ctx.fillRect(140, 140, 150, 100);

    ctx.strokeStyle = "brown";
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 150, 100);

    // 🔹 2. Zaokrąglony prostokąt (manualny)
    this.drawRoundedRect(250, 40, 200, 100, 20, "#007bff", "#004080");

    // 🔹 3. Zaokrąglony prostokąt z cieniowaniem i półprzezroczystością
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 10;
    this.drawRoundedRect(500, 40, 200, 100, 30, "#4caf50", "#1b5e20");
    ctx.restore();

    // 🔹 4. Prostokąt z powtarzanym wzorem
    /* const pattern = ctx.createPattern(this.patternImage, "repeat");
     ctx.fillStyle = pattern;
     ctx.strokeStyle = "#333";
     ctx.lineWidth = 3;
 
     ctx.beginPath();
     this.roundRectPath(ctx, 150, 200, 400, 200, 25);
     ctx.fill();
     ctx.stroke();
 
     // podpisy
     ctx.font = "16px sans-serif";
     ctx.fillStyle = "#333";
     ctx.fillText("1️⃣ Zwykły prostokąt", 40, 165);
     ctx.fillText("2️⃣ Zaokrąglony prostokąt", 250, 165);
     ctx.fillText("3️⃣ Zaokrąglony z cieniem", 500, 165);
     ctx.fillText("4️⃣ Wzór (createPattern)", 150, 425);*/
  }

  // 🟢 Szybka metoda do rysowania zaokrąglonego prostokąta (v1)
  drawRoundedRect(x, y, width, height, radius, fillColor = null, strokeColor = null) {
    const ctx = this.context2d;
    ctx.beginPath();
    this.roundRectPath(ctx, x, y, width, height, radius);

    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
  }

  // 🔵 Pomocnicza funkcja: tworzy ścieżkę prostokąta z zaokrąglonymi rogami
  roundRectPath(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  test_keys(keys) {
    if (keys["a"] && keys["Alt"])
      Utils.cl("wcisnieto a + alt");
    else if (keys["d"] && keys["AltGraph"])
      Utils.cl("wcisnieto d + alt prawy");
    else if (keys["a"] && keys["Control"])
      Utils.cl("wcisnieto a + control");
    else if (keys["A"] && keys["Shift"]) // lub samo keys["A"]
      Utils.cl("wcisnieto a + shift");
  }
  calculateTittlePos(mouse, keys) {
    Utils.cl(`pozycja x: ${mouse.x}  y: ${mouse.y}`, true);
    Utils.cl(`pozycja kafla [${Math.floor(mouse.x / this.tittleSize)}, ${Math.floor(mouse.y / this.tittleSize)}]`);
  }
  test_mouse(mouse, keys) {

    if ((mouse.left || mouse.middle || mouse.right) && (keys['Shift'])) {
      let t = "Wcisnieto ";
      if (mouse.left) t += " lewy - "
      else if (mouse.right) t += " prawy - "
      else t += " srodkowy - "
      Utils.cl(t, true)
      Utils.cl(`pozycja x: ${mouse.x}  y: ${mouse.y}`);
      Utils.cl(`poprzednio ${mouse.clickHistory[0]}`)
      Utils.cl(`history click ${mouse.clickHistory}`)

      /*
       */
    }

  }
}

const e = new Edytor(16);





/**********************************************
 *****************************************************/
//reakca na klawisze. Uwaga na wielkosc liter i polskie znaki

