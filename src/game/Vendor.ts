import { Player } from './Player';

export class Vendor {
  x: number;
  y: number;
  size: number;
  color: string;
  interactionRadius: number;
  private sprite: HTMLImageElement | undefined;

  constructor(x: number, y: number, size: number, sprite: HTMLImageElement | undefined) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = 'gold'; // A distinct color for the vendor
    this.interactionRadius = size * 1.5; // Player needs to be within this radius to interact
    this.sprite = sprite;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    ctx.save();
    ctx.translate(this.x - cameraX, this.y - cameraY);

    if (this.sprite) {
      ctx.drawImage(this.sprite, -this.size / 2, -this.size / 2, this.size, this.size);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.font = `${this.size / 3}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 0);
    }

    ctx.restore();
  }

  isPlayerInRange(player: Player): boolean {
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.interactionRadius + player.size / 2);
  }
}