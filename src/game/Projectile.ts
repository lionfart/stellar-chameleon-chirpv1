import { Enemy } from './Enemy';

export class Projectile {
  x: number;
  y: number;
  radius: number;
  speed: number;
  damage: number;
  directionX: number;
  directionY: number;
  color: string;
  lifetime: number;
  private currentLifetime: number;
  private sprite: HTMLImageElement | undefined; // New: Projectile sprite

  constructor(x: number, y: number, radius: number, speed: number, damage: number, directionX: number, directionY: number, color: string, lifetime: number, sprite: HTMLImageElement | undefined) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.damage = damage;
    this.directionX = directionX;
    this.directionY = directionY;
    this.color = color;
    this.lifetime = lifetime;
    this.currentLifetime = 0;
    this.sprite = sprite;
  }

  update(deltaTime: number): boolean {
    this.x += this.directionX * this.speed * deltaTime;
    this.y += this.directionY * this.speed * deltaTime;
    this.currentLifetime += deltaTime;
    return this.currentLifetime < this.lifetime;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (this.sprite) {
      ctx.drawImage(this.sprite, this.x - cameraX - this.radius, this.y - cameraY - this.radius, this.radius * 2, this.radius * 2);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x - cameraX, this.y - cameraY, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  collidesWith(enemy: Enemy): boolean {
    const dx = this.x - enemy.x;
    const dy = this.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.radius + enemy.size / 2);
  }
}