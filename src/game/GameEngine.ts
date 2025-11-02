import { Player } from './Player';
import { InputHandler } from './InputHandler';
import { Enemy } from './Enemy';
import { AuraWeapon } from './AuraWeapon';
import { ExperienceGem } from './ExperienceGem'; // Import the new gem class
import { clamp } from './utils';

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private inputHandler: InputHandler;
  private lastTime: number;
  private animationFrameId: number | null;
  private enemies: Enemy[];
  private experienceGems: ExperienceGem[]; // New array for experience gems
  private enemySpawnTimer: number;
  private enemySpawnInterval: number = 2; // Spawn an enemy every 2 seconds
  private auraWeapon: AuraWeapon;
  private gameOver: boolean = false;

  // World dimensions
  private worldWidth: number = 2000;
  private worldHeight: number = 2000;

  // Camera position
  private cameraX: number = 0;
  private cameraY: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.inputHandler = new InputHandler();
    this.player = new Player(this.worldWidth / 2, this.worldHeight / 2, 30, 200, 'blue', 100);
    this.lastTime = 0;
    this.animationFrameId = null;
    this.enemies = [];
    this.experienceGems = []; // Initialize gems array
    this.enemySpawnTimer = 0;
    this.auraWeapon = new AuraWeapon(10, 100, 0.5);
  }

  init() {
    this.gameLoop(0);
  }

  private spawnEnemy() {
    const spawnPadding = 100;
    let spawnX, spawnY;

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
      default:
        spawnX = Math.random() * this.worldWidth;
        spawnY = Math.random() * this.worldHeight;
    }

    spawnX = clamp(spawnX, 0, this.worldWidth);
    spawnY = clamp(spawnY, 0, this.worldHeight);

    this.enemies.push(new Enemy(spawnX, spawnY, 20, 100, 'red', 30));
  }

  private update(deltaTime: number) {
    if (this.gameOver) return;

    this.player.update(this.inputHandler, deltaTime, this.worldWidth, this.worldHeight);

    this.cameraX = this.player.x - this.ctx.canvas.width / 2;
    this.cameraY = this.player.y - this.ctx.canvas.height / 2;

    this.cameraX = clamp(this.cameraX, 0, this.worldWidth - this.ctx.canvas.width);
    this.cameraY = clamp(this.cameraY, 0, this.worldHeight - this.ctx.canvas.height);

    this.enemies.forEach(enemy => enemy.update(deltaTime, this.player));

    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    this.enemies.forEach(enemy => {
      if (this.player.collidesWith(enemy)) {
        this.player.takeDamage(5);
      }
    });

    this.auraWeapon.update(deltaTime, this.player.x, this.player.y, this.enemies);

    // Filter out defeated enemies and drop experience gems
    const defeatedEnemies = this.enemies.filter(enemy => !enemy.isAlive());
    defeatedEnemies.forEach(enemy => {
      this.experienceGems.push(new ExperienceGem(enemy.x, enemy.y, 10)); // Each enemy drops 10 XP
    });
    this.enemies = this.enemies.filter(enemy => enemy.isAlive());

    // Handle experience gem collection
    this.experienceGems = this.experienceGems.filter(gem => {
      if (gem.collidesWith(this.player)) {
        this.player.gainExperience(gem.value);
        return false; // Remove gem
      }
      return true; // Keep gem
    });

    if (!this.player.isAlive()) {
      this.gameOver = true;
      console.log("Game Over!");
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      -this.cameraX,
      -this.cameraY,
      this.worldWidth,
      this.worldHeight
    );

    this.auraWeapon.draw(this.ctx, this.player.x, this.player.y, this.cameraX, this.cameraY);

    // Draw experience gems
    this.experienceGems.forEach(gem => gem.draw(this.ctx, this.cameraX, this.cameraY));

    this.player.draw(this.ctx, this.cameraX, this.cameraY);

    this.enemies.forEach(enemy => enemy.draw(this.ctx, this.cameraX, this.cameraY));

    // Draw UI elements
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Health: ${this.player.currentHealth}/${this.player.maxHealth}`, 10, 30);
    this.ctx.fillText(`Level: ${this.player.level}`, 10, 60);
    this.ctx.fillText(`XP: ${this.player.experience}/${this.player.experienceToNextLevel}`, 10, 90);


    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.fillStyle = 'white';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
      this.ctx.font = '24px Arial';
      this.ctx.fillText('Refresh to restart', this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 50);
    }
  }

  private gameLoop = (currentTime: number) => {
    const deltaTime = (currentTime - this.lastTime) / 1000;
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