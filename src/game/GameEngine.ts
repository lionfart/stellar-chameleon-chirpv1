import { Player } from './Player';
import { InputHandler } from './InputHandler';
import { AuraWeapon } from './AuraWeapon';
import { ProjectileWeapon } from './ProjectileWeapon';
import { SpinningBladeWeapon } from './SpinningBladeWeapon';
import { ExplosionAbility } from './ExplosionAbility';
import { ShieldAbility } from './ShieldAbility';
import { Vendor } from './Vendor';
import { clamp } from './utils';
import { GameState } from './GameState';
import { WaveManager } from './WaveManager';
import { PowerUpManager } from './PowerUpManager';
import { HUD } from './HUD';
import { GameOverScreen } from './GameOverScreen';
import { AssetLoader } from './AssetLoader';
import { GameRenderer } from './GameRenderer';
import { ShopManager, ShopItem } from './ShopManager';
import { UpgradeManager } from './UpgradeManager';
import { GameUpdater } from './GameUpdater';

const MAX_DELTA_TIME = 1 / 30; // Cap deltaTime at 30 FPS to prevent physics glitches after long pauses

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private inputHandler: InputHandler;
  private lastTime: number;
  private animationFrameId: number | null;
  private onLevelUpCallback: () => void;
  private onOpenShopCallback: (items: ShopItem[], playerGold: number) => void;
  private onCloseShopCallback: () => void;

  private assetLoader: AssetLoader;
  private gameState: GameState;
  private waveManager: WaveManager;
  private powerUpManager: PowerUpManager;
  private hud: HUD;
  private gameOverScreen: GameOverScreen;
  private gameRenderer: GameRenderer;
  private shopManager: ShopManager;
  private upgradeManager: UpgradeManager;
  private gameUpdater: GameUpdater;

  // World dimensions
  private worldWidth: number = 2000;
  private worldHeight: number = 2000;

  // Camera position
  private cameraX: number = 0;
  private cameraY: number = 0;

  constructor(ctx: CanvasRenderingContext2D, onLevelUp: () => void, onOpenShop: (items: ShopItem[], playerGold: number) => void, onCloseShop: () => void) {
    console.log("GameEngine constructor called!");
    this.ctx = ctx;
    this.inputHandler = new InputHandler();
    this.onLevelUpCallback = onLevelUp;
    this.onOpenShopCallback = onOpenShop;
    this.onCloseShopCallback = onCloseShop;

    this.assetLoader = new AssetLoader(this.onAllAssetsLoaded);

    const player = new Player(this.worldWidth / 2, this.worldHeight / 2, 30, 200, 'blue', 100, this.triggerLevelUp, undefined, this.assetLoader.getSoundManager());
    const vendor = new Vendor(this.worldWidth / 2 + 200, this.worldHeight / 2, 50, undefined);

    const startingWeapons = [
      new AuraWeapon(10, 100, 0.5),
      new ProjectileWeapon(15, 300, 1.5, 8, 3, undefined, this.assetLoader.getSoundManager()),
      new SpinningBladeWeapon(10, 60, 3, 10, 1, undefined, this.assetLoader.getSoundManager()),
    ];
    const initialWeapon = startingWeapons[Math.floor(Math.random() * startingWeapons.length)];

    this.gameState = new GameState(player, vendor, this.worldWidth, this.worldHeight, initialWeapon);
    
    this.waveManager = new WaveManager(this.gameState, this.assetLoader.getSpriteManager(), this.assetLoader.getSoundManager());
    this.powerUpManager = new PowerUpManager(this.gameState, this.assetLoader.getSpriteManager(), this.assetLoader.getSoundManager());
    this.hud = new HUD(this.gameState);
    this.gameOverScreen = new GameOverScreen(this.restartGame, this.ctx.canvas);
    this.gameRenderer = new GameRenderer(this.ctx, this.gameState, this.assetLoader.getSpriteManager(), this.hud, this.gameOverScreen);
    this.shopManager = new ShopManager(this.gameState, this.assetLoader.getSpriteManager(), this.assetLoader.getSoundManager(), this.onOpenShopCallback, this.onCloseShopCallback);
    this.upgradeManager = new UpgradeManager(this.gameState);
    this.gameUpdater = new GameUpdater(this.gameState, this.inputHandler, this.waveManager, this.powerUpManager, this.assetLoader.getSoundManager(), this.ctx.canvas.width, this.ctx.canvas.height);

    this.lastTime = 0;
    this.animationFrameId = null;

    this.assetLoader.loadAssets(this.gameState);
  }

  private onAllAssetsLoaded = () => {
    this.assetLoader.applySpritesToGameState(this.gameState);
    this.gameLoop(0);
  };

  init() {
    // Initial draw for loading screen
    this.gameRenderer.drawLoadingScreen();
    // The game loop will start automatically once assets are loaded via onAllAssetsLoaded
  }

  private triggerLevelUp = () => {
    this.assetLoader.getSoundManager().playSound('level_up');
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
    this.lastTime = performance.now();
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  }

  openShop() {
    this.shopManager.openShop();
    this.pause();
  }

  closeShop = () => {
    this.shopManager.closeShop();
    this.resume();
  }

  purchaseItem = (itemId: string) => {
    this.shopManager.purchaseItem(itemId);
  }

  restartGame = () => {
    console.log("GameEngine: Restarting game...");
    
    const player = new Player(this.worldWidth / 2, this.worldHeight / 2, 30, 200, 'blue', 100, this.triggerLevelUp, undefined, this.assetLoader.getSoundManager());
    const vendor = new Vendor(this.worldWidth / 2 + 200, this.worldHeight / 2, 50, undefined);

    const startingWeapons = [
      new AuraWeapon(10, 100, 0.5),
      new ProjectileWeapon(15, 300, 1.5, 8, 3, undefined, this.assetLoader.getSoundManager()),
      new SpinningBladeWeapon(10, 60, 3, 10, 1, undefined, this.assetLoader.getSoundManager()),
    ];
    const initialWeapon = startingWeapons[Math.floor(Math.random() * startingWeapons.length)];

    this.gameState = new GameState(player, vendor, this.worldWidth, this.worldHeight, initialWeapon);
    
    // Re-initialize managers with the new GameState instance
    this.waveManager = new WaveManager(this.gameState, this.assetLoader.getSpriteManager(), this.assetLoader.getSoundManager());
    this.powerUpManager = new PowerUpManager(this.gameState, this.assetLoader.getSpriteManager(), this.assetLoader.getSoundManager());
    this.hud = new HUD(this.gameState);
    this.gameRenderer = new GameRenderer(this.ctx, this.gameState, this.assetLoader.getSpriteManager(), this.hud, this.gameOverScreen);
    this.shopManager = new ShopManager(this.gameState, this.assetLoader.getSpriteManager(), this.assetLoader.getSoundManager(), this.onOpenShopCallback, this.onCloseShopCallback);
    this.upgradeManager = new UpgradeManager(this.gameState);
    this.gameUpdater = new GameUpdater(this.gameState, this.inputHandler, this.waveManager, this.powerUpManager, this.assetLoader.getSoundManager(), this.ctx.canvas.width, this.ctx.canvas.height);

    this.assetLoader.applySpritesToGameState(this.gameState); // Re-apply sprites to the new game state entities

    this.gameOverScreen.clearClickListener();
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  };

  applyUpgrade(upgradeId: string) {
    this.upgradeManager.applyUpgrade(upgradeId);
  }

  private update(deltaTime: number) {
    if (this.gameState.gameOver || this.gameState.isPaused) return;

    deltaTime = Math.min(deltaTime, MAX_DELTA_TIME);

    // Check for vendor interaction
    if (this.inputHandler.isPressed('f') && this.gameState.vendor.isPlayerInRange(this.gameState.player) && !this.gameState.showShop) {
      this.openShop();
    }

    this.gameUpdater.update(deltaTime, this.cameraX, this.cameraY);

    this.cameraX = this.gameState.player.x - this.ctx.canvas.width / 2;
    this.cameraY = this.gameState.player.y - this.ctx.canvas.height / 2;

    this.cameraX = clamp(this.cameraX, 0, this.gameState.worldWidth - this.ctx.canvas.width);
    this.cameraY = clamp(this.cameraY, 0, this.gameState.worldHeight - this.ctx.canvas.height);
  }

  private draw() {
    if (!this.assetLoader['loadedCount'] || this.assetLoader['loadedCount'] !== this.assetLoader['totalCount']) {
      this.gameRenderer.drawLoadingScreen();
      return;
    }
    this.gameRenderer.draw(this.cameraX, this.cameraY);
  }

  private gameLoop = (currentTime: number) => {
    if (this.gameState.isPaused) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
      return;
    }

    let deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

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

  // Method to update canvas size, useful for GameUpdater
  setCanvasSize(width: number, height: number) {
    this.gameUpdater.setCanvasSize(width, height);
  }
}