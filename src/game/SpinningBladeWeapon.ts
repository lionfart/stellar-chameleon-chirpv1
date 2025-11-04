import { SpinningBlade } from './SpinningBlade';
import { Enemy } from './Enemy';
import { SoundManager } from './SoundManager'; // Import SoundManager

export class SpinningBladeWeapon {
  blades: SpinningBlade[];
  private baseDamage: number;
  private orbitDistance: number;
  private rotationSpeed: number;
  public bladeRadius: number;
  private numBlades: number;
  public attackCooldown: number; // Public yapıldı
  public lastHitTime: Map<string, number>; // Public yapıldı
  private bladeSprite: HTMLImageElement | undefined;
  private soundManager: SoundManager; // New: SoundManager instance

  constructor(baseDamage: number, orbitDistance: number, rotationSpeed: number, bladeRadius: number, numBlades: number, bladeSprite: HTMLImageElement | undefined, soundManager: SoundManager) {
    this.baseDamage = baseDamage;
    this.orbitDistance = orbitDistance;
    this.rotationSpeed = rotationSpeed;
    this.bladeRadius = bladeRadius;
    this.numBlades = numBlades;
    this.attackCooldown = 0.2;
    this.lastHitTime = new Map();
    this.bladeSprite = bladeSprite;
    this.soundManager = soundManager; // Assign SoundManager
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

  update(deltaTime: number, playerX: number, playerY: number) { // enemies parametresi kaldırıldı
    this.blades.forEach(blade => {
      blade.update(deltaTime, playerX, playerY);
      // Çarpışma mantığı CollisionManager'a taşındı
    });
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