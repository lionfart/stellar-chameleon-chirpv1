import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from '@/game/GameEngine';
import LevelUpSelection from './LevelUpSelection'; // Import the new component

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [showLevelUpScreen, setShowLevelUpScreen] = useState(false);

  const handleLevelUp = useCallback(() => {
    setShowLevelUpScreen(true);
    gameEngineRef.current?.pause();
  }, []);

  const handleSelectUpgrade = useCallback((upgradeId: string) => {
    console.log(`Selected upgrade: ${upgradeId}`);
    // Here you would apply the upgrade to the player/game state
    // For now, we just close the screen and resume
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

    gameEngineRef.current = new GameEngine(ctx, handleLevelUp); // Pass the callback
    gameEngineRef.current.init();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-initialize or update game engine with new dimensions if needed
    };

    window.addEventListener('resize', handleResize);

    return () => {
      gameEngineRef.current?.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleLevelUp]);

  const levelUpOptions = [
    { id: 'damage', name: 'Increase Damage', description: 'Your aura deals more damage.' },
    { id: 'speed', name: 'Increase Speed', description: 'Move faster across the map.' },
    { id: 'health', name: 'Increase Max Health', description: 'Gain more maximum health.' },
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