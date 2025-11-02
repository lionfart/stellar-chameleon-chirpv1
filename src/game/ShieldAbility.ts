import { Shield } from './Shield';
import { SoundManager } from './SoundManager'; // Import SoundManager

export class ShieldAbility {
  shield: Shield;
  private cooldown: number; // seconds
  private currentCooldown: number;
  private regenerationRate: number; // health per second
  private soundManager: SoundManager; // New: SoundManager instance

  constructor(initialRadius: number, initialMaxHealth: number, cooldown: number, regenerationRate: number, soundManager: SoundManager) {
    this.soundManager = soundManager; // Assign SoundManager
    this.shield = new Shield(initialRadius, initialMaxHealth, this.soundManager);
    this.cooldown = cooldown;
    this.currentCooldown = 0;
    this.regenerationRate = regenerationRate;
  }

  update(deltaTime: number, playerX: number, playerY: number) {
    this.shield.updatePosition(playerX, playerY);

    if (this.shield.isActive) {
      // Shield is active, no regeneration or cooldown
    } else {
      // Shield is not active
      if (this.currentCooldown > 0) {
        this.currentCooldown -= deltaTime;
      } else {
        // Regenerate shield health if not on cooldown and not active
        this.shield.regenerate(this.regenerationRate * deltaTime);
      }
    }

    // If shield health is full and not active, it's ready to be activated
    if (this.shield.currentHealth >= this.shield.maxHealth && !this.shield.isActive && this.currentCooldown <= 0) {
      // Optionally, automatically activate or just be ready
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    this.shield.draw(ctx, cameraX, cameraY);
  }

  activateShield(): boolean {
    if (!this.shield.isActive && this.currentCooldown <= 0 && this.shield.currentHealth > 0) {
      this.shield.activate();
      return true;
    }
    return false;
  }

  deactivateShield() {
    if (this.shield.isActive) {
      this.shield.deactivate();
      this.currentCooldown = this.cooldown; // Start cooldown after deactivation
    }
  }

  // Upgrades
  increaseMaxHealth(amount: number) {
    this.shield.increaseMaxHealth(amount);
  }

  increaseRegeneration(amount: number) {
    this.regenerationRate += amount;
    console.log(`Shield regeneration rate increased to ${this.regenerationRate}/s`);
  }

  reduceCooldown(amount: number) {
    this.cooldown = Math.max(0.5, this.cooldown - amount); // Minimum cooldown of 0.5 seconds
    console.log(`Shield cooldown reduced to ${this.cooldown} seconds`);
  }

  // Getters for HUD
  getCooldownCurrent(): number {
    return this.currentCooldown;
  }

  getCooldownMax(): number {
    return this.cooldown;
  }
}