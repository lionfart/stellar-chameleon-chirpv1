import { GameState } from './GameState';

export class HUD {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 5;

    ctx.fillText(`Health: ${this.gameState.player.currentHealth}/${this.gameState.player.maxHealth}`, 10, 30);
    ctx.fillText(`Level: ${this.gameState.player.level}`, 10, 60);
    ctx.fillText(`XP: ${this.gameState.player.experience}/${this.gameState.player.experienceToNextLevel}`, 10, 90);
    ctx.fillText(`Shield: ${this.gameState.shieldAbility.shield.isActive ? `${this.gameState.shieldAbility.shield.currentHealth}/${this.gameState.shieldAbility.shield.maxHealth}` : 'Inactive'}`, 10, 120);

    ctx.textAlign = 'right';
    ctx.fillText(`Wave: ${this.gameState.waveNumber}`, canvasWidth - 10, 30);
    ctx.fillText(`Time: ${Math.floor(this.gameState.waveDuration - this.gameState.waveTimeElapsed)}s`, canvasWidth - 10, 60);

    ctx.shadowColor = 'transparent'; // Reset shadow
  }
}