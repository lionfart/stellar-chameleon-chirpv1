import { Player } from './Player';
import { InputHandler } from './InputHandler';
import { Enemy } from './Enemy';
import { AuraWeapon } from './AuraWeapon';
import { ProjectileWeapon } from './ProjectileWeapon';
import { SpinningBladeWeapon } from './SpinningBladeWeapon';
import { HomingMissileWeapon } from './HomingMissileWeapon';
import { ExplosionAbility } from './ExplosionAbility';
import { ShieldAbility } from './ShieldAbility';
import { HealAbility } from './HealAbility';
import { Vendor } from './Vendor';
import { clamp } from './utils';
import { SpriteManager } from './SpriteManager';
import { SoundManager } from './SoundManager';
import { GameState } from './GameState';
import { WaveManager } from './WaveManager';
import { PowerUpManager } from './PowerUpManager';
import { GameOverScreen } from './GameOverScreen';
import { GameWinScreen } from './GameWinScreen';
import { DamageNumber } from './DamageNumber';
import { ShooterEnemy } from './ShooterEnemy';
import { Boss } from './Boss';
import { BossWarning } from './BossWarning';
import { BossAttackVisual } from './BossAttackVisual';
import { showSuccess, showError } from '@/utils/toast';

// Yeni modüllerin importları
import { GameRenderer } from './GameRenderer';
import { ShopManager } from './ShopManager';
import { UpgradeManager } from './UpgradeManager';
import { CollisionManager } from './CollisionManager';

// Define shop item types
interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'weapon' | 'ability' | 'consumable';
}

// Minimap için basitleştirilmiş düşman verisi
export interface MinimapEnemyData {
  x: number;
  y: number;
  size: number;
}

// HUD ve Minimap için tüm oyun verilerini içeren arayüz
export interface GameDataProps {
  playerHealth: number;
  playerMaxHealth: number;
  playerLevel: number;
  playerExperience: number;
  playerExperienceToNextLevel: number;
  playerGold: number;
  shieldActive: boolean;
  shieldCurrentHealth: number;
  shieldMaxHealth: number;
  waveNumber: number;
  waveTimeRemaining: number;
  dashCooldownCurrent: number;
  dashCooldownMax: number;
  explosionCooldownCurrent: number;
  explosionCooldownMax: number;
  shieldCooldownCurrent: number;
  shieldCooldownMax: number;
  healCooldownCurrent: number;
  healCooldownMax: number;

  // Boss specific data
  bossActive: boolean;
  bossHealth: number;
  bossMaxHealth: number;
  bossName: string;

  // New properties for Princess Simge rescue
  collectedLetters: string[];
  gameWon: boolean;

  // Minimap specific data
  playerX: number;
  playerY: number;
  worldWidth: number;
  worldHeight: number;
  cameraX: number;
  cameraY: number;
  canvasWidth: number;
  canvasHeight: number;
  enemiesMinimap: MinimapEnemyData[];
  vendorX: number;
  vendorY: number;
}

const MAX_DELTA_TIME = 1 / 30; // Cap deltaTime at 30 FPS to prevent physics glitches after long pauses

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private inputHandler: InputHandler;
  private lastTime: number;
  private animationFrameId: number | null;
  private onLevelUpCallback: () => void;
  private onOpenShopCallback: (items: ShopItem[], playerGold: number) => void;
  private onCloseShopCallback: () => void;
  private onUpdateGameDataCallback: (gameData: GameDataProps) => void;
  private spriteManager: SpriteManager;
  private soundManager: SoundManager;
  private assetsLoaded: boolean = false;
  private gameOverSoundPlayed: boolean = false;
  private gameWinSoundPlayed: boolean = false;
  private backgroundMusicInstance: HTMLAudioElement | null = null;

  private gameState: GameState;
  private waveManager: WaveManager;
  private powerUpManager: PowerUpManager;

  // Yeni yöneticiler
  private gameRenderer: GameRenderer;
  private shopManager: ShopManager;
  private upgradeManager: UpgradeManager;
  private collisionManager: CollisionManager;

  private wasGameOver: boolean = false;
  private wasGameWon: boolean = false;

  private worldWidth: number = 2000;
  private worldHeight: number = 2000;

  private cameraX: number = 0;
  private cameraY: number = 0;

  constructor(ctx: CanvasRenderingContext2D, onLevelUp: () => void, onOpenShop: (items: ShopItem[], playerGold: number) => void, onCloseShop: () => void, onUpdateGameData: (gameData: GameDataProps) => void) {
    console.log("GameEngine constructor called!");
    this.ctx = ctx;
    this.inputHandler = new InputHandler();
    this.onLevelUpCallback = onLevelUp;
    this.onOpenShopCallback = onOpenShop;
    this.onCloseShopCallback = onCloseShop;
    this.onUpdateGameDataCallback = onUpdateGameData;
    this.spriteManager = new SpriteManager(this.onAllAssetsLoaded);
    this.soundManager = new SoundManager(this.onAllAssetsLoaded);

    const player = new Player(this.worldWidth / 2, this.worldHeight / 2, 30, 200, 'blue', 100, this.triggerLevelUp, undefined, this.soundManager);
    const vendor = new Vendor(this.worldWidth / 2 + 200, this.worldHeight / 2, 50, undefined);

    const startingWeapons = [
      new AuraWeapon(10, 100, 0.5),
      new ProjectileWeapon(15, 300, 1.5, 8, 3, undefined, this.soundManager),
      new SpinningBladeWeapon(10, 60, 3, 10, 1, undefined, this.soundManager),
      new HomingMissileWeapon(20, 250, 2, 12, 4, undefined, this.soundManager),
    ];
    const initialWeapon = startingWeapons[Math.floor(Math.random() * startingWeapons.length)];

    // GameOverScreen ve GameWinScreen'i GameState'e geçirmeden önce oluştur
    const gameOverScreen = new GameOverScreen(this.restartGame, this.ctx.canvas);
    const gameWinScreen = new GameWinScreen(this.restartGame, this.ctx.canvas);

    this.gameState = new GameState(player, vendor, this.worldWidth, this.worldHeight, gameOverScreen, gameWinScreen, initialWeapon);
    
    this.waveManager = new WaveManager(this.gameState, this.spriteManager, this.soundManager, this.addBossAttackVisual);
    this.powerUpManager = new PowerUpManager(this.gameState, this.spriteManager, this.soundManager);

    // Yeni yöneticileri başlat
    this.gameRenderer = new GameRenderer(this.ctx, this.gameState, this.spriteManager);
    this.shopManager = new ShopManager(this.gameState, this.spriteManager, this.soundManager, this.onOpenShopCallback, this.onCloseShopCallback);
    this.upgradeManager = new UpgradeManager(this.gameState);
    this.collisionManager = new CollisionManager(this.gameState);

    this.lastTime = 0;
    this.animationFrameId = null;

    this.loadAssets();
  }

  private loadAssets() {
    this.spriteManager.loadSprite('player', SpriteManager.getPlayerSpriteSVG(this.gameState.player.size * 2));
    this.spriteManager.loadSprite('enemy_normal', SpriteManager.getEnemyNormalSpriteSVG(40));
    this.spriteManager.loadSprite('enemy_fast', SpriteManager.getEnemyFastSpriteSVG(30));
    this.spriteManager.loadSprite('enemy_tanky', SpriteManager.getEnemyTankySpriteSVG(50));
    this.spriteManager.loadSprite('enemy_shooter', SpriteManager.getEnemyShooterSpriteSVG(45));
    this.spriteManager.loadSprite('projectile', SpriteManager.getProjectileSpriteSVG(this.gameState.projectileWeapon?.projectileRadius ? this.gameState.projectileWeapon.projectileRadius * 2 : 16));
    this.spriteManager.loadSprite('player_projectile', SpriteManager.getPlayerProjectileSpriteSVG(this.gameState.projectileWeapon?.projectileRadius ? this.gameState.projectileWeapon.projectileRadius * 2 : 16));
    this.spriteManager.loadSprite('spinning_blade', SpriteManager.getSpinningBladeSpriteSVG(this.gameState.spinningBladeWeapon?.bladeRadius ? this.gameState.spinningBladeWeapon.bladeRadius * 2 : 20));
    this.spriteManager.loadSprite('homing_missile', SpriteManager.getHomingMissileSpriteSVG(this.gameState.homingMissileWeapon?.missileRadius ? this.gameState.homingMissileWeapon.missileRadius * 2 : 24));
    this.spriteManager.loadSprite('experience_gem', SpriteManager.getExperienceGemSpriteSVG(20));
    this.spriteManager.loadSprite('magnet_powerup', SpriteManager.getMagnetPowerUpSpriteSVG(40));
    this.spriteManager.loadSprite('background_tile', SpriteManager.getBackgroundTileSVG(100));
    this.spriteManager.loadSprite('vendor', SpriteManager.getVendorSpriteSVG(this.gameState.vendor.size * 2));
    
    this.spriteManager.loadSprite('boss_s', SpriteManager.getBossSSpriteSVG(80 * 2));
    this.spriteManager.loadSprite('boss_i', SpriteManager.getBossISpriteSVG(80 * 2));
    this.spriteManager.loadSprite('boss_m', SpriteManager.getBossMSpriteSVG(80 * 2));
    this.spriteManager.loadSprite('boss_g', SpriteManager.getBossGSpriteSVG(80 * 2));
    this.spriteManager.loadSprite('boss_e', SpriteManager.getBossESpriteSVG(80 * 2));
    this.spriteManager.loadSprite('boss', SpriteManager.getBossSpriteSVG(80 * 2)); 

    this.soundManager.loadSound('dash', SoundManager.getDashSound());
    this.soundManager.loadSound('level_up', SoundManager.getLevelUpSound());
    this.soundManager.loadSound('enemy_hit', SoundManager.getEnemyHitSound());
    this.soundManager.loadSound('enemy_defeat', SoundManager.getEnemyDefeatSound());
    this.soundManager.loadSound('projectile_fire', SoundManager.getProjectileFireSound());
    this.soundManager.loadSound('homing_missile_fire', SoundManager.getHomingMissileFireSound());
    this.soundManager.loadSound('explosion', SoundManager.getExplosionSound());
    this.soundManager.loadSound('shield_activate', SoundManager.getShieldActivateSound());
    this.soundManager.loadSound('shield_deactivate', SoundManager.getShieldDeactivateSound());
    this.soundManager.loadSound('shield_break', SoundManager.getShieldBreakSound());
    this.soundManager.loadSound('gem_collect', SoundManager.getGemCollectSound());
    this.soundManager.loadSound('magnet_collect', SoundManager.getMagnetCollectSound());
    this.soundManager.loadSound('player_hit', SoundManager.getPlayerHitSound());
    this.soundManager.loadSound('game_over', SoundManager.getGameOverSound());
    this.soundManager.loadSound('game_win', SoundManager.getLevelUpSound());
    this.soundManager.loadSound('background_music', SoundManager.getBackgroundMusic());
  }

  private onAllAssetsLoaded = () => {
    if (this.spriteManager['loadedCount'] === this.spriteManager['totalCount'] &&
        this.soundManager['loadedCount'] === this.soundManager['totalCount']) {
      this.assetsLoaded = true;
      console.log("All game assets (sprites and sounds) loaded!");

      this.gameState.player.setSprite(this.spriteManager.getSprite('player'));
      if (this.gameState.projectileWeapon) {
        this.gameState.projectileWeapon['projectileSprite'] = this.spriteManager.getSprite('player_projectile');
      }
      if (this.gameState.spinningBladeWeapon) {
        this.gameState.spinningBladeWeapon['bladeSprite'] = this.spriteManager.getSprite('spinning_blade');
      }
      if (this.gameState.homingMissileWeapon) {
        this.gameState.homingMissileWeapon['missileSprite'] = this.spriteManager.getSprite('homing_missile');
      }
      this.gameState.vendor['sprite'] = this.spriteManager.getSprite('vendor');

      this.backgroundMusicInstance = this.soundManager.playSound('background_music', true, 0.3);
      this.gameLoop(0);
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

  private handleEnemyTakeDamage = (x: number, y: number, damage: number) => {
    this.gameState.damageNumbers.push(new DamageNumber(x, y, damage));
  };

  private addBossAttackVisual = (visual: BossAttackVisual) => {
    this.gameState.activeBossAttackVisuals.push(visual);
  };

  pause() {
    console.log("GameEngine: Pausing game.");
    this.gameState.isPaused = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.soundManager.stopSound(this.backgroundMusicInstance);
  }

  resume() {
    console.log("GameEngine: Resuming game.");
    this.gameState.isPaused = false;
    this.lastTime = performance.now();
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
    if (this.backgroundMusicInstance) {
      this.backgroundMusicInstance.play().catch(e => console.warn("Failed to resume background music:", e));
    }
  }

  openShop() {
    this.shopManager.openShop();
  }

  closeShop = () => {
    this.shopManager.closeShop();
  }

  purchaseItem = (itemId: string) => {
    this.shopManager.purchaseItem(itemId);
  }

  private handleBossDefeat() {
    if (this.gameState.nextLetterIndex < this.gameState.princessNameLetters.length) {
      const nextLetter = this.gameState.princessNameLetters[this.gameState.nextLetterIndex];
      this.gameState.collectedLetters.push(nextLetter);
      showSuccess(`Collected letter: ${nextLetter}!`);
      this.gameState.nextLetterIndex++;

      if (this.gameState.nextLetterIndex === this.gameState.princessNameLetters.length) {
        this.gameState.gameWon = true;
        console.log("All letters collected! Princess Simge rescued!");
      }
    }
    this.gameState.currentBoss = undefined;
  }

  restartGame = () => {
    console.log("GameEngine: Restarting game...");
    this.soundManager.stopSound(this.backgroundMusicInstance);
    this.backgroundMusicInstance = null;

    this.gameState.gameOverScreen.clearClickListener();
    this.gameState.gameWinScreen.clearClickListener();
    this.wasGameOver = false;
    this.wasGameWon = false;

    const player = new Player(this.worldWidth / 2, this.worldHeight / 2, 30, 200, 'blue', 100, this.triggerLevelUp, undefined, this.soundManager);
    const vendor = new Vendor(this.worldWidth / 2 + 200, this.worldHeight / 2, 50, undefined);

    const startingWeapons = [
      new AuraWeapon(10, 100, 0.5),
      new ProjectileWeapon(15, 300, 1.5, 8, 3, undefined, this.soundManager),
      new SpinningBladeWeapon(10, 60, 3, 10, 1, undefined, this.soundManager),
      new HomingMissileWeapon(20, 250, 2, 12, 4, undefined, this.soundManager),
    ];
    const initialWeapon = startingWeapons[Math.floor(Math.random() * startingWeapons.length)];

    // GameOverScreen ve GameWinScreen'i GameState'e geçirmeden önce oluştur
    const gameOverScreen = new GameOverScreen(this.restartGame, this.ctx.canvas);
    const gameWinScreen = new GameWinScreen(this.restartGame, this.ctx.canvas);

    this.gameState = new GameState(player, vendor, this.worldWidth, this.worldHeight, gameOverScreen, gameWinScreen, initialWeapon);
    
    this.waveManager = new WaveManager(this.gameState, this.spriteManager, this.soundManager, this.addBossAttackVisual);
    this.powerUpManager = new PowerUpManager(this.gameState, this.spriteManager, this.soundManager);

    // Yeni yöneticileri yeniden başlat
    this.gameRenderer = new GameRenderer(this.ctx, this.gameState, this.spriteManager);
    this.shopManager = new ShopManager(this.gameState, this.spriteManager, this.soundManager, this.onOpenShopCallback, this.onCloseShopCallback);
    this.upgradeManager = new UpgradeManager(this.gameState);
    this.collisionManager = new CollisionManager(this.gameState);

    this.gameState.player.setSprite(this.spriteManager.getSprite('player'));
    if (this.gameState.projectileWeapon) {
      this.gameState.projectileWeapon['projectileSprite'] = this.spriteManager.getSprite('player_projectile');
    }
    if (this.gameState.spinningBladeWeapon) {
      this.gameState.spinningBladeWeapon['bladeSprite'] = this.spriteManager.getSprite('spinning_blade');
    }
    if (this.gameState.homingMissileWeapon) {
      this.gameState.homingMissileWeapon['missileSprite'] = this.spriteManager.getSprite('homing_missile');
    }
    this.gameState.vendor['sprite'] = this.spriteManager.getSprite('vendor');

    this.gameOverSoundPlayed = false;
    this.gameWinSoundPlayed = false;
    this.lastTime = performance.now();
    this.backgroundMusicInstance = this.soundManager.playSound('background_music', true, 0.3);
    this.gameLoop(this.lastTime);
  };

  applyUpgrade(upgradeId: string) {
    this.upgradeManager.applyUpgrade(upgradeId);
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  private update(deltaTime: number) {
    if (this.gameState.isPaused || !this.assetsLoaded || this.gameState.gameOver || this.gameState.gameWon) {
      if (this.gameState.gameOver && !this.gameOverSoundPlayed) {
        this.soundManager.playSound('game_over');
        this.soundManager.stopSound(this.backgroundMusicInstance);
        this.gameOverSoundPlayed = true;
        this.gameState.gameOverScreen.activate();
      } else if (this.gameState.gameWon && !this.gameWinSoundPlayed) {
        this.soundManager.playSound('game_win');
        this.soundManager.stopSound(this.backgroundMusicInstance);
        this.gameWinSoundPlayed = true;
        this.gameState.gameWinScreen.activate();
      }
      return;
    }

    if (!this.gameState.gameOver && this.wasGameOver) {
      this.gameState.gameOverScreen.clearClickListener();
    }
    if (!this.gameState.gameWon && this.wasGameWon) {
      this.gameState.gameWinScreen.clearClickListener();
    }

    this.wasGameOver = this.gameState.gameOver;
    this.wasGameWon = this.gameState.gameWon;

    deltaTime = Math.min(deltaTime, MAX_DELTA_TIME);

    if (this.gameState.isBossWarningActive && this.gameState.bossWarning) {
      const warningActive = this.gameState.bossWarning.update(deltaTime);
      if (!warningActive) {
        this.gameState.isBossWarningActive = false;
        this.gameState.bossWarning = undefined;
        this.waveManager.spawnBossAfterWarning();
      }
      return;
    }

    console.log("GameEngine: Updating with deltaTime:", deltaTime);

    this.gameState.player.update(this.inputHandler, deltaTime, this.gameState.worldWidth, this.gameState.worldHeight);

    if (this.inputHandler.isPressed('e') && this.gameState.explosionAbility) {
      this.gameState.explosionAbility.triggerExplosion(this.gameState.player.x, this.gameState.player.y);
    }

    if (this.inputHandler.isPressed('f') && this.gameState.vendor.isPlayerInRange(this.gameState.player) && !this.gameState.showShop) {
      this.openShop();
    }

    this.cameraX = this.gameState.player.x - this.ctx.canvas.width / 2;
    this.cameraY = this.gameState.player.y - this.ctx.canvas.height / 2;

    this.cameraX = clamp(this.cameraX, 0, this.gameState.worldWidth - this.ctx.canvas.width);
    this.cameraY = clamp(this.cameraY, 0, this.gameState.worldHeight - this.ctx.canvas.height);

    this.waveManager.update(deltaTime, this.cameraX, this.cameraY, this.ctx.canvas.width, this.ctx.canvas.height);

    const separationForces: { x: number, y: number }[] = new Array(this.gameState.enemies.length).fill(null).map(() => ({ x: 0, y: 0 }));
    const separationStrength = 100;

    for (let i = 0; i < this.gameState.enemies.length; i++) {
      const enemyA = this.gameState.enemies[i];
      for (let j = i + 1; j < this.gameState.enemies.length; j++) {
        const enemyB = this.gameState.enemies[j];

        const dx = enemyA.x - enemyB.x;
        const dy = enemyA.y - enemyB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const minDistance = enemyA.size / 2 + enemyB.size / 2;
        const separationRadius = minDistance * 1.5;

        if (distance < separationRadius) {
          const overlap = separationRadius - distance;
          const forceMagnitude = (overlap / separationRadius) * separationStrength;

          if (distance === 0) {
            const randomAngle = Math.random() * Math.PI * 2;
            separationForces[i].x += Math.cos(randomAngle) * forceMagnitude;
            separationForces[i].y += Math.sin(randomAngle) * forceMagnitude;
            separationForces[j].x -= Math.cos(randomAngle) * forceMagnitude;
            separationForces[j].y -= Math.sin(randomAngle) * forceMagnitude;
          } else {
            const normalX = dx / distance;
            const normalY = dy / distance;

            separationForces[i].x += normalX * forceMagnitude;
            separationForces[i].y += normalY * forceMagnitude;
            separationForces[j].x -= normalX * forceMagnitude;
            separationForces[j].y -= normalY * forceMagnitude;
          }
        }
      }
    }

    this.gameState.enemies.forEach((enemy, index) => {
      if (enemy instanceof ShooterEnemy) {
        enemy.update(deltaTime, this.gameState.player, separationForces[index]);
      } else if (enemy instanceof Boss) {
        enemy.update(deltaTime, this.gameState.player, separationForces[index]);
      }
      else {
        enemy.update(deltaTime, this.gameState.player, separationForces[index]);
      }
    });
    this.gameState.experienceGems.forEach(gem => gem.update(deltaTime));

    this.gameState.damageNumbers = this.gameState.damageNumbers.filter(dn => dn.update(deltaTime));
    this.gameState.activeBossAttackVisuals = this.gameState.activeBossAttackVisuals.filter(visual => visual.update(deltaTime));

    // Çarpışma mantığını CollisionManager'a devret
    this.collisionManager.updateCollisions(deltaTime);

    this.gameState.auraWeapon?.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies);
    this.gameState.explosionAbility?.update(deltaTime, this.gameState.enemies);
    this.gameState.shieldAbility?.update(deltaTime, this.gameState.player.x, this.gameState.player.y);
    this.gameState.healAbility?.update(deltaTime);

    const defeatedEnemies = this.gameState.enemies.filter(enemy => !enemy.isAlive());
    defeatedEnemies.forEach(enemy => {
      this.powerUpManager.spawnExperienceGem(enemy.x, enemy.y, 10);
      this.gameState.player.gainGold(enemy.getGoldDrop());
      if (Math.random() < 0.1) {
        this.powerUpManager.spawnMagnetPowerUp(enemy.x, enemy.y);
      }
    });
    this.gameState.enemies = this.gameState.enemies.filter(enemy => enemy.isAlive());

    if (this.gameState.currentBoss && !this.gameState.currentBoss.isAlive()) {
      console.log(`Boss ${this.gameState.currentBoss.getBossName()} defeated!`);
      this.handleBossDefeat();
    }

    this.powerUpManager.update(deltaTime);

    if (!this.gameState.player.isAlive()) {
      this.gameState.gameOver = true;
      console.log("Game Over!");
    }

    this.onUpdateGameDataCallback({
      playerHealth: this.gameState.player.currentHealth,
      playerMaxHealth: this.gameState.player.maxHealth,
      playerLevel: this.gameState.player.level,
      playerExperience: this.gameState.player.experience,
      playerExperienceToNextLevel: this.gameState.player.experienceToNextLevel,
      playerGold: this.gameState.player.gold,
      shieldActive: this.gameState.shieldAbility?.shield.isActive || false,
      shieldCurrentHealth: this.gameState.shieldAbility?.shield.currentHealth || 0,
      shieldMaxHealth: this.gameState.shieldAbility?.shield.maxHealth || 0,
      waveNumber: this.gameState.waveNumber,
      waveTimeRemaining: this.gameState.waveDuration - this.gameState.waveTimeElapsed,
      
      dashCooldownCurrent: Math.max(0, this.gameState.player.getDashCooldownCurrent()),
      dashCooldownMax: this.gameState.player.getDashCooldownMax(),
      explosionCooldownCurrent: this.gameState.explosionAbility ? Math.max(0, this.gameState.explosionAbility.getCooldownCurrent()) : 0,
      explosionCooldownMax: this.gameState.explosionAbility ? this.gameState.explosionAbility.getCooldownMax() : 0,
      shieldCooldownCurrent: this.gameState.shieldAbility ? Math.max(0, this.gameState.shieldAbility.getCooldownCurrent()) : 0,
      shieldCooldownMax: this.gameState.shieldAbility ? this.gameState.shieldAbility.getCooldownMax() : 0,
      healCooldownCurrent: this.gameState.healAbility ? Math.max(0, this.gameState.healAbility.getCooldownCurrent()) : 0,
      healCooldownMax: this.gameState.healAbility ? this.gameState.healAbility.getCooldownMax() : 0,

      bossActive: !!this.gameState.currentBoss && this.gameState.currentBoss.isAlive(),
      bossHealth: this.gameState.currentBoss?.currentHealth || 0,
      bossMaxHealth: this.gameState.currentBoss?.maxHealth || 0,
      bossName: this.gameState.currentBoss?.getBossName() || '',

      collectedLetters: this.gameState.collectedLetters,
      gameWon: this.gameState.gameWon,

      playerX: this.gameState.player.x,
      playerY: this.gameState.player.y,
      worldWidth: this.gameState.worldWidth,
      worldHeight: this.gameState.worldHeight,
      cameraX: this.cameraX,
      cameraY: this.cameraY,
      canvasWidth: this.ctx.canvas.width,
      canvasHeight: this.ctx.canvas.height,
      enemiesMinimap: this.gameState.enemies.map(enemy => ({ x: enemy.x, y: enemy.y, size: enemy.size })),
      vendorX: this.gameState.vendor.x,
      vendorY: this.gameState.vendor.y,
    });
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

    this.gameRenderer.draw(this.cameraX, this.cameraY);
  }

  private gameLoop = (currentTime: number) => {
    if (this.gameState.isPaused || !this.assetsLoaded || this.gameState.gameOver || this.gameState.gameWon) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
      return;
    }

    let deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    deltaTime = Math.min(deltaTime, MAX_DELTA_TIME);

    this.update(deltaTime);
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.inputHandler.destroy();
    this.gameState.gameOverScreen.clearClickListener();
    this.gameState.gameWinScreen.clearClickListener();
    this.wasGameOver = false;
    this.wasGameWon = false;
    this.soundManager.stopSound(this.backgroundMusicInstance);
  }
}