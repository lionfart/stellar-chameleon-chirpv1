import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine, GameDataProps, MinimapEnemyData } from '@/game/GameEngine';
import LevelUpSelection from './LevelUpSelection';
import ShopScreen from './ShopScreen';
import HUD from './HUD';
import Minimap from './Minimap';
import { showSuccess } from '@/utils/toast';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'weapon' | 'ability' | 'consumable';
}

const getLevelUpOptions = (gameState: any) => {
  const options = [
    { id: 'aura_damage', name: 'Increase Aura Damage', description: 'Your aura deals more damage to enemies.' },
    { id: 'player_speed', name: 'Increase Movement Speed', description: 'Move faster across the map.' },
    { id: 'player_health', name: 'Increase Max Health', description: 'Gain more maximum health and heal to full.' },
    { id: 'projectile_damage', name: 'Increase Projectile Damage', description: 'Your projectiles deal more damage.' },
    { id: 'projectile_fire_rate', name: 'Increase Projectile Fire Rate', description: 'Your projectiles fire more frequently.' },
    { id: 'homing_missile_damage', name: 'Increase Missile Damage', description: 'Your homing missiles deal more damage.' },
    { id: 'homing_missile_fire_rate', name: 'Increase Missile Fire Rate', description: 'Your homing missiles fire more frequently.' },
    { id: 'homing_missile_count', name: 'Add Homing Missile', description: 'Fire an additional homing missile per volley.' },
    { id: 'laser_beam_damage', name: 'Increase Laser Damage', description: 'Your laser beam deals more damage.' },
    { id: 'laser_beam_range', name: 'Increase Laser Range', description: 'Your laser beam can target enemies further away.' },
    // REMOVED: Laser Beam Cooldown/Duration upgrades as it's now an automatic weapon
    // { id: 'laser_beam_cooldown', name: 'Reduce Laser Cooldown', description: 'Use your laser beam more often.' },
    // { id: 'laser_beam_duration', name: 'Increase Laser Duration', description: 'Your laser beam stays active longer.' },
    { id: 'dash_cooldown', name: 'Reduce Dash Cooldown', description: 'Dash more often to evade enemies.' },
    { id: 'blade_damage', name: 'Increase Blade Damage', description: 'Your spinning blades deal more damage.' },
    { id: 'add_blade', name: 'Add Spinning Blade', description: 'Add another blade to orbit you, increasing coverage.' },
    { id: 'explosion_damage', name: 'Increase Explosion Damage', description: 'Your explosion ability deals more damage.' },
    { id: 'explosion_cooldown', name: 'Reduce Explosion Cooldown', description: 'Use your explosion ability more often.' },
    { id: 'explosion_radius', name: 'Increase Explosion Radius', description: 'Your explosion ability affects a larger area.' },
    { id: 'shield_health', name: 'Increase Shield Health', description: 'Your shield can absorb more damage.' },
    { id: 'shield_regen', name: 'Increase Shield Regeneration', description: 'Your shield regenerates health faster when inactive.' },
    { id: 'shield_cooldown', name: 'Reduce Shield Cooldown', description: 'Your shield becomes ready faster after breaking.' },
    { id: 'heal_amount', name: 'Increase Heal Amount', description: 'Your heal ability restores more health.' },
    { id: 'heal_cooldown', name: 'Reduce Heal Cooldown', description: 'Your heal ability becomes ready faster.' },
    { id: 'time_slow_factor', name: 'Increase Time Slow Effect', description: 'Enemies are slowed down even more.' },
    { id: 'time_slow_duration', name: 'Increase Time Slow Duration', description: 'Time slow lasts longer.' },
    { id: 'time_slow_cooldown', name: 'Reduce Time Slow Cooldown', description: 'Use time slow more often.' },
    { id: 'player_magnet_radius', name: 'Increase Magnet Radius', description: 'Increase the radius for collecting experience gems.' },
    { id: 'experience_boost', name: 'Increase XP Gain', description: 'Gain more experience from defeated enemies.' },
    { id: 'gold_boost', name: 'Increase Gold Gain', description: 'Gain more gold from defeated enemies.' },
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

const GameCanvas: React.FC = () => {
  console.log("GameCanvas component rendering...");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [showLevelUpScreen, setShowLevelUpScreen] = useState(false);
  const [currentLevelUpOptions, setCurrentLevelUpOptions] = useState<{ id: string; name: string; description: string }[]>([]);
  const [showShopScreen, setShowShopScreen] = useState(false);
  const [currentShopItems, setCurrentShopItems] = useState<ShopItem[]>([]);
  const [playerGold, setPlayerGold] = useState(0);
  const notificationsShownRef = useRef(false);

  const [gameDataState, setGameDataState] = useState<GameDataProps>({
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
    // REMOVED: Laser Beam Cooldown from initial state as it's no longer a player ability
    // laserBeamCooldownCurrent: 0,
    // laserBeamCooldownMax: 0,
    bossActive: false,
    bossHealth: 0,
    bossMaxHealth: 0,
    bossName: '',
    collectedLetters: [],
    gameWon: false,
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
    const availableOptions = getLevelUpOptions(gameEngineRef.current.getGameState());
    const shuffled = [...availableOptions].sort(() => 0.5 - Math.random());
    setCurrentLevelUpOptions(shuffled.slice(0, 3));
    setShowLevelUpScreen(true);
    gameEngineRef.current?.pause();
  }, []);

  const handleSelectUpgrade = useCallback((upgradeId: string) => {
    gameEngineRef.current?.applyUpgrade(upgradeId);
    setShowLevelUpScreen(false);
    gameEngineRef.current?.resume();
  }, []);

  const handleOpenShop = useCallback((items: ShopItem[], gold: number) => {
    console.log("GameCanvas: handleOpenShop called.");
    setCurrentShopItems(items);
    setPlayerGold(gold);
    setShowShopScreen(true);
  }, []);

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

    gameEngineRef.current = new GameEngine(ctx, handleLevelUp, handleOpenShop, handleCloseShop, handleUpdateGameData);
    gameEngineRef.current.init();

    if (!notificationsShownRef.current) {
      setTimeout(() => showSuccess("Use W, A, S, D or Arrow Keys to move."), 500);
      setTimeout(() => showSuccess("Press SHIFT to dash and evade enemies."), 2500);
      setTimeout(() => showSuccess("Press Q to activate/deactivate your shield."), 4500);
      setTimeout(() => showSuccess("Press E to trigger an explosion around you."), 6500);
      setTimeout(() => showSuccess("Press R to use your heal ability."), 8500);
      setTimeout(() => showSuccess("Press T to slow down time for enemies."), 10500);
      // REMOVED: Laser Beam notification as it's now an automatic weapon
      // setTimeout(() => showSuccess("Press X to fire your Laser Beam!"), 12500);
      setTimeout(() => showSuccess("Find the Vendor (gold '$' icon) and press F to open the shop!"), 12500); // Adjusted timing
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
  }, [handleLevelUp, handleOpenShop, handleCloseShop, handleUpdateGameData]);

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
    </div>
  );
};

export default GameCanvas;