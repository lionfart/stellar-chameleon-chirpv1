import { Player } from './Player';

export class MagnetPowerUp {
  x: number;
  y: number;
  size: number;
  duration: number;
  radius: number;
  color: string;
  private currentDuration: number;
  private sprite: HTMLImageElement | undefined; // New: Magnet sprite

  constructor(x: number, y: number, duration: number = 5, radius: number = 300, sprite: HTMLImageElement | undefined) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.duration = duration;
    this.radius = radius;
    this.color = 'lightblue';
    this.currentDuration = duration;
    this.sprite = sprite;
  }

  update(deltaTime: number): boolean {
    this.currentDuration -= deltaTime;
    return this.currentDuration > 0;
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
}