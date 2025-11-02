import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from '@/game/GameEngine';
import LevelUpSelection from './LevelUpSelection';
import ShopScreen from './ShopScreen';
import { showSuccess } from '@/utils/toast';

// Define ShopItem interface here as well for type consistency
interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'weapon' | 'ability' | 'consumable';
}

// Move allLevelUpOptions outside the component to ensure it's stable
const ALL_LEVEL_UP_OPTIONS = [
  { id: 'aura_damage', name: 'Increase Aura Damage', description: 'Your aura deals more damage to enemies.' },
  { id: 'player_speed', name: 'Increase Movement Speed', description: 'Move faster across the map.' },
  { id: 'player_health', name: 'Increase Max Health', description: 'Gain more maximum health and heal to full.' },
  { id: 'projectile_damage', name: 'Increase Projectile Damage', description: 'Your projectiles deal more damage.' },
  { id: 'projectile_fire_rate', name: 'Increase Projectile Fire Rate', description: 'Your projectiles fire more frequently.' },
  { id: 'dash_cooldown', name: 'Reduce Dash Cooldown', description: 'Dash more often to evade enemies.' },
  { id: 'blade_damage', name: 'Increase Blade Damage', description: 'Your spinning blades deal more damage.' },
  { id: 'add_blade', name: 'Add Spinning Blade', description: 'Add another blade to orbit you, increasing coverage.' },
  { id: 'explosion_damage', name: 'Increase Explosion Damage', description: 'Your explosion ability deals more damage.' },
  { id: 'explosion_cooldown', name: 'Reduce Explosion Cooldown', description: 'Use your explosion ability more often.' },
  { id: 'explosion_radius', name: 'Increase Explosion Radius', description: 'Your explosion ability affects a larger area.' },
  { id: 'shield_health', name: 'Increase Shield Health', description: 'Your shield can absorb more damage.' },
  { id: 'shield_regen', name: 'Increase Shield Regeneration', description: 'Your shield regenerates health faster when inactive.' },
  { id: 'shield_cooldown', name: 'Reduce Shield Cooldown', description: 'Your shield becomes ready faster after breaking.' },
];

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

  // Level Up Callbacks
  const handleLevelUp = useCallback(() => {
    const shuffled = [...ALL_LEVEL_UP_OPTIONS].sort(() => 0.5 - Math.random());
    setCurrentLevelUpOptions(shuffled.slice(0, 3));
    setShowLevelUpScreen(true);
    gameEngineRef.current?.pause();
  }, []);

  const handleSelectUpgrade = useCallback((upgradeId: string) => {
    gameEngineRef.current?.applyUpgrade(upgradeId);
    setShowLevelUpScreen(false);
    gameEngineRef.current?.resume();
  }, []);

  // Shop Callbacks - These are now passed to GameEngine directly
  // and will update GameCanvas's state
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

  useEffect(() => {
    console.log("GameCanvas useEffect: Initializing GameEngine...");
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Pass the stable callback references to GameEngine
    gameEngineRef.current = new GameEngine(ctx, handleLevelUp, handleOpenShop, handleCloseShop);
    gameEngineRef.current.init();

    if (!notificationsShownRef.current) {
      setTimeout(() => showSuccess("Use W, A, S, D or Arrow Keys to move."), 500);
      setTimeout(() => showSuccess("Press SHIFT to dash and evade enemies."), 2500);
      setTimeout(() => showSuccess("Press Q to activate/deactivate your shield."), 4500);
      setTimeout(() => showSuccess("Press E to trigger an explosion around you."), 6500);
      setTimeout(() => showSuccess("Find the Vendor (gold '$' icon) and press F to open the shop!"), 8500);
      notificationsShownRef.current = true;
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      console.log("GameCanvas useEffect cleanup: Stopping GameEngine.");
      gameEngineRef.current?.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleLevelUp, handleOpenShop, handleCloseShop]); // Keep these in dependencies as they are passed to GameEngine constructor

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
    </div>
  );
};

export default GameCanvas;