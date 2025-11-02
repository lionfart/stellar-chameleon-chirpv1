import { InputHandler } from './InputHandler';
import { clamp } from './utils';
import { ShieldAbility } from './ShieldAbility';
import { SoundManager } from './SoundManager'; // Import SoundManager

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
  private onLevelUpCallback: () => void;
  private shieldAbility: ShieldAbility | null = null;
  private sprite: HTMLImageElement | undefined;
  private soundManager: SoundManager; // New: SoundManager instance
  private hitTimer: number = 0; // For hit animation

  // Dash properties
  private dashSpeedMultiplier: number = 2.5;
  private dashDuration: number = 0.15;
  private dashCooldown: number = 2;
  private isDashing: boolean = false;
  private currentDashCooldown: number = 0;
  private currentDashDuration: number = 0;
  private dashTrail: { x: number; y: number; alpha: number; size: number }[] = []; // For dash visual effect

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
    this.onLevelUpCallback = onLevelUp;
    this.sprite = sprite;
    this.soundManager = soundManager; // Assign SoundManager
  }

  setSprite(sprite: HTMLImageElement | undefined) {
    this.sprite = sprite;
  }

  setShieldAbility(shieldAbility: ShieldAbility) {
    this.shieldAbility = shieldAbility;
  }

  update(input: InputHandler, deltaTime: number, worldWidth: number, worldHeight: number) {
    if (!this.isAlive()) return;

    // Update dash cooldown
    if (this.currentDashCooldown > 0) {
      this.currentDashCooldown -= deltaTime;
    }

    // Update hit animation timer
    if (this.hitTimer > 0) {
      this.hitTimer -= deltaTime;
    }

    // Check for dash input
    if (input.isPressed('shift') && !this.isDashing && this.currentDashCooldown <= 0) {
      this.isDashing = true;
      this.currentDashDuration = this.dashDuration;
      this.currentDashCooldown = this.dashCooldown;
      this.soundManager.playSound('dash'); // Play dash sound
      console.log("Dash activated!");
    }

    // Check for shield activation input (e.g., 'q' key)
    if (input.isPressed('q') && this.shieldAbility) {
      if (this.shieldAbility.shield.isActive) {
        this.shieldAbility.deactivateShield();
      } else {
        this.shieldAbility.activateShield();
      }
    }

    let moveAmount = this.speed * deltaTime;

    // Apply dash speed multiplier if dashing
    if (this.isDashing) {
      moveAmount *= this.dashSpeedMultiplier;
      this.currentDashDuration -= deltaTime;
      // Add to dash trail
      this.dashTrail.push({ x: this.x, y: this.y, alpha: 1, size: this.size });
      if (this.currentDashDuration <= 0) {
        this.isDashing = false;
        console.log("Dash ended.");
      }
    }

    // Update dash trail
    this.dashTrail = this.dashTrail.filter(trail => {
      trail.alpha -= deltaTime * 3; // Fade out faster
      trail.size -= deltaTime * 50; // Shrink faster
      return trail.alpha > 0 && trail.size > 0;
    });


    if (input.isPressed('w') || input.isPressed('arrowup')) {
      this.y -= moveAmount;
    }
    if (input.isPressed('s') || input.isPressed('arrowdown')) {
      this.y += moveAmount;
    }
    if (input.isPressed('a') || input.isPressed('arrowleft')) {
      this.x -= moveAmount;
    }
    if (input.isPressed('d') || input.isPressed('arrowright')) {
      this.x += moveAmount;
    }

    this.x = clamp(this.x, this.size / 2, worldWidth - this.size / 2);
    this.y = clamp(this.y, this.size / 2, worldHeight - this.size / 2);
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    // Draw dash trail
    this.dashTrail.forEach(trail => {
      ctx.save();
      ctx.globalAlpha = trail.alpha;
      ctx.fillStyle = 'rgba(0, 255, 255, 0.5)'; // Cyan trail
      ctx.beginPath();
      ctx.arc(trail.x - cameraX, trail.y - cameraY, trail.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.save();
    ctx.translate(this.x - cameraX, this.y - cameraY);

    // Apply hit flash effect
    if (this.hitTimer > 0) {
      ctx.filter = 'brightness(200%) hue-rotate(180deg)'; // Make it brighter and redder
    }

    if (this.sprite) {
      ctx.drawImage(this.sprite, -this.size / 2, -this.size / 2, this.size, this.size);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // Restore context to remove filter

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
      this.hitTimer = 0.15; // Set hit flash duration
      if (this.currentHealth < 0) {
        this.currentHealth = 0;
      }
      console.log(`Player took ${remainingDamage} damage. Health: ${this.currentHealth}`);
    } else {
      console.log(`Shield absorbed ${amount} damage.`);
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
    this.experience += amount;
    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
    this.onLevelUpCallback(); // Trigger the callback to show the level-up screen and play sound
  }

  increaseSpeed(amount: number) {
    this.speed += amount;
    console.log(`Player speed increased to ${this.speed}`);
  }

  increaseMaxHealth(amount: number) {
    this.maxHealth += amount;
    this.currentHealth = this.maxHealth;
    console.log(`Player max health increased to ${this.maxHealth}`);
  }

  reduceDashCooldown(amount: number) {
    this.dashCooldown = Math.max(0.5, this.dashCooldown - amount);
    console.log(`Dash cooldown reduced to ${this.dashCooldown} seconds`);
  }
}