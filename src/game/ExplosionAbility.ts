import { Explosion } from './Explosion';
import { Enemy } from './Enemy';
import { SoundManager } from './SoundManager'; // Import SoundManager

export class ExplosionAbility {
  explosions: Explosion[];
  private baseDamage: number;
  private radius: number;
  private cooldown: number; // seconds
  private currentCooldown: number;
  private soundManager: SoundManager; // New: SoundManager instance

  constructor(baseDamage: number, radius: number, cooldown: number, soundManager: SoundManager) {
    this.explosions = [];
    this.baseDamage = baseDamage;
    this.radius = radius;
    this.cooldown = cooldown;
    this.currentCooldown = 0;
    this.soundManager = soundManager; // Assign SoundManager
  }

  update(deltaTime: number, enemies: Enemy[]) {
    if (this.currentCooldown > 0) {
      this.currentCooldown -= deltaTime;
    }

    this.explosions = this.explosions.filter(explosion => {
      explosion.dealDamage(enemies); // Deal damage when explosion is active
      return explosion.update(deltaTime); // Remove if visual duration is over
    });
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    this.explosions.forEach(explosion => {
      explosion.draw(ctx, cameraX, cameraY);
    });
  }

  triggerExplosion(playerX: number, playerY: number): boolean {
    if (this.currentCooldown <= 0) {
      this.explosions.push(new Explosion(playerX, playerY, this.radius, this.baseDamage));
      this.currentCooldown = this.cooldown;
      this.soundManager.playSound('explosion'); // Play explosion sound
      console.log("Explosion triggered!");
      return true;
    }
    return false;
  }

  increaseDamage(amount: number) {
    this.baseDamage += amount;
    console.log(`Explosion damage increased to ${this.baseDamage}`);
  }

  reduceCooldown(amount: number) {
    this.cooldown = Math.max(0.5, this.cooldown - amount); // Minimum cooldown of 0.5 seconds
    console.log(`Explosion cooldown reduced to ${this.cooldown} seconds`);
  }

  increaseRadius(amount: number) {
    this.radius += amount;
    console.log(`Explosion radius increased to ${this.radius}`);
  }

  // Getters for HUD
  getCooldownCurrent(): number {
    return this.currentCooldown;
  }

  getCooldownMax(): number {
    return this.cooldown;
  }
}