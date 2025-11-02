import { SpinningBlade } from './SpinningBlade';
import { Enemy } from './Enemy';

export class SpinningBladeWeapon {
  blades: SpinningBlade[];
  private baseDamage: number;
  private orbitDistance: number;
  private rotationSpeed: number;
  public bladeRadius: number; // Changed to public
  private numBlades: number;
  private attackCooldown: number;
  private lastHitTime: Map<string, number>;
  private bladeSprite: HTMLImageElement | undefined; // New: Blade sprite

  constructor(baseDamage: number, orbitDistance: number, rotationSpeed: number, bladeRadius: number, numBlades: number, bladeSprite: HTMLImageElement | undefined) {
    this.baseDamage = baseDamage;
    this.orbitDistance = orbitDistance;
    this.rotationSpeed = rotationSpeed;
    this.bladeRadius = bladeRadius;
    this.numBlades = numBlades;
    this.attackCooldown = 0.2;
    this.lastHitTime = new Map();
    this.bladeSprite = bladeSprite;
    this.blades = this.createBlades();
  }

  private createBlades(): SpinningBlade[] {
    const newBlades: SpinningBlade[] = [];
    for (let i = 0; i < this.numBlades; i++) {
      const angle = (Math.PI * 2 / this.numBlades) * i;
      newBlades.push(new SpinningBlade(this.orbitDistance, this.rotationSpeed, this.baseDamage, this.bladeRadius, angle, this.bladeSprite));
    }
    return newBlades;
  }

  update(deltaTime: number, playerX: number, playerY: number, enemies: Enemy[]) {
    this.blades.forEach(blade => {
      blade.update(deltaTime, playerX, playerY);

      for (const enemy of enemies) {
        if (enemy.isAlive() && blade.collidesWith(enemy)) {
          const hitKey = `${enemy.x}_${enemy.y}_${blade.angle}`;
          const currentTime = performance.now() / 1000;

          if (!this.lastHitTime.has(hitKey) || (currentTime - this.lastHitTime.get(hitKey)! > this.attackCooldown)) {
            enemy.takeDamage(blade.damage);
            this.lastHitTime.set(hitKey, currentTime);
          }
        }
      }
    });

    const currentTime = performance.now() / 1000;
    for (const [key, time] of this.lastHitTime.entries()) {
      if (currentTime - time > this.attackCooldown * 2) {
        this.lastHitTime.delete(key);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    this.blades.forEach(blade => {
      blade.draw(ctx, cameraX, cameraY);
    });
  }

  increaseDamage(amount: number) {
    this.baseDamage += amount;
    this.blades.forEach(blade => blade.damage = this.baseDamage);
    console.log(`Spinning blade damage increased to ${this.baseDamage}`);
  }

  addBlade() {
    this.numBlades++;
    this.blades = this.createBlades();
    console.log(`Added a spinning blade. Total blades: ${this.numBlades}`);
  }
}