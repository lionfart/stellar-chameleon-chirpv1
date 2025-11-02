import { InputHandler } from './InputHandler';
import { clamp } from './utils';
import { ShieldAbility } from './ShieldAbility'; // Import ShieldAbility

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
  private shieldAbility: ShieldAbility | null = null; // Reference to the shield ability

  // Dash properties
  private dashSpeedMultiplier: number = 2.5; // How much faster the player moves during a dash
  private dashDuration: number = 0.15; // How long the dash lasts in seconds
  private dashCooldown: number = 2; // How long until the dash can be used again in seconds
  private isDashing: boolean = false;
  private currentDashCooldown: number = 0;
  private currentDashDuration: number = 0;

  constructor(x: number, y: number, size: number, speed: number, color: string, maxHealth: number, onLevelUp: () => void) {
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

    // Check for dash input
    if (input.isPressed('shift') && !this.isDashing && this.currentDashCooldown <= 0) {
      this.isDashing = true;
      this.currentDashDuration = this.dashDuration;
      this.currentDashCooldown = this.dashCooldown; // Start cooldown immediately
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
      if (this.currentDashDuration <= 0) {
        this.isDashing = false;
        console.log("Dash ended.");
      }
    }

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
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y - cameraY, this.size / 2, 0, Math.PI * 2);
    ctx.fill();

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
    this.onLevelUpCallback(); // Trigger the callback to show the level-up screen
  }

  increaseSpeed(amount: number) {
    this.speed += amount;
    console.log(`Player speed increased to ${this.speed}`);
  }

  increaseMaxHealth(amount: number) {
    this.maxHealth += amount;
    this.currentHealth = this.maxHealth; // Heal to full on health upgrade
    console.log(`Player max health increased to ${this.maxHealth}`);
  }

  reduceDashCooldown(amount: number) {
    this.dashCooldown = Math.max(0.5, this.dashCooldown - amount); // Minimum cooldown of 0.5 seconds
    console.log(`Dash cooldown reduced to ${this.dashCooldown} seconds`);
  }
}