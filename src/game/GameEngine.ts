import { Player } from './Player';
import { InputHandler } from './InputHandler';
import { Enemy } from './Enemy';
import { AuraWeapon } from './AuraWeapon';
import { ExperienceGem } from './ExperienceGem';
import { ProjectileWeapon } from './ProjectileWeapon';
import { SpinningBladeWeapon } from './SpinningBladeWeapon';
import { MagnetPowerUp } from './MagnetPowerUp';
import { ExplosionAbility } from './ExplosionAbility';
import { ShieldAbility } from './ShieldAbility'; // Import new ability
import { clamp } from './utils';

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private inputHandler: InputHandler;
  private lastTime: number;
  private animationFrameId: number | null;
  private enemies: Enemy[];
  private experienceGems: ExperienceGem[];
  private magnetPowerUps: MagnetPowerUp[];
  private activeMagnetRadius: number = 0;
  private activeMagnetDuration: number = 0;
  private enemySpawnTimer: number;
  private enemySpawnInterval: number = 2;
  private auraWeapon: AuraWeapon;
  private projectileWeapon: ProjectileWeapon;
  private spinningBladeWeapon: SpinningBladeWeapon;
  private explosionAbility: ExplosionAbility;
  private shieldAbility: ShieldAbility; // New shield ability instance
  private gameOver: boolean = false;
  private isPaused: boolean = false;
  private onLevelUpCallback: () => void;

  // Wave system properties
  private waveNumber: number = 1;
  private waveDuration: number = 60; // seconds per wave
  private waveTimeElapsed: number = 0;

  // World dimensions
  private worldWidth: number = 2000;
  private worldHeight: number = 2000;

  // Camera position
  private cameraX: number = 0;
  private cameraY: number = 0;

  constructor(ctx: CanvasRenderingContext2D, onLevelUp: () => void) {
    this.ctx = ctx;
    this.inputHandler = new InputHandler();
    this.player = new Player(this.worldWidth / 2, this.worldHeight / 2, 30, 200, 'blue', 100, this.triggerLevelUp);
    this.lastTime = 0;
    this.animationFrameId = null;
    this.enemies = [];
    this.experienceGems = [];
    this.magnetPowerUps = [];
    this.enemySpawnTimer = 0;
    this.auraWeapon = new AuraWeapon(10, 100, 0.5);
    this.projectileWeapon = new ProjectileWeapon(15, 300, 1.5, 8, 3);
    this.spinningBladeWeapon = new SpinningBladeWeapon(10, 60, 3, 10, 1);
    this.explosionAbility = new ExplosionAbility(50, 150, 5);
    this.shieldAbility = new ShieldAbility(40, 100, 10, 10); // Initialize shield ability (radius, maxHealth, cooldown, regenRate)
    this.player.setShieldAbility(this.shieldAbility); // Pass shield ability to player
    this.onLevelUpCallback = onLevelUp;
  }

  init() {
    this.gameLoop(0);
  }

  private triggerLevelUp = () => {
    this.onLevelUpCallback();
  };

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  applyUpgrade(upgradeId: string) {
    switch (upgradeId) {
      case 'aura_damage':
        this.auraWeapon.increaseDamage(5);
        break;
      case 'player_speed':
        this.player.increaseSpeed(20);
        break;
      case 'player_health':
        this.player.increaseMaxHealth(20);
        break;
      case 'projectile_damage':
        this.projectileWeapon.increaseDamage(10);
        break;
      case 'projectile_fire_rate':
        this.projectileWeapon.decreaseFireRate(0.2);
        break;
      case 'dash_cooldown':
        this.player.reduceDashCooldown(0.3);
        break;
      case 'blade_damage':
        this.spinningBladeWeapon.increaseDamage(5);
        break;
      case 'add_blade':
        this.spinningBladeWeapon.addBlade();
        break;
      case 'explosion_damage':
        this.explosionAbility.increaseDamage(20);
        break;
      case 'explosion_cooldown':
        this.explosionAbility.reduceCooldown(1);
        break;
      case 'explosion_radius':
        this.explosionAbility.increaseRadius(20);
        break;
      case 'shield_health': // New upgrade
        this.shieldAbility.increaseMaxHealth(30);
        break;
      case 'shield_regen': // New upgrade
        this.shieldAbility.increaseRegeneration(5);
        break;
      case 'shield_cooldown': // New upgrade
        this.shieldAbility.reduceCooldown(1.5);
        break;
      default:
        console.warn(`Unknown upgrade ID: ${upgradeId}`);
    }
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

    // Base stats for different enemy types
    const enemyTypes = [
      { name: 'normal', size: 20, baseHealth: 30, baseSpeed: 100, color: 'red' },
      { name: 'fast', size: 15, baseHealth: 20, baseSpeed: 150, color: 'green' },
      { name: 'tanky', size: 25, baseHealth: 50, baseSpeed: 70, color: 'purple' },
    ];

    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

    // Scale enemy stats with wave number
    const healthMultiplier = 1 + (this.waveNumber - 1) * 0.2; // +20% health per wave
    const speedMultiplier = 1 + (this.waveNumber - 1) * 0.05; // +5% speed per wave

    const enemyHealth = Math.floor(randomType.baseHealth * healthMultiplier);
    const enemySpeed = randomType.baseSpeed * speedMultiplier;

    this.enemies.push(new Enemy(spawnX, spawnY, randomType.size, enemySpeed, randomType.color, enemyHealth));
  }

  private update(deltaTime: number) {
    if (this.gameOver || this.isPaused) return;

    this.player.update(this.inputHandler, deltaTime, this.worldWidth, this.worldHeight);

    // Trigger explosion if 'e' is pressed
    if (this.inputHandler.isPressed('e')) {
      this.explosionAbility.triggerExplosion(this.player.x, this.player.y);
    }

    this.cameraX = this.player.x - this.ctx.canvas.width / 2;
    this.cameraY = this.player.y - this.ctx.canvas.height / 2;

    this.cameraX = clamp(this.cameraX, 0, this.worldWidth - this.ctx.canvas.width);
    this.cameraY = clamp(this.cameraY, 0, this.worldHeight - this.ctx.canvas.height);

    this.enemies.forEach(enemy => enemy.update(deltaTime, this.player));

    // Update wave timer and advance wave if needed
    this.waveTimeElapsed += deltaTime;
    if (this.waveTimeElapsed >= this.waveDuration) {
      this.waveNumber++;
      this.waveTimeElapsed = 0;
      this.enemySpawnInterval = Math.max(0.5, this.enemySpawnInterval * 0.9); // Decrease spawn interval by 10% each wave, min 0.5s
      console.log(`Advancing to Wave ${this.waveNumber}! New spawn interval: ${this.enemySpawnInterval.toFixed(2)}s`);
    }

    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    this.enemies.forEach(enemy => {
      if (this.player.collidesWith(enemy)) {
        this.player.takeDamage(5); // Player takes damage from enemy collision
      }
    });

    this.auraWeapon.update(deltaTime, this.player.x, this.player.y, this.enemies);
    this.projectileWeapon.update(deltaTime, this.player.x, this.player.y, this.enemies);
    this.spinningBladeWeapon.update(deltaTime, this.player.x, this.player.y, this.enemies);
    this.explosionAbility.update(deltaTime, this.enemies);
    this.shieldAbility.update(deltaTime, this.player.x, this.player.y); // Update shield ability

    const defeatedEnemies = this.enemies.filter(enemy => !enemy.isAlive());
    defeatedEnemies.forEach(enemy => {
      this.experienceGems.push(new ExperienceGem(enemy.x, enemy.y, 10));
      // 10% chance to drop a magnet power-up
      if (Math.random() < 0.1) {
        this.magnetPowerUps.push(new MagnetPowerUp(enemy.x, enemy.y));
      }
    });
    this.enemies = this.enemies.filter(enemy => enemy.isAlive());

    // Update and collect magnet power-ups
    this.magnetPowerUps = this.magnetPowerUps.filter(magnet => {
      if (magnet.collidesWith(this.player)) {
        this.activeMagnetRadius = magnet.radius;
        this.activeMagnetDuration = magnet.duration;
        console.log(`Magnet power-up collected! Radius: ${this.activeMagnetRadius}, Duration: ${this.activeMagnetDuration}`);
        return false; // Remove power-up after collection
      }
      return true;
    });

    // Update active magnet effect
    if (this.activeMagnetDuration > 0) {
      this.activeMagnetDuration -= deltaTime;
      if (this.activeMagnetDuration <= 0) {
        this.activeMagnetRadius = 0; // Deactivate magnet
        console.log("Magnet effect ended.");
      }
    }

    this.experienceGems = this.experienceGems.filter(gem => {
      // If magnet is active and gem is within range, pull it towards the player
      if (this.activeMagnetRadius > 0) {
        const dx = this.player.x - gem.x;
        const dy = this.player.y - gem.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.activeMagnetRadius) {
          gem.pullTowards(this.player.x, this.player.y, deltaTime);
        }
      }

      if (gem.collidesWith(this.player)) {
        this.player.gainExperience(gem.value);
        return false;
      }
      return true;
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
    this.projectileWeapon.draw(this.ctx, this.cameraX, this.cameraY);
    this.spinningBladeWeapon.draw(this.ctx, this.cameraX, this.cameraY);
    this.explosionAbility.draw(this.ctx, this.cameraX, this.cameraY);

    this.experienceGems.forEach(gem => gem.draw(this.ctx, this.cameraX, this.cameraY));
    this.magnetPowerUps.forEach(magnet => magnet.draw(this.ctx, this.cameraX, this.cameraY));

    this.player.draw(this.ctx, this.cameraX, this.cameraY);
    this.shieldAbility.draw(this.ctx, this.cameraX, this.cameraY); // Draw shield

    this.enemies.forEach(enemy => enemy.draw(this.ctx, this.cameraX, this.cameraY));

    // Draw active magnet radius for visual feedback
    if (this.activeMagnetRadius > 0) {
      this.ctx.strokeStyle = 'rgba(173, 216, 230, 0.5)'; // Light blue, semi-transparent
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(this.player.x - this.cameraX, this.player.y - this.cameraY, this.activeMagnetRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Health: ${this.player.currentHealth}/${this.player.maxHealth}`, 10, 30);
    this.ctx.fillText(`Level: ${this.player.level}`, 10, 60);
    this.ctx.fillText(`XP: ${this.player.experience}/${this.player.experienceToNextLevel}`, 10, 90);
    this.ctx.fillText(`Shield: ${this.shieldAbility.shield.isActive ? `${this.shieldAbility.shield.currentHealth}/${this.shieldAbility.shield.maxHealth}` : 'Inactive'}`, 10, 120);


    // Display wave information
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Wave: ${this.waveNumber}`, this.ctx.canvas.width - 10, 30);
    this.ctx.fillText(`Time: ${Math.floor(this.waveDuration - this.waveTimeElapsed)}s`, this.ctx.canvas.width - 10, 60);


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
    if (this.isPaused) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
      return;
    }

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