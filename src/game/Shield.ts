export class Shield {
  x: number;
  y: number;
  radius: number;
  maxHealth: number;
  currentHealth: number;
  color: string;
  isActive: boolean;

  constructor(radius: number, maxHealth: number) {
    this.x = 0; // Will be updated by the player's position
    this.y = 0; // Will be updated by the player's position
    this.radius = radius;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.color = 'rgba(0, 191, 255, 0.4)'; // Deep Sky Blue, semi-transparent
    this.isActive = false;
  }

  updatePosition(playerX: number, playerY: number) {
    this.x = playerX;
    this.y = playerY;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (!this.isActive) return;

    const healthPercentage = this.currentHealth / this.maxHealth;
    const alpha = 0.2 + (healthPercentage * 0.3); // Fade out as health decreases

    ctx.strokeStyle = `rgba(0, 191, 255, ${alpha})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y - cameraY, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Optional: Draw a small health bar for the shield
    const barWidth = this.radius * 1.5;
    const barHeight = 3;
    ctx.fillStyle = 'gray';
    ctx.fillRect(this.x - cameraX - barWidth / 2, this.y - cameraY + this.radius + 5, barWidth, barHeight);
    ctx.fillStyle = 'deepskyblue';
    ctx.fillRect(this.x - cameraX - barWidth / 2, this.y - cameraY + this.radius + 5, barWidth * healthPercentage, barHeight);
  }

  takeDamage(amount: number): number {
    if (!this.isActive) return amount;

    this.currentHealth -= amount;
    if (this.currentHealth <= 0) {
      this.currentHealth = 0;
      this.isActive = false; // Shield breaks
      console.log("Shield broken!");
      return Math.abs(this.currentHealth); // Return any leftover damage
    }
    return 0; // No leftover damage
  }

  regenerate(amount: number) {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    }
  }

  activate() {
    this.isActive = true;
    console.log("Shield activated!");
  }

  deactivate() {
    this.isActive = false;
    console.log("Shield deactivated!");
  }

  increaseMaxHealth(amount: number) {
    this.maxHealth += amount;
    this.currentHealth += amount; // Also heal current health
    console.log(`Shield max health increased to ${this.maxHealth}`);
  }
}