import { GameState } from './GameState';
import { SpriteManager } from './SpriteManager';
import { SoundManager } from './SoundManager';
import { MagnetPowerUp } from './MagnetPowerUp';
import { ExperienceGem } from './ExperienceGem';

export class PowerUpManager {
  private gameState: GameState;
  private spriteManager: SpriteManager;
  private soundManager: SoundManager;

  constructor(gameState: GameState, spriteManager: SpriteManager, soundManager: SoundManager) {
    this.gameState = gameState;
    this.spriteManager = spriteManager;
    this.soundManager = soundManager;
  }

  update(deltaTime: number) {
    // Update and collect magnet power-ups
    this.gameState.magnetPowerUps = this.gameState.magnetPowerUps.filter(magnet => {
      if (magnet.collidesWith(this.gameState.player)) {
        this.gameState.activeMagnetRadius = magnet.radius;
        this.gameState.activeMagnetDuration = magnet.duration;
        this.soundManager.playSound('magnet_collect'); // Play sound on collect
        console.log(`Magnet power-up collected! Radius: ${this.gameState.activeMagnetRadius}, Duration: ${this.gameState.activeMagnetDuration}`);
        return false; // Remove power-up after collection
      }
      return true;
    });

    // Update active magnet effect
    if (this.gameState.activeMagnetDuration > 0) {
      this.gameState.activeMagnetDuration -= deltaTime;
      if (this.gameState.activeMagnetDuration <= 0) {
        this.gameState.activeMagnetRadius = 0; // Deactivate magnet
        console.log("Magnet effect ended.");
      }
    }

    // Handle experience gem collection and magnet pull
    this.gameState.experienceGems = this.gameState.experienceGems.filter(gem => {
      // If magnet is active and gem is within range, pull it towards the player
      if (this.gameState.activeMagnetRadius > 0) {
        const dx = this.gameState.player.x - gem.x;
        const dy = this.gameState.player.y - gem.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.gameState.activeMagnetRadius) {
          gem.pullTowards(this.gameState.player.x, this.gameState.player.y, deltaTime);
        }
      }

      if (gem.collidesWith(this.gameState.player)) {
        this.gameState.player.gainExperience(gem.value);
        this.soundManager.playSound('gem_collect'); // Play sound on collect
        return false;
      }
      return true;
    });
  }

  spawnMagnetPowerUp(x: number, y: number) {
    const magnetSprite = this.spriteManager.getSprite('magnet_powerup');
    this.gameState.magnetPowerUps.push(new MagnetPowerUp(x, y, 5, 300, magnetSprite, this.soundManager));
  }

  spawnExperienceGem(x: number, y: number, value: number) {
    const gemSprite = this.spriteManager.getSprite('experience_gem');
    this.gameState.experienceGems.push(new ExperienceGem(x, y, value, gemSprite, this.soundManager));
  }

  reset() {
    this.gameState.activeMagnetRadius = 0;
    this.gameState.activeMagnetDuration = 0;
  }
}