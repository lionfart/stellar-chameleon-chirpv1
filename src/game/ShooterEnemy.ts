import { Enemy } from './Enemy';
import { Player } from './Player';
import { Projectile } from './Projectile';
import { SoundManager } from './SoundManager';
import { DamageNumber } from './DamageNumber';

export class ShooterEnemy extends Enemy {
  private projectiles: Projectile[];
  private projectileSpeed: number;
  private fireRate: number;
  private lastFireTime: number;
  private projectileDamage: number;
  private projectileRadius: number;
  private projectileLifetime: number;
  private projectileSprite: HTMLImageElement | undefined;

  constructor(
    x: number, y: number, size: number, speed: number, color: string, maxHealth: number,
    sprite: HTMLImageElement | undefined, soundManager: SoundManager, goldDrop: number,
    onTakeDamage: (x: number, y: number, damage: number) => void,
    projectileSpeed: number, fireRate: number, projectileDamage: number, projectileRadius: number, projectileLifetime: number,
    projectileSprite: HTMLImageElement | undefined
  ) {
    super(x, y, size, speed, color, maxHealth, sprite, soundManager, goldDrop, onTakeDamage);
    this.projectiles = [];
    this.projectileSpeed = projectileSpeed;
    this.fireRate = fireRate;
    this.lastFireTime = 0;
    this.projectileDamage = projectileDamage;
    this.projectileRadius = projectileRadius;
    this.projectileLifetime = projectileLifetime;
    this.projectileSprite = projectileSprite;
  }

  update(deltaTime: number, player: Player, separationVector: { x: number, y: number } = { x: 0, y: 0 }) {
    super.update(deltaTime, player, separationVector); // Call super's update for movement and animation

    if (!this.isAlive()) {
      this.projectiles = [];
      return;
    }

    this.lastFireTime += deltaTime;

    if (this.lastFireTime >= this.fireRate && player.isAlive()) {
      this.lastFireTime = 0;

      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        const directionX = dx / distance;
        const directionY = dy / distance;

        this.projectiles.push(
          new Projectile(
            this.x,
            this.y,
            this.projectileRadius,
            this.projectileSpeed,
            this.projectileDamage,
            directionX,
            directionY,
            'red',
            this.projectileLifetime,
            this.projectileSprite
          )
        );
        this.soundManager.playSound('projectile_fire', false, 0.3);
      }
    }

    this.projectiles = this.projectiles.filter(projectile => {
      const isAlive = projectile.update(deltaTime);
      if (!isAlive) return false;

      if (projectile.collidesWith(player)) {
        player.takeDamage(projectile.damage);
        return false;
      }
      return true;
    });
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    super.draw(ctx, cameraX, cameraY); // Call super's draw for enemy body and health bar

    this.projectiles.forEach(projectile => {
      projectile.draw(ctx, cameraX, cameraY);
    });
  }
}