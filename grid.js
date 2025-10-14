export class Grid {
  constructor(size = 8, width = 200, height = 150, penColor = "silver", penwidth = 1) {
    this.size = size;
    this.width = width * size;
    this.height = height * size;
    this.penColor = penColor;
    this.penwidth = penwidth;
    this.lineDash = [5, 1];
    this.isGrid = true;
    this.refresh = true;
  }
  update(ctx) { }
  draw(context) {
    this.drawGrid(context.ctx);
  }
  drawGrid(ctx) {
    if (!this.isGrid) return;
    ctx.save();
    ctx.setLineDash([5, 1]);
    for (let x = 0; x < this.width + 1; x += this.size) {
      ctx.beginPath();
      ctx.strokeStyle = this.penColor;
      ctx.lineWidth = this.penwidth;
      ctx.setLineDash(this.lineDash);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height + 1; y += this.size) {
      ctx.beginPath();
      ctx.strokeStyle = this.penColor;
      ctx.lineWidth = this.penwidth;
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }
  drawGridXY(ctx) { }
  drawGridSize(ctx) { }
}
