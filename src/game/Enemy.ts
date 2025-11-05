import { Player } from './Player';
import { SoundManager } from './SoundManager';
import { DamageNumber } from './DamageNumber';

export class Enemy {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  maxHealth: number;
  currentHealth: number;
  private sprite: HTMLImageElement | undefined;
  protected soundManager: SoundManager;
  private hitTimer: number = 0;
  private goldDrop: number;
  private onTakeDamageCallback: (x: number, y: number, damage: number) => void;

  // Animation properties
  private animationFrames: HTMLImageElement[] = []; // Array of sprites for animation
  private currentFrameIndex: number = 0;
  private animationTimer: number = 0;
  private animationSpeed: number = 0.2; // seconds per frame
  private isMoving: boolean = false;

  constructor(x: number, y: number, size: number, speed: number, color: string, maxHealth: number, sprite: HTMLImageElement | undefined, soundManager: SoundManager, goldDrop: number = 0, onTakeDamage: (x: number, y: number, damage: number) => void) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.color = color;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.sprite = sprite;
    this.soundManager = soundManager;
    this.goldDrop = goldDrop;
    this.onTakeDamageCallback = onTakeDamage;
  }

  setSprite(sprites: HTMLImageElement[]) {
    this.animationFrames = sprites;
    this.sprite = sprites[0]; // Keep first frame as a fallback/default
  }

  update(deltaTime: number, player: Player, separationVector: { x: number, y: number } = { x: 0, y: 0 }) {
    if (!this.isAlive()) return;

    if (this.hitTimer > 0) {
      this.hitTimer -= deltaTime;
    }

    let moveX = 0;
    let moveY = 0;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      moveX = (dx / distance) * this.speed * deltaTime;
      moveY = (dy / distance) * this.speed * deltaTime;
    }

    this.x += moveX + separationVector.x * deltaTime;
    this.y += moveY + separationVector.y * deltaTime;

    this.isMoving = (moveX !== 0 || moveY !== 0);

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

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (!this.isAlive()) return;

    ctx.save();
    ctx.translate(this.x - cameraX, this.y - cameraY);

    if (this.hitTimer > 0) {
      ctx.filter = 'brightness(200%)';
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
    this.hitTimer = 0.1;
    this.soundManager.playSound('enemy_hit');
    this.onTakeDamageCallback(this.x, this.y, amount);

    if (this.currentHealth < 0) {
      this.currentHealth = 0;
    }
    // console.log(`Enemy took ${amount} damage. Health: ${this.currentHealth}`); // Removed for optimization

    if (!this.isAlive()) {
      this.soundManager.playSound('enemy_defeat');
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