import { Grid } from './grid.js';
import { Camera } from './classes/Camera.js';
import { InputManager } from './classes/InputManager.js';
import { Physics } from './classes/Physics.js';
import { Utils } from './classes/utils.js';
import { TileObject } from './TitleObj.js';
import { eventBus } from './classes/EventBus.js';
import { Queue } from './classes/queue.js';
import { ShortcutManager } from './classes/ShortcutManager.js';
import { LevelStorageManager } from './classes/LevelStorageManager.js';
import { Level } from './Level.js';

class Edytor {
  constructor(tittleSize = 16, width = 1500, height = 100) {
    this.wordWidth = width * tittleSize;
    this.wordHeight = height * tittleSize;
    this.width = width;
    this.height = height;
    this.canvas = document.querySelector('#canvas');
    this.resizeCanvas();
    this.context2d = this.canvas.getContext('2d');
    this.bgColor = '#e7e5e5ff'; // domyślny kolor tła
    this.tittleSize = tittleSize;
    this.needsRedraw = true;
    this.tileObject = null;
    this.objBuffer = null;
    this.grid = null;
    this.ctrlZPressed = false;
    this.objects = [];
    this.historyObjects = [];
    this.selectedGrid = null;
    this.objGrid = null;
    this.angle = 0;
    this.accumulator = 0;
    this.lastTime = 0;
    this.selectTitleColor = 'blue';
    this.selectTitleWidth = 1;
    this.selectedPos = [null, null];
    this.selectPurpose = 'none';
    this.lockedAxle = 'none';
    this.lockedTileY = null;
    this.lockedTileX = null;
    this.canvasActive === false;
    this.input = new InputManager(this.canvas, this);
    this.shortcuts = new ShortcutManager(this.input);
    // 👇 ważne — związanie kontekstu
    this.appLoop = this.appLoop.bind(this);
    this.camera = new Camera(this.width, this.height, this.wordWidth, this.wordHeight);
    this.storage = new LevelStorageManager();
    this.currentLevel = null;
    this.levelListEl = document.getElementById('levelListEl');
    const myModal = null;
    this.context = {
      canvas: this.canvas,
      ctx: this.context2d,
      wordWidth: this.wordWidth,
      wordHeight: this.wordHeight,
      width: this.width,
      height: this.height,
      tittleSize: this.tittleSize,
      objGrid: this.objGrid,
      objects: this.objects,
      camera: this.camera,
    };
    this.init();
  }
  resizeCanvas() {
    const rect1 = this.canvas.getBoundingClientRect();
    this.canvas.width = rect1.width;
    this.canvas.height = rect1.height;
    //this.camera.resize(this.width, this.height);
  }

  init() {
    /* this.cameraTarget = {
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    };*/
    this.objGrid = Array.from({ length: this.height }, () => Array(this.width).fill(null));
    this.selectedGrid = Array.from({ length: this.height }, () => Array(this.width).fill(null));
    this.objBuffer = Array.from({ length: this.height }, () => Array(this.width).fill(null));
    this.grid = new Grid(this.tittleSize, this.width, this.height);
    this.tileObject = new TileObject(this.tittleSize, this.height, this.width);
    const btAddlevel = document.querySelector('.addLevelBtn');
    btAddlevel.addEventListener('click', () => {
      const nameInput = document.getElementById('levelName');
      const widthInput = document.getElementById('levelWidth');
      const heightInput = document.getElementById('levelHeight');
      const tileSizeInput = document.getElementById('tileSize');
      this.newLevel(
        nameInput.value,
        parseInt(widthInput.value),
        parseInt(heightInput.value),
        parseInt(tileSizeInput.value)
      );
    });
    this.registerShortcuts();

    // Evet init
    eventBus.on('editor:canvasActive', this.tileObject.onEditorCanvasActive.bind(this.tileObject));
    eventBus.on('tileObject:canvasActive', this.onTileObjectCanvasActive.bind(this));
    eventBus.on('tileObject:tilesSelected', this.onTileObjectSelectedTiles.bind(this));
    this.renderLevelList();
    this.myModal = new bootstrap.Modal(document.getElementById('modalId'));
    this.myModal.show();
    window.requestAnimationFrame(this.appLoop);
  }

