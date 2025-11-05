import { InputHandler } from './InputHandler';
import { clamp } from './utils';
import { ShieldAbility } from './ShieldAbility';
import { HealAbility } from './HealAbility';
import { ExplosionAbility } from './ExplosionAbility';
import { SoundManager } from './SoundManager';
import { TimeSlowAbility } from './TimeSlowAbility';
import { Enemy } from './Enemy';
import { LaserBeamWeapon } from './LaserBeamWeapon';

export class Player {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  maxHealth: number;
  currentHealth: number;
  experience: number;
  level: number;
  experienceToNextLevel: number;
  gold: number;
  private onLevelUpCallback: () => void;
  private shieldAbility: ShieldAbility | null = null;
  private healAbility: HealAbility | null = null;
  private explosionAbility: ExplosionAbility | null = null;
  private timeSlowAbility: TimeSlowAbility | null = null;
  private sprite: HTMLImageElement | undefined; // Single sprite for fallback/initial
  private soundManager: SoundManager;
  private hitTimer: number = 0;
  lastHealTime: number = 0;

  // Animation properties
  private animationFrames: HTMLImageElement[] = []; // Array of sprites for animation
  private currentFrameIndex: number = 0;
  private animationTimer: number = 0;
  private animationSpeed: number = 0.15; // seconds per frame
  private isMoving: boolean = false;

  // Dash properties
  private dashSpeedMultiplier: number = 2.5;
  private dashDuration: number = 0.15;
  private dashCooldown: number = 2;
  private isDashing: boolean = false;
  private currentDashCooldown: number = 0;
  private currentDashDuration: number = 0;
  private dashTrail: { x: number; y: number; alpha: number; size: number }[] = [];

  // New player properties for upgrades
  baseMagnetRadius: number;
  experienceMultiplier: number;
  goldMultiplier: number;

