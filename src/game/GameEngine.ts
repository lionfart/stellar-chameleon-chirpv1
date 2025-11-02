import { Player } from './Player';
import { InputHandler } from './InputHandler';

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private inputHandler: InputHandler;
  private lastTime: number;
  private animationFrameId: number | null;

  // World dimensions (can be expanded later)
  private worldWidth: number = 2000;
  private worldHeight: number = 2000;

  // Camera position
  private cameraX: number = 0;
  private cameraY: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.inputHandler = new InputHandler();
    this.player = new Player(this.worldWidth / 2, this.worldHeight / 2, 30, 200, 'blue'); // Player starts in center
    this.lastTime = 0;
    this.animationFrameId = null;
  }

  init() {
    this.gameLoop(0); // Start the game loop
  }

  private update(deltaTime: number) {
    this.player.update(this.inputHandler, deltaTime, this.worldWidth, this.worldHeight);

    // Update camera to follow the player
    // Center the camera on the player, but clamp to world boundaries
    this.cameraX = this.player.x - this.ctx.canvas.width / 2;
    this.cameraY = this.player.y - this.ctx.canvas.height / 2;

    // Clamp camera to world boundaries
    this.cameraX = Math.max(0, Math.min(this.cameraX, this.worldWidth - this.ctx.canvas.width));
    this.cameraY = Math.max(0, Math.min(this.cameraY, this.worldHeight - this.ctx.canvas.height));
  }

  private draw() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Draw background (e.g., a grid or just a color)
    this.ctx.fillStyle = '#333'; // Dark background
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Draw world boundaries (optional, for debugging)
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      -this.cameraX,
      -this.cameraY,
      this.worldWidth,
      this.worldHeight
    );

    this.player.draw(this.ctx, this.cameraX, this.cameraY);
  }

  private gameLoop = (currentTime: number) => {
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.inputHandler.destroy();
  }
}