  clear(ctx) {
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  registerShortcuts() {
    const mouse = this.input.mouse;
    const keys = this.input.keys;
    const cam = this.camera;
    this.shortcuts.register('Control+z', () => this.rollbackTiles(), 200, 'Undo (Cofnij)');
    this.shortcuts.register('Control+s', () => this.saveCurrent(), 0, 'Save current level (Zapisz aktualny poziom)');
    this.shortcuts.register('Escape', () => this.cancelSelection(), 100, 'Cancel selection (Anuluj zaznaczenie)');
    // Zoom in
    this.shortcuts.register(
      '=',
      () => this.camera.zoomAt(this.input.mouse.x, this.input.mouse.y, this.camera.scale + 0.1),
      150,
      'Zoom in (=)'
    );
    this.shortcuts.register(
      'shift+=',
      () => this.camera.zoomAt(this.input.mouse.x, this.input.mouse.y, this.camera.scale + 0.1),
      150,
      'Zoom in (+)'
    );
    // (opcjonalnie) bezpośrednio „+” – teraz już zadziała dzięki parserowi:
    this.shortcuts.register(
      '+',
      () => this.camera.zoomAt(this.input.mouse.x, this.input.mouse.y, this.camera.scale + 0.1),
      150,
      'Zoom in (+)'
    );

    // Zoom out
    this.shortcuts.register(
      '-',
      () => this.camera.zoomAt(this.input.mouse.x, this.input.mouse.y, this.camera.scale - 0.1),
      150,
      'Zoom out (-)'
    );
    this.shortcuts.register(
      'shift+-',
      () => this.camera.zoomAt(this.input.mouse.x, this.input.mouse.y, this.camera.scale - 0.1),
      150,
      'Zoom out (_)'
    );

    this.shortcuts.register(
      '=',
      () => this.camera.zoomAt(this.input.mouse.x, this.input.mouse.y, this.camera.scale - 0.1),
      150,
      'Zoom out (Pomniejsz)'
    );

    //mysz

    this.shortcuts.register(
      'leftclick',
      () => {
        this.addBlock(mouse);
      },
      0,
      'Add Tile or block'
    );
    this.shortcuts.register('left', () => this.addTitle(mouse), 0, 'Add Tile or block');
    this.shortcuts.register('shift+left', () => this.deleteTile(mouse.x, mouse.y, this.tittleSize), 0, 'Delete Tile');
    this.shortcuts.register(
      'right',
      () => {
        if (keys['Shift']) this.selectPurpose = 'clear';
        else if (keys['Control']) this.selectPurpose = 'select';
        else this.selectPurpose = 'insert';
        this.setSelectionRange(mouse.x, mouse.y, this.tittleSize);
      },
      0,
      'Add Tile or block'
    );
  }

  onTileObjectCanvasActive() {
    //Utils.cl("TileObjectCanvasActive..");
    this.canvasActive = false;
  }

  onTileObjectSelectedTiles(obj) {
    // Utils.cl("Bufor w editor z tileObject..")
    // Utils.cl(obj.buffer);
    this.objBuffer = [...obj.buffer];
    this.selectPurpose = 'select';
  }
  cancelSelection() {
    if (this.selectPurpose === 'select') {
      this.objBuffer = Array.from({ length: this.height }, () => Array(this.width).fill(null));
      this.selectPurpose = 'none';
    }
  }

  appUpdate(dt) {
    const mouse = this.input.mouse;
    const keys = this.input.keys;
    const cam = this.camera;
    this.shortcuts.update();
    this.input.update();

    if (mouse.middle) {
      // przesuwaj proporcjonalnie do skali
      cam.panBy(-mouse.deltaX / cam.scale, -mouse.deltaY / cam.scale);
      cam.clamp();
    }

    if (mouse.canvasActive) {
      this.canvasActive === true ? '' : eventBus.emit('editor:canvasActive', {}), (this.canvasActive = true);
    } else {
      //this.canvasActive===true ?  this.canvasActive=false : "";
    }

    if (mouse.left && keys['x']) {
      this.drawOnAxle = 'x';
    } else if (mouse.left && keys['y']) {
      this.drawOnAxle = 'y';
    } else {
      this.drawOnAxle = 'all';
    }

    if (mouse.right === false && this.selectedPos[1] !== null && this.drawOnAxle === 'all') {
      this.resolveSeletedArea();
      this.selectedPos = [null, null];
      this.selectedGrid = Array.from({ length: this.height }, () => Array(this.width).fill(null));
    }

    this.tileObject.update(dt, this.context);

    if (!this._camDebugTimer || performance.now() - this._camDebugTimer > 250) {
      console.log(
        `%c📷 Camera → x:${cam.x.toFixed(1)} y:${cam.y.toFixed(1)} scale:${cam.scale.toFixed(2)}`,
        'color: cyan; font-weight: bold;'
      );
      this._camDebugTimer = performance.now();
    }
  }

  addTitle(mouse) {
    this.addTile(mouse.x, mouse.y, this.tittleSize);
  }
  addBlock(mouse) {
    if (this.selectPurpose === 'select') {
      // 👇 jeśli już obsłużono klik – pomiń
      // if (this.blockClickHandled) return;

      // ✅ ustaw blokadę
      // this.blockClickHandled = true;
      this.calibrateBuffer(mouse.x, mouse.y, this.tittleSize);
      this.insertBuffer();
      // setTimeout(() => (this.blockClickHandled = false), 100);
    }
  }
  rollbackTiles() {
    const history = this.historyObjects.pop();
    if (!history) return;
    Utils.cl('ile w historii: ' + history, true);
    Utils.cl('ile do usuniecia: ' + history.oldTile.length);

    for (const oldTile of history.oldTile) {
      this.objGrid[oldTile.ty][oldTile.tx] = oldTile.tileObj;
    }
    Utils.cl('Po usunieciu:');
    Utils.cl(history);
  }

  appDraw(dt) {
    const ctx = this.context2d;
    const mouse = this.input.mouse;
    const keys = this.input.keys;
    this.clear(ctx);
    ctx.save();
    this.camera.apply(ctx);
    this.grid.draw(this.context);
    this.drawTitleGrid();
    this.drawBuffer();
    if (this.selectedPos[1] !== null) {
      this.selctTitlesRange(this.width, this.height, this.tittleSize);
      //this.selectedGrid = Array.from({ length: this.height }, () => Array(this.width).fill(null));
    }

    if (this.drawOnAxle != 'all') {
      //xxxthis.selectTileAxle(this.lockedTileX||this.lockedTileY);ss
    }
    this.strokeSelectTitel(mouse, ctx);
    this.tileObject.draw(dt, this.context);
    ctx.restore();
  }

  calibrateBuffer(mouseX, mouseY, tSize) {
    let newX = -1;
    let newY = -1;
    let absX = -1;
    let absY = -1;
    let temp = Array.from({ length: this.height }, () => Array(this.width).fill(null));
    let { titleX, titleY, x, y } = TileObject.getTitleCoordinate(mouseX, mouseY, tSize, this.camera);
    for (let ty = 0; ty < this.height; ty++) {
      for (let tx = 0; tx < this.width; tx++) {
        if (!this.objBuffer[ty][tx]) continue;
        if (absX == -1 && absY == -1) {
          absX = Math.abs(titleX - tx);
          absY = Math.abs(titleY - ty);
        }
        if (absY !== 0) newY = titleY > ty ? ty + absY : ty - absY;
        else newY = ty;
        if (absX !== 0) newX = titleX > tx ? tx + absX : tx - absX;
        else newX = tx;
        temp[newY][newX] = this.objBuffer[ty][tx];
      }
    }
    this.objBuffer = [...temp];
  }

  insertBuffer() {
    // Utils.cl(this.objBuffer);
    const oldTile = [];
    for (let tx = 0; tx < this.height; tx++) {
      for (let ty = 0; ty < this.width; ty++) {
        if (!this.objBuffer[tx][ty]) continue;
        // Utils.cl("insert buffer " +  this.objBuffer[tx][ty])
        oldTile.push({ ty: tx, tx: ty, tileObj: this.objGrid[tx][ty] });
        this.objGrid[tx][ty] = this.objBuffer[tx][ty];
        //   Utils.cl( this.objGrid[tx][ty])
      }
    }
    if (oldTile.length > 0) this.historyObjects.push({ type: 'insertblockbuffer', oldTile: oldTile });
    Utils.cl(this.historyObjects, true);

    //this.objBuffer =  Array.from({ length: this.height }, () => Array(this.width).fill(null));
  }
  resolveSeletedArea() {
    const oldTile = [];
    for (let tx = 0; tx < this.height; tx++) {
      for (let ty = 0; ty < this.width; ty++) {
        if (!this.selectedGrid[tx][ty]) continue;
        if (this.selectPurpose === 'clear') this.objGrid[tx][ty] = null;
        else if (this.selectPurpose === 'insert') {
          oldTile.push({ ty: tx, tx: ty, tileObj: this.objGrid[tx][ty] });
          this.objGrid[tx][ty] = this.tileObject.selectedTile.tableindex;
        } else if ((this.selectPurpose = 'select')) {
          this.objBuffer[tx][ty] = this.objGrid[tx][ty];
        }
      }
    }
    Utils.cl(oldTile.length);
    if (oldTile.length > 0) this.historyObjects.push({ type: 'insertblock', oldTile: oldTile });
    Utils.cl(this.historyObjects, true);
  }

  drawTitleGrid() {
    const ctx = this.context2d;
    for (let tx = 0; tx < this.height; tx++) {
      for (let ty = 0; ty < this.width; ty++) {
        if (this.objGrid[tx][ty] === null) continue;
        let y = ty === 0 ? 0 : ty * this.tittleSize;
        let x = tx === 0 ? 0 : tx * this.tittleSize;
        this.tileObject.drawTileByIndex(
          this.context2d,
          this.tileObject.image,
          this.objGrid[tx][ty],
          this.tittleSize,
          this.tittleSize,
          y,
          x
        );
      }
    }
  }
  drawBuffer() {
    const ctx = this.context2d;
    for (let tx = 0; tx < this.height; tx++) {
      for (let ty = 0; ty < this.width; ty++) {
        //Utils.cl(`${tx} ${ty}`);
        if (this.objBuffer[tx][ty] === null) continue;
        let y = ty === 0 ? 0 : ty * this.tittleSize;
        let x = tx === 0 ? 0 : tx * this.tittleSize;
        TileObject.drawSelectedFill(ctx, y, x, this.tittleSize, 'rgba(209, 50, 50, 0.3');
        //this.tileObject.drawTileByIndex(this.context2d, this.tileObject.image, this.objGrid[tx][ty], this.tittleSize, this.tittleSize, y,x);
      }
    }
  }
  setSelectionRange(mouseX, mouseY, tSize) {
    const { titleX, titleY, x, y } = TileObject.getTitleCoordinate(mouseX, mouseY, tSize, this.camera);
    this.selectedPos[0] === null ? (this.selectedPos[0] = [titleX, titleY]) : (this.selectedPos[1] = [titleX, titleY]);
  }

  selctTitlesRange(width, height, tSize) {
    const ctx = this.context2d;
    //tzaznaczenie moglo zaczac sie od prawej do lewej lub od lewej do prawej
    //i to samo gora doł
    let y1 = Math.min(this.selectedPos[0][1], this.selectedPos[1][1]);
    let y2 = Math.max(this.selectedPos[0][1], this.selectedPos[1][1]);
    let x1 = Math.min(this.selectedPos[0][0], this.selectedPos[1][0]);
    let x2 = Math.max(this.selectedPos[0][0], this.selectedPos[1][0]);
    //czyszcze bufor zaznaczenia zanim znowu wylicze zakres zaznaczenia
    this.selectedGrid = Array.from({ length: this.height }, () => Array(this.width).fill(null));
    for (let ty = y1; ty <= y2; ty++) {
      for (let tx = x1; tx <= x2; tx++) {
        this.selectedGrid[ty][tx] = 1; //ustawiam w buforze pole...
        let y = ty === 0 ? 0 : ty * tSize;
        let x = tx === 0 ? 0 : tx * tSize;
        TileObject.drawSelectedFill(ctx, x, y, tSize); // rysuje zaznaczeine
      }
    }
  }
  /* selectTileAxle(aLocked,y){
    if(this.drawOnAxle=="x")
    for (let x =  0; x < this.width; x++){ 
        this.selectedGrid[x][aLocked] = 1;
        Utils.cl (this.selectedGrid[x]);
        TileObject.drawSelectedFill(this.context2d, x * this.tittleSize, aLocked * this.tittleSize , this.tittleSizex); // rysuje zaznaczeine
      
    }
    else
      for (let x =  0; x < this.width; x++){ 
        this.selectedGrid[aLocked][x] = 1;
        Utils.cl("2");
      }     
  }*/
  strokeSelectTitel(mouse, ctx) {
    const keys = this.input.keys;
    if (this.canvasActive === false) return;
    if (keys['Shift'] === true) ctx.strokeStyle = 'red';
    else if (mouse.right === true) ctx.strokeStyle = 'yellow';
    else ctx.strokeStyle = this.selectTitleColor;
    ctx.lineWidth = this.selectTitleWidth;
    const { x, y, titleX, titleY } = TileObject.getTitleCoordinate(mouse.x, mouse.y, this.tittleSize, this.camera);
    ctx.strokeRect(x, y, this.tittleSize, this.tittleSize);
    if (this.objBuffer && this.selectPurpose == 'select') {
      //  Utils.cl("d")
      this.tileObject.drawWithBuffer(
        ctx,
        mouse.x,
        mouse.y,
        this.objBuffer,
        this.width,
        this.height,
        this.tittleSize,
        this.tittleSize,
        this.camera
      );
    } else if (this.tileObject.selectedTile.tableindex > -1) {
      this.tileObject.drawTileByIndex(
        this.context2d,
        this.tileObject.image,
        this.tileObject.selectedTile.tableindex,
        this.tittleSize,
        this.tittleSize,
        x,
        y
      );
    }
  }

  addTile(mouseX, mouseY, tSize) {
    const ctx = this.context2d;
    const oldTile = [];
    let { titleX, titleY, x, y } = TileObject.getTitleCoordinate(mouseX, mouseY, tSize, this.camera);
    if (!this.lockedTileX && this.drawOnAxle === 'y') {
      this.lockedTileX = titleX;
      //xthis.selectTileAxle(this.lockedTileX, titleY);
    } else if (!this.lockedTileY && this.drawOnAxle === 'x') {
      this.lockedTileY = titleY;
      //this.selectTileAxle(this.lockedTileY, titleX);
    } else if (this.drawOnAxle === 'all') this.lockedTileX = this.lockedTileY = null;
    titleX = this.lockedTileX ? this.lockedTileX : titleX;
    titleY = this.lockedTileY ? this.lockedTileY : titleY;
    if (!this.objGrid[titleY][titleX]) {
      if (this.tileObject.selectedTile.tableindex > -1)
        oldTile.push({
          ty: titleY,
          tx: titleX,
          tileObj: this.objGrid[titleY][titleX],
        });
      this.objGrid[titleY][titleX] = this.tileObject.selectedTile.tableindex;
      this.historyObjects.push({ type: 'addtile', oldTile: oldTile });
      Utils.cl(this.historyObjects, true);
    }
  }

  deleteTile(mouseX, mouseY, tSize) {
    const { x, y, titleX, titleY } = TileObject.getTitleCoordinate(mouseX, mouseY, tSize, this.camera);
    if (this.objGrid[titleY][titleX] > -1) this.objGrid[titleY][titleX] = null;
  }

  newLevel(name, width = 128, height = 128, tileSize = 16) {
    this.currentLevel = new Level();
    this.currentLevel.create(name, width, height, tileSize, this.objGrid);
    this.saveCurrent(); // od razu zapisuje pusty poziom z miniaturą
    console.log('Utworzono nowy poziom:', this.currentLevel.name);
    this.myModal.hide();
  }

  loadLevel(name) {
    this.currentLevel = this.storage.load(name);
    if (this.currentLevel === null) return false;
    this.objGrid = this.currentLevel.tiles;
    this.width = this.currentLevel.width;
    this.height = this.currentLevel.height;
    console.log('Wczytano poziom: ', this.currentLevel.name);
    this.myModal.hide();
    //return this.currentLevel != null ? true : false;
  }

  saveCurrent() {
    if (!this.currentLevel) return alert('Brak aktywnego poziomu!');
    const canvas = this.canvas;

    // tworzymy miniaturę 128×128 (nawet jeśli canvas jest większy)
    const thumb = new OffscreenCanvas(128, 128);
    const ctx = thumb.getContext('2d');
    ctx.drawImage(canvas, 0, 0, 128, 128);

    thumb.convertToBlob({ type: 'image/jpeg', quality: 0.6 }).then(async (blob) => {
      const preview = await Utils.blobToBase64(blob);
      this.currentLevel.preview = preview;
      this.storage.save(this.currentLevel);
      //this.renderLevelList(); // odśwież listę po zapisie
      console.log('Zapisano poziom z miniaturą:', this.currentLevel.name);
    });
  }

  deleteLevel(name) {
    this.storage.delete(name);
    this.renderLevelList();
  }

  renderLevelList() {
    const modalElement = document.getElementById('modalId');
    const levelsContainer = document.getElementById('levelsContainer');
    const btnNewLevel = document.getElementById('btnNewLevel');
    const storageSize = document.getElementById('storageSize');
    const levels = this.storage.getAll();
    const names = Object.keys(levels);
    levelsContainer.innerHTML = '';

    // Oblicz zajętość localStorage
    const used = (JSON.stringify(localStorage).length / 1024 / 1024).toFixed(2);
    storageSize.textContent = `Zajętość pamięci: ${used} MB`;

    if (names.length === 0) {
      levelsContainer.innerHTML = `<p class="text-center text-muted">Brak zapisanych poziomów.</p>`;
      return;
    }

    names.forEach((name) => {
      const lvl = levels[name];
      const card = document.createElement('div');
      card.className = 'col';

      card.innerHTML = `
        <div class="card shadow-sm level-card">
          <img src="${lvl.preview || 'https://placehold.co/200x120/cccccc/555555?text=Brak+miniatury'}"
               class="card-img-top" alt="Preview">
          <div class="card-body">
            <h6 class="fw-bold mb-1">${lvl.name}</h6>
            <small class="text-muted">${new Date(lvl.modified).toLocaleString()}</small>
            <div class="d-flex justify-content-between mt-2">
              <button class="btn btn-sm btn-primary btnLoad" data-name="${lvl.name}">
                <i class="bi bi-upload"></i> Wczytaj
              </button>
              <button class="btn btn-sm btn-danger btnDelete" data-name="${lvl.name}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>`;
      levelsContainer.appendChild(card);
    });

    // Obsługa przycisków
    levelsContainer.querySelectorAll('.btnLoad').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const name = e.target.closest('button').dataset.name;
        this.loadLevel(name);
        this.myModal.hide();
      });
    });

    levelsContainer.querySelectorAll('.btnDelete').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const name = e.target.closest('button').dataset.name;
        if (confirm(`Usunąć poziom "${name}"?`)) {
          storage.delete(name);
          renderLevels();
        }
      });
    });
  }
  // getTitleCoordinate(x, y, tSize) {
  //   const titleX = Math.floor(x / tSize);
  //   const titleY = Math.floor(y / tSize);
  //   return {
  //     titleX: titleX,
  //     titleY: titleY,
  //     x: titleX == 0 ? 0 : titleX * tSize,
  //     y: titleY == 0 ? 0 : titleY * tSize
  //   }
  // }

  appLoop(timeStamp) {
    if (!this.lastTime) this.lastTime = timeStamp;
    const deltaTime = timeStamp - this.lastTime;
    this.lastTime = timeStamp;

    const dt = Math.min(deltaTime, 50) / 1000;

    this.appUpdate(dt);
    this.appDraw(dt);
    window.requestAnimationFrame(this.appLoop);
  }
}

