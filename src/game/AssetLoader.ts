import { SpriteManager } from './SpriteManager';
import { SoundManager } from './SoundManager';
import { GameState } from './GameState';

export class AssetLoader {
  private spriteManager: SpriteManager;
  private soundManager: SoundManager;
  private onAllLoadedCallback: () => void;
  private loadedCount: number = 0;
  private totalCount: number = 0;

  constructor(onAllLoaded: () => void) {
    this.onAllLoadedCallback = onAllLoaded;
    this.spriteManager = new SpriteManager(this.onAssetLoaded);
    this.soundManager = new SoundManager(this.onAssetLoaded);
  }

  private onAssetLoaded = () => {
    this.loadedCount++;
    if (this.loadedCount === this.totalCount) {
      console.log("All game assets (sprites and sounds) loaded!");
      this.onAllLoadedCallback();
    }
  };

  loadAssets(gameState: GameState) {
    // Sprites
    this.totalCount++; // For player sprite
    this.spriteManager.loadSprite('player', SpriteManager.getPlayerSpriteSVG(gameState.player.size * 2));
    this.totalCount++; // For enemy_normal
    this.spriteManager.loadSprite('enemy_normal', SpriteManager.getEnemyNormalSpriteSVG(40));
    this.totalCount++; // For enemy_fast
    this.spriteManager.loadSprite('enemy_fast', SpriteManager.getEnemyFastSpriteSVG(30));
    this.totalCount++; // For enemy_tanky
    this.spriteManager.loadSprite('enemy_tanky', SpriteManager.getEnemyTankySpriteSVG(50));
    this.totalCount++; // For projectile
    this.spriteManager.loadSprite('projectile', SpriteManager.getProjectileSpriteSVG(16)); // Default size, will be updated if weapon exists
    this.totalCount++; // For spinning_blade
    this.spriteManager.loadSprite('spinning_blade', SpriteManager.getSpinningBladeSpriteSVG(20)); // Default size, will be updated if weapon exists
    this.totalCount++; // For experience_gem
    this.spriteManager.loadSprite('experience_gem', SpriteManager.getExperienceGemSpriteSVG(20));
    this.totalCount++; // For magnet_powerup
    this.spriteManager.loadSprite('magnet_powerup', SpriteManager.getMagnetPowerUpSpriteSVG(40));
    this.totalCount++; // For background_tile
    this.spriteManager.loadSprite('background_tile', SpriteManager.getBackgroundTileSVG(100));
    this.totalCount++; // For vendor
    this.spriteManager.loadSprite('vendor', SpriteManager.getVendorSpriteSVG(gameState.vendor.size * 2));

    // Sounds
    this.totalCount++;
    this.soundManager.loadSound('dash', SoundManager.getDashSound());
    this.totalCount++;
    this.soundManager.loadSound('level_up', SoundManager.getLevelUpSound());
    this.totalCount++;
    this.soundManager.loadSound('enemy_hit', SoundManager.getEnemyHitSound());
    this.totalCount++;
    this.soundManager.loadSound('enemy_defeat', SoundManager.getEnemyDefeatSound());
    this.totalCount++;
    this.soundManager.loadSound('projectile_fire', SoundManager.getProjectileFireSound());
    this.totalCount++;
    this.soundManager.loadSound('explosion', SoundManager.getExplosionSound());
    this.totalCount++;
    this.soundManager.loadSound('shield_activate', SoundManager.getShieldActivateSound());
    this.totalCount++;
    this.soundManager.loadSound('shield_deactivate', SoundManager.getShieldDeactivateSound());
    this.totalCount++;
    this.soundManager.loadSound('shield_break', SoundManager.getShieldBreakSound());
    this.totalCount++;
    this.soundManager.loadSound('gem_collect', SoundManager.getGemCollectSound());
    this.totalCount++;
    this.soundManager.loadSound('magnet_collect', SoundManager.getMagnetCollectSound());
  }

  getSpriteManager(): SpriteManager {
    return this.spriteManager;
  }

  getSoundManager(): SoundManager {
    return this.soundManager;
  }

  applySpritesToGameState(gameState: GameState) {
    gameState.player.setSprite(this.spriteManager.getSprite('player'));
    if (gameState.projectileWeapon) {
      gameState.projectileWeapon['projectileSprite'] = this.spriteManager.getSprite('projectile');
    }
    if (gameState.spinningBladeWeapon) {
      gameState.spinningBladeWeapon['bladeSprite'] = this.spriteManager.getSprite('spinning_blade');
    }
    gameState.vendor['sprite'] = this.spriteManager.getSprite('vendor');
  }
}