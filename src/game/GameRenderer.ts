import { GameState } from './GameState';
import { SpriteManager } from './SpriteManager';
import { Player } from './Player';
import { Vendor } from './Vendor';
import { Enemy } from './Enemy';
import { ExperienceGem } from './ExperienceGem';
import { MagnetPowerUp } from './MagnetPowerUp'; // Düzeltildi: MagnetPowerPowerUp -> MagnetPowerUp
import { DamageNumber } from './DamageNumber';
import { BossAttackVisual } from './BossAttackVisual';
import { BossWarning } from './BossWarning';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private spriteManager: SpriteManager;

  constructor(ctx: CanvasRenderingContext2D, gameState: GameState, spriteManager: SpriteManager) {
    this.ctx = ctx;
    this.gameState = gameState;
    this.spriteManager = spriteManager;
  }

  draw(cameraX: number, cameraY: number) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.drawBackground(cameraX, cameraY);
    this.drawWorldBoundary(cameraX, cameraY);

    this.gameState.auraWeapon?.draw(this.ctx, this.gameState.player.x, this.gameState.player.y, cameraX, cameraY);
    this.gameState.projectileWeapon?.draw(this.ctx, cameraX, cameraY);
    this.gameState.spinningBladeWeapon?.draw(this.ctx, cameraX, cameraY);
    this.gameState.homingMissileWeapon?.draw(this.ctx, cameraX, cameraY);
    this.gameState.explosionAbility?.draw(this.ctx, cameraX, cameraY);

    this.gameState.experienceGems.forEach(gem => gem.draw(this.ctx, cameraX, cameraY));
    this.gameState.magnetPowerUps.forEach(magnet => magnet.draw(this.ctx, cameraX, cameraY));

    this.gameState.player.draw(this.ctx, cameraX, cameraY);
    this.gameState.shieldAbility?.draw(this.ctx, cameraX, cameraY);

    this.gameState.enemies.forEach(enemy => enemy.draw(this.ctx, cameraX, cameraY));

    this.gameState.vendor.draw(this.ctx, cameraX, cameraY);

    this.gameState.damageNumbers.forEach(dn => dn.draw(this.ctx, cameraX, cameraY));
    this.gameState.activeBossAttackVisuals.forEach(visual => visual.draw(this.ctx, cameraX, cameraY));

    this.drawMagnetRadius(cameraX, cameraY);
    this.drawVendorInteractionPrompt(cameraX, cameraY);

    if (this.gameState.gameOver) {
      this.gameState.gameOverScreen.draw(this.ctx, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    if (this.gameState.gameWon) {
      this.gameState.gameWinScreen.draw(this.ctx, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    if (this.gameState.isBossWarningActive && this.gameState.bossWarning) {
      this.gameState.bossWarning.draw(this.ctx);
    }
  }

  private drawBackground(cameraX: number, cameraY: number) {
    const backgroundTile = this.spriteManager.getSprite('background_tile');
    if (backgroundTile) {
      const tileWidth = backgroundTile.width;
      const tileHeight = backgroundTile.height;
      const startX = -cameraX % tileWidth;
      const startY = -cameraY % tileHeight;

      for (let x = startX; x < this.ctx.canvas.width; x += tileWidth) {
        for (let y = startY; y < this.ctx.canvas.height; y += tileHeight) {
          this.ctx.drawImage(backgroundTile, x, y, tileWidth, tileHeight);
        }
      }
    } else {
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
  }

  private drawWorldBoundary(cameraX: number, cameraY: number) {
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      -cameraX,
      -cameraY,
      this.gameState.worldWidth,
      this.gameState.worldHeight
    );
  }

  private drawMagnetRadius(cameraX: number, cameraY: number) {
    if (this.gameState.activeMagnetRadius > 0) {
      this.ctx.strokeStyle = 'rgba(173, 216, 230, 0.5)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(this.gameState.player.x - cameraX, this.gameState.player.y - cameraY, this.gameState.activeMagnetRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  private drawVendorInteractionPrompt(cameraX: number, cameraY: number) {
    if (this.gameState.vendor.isPlayerInRange(this.gameState.player) && !this.gameState.showShop) {
      this.ctx.fillStyle = 'white';
      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = 'black';
      this.ctx.shadowBlur = 5;
      this.ctx.fillText('Press F to interact with Vendor', this.ctx.canvas.width / 2, this.ctx.canvas.height - 50);
      this.ctx.shadowColor = 'transparent';
    }
  }
}