const e = new Edytor();

/********************************************FUNKCJE DO TESTOW*****************************************************************/
/**********************************************************************************************/
/*************************************************************************************************************/
/*************************************************************************************************************/
/*************************************************************************************************************/
/*************************************************************************************************************/
/*************************************************************************************************************/
/*textOnBackground(ctx) {
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
     const pattern = ctx.createPattern(this.patternImage, "repeat");
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
     ctx.fillText("4️⃣ Wzór (createPattern)", 150, 425);
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

    
    }

  }
}
*/

/**********************************************
 *****************************************************/
//reakca na klawisze. Uwaga na wielkosc liter i polskie znaki

// const index = this.objects.findIndex(obj => {
//   return (obj.x === x && obj.y === y);
// })

// if (mouse.right === false && this.selectedGrid.some(row => row.some(cell => cell === "1")))

// 🔹 Zoom skokowy: 0.5 → 1 → 1.5 → 2 → 2.5 → 3
/*if (mouse.wheelDelta) {
      const zoomLevels = [0.5, 1, 1.5, 2, 2.5, 3];
      // aktualny najbliższy poziom
      let currentIndex = zoomLevels.reduce(
        (best, z, i) =>
          Math.abs(z - this.camera.scale) <
          Math.abs(zoomLevels[best]  - this.camera.scale)
            ? i
            : best,
        0
      );
      // 🔸 reaguj tylko na kierunek (nie na wartość)
      if (mouse.wheelDelta < 0 && currentIndex < zoomLevels.length - 1) {
        currentIndex += 1;
      } else if (mouse.wheelDelta > 0 && currentIndex > 0) {
        currentIndex -= 1;
      }
      const newScale = zoomLevels[currentIndex];
      // Zoom do kursora
      this.camera.zoomAt(mouse.x, mouse.y, newScale);
      // 🔸 wyzeruj po użyciu, żeby nie powtarzało
      mouse.wheelDelta = 0;
    }*/
