import { Player } from './Player';
import { SoundManager } from './SoundManager'; // Import SoundManager

export class Enemy {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  maxHealth: number;
  currentHealth: number;
  private sprite: HTMLImageElement | undefined;
  private soundManager: SoundManager; // New: SoundManager instance
  private hitTimer: number = 0; // For hit animation
  private goldDrop: number; // New: Gold amount this enemy drops

  constructor(x: number, y: number, size: number, speed: number, color: string, maxHealth: number, sprite: HTMLImageElement | undefined, soundManager: SoundManager, goldDrop: number = 0) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.color = color;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.sprite = sprite;
    this.soundManager = soundManager; // Assign SoundManager
    this.goldDrop = goldDrop; // Assign gold drop
  }

  update(deltaTime: number, player: Player) {
    if (!this.isAlive()) return;

    // Update hit animation timer
    if (this.hitTimer > 0) {
      this.hitTimer -= deltaTime;
    }

    // Move towards the player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.x += (dx / distance) * this.speed * deltaTime;
      this.y += (dy / distance) * this.speed * deltaTime;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (!this.isAlive()) return;

    ctx.save();
    ctx.translate(this.x - cameraX, this.y - cameraY);

    // Apply hit flash effect
    if (this.hitTimer > 0) {
      ctx.filter = 'brightness(200%)'; // Make it brighter
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

    // Draw health bar (simple rectangle above enemy)
    const healthBarWidth = this.size * 1.5;
    const healthBarHeight = 3;
    const healthPercentage = this.currentHealth / this.maxHealth;

    ctx.fillStyle = 'gray';
    ctx.fillRect(this.x - cameraX - healthBarWidth / 2, this.y - cameraY - this.size / 2 - 8, healthBarWidth, healthBarHeight);
    ctx.fillStyle = 'orange';
    ctx.fillRect(this.x - cameraX - healthBarWidth / 2, this.y - cameraY - this.size / 2 - 8, healthBarWidth * healthPercentage, healthBarHeight);
  }

  takeDamage(amount: number) {
    this.currentHealth -= amount;
    this.hitTimer = 0.1; // Set hit flash duration
    this.soundManager.playSound('enemy_hit'); // Play hit sound

    if (this.currentHealth < 0) {
      this.currentHealth = 0;
    }
    console.log(`Enemy took ${amount} damage. Health: ${this.currentHealth}`);

    if (!this.isAlive()) {
      this.soundManager.playSound('enemy_defeat'); // Play defeat sound
    }
  }

  isAlive(): boolean {
    return this.currentHealth > 0;
  }

  getGoldDrop(): number {
    return this.goldDrop;
  }

  collidesWith(other: { x: number; y: number; size: number }): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.size / 2 + other.size / 2);
  }
}