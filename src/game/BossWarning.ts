export class BossWarning {
  width: number;
  height: number;
  private duration: number; // Total duration of the warning
  private currentDuration: number;
  private flashTimer: number;
  private flashInterval: number = 0.2; // How often it flashes
  private isVisible: boolean;
  private corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  constructor(canvasWidth: number, canvasHeight: number, corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right', duration: number = 3) {
    this.width = canvasWidth; // Store canvas dimensions
    this.height = canvasHeight;
    this.corner = corner;
    this.duration = duration;
    this.currentDuration = 0;
    this.flashTimer = 0;
    this.isVisible = true;
  }

  update(deltaTime: number): boolean {
    this.currentDuration += deltaTime;
    this.flashTimer += deltaTime;

    if (this.flashTimer >= this.flashInterval) {
      this.isVisible = !this.isVisible;
      this.flashTimer = 0;
    }

    return this.currentDuration < this.duration; // Return true if warning is still active
  }

  draw(ctx: CanvasRenderingContext2D) { // Removed cameraX, cameraY as it draws on screen coordinates
    if (!this.isVisible) return;

    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 5;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 10;

    const text = "BOSS INCOMING!";
    const rectWidth = this.width / 4;
    const rectHeight = this.height / 4;

    let textX, textY;
    let rectX, rectY;

    switch (this.corner) {
      case 'top-left':
        rectX = 0;
        rectY = 0;
        textX = rectWidth / 2;
        textY = rectHeight / 2;
        break;
      case 'top-right':
        rectX = this.width - rectWidth;
        rectY = 0;
        textX = this.width - rectWidth / 2;
        textY = rectHeight / 2;
        break;
      case 'bottom-left':
        rectX = 0;
        rectY = this.height - rectHeight;
        textX = rectWidth / 2;
        textY = this.height - rectHeight / 2;
        break;
      case 'bottom-right':
        rectX = this.width - rectWidth;
        rectY = this.height - rectHeight;
        textX = this.width - rectWidth / 2;
        textY = this.height - rectHeight / 2;
        break;
    }
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
    ctx.fillStyle = 'white'; // Text color
    ctx.fillText(text, textX, textY);

    ctx.restore();
  }
}