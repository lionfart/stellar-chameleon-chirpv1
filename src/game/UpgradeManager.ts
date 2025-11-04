import { GameState } from './GameState';

export class UpgradeManager {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

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
}