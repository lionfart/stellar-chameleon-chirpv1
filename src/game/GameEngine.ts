import { Player } from './Player';
import { InputHandler } from './InputHandler';
import { Enemy } from './Enemy';
import { AuraWeapon } from './AuraWeapon';
import { ProjectileWeapon } from './ProjectileWeapon';
import { SpinningBladeWeapon } from './SpinningBladeWeapon';
import { ExplosionAbility } from './ExplosionAbility';
import { ShieldAbility } from './ShieldAbility';
import { Vendor } from './Vendor';
import { clamp } from './utils';
import { SpriteManager } from './SpriteManager';
import { SoundManager } from './SoundManager';
import { GameState } from './GameState';
import { WaveManager } from './WaveManager';
import { PowerUpManager } from './PowerUpManager';
import { HUD } from './HUD';
import { GameOverScreen } from './GameOverScreen';
import { showSuccess, showError } from '@/utils/toast'; // Import toast utilities

// Define shop item types
interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'weapon' | 'ability' | 'consumable';
}

const MAX_DELTA_TIME = 1 / 30; // Cap deltaTime at 30 FPS to prevent physics glitches after long pauses

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private inputHandler: InputHandler;
  private lastTime: number;
  private animationFrameId: number | null;
  private onLevelUpCallback: () => void;
  private onOpenShopCallback: (items: ShopItem[], playerGold: number) => void; // Modified: Added playerGold
  private onCloseShopCallback: () => void; // New callback for closing shop
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

  private shopItems: ShopItem[] = [
    { id: 'buy_aura_weapon', name: 'Aura Weapon', description: 'A constant damage aura around you.', cost: 100, type: 'weapon' },
    { id: 'buy_projectile_weapon', name: 'Projectile Weapon', description: 'Fires projectiles at the closest enemy.', cost: 100, type: 'weapon' },
    { id: 'buy_spinning_blade_weapon', name: 'Spinning Blade Weapon', description: 'Blades orbit you, damaging enemies on contact.', cost: 100, type: 'weapon' },
    { id: 'buy_explosion_ability', name: 'Explosion Ability', description: 'Trigger an explosion around you (E key).', cost: 150, type: 'ability' },
    { id: 'buy_shield_ability', name: 'Shield Ability', description: 'Activate a protective shield (Q key).', cost: 150, type: 'ability' },
    { id: 'buy_health_potion', name: 'Health Potion', description: 'Instantly restores 50 health.', cost: 50, type: 'consumable' },
  ];

  constructor(ctx: CanvasRenderingContext2D, onLevelUp: () => void, onOpenShop: (items: ShopItem[], playerGold: number) => void, onCloseShop: () => void) {
    console.log("GameEngine constructor called!"); // Debug log
    this.ctx = ctx;
    this.inputHandler = new InputHandler();
    this.onLevelUpCallback = onLevelUp;
    this.onOpenShopCallback = onOpenShop;
    this.onCloseShopCallback = onCloseShop;
    this.spriteManager = new SpriteManager(this.onAllAssetsLoaded);
    this.soundManager = new SoundManager(this.onAllAssetsLoaded);

    const player = new Player(this.worldWidth / 2, this.worldHeight / 2, 30, 200, 'blue', 100, this.triggerLevelUp, undefined, this.soundManager);
    const vendor = new Vendor(this.worldWidth / 2 + 200, this.worldHeight / 2, 50, undefined);

    // Randomly select one starting weapon
    const startingWeapons = [
      new AuraWeapon(10, 100, 0.5),
      new ProjectileWeapon(15, 300, 1.5, 8, 3, undefined, this.soundManager),
      new SpinningBladeWeapon(10, 60, 3, 10, 1, undefined, this.soundManager),
    ];
    const initialWeapon = startingWeapons[Math.floor(Math.random() * startingWeapons.length)];

    this.gameState = new GameState(player, vendor, this.worldWidth, this.worldHeight, initialWeapon);
    
    // Removed redundant if (this.gameState.shieldAbility) block
    // The player's shield ability is set when the shield is purchased.

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
    this.spriteManager.loadSprite('projectile', SpriteManager.getProjectileSpriteSVG(this.gameState.projectileWeapon?.projectileRadius ? this.gameState.projectileWeapon.projectileRadius * 2 : 16)); // Use optional chaining
    this.spriteManager.loadSprite('spinning_blade', SpriteManager.getSpinningBladeSpriteSVG(this.gameState.spinningBladeWeapon?.bladeRadius ? this.gameState.spinningBladeWeapon.bladeRadius * 2 : 20)); // Use optional chaining
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

      this.gameState.player.setSprite(this.spriteManager.getSprite('player'));
      if (this.gameState.projectileWeapon) {
        this.gameState.projectileWeapon['projectileSprite'] = this.spriteManager.getSprite('projectile');
      }
      if (this.gameState.spinningBladeWeapon) {
        this.gameState.spinningBladeWeapon['bladeSprite'] = this.spriteManager.getSprite('spinning_blade');
      }
      this.gameState.vendor['sprite'] = this.spriteManager.getSprite('vendor');

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

  pause() {
    console.log("GameEngine: Pausing game.");
    this.gameState.isPaused = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  resume() {
    console.log("GameEngine: Resuming game.");
    this.gameState.isPaused = false;
    this.lastTime = performance.now(); // Reset lastTime to current time to prevent large deltaTime
    if (!this.animationFrameId) { // Only request a new frame if not already running
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  }

  openShop() {
    if (this.gameState.showShop) return; // Prevent opening if already open
    console.log("GameEngine: Opening shop.");
    this.gameState.showShop = true;
    this.pause(); // This will set isPaused = true and cancel animation frame
    this.onOpenShopCallback(this.shopItems.filter(item => {
      // Filter out items player already has
      if (item.id === 'buy_aura_weapon' && this.gameState.auraWeapon) return false;
      if (item.id === 'buy_projectile_weapon' && this.gameState.projectileWeapon) return false;
      if (item.id === 'buy_spinning_blade_weapon' && this.gameState.spinningBladeWeapon) return false;
      if (item.id === 'buy_explosion_ability' && this.gameState.explosionAbility) return false;
      if (item.id === 'buy_shield_ability' && this.gameState.shieldAbility) return false;
      return true;
    }), this.gameState.player.gold);
  }

  closeShop = () => {
    if (!this.gameState.showShop) return; // Prevent closing if already closed
    console.log("GameEngine: Closing shop.");
    this.gameState.showShop = false;
    this.onCloseShopCallback();
    this.resume(); // This will set isPaused = false and request a new animation frame
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
          this.gameState.projectileWeapon = new ProjectileWeapon(15, 300, 1.5, 8, 3, this.spriteManager.getSprite('projectile'), this.soundManager);
          break;
        case 'buy_spinning_blade_weapon':
          this.gameState.spinningBladeWeapon = new SpinningBladeWeapon(10, 60, 3, 10, 1, this.spriteManager.getSprite('spinning_blade'), this.soundManager);
          break;
        case 'buy_explosion_ability':
          this.gameState.explosionAbility = new ExplosionAbility(50, 150, 5, this.soundManager);
          break;
        case 'buy_shield_ability':
          this.gameState.shieldAbility = new ShieldAbility(40, 100, 10, 10, this.soundManager);
          this.gameState.player.setShieldAbility(this.gameState.shieldAbility);
          break;
        case 'buy_health_potion':
          this.gameState.player.currentHealth = Math.min(this.gameState.player.maxHealth, this.gameState.player.currentHealth + 50);
          break;
        default:
          console.warn(`Unknown item purchased: ${itemId}`);
      }
      this.onOpenShopCallback(this.shopItems.filter(i => { // Refresh shop items after purchase
        if (i.id === 'buy_aura_weapon' && this.gameState.auraWeapon) return false;
        if (i.id === 'buy_projectile_weapon' && this.gameState.projectileWeapon) return false;
        if (i.id === 'buy_spinning_blade_weapon' && this.gameState.spinningBladeWeapon) return false;
        if (i.id === 'buy_explosion_ability' && this.gameState.explosionAbility) return false;
        if (i.id === 'buy_shield_ability' && this.gameState.shieldAbility) return false;
        return true;
      }), this.gameState.player.gold); // Modified: Pass player gold
    } else {
      showError("Not enough gold!");
    }
  }

  restartGame = () => {
    console.log("GameEngine: Restarting game..."); // Debug log
    // Remove the old gameState.reset() as we are creating a new GameState object.
    // this.gameState.reset(); 

    const player = new Player(this.worldWidth / 2, this.worldHeight / 2, 30, 200, 'blue', 100, this.triggerLevelUp, undefined, this.soundManager);
    const vendor = new Vendor(this.worldWidth / 2 + 200, this.worldHeight / 2, 50, undefined);

    // Randomly select one starting weapon for restart
    const startingWeapons = [
      new AuraWeapon(10, 100, 0.5),
      new ProjectileWeapon(15, 300, 1.5, 8, 3, undefined, this.soundManager),
      new SpinningBladeWeapon(10, 60, 3, 10, 1, undefined, this.soundManager),
    ];
    const initialWeapon = startingWeapons[Math.floor(Math.random() * startingWeapons.length)];

    // Create a new GameState instance
    this.gameState = new GameState(player, vendor, this.worldWidth, this.worldHeight, initialWeapon);
    
    // Re-initialize managers with the new GameState instance
    this.waveManager = new WaveManager(this.gameState, this.spriteManager, this.soundManager);
    this.powerUpManager = new PowerUpManager(this.gameState, this.spriteManager, this.soundManager);
    this.hud = new HUD(this.gameState); // Re-initialize HUD with the new gameState

    // Re-apply sprites to the new player and weapons
    this.gameState.player.setSprite(this.spriteManager.getSprite('player'));
    if (this.gameState.projectileWeapon) {
      this.gameState.projectileWeapon['projectileSprite'] = this.spriteManager.getSprite('projectile');
    }
    if (this.gameState.spinningBladeWeapon) {
      this.gameState.spinningBladeWeapon['bladeSprite'] = this.spriteManager.getSprite('spinning_blade');
    }
    this.gameState.vendor['sprite'] = this.spriteManager.getSprite('vendor');

    this.gameOverScreen.clearClickListener();
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  };

  applyUpgrade(upgradeId: string) {
    switch (upgradeId) {
      case 'aura_damage':
        this.gameState.auraWeapon?.increaseDamage(5); // Use optional chaining
        break;
      case 'player_speed':
        this.gameState.player.increaseSpeed(20);
        break;
      case 'player_health':
        this.gameState.player.increaseMaxHealth(20);
        break;
      case 'projectile_damage':
        this.gameState.projectileWeapon?.increaseDamage(10); // Use optional chaining
        break;
      case 'projectile_fire_rate':
        this.gameState.projectileWeapon?.decreaseFireRate(0.2); // Use optional chaining
        break;
      case 'dash_cooldown':
        this.gameState.player.reduceDashCooldown(0.3);
        break;
      case 'blade_damage':
        this.gameState.spinningBladeWeapon?.increaseDamage(5); // Use optional chaining
        break;
      case 'add_blade':
        this.gameState.spinningBladeWeapon?.addBlade(); // Use optional chaining
        break;
      case 'explosion_damage':
        this.gameState.explosionAbility?.increaseDamage(20); // Use optional chaining
        break;
      case 'explosion_cooldown':
        this.gameState.explosionAbility?.reduceCooldown(1); // Use optional chaining
        break;
      case 'explosion_radius':
        this.gameState.explosionAbility?.increaseRadius(20); // Use optional chaining
        break;
      case 'shield_health':
        this.gameState.shieldAbility?.increaseMaxHealth(30); // Use optional chaining
        break;
      case 'shield_regen':
        this.gameState.shieldAbility?.increaseRegeneration(5); // Use optional chaining
        break;
      case 'shield_cooldown':
        this.gameState.shieldAbility?.reduceCooldown(1.5); // Use optional chaining
        break;
      default:
        console.warn(`Unknown upgrade ID: ${upgradeId}`);
    }
  }

  private update(deltaTime: number) {
    // If the game is paused (e.g., shop is open), or game is over, or assets are not loaded, do not update game logic.
    if (this.gameState.gameOver || this.gameState.isPaused || !this.assetsLoaded) return;

    // Cap deltaTime to prevent physics glitches after long pauses
    deltaTime = Math.min(deltaTime, MAX_DELTA_TIME);

    console.log("GameEngine: Updating with deltaTime:", deltaTime); // Debug log for deltaTime

    this.gameState.player.update(this.inputHandler, deltaTime, this.gameState.worldWidth, this.gameState.worldHeight);

    // Trigger explosion if 'e' is pressed and ability exists
    if (this.inputHandler.isPressed('e') && this.gameState.explosionAbility) {
      this.gameState.explosionAbility.triggerExplosion(this.gameState.player.x, this.gameState.player.y);
    }

    // Check for vendor interaction
    if (this.inputHandler.isPressed('f') && this.gameState.vendor.isPlayerInRange(this.gameState.player) && !this.gameState.showShop) {
      this.openShop();
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

    this.gameState.auraWeapon?.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies); // Use optional chaining
    this.gameState.projectileWeapon?.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies); // Use optional chaining
    this.gameState.spinningBladeWeapon?.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies); // Use optional chaining
    this.gameState.explosionAbility?.update(deltaTime, this.gameState.enemies); // Use optional chaining
    this.gameState.shieldAbility?.update(deltaTime, this.gameState.player.x, this.gameState.player.y); // Use optional chaining

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

    // console.log("GameEngine: Drawing. CameraX:", this.cameraX, "CameraY:", this.cameraY); // Debug log for camera position

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

    this.gameState.auraWeapon?.draw(this.ctx, this.gameState.player.x, this.gameState.player.y, this.cameraX, this.cameraY); // Use optional chaining
    this.gameState.projectileWeapon?.draw(this.ctx, this.cameraX, this.cameraY); // Use optional chaining
    this.gameState.spinningBladeWeapon?.draw(this.ctx, this.cameraX, this.cameraY); // Use optional chaining
    this.gameState.explosionAbility?.draw(this.ctx, this.cameraX, this.cameraY); // Use optional chaining

    this.gameState.experienceGems.forEach(gem => gem.draw(this.ctx, this.cameraX, this.cameraY));
    this.gameState.magnetPowerUps.forEach(magnet => magnet.draw(this.ctx, this.cameraX, this.cameraY));

    this.gameState.player.draw(this.ctx, this.cameraX, this.cameraY);
    this.gameState.shieldAbility?.draw(this.ctx, this.cameraX, this.cameraY); // Use optional chaining

    this.gameState.enemies.forEach(enemy => enemy.draw(this.ctx, this.cameraX, this.cameraY));

    this.gameState.vendor.draw(this.ctx, this.cameraX, this.cameraY);

    if (this.gameState.activeMagnetRadius > 0) {
      this.ctx.strokeStyle = 'rgba(173, 216, 230, 0.5)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(this.gameState.player.x - this.cameraX, this.gameState.player.y - this.cameraY, this.gameState.activeMagnetRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Display interaction prompt for vendor
    if (this.gameState.vendor.isPlayerInRange(this.gameState.player) && !this.gameState.showShop) {
      this.ctx.fillStyle = 'white';
      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = 'black';
      this.ctx.shadowBlur = 5;
      this.ctx.fillText('Press F to interact with Vendor', this.ctx.canvas.width / 2, this.ctx.canvas.height - 50);
      this.ctx.shadowColor = 'transparent';
    }

    this.hud.draw(this.ctx, this.ctx.canvas.width, this.ctx.canvas.height);

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

    // Cap deltaTime to prevent physics glitches after long pauses
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
  }
}