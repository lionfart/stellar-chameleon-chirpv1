import { Player } from './Player';

export class Enemy {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  maxHealth: number;
  currentHealth: number;
  private sprite: HTMLImageElement | undefined; // New: Enemy sprite

  constructor(x: number, y: number, size: number, speed: number, color: string, maxHealth: number, sprite: HTMLImageElement | undefined) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.color = color;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.sprite = sprite;
  }

  update(deltaTime: number, player: Player) {
    if (!this.isAlive()) return;

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

    if (this.sprite) {
      ctx.drawImage(this.sprite, this.x - cameraX - this.size / 2, this.y - cameraY - this.size / 2, this.size, this.size);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x - cameraX, this.y - cameraY, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

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
    if (this.currentHealth < 0) {
      this.currentHealth = 0;
    }
    console.log(`Enemy took ${amount} damage. Health: ${this.currentHealth}`);
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
}