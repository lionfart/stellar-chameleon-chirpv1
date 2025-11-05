import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine, GameDataProps, MinimapEnemyData } from '@/game/GameEngine';
import LevelUpSelection from './LevelUpSelection';
import ShopScreen from './ShopScreen';
import HUD from './HUD';
import Minimap from './Minimap';
import { showSuccess } from '@/utils/toast';
import LeaderboardWidget from './LeaderboardWidget'; // NEW
import RestartButton from './RestartButton'; // NEW
import { useLanguage } from '@/contexts/LanguageContext'; // NEW: Import useLanguage

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'weapon' | 'ability' | 'consumable';
}

interface GameCanvasProps {
  playerName: string;
  initialSoundVolume: number;
}

const getLevelUpOptions = (gameState: any, t: (key: string) => string) => { // NEW: Pass t function
  const options = [
    { id: 'aura_damage', name: t('auraDamage'), description: t('auraDamageDesc') },
    { id: 'player_speed', name: t('playerSpeed'), description: t('playerSpeedDesc') },
    { id: 'player_health', name: t('playerHealth'), description: t('playerHealthDesc') },
    { id: 'projectile_damage', name: t('projectileDamage'), description: t('projectileDamageDesc') },
    { id: 'projectile_fire_rate', name: t('projectileFireRate'), description: t('projectileFireRateDesc') },
    { id: 'homing_missile_damage', name: t('homingMissileDamage'), description: t('homingMissileDamageDesc') },
    { id: 'homing_missile_fire_rate', name: t('homingMissileFireRate'), description: t('homingMissileFireRateDesc') },
    { id: 'homing_missile_count', name: t('homingMissileCount'), description: t('homingMissileCountDesc') },
    { id: 'laser_beam_damage', name: t('laserBeamDamage'), description: t('laserBeamDamageDesc') },
    { id: 'laser_beam_range', name: t('laserBeamRange'), description: t('laserBeamRangeDesc') },
    { id: 'dash_cooldown', name: t('dashCooldown'), description: t('dashCooldownDesc') },
    { id: 'blade_damage', name: t('bladeDamage'), description: t('bladeDamageDesc') },
    { id: 'add_blade', name: t('addBlade'), description: t('addBladeDesc') },
    { id: 'explosion_damage', name: t('explosionDamage'), description: t('explosionDamageDesc') },
    { id: 'explosion_cooldown', name: t('explosionCooldown'), description: t('explosionCooldownDesc') },
    { id: 'explosion_radius', name: t('explosionRadius'), description: t('explosionRadiusDesc') },
    { id: 'shield_health', name: t('shieldHealth'), description: t('shieldHealthDesc') },
    { id: 'shield_regen', name: t('shieldRegen'), description: t('shieldRegenDesc') },
    { id: 'shield_cooldown', name: t('shieldCooldown'), description: t('shieldCooldownDesc') },
    { id: 'heal_amount', name: t('healAmount'), description: t('healAmountDesc') },
    { id: 'heal_cooldown', name: t('healCooldown'), description: t('healCooldownDesc') },
    { id: 'time_slow_factor', name: t('timeSlowFactor'), description: t('timeSlowFactorDesc') },
    { id: 'time_slow_duration', name: t('timeSlowDuration'), description: t('timeSlowDurationDesc') },
    { id: 'time_slow_cooldown', name: t('timeSlowCooldown'), description: t('timeSlowCooldownDesc') },
    { id: 'player_magnet_radius', name: t('playerMagnetRadius'), description: t('playerMagnetRadiusDesc') },
    { id: 'experience_boost', name: t('experienceBoost'), description: t('experienceBoostDesc') },
    { id: 'gold_boost', name: t('goldBoost'), description: t('goldBoostDesc') },
  ];

  return options.filter(option => {
    if (option.id.startsWith('aura_') && !gameState.auraWeapon) return false;
    if (option.id.startsWith('projectile_') && !gameState.projectileWeapon) return false;
    if (option.id.startsWith('blade_') && !gameState.spinningBladeWeapon) return false;
    if (option.id.startsWith('homing_missile_') && !gameState.homingMissileWeapon) return false;
    if (option.id.startsWith('laser_beam_') && !gameState.laserBeamWeapon) return false;
    if (option.id.startsWith('explosion_') && !gameState.explosionAbility) return false;
    if (option.id.startsWith('shield_') && !gameState.shieldAbility) return false;
    if (option.id.startsWith('heal_') && !gameState.healAbility) return false;
    if (option.id.startsWith('time_slow_') && !gameState.timeSlowAbility) return false;
    return true;
  });
};

