import { GameState } from './GameState';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { HomingMissile } from './HomingMissile';
import { SpinningBlade } from './SpinningBlade';
import { Explosion } from './Explosion';

export class CollisionManager {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  updateCollisions(deltaTime: number) {
    // Player-Enemy collisions
    this.gameState.enemies.forEach(enemy => {
      if (this.gameState.player.collidesWith(enemy)) {
        this.gameState.player.takeDamage(5); // Player takes damage from touching enemies
      }
    });

    // Projectile-Enemy collisions (Player's projectiles)
    if (this.gameState.projectileWeapon) {
      this.gameState.projectileWeapon.projectiles = this.gameState.projectileWeapon.projectiles.filter(projectile => {
        const isAlive = projectile.update(deltaTime);
        if (!isAlive) return false;

        for (let i = 0; i < this.gameState.enemies.length; i++) {
          const enemy = this.gameState.enemies[i];
          if (enemy.isAlive() && projectile.collidesWith(enemy)) {
            enemy.takeDamage(projectile.damage);
            return false; // Remove projectile after hitting enemy
          }
        }
        return true;
      });
    }

    // Homing Missile-Enemy collisions
    if (this.gameState.homingMissileWeapon) {
      this.gameState.homingMissileWeapon.missiles = this.gameState.homingMissileWeapon.missiles.filter(missile => {
        const isAlive = missile.update(deltaTime, this.gameState.enemies);
        if (!isAlive) return false;

        for (let i = 0; i < this.gameState.enemies.length; i++) {
          const enemy = this.gameState.enemies[i];
          if (enemy.isAlive() && missile.collidesWith(enemy)) {
            enemy.takeDamage(missile.damage);
            return false; // Remove missile after hitting enemy
          }
        }
        return true;
      });
    }

    // Spinning Blade-Enemy collisions
    if (this.gameState.spinningBladeWeapon) {
      this.gameState.spinningBladeWeapon.blades.forEach(blade => {
        for (const enemy of this.gameState.enemies) {
          if (enemy.isAlive() && blade.collidesWith(enemy)) {
            const hitKey = `${enemy.x}_${enemy.y}_${blade.angle}`;
            const currentTime = performance.now() / 1000;

            // Implement cooldown for blade hits to prevent multiple hits per frame
            if (!this.gameState.spinningBladeWeapon?.lastHitTime.has(hitKey) || (currentTime - this.gameState.spinningBladeWeapon?.lastHitTime.get(hitKey)! > this.gameState.spinningBladeWeapon?.attackCooldown)) {
              enemy.takeDamage(blade.damage);
              this.gameState.spinningBladeWeapon?.lastHitTime.set(hitKey, currentTime);
            }
          }
        }
      });
      // Clean up old hit times
      const currentTime = performance.now() / 1000;
      if (this.gameState.spinningBladeWeapon) {
        for (const [key, time] of this.gameState.spinningBladeWeapon.lastHitTime.entries()) {
          if (currentTime - time > this.gameState.spinningBladeWeapon.attackCooldown * 2) {
            this.gameState.spinningBladeWeapon.lastHitTime.delete(key);
          }
        }
      }
    }

    // Explosion-Enemy collisions
    if (this.gameState.explosionAbility) {
      this.gameState.explosionAbility.explosions = this.gameState.explosionAbility.explosions.filter(explosion => {
        explosion.dealDamage(this.gameState.enemies);
        return explosion.update(deltaTime);
      });
    }

    // Shooter Enemy Projectile-Player collisions
    this.gameState.enemies.forEach(enemy => {
      if (enemy instanceof Enemy && 'projectiles' in enemy) { // Check if it's a ShooterEnemy or similar
        (enemy as any).projectiles = (enemy as any).projectiles.filter((projectile: Projectile) => {
          const isAlive = projectile.update(deltaTime);
          if (!isAlive) return false;

          if (projectile.collidesWith(this.gameState.player)) {
            this.gameState.player.takeDamage(projectile.damage);
            return false; // Remove projectile after hitting player
          }
          return true;
        });
      }
    });
  }
}