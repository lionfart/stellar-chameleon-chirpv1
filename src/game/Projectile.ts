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
  private sprite: HTMLImageElement | undefined;
  private trail: { x: number; y: number; alpha: number; radius: number }[] = []; // New: For projectile trail

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

    // Add current position to trail
    this.trail.push({ x: this.x, y: this.y, alpha: 1, radius: this.radius });

    // Update and filter trail particles
    this.trail = this.trail.filter(p => {
      p.alpha -= deltaTime * 5; // Fade out faster
      p.radius *= 0.9; // Shrink
      return p.alpha > 0 && p.radius > 1; // Remove if too transparent or too small
    });

    return this.currentLifetime < this.lifetime;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    // Draw trail
    this.trail.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = `rgba(0, 191, 255, ${p.alpha * 0.5})`; // Light blue trail
      ctx.beginPath();
      ctx.arc(p.x - cameraX, p.y - cameraY, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw the main projectile
    if (this.sprite) {
      ctx.drawImage(this.sprite, this.x - cameraX - this.radius, this.y - cameraY - this.radius, this.radius * 2, this.radius * 2);
    } else {
      const gradient = ctx.createRadialGradient(
        this.x - cameraX, this.y - cameraY, this.radius * 0.2,
        this.x - cameraX, this.y - cameraY, this.radius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // White hot center
      gradient.addColorStop(0.5, `rgba(0, 191, 255, 1)`); // Deep Sky Blue
      gradient.addColorStop(1, `rgba(0, 191, 255, 0.5)`); // Fading blue outer

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x - cameraX, this.y - cameraY, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Updated to accept any object with x, y, and size properties
  collidesWith(other: { x: number; y: number; size: number }): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.radius + other.size / 2);
  }
}