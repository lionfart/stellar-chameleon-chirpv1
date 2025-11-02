import { Player } from './Player';
import { InputHandler } from './InputHandler';
import { Enemy } from './Enemy';
import { AuraWeapon } from './AuraWeapon';
import { ProjectileWeapon } from './ProjectileWeapon';
import { SpinningBladeWeapon } from './SpinningBladeWeapon';
import { ExplosionAbility } from './ExplosionAbility';
import { ShieldAbility } from './ShieldAbility';
import { clamp } from './utils';
import { SpriteManager } from './SpriteManager';
import { SoundManager } from './SoundManager';
import { GameState } from './GameState';
import { WaveManager } from './WaveManager';
import { PowerUpManager } from './PowerUpManager';
import { HUD } from './HUD';
import { GameOverScreen } from './GameOverScreen';

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private inputHandler: InputHandler;
  private lastTime: number;
  private animationFrameId: number | null;
  private onLevelUpCallback: () => void;
  private spriteManager: SpriteManager;
  private soundManager: SoundManager;
  private assetsLoaded: boolean = false;

  private gameState: GameState;
  private waveManager: WaveManager;
  private powerUpManager: PowerUpManager;
  private hud: HUD;
  private gameOverScreen: GameOverScreen;

  // World dimensions
  private worldWidth: number = 2000;
  private worldHeight: number = 2000;

  // Camera position
  private cameraX: number = 0;
  private cameraY: number = 0;

  constructor(ctx: CanvasRenderingContext2D, onLevelUp: () => void) {
    this.ctx = ctx;
    this.inputHandler = new InputHandler();
    this.onLevelUpCallback = onLevelUp;
    this.spriteManager = new SpriteManager(this.onAllAssetsLoaded);
    this.soundManager = new SoundManager(this.onAllAssetsLoaded);

    // Initialize game objects with placeholder sprites/sounds for now, will be updated after assets load
    const player = new Player(this.worldWidth / 2, this.worldHeight / 2, 30, 200, 'blue', 100, this.triggerLevelUp, undefined, undefined);
    const auraWeapon = new AuraWeapon(10, 100, 0.5);
    const projectileWeapon = new ProjectileWeapon(15, 300, 1.5, 8, 3, undefined, undefined);
    const spinningBladeWeapon = new SpinningBladeWeapon(10, 60, 3, 10, 1, undefined, undefined);
    const explosionAbility = new ExplosionAbility(50, 150, 5, undefined);
    const shieldAbility = new ShieldAbility(40, 100, 10, 10, undefined);
    player.setShieldAbility(shieldAbility);

    this.gameState = new GameState(player, auraWeapon, projectileWeapon, spinningBladeWeapon, explosionAbility, shieldAbility, this.worldWidth, this.worldHeight);
    this.waveManager = new WaveManager(this.gameState, this.spriteManager, this.soundManager);
    this.powerUpManager = new PowerUpManager(this.gameState, this.spriteManager, this.soundManager);
    this.hud = new HUD(this.gameState);
    this.gameOverScreen = new GameOverScreen(this.restartGame, this.ctx.canvas);

    this.lastTime = 0;
    this.animationFrameId = null;

    this.loadAssets();
  }

  private loadAssets() {
    // Sprites
    this.spriteManager.loadSprite('player', SpriteManager.getPlayerSpriteSVG(this.gameState.player.size * 2));
    this.spriteManager.loadSprite('enemy_normal', SpriteManager.getEnemyNormalSpriteSVG(40));
    this.spriteManager.loadSprite('enemy_fast', SpriteManager.getEnemyFastSpriteSVG(30));
    this.spriteManager.loadSprite('enemy_tanky', SpriteManager.getEnemyTankySpriteSVG(50));
    this.spriteManager.loadSprite('projectile', SpriteManager.getProjectileSpriteSVG(this.gameState.projectileWeapon.projectileRadius * 2));
    this.spriteManager.loadSprite('spinning_blade', SpriteManager.getSpinningBladeSpriteSVG(this.gameState.spinningBladeWeapon.bladeRadius * 2));
    this.spriteManager.loadSprite('experience_gem', SpriteManager.getExperienceGemSpriteSVG(20));
    this.spriteManager.loadSprite('magnet_powerup', SpriteManager.getMagnetPowerUpSpriteSVG(40));
    this.spriteManager.loadSprite('background_tile', SpriteManager.getBackgroundTileSVG(100));

    // Sounds (using placeholder base64 audio)
    this.soundManager.loadSound('dash', SoundManager.getDashSound());
    this.soundManager.loadSound('level_up', SoundManager.getLevelUpSound());
    this.soundManager.loadSound('enemy_hit', SoundManager.getEnemyHitSound());
    this.soundManager.loadSound('enemy_defeat', SoundManager.getEnemyDefeatSound());
    this.soundManager.loadSound('projectile_fire', SoundManager.getProjectileFireSound());
    this.soundManager.loadSound('explosion', SoundManager.getExplosionSound());
    this.soundManager.loadSound('shield_activate', SoundManager.getShieldActivateSound());
    this.soundManager.loadSound('shield_deactivate', SoundManager.getShieldDeactivateSound());
    this.soundManager.loadSound('shield_break', SoundManager.getShieldBreakSound());
    this.soundManager.loadSound('gem_collect', SoundManager.getGemCollectSound());
    this.soundManager.loadSound('magnet_collect', SoundManager.getMagnetCollectSound());
  }

  private onAllAssetsLoaded = () => {
    if (this.spriteManager['loadedCount'] === this.spriteManager['totalCount'] &&
        this.soundManager['loadedCount'] === this.soundManager['totalCount']) {
      this.assetsLoaded = true;
      console.log("All game assets (sprites and sounds) loaded!");

      // Re-initialize game objects with loaded sprites and soundManager
      this.gameState.player.setSprite(this.spriteManager.getSprite('player'));
      this.gameState.player['soundManager'] = this.soundManager; // Direct assignment for now, better to pass in constructor
      this.gameState.projectileWeapon['projectileSprite'] = this.spriteManager.getSprite('projectile');
      this.gameState.projectileWeapon['soundManager'] = this.soundManager;
      this.gameState.spinningBladeWeapon['bladeSprite'] = this.spriteManager.getSprite('spinning_blade');
      this.gameState.spinningBladeWeapon['soundManager'] = this.soundManager;
      this.gameState.explosionAbility['soundManager'] = this.soundManager;
      this.gameState.shieldAbility['soundManager'] = this.soundManager;
      this.gameState.shieldAbility.shield['soundManager'] = this.soundManager;


      this.gameLoop(0); // Start the game loop only after assets are loaded
    }
  };

  init() {
    if (this.assetsLoaded) {
      this.gameLoop(0);
    }
  }

  private triggerLevelUp = () => {
    this.soundManager.playSound('level_up');
    this.onLevelUpCallback();
  };

  pause() {
    this.gameState.isPaused = true;
  }

  resume() {
    this.gameState.isPaused = false;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  restartGame = () => {
    this.gameState.reset();
    this.waveManager.reset();
    this.powerUpManager.reset();

    // Re-initialize player and abilities to their starting states
    this.gameState.player = new Player(this.worldWidth / 2, this.worldHeight / 2, 30, 200, 'blue', 100, this.triggerLevelUp, this.spriteManager.getSprite('player'), this.soundManager);
    this.gameState.auraWeapon = new AuraWeapon(10, 100, 0.5);
    this.gameState.projectileWeapon = new ProjectileWeapon(15, 300, 1.5, 8, 3, this.spriteManager.getSprite('projectile'), this.soundManager);
    this.gameState.spinningBladeWeapon = new SpinningBladeWeapon(10, 60, 3, 10, 1, this.spriteManager.getSprite('spinning_blade'), this.soundManager);
    this.gameState.explosionAbility = new ExplosionAbility(50, 150, 5, this.soundManager);
    this.gameState.shieldAbility = new ShieldAbility(40, 100, 10, 10, this.soundManager);
    this.gameState.player.setShieldAbility(this.gameState.shieldAbility);

    this.gameOverScreen.clearClickListener(); // Clear the old listener
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  };

  applyUpgrade(upgradeId: string) {
    switch (upgradeId) {
      case 'aura_damage':
        this.gameState.auraWeapon.increaseDamage(5);
        break;
      case 'player_speed':
        this.gameState.player.increaseSpeed(20);
        break;
      case 'player_health':
        this.gameState.player.increaseMaxHealth(20);
        break;
      case 'projectile_damage':
        this.gameState.projectileWeapon.increaseDamage(10);
        break;
      case 'projectile_fire_rate':
        this.gameState.projectileWeapon.decreaseFireRate(0.2);
        break;
      case 'dash_cooldown':
        this.gameState.player.reduceDashCooldown(0.3);
        break;
      case 'blade_damage':
        this.gameState.spinningBladeWeapon.increaseDamage(5);
        break;
      case 'add_blade':
        this.gameState.spinningBladeWeapon.addBlade();
        break;
      case 'explosion_damage':
        this.gameState.explosionAbility.increaseDamage(20);
        break;
      case 'explosion_cooldown':
        this.gameState.explosionAbility.reduceCooldown(1);
        break;
      case 'explosion_radius':
        this.gameState.explosionAbility.increaseRadius(20);
        break;
      case 'shield_health':
        this.gameState.shieldAbility.increaseMaxHealth(30);
        break;
      case 'shield_regen':
        this.gameState.shieldAbility.increaseRegeneration(5);
        break;
      case 'shield_cooldown':
        this.gameState.shieldAbility.reduceCooldown(1.5);
        break;
      default:
        console.warn(`Unknown upgrade ID: ${upgradeId}`);
    }
  }

  private update(deltaTime: number) {
    if (this.gameState.gameOver || this.gameState.isPaused || !this.assetsLoaded) return;

    this.gameState.player.update(this.inputHandler, deltaTime, this.gameState.worldWidth, this.gameState.worldHeight);

    // Trigger explosion if 'e' is pressed
    if (this.inputHandler.isPressed('e')) {
      this.gameState.explosionAbility.triggerExplosion(this.gameState.player.x, this.gameState.player.y);
    }

    this.cameraX = this.gameState.player.x - this.ctx.canvas.width / 2;
    this.cameraY = this.gameState.player.y - this.ctx.canvas.height / 2;

    this.cameraX = clamp(this.cameraX, 0, this.gameState.worldWidth - this.ctx.canvas.width);
    this.cameraY = clamp(this.cameraY, 0, this.gameState.worldHeight - this.ctx.canvas.height);

    this.waveManager.update(deltaTime, this.cameraX, this.cameraY, this.ctx.canvas.width, this.ctx.canvas.height);

    this.gameState.enemies.forEach(enemy => enemy.update(deltaTime, this.gameState.player));
    this.gameState.experienceGems.forEach(gem => gem.update(deltaTime));

    this.gameState.enemies.forEach(enemy => {
      if (this.gameState.player.collidesWith(enemy)) {
        this.gameState.player.takeDamage(5); // Player takes damage from enemy collision
      }
    });

    this.gameState.auraWeapon.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies);
    this.gameState.projectileWeapon.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies);
    this.gameState.spinningBladeWeapon.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies);
    this.gameState.explosionAbility.update(deltaTime, this.gameState.enemies);
    this.gameState.shieldAbility.update(deltaTime, this.gameState.player.x, this.gameState.player.y);

    const defeatedEnemies = this.gameState.enemies.filter(enemy => !enemy.isAlive());
    defeatedEnemies.forEach(enemy => { // Fixed typo here
      this.powerUpManager.spawnExperienceGem(enemy.x, enemy.y, 10);
      // 10% chance to drop a magnet power-up
      if (Math.random() < 0.1) {
        this.powerUpManager.spawnMagnetPowerUp(enemy.x, enemy.y);
      }
    });
    this.gameState.enemies = this.gameState.enemies.filter(enemy => enemy.isAlive());

    this.powerUpManager.update(deltaTime);

    if (!this.gameState.player.isAlive()) {
      this.gameState.gameOver = true;
      console.log("Game Over!");
    }
  }

  private draw() {
    if (!this.assetsLoaded) {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.fillStyle = 'white';
      this.ctx.font = '30px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Loading Assets...', this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
      return;
    }

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Draw tiled background
    const backgroundTile = this.spriteManager.getSprite('background_tile');
    if (backgroundTile) {
      const tileWidth = backgroundTile.width;
      const tileHeight = backgroundTile.height;
      const startX = -this.cameraX % tileWidth;
      const startY = -this.cameraY % tileHeight;

      for (let x = startX; x < this.ctx.canvas.width; x += tileWidth) {
        for (let y = startY; y < this.ctx.canvas.height; y += tileHeight) {
          this.ctx.drawImage(backgroundTile, x, y, tileWidth, tileHeight);
        }
      }
    } else {
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    // Draw world border
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      -this.cameraX,
      -this.cameraY,
      this.gameState.worldWidth,
      this.gameState.worldHeight
    );

    this.gameState.auraWeapon.draw(this.ctx, this.gameState.player.x, this.gameState.player.y, this.cameraX, this.cameraY);
    this.gameState.projectileWeapon.draw(this.ctx, this.cameraX, this.cameraY);
    this.gameState.spinningBladeWeapon.draw(this.ctx, this.cameraX, this.cameraY);
    this.gameState.explosionAbility.draw(this.ctx, this.cameraX, this.cameraY);

    this.gameState.experienceGems.forEach(gem => gem.draw(this.ctx, this.cameraX, this.cameraY));
    this.gameState.magnetPowerUps.forEach(magnet => magnet.draw(this.ctx, this.cameraX, this.cameraY));

    this.gameState.player.draw(this.ctx, this.cameraX, this.cameraY);
    this.gameState.shieldAbility.draw(this.ctx, this.cameraX, this.cameraY);

    this.gameState.enemies.forEach(enemy => enemy.draw(this.ctx, this.cameraX, this.cameraY));

    // Draw active magnet radius for visual feedback
    if (this.gameState.activeMagnetRadius > 0) {
      this.ctx.strokeStyle = 'rgba(173, 216, 230, 0.5)'; // Light blue, semi-transparent
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(this.gameState.player.x - this.cameraX, this.gameState.player.y - this.cameraY, this.gameState.activeMagnetRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.hud.draw(this.ctx, this.ctx.canvas.width, this.ctx.canvas.height);

    if (this.gameState.gameOver) {
      this.gameOverScreen.draw(this.ctx, this.ctx.canvas.width, this.ctx.canvas.height);
    } else {
      this.gameOverScreen.clearClickListener(); // Ensure no click listener when game is not over
    }
  }

  private gameLoop = (currentTime: number) => {
    if (this.gameState.isPaused || !this.assetsLoaded) {
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
    this.gameOverScreen.clearClickListener(); // Ensure click listener is removed on stop
  }
}