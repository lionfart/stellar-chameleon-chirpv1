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
  auraWeapon: AuraWeapon;
  projectileWeapon: ProjectileWeapon;
  spinningBladeWeapon: SpinningBladeWeapon;
  explosionAbility: ExplosionAbility;
  shieldAbility: ShieldAbility;
  vendor: Vendor; // New: Vendor NPC

  worldWidth: number;
  worldHeight: number;
  waveNumber: number;
  waveTimeElapsed: number;
  enemySpawnInterval: number; // Moved from GameEngine
  waveDuration: number; // Added for HUD access
  
  gameOver: boolean;
  isPaused: boolean;

  activeMagnetRadius: number;
  activeMagnetDuration: number;

  constructor(
    player: Player,
    auraWeapon: AuraWeapon,
    projectileWeapon: ProjectileWeapon,
    spinningBladeWeapon: SpinningBladeWeapon,
    explosionAbility: ExplosionAbility,
    shieldAbility: ShieldAbility,
    vendor: Vendor, // New: Vendor in constructor
    worldWidth: number,
    worldHeight: number
  ) {
    this.player = player;
    this.auraWeapon = auraWeapon;
    this.projectileWeapon = projectileWeapon;
    this.spinningBladeWeapon = spinningBladeWeapon;
    this.explosionAbility = explosionAbility;
    this.shieldAbility = shieldAbility;
    this.vendor = vendor; // Assign vendor

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
    this.activeMagnetRadius = 0;
    this.activeMagnetDuration = 0;
  }
}