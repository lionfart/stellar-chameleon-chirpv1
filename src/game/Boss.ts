import { Enemy } from './Enemy';
import { Player } from './Player';
import { SoundManager } from './SoundManager';
import { DamageNumber } from './DamageNumber';

export class Boss extends Enemy {
  private bossName: string;
  private phase: number;
  private phaseThresholds: number[]; // Health percentages to trigger phases
  private specialAttackCooldown: number;
  private currentSpecialAttackCooldown: number;

  constructor(
    x: number, y: number, size: number, speed: number, color: string, maxHealth: number,
    sprite: HTMLImageElement | undefined, soundManager: SoundManager, goldDrop: number,
    onTakeDamage: (x: number, y: number, damage: number) => void,
    bossName: string = "Mega Enemy",
    phaseThresholds: number[] = [0.75, 0.5, 0.25], // Example: 75%, 50%, 25% health
    specialAttackCooldown: number = 5 // seconds
  ) {
    super(x, y, size, speed, color, maxHealth, sprite, soundManager, goldDrop, onTakeDamage);
    this.bossName = bossName;
    this.phase = 0;
    this.phaseThresholds = phaseThresholds.sort((a, b) => b - a); // Sort descending
    this.specialAttackCooldown = specialAttackCooldown;
    this.currentSpecialAttackCooldown = specialAttackCooldown;
    console.log(`Boss ${this.bossName} spawned! Health: ${this.maxHealth}`);
  }

  update(deltaTime: number, player: Player, separationVector: { x: number, y: number } = { x: 0, y: 0 }) {
    super.update(deltaTime, player, separationVector); // Inherit basic movement towards player, passing separationVector

    if (!this.isAlive()) return;

    // Update special attack cooldown
    if (this.currentSpecialAttackCooldown > 0) {
      this.currentSpecialAttackCooldown -= deltaTime;
    } else {
      this.performSpecialAttack(player);
      this.currentSpecialAttackCooldown = this.specialAttackCooldown; // Reset cooldown
    }

    // Check for phase changes
    this.checkPhaseChange();
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    super.draw(ctx, cameraX, cameraY); // Draw base enemy sprite/shape

    if (!this.isAlive()) return;

    // Draw boss name above health bar
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 5;
    ctx.fillText(this.bossName, this.x - cameraX, this.y - cameraY - this.size / 2 - 30);
    ctx.restore();
  }

  private checkPhaseChange() {
    const healthRatio = this.currentHealth / this.maxHealth;
    for (let i = 0; i < this.phaseThresholds.length; i++) {
      if (healthRatio <= this.phaseThresholds[i] && this.phase <= i) {
        this.phase = i + 1;
        console.log(`${this.bossName} entered Phase ${this.phase}!`);
        // Trigger phase-specific behaviors here (e.g., change speed, attack pattern)
        this.onPhaseChange();
        break;
      }
    }
  }

  private onPhaseChange() {
    switch (this.phase) {
      case 1:
        this.speed *= 1.2; // Increase speed
        this.color = 'darkred'; // Change color
        this.specialAttackCooldown *= 0.8; // Faster special attacks
        break;
      case 2:
        this.speed *= 1.1;
        this.color = 'purple';
        this.specialAttackCooldown *= 0.8;
        break;
      case 3:
        this.speed *= 1.1;
        this.color = 'black';
        this.specialAttackCooldown *= 0.8;
        break;
      default:
        break;
    }
  }

  private performSpecialAttack(player: Player) {
    console.log(`${this.bossName} performs a special attack! Phase: ${this.phase}`);
    // Implement boss-specific special attacks here
    // For example, a simple area damage or a burst of projectiles
    const attackRadius = this.size * 2;
    const attackDamage = 20 + this.phase * 5; // Damage scales with phase

    const dx = player.x - this.x;
    const dy = player.y - player.y; // Should be player.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < attackRadius + player.size / 2) {
      player.takeDamage(attackDamage);
    }
    this.soundManager.playSound('explosion', false, 0.7); // Re-use explosion sound for now
  }

  getBossName(): string {
    return this.bossName;
  }
}