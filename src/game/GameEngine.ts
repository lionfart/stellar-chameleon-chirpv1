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
import { GameOverScreen } from './GameOverScreen';
import { GameWinScreen } from './GameWinScreen';
import { DamageNumber } from './DamageNumber';
import { ShooterEnemy } from './ShooterEnemy';
import { Boss } from './Boss';
import { BossWarning } from './BossWarning';
import { BossAttackVisual } from './BossAttackVisual';
import { EntityManager } from './EntityManager'; // Import EntityManager
import { showSuccess, showError } from '@/utils/toast';

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
  private entityManager: EntityManager; // New: EntityManager instance
  private gameOverScreen: GameOverScreen;
  private gameWinScreen: GameWinScreen;

  private wasGameOver: boolean = false;
  private wasGameWon: boolean = false;

  private worldWidth: number = 2000;
  private worldHeight: number = 2000;

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

    const startingWeapons = [
      new AuraWeapon(10, 100, 0.5),
      new ProjectileWeapon(15, 300, 1.5, 8, 3, undefined, this.soundManager),
      new SpinningBladeWeapon(10, 60, 3, 10, 1, undefined, this.soundManager),
      new HomingMissileWeapon(20, 250, 2, 12, 4, undefined, this.soundManager),
    ];
    const initialWeapon = startingWeapons[Math.floor(Math.random() * startingWeapons.length)];

    this.gameState = new GameState(player, vendor, this.worldWidth, this.worldHeight, initialWeapon);
    
    // Initialize EntityManager before WaveManager
    this.entityManager = new EntityManager(this.gameState, this.spriteManager, this.soundManager);
    this.waveManager = new WaveManager(this.gameState, this.spriteManager, this.soundManager, this.entityManager, this.handleBossDefeat); // Pass EntityManager directly
    
    this.gameOverScreen = new GameOverScreen(this.restartGame, this.ctx.canvas);
    this.gameWinScreen = new GameWinScreen(this.restartGame, this.ctx.canvas);

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

  private handleBossDefeat = () => {
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
    this.gameState.currentBoss = undefined; // Clear boss reference
  }

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
    this.onCloseShopCallback();
    this.gameState.showShop = false;
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
          this.gameState.player.setExplosionAbility(this.gameState.explosionAbility); // Set ability on player
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

    this.gameOverScreen.clearClickListener();
    this.gameWinScreen.clearClickListener();
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

    this.gameState = new GameState(player, vendor, this.worldWidth, this.worldHeight, initialWeapon);
    
    this.entityManager = new EntityManager(this.gameState, this.spriteManager, this.soundManager); // Re-initialize EntityManager
    this.waveManager = new WaveManager(this.gameState, this.spriteManager, this.soundManager, this.entityManager, this.handleBossDefeat); // Pass EntityManager directly
    
    this.gameOverScreen = new GameOverScreen(this.restartGame, this.ctx.canvas);
    this.gameWinScreen = new GameWinScreen(this.restartGame, this.ctx.canvas);

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
    if (this.gameState.isPaused || !this.assetsLoaded || this.gameState.gameOver || this.gameState.gameWon) {
      if (this.gameState.gameOver && !this.gameOverSoundPlayed) {
        this.soundManager.playSound('game_over');
        this.soundManager.stopSound(this.backgroundMusicInstance);
        this.gameOverSoundPlayed = true;
        this.gameOverScreen.activate();
      } else if (this.gameState.gameWon && !this.gameWinSoundPlayed) {
        this.soundManager.playSound('game_win');
        this.soundManager.stopSound(this.backgroundMusicInstance);
        this.gameWinSoundPlayed = true;
        this.gameWinScreen.activate();
      }
      return;
    }

    if (!this.gameState.gameOver && this.wasGameOver) {
      this.gameOverScreen.clearClickListener();
    }
    if (!this.gameState.gameWon && this.wasGameWon) {
      this.gameWinScreen.clearClickListener();
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
    this.gameState.player.handleAbilityInput(this.inputHandler); // Call new method

    if (this.inputHandler.isPressed('f') && this.gameState.vendor.isPlayerInRange(this.gameState.player) && !this.gameState.showShop) {
      this.openShop();
    }

    this.cameraX = this.gameState.player.x - this.ctx.canvas.width / 2;
    this.cameraY = this.gameState.player.y - this.ctx.canvas.height / 2;

    this.cameraX = clamp(this.cameraX, 0, this.gameState.worldWidth - this.ctx.canvas.width);
    this.cameraY = clamp(this.cameraY, 0, this.gameState.worldHeight - this.ctx.canvas.height);

    this.waveManager.update(deltaTime, this.cameraX, this.cameraY, this.ctx.canvas.width, this.ctx.canvas.height);

    // Delegate entity updates to EntityManager
    this.entityManager.update(deltaTime, this.gameState.player, this.cameraX, this.cameraY, this.ctx.canvas.width, this.ctx.canvas.height);

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

    // Delegate entity drawing to EntityManager
    this.entityManager.draw(this.ctx, this.cameraX, this.cameraY);

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
    }

    if (this.gameState.gameWon) {
      this.gameWinScreen.draw(this.ctx, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    if (this.gameState.isBossWarningActive && this.gameState.bossWarning) {
      this.gameState.bossWarning.draw(this.ctx);
    }
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
    this.gameOverScreen.clearClickListener();
    this.gameWinScreen.clearClickListener();
    this.wasGameOver = false;
    this.wasGameWon = false;
    this.soundManager.stopSound(this.backgroundMusicInstance);
  }

  public getGameState(): GameState {
    return this.gameState;
  }
}