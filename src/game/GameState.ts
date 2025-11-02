import { Player } from './Player';
import { Enemy } from './Enemy';
import { ExperienceGem } from './ExperienceGem';
import { MagnetPowerUp } from './MagnetPowerUp';
import { AuraWeapon } from './AuraWeapon';
import { ProjectileWeapon } from './ProjectileWeapon';
import { SpinningBladeWeapon } from './SpinningBladeWeapon';
import { ExplosionAbility } from './ExplosionAbility';
import { ShieldAbility } from './ShieldAbility';
import { Vendor } from './Vendor'; // Import Vendor

export class GameState {
  player: Player;
  enemies: Enemy[];
  experienceGems: ExperienceGem[];
  magnetPowerUps: MagnetPowerUp[];
  auraWeapon: AuraWeapon | undefined; // Made optional
  projectileWeapon: ProjectileWeapon | undefined; // Made optional
  spinningBladeWeapon: SpinningBladeWeapon | undefined; // Made optional
  explosionAbility: ExplosionAbility | undefined; // Made optional
  shieldAbility: ShieldAbility | undefined; // Made optional
  vendor: Vendor; // New: Vendor NPC

  worldWidth: number;
  worldHeight: number;
  waveNumber: number;
  waveTimeElapsed: number;
  enemySpawnInterval: number; // Moved from GameEngine
  waveDuration: number; // Added for HUD access
  
  gameOver: boolean;
  isPaused: boolean;
  showShop: boolean; // New: State to control shop visibility

  activeMagnetRadius: number;
  activeMagnetDuration: number;

  constructor(
    player: Player,
    vendor: Vendor, // Vendor is always present
    worldWidth: number,
    worldHeight: number,
    initialWeapon?: AuraWeapon | ProjectileWeapon | SpinningBladeWeapon, // Optional initial weapon
    initialExplosionAbility?: ExplosionAbility, // Optional initial ability
    initialShieldAbility?: ShieldAbility // Optional initial ability
  ) {
    this.player = player;
    this.vendor = vendor; // Assign vendor

    this.auraWeapon = undefined;
    this.projectileWeapon = undefined;
    this.spinningBladeWeapon = undefined;
    this.explosionAbility = undefined;
    this.shieldAbility = undefined;

    if (initialWeapon instanceof AuraWeapon) {
      this.auraWeapon = initialWeapon;
    } else if (initialWeapon instanceof ProjectileWeapon) {
      this.projectileWeapon = initialWeapon;
    } else if (initialWeapon instanceof SpinningBladeWeapon) {
      this.spinningBladeWeapon = initialWeapon;
    }

    this.explosionAbility = initialExplosionAbility;
    this.shieldAbility = initialShieldAbility;

    this.enemies = [];
    this.experienceGems = [];
    this.magnetPowerUps = [];

    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.waveNumber = 1;
    this.waveTimeElapsed = 0;
    this.enemySpawnInterval = 2; // Initial value
    this.waveDuration = 60; // Initial value for wave duration

    this.gameOver = false;
    this.isPaused = false;
    this.showShop = false; // Initialize shop as not visible

    this.activeMagnetRadius = 0;
    this.activeMagnetDuration = 0;
  }

  reset() {
    this.enemies = [];
    this.experienceGems = [];
    this.magnetPowerUps = [];
    this.waveNumber = 1;
    this.waveTimeElapsed = 0;
    this.enemySpawnInterval = 2;
    this.waveDuration = 60; // Reset wave duration
    this.gameOver = false;
    this.isPaused = false;
    this.showShop = false; // Reset shop visibility
    this.activeMagnetRadius = 0;
    this.activeMagnetDuration = 0;
  }
}