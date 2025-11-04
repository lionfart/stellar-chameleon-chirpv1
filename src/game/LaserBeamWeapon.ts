import { Enemy } from './Enemy';
import { SoundManager } from './SoundManager';

export class LaserBeamWeapon {
  private damagePerSecond: number;
  private range: number;
  private width: number;
  private fireRate: number; // How often damage is applied
  private lastFireTime: number;
  private soundManager: SoundManager;
  private beamSprite: HTMLImageElement | undefined;
  private targetEnemy: Enemy | null = null; // Current target for the beam

  constructor(damagePerSecond: number, range: number, width: number, fireRate: number, beamSprite: HTMLImageElement | undefined, soundManager: SoundManager) {
    this.damagePerSecond = damagePerSecond;
    this.range = range;
    this.width = width;
    this.fireRate = fireRate;
    this.lastFireTime = 0;
    this.beamSprite = beamSprite;
    this.soundManager = soundManager;
  }

  update(deltaTime: number, playerX: number, playerY: number, enemies: Enemy[]) {
    this.lastFireTime += deltaTime;

    // Find closest enemy within range
    this.targetEnemy = this.findClosestEnemy(playerX, playerY, enemies);

    if (this.targetEnemy && this.targetEnemy.isAlive()) {
      if (this.lastFireTime >= this.fireRate) {
        this.targetEnemy.takeDamage(this.damagePerSecond * this.fireRate);
        this.lastFireTime = 0;
        this.soundManager.playSound('laser_beam_fire'); // Play fire sound on each tick
      }
    } else {
      // If no target, stop any looping sound (if applicable, though for auto-fire, it's usually short bursts)
      // For a continuous beam, you might manage a looping sound here.
      // For now, we assume short burst sound on each damage tick.
    }
  }

  draw(ctx: CanvasRenderingContext2D, playerX: number, playerY: number, cameraX: number, cameraY: number) {
    if (!this.targetEnemy || !this.targetEnemy.isAlive()) return;

    const startX = playerX - cameraX;
    const startY = playerY - cameraY;
    const endX = this.targetEnemy.x - cameraX;
    const endY = this.targetEnemy.y - cameraY;

    // Draw the beam
    ctx.save();
    ctx.lineWidth = this.width;
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.7 + Math.sin(performance.now() / 100) * 0.2})`; // Pulsing alpha
    ctx.shadowColor = 'cyan';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();

    // Draw a small glow at the target
    ctx.save();
    ctx.fillStyle = `rgba(0, 255, 255, ${0.5 + Math.sin(performance.now() / 50) * 0.3})`;
    ctx.beginPath();
    ctx.arc(endX, endY, this.width * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private findClosestEnemy(playerX: number, playerY: number, enemies: Enemy[]): Enemy | null {
    let closest: Enemy | null = null;
    let minDistance = this.range + 1; // Initialize with a value outside range

    for (const enemy of enemies) {
      if (enemy.isAlive()) {
        const dx = playerX - enemy.x;
        const dy = playerY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance && distance <= this.range) {
          minDistance = distance;
          closest = enemy;
        }
      }
    }
    return closest;
  }

  increaseDamage(amount: number) {
    this.damagePerSecond += amount;
    console.log(`Laser Beam damage increased to ${this.damagePerSecond}/s`);
  }

  increaseRange(amount: number) {
    this.range += amount;
    console.log(`Laser Beam range increased to ${this.range}`);
  }

  // No cooldown or duration for an automatic weapon, so these methods are removed.
  // reduceCooldown(amount: number) {
  //   this.cooldown = Math.max(1, this.cooldown - amount);
  //   console.log(`Laser Beam cooldown reduced to ${this.cooldown}s`);
  // }

  // increaseDuration(amount: number) {
  //   this.duration += amount;
  //   console.log(`Laser Beam duration increased to ${this.duration}s`);
  // }

  // No cooldown getters for an automatic weapon.
  // getCooldownCurrent(): number {
  //   return this.currentCooldown;
  // }

  // getCooldownMax(): number {
  //   return this.cooldown;
  // }

  // getIsActive(): boolean {
  //   return this.isActive;
  // }
}