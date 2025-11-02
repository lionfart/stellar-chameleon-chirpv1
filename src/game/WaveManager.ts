import { GameState } from './GameState';
import { SpriteManager } from './SpriteManager';
import { SoundManager } from './SoundManager';
import { Enemy } from './Enemy';
import { clamp } from './utils';

export class WaveManager {
  private gameState: GameState;
  private spriteManager: SpriteManager;
  private soundManager: SoundManager;
  private enemySpawnTimer: number;
  private waveDuration: number = 60; // seconds per wave

  constructor(gameState: GameState, spriteManager: SpriteManager, soundManager: SoundManager) {
    this.gameState = gameState;
    this.spriteManager = spriteManager;
    this.soundManager = soundManager;
    this.enemySpawnTimer = 0;
  }

  update(deltaTime: number, cameraX: number, cameraY: number, canvasWidth: number, canvasHeight: number) {
    this.gameState.waveTimeElapsed += deltaTime;
    if (this.gameState.waveTimeElapsed >= this.waveDuration) {
      this.gameState.waveNumber++;
      this.gameState.waveTimeElapsed = 0;
      this.gameState.enemySpawnInterval = Math.max(0.5, this.gameState.enemySpawnInterval * 0.9); // Decrease spawn interval by 10% each wave, min 0.5s
      console.log(`Advancing to Wave ${this.gameState.waveNumber}! New spawn interval: ${this.gameState.enemySpawnInterval.toFixed(2)}s`);
    }

    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer >= this.gameState.enemySpawnInterval) {
      this.spawnEnemy(cameraX, cameraY, canvasWidth, canvasHeight);
      this.enemySpawnTimer = 0;
    }
  }

  private spawnEnemy(cameraX: number, cameraY: number, canvasWidth: number, canvasHeight: number) {
    const spawnPadding = 100;
    let spawnX, spawnY;

    const side = Math.floor(Math.random() * 4);

    switch (side) {
      case 0: // Top
        spawnX = Math.random() * this.gameState.worldWidth;
        spawnY = Math.max(0, cameraY - spawnPadding);
        break;
      case 1: // Bottom
        spawnX = Math.random() * this.gameState.worldWidth;
        spawnY = Math.min(this.gameState.worldHeight, cameraY + canvasHeight + spawnPadding);
        break;
      case 2: // Left
        spawnX = Math.max(0, cameraX - spawnPadding);
        spawnY = Math.random() * this.gameState.worldHeight;
        break;
      case 3: // Right
        spawnX = Math.min(this.gameState.worldWidth, cameraX + canvasWidth + spawnPadding);
        spawnY = Math.random() * this.gameState.worldHeight;
        break;
      default:
        spawnX = Math.random() * this.gameState.worldWidth;
        spawnY = Math.random() * this.gameState.worldHeight;
    }

    spawnX = clamp(spawnX, 0, this.gameState.worldWidth);
    spawnY = clamp(spawnY, 0, this.gameState.worldHeight);

    // Base stats for different enemy types
    const enemyTypes = [
      { name: 'normal', size: 20, baseHealth: 30, baseSpeed: 100, color: 'red', spriteName: 'enemy_normal', baseGold: 5 },
      { name: 'fast', size: 15, baseHealth: 20, baseSpeed: 150, color: 'green', spriteName: 'enemy_fast', baseGold: 3 },
      { name: 'tanky', size: 25, baseHealth: 50, baseSpeed: 70, color: 'purple', spriteName: 'enemy_tanky', baseGold: 8 },
    ];

    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

    // Scale enemy stats with wave number
    const healthMultiplier = 1 + (this.gameState.waveNumber - 1) * 0.2; // +20% health per wave
    const speedMultiplier = 1 + (this.gameState.waveNumber - 1) * 0.05; // +5% speed per wave
    const goldMultiplier = 1 + (this.gameState.waveNumber - 1) * 0.1; // +10% gold per wave

    const enemyHealth = Math.floor(randomType.baseHealth * healthMultiplier);
    const enemySpeed = randomType.baseSpeed * speedMultiplier;
    const enemyGold = Math.floor(randomType.baseGold * goldMultiplier);
    const enemySprite = this.spriteManager.getSprite(randomType.spriteName);

    this.gameState.enemies.push(new Enemy(spawnX, spawnY, randomType.size, enemySpeed, randomType.color, enemyHealth, enemySprite, this.soundManager, enemyGold));
  }

  reset() {
    this.enemySpawnTimer = 0;
  }
}