import { InputHandler } from './InputHandler';
import { clamp } from './utils';

export class Player {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;

  constructor(x: number, y: number, size: number, speed: number, color: string) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.color = color;
  }

  update(input: InputHandler, deltaTime: number, worldWidth: number, worldHeight: number) {
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

    // Keep player within world bounds (for now, we'll expand this later)
    this.x = clamp(this.x, this.size / 2, worldWidth - this.size / 2);
    this.y = clamp(this.y, this.size / 2, worldHeight - this.size / 2);
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y - cameraY, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Basic collision check with another circle (e.g., enemy)
  collidesWith(other: { x: number; y: number; size: number }): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.size / 2 + other.size / 2);
  }
}