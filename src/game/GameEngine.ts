import { Player } from './Player';
import { InputHandler } from './InputHandler';
import { Enemy } from './Enemy';
import { clamp } from './utils'; // Ensure clamp is imported

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private inputHandler: InputHandler;
  private lastTime: number;
  private animationFrameId: number | null;
  private enemies: Enemy[];
  private enemySpawnTimer: number;
  private enemySpawnInterval: number = 2; // Spawn an enemy every 2 seconds

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
    this.enemies = [];
    this.enemySpawnTimer = 0;
  }

  init() {
    this.gameLoop(0); // Start the game loop
  }

  private spawnEnemy() {
    // Spawn enemy at a random position outside the current screen view but within world bounds
    const spawnPadding = 100; // Ensure enemies spawn a bit off-screen
    let spawnX, spawnY;

    // Determine spawn side (top, bottom, left, right)
    const side = Math.floor(Math.random() * 4);

    switch (side) {
      case 0: // Top
        spawnX = Math.random() * this.worldWidth;
        spawnY = Math.max(0, this.cameraY - spawnPadding);
        break;
      case 1: // Bottom
        spawnX = Math.random() * this.worldWidth;
        spawnY = Math.min(this.worldHeight, this.cameraY + this.ctx.canvas.height + spawnPadding);
        break;
      case 2: // Left
        spawnX = Math.max(0, this.cameraX - spawnPadding);
        spawnY = Math.random() * this.worldHeight;
        break;
      case 3: // Right
        spawnX = Math.min(this.worldWidth, this.cameraX + this.ctx.canvas.width + spawnPadding);
        spawnY = Math.random() * this.worldHeight;
        break;
      default: // Fallback
        spawnX = Math.random() * this.worldWidth;
        spawnY = Math.random() * this.worldHeight;
    }

    // Clamp spawn position to world boundaries
    spawnX = clamp(spawnX, 0, this.worldWidth);
    spawnY = clamp(spawnY, 0, this.worldHeight);

    this.enemies.push(new Enemy(spawnX, spawnY, 20, 100, 'red', 1));
  }

  private update(deltaTime: number) {
    this.player.update(this.inputHandler, deltaTime, this.worldWidth, this.worldHeight);

    // Update camera to follow the player
    this.cameraX = this.player.x - this.ctx.canvas.width / 2;
    this.cameraY = this.player.y - this.ctx.canvas.height / 2;

    // Clamp camera to world boundaries
    this.cameraX = clamp(this.cameraX, 0, this.worldWidth - this.ctx.canvas.width);
    this.cameraY = clamp(this.cameraY, 0, this.worldHeight - this.ctx.canvas.height);

    // Update enemies
    this.enemies.forEach(enemy => enemy.update(deltaTime, this.player));

    // Spawn enemies
    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // Basic collision detection (Player vs. Enemies)
    this.enemies.forEach(enemy => {
      if (this.player.collidesWith(enemy)) {
        console.log('Player hit by enemy!');
        // In a real game, this would reduce player health or trigger other effects
      }
    });
  }

  private draw() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Draw background
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

    // Draw enemies
    this.enemies.forEach(enemy => enemy.draw(this.ctx, this.cameraX, this.cameraY));
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