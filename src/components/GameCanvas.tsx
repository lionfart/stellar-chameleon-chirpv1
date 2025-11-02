import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine, GameDataProps, MinimapEnemyData } from '@/game/GameEngine'; // Import GameDataProps and MinimapEnemyData
import LevelUpSelection from './LevelUpSelection';
import ShopScreen from './ShopScreen';
import HUD from './HUD';
import Minimap from './Minimap'; // Import the new Minimap component
import { showSuccess } from '@/utils/toast';

// Define ShopItem interface here as well for type consistency
interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'weapon' | 'ability' | 'consumable';
}

// ALL_LEVEL_UP_OPTIONS'ı bir fonksiyon olarak tanımlayalım, böylece mevcut oyun durumuna göre filtreleyebiliriz.
const getLevelUpOptions = (gameState: any) => { // gameState'i any olarak geçici olarak kullanıyoruz
  const options = [
    { id: 'aura_damage', name: 'Increase Aura Damage', description: 'Your aura deals more damage to enemies.' },
    { id: 'player_speed', name: 'Increase Movement Speed', description: 'Move faster across the map.' },
    { id: 'player_health', name: 'Increase Max Health', description: 'Gain more maximum health and heal to full.' },
    { id: 'projectile_damage', name: 'Increase Projectile Damage', description: 'Your projectiles deal more damage.' },
    { id: 'projectile_fire_rate', name: 'Increase Projectile Fire Rate', description: 'Your projectiles fire more frequently.' },
    { id: 'homing_missile_damage', name: 'Increase Missile Damage', description: 'Your homing missiles deal more damage.' }, // New upgrade
    { id: 'homing_missile_fire_rate', name: 'Increase Missile Fire Rate', description: 'Your homing missiles fire more frequently.' }, // New upgrade
    { id: 'homing_missile_count', name: 'Add Homing Missile', description: 'Fire an additional homing missile per volley.' }, // New upgrade
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
    // New general upgrades
    { id: 'player_magnet_radius', name: 'Increase Magnet Radius', description: 'Increase the radius for collecting experience gems.' },
    { id: 'experience_boost', name: 'Increase XP Gain', description: 'Gain more experience from defeated enemies.' },
    { id: 'gold_boost', name: 'Increase Gold Gain', description: 'Gain more gold from defeated enemies.' },
  ];

  // Filter options based on whether the player has the corresponding weapon/ability
  return options.filter(option => {
    if (option.id.startsWith('aura_') && !gameState.auraWeapon) return false;
    if (option.id.startsWith('projectile_') && !gameState.projectileWeapon) return false;
    if (option.id.startsWith('blade_') && !gameState.spinningBladeWeapon) return false;
    if (option.id.startsWith('homing_missile_') && !gameState.homingMissileWeapon) return false; // Filter for new weapon
    if (option.id.startsWith('explosion_') && !gameState.explosionAbility) return false;
    if (option.id.startsWith('shield_') && !gameState.shieldAbility) return false;
    if (option.id.startsWith('heal_') && !gameState.healAbility) return false;
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

  // State for all game data (HUD and Minimap)
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
    // Boss specific data
    bossActive: false,
    bossHealth: 0,
    bossMaxHealth: 0,
    bossName: '',
    // Minimap specific initial data
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

  // Level Up Callbacks
  const handleLevelUp = useCallback(() => {
    if (!gameEngineRef.current) return;
    const availableOptions = getLevelUpOptions(gameEngineRef.current.getGameState()); // Düzeltildi: gameState'e getter ile erişim
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

  // Shop Callbacks
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

  // Callback for all game data updates (HUD and Minimap)
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

    // Pass the stable callback references to GameEngine
    gameEngineRef.current = new GameEngine(ctx, handleLevelUp, handleOpenShop, handleCloseShop, handleUpdateGameData);
    gameEngineRef.current.init();

    if (!notificationsShownRef.current) {
      setTimeout(() => showSuccess("Use W, A, S, D or Arrow Keys to move."), 500);
      setTimeout(() => showSuccess("Press SHIFT to dash and evade enemies."), 2500);
      setTimeout(() => showSuccess("Press Q to activate/deactivate your shield."), 4500);
      setTimeout(() => showSuccess("Press E to trigger an explosion around you."), 6500);
      setTimeout(() => showSuccess("Press R to use your heal ability."), 8500); // New heal ability notification
      setTimeout(() => showSuccess("Find the Vendor (gold '$' icon) and press F to open the shop!"), 10500);
      notificationsShownRef.current = true;
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Update canvas dimensions in gameDataState as well
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
  }, [handleLevelUp, handleOpenShop, handleCloseShop, handleUpdateGameData]); // Add handleUpdateGameData to dependencies

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
      <HUD {...gameDataState} /> {/* Pass all gameDataState to HUD */}
      <Minimap {...gameDataState} /> {/* Pass all gameDataState to Minimap */}
    </div>
  );
};

export default GameCanvas;