import { SoundManager } from './SoundManager';
import { GameEngine } from './GameEngine'; // Import GameEngine

export class Shield {
  x: number;
  y: number;
  radius: number;
  maxHealth: number;
  currentHealth: number;
  color: string;
  isActive: boolean;
  private pulseTimer: number = 0;
  private soundManager: SoundManager;

  constructor(radius: number, maxHealth: number, soundManager: SoundManager) {
    this.x = 0;
    this.y = 0;
    this.radius = radius;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.color = 'rgba(0, 191, 255, 0.4)';
    this.isActive = false;
    this.soundManager = soundManager;
  }

  updatePosition(playerX: number, playerY: number) {
    this.x = playerX;
    this.y = playerY;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (!this.isActive) return;

    // Shield is drawn relative to the player's actual position, but its visual scale can be influenced by player's 2.5D scale
    // We'll get player's draw properties to ensure consistency
    const tempPlayerEntity = { x: this.x, y: this.y, size: 30 }; // Use player's size as reference
    const { drawX, drawY, scale, scaledSize } = new GameEngine(ctx, () => {}, () => {}, () => {}, () => {}).getDrawProperties(tempPlayerEntity); // Temporary GameEngine instance to get properties

    this.pulseTimer += 0.1;
    const pulseScale = 1 + Math.sin(this.pulseTimer) * 0.05;
    const currentRadius = this.radius * scale * pulseScale; // Scale radius

    const healthPercentage = this.currentHealth / this.maxHealth;
    const baseAlpha = 0.3 + (healthPercentage * 0.4);
    const strokeAlpha = 0.6 + (healthPercentage * 0.4);

    // Outer glow/fill
    const gradient = ctx.createRadialGradient(
      drawX - cameraX, drawY - cameraY + scaledSize / 2 - currentRadius / 2, currentRadius * 0.5,
      drawX - cameraX, drawY - cameraY + scaledSize / 2 - currentRadius / 2, currentRadius
    );
    gradient.addColorStop(0, `rgba(0, 191, 255, ${baseAlpha})`);
    gradient.addColorStop(1, `rgba(0, 191, 255, ${baseAlpha * 0.2})`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(drawX - cameraX, drawY - cameraY + scaledSize / 2 - currentRadius / 2, currentRadius, 0, Math.PI * 2);
    ctx.fill();

    // Stronger outer stroke
    ctx.strokeStyle = `rgba(0, 191, 255, ${strokeAlpha})`;
    ctx.lineWidth = 3 * scale; // Scale line width
    ctx.beginPath();
    ctx.arc(drawX - cameraX, drawY - cameraY + scaledSize / 2 - currentRadius / 2, currentRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw a small health bar for the shield
    const barWidth = scaledSize * 1.5;
    const barHeight = 3 * scale;
    ctx.fillStyle = 'gray';
    ctx.fillRect(drawX - cameraX - barWidth / 2, drawY - cameraY + scaledSize / 2 + this.radius * scale + 5 * scale, barWidth, barHeight);
    ctx.fillStyle = 'deepskyblue';
    ctx.fillRect(drawX - cameraX - barWidth / 2, drawY - cameraY + scaledSize / 2 + this.radius * scale + 5 * scale, barWidth * healthPercentage, barHeight);
  }

  takeDamage(amount: number): number {
    if (!this.isActive) return amount;

    this.currentHealth -= amount;
    if (this.currentHealth <= 0) {
      this.currentHealth = 0;
      this.isActive = false;
      this.soundManager.playSound('shield_break');
      console.log("Shield broken!");
      return Math.abs(this.currentHealth);
    }
    return 0;
  }

  regenerate(amount: number) {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    }
  }

  activate() {
    this.isActive = true;
    this.soundManager.playSound('shield_activate');
    console.log("Shield activated!");
  }

  deactivate() {
    this.isActive = false;
    this.soundManager.playSound('shield_deactivate');
    console.log("Shield deactivated!");
  }

  increaseMaxHealth(amount: number) {
    this.maxHealth += amount;
    this.currentHealth += amount;
    console.log(`Shield max health increased to ${this.maxHealth}`);
  }
}