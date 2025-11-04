import { HomingMissile } from './HomingMissile';
import { Enemy } from './Enemy';
import { SoundManager } from './SoundManager';

export class HomingMissileWeapon {
  missiles: HomingMissile[];
  private baseDamage: number;
  private missileSpeed: number;
  private fireRate: number;
  private lastFireTime: number;
  public missileRadius: number;
  private missileLifetime: number;
  private missileSprite: HTMLImageElement | undefined;
  private soundManager: SoundManager;
  private numMissilesPerShot: number; // New: Number of missiles fired per shot

  constructor(baseDamage: number, missileSpeed: number, fireRate: number, missileRadius: number, missileLifetime: number, missileSprite: HTMLImageElement | undefined, soundManager: SoundManager, numMissilesPerShot: number = 1) {
    this.missiles = [];
    this.baseDamage = baseDamage;
    this.missileSpeed = missileSpeed;
    this.fireRate = fireRate;
    this.lastFireTime = 0;
    this.missileRadius = missileRadius;
    this.missileLifetime = missileLifetime;
    this.missileSprite = missileSprite;
    this.soundManager = soundManager;
    this.numMissilesPerShot = numMissilesPerShot;
  }

  update(deltaTime: number, playerX: number, playerY: number, enemies: Enemy[]) {
    this.lastFireTime += deltaTime;

    if (this.lastFireTime >= this.fireRate && enemies.length > 0) {
      this.lastFireTime = 0;

      for (let i = 0; i < this.numMissilesPerShot; i++) {
        // Find a target for each missile
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
          this.missiles.push(
            new HomingMissile(
              playerX,
              playerY,
              this.missileRadius,
              this.missileSpeed,
              this.baseDamage,
              closestEnemy, // Pass the target enemy
              this.missileLifetime,
              this.missileSprite
            )
          );
          this.soundManager.playSound('homing_missile_fire');
        }
      }
    }

    // Missile güncelleme ve filtreleme CollisionManager'a taşındı
    // this.missiles = this.missiles.filter(missile => { ... });
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    for (const missile of this.missiles) {
      missile.draw(ctx, cameraX, cameraY);
    }
  }

  increaseDamage(amount: number) {
    this.baseDamage += amount;
    console.log(`Homing missile weapon damage increased to ${this.baseDamage}`);
  }

  decreaseFireRate(amount: number) {
    this.fireRate = Math.max(0.1, this.fireRate - amount);
    console.log(`Homing missile weapon fire rate decreased to ${this.fireRate} seconds`);
  }

  increaseMissilesPerShot(amount: number) {
    this.numMissilesPerShot += amount;
    console.log(`Homing missile weapon now fires ${this.numMissilesPerShot} missiles per shot`);
  }
}