import { Enemy } from './Enemy';
import { GameEngine } from './GameEngine'; // Import GameEngine

export class Explosion {
  x: number;
  y: number;
  radius: number;
  damage: number;
  private duration: number;
  private currentDuration: number;
  private color: string;
  private hasDealtDamage: boolean;
  private gameEngine: GameEngine; // New: GameEngine instance

  constructor(x: number, y: number, radius: number, damage: number, gameEngine: GameEngine, duration: number = 0.2, color: string = 'orange') {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.damage = damage;
    this.duration = duration;
    this.currentDuration = 0;
    this.color = color;
    this.hasDealtDamage = false;
    this.gameEngine = gameEngine; // Assign GameEngine
  }

  update(deltaTime: number): boolean {
    this.currentDuration += deltaTime;
    return this.currentDuration < this.duration;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, gameEngine: GameEngine) {
    const { drawX, drawY, scale, scaledSize } = gameEngine.getDrawProperties({ x: this.x, y: this.y, size: this.radius * 2 }); // Use radius * 2 as size for scaling reference

    const progress = this.currentDuration / this.duration;
    const currentRadius = this.radius * scale * (0.5 + progress * 0.5); // Grow from half size to full, scaled
    const alpha = 1 - progress; // Fade out

    const gradient = ctx.createRadialGradient(
      drawX - cameraX, drawY - cameraY + (scaledSize - this.radius * 2) / 2, currentRadius * 0.1,
      drawX - cameraX, drawY - cameraY + (scaledSize - this.radius * 2) / 2, currentRadius
    );
    gradient.addColorStop(0, `rgba(255, 255, 0, ${alpha})`); // Bright yellow center
    gradient.addColorStop(0.5, `rgba(255, 165, 0, ${alpha})`); // Orange middle
    gradient.addColorStop(1, `rgba(255, 0, 0, ${alpha * 0.5})`); // Red outer, more transparent

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(drawX - cameraX, drawY - cameraY + (scaledSize - this.radius * 2) / 2, currentRadius, 0, Math.PI * 2);
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