export class BossAttackVisual {
  x: number;
  y: number;
  radius: number;
  private duration: number;
  private currentDuration: number;
  private color: string;

  constructor(x: number, y: number, radius: number, duration: number = 0.5, color: string = 'red') {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.duration = duration;
    this.currentDuration = 0;
    this.color = color;
  }

  update(deltaTime: number): boolean {
    this.currentDuration += deltaTime;
    return this.currentDuration < this.duration;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const progress = this.currentDuration / this.duration;
    const currentRadius = this.radius * (0.2 + progress * 0.8); // Start smaller, grow to full size
    const alpha = 1 - progress; // Fade out

    const gradient = ctx.createRadialGradient(
      this.x - cameraX, this.y - cameraY, currentRadius * 0.1,
      this.x - cameraX, this.y - cameraY, currentRadius
    );
    gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`); // Red center
    gradient.addColorStop(0.7, `rgba(255, 100, 0, ${alpha * 0.7})`); // Orange middle
    gradient.addColorStop(1, `rgba(255, 200, 0, ${alpha * 0.3})`); // Yellow outer, more transparent

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y - cameraY, currentRadius, 0, Math.PI * 2);
    ctx.fill();

    // Add a pulsing outline
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
    ctx.lineWidth = 2 + (Math.sin(this.currentDuration * 10) * 1); // Subtle pulse on line width
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y - cameraY, currentRadius * 0.9, 0, Math.PI * 2);
    ctx.stroke();
  }
}