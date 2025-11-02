import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from '@/game/GameEngine';
import LevelUpSelection from './LevelUpSelection';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [showLevelUpScreen, setShowLevelUpScreen] = useState(false);

  const handleLevelUp = useCallback(() => {
    setShowLevelUpScreen(true);
    gameEngineRef.current?.pause();
  }, []);

  const handleSelectUpgrade = useCallback((upgradeId: string) => {
    gameEngineRef.current?.applyUpgrade(upgradeId); // Apply the upgrade
    setShowLevelUpScreen(false);
    gameEngineRef.current?.resume();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gameEngineRef.current = new GameEngine(ctx, handleLevelUp);
    gameEngineRef.current.init();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      gameEngineRef.current?.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleLevelUp]);

  const levelUpOptions = [
    { id: 'damage', name: 'Increase Aura Damage', description: 'Your aura deals more damage to enemies.' },
    { id: 'speed', name: 'Increase Movement Speed', description: 'Move faster across the map.' },
    { id: 'health', name: 'Increase Max Health', description: 'Gain more maximum health and heal to full.' },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="block bg-black" style={{ width: '100vw', height: '100vh' }} />
      {showLevelUpScreen && (
        <LevelUpSelection onSelectUpgrade={handleSelectUpgrade} options={levelUpOptions} />
      )}
    </div>
  );
};

export default GameCanvas;