  constructor(x: number, y: number, size: number, speed: number, color: string, maxHealth: number, onLevelUp: () => void, sprite: HTMLImageElement | undefined, soundManager: SoundManager) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.color = color;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.experience = 0;
    this.level = 1;
    this.experienceToNextLevel = 100;
    this.gold = 0;
    this.onLevelUpCallback = onLevelUp;
    this.sprite = sprite; // Fallback or initial sprite
    this.soundManager = soundManager;
    this.baseMagnetRadius = 50;
    this.experienceMultiplier = 1;
    this.goldMultiplier = 1;
  }

  // Updated setSprite to accept an array of sprites for animation
  setSprite(sprites: HTMLImageElement[]) {
    this.animationFrames = sprites;
    this.sprite = sprites[0]; // Keep first frame as a fallback/default
  }

  setShieldAbility(shieldAbility: ShieldAbility) {
    this.shieldAbility = shieldAbility;
  }

  setHealAbility(healAbility: HealAbility) {
    this.healAbility = healAbility;
  }

  setExplosionAbility(explosionAbility: ExplosionAbility) {
    this.explosionAbility = explosionAbility;
  }

  setTimeSlowAbility(timeSlowAbility: TimeSlowAbility) {
    this.timeSlowAbility = timeSlowAbility;
  }

  update(input: InputHandler, deltaTime: number, worldWidth: number, worldHeight: number) {
    if (!this.isAlive()) return;

    if (this.currentDashCooldown > 0) {
      this.currentDashCooldown -= deltaTime;
    }

    if (this.hitTimer > 0) {
      this.hitTimer -= deltaTime;
    }

    let movedX = 0;
    let movedY = 0;

    if (input.isPressed('shift') && !this.isDashing && this.currentDashCooldown <= 0) {
      this.isDashing = true;
      this.currentDashDuration = this.dashDuration;
      this.currentDashCooldown = this.dashCooldown;
      this.soundManager.playSound('dash');
      // console.log("Dash activated!"); // Removed for optimization
    }

    let currentSpeed = this.speed;
    if (this.isDashing) {
      currentSpeed *= this.dashSpeedMultiplier;
      this.currentDashDuration -= deltaTime;
      this.dashTrail.push({ x: this.x, y: this.y, alpha: 1, size: this.size });
      if (this.currentDashDuration <= 0) {
        this.isDashing = false;
        // console.log("Dash ended."); // Removed for optimization
      }
    }

    this.dashTrail = this.dashTrail.filter(trail => {
      trail.alpha -= deltaTime * 3;
      trail.size -= deltaTime * 50;
      return trail.alpha > 0 && trail.size > 0;
    });

    if (input.isPressed('w') || input.isPressed('arrowup')) {
      movedY -= currentSpeed * deltaTime;
    }
    if (input.isPressed('s') || input.isPressed('arrowdown')) {
      movedY += currentSpeed * deltaTime;
    }
    if (input.isPressed('a') || input.isPressed('arrowleft')) {
      movedX -= currentSpeed * deltaTime;
    }
    if (input.isPressed('d') || input.isPressed('arrowright')) {
      movedX += currentSpeed * deltaTime;
    }

    this.x += movedX;
    this.y += movedY;

    this.x = clamp(this.x, this.size / 2, worldWidth - this.size / 2);
    this.y = clamp(this.y, this.size / 2, worldHeight - this.size / 2);

    this.isMoving = (movedX !== 0 || movedY !== 0);

    // Animation update
    if (this.animationFrames.length > 1) { // Only animate if there are multiple frames
      if (this.isMoving) {
        this.animationTimer += deltaTime;
        if (this.animationTimer >= this.animationSpeed) {
          this.currentFrameIndex = (this.currentFrameIndex + 1) % this.animationFrames.length;
          this.animationTimer = 0;
        }
      } else {
        this.currentFrameIndex = 0; // Reset to idle frame
        this.animationTimer = 0;
      }
    }
  }

  handleAbilityInput(input: InputHandler, enemies: Enemy[]) {
    if (input.isPressed('q') && this.shieldAbility) {
      if (this.shieldAbility.shield.isActive) {
        this.shieldAbility.deactivateShield();
      } else {
        this.shieldAbility.activateShield();
      }
    }

    if (input.isPressed('r') && this.healAbility) {
      this.healAbility.triggerHeal(this);
    }

    if (input.isPressed('e') && this.explosionAbility) {
      this.explosionAbility.triggerExplosion(this.x, this.y);
    }

    if (input.isPressed('t') && this.timeSlowAbility) {
      this.timeSlowAbility.triggerSlow(enemies);
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    this.dashTrail.forEach(trail => {
      ctx.save();
      ctx.globalAlpha = trail.alpha;
      ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(trail.x - cameraX, trail.y - cameraY, trail.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.save();
    ctx.translate(this.x - cameraX, this.y - cameraY);

    if (this.hitTimer > 0) {
      const hitAlpha = this.hitTimer / 0.15;
      ctx.filter = `brightness(${100 + hitAlpha * 100}%) hue-rotate(${hitAlpha * 180}deg)`;
    }

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    // Draw animated sprite if available, otherwise fallback to single sprite
    const currentSprite = this.animationFrames[this.currentFrameIndex] || this.sprite;
    if (currentSprite) {
      ctx.drawImage(currentSprite, -this.size / 2, -this.size / 2, this.size, this.size);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    const HEAL_EFFECT_DURATION = 0.5;
    const currentTime = performance.now() / 1000;
    if (this.lastHealTime > 0 && (currentTime - this.lastHealTime < HEAL_EFFECT_DURATION)) {
      ctx.save();
      const progress = (currentTime - this.lastHealTime) / HEAL_EFFECT_DURATION;
      const alpha = 1 - progress;
      const pulseRadius = this.size * (1 + progress * 0.5);

      ctx.strokeStyle = `rgba(0, 255, 0, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x - cameraX, this.y - cameraY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }


    const healthBarWidth = this.size * 1.5;
    const healthBarHeight = 5;
    const healthPercentage = this.currentHealth / this.maxHealth;

    ctx.fillStyle = 'gray';
    ctx.fillRect(this.x - cameraX - healthBarWidth / 2, this.y - cameraY - this.size / 2 - 10, healthBarWidth, healthBarHeight);
    ctx.fillStyle = 'lime';
    ctx.fillRect(this.x - cameraX - healthBarWidth / 2, this.y - cameraY - this.size / 2 - 10, healthBarWidth * healthPercentage, healthBarHeight);
  }

  takeDamage(amount: number) {
    let remainingDamage = amount;

    if (this.shieldAbility && this.shieldAbility.shield.isActive) {
      remainingDamage = this.shieldAbility.shield.takeDamage(amount);
    }

    if (remainingDamage > 0) {
      this.currentHealth -= remainingDamage;
      this.hitTimer = 0.15;
      this.soundManager.playSound('player_hit');
      if (this.currentHealth < 0) {
        this.currentHealth = 0;
      }
      // console.log(`Player took ${remainingDamage} damage. Health: ${this.currentHealth}`); // Removed for optimization
    } else {
      // console.log(`Shield absorbed ${amount} damage.`); // Removed for optimization
    }
  }

  isAlive(): boolean {
    return this.currentHealth > 0;
  }

  collidesWith(other: { x: number; y: number; size: number }): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.size / 2 + other.size / 2);
  }

  gainExperience(amount: number) {
    this.experience += amount * this.experienceMultiplier;
    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
    this.onLevelUpCallback();
  }

  gainGold(amount: number) {
    this.gold += amount * this.goldMultiplier;
    this.soundManager.playSound('gold_collect');
    // console.log(`Player gained ${amount} gold. Total: ${this.gold}`); // Removed for optimization
  }

  spendGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      // console.log(`Player spent ${amount} gold. Remaining: ${this.gold}`); // Removed for optimization
      return true;
    }
    // console.log(`Not enough gold to spend ${amount}. Current: ${this.gold}`); // Removed for optimization
    return false;
  }

  increaseSpeed(amount: number) {
    this.speed += amount;
    // console.log(`Player speed increased to ${this.speed}`); // Removed for optimization
  }

  increaseMaxHealth(amount: number) {
    this.maxHealth += amount;
    this.currentHealth = this.maxHealth;
    // console.log(`Player max health increased to ${this.maxHealth}`); // Removed for optimization
  }

  reduceDashCooldown(amount: number) {
    this.dashCooldown = Math.max(0.5, this.dashCooldown - amount);
    this.currentDashCooldown = Math.min(this.currentDashCooldown, this.dashCooldown);
    // console.log(`Dash cooldown reduced to ${this.dashCooldown} seconds`); // Removed for optimization
  }

  increaseMagnetRadius(amount: number) {
    this.baseMagnetRadius += amount;
    // console.log(`Player base magnet radius increased to ${this.baseMagnetRadius}`); // Removed for optimization
  }

  increaseExperienceGain(amount: number) {
    this.experienceMultiplier += amount;
    // console.log(`Player experience multiplier increased to ${this.experienceMultiplier}`); // Removed for optimization
  }

  increaseGoldGain(amount: number) {
    this.goldMultiplier += amount;
    // console.log(`Player gold multiplier increased to ${this.goldMultiplier}`); // Removed for optimization
  }

  getDashCooldownCurrent(): number {
    return this.currentDashCooldown;
  }

  getDashCooldownMax(): number {
    return this.dashCooldown;
  }

  getTimeSlowCooldownCurrent(): number {
    return this.timeSlowAbility?.getCooldownCurrent() || 0;
  }

  getTimeSlowCooldownMax(): number {
    return this.timeSlowAbility?.getCooldownMax() || 0;
  }
}