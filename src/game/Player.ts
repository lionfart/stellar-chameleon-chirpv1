import { InputHandler } from './InputHandler';
import { clamp } from './utils';

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

  constructor(x: number, y: number, size: number, speed: number, color: string, maxHealth: number) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.color = color;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.experience = 0;
    this.level = 1;
    this.experienceToNextLevel = 100; // Initial experience needed for level 2
  }

  update(input: InputHandler, deltaTime: number, worldWidth: number, worldHeight: number) {
    if (!this.isAlive()) return; // Don't update if dead

    const moveAmount = this.speed * deltaTime;

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

    // Keep player within world bounds
    this.x = clamp(this.x, this.size / 2, worldWidth - this.size / 2);
    this.y = clamp(this.y, this.size / 2, worldHeight - this.size / 2);
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y - cameraY, this.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw health bar (simple rectangle above player)
    const healthBarWidth = this.size * 1.5;
    const healthBarHeight = 5;
    const healthPercentage = this.currentHealth / this.maxHealth;

    ctx.fillStyle = 'gray';
    ctx.fillRect(this.x - cameraX - healthBarWidth / 2, this.y - cameraY - this.size / 2 - 10, healthBarWidth, healthBarHeight);
    ctx.fillStyle = 'lime';
    ctx.fillRect(this.x - cameraX - healthBarWidth / 2, this.y - cameraY - this.size / 2 - 10, healthBarWidth * healthPercentage, healthBarHeight);
  }

  takeDamage(amount: number) {
    this.currentHealth -= amount;
    if (this.currentHealth < 0) {
      this.currentHealth = 0;
    }
    console.log(`Player took ${amount} damage. Health: ${this.currentHealth}`);
  }

  isAlive(): boolean {
    return this.currentHealth > 0;
  }

  // Basic collision check with another circle (e.g., enemy)
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
    this.experience -= this.experienceToNextLevel; // Carry over excess experience
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5); // Increase XP needed for next level
    this.maxHealth += 10; // Example: increase max health on level up
    this.currentHealth = this.maxHealth; // Heal to full
    this.speed += 10; // Example: increase speed
    console.log(`Player leveled up to Level ${this.level}!`);
  }
}