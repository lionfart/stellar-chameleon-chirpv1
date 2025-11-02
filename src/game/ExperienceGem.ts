export class ExperienceGem {
  x: number;
  y: number;
  size: number;
  value: number;
  color: string;
  private pullSpeed: number = 300;
  private sprite: HTMLImageElement | undefined; // New: Gem sprite

  constructor(x: number, y: number, value: number, sprite: HTMLImageElement | undefined) {
    this.x = x;
    this.y = y;
    this.size = 10;
    this.value = value;
    this.color = 'yellow';
    this.sprite = sprite;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (this.sprite) {
      ctx.drawImage(this.sprite, this.x - cameraX - this.size / 2, this.y - cameraY - this.size / 2, this.size, this.size);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x - cameraX, this.y - cameraY, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  collidesWith(other: { x: number; y: number; size: number }): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.size / 2 + other.size / 2);
  }

  pullTowards(targetX: number, targetY: number, deltaTime: number) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const directionX = dx / distance;
      const directionY = dy / distance;
      this.x += directionX * this.pullSpeed * deltaTime;
      this.y += directionY * this.pullSpeed * deltaTime;
    }
  }
}