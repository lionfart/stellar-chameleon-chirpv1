export class Shield {
  x: number;
  y: number;
  radius: number;
  maxHealth: number;
  currentHealth: number;
  color: string;
  isActive: boolean;
  private pulseTimer: number = 0; // For pulsing effect

  constructor(radius: number, maxHealth: number) {
    this.x = 0;
    this.y = 0;
    this.radius = radius;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.color = 'rgba(0, 191, 255, 0.4)';
    this.isActive = false;
  }

  updatePosition(playerX: number, playerY: number) {
    this.x = playerX;
    this.y = playerY;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (!this.isActive) return;

    this.pulseTimer += 0.1; // Adjust speed of pulse
    const pulseScale = 1 + Math.sin(this.pulseTimer) * 0.05; // Subtle size pulse
    const currentRadius = this.radius * pulseScale;

    const healthPercentage = this.currentHealth / this.maxHealth;
    const baseAlpha = 0.3 + (healthPercentage * 0.4); // Fade out as health decreases
    const strokeAlpha = 0.6 + (healthPercentage * 0.4); // Stronger stroke when healthy

    // Outer glow/fill
    const gradient = ctx.createRadialGradient(
      this.x - cameraX, this.y - cameraY, currentRadius * 0.5,
      this.x - cameraX, this.y - cameraY, currentRadius
    );
    gradient.addColorStop(0, `rgba(0, 191, 255, ${baseAlpha})`); // Deep Sky Blue center
    gradient.addColorStop(1, `rgba(0, 191, 255, ${baseAlpha * 0.2})`); // Fading outer edge

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y - cameraY, currentRadius, 0, Math.PI * 2);
    ctx.fill();

    // Stronger outer stroke
    ctx.strokeStyle = `rgba(0, 191, 255, ${strokeAlpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y - cameraY, currentRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw a small health bar for the shield
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
      this.isActive = false;
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
    console.log("Shield activated!");
  }

  deactivate() {
    this.isActive = false;
    console.log("Shield deactivated!");
  }

  increaseMaxHealth(amount: number) {
    this.maxHealth += amount;
    this.currentHealth += amount;
    console.log(`Shield max health increased to ${this.maxHealth}`);
  }
}