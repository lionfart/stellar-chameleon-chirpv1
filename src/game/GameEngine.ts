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
import { DamageNumber } from './DamageNumber';
import { ShooterEnemy } from './ShooterEnemy';
import { showSuccess, showError } from '@/utils/toast';
import { ExperienceGem } from './ExperienceGem';
import { MagnetPowerUp } from './MagnetPowerUp';
import { Projectile } from './Projectile';
import { SpinningBlade } from './SpinningBlade';
import { HomingMissile } from './HomingMissile';

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
  private backgroundMusicInstance: HTMLAudioElement | null = null;

  // Add these properties to the class
  private gameState: GameState;
  private waveManager: WaveManager;
  private powerUpManager: PowerUpManager;
  private gameOverScreen: GameOverScreen;

  // World dimensions
  private worldWidth: number = 2000;
  private worldHeight: number = 2000;

  // Camera position
  private cameraX: number = 0;
  private cameraY: number = 0;

  private shopItems: ShopItem[] = [
    { id: 'buy_aura_weapon', name: 'Aura Weapon', description: 'A constant damage aura around you.', cost: 100, type: 'weapon' },
    { id: 'buy_projectile_weapon', name: 'Projectile Weapon', description: 'Fires projectiles at the closest enemy.', cost: 100, type: 'weapon' },
    { id: 'buy_spinning_blade_weapon', name: 'Spinning Blade Weapon', description: 'Blades orbit you, damaging enemies on contact.', cost: 100, type: 'weapon' },
    { id: 'buy_homing_missile_weapon', name: 'Homing Missile Weapon', description: 'Fires missiles that track the closest enemy.', cost: 120, type: 'weapon' },
    { id: 'buy_explosion_ability', name: 'Explosion Ability', description: 'Trigger an explosion around you (E key).', cost: 150, type: 'ability' },
    { id: 'buy_shield_ability', name: 'Shield Ability', description: 'Activate a protective shield (Q key).', cost: 150, type: 'ability' },
    { id: 'buy_heal_ability', name: 'Heal Ability', description: 'Restore player health (R key).', cost: 120, type: 'ability' },
    { id: 'buy_health_potion', name: 'Health Potion', description: 'Instantly restores 50 health.', cost: 50, type: 'consumable' },
  ];

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

    // Randomly select one starting weapon
    const startingWeapons = [
      new AuraWeapon(10, 100, 0.5),
      new ProjectileWeapon(15, 300, 1.5, 8, 3, undefined, this.soundManager),
      new SpinningBladeWeapon(10, 60, 3, 10, 1, undefined, this.soundManager),
      new HomingMissileWeapon(20, 250, 2, 12, 4, undefined, this.soundManager),
    ];
    const initialWeapon = startingWeapons[Math.floor(Math.random() * startingWeapons.length)];

    this.gameState = new GameState(player, vendor, this.worldWidth, this.worldHeight, initialWeapon);
    
    this.waveManager = new WaveManager(this.gameState, this.spriteManager, this.soundManager);
    this.powerUpManager = new PowerUpManager(this.gameState, this.spriteManager, this.soundManager);
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
    this.spriteManager.loadSprite('enemy_shooter', SpriteManager.getEnemyShooterSpriteSVG(45));
    this.spriteManager.loadSprite('projectile', SpriteManager.getProjectileSpriteSVG(this.gameState.projectileWeapon?.projectileRadius ? this.gameState.projectileWeapon.projectileRadius * 2 : 16)); // Generic enemy projectile
    this.spriteManager.loadSprite('player_projectile', SpriteManager.getPlayerProjectileSpriteSVG(this.gameState.projectileWeapon?.projectileRadius ? this.gameState.projectileWeapon.projectileRadius * 2 : 16)); // Player specific projectile
    this.spriteManager.loadSprite('spinning_blade', SpriteManager.getSpinningBladeSpriteSVG(this.gameState.spinningBladeWeapon?.bladeRadius ? this.gameState.spinningBladeWeapon.bladeRadius * 2 : 20));
    this.spriteManager.loadSprite('homing_missile', SpriteManager.getHomingMissileSpriteSVG(this.gameState.homingMissileWeapon?.missileRadius ? this.gameState.homingMissileWeapon.missileRadius * 2 : 24));
    this.spriteManager.loadSprite('experience_gem', SpriteManager.getExperienceGemSpriteSVG(20));
    this.spriteManager.loadSprite('magnet_powerup', SpriteManager.getMagnetPowerUpSpriteSVG(40));
    this.spriteManager.loadSprite('background_tile', SpriteManager.getBackgroundTileSVG(100));
    this.spriteManager.loadSprite('vendor', SpriteManager.getVendorSpriteSVG(this.gameState.vendor.size * 2));

    // Sounds (using placeholder base64 audio)
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

  // Callback for enemies to report damage taken
  private handleEnemyTakeDamage = (x: number, y: number, damage: number) => {
    this.gameState.damageNumbers.push(new DamageNumber(x, y, damage));
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
    if (this.gameState.showShop) return;
    console.log("GameEngine: Opening shop.");
    this.gameState.showShop = true;
    this.pause();
    this.onOpenShopCallback(this.shopItems.filter(item => {
      if (item.id === 'buy_aura_weapon' && this.gameState.auraWeapon) return false;
      if (item.id === 'buy_projectile_weapon' && this.gameState.projectileWeapon) return false;
      if (item.id === 'buy_spinning_blade_weapon' && this.gameState.spinningBladeWeapon) return false;
      if (item.id === 'buy_homing_missile_weapon' && this.gameState.homingMissileWeapon) return false;
      if (item.id === 'buy_explosion_ability' && this.gameState.explosionAbility) return false;
      if (item.id === 'buy_shield_ability' && this.gameState.shieldAbility) return false;
      if (item.id === 'buy_heal_ability' && this.gameState.healAbility) return false;
      return true;
    }), this.gameState.player.gold);
  }

  closeShop = () => {
    if (!this.gameState.showShop) return;
    console.log("GameEngine: Closing shop.");
    this.gameState.showShop = false;
    this.onCloseShopCallback();
    this.resume();
  }

  purchaseItem = (itemId: string) => {
    const item = this.shopItems.find(i => i.id === itemId);
    if (!item) {
      showError("Item not found!");
      return;
    }

    if (this.gameState.player.spendGold(item.cost)) {
      showSuccess(`Purchased ${item.name}!`);
      switch (itemId) {
        case 'buy_aura_weapon':
          this.gameState.auraWeapon = new AuraWeapon(10, 100, 0.5);
          break;
        case 'buy_projectile_weapon':
          this.gameState.projectileWeapon = new ProjectileWeapon(15, 300, 1.5, 8, 3, this.spriteManager.getSprite('player_projectile'), this.soundManager);
          break;
        case 'buy_spinning_blade_weapon':
          this.gameState.spinningBladeWeapon = new SpinningBladeWeapon(10, 60, 3, 10, 1, this.spriteManager.getSprite('spinning_blade'), this.soundManager);
          break;
        case 'buy_homing_missile_weapon':
          this.gameState.homingMissileWeapon = new HomingMissileWeapon(20, 250, 2, 12, 4, this.spriteManager.getSprite('homing_missile'), this.soundManager);
          break;
        case 'buy_explosion_ability':
          this.gameState.explosionAbility = new ExplosionAbility(50, 150, 5, this.soundManager);
          break;
        case 'buy_shield_ability':
          this.gameState.shieldAbility = new ShieldAbility(40, 100, 10, 10, this.soundManager);
          this.gameState.player.setShieldAbility(this.gameState.shieldAbility);
          break;
        case 'buy_heal_ability':
          this.gameState.healAbility = new HealAbility(30, 15, this.soundManager);
          this.gameState.player.setHealAbility(this.gameState.healAbility);
          break;
        case 'buy_health_potion':
          this.gameState.player.currentHealth = Math.min(this.gameState.player.maxHealth, this.gameState.player.currentHealth + 50);
          break;
        default:
          console.warn(`Unknown item purchased: ${itemId}`);
      }
      this.onOpenShopCallback(this.shopItems.filter(i => {
        if (i.id === 'buy_aura_weapon' && this.gameState.auraWeapon) return false;
        if (i.id === 'buy_projectile_weapon' && this.gameState.projectileWeapon) return false;
        if (i.id === 'buy_spinning_blade_weapon' && this.gameState.spinningBladeWeapon) return false;
        if (i.id === 'buy_homing_missile_weapon' && this.gameState.homingMissileWeapon) return false;
        if (i.id === 'buy_explosion_ability' && this.gameState.explosionAbility) return false;
        if (i.id === 'buy_shield_ability' && this.gameState.shieldAbility) return false;
        if (i.id === 'buy_heal_ability' && this.gameState.healAbility) return false;
        return true;
      }), this.gameState.player.gold);
    } else {
      showError("Not enough gold!");
    }
  }

  restartGame = () => {
    console.log("GameEngine: Restarting game...");
    this.soundManager.stopSound(this.backgroundMusicInstance);
    this.backgroundMusicInstance = null;

    const player = new Player(this.worldWidth / 2, this.worldHeight / 2, 30, 200, 'blue', 100, this.triggerLevelUp, undefined, this.soundManager);
    const vendor = new Vendor(this.worldWidth / 2 + 200, this.worldHeight / 2, 50, undefined);

    const startingWeapons = [
      new AuraWeapon(10, 100, 0.5),
      new ProjectileWeapon(15, 300, 1.5, 8, 3, undefined, this.soundManager),
      new SpinningBladeWeapon(10, 60, 3, 10, 1, undefined, this.soundManager),
      new HomingMissileWeapon(20, 250, 2, 12, 4, undefined, this.soundManager),
    ];
    const initialWeapon = startingWeapons[Math.floor(Math.random() * startingWeapons.length)];

    this.gameState = new GameState(player, vendor, this.worldWidth, this.worldHeight, initialWeapon);
    
    this.waveManager = new WaveManager(this.gameState, this.spriteManager, this.soundManager);
    this.powerUpManager = new PowerUpManager(this.gameState, this.spriteManager, this.soundManager);
    this.gameOverScreen = new GameOverScreen(this.restartGame, this.ctx.canvas);

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

    this.gameOverScreen.clearClickListener();
    this.gameOverSoundPlayed = false;
    this.lastTime = performance.now();
    this.backgroundMusicInstance = this.soundManager.playSound('background_music', true, 0.3);
    this.gameLoop(this.lastTime);
  };

  applyUpgrade(upgradeId: string) {
    switch (upgradeId) {
      case 'aura_damage':
        this.gameState.auraWeapon?.increaseDamage(5);
        break;
      case 'player_speed':
        this.gameState.player.increaseSpeed(20);
        break;
      case 'player_health':
        this.gameState.player.increaseMaxHealth(20);
        break;
      case 'projectile_damage':
        this.gameState.projectileWeapon?.increaseDamage(10);
        break;
      case 'projectile_fire_rate':
        this.gameState.projectileWeapon?.decreaseFireRate(0.2);
        break;
      case 'homing_missile_damage':
        this.gameState.homingMissileWeapon?.increaseDamage(10);
        break;
      case 'homing_missile_fire_rate':
        this.gameState.homingMissileWeapon?.decreaseFireRate(0.3);
        break;
      case 'homing_missile_count':
        this.gameState.homingMissileWeapon?.increaseMissilesPerShot(1);
        break;
      case 'dash_cooldown':
        this.gameState.player.reduceDashCooldown(0.3);
        break;
      case 'blade_damage':
        this.gameState.spinningBladeWeapon?.increaseDamage(5);
        break;
      case 'add_blade':
        this.gameState.spinningBladeWeapon?.addBlade();
        break;
      case 'explosion_damage':
        this.gameState.explosionAbility?.increaseDamage(20);
        break;
      case 'explosion_cooldown':
        this.gameState.explosionAbility?.reduceCooldown(1);
        break;
      case 'explosion_radius':
        this.gameState.explosionAbility?.increaseRadius(20);
        break;
      case 'shield_health':
        this.gameState.shieldAbility?.increaseMaxHealth(30);
        break;
      case 'shield_regen':
        this.gameState.shieldAbility?.increaseRegeneration(5);
        break;
      case 'shield_cooldown':
        this.gameState.shieldAbility?.reduceCooldown(1.5);
        break;
      case 'heal_amount':
        this.gameState.healAbility?.increaseHealAmount(10);
        break;
      case 'heal_cooldown':
        this.gameState.healAbility?.reduceCooldown(2);
        break;
      case 'player_magnet_radius':
        this.gameState.player.increaseMagnetRadius(50);
        break;
      case 'experience_boost':
        this.gameState.player.increaseExperienceGain(0.1);
        break;
      case 'gold_boost':
        this.gameState.player.increaseGoldGain(0.1);
        break;
      default:
        console.warn(`Unknown upgrade ID: ${upgradeId}`);
    }
  }

  private update(deltaTime: number) {
    if (this.gameState.isPaused || !this.assetsLoaded) {
      if (this.gameState.gameOver && !this.gameOverSoundPlayed) {
        this.soundManager.playSound('game_over');
        this.soundManager.stopSound(this.backgroundMusicInstance);
        this.gameOverSoundPlayed = true;
      }
      return;
    }

    deltaTime = Math.min(deltaTime, MAX_DELTA_TIME);

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

    this.gameState.enemies.forEach(enemy => {
      if (enemy instanceof ShooterEnemy) {
        enemy.update(deltaTime, this.gameState.player);
      } else {
        enemy.update(deltaTime, this.gameState.player);
      }
    });
    this.gameState.experienceGems.forEach(gem => gem.update(deltaTime));

    // Update and filter damage numbers
    this.gameState.damageNumbers = this.gameState.damageNumbers.filter(dn => dn.update(deltaTime));

    this.gameState.enemies.forEach(enemy => {
      if (this.gameState.player.collidesWith(enemy)) {
        this.gameState.player.takeDamage(5);
      }
    });

    this.gameState.auraWeapon?.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies);
    this.gameState.projectileWeapon?.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies);
    this.gameState.spinningBladeWeapon?.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies);
    this.gameState.homingMissileWeapon?.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies);
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

    this.powerUpManager.update(deltaTime);

    if (!this.gameState.player.isAlive()) {
      this.gameState.gameOver = true;
      console.log("Game Over!");
    }

    // Update game data via callback for HUD and Minimap
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

      // Minimap specific data
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

  // New helper to get 2.5D drawing properties
  public getDrawProperties(entity: { x: number; y: number; size: number }) {
    const minScale = 0.8; // Objects at world top are 80% size
    const maxScale = 1.2; // Objects at world bottom are 120% size
    const scaleRange = maxScale - minScale;

    // Calculate scale based on Y position (0 at top, worldHeight at bottom)
    const normalizedY = entity.y / this.worldHeight;
    const scale = minScale + normalizedY * scaleRange;

    // Adjust drawY to keep the "bottom" of the object aligned with its world Y
    // This makes objects appear to stand on the ground plane.
    const scaledSize = entity.size * scale;
    const verticalOffset = (scaledSize - entity.size) / 2; // Difference in size due to scaling
    const drawY = entity.y - verticalOffset;

    // Shadow properties
    const shadowSizeMultiplier = 0.8; // Shadow is slightly smaller than the base
    const shadowAlpha = 0.3 * (1 - normalizedY * 0.5); // Shadows fade out further up
    const shadowOffset = entity.size * 0.1 * scale; // Shadow slightly offset down-right

    return {
      drawX: entity.x,
      drawY: drawY,
      scale: scale,
      scaledSize: scaledSize,
      shadowOffset: shadowOffset,
      shadowRadius: (entity.size / 2) * shadowSizeMultiplier * scale,
      shadowAlpha: shadowAlpha,
    };
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

    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      -this.cameraX,
      -this.cameraY,
      this.gameState.worldWidth,
      this.gameState.worldHeight
    );

    // Collect all drawable entities for Z-ordering
    const drawableEntities: { entity: any; y: number; drawFn: (ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, gameEngine: GameEngine) => void }[] = [];

    // Add player and vendor
    drawableEntities.push({ entity: this.gameState.player, y: this.gameState.player.y, drawFn: (ctx, cx, cy, ge) => this.gameState.player.draw(ctx, cx, cy, ge) });
    drawableEntities.push({ entity: this.gameState.vendor, y: this.gameState.vendor.y, drawFn: (ctx, cx, cy, ge) => this.gameState.vendor.draw(ctx, cx, cy, ge) });

    // Add enemies
    this.gameState.enemies.forEach(enemy => {
      drawableEntities.push({ entity: enemy, y: enemy.y, drawFn: (ctx, cx, cy, ge) => enemy.draw(ctx, cx, cy, ge) });
    });

    // Add experience gems
    this.gameState.experienceGems.forEach(gem => {
      drawableEntities.push({ entity: gem, y: gem.y, drawFn: (ctx, cx, cy, ge) => gem.draw(ctx, cx, cy, ge) });
    });

    // Add magnet power-ups
    this.gameState.magnetPowerUps.forEach(magnet => {
      drawableEntities.push({ entity: magnet, y: magnet.y, drawFn: (ctx, cx, cy, ge) => magnet.draw(ctx, cx, cy, ge) });
    });

    // Sort entities by their Y-coordinate for correct 2.5D rendering (further objects drawn first)
    drawableEntities.sort((a, b) => a.y - b.y);

    // Draw sorted entities
    drawableEntities.forEach(({ entity, drawFn }) => {
      drawFn(this.ctx, this.cameraX, this.cameraY, this);
    });

    // Draw weapons and abilities (these are usually drawn relative to player or independently, so their Z-order with other entities is less critical)
    this.gameState.auraWeapon?.draw(this.ctx, this.gameState.player.x, this.gameState.player.y, this.cameraX, this.cameraY);
    this.gameState.projectileWeapon?.draw(this.ctx, this.cameraX, this.cameraY, this);
    this.gameState.spinningBladeWeapon?.draw(this.ctx, this.cameraX, this.cameraY, this);
    this.gameState.homingMissileWeapon?.draw(this.ctx, this.cameraX, this.cameraY, this);
    this.gameState.explosionAbility?.draw(this.ctx, this.cameraX, this.cameraY);
    this.gameState.shieldAbility?.draw(this.ctx, this.cameraX, this.cameraY);

    // Draw damage numbers (always on top)
    this.gameState.damageNumbers.forEach(dn => dn.draw(this.ctx, this.cameraX, this.cameraY, this));

    if (this.gameState.activeMagnetRadius > 0) {
      const { drawX, drawY, scaledSize, scale } = this.getDrawProperties({ x: this.gameState.player.x, y: this.gameState.player.y, size: this.gameState.player.size });
      const magnetDrawRadius = this.gameState.activeMagnetRadius * scale; // Scale magnet radius too

      this.ctx.strokeStyle = 'rgba(173, 216, 230, 0.5)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(drawX - this.cameraX, drawY - this.cameraY + (scaledSize - this.gameState.player.size) / 2, magnetDrawRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    if (this.gameState.vendor.isPlayerInRange(this.gameState.player) && !this.gameState.showShop) {
      this.ctx.fillStyle = 'white';
      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = 'black';
      this.ctx.shadowBlur = 5;
      this.ctx.fillText('Press F to interact with Vendor', this.ctx.canvas.width / 2, this.ctx.canvas.height - 50);
      this.ctx.shadowColor = 'transparent';
    }

    if (this.gameState.gameOver) {
      this.gameOverScreen.draw(this.ctx, this.ctx.canvas.width, this.ctx.canvas.height);
    } else {
      this.gameOverScreen.clearClickListener();
    }
  }

  private gameLoop = (currentTime: number) => {
    if (this.gameState.isPaused || !this.assetsLoaded) {
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
    this.gameOverScreen.clearClickListener();
    this.soundManager.stopSound(this.backgroundMusicInstance);
  }

  public getGameState(): GameState {
    return this.gameState;
  }
}