import { Player } from './Player';
import { SoundManager } from './SoundManager';

export class HealAbility {
  private healAmount: number; // Amount of health to restore
  private cooldown: number; // seconds
  private currentCooldown: number;
  private soundManager: SoundManager;

  constructor(healAmount: number, cooldown: number, soundManager: SoundManager) {
    this.healAmount = healAmount;
    this.cooldown = cooldown;
    this.currentCooldown = 0;
    this.soundManager = soundManager;
  }

  update(deltaTime: number) {
    if (this.currentCooldown > 0) {
      this.currentCooldown -= deltaTime;
    }
  }

  triggerHeal(player: Player): boolean {
    if (this.currentCooldown <= 0 && player.currentHealth < player.maxHealth) {
      player.currentHealth = Math.min(player.maxHealth, player.currentHealth + this.healAmount);
      this.currentCooldown = this.cooldown;
      this.soundManager.playSound('shield_activate'); // Re-using shield activate sound for heal for now
      player.lastHealTime = performance.now() / 1000; // NEW: Update player's lastHealTime
      console.log(`Player healed for ${this.healAmount}. Current health: ${player.currentHealth}`);
      return true;
    }
    return false;
  }

  increaseHealAmount(amount: number) {
    this.healAmount += amount;
    console.log(`Heal amount increased to ${this.healAmount}`);
  }

  reduceCooldown(amount: number) {
    this.cooldown = Math.max(1, this.cooldown - amount); // Minimum cooldown of 1 second
    console.log(`Heal cooldown reduced to ${this.cooldown} seconds`);
  }

  getCooldownCurrent(): number {
    return this.currentCooldown;
  }

  getCooldownMax(): number {
    return this.cooldown;
  }
}