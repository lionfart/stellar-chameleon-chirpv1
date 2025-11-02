import { GameState } from './GameState';
import { SpriteManager } from './SpriteManager';
import { SoundManager } from './SoundManager';
import { Enemy } from './Enemy';
import { ShooterEnemy } from './ShooterEnemy';
import { Boss } from './Boss'; // Import Boss
import { BossWarning } from './BossWarning'; // Import BossWarning
import { clamp } from './utils';

export class WaveManager {
  private gameState: GameState;
  private spriteManager: SpriteManager;
  private soundManager: SoundManager;
  private enemySpawnTimer: number;
  private waveDuration: number = 60; // seconds per wave
  private bossWaveInterval: number = 3; // Spawn a boss every 3 waves
  private bossSpawnLocation: { x: number, y: number } | null = null;
  private bossSpawnCorner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null = null;

  constructor(gameState: GameState, spriteManager: SpriteManager, soundManager: SoundManager) {
    this.gameState = gameState;
    this.spriteManager = spriteManager;
    this.soundManager = soundManager;
    this.enemySpawnTimer = 0;
  }

  update(deltaTime: number, cameraX: number, cameraY: number, canvasWidth: number, canvasHeight: number) {
    // If a boss is active OR a boss warning is active, don't spawn regular enemies
    if ((this.gameState.currentBoss && this.gameState.currentBoss.isAlive()) || this.gameState.isBossWarningActive) {
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
        this.triggerBossWarning(canvasWidth, canvasHeight); // Trigger warning instead of direct spawn
      }
    }

    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer >= this.gameState.enemySpawnInterval) {
      this.spawnEnemy(cameraX, cameraY, canvasWidth, canvasHeight);
      this.enemySpawnTimer = 0;
    }
  }

  private triggerBossWarning(canvasWidth: number, canvasHeight: number) {
    // Clear existing enemies before spawning boss
    this.gameState.enemies = [];

    // Determine a random corner for the boss to spawn in the world
    const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
    const selectedCorner = corners[Math.floor(Math.random() * corners.length)];
    this.bossSpawnCorner = selectedCorner;

    const bossSize = 80;
    let spawnX, spawnY;

    // Calculate world coordinates for the chosen corner
    // Offset from the very edge to ensure boss is fully visible
    const offset = bossSize / 2 + 50; 
    switch (selectedCorner) {
      case 'top-left':
        spawnX = offset;
        spawnY = offset;
        break;
      case 'top-right':
        spawnX = this.gameState.worldWidth - offset;
        spawnY = offset;
        break;
      case 'bottom-left':
        spawnX = offset;
        spawnY = this.gameState.worldHeight - offset;
        break;
      case 'bottom-right':
        spawnX = this.gameState.worldWidth - offset;
        spawnY = this.gameState.worldHeight - offset;
        break;
    }
    this.bossSpawnLocation = { x: spawnX, y: spawnY };

    // Initialize BossWarning for the canvas (screen coordinates)
    this.gameState.bossWarning = new BossWarning(canvasWidth, canvasHeight, selectedCorner, 3); // Warning lasts 3 seconds
    this.gameState.isBossWarningActive = true;
    console.log(`BOSS WARNING: Boss will spawn in ${selectedCorner} corner!`);
  }

  spawnBossAfterWarning() {
    if (!this.bossSpawnLocation || !this.bossSpawnCorner) {
      console.error("Attempted to spawn boss without a valid spawn location/corner.");
      return;
    }

    const bossSize = 80;
    const bossHealth = 500 + (this.gameState.waveNumber / this.bossWaveInterval - 1) * 200;
    const bossSpeed = 80;
    const bossGold = 100;
    const bossSprite = this.spriteManager.getSprite('boss');
    const bossName = `Wave ${this.gameState.waveNumber} Boss`;

    this.gameState.currentBoss = new Boss(
      this.bossSpawnLocation.x, this.bossSpawnLocation.y, bossSize, bossSpeed, 'red', bossHealth,
      bossSprite, this.soundManager, bossGold, this.gameState.damageNumbers.push.bind(this.gameState.damageNumbers),
      bossName
    );
    this.gameState.enemies.push(this.gameState.currentBoss);
    console.log(`BOSS SPAWNED: ${bossName} at (${this.bossSpawnLocation.x.toFixed(0)}, ${this.bossSpawnLocation.y.toFixed(0)})!`);

    // Clear spawn info after boss is spawned
    this.bossSpawnLocation = null;
    this.bossSpawnCorner = null;
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

  reset() {
    this.enemySpawnTimer = 0;
    this.gameState.currentBoss = undefined; // Clear boss on reset
    this.gameState.isBossWarningActive = false; // Reset warning state
    this.gameState.bossWarning = undefined; // Clear warning instance
    this.bossSpawnLocation = null;
    this.bossSpawnCorner = null;
  }
}