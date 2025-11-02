import React, { useRef, useEffect } from 'react';
import { GameEngine } from '@/game/GameEngine';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to fill the parent container or screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gameEngineRef.current = new GameEngine(ctx);
    gameEngineRef.current.init();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-initialize or update game engine with new dimensions if needed
      // For now, just resizing the canvas is enough.
    };

    window.addEventListener('resize', handleResize);

    return () => {
      gameEngineRef.current?.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="block bg-black" style={{ width: '100vw', height: '100vh' }} />
  );
};

export default GameCanvas;