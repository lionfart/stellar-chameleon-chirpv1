import { Projectile } from './Projectile';
import { Enemy } from './Enemy';

export class ProjectileWeapon {
  projectiles: Projectile[];
  private baseDamage: number;
  private projectileSpeed: number;
  private fireRate: number;
  private lastFireTime: number;
  public projectileRadius: number; // Changed to public
  private projectileLifetime: number;
  private projectileSprite: HTMLImageElement | undefined; // New: Projectile sprite

  constructor(baseDamage: number, projectileSpeed: number, fireRate: number, projectileRadius: number, projectileLifetime: number, projectileSprite: HTMLImageElement | undefined) {
    this.projectiles = [];
    this.baseDamage = baseDamage;
    this.projectileSpeed = projectileSpeed;
    this.fireRate = fireRate;
    this.lastFireTime = 0;
    this.projectileRadius = projectileRadius;
    this.projectileLifetime = projectileLifetime;
    this.projectileSprite = projectileSprite;
  }

  update(deltaTime: number, playerX: number, playerY: number, enemies: Enemy[]) {
    this.lastFireTime += deltaTime;

    if (this.lastFireTime >= this.fireRate && enemies.length > 0) {
      this.lastFireTime = 0;

      let closestEnemy: Enemy | null = null;
      let minDistance = Infinity;

      for (const enemy of enemies) {
        if (enemy.isAlive()) {
          const dx = playerX - enemy.x;
          const dy = playerY - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < minDistance) {
            minDistance = distance;
            closestEnemy = enemy;
          }
        }
      }

      if (closestEnemy) {
        const dx = closestEnemy.x - playerX;
        const dy = closestEnemy.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          const directionX = dx / distance;
          const directionY = dy / distance;

          this.projectiles.push(
            new Projectile(
              playerX,
              playerY,
              this.projectileRadius,
              this.projectileSpeed,
              this.baseDamage,
              directionX,
              directionY,
              'cyan',
              this.projectileLifetime,
              this.projectileSprite // Pass the sprite
            )
          );
        }
      }
    }

    this.projectiles = this.projectiles.filter(projectile => {
      const isAlive = projectile.update(deltaTime);
      if (!isAlive) return false;

      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (enemy.isAlive() && projectile.collidesWith(enemy)) {
          enemy.takeDamage(projectile.damage);
          return false;
        }
      }
      return true;
    });
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    for (const projectile of this.projectiles) {
      projectile.draw(ctx, cameraX, cameraY);
    }
  }

  increaseDamage(amount: number) {
    this.baseDamage += amount;
    console.log(`Projectile weapon damage increased to ${this.baseDamage}`);
  }

  decreaseFireRate(amount: number) {
    this.fireRate = Math.max(0.1, this.fireRate - amount);
    console.log(`Projectile weapon fire rate decreased to ${this.fireRate} seconds`);
  }
}