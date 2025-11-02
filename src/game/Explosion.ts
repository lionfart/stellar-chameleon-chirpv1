import { Enemy } from './Enemy';

export class Explosion {
  x: number;
  y: number;
  radius: number;
  damage: number;
  private duration: number;
  private currentDuration: number;
  private color: string;
  private hasDealtDamage: boolean;

  constructor(x: number, y: number, radius: number, damage: number, duration: number = 0.2, color: string = 'orange') {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.damage = damage;
    this.duration = duration;
    this.currentDuration = 0;
    this.color = color;
    this.hasDealtDamage = false;
  }

  update(deltaTime: number): boolean {
    this.currentDuration += deltaTime;
    return this.currentDuration < this.duration;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const progress = this.currentDuration / this.duration;
    const currentRadius = this.radius * (0.5 + progress * 0.5); // Grow from half size to full
    const alpha = 1 - progress; // Fade out

    const gradient = ctx.createRadialGradient(
      this.x - cameraX, this.y - cameraY, currentRadius * 0.1,
      this.x - cameraX, this.y - cameraY, currentRadius
    );
    gradient.addColorStop(0, `rgba(255, 255, 0, ${alpha})`); // Bright yellow center
    gradient.addColorStop(0.5, `rgba(255, 165, 0, ${alpha})`); // Orange middle
    gradient.addColorStop(1, `rgba(255, 0, 0, ${alpha * 0.5})`); // Red outer, more transparent

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y - cameraY, currentRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  dealDamage(enemies: Enemy[]) {
    if (this.hasDealtDamage) return;

    for (const enemy of enemies) {
      if (enemy.isAlive()) {
        const dx = this.x - enemy.x;
        const dy = this.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius + enemy.size / 2) {
          enemy.takeDamage(this.damage);
        }
      }
    }
    this.hasDealtDamage = true;
  }
}