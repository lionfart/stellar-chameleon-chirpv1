import { Enemy } from './Enemy';
import { SoundManager } from './SoundManager';

export class TimeSlowAbility {
  private slowFactor: number; // e.g., 0.3 means 30% speed (70% slow)
  private duration: number; // seconds
  private cooldown: number; // seconds
  private currentCooldown: number;
  private currentDuration: number;
  private isActive: boolean; // Track if the ability is currently active
  private soundManager: SoundManager;

  constructor(slowFactor: number, duration: number, cooldown: number, soundManager: SoundManager) {
    this.slowFactor = slowFactor;
    this.duration = duration;
    this.cooldown = cooldown;
    this.currentCooldown = 0;
    this.currentDuration = 0;
    this.isActive = false;
    this.soundManager = soundManager;
  }

  update(deltaTime: number, enemies: Enemy[]) {
    if (this.currentCooldown > 0) {
      this.currentCooldown -= deltaTime;
    }

    if (this.isActive) {
      this.currentDuration -= deltaTime;
      if (this.currentDuration <= 0) {
        this.deactivate(enemies);
      }
    }
  }

  triggerSlow(enemies: Enemy[]): boolean {
    if (this.currentCooldown <= 0 && !this.isActive) {
      this.isActive = true;
      this.currentDuration = this.duration;
      this.currentCooldown = this.cooldown;
      this.applySlowEffect(enemies);
      this.soundManager.playSound('time_slow_activate');
      console.log(`Time Slow activated! Enemies slowed by ${this.slowFactor * 100}% for ${this.duration}s.`);
      return true;
    }
    return false;
  }

  private applySlowEffect(enemies: Enemy[]) {
    enemies.forEach(enemy => {
      enemy.speed *= this.slowFactor;
    });
  }

  private deactivate(enemies: Enemy[]) {
    this.isActive = false;
    // Restore enemy speeds
    enemies.forEach(enemy => {
      enemy.speed /= this.slowFactor;
    });
    this.soundManager.playSound('time_slow_deactivate');
    console.log("Time Slow deactivated. Enemy speeds restored.");
  }

  increaseSlowFactor(amount: number) {
    this.slowFactor = Math.max(0.05, this.slowFactor - amount); // Make enemies even slower, min 5% speed
    console.log(`Time Slow factor increased (enemies slower) to ${this.slowFactor}`);
  }

  increaseDuration(amount: number) {
    this.duration += amount;
    console.log(`Time Slow duration increased to ${this.duration}s`);
  }

  reduceCooldown(amount: number) {
    this.cooldown = Math.max(5, this.cooldown - amount); // Minimum cooldown of 5 seconds
    console.log(`Time Slow cooldown reduced to ${this.cooldown}s`);
  }

  getCooldownCurrent(): number {
    return this.currentCooldown;
  }

  getCooldownMax(): number {
    return this.cooldown;
  }

  getIsActive(): boolean {
    return this.isActive;
  }
}