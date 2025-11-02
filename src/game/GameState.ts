import { Player } from './Player';
import { Enemy } from './Enemy';
import { ExperienceGem } from './ExperienceGem';
import { MagnetPowerUp } from './MagnetPowerUp';
import { AuraWeapon } from './AuraWeapon';
import { ProjectileWeapon } from './ProjectileWeapon';
import { SpinningBladeWeapon } from './SpinningBladeWeapon';
import { HomingMissileWeapon } from './HomingMissileWeapon';
import { ExplosionAbility } from './ExplosionAbility';
import { ShieldAbility } from './ShieldAbility';
import { Vendor } from './Vendor';
import { DamageNumber } from './DamageNumber';
import { HealAbility } from './HealAbility';
import { Boss } from './Boss'; // Import Boss
import { BossWarning } from './BossWarning'; // Import BossWarning
import { BossAttackVisual } from './BossAttackVisual'; // Import BossAttackVisual

export class GameState {
  player: Player;
  enemies: Enemy[];
  experienceGems: ExperienceGem[];
  magnetPowerUps: MagnetPowerUp[];
  auraWeapon: AuraWeapon | undefined;
  projectileWeapon: ProjectileWeapon | undefined;
  spinningBladeWeapon: SpinningBladeWeapon | undefined;
  homingMissileWeapon: HomingMissileWeapon | undefined;
  explosionAbility: ExplosionAbility | undefined;
  shieldAbility: ShieldAbility | undefined;
  healAbility: HealAbility | undefined;
  vendor: Vendor;
  damageNumbers: DamageNumber[];
  currentBoss: Boss | undefined; // New: Current active boss
  bossWarning: BossWarning | undefined; // New: Boss warning instance
  isBossWarningActive: boolean; // New: Flag to indicate if boss warning is active
  activeBossAttackVisuals: BossAttackVisual[]; // New: For boss attack visualizations

  worldWidth: number;
  worldHeight: number;
  waveNumber: number;
  waveTimeElapsed: number;
  enemySpawnInterval: number;
  waveDuration: number;
  
  gameOver: boolean;
  isPaused: boolean;
  showShop: boolean;

  activeMagnetRadius: number;
  activeMagnetDuration: number;

  // New properties for Princess Simge rescue
  princessNameLetters: string[] = ['S', 'I', 'M', 'G', 'E'];
  collectedLetters: string[] = [];
  nextLetterIndex: number = 0;
  gameWon: boolean = false;


  constructor(
    player: Player,
    vendor: Vendor,
    worldWidth: number,
    worldHeight: number,
    initialWeapon?: AuraWeapon | ProjectileWeapon | SpinningBladeWeapon | HomingMissileWeapon,
    initialExplosionAbility?: ExplosionAbility,
    initialShieldAbility?: ShieldAbility,
    initialHealAbility?: HealAbility
  ) {
    this.player = player;
    this.vendor = vendor;

    this.auraWeapon = undefined;
    this.projectileWeapon = undefined;
    this.spinningBladeWeapon = undefined;
    this.homingMissileWeapon = undefined;
    this.explosionAbility = undefined;
    this.shieldAbility = initialShieldAbility;
    this.healAbility = initialHealAbility;

    if (initialWeapon instanceof AuraWeapon) {
      this.auraWeapon = initialWeapon;
    } else if (initialWeapon instanceof ProjectileWeapon) {
      this.projectileWeapon = initialWeapon;
    } else if (initialWeapon instanceof SpinningBladeWeapon) {
      this.spinningBladeWeapon = initialWeapon;
    } else if (initialWeapon instanceof HomingMissileWeapon) {
      this.homingMissileWeapon = initialWeapon;
    }

    this.explosionAbility = initialExplosionAbility;
    this.shieldAbility = initialShieldAbility;

    this.enemies = [];
    this.experienceGems = [];
    this.magnetPowerUps = [];
    this.damageNumbers = [];
    this.currentBoss = undefined; // Initialize currentBoss
    this.bossWarning = undefined; // Initialize boss warning
    this.isBossWarningActive = false; // Initialize boss warning flag
    this.activeBossAttackVisuals = []; // Initialize activeBossAttackVisuals

    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.waveNumber = 1;
    this.waveTimeElapsed = 0;
    this.enemySpawnInterval = 2;
    this.waveDuration = 60;

    this.gameOver = false;
    this.isPaused = false;
    this.showShop = false;

    this.activeMagnetRadius = 0;
    this.activeMagnetDuration = 0;
  }

  reset() {
    this.enemies = [];
    this.experienceGems = [];
    this.magnetPowerUps = [];
    this.damageNumbers = [];
    this.currentBoss = undefined; // Reset currentBoss
    this.bossWarning = undefined; // Reset boss warning
    this.isBossWarningActive = false; // Reset boss warning flag
    this.activeBossAttackVisuals = []; // Reset activeBossAttackVisuals
    this.waveNumber = 1;
    this.waveTimeElapsed = 0;
    this.enemySpawnInterval = 2;
    this.waveDuration = 60;
    this.gameOver = false;
    this.isPaused = false;
    this.showShop = false;
    this.activeMagnetRadius = 0;
    this.activeMagnetDuration = 0;
    this.auraWeapon = undefined;
    this.projectileWeapon = undefined;
    this.spinningBladeWeapon = undefined;
    this.homingMissileWeapon = undefined;
    this.explosionAbility = undefined;
    this.shieldAbility = undefined;
    this.healAbility = undefined;

    // Reset new properties
    this.collectedLetters = [];
    this.nextLetterIndex = 0;
    this.gameWon = false;
  }
}