import { Enemy } from './Enemy';

export class AuraWeapon {
  private damage: number;
  private radius: number;
  private attackInterval: number; // seconds
  private lastAttackTime: number;

  constructor(damage: number, radius: number, attackInterval: number) {
    this.damage = damage;
    this.radius = radius;
    this.attackInterval = attackInterval;
    this.lastAttackTime = 0;
  }

  update(deltaTime: number, playerX: number, playerY: number, enemies: Enemy[]) {
    this.lastAttackTime += deltaTime;

    if (this.lastAttackTime >= this.attackInterval) {
      this.lastAttackTime = 0; // Reset timer

      for (const enemy of enemies) {
        const dx = playerX - enemy.x;
        const dy = playerY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius + enemy.size / 2) {
          enemy.takeDamage(this.damage);
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, playerX: number, playerY: number, cameraX: number, cameraY: number) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(playerX - cameraX, playerY - cameraY, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  increaseDamage(amount: number) {
    this.damage += amount;
    console.log(`Aura weapon damage increased to ${this.damage}`);
  }
}