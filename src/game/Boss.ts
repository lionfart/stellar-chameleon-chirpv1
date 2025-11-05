import { Enemy } from './Enemy';
import { Player } from './Player';
import { SoundManager } from './SoundManager';
import { DamageNumber } from './DamageNumber';
import { BossAttackVisual } from './BossAttackVisual';
import { Projectile } from './Projectile'; // NEW: Import Projectile

export class Boss extends Enemy {
  private bossName: string;
  private phase: number;
  private phaseThresholds: number[];
  private specialAttackCooldown: number;
  private currentSpecialAttackCooldown: number;
  private onAddBossAttackVisual: (visual: BossAttackVisual) => void;
  private onAddBossProjectile: (projectile: Projectile) => void; // NEW: Callback to add boss projectiles
  private onDefeatCallback: () => void;

  constructor(
    x: number, y: number, size: number, speed: number, color: string, maxHealth: number,
    sprite: HTMLImageElement | undefined, soundManager: SoundManager, goldDrop: number,
    onTakeDamage: (x: number, y: number, damage: number) => void,
    bossName: string = "Mega Enemy",
    phaseThresholds: number[] = [0.75, 0.5, 0.25],
    specialAttackCooldown: number = 5,
    onAddBossAttackVisual: (visual: BossAttackVisual) => void,
    onAddBossProjectile: (projectile: Projectile) => void // NEW: Add to constructor
  ) {
    super(x, y, size, speed, color, maxHealth, sprite, soundManager, goldDrop, onTakeDamage);
    this.bossName = bossName;
    this.phase = 0;
    this.phaseThresholds = phaseThresholds.sort((a, b) => b - a);
    this.specialAttackCooldown = specialAttackCooldown;
    this.currentSpecialAttackCooldown = specialAttackCooldown;
    this.onAddBossAttackVisual = onAddBossAttackVisual;
    this.onAddBossProjectile = onAddBossProjectile; // NEW: Assign callback
    this.onDefeatCallback = () => {};
    // console.log(`Boss ${this.bossName} spawned! Health: ${this.maxHealth}`); // Removed for optimization
  }

  setOnDefeatCallback(callback: () => void) {
    this.onDefeatCallback = callback;
  }

  takeDamage(amount: number) {
    super.takeDamage(amount);

    if (!this.isAlive() && this.onDefeatCallback) {
      this.onDefeatCallback();
    }
  }

  update(deltaTime: number, player: Player, separationVector: { x: number, y: number } = { x: 0, y: 0 }) {
    super.update(deltaTime, player, separationVector); // Call super's update for movement and animation

    if (!this.isAlive()) return;

    if (this.currentSpecialAttackCooldown > 0) {
      this.currentSpecialAttackCooldown -= deltaTime;
    } else {
      this.performSpecialAttack(player);
      this.currentSpecialAttackCooldown = this.specialAttackCooldown;
    }

    this.checkPhaseChange();
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    super.draw(ctx, cameraX, cameraY); // Call super's draw for boss body and health bar

    if (!this.isAlive()) return;

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
        // console.log(`${this.bossName} entered Phase ${this.phase}!`); // Removed for optimization
        this.onPhaseChange();
        break;
      }
    }
  }

  private onPhaseChange() {
    switch (this.phase) {
      case 1:
        this.speed *= 1.2;
        this.color = 'darkred';
        this.specialAttackCooldown *= 0.8;
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
    const attackType = Math.floor(Math.random() * 3); // Randomly choose between 3 attack types

    switch (this.phase) {
      case 0: // Initial phase
      case 1:
        if (attackType === 0) this.performRadialProjectileAttack(player);
        else if (attackType === 1) this.performTargetedProjectileAttack(player);
        else this.performGroundSlamAttack(player);
        break;
      case 2:
        if (attackType === 0) this.performTargetedProjectileAttack(player);
        else if (attackType === 1) this.performGroundSlamAttack(player);
        else this.performRadialProjectileAttack(player); // Mix it up
        break;
      case 3:
        if (attackType === 0) this.performGroundSlamAttack(player);
        else if (attackType === 1) this.performTargetedProjectileAttack(player);
        else this.performRadialProjectileAttack(player); // Mix it up
        break;
      default:
        this.performGroundSlamAttack(player); // Default to a strong attack
        break;
    }
  }

  private performRadialProjectileAttack(player: Player) {
    // console.log(`${this.bossName} performs Radial Projectile Attack!`); // Removed for optimization
    const numProjectiles = 8 + this.phase * 2;
    const projectileSpeed = 150 + this.phase * 20;
    const projectileDamage = 10 + this.phase * 5;
    const projectileRadius = 8;
    const projectileLifetime = 3;

    // Telegraph the attack
    this.onAddBossAttackVisual(new BossAttackVisual(this.x, this.y, this.size * 1.5, 0.8, 'rgba(255, 165, 0, 0.5)')); // Orange warning

    setTimeout(() => {
      for (let i = 0; i < numProjectiles; i++) {
        const angle = (Math.PI * 2 / numProjectiles) * i;
        const directionX = Math.cos(angle);
        const directionY = Math.sin(angle);

        const projectile = new Projectile(
          this.x, this.y, projectileRadius, projectileSpeed, projectileDamage,
          directionX, directionY, 'orange', projectileLifetime, undefined
        );
        this.onAddBossProjectile(projectile);
      }
      this.soundManager.playSound('projectile_fire', false, 0.4);
    }, 800); // Delay to match visual warning
  }

  private performTargetedProjectileAttack(player: Player) {
    // console.log(`${this.bossName} performs Targeted Projectile Attack!`); // Removed for optimization
    const numProjectiles = 3 + this.phase;
    const projectileSpeed = 200 + this.phase * 30;
    const projectileDamage = 15 + this.phase * 5;
    const projectileRadius = 10;
    const projectileLifetime = 2.5;
    const delayBetweenShots = 0.2;

    // Telegraph the attack
    this.onAddBossAttackVisual(new BossAttackVisual(player.x, player.y, player.size * 2, 0.5, 'rgba(255, 0, 0, 0.5)')); // Red warning at player's current position

    for (let i = 0; i < numProjectiles; i++) {
      setTimeout(() => {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let directionX = 0;
        let directionY = 0;
        if (distance > 0) {
          directionX = dx / distance;
          directionY = dy / distance;
        }

        const projectile = new Projectile(
          this.x, this.y, projectileRadius, projectileSpeed, projectileDamage,
          directionX, directionY, 'red', projectileLifetime, undefined
        );
        this.onAddBossProjectile(projectile);
        this.soundManager.playSound('projectile_fire', false, 0.5);
      }, 500 + i * delayBetweenShots * 1000); // Delay for visual and staggered shots
    }
  }

  private performGroundSlamAttack(player: Player) {
    // console.log(`${this.bossName} performs Ground Slam Attack!`); // Removed for optimization
    const attackRadius = this.size * (2 + this.phase * 0.5);
    const attackDamage = 20 + this.phase * 10;
    const telegraphDuration = 1.0; // Time for player to react

    // Telegraph the attack with a growing red circle
    this.onAddBossAttackVisual(new BossAttackVisual(this.x, this.y, attackRadius, telegraphDuration, 'rgba(255, 0, 0, 0.3)'));

    setTimeout(() => {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < attackRadius + player.size / 2) {
        player.takeDamage(attackDamage);
      }
      this.soundManager.playSound('explosion', false, 0.7);
    }, telegraphDuration * 1000); // Damage applies after the telegraph duration
  }

  getBossName(): string {
    return this.bossName;
  }
}