import { GameState } from './GameState';
import { SpriteManager } from './SpriteManager';
import { SoundManager } from './SoundManager';
import { Enemy } from './Enemy';
import { ShooterEnemy } from './ShooterEnemy';
import { Boss } from './Boss'; // Import Boss
import { clamp } from './utils';

export class WaveManager {
  private gameState: GameState;
  private spriteManager: SpriteManager;
  private soundManager: SoundManager;
  private enemySpawnTimer: number;
  private waveDuration: number = 60; // seconds per wave
  private bossWaveInterval: number = 5; // Spawn a boss every 5 waves

  constructor(gameState: GameState, spriteManager: SpriteManager, soundManager: SoundManager) {
    this.gameState = gameState;
    this.spriteManager = spriteManager;
    this.soundManager = soundManager;
    this.enemySpawnTimer = 0;
  }

  update(deltaTime: number, cameraX: number, cameraY: number, canvasWidth: number, canvasHeight: number) {
    // If a boss is active, don't spawn regular enemies
    if (this.gameState.currentBoss && this.gameState.currentBoss.isAlive()) {
      return;
    }

    this.gameState.waveTimeElapsed += deltaTime;
    if (this.gameState.waveTimeElapsed >= this.waveDuration) {
      this.gameState.waveNumber++;
      this.gameState.waveTimeElapsed = 0;
      this.gameState.enemySpawnInterval = Math.max(0.5, this.gameState.enemySpawnInterval * 0.9); // Decrease spawn interval by 10% each wave, min 0.5s
      console.log(`Advancing to Wave ${this.gameState.waveNumber}! New spawn interval: ${this.gameState.enemySpawnInterval.toFixed(2)}s`);

      // Check if it's a boss wave
      if (this.gameState.waveNumber % this.bossWaveInterval === 0) {
        this.spawnBoss(cameraX, cameraY, canvasWidth, canvasHeight);
      }
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
      { name: 'normal', type: 'normal', size: 20, baseHealth: 30, baseSpeed: 100, color: 'red', spriteName: 'enemy_normal', baseGold: 5 },
      { name: 'fast', type: 'fast', size: 15, baseHealth: 20, baseSpeed: 150, color: 'green', spriteName: 'enemy_fast', baseGold: 3 },
      { name: 'tanky', type: 'tanky', size: 25, baseHealth: 50, baseSpeed: 70, color: 'purple', spriteName: 'enemy_tanky', baseGold: 8 },
      { name: 'shooter', type: 'shooter', size: 22, baseHealth: 25, baseSpeed: 80, color: 'cyan', spriteName: 'enemy_shooter', baseGold: 7,
        projectileSpeed: 200, fireRate: 2, projectileDamage: 10, projectileRadius: 6, projectileLifetime: 2 }, // Shooter specific stats
    ];

    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

    // Scale enemy stats with wave number
    const healthMultiplier = 1 + (this.gameState.waveNumber - 1) * 0.2; // +20% health per wave
    const speedMultiplier = 1 + (this.gameState.waveNumber - 1) * 0.05; // +5% speed per wave
    const goldMultiplier = 1 + (this.gameState.waveNumber - 1) * 0.1; // +10% gold per wave
    const projectileDamageMultiplier = 1 + (this.gameState.waveNumber - 1) * 0.1; // +10% projectile damage per wave

    const enemyHealth = Math.floor(randomType.baseHealth * healthMultiplier);
    const enemySpeed = randomType.baseSpeed * speedMultiplier;
    const enemyGold = Math.floor(randomType.baseGold * goldMultiplier);
    const enemySprite = this.spriteManager.getSprite(randomType.spriteName);
    const projectileSprite = this.spriteManager.getSprite('projectile'); // Re-use player projectile sprite for now

    if (randomType.type === 'shooter') {
      this.gameState.enemies.push(new ShooterEnemy(
        spawnX, spawnY, randomType.size, enemySpeed, randomType.color, enemyHealth,
        enemySprite, this.soundManager, enemyGold, this.gameState.damageNumbers.push.bind(this.gameState.damageNumbers),
        randomType.projectileSpeed, randomType.fireRate, Math.floor(randomType.projectileDamage * projectileDamageMultiplier),
        randomType.projectileRadius, randomType.projectileLifetime, projectileSprite
      ));
    } else {
      this.gameState.enemies.push(new Enemy(spawnX, spawnY, randomType.size, enemySpeed, randomType.color, enemyHealth, enemySprite, this.soundManager, enemyGold, this.gameState.damageNumbers.push.bind(this.gameState.damageNumbers)));
    }
  }

  private spawnBoss(cameraX: number, cameraY: number, canvasWidth: number, canvasHeight: number) {
    // Clear existing enemies before spawning boss
    this.gameState.enemies = [];

    const bossSize = 80;
    const bossHealth = 500 + (this.gameState.waveNumber / this.bossWaveInterval - 1) * 200; // Scale boss health
    const bossSpeed = 80;
    const bossGold = 100;
    const bossSprite = this.spriteManager.getSprite('boss');
    const bossName = `Wave ${this.gameState.waveNumber} Boss`;

    // Spawn boss near the center of the visible screen, but within world bounds
    const spawnX = clamp(cameraX + canvasWidth / 2, bossSize / 2, this.gameState.worldWidth - bossSize / 2);
    const spawnY = clamp(cameraY + canvasHeight / 2, bossSize / 2, this.gameState.worldHeight - bossSize / 2);

    this.gameState.currentBoss = new Boss(
      spawnX, spawnY, bossSize, bossSpeed, 'red', bossHealth,
      bossSprite, this.soundManager, bossGold, this.gameState.damageNumbers.push.bind(this.gameState.damageNumbers),
      bossName
    );
    this.gameState.enemies.push(this.gameState.currentBoss); // Add boss to enemies array for general handling
    console.log(`BOSS SPAWNED: ${bossName} with ${bossHealth} HP!`);
  }

  reset() {
    this.enemySpawnTimer = 0;
    this.gameState.currentBoss = undefined; // Clear boss on reset
  }
}