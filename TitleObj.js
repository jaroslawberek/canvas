import { Utils } from "./classes/utils.js";
import { Grid } from "./grid.js";
import { InputManager } from "./classes/InputManager.js";
import { eventBus } from "./classes/EventBus.js";
export class TileObject {
    constructor(tileSize, width, height) {

        this.canvas = document.querySelector("#canvas2");
        this.context2d = this.canvas.getContext("2d");

        this.canvas.width = window.innerWidth * 0.322;
        this.canvas.height = window.innerHeight;
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.bgColor = "#d1ceceff"; // domyślny kolor tła
        this.selectTileColor = "green";
        this.selectTileWidth = 1;
        this.image = null;
        this.grid = null;
        this.table = [];
        this.selectedGrid = null;
        this.objBuffer = null;
        this.selectedTile = { tableindex: 0 };
        this.input = new InputManager(this.canvas, this);
        this.selectedPos = [null, null];
        this.context = {
            canvas: this.canvas,
            ctx: this.context2d,
            width: this.width,
            height: this.height,
            tileSize: this.tileSize,
        };
        this.image = new Image();
        this.image.src = "kafelkiNowe.png";
        this.image.onload = () => {
        }
        this.init();
    }
    init() {
        //this.image = await this.loadImage("kafelkiNowe.png"); // <- podmień na własny plik
        this.grid = new Grid(this.tileSize, this.width, this.height);
        this.selectedGrid = Array.from({ length: this.height }, () => Array(this.width).fill(null));
        this.objBuffer = Array.from({ length: this.height }, () => Array(this.width).fill(null));
        this.selectedTile.tableindex = -1;
        this.indexTileset(this.image);
    }
    onEditorCanvasActive() {
        //Utils.cl("EditorCanvasActive..");
        this.canvasActive = false;

    }
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    clear(ctx) {
        this.context2d.fillStyle = this.bgColor;
        this.context2d.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    update(dt, appContext) {
        const mouse = this.input.mouse;
        const keys = this.input.keys;
        if (mouse.canvasActive) {
            this.canvasActive === true ? "" : eventBus.emit("tileObject:canvasActive", {}), this.canvasActive = true;
        } else {
            this.canvasActive === true ? this.canvasActive = false : "";
        }
        if (mouse.left) {
            this.selectTile(mouse);
        } else if (mouse.right && keys["Control"]) {
            this.setSelectionRange(mouse.x, mouse.y, this.tileSize)
        }
        if (mouse.right === false && this.selectedPos[1] !== null) {
            this.resolveSeletedArea();
            this.selectedPos = [null, null];
            this.selectedGrid = Array.from({ length: this.height }, () => Array(this.width).fill(null));
        }
    }
    draw(dt, appContext) {
        const mouse = this.input.mouse;
        this.clear(this.context2d);
        this.grid.draw(this.context);
        this.context2d.drawImage(this.image, 0, 0);
        if (this.selectedPos[1] !== null) {
            this.selctTitlesRange(this.width, this.height, this.tileSize);
            //this.selectedGrid = Array.from({ length: this.height }, () => Array(this.width).fill(null));
        }
        this.strokeSelectTitel(mouse, this.context2d);

    }
    indexTileset(image) {
        const cols = Math.floor(image.width / this.tileSize);
        const rows = Math.floor(image.height / this.tileSize);
        this.table = [];

        let index = 0;
        for (let y = 0; y < rows; y++) {
            const row = [];
            for (let x = 0; x < cols; x++) {
                row.push(index);
                index++;
            }
            this.table.push(row);
        }


    }
    resolveSeletedArea() {
        for (let tx = 0; tx < this.width; tx++) {
            for (let ty = 0; ty < this.height; ty++) {
                if (!this.selectedGrid[tx][ty])
                    continue;
                this.objBuffer[tx][ty] = this.table[tx][ty];
            }
        }
        eventBus.emit("tileObject:tilesSelected", { buffer: this.objBuffer });
        this.objBuffer = Array.from({ length: this.height }, () => Array(this.width).fill(null));
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
    setSelectionRange(mouseX, mouseY, tSize) {
        const { titleX, titleY, x, y } = TileObject.getTitleCoordinate(mouseX, mouseY, tSize);
        (this.selectedPos[0] === null) ? this.selectedPos[0] = [titleX, titleY] : this.selectedPos[1] = [titleX, titleY];
    }
    selectTile(mouse) {
        const { x, y, titleX, titleY } = TileObject.getTitleCoordinate(mouse.x, mouse.y, this.tileSize);
        this.selectedTile = { x: x, y: y, titleX: titleX, titleY: titleY, tableindex: this.table[titleY][titleX] }
        // Utils.cl(this.selectedTile);
    }
    strokeSelectTitel(mouse, ctx) {
        if (this.canvasActive === false) return;
        ctx.strokeStyle = this.selectTitleColor;
        ctx.lineWidth = this.selectTitleWidth;
        const { x, y, titleX, titleY } = TileObject.getTitleCoordinate(mouse.x, mouse.y, this.tileSize);
        ctx.strokeRect(x, y, this.tileSize, this.tileSize);
    }
    drawTileByIndex(ctx, image, index, tileW, tileH, posX, posY) {
        const cols = Math.floor(image.width / tileW);
        const tileX = index % cols;
        const tileY = Math.floor(index / cols);
        // Utils.cl(index)
        // Utils.cl(tileX)
        // Utils.cl(tileY)
        ctx.drawImage(
            image,
            tileX * tileW,
            tileY * tileH,
            tileW,
            tileH,
            posX,
            posY,
            tileW,
            tileH
        );
    }

    drawWithBuffer(ctx, mouseX, mouseY, buffer, width, height, tileW, tileH) {
        let first = null;
        for (let tx = 0; tx < width; tx++) {
            for (let ty = 0; ty < height; ty++) {
                if (buffer[tx][ty] === null) continue;
                let y = ty === 0 ? 0 : ty * tileW;
                let x = tx === 0 ? 0 : tx * tileH;
                if (first === null) {
                    first = { tx: tx, ty: ty, x: y, y: x };
                }
                this.drawTileByIndex(ctx, this.image, buffer[tx][ty], tileW, tileH, y + (mouseX - first.x), x + (mouseY - first.y));
            }
        }
    }

    static strokeTitlePosition(ctx, status, titleCoordinate, titleSize) {
        if (status === "deleteTitle")
            ctx.strokeStyle = "red";
        else if (status === "selectTitles")
            ctx.strokeStyle = "yellow";
        else
            ctx.strokeStyle = this.selectTitleColor;
        ctx.strokeStyle = this.selectTitleColor;
        ctx.lineWidth = this.selectTitleWidth;
        const { x, y, titleX, titleY } = titleCoordinate;
        ctx.strokeRect(x, y, titleSize, titleSize);
    }
    static drawTitleFill(ctx, x, y, titleSize) {
        ctx.fillStyle = "orange";
        ctx.fillRect(x, y, titleSize, titleSize);
    }
    static drawSelectedFill(ctx, x, y, titleSize, color = null) {
        if (!color)
            ctx.fillStyle = "rgba(0,0,0,0.3)";
        else
            ctx.fillStyle = color;
        ctx.fillRect(x, y, titleSize, titleSize);
    }
    static getTitleCoordinate(x, y, tSize, lockedAxle = "none") {
        const titleX = Math.floor(x / tSize);
        const titleY = Math.floor(y / tSize);
        return {
            titleX: titleX,
            titleY: titleY,
            x: titleX == 0 ? 0 : titleX * tSize,
            y: titleY == 0 ? 0 : titleY * tSize
        }
    }
}