const getShopItems = (t: (key: string) => string): ShopItem[] => [ // Düzeltildi: Dönüş tipi ShopItem[] olarak belirtildi
  { id: 'buy_aura_weapon', name: t('auraWeapon'), description: t('auraWeaponDesc'), cost: 100, type: 'weapon' },
  { id: 'buy_projectile_weapon', name: t('projectileWeapon'), description: t('projectileWeaponDesc'), cost: 100, type: 'weapon' },
  { id: 'buy_spinning_blade_weapon', name: t('spinningBladeWeapon'), description: t('spinningBladeWeaponDesc'), cost: 100, type: 'weapon' },
  { id: 'buy_homing_missile_weapon', name: t('homingMissileWeapon'), description: t('homingMissileWeaponDesc'), cost: 120, type: 'weapon' },
  { id: 'buy_laser_beam_weapon', name: t('laserBeamWeapon'), description: t('laserBeamWeaponDesc'), cost: 150, type: 'weapon' },
  { id: 'buy_explosion_ability', name: t('explosionAbility'), description: t('explosionAbilityDesc'), cost: 150, type: 'ability' },
  { id: 'buy_shield_ability', name: t('shieldAbility'), description: t('shieldAbilityDesc'), cost: 150, type: 'ability' },
  { id: 'buy_heal_ability', name: t('healAbility'), description: t('healAbilityDesc'), cost: 120, type: 'ability' },
  { id: 'buy_time_slow_ability', name: t('timeSlowAbility'), description: t('timeSlowAbilityDesc'), cost: 180, type: 'ability' },
  { id: 'buy_health_potion', name: t('healthPotion'), description: t('healthPotionDesc'), cost: 50, type: 'consumable' },
];


const GameCanvas: React.FC<GameCanvasProps> = ({ playerName, initialSoundVolume }) => {
  console.log("GameCanvas component rendering...");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [showLevelUpScreen, setShowLevelUpScreen] = useState(false);
  const [currentLevelUpOptions, setCurrentLevelUpOptions] = useState<{ id: string; name: string; description: string }[]>([]);
  const [showShopScreen, setShowShopScreen] = useState(false);
  const [currentShopItems, setCurrentShopItems] = useState<ShopItem[]>([]);
  const [playerGold, setPlayerGold] = useState(0);
  const notificationsShownRef = useRef(false);
  const { t } = useLanguage(); // NEW: Use translation hook

  const [gameDataState, setGameDataState] = useState<GameDataProps>({
    playerName: playerName,
    playerHealth: 100,
    playerMaxHealth: 100,
    playerLevel: 1,
    playerExperience: 0,
    playerExperienceToNextLevel: 100,
    playerGold: 0,
    shieldActive: false,
    shieldCurrentHealth: 0,
    shieldMaxHealth: 0,
    waveNumber: 1,
    waveTimeRemaining: 60,
    dashCooldownCurrent: 0,
    dashCooldownMax: 0,
    explosionCooldownCurrent: 0,
    explosionCooldownMax: 0,
    shieldCooldownCurrent: 0,
    shieldCooldownMax: 0,
    healCooldownCurrent: 0,
    healCooldownMax: 0,
    timeSlowCooldownCurrent: 0,
    timeSlowCooldownMax: 0,
    bossActive: false,
    bossHealth: 0,
    bossMaxHealth: 0,
    bossName: '',
    collectedLetters: [],
    gameWon: false,
    gameOver: false, // NEW
    lastGameScoreEntry: null, // NEW
    playerX: 0,
    playerY: 0,
    worldWidth: 2000,
    worldHeight: 2000,
    cameraX: 0,
    cameraY: 0,
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight,
    enemiesMinimap: [],
    vendorX: 0,
    vendorY: 0,
  });

  const handleLevelUp = useCallback(() => {
    if (!gameEngineRef.current) return;
    const availableOptions = getLevelUpOptions(gameEngineRef.current.getGameState(), t); // NEW: Pass t
    const shuffled = [...availableOptions].sort(() => 0.5 - Math.random());
    setCurrentLevelUpOptions(shuffled.slice(0, 3));
    setShowLevelUpScreen(true);
    gameEngineRef.current?.pause();
  }, [t]); // NEW: Add t to dependencies

  const handleSelectUpgrade = useCallback((upgradeId: string) => {
    gameEngineRef.current?.applyUpgrade(upgradeId);
    setShowLevelUpScreen(false);
    gameEngineRef.current?.resume();
  }, []);

  const handleOpenShop = useCallback((items: ShopItem[], gold: number) => {
    console.log("GameCanvas: handleOpenShop called.");
    // Filter shop items based on what's already owned, using translated names
    const availableShopItems = getShopItems(t).filter(item => {
      if (item.id === 'buy_aura_weapon' && gameEngineRef.current?.getGameState().auraWeapon) return false;
      if (item.id === 'buy_projectile_weapon' && gameEngineRef.current?.getGameState().projectileWeapon) return false;
      if (item.id === 'buy_spinning_blade_weapon' && gameEngineRef.current?.getGameState().spinningBladeWeapon) return false;
      if (item.id === 'buy_homing_missile_weapon' && gameEngineRef.current?.getGameState().homingMissileWeapon) return false;
      if (item.id === 'buy_laser_beam_weapon' && gameEngineRef.current?.getGameState().laserBeamWeapon) return false;
      if (item.id === 'buy_explosion_ability' && gameEngineRef.current?.getGameState().explosionAbility) return false;
      if (item.id === 'buy_shield_ability' && gameEngineRef.current?.getGameState().shieldAbility) return false;
      if (item.id === 'buy_heal_ability' && gameEngineRef.current?.getGameState().healAbility) return false;
      if (item.id === 'buy_time_slow_ability' && gameEngineRef.current?.getGameState().timeSlowAbility) return false;
      return true;
    });
    setCurrentShopItems(availableShopItems);
    setPlayerGold(gold);
    setShowShopScreen(true);
  }, [t]); // NEW: Add t to dependencies

  const handleCloseShop = useCallback(() => {
    console.log("GameCanvas: handleCloseShop called.");
    setShowShopScreen(false);
  }, []);

  const handlePurchaseItem = useCallback((itemId: string) => {
    gameEngineRef.current?.purchaseItem(itemId);
  }, []);

  const handleUpdateGameData = useCallback((data: GameDataProps) => {
    setGameDataState(data);
  }, []);

  useEffect(() => {
    console.log("GameCanvas useEffect: Initializing GameEngine...");
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gameEngineRef.current = new GameEngine(ctx, handleLevelUp, handleOpenShop, handleCloseShop, handleUpdateGameData, playerName, initialSoundVolume, t); // NEW: Pass t to GameEngine
    gameEngineRef.current.init();

    if (!notificationsShownRef.current) {
      setTimeout(() => showSuccess(t('moveKeys')), 500); // NEW: Use translated messages
      setTimeout(() => showSuccess(t('dashKey')), 2500);
      setTimeout(() => showSuccess(t('abilitiesKeys')), 4500);
      setTimeout(() => showSuccess(t('vendorShop')), 12500);
      notificationsShownRef.current = true;
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setGameDataState(prevState => ({
        ...prevState,
        canvasWidth: window.innerWidth,
        canvasHeight: window.innerHeight,
      }));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      console.log("GameCanvas useEffect cleanup: Stopping GameEngine.");
      gameEngineRef.current?.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleLevelUp, handleOpenShop, handleCloseShop, handleUpdateGameData, playerName, initialSoundVolume, t]); // NEW: Add t to dependencies

  const isGameOverOrWon = gameDataState.gameOver || gameDataState.gameWon;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="block bg-black" style={{ width: '100vw', height: '100vh' }} />
      {showLevelUpScreen && (
        <LevelUpSelection onSelectUpgrade={handleSelectUpgrade} options={currentLevelUpOptions} />
      )}
      {showShopScreen && (
        <ShopScreen
          items={currentShopItems}
          onPurchase={handlePurchaseItem}
          onClose={() => gameEngineRef.current?.closeShop()}
          playerGold={playerGold}
        />
      )}
      <HUD {...gameDataState} />
      <Minimap {...gameDataState} />

      {isGameOverOrWon && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50 p-4">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg mb-8">
            {gameDataState.gameWon ? t('youWin') : t('gameOver')} {/* NEW: Translate game over/win messages */}
          </h1>
          <div className="space-y-4 w-full max-w-md">
            <LeaderboardWidget currentScoreEntry={gameDataState.lastGameScoreEntry} />
            <RestartButton onClick={() => gameEngineRef.current?.restartGame()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;