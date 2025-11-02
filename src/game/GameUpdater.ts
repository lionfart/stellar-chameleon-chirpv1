import { GameState } from './GameState';
import { InputHandler } from './InputHandler';
import { WaveManager } from './WaveManager';
import { PowerUpManager } from './PowerUpManager';
import { SoundManager } from './SoundManager';

export class GameUpdater {
  private gameState: GameState;
  private inputHandler: InputHandler;
  private waveManager: WaveManager;
  private powerUpManager: PowerUpManager;
  private soundManager: SoundManager;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(
    gameState: GameState,
    inputHandler: InputHandler,
    waveManager: WaveManager,
    powerUpManager: PowerUpManager,
    soundManager: SoundManager,
    canvasWidth: number,
    canvasHeight: number
  ) {
    this.gameState = gameState;
    this.inputHandler = inputHandler;
    this.waveManager = waveManager;
    this.powerUpManager = powerUpManager;
    this.soundManager = soundManager;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  update(deltaTime: number, cameraX: number, cameraY: number) {
    this.gameState.player.update(this.inputHandler, deltaTime, this.gameState.worldWidth, this.gameState.worldHeight);

    // Trigger explosion if 'e' is pressed and ability exists
    if (this.inputHandler.isPressed('e') && this.gameState.explosionAbility) {
      this.gameState.explosionAbility.triggerExplosion(this.gameState.player.x, this.gameState.player.y);
    }

    this.waveManager.update(deltaTime, cameraX, cameraY, this.canvasWidth, this.canvasHeight);

    this.gameState.enemies.forEach(enemy => enemy.update(deltaTime, this.gameState.player));
    this.gameState.experienceGems.forEach(gem => gem.update(deltaTime));

    this.handleCollisions();
    this.updateWeaponsAndAbilities(deltaTime);
    this.handleEnemyDefeats();

    this.powerUpManager.update(deltaTime);

    if (!this.gameState.player.isAlive()) {
      this.gameState.gameOver = true;
      console.log("Game Over!");
    }
  }

  private handleCollisions() {
    this.gameState.enemies.forEach(enemy => {
      if (this.gameState.player.collidesWith(enemy)) {
        this.gameState.player.takeDamage(5); // Player takes damage from enemy collision
      }
    });
  }

  private updateWeaponsAndAbilities(deltaTime: number) {
    this.gameState.auraWeapon?.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies);
    this.gameState.projectileWeapon?.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies);
    this.gameState.spinningBladeWeapon?.update(deltaTime, this.gameState.player.x, this.gameState.player.y, this.gameState.enemies);
    this.gameState.explosionAbility?.update(deltaTime, this.gameState.enemies);
    this.gameState.shieldAbility?.update(deltaTime, this.gameState.player.x, this.gameState.player.y);
  }

  private handleEnemyDefeats() {
    const defeatedEnemies = this.gameState.enemies.filter(enemy => !enemy.isAlive());
    defeatedEnemies.forEach(enemy => {
      this.powerUpManager.spawnExperienceGem(enemy.x, enemy.y, 10);
      this.gameState.player.gainGold(enemy.getGoldDrop());
      if (Math.random() < 0.1) {
        this.powerUpManager.spawnMagnetPowerUp(enemy.x, enemy.y);
      }
    });
    this.gameState.enemies = this.gameState.enemies.filter(enemy => enemy.isAlive());
  }

  setCanvasSize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
}