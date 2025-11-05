export class SpriteManager {
  private sprites: Map<string, HTMLImageElement>;
  private loadedCount: number;
  private totalCount: number;
  private onAllLoadedCallback: () => void;
  private backgroundCanvas: HTMLCanvasElement | null = null; // NEW: Offscreen canvas for background

  constructor(onAllLoaded: () => void) {
    this.sprites = new Map();
    this.loadedCount = 0;
    this.totalCount = 0;
    this.onAllLoadedCallback = onAllLoaded;
  }

  loadSprite(name: string, base64Svg: string) {
    this.totalCount++;
    const img = new Image();
    img.src = `data:image/svg+xml;base64,${btoa(base64Svg)}`;
    img.onload = () => {
      this.sprites.set(name, img);
      this.loadedCount++;
      if (this.loadedCount === this.totalCount) {
        this.onAllLoadedCallback();
      }
    };
    img.onerror = () => {
      console.error(`Failed to load sprite: ${name}`);
      this.loadedCount++; // Still count as loaded to avoid blocking
      if (this.loadedCount === this.totalCount) {
        this.onAllLoadedCallback();
      }
    };
  }

  getSprite(name: string): HTMLImageElement | undefined {
    return this.sprites.get(name);
  }

  // NEW: Method to create and return the offscreen background canvas
  getBackgroundCanvas(worldWidth: number, worldHeight: number): HTMLCanvasElement {
    if (this.backgroundCanvas) {
      return this.backgroundCanvas;
    }

    const canvas = document.createElement('canvas');
    canvas.width = worldWidth;
    canvas.height = worldHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error("Could not get 2D context for background canvas.");
    }

    const backgroundTile = this.getSprite('background_tile');
    if (backgroundTile) {
      const tileWidth = backgroundTile.width;
      const tileHeight = backgroundTile.height;

      for (let x = 0; x < worldWidth; x += tileWidth) {
        for (let y = 0; y < worldHeight; y += tileHeight) {
          ctx.drawImage(backgroundTile, x, y, tileWidth, tileHeight);
        }
      }
    } else {
      ctx.fillStyle = '#333'; // Fallback color
      ctx.fillRect(0, 0, worldWidth, worldHeight);
    }

    this.backgroundCanvas = canvas;
    return canvas;
  }

  // --- Player Knight Sprites ---
  static getPlayerIdleSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="knightBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#A9A9A9" />
            <stop offset="100%" stop-color="#696969" />
          </linearGradient>
          <linearGradient id="knightHelmet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C0C0C0" />
            <stop offset="100%" stop-color="#808080" />
          </linearGradient>
          <linearGradient id="knightShield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4CAF50" />
            <stop offset="100%" stop-color="#2E7D32" />
          </linearGradient>
        </defs>
        <!-- Body -->
        <rect x="${size * 0.3}" y="${size * 0.4}" width="${size * 0.4}" height="${size * 0.4}" rx="${size * 0.05}" ry="${size * 0.05}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Head -->
        <circle cx="${size / 2}" cy="${size * 0.35}" r="${size * 0.15}" fill="url(#knightHelmet)" stroke="#444" stroke-width="1"/>
        <!-- Plume -->
        <path d="M${size * 0.55},${size * 0.2} Q${size * 0.65},${size * 0.1} ${size * 0.7},${size * 0.25} Q${size * 0.6},${size * 0.15} ${size * 0.55},${size * 0.2} Z" fill="#FFD700"/>
        <!-- Visor slit -->
        <rect x="${size * 0.45}" y="${size * 0.32}" width="${size * 0.1}" height="${size * 0.03}" fill="#333"/>
        <!-- Legs (neutral) -->
        <rect x="${size * 0.35}" y="${size * 0.8}" width="${size * 0.1}" height="${size * 0.2}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <rect x="${size * 0.55}" y="${size * 0.8}" width="${size * 0.1}" height="${size * 0.2}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Left Arm -->
        <rect x="${size * 0.2}" y="${size * 0.45}" width="${size * 0.1}" height="${size * 0.3}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Right Arm -->
        <rect x="${size * 0.7}" y="${size * 0.45}" width="${size * 0.1}" height="${size * 0.3}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Shield (left arm) -->
        <rect x="${size * 0.15}" y="${size * 0.5}" width="${size * 0.15}" height="${size * 0.2}" rx="${size * 0.02}" ry="${size * 0.02}" fill="url(#knightShield)" stroke="#2E7D32" stroke-width="1"/>
        <!-- Sword Hilt (right arm) -->
        <rect x="${size * 0.75}" y="${size * 0.5}" width="${size * 0.05}" height="${size * 0.1}" fill="#8B4513"/>
        <rect x="${size * 0.73}" y="${size * 0.53}" width="${size * 0.09}" height="${size * 0.04}" fill="#8B4513"/>
        <!-- Sword Blade -->
        <rect x="${size * 0.77}" y="${size * 0.4}" width="${size * 0.01}" height="${size * 0.1}" fill="#C0C0C0"/>
      </svg>
    `;
  }

  static getPlayerWalk0SpriteSVG(size: number): string {
    const legOffset = size * 0.03; // Smaller offset for subtle animation
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="knightBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#A9A9A9" />
            <stop offset="100%" stop-color="#696969" />
          </linearGradient>
          <linearGradient id="knightHelmet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C0C0C0" />
            <stop offset="100%" stop-color="#808080" />
          </linearGradient>
          <linearGradient id="knightShield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4CAF50" />
            <stop offset="100%" stop-color="#2E7D32" />
          </linearGradient>
        </defs>
        <!-- Body -->
        <rect x="${size * 0.3}" y="${size * 0.4}" width="${size * 0.4}" height="${size * 0.4}" rx="${size * 0.05}" ry="${size * 0.05}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Head -->
        <circle cx="${size / 2}" cy="${size * 0.35}" r="${size * 0.15}" fill="url(#knightHelmet)" stroke="#444" stroke-width="1"/>
        <!-- Plume -->
        <path d="M${size * 0.55},${size * 0.2} Q${size * 0.65},${size * 0.1} ${size * 0.7},${size * 0.25} Q${size * 0.6},${size * 0.15} ${size * 0.55},${size * 0.2} Z" fill="#FFD700"/>
        <!-- Visor slit -->
        <rect x="${size * 0.45}" y="${size * 0.32}" width="${size * 0.1}" height="${size * 0.03}" fill="#333"/>
        <!-- Legs (left forward, right back) -->
        <rect x="${size * 0.35 - legOffset}" y="${size * 0.8}" width="${size * 0.1}" height="${size * 0.2}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <rect x="${size * 0.55 + legOffset}" y="${size * 0.8}" width="${size * 0.1}" height="${size * 0.2}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Left Arm -->
        <rect x="${size * 0.2}" y="${size * 0.45}" width="${size * 0.1}" height="${size * 0.3}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Right Arm -->
        <rect x="${size * 0.7}" y="${size * 0.45}" width="${size * 0.1}" height="${size * 0.3}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Shield (left arm) -->
        <rect x="${size * 0.15}" y="${size * 0.5}" width="${size * 0.15}" height="${size * 0.2}" rx="${size * 0.02}" ry="${size * 0.02}" fill="url(#knightShield)" stroke="#2E7D32" stroke-width="1"/>
        <!-- Sword Hilt (right arm) -->
        <rect x="${size * 0.75}" y="${size * 0.5}" width="${size * 0.05}" height="${size * 0.1}" fill="#8B4513"/>
        <rect x="${size * 0.73}" y="${size * 0.53}" width="${size * 0.09}" height="${size * 0.04}" fill="#8B4513"/>
        <!-- Sword Blade -->
        <rect x="${size * 0.77}" y="${size * 0.4}" width="${size * 0.01}" height="${size * 0.1}" fill="#C0C0C0"/>
      </svg>
    `;
  }

  static getPlayerWalk1SpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="knightBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#A9A9A9" />
            <stop offset="100%" stop-color="#696969" />
          </linearGradient>
          <linearGradient id="knightHelmet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C0C0C0" />
            <stop offset="100%" stop-color="#808080" />
          </linearGradient>
          <linearGradient id="knightShield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4CAF50" />
            <stop offset="100%" stop-color="#2E7D32" />
          </linearGradient>
        </defs>
        <!-- Body -->
        <rect x="${size * 0.3}" y="${size * 0.4}" width="${size * 0.4}" height="${size * 0.4}" rx="${size * 0.05}" ry="${size * 0.05}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Head -->
        <circle cx="${size / 2}" cy="${size * 0.35}" r="${size * 0.15}" fill="url(#knightHelmet)" stroke="#444" stroke-width="1"/>
        <!-- Plume -->
        <path d="M${size * 0.55},${size * 0.2} Q${size * 0.65},${size * 0.1} ${size * 0.7},${size * 0.25} Q${size * 0.6},${size * 0.15} ${size * 0.55},${size * 0.2} Z" fill="#FFD700"/>
        <!-- Visor slit -->
        <rect x="${size * 0.45}" y="${size * 0.32}" width="${size * 0.1}" height="${size * 0.03}" fill="#333"/>
        <!-- Legs (neutral) -->
        <rect x="${size * 0.35}" y="${size * 0.8}" width="${size * 0.1}" height="${size * 0.2}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <rect x="${size * 0.55}" y="${size * 0.8}" width="${size * 0.1}" height="${size * 0.2}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Left Arm -->
        <rect x="${size * 0.2}" y="${size * 0.45}" width="${size * 0.1}" height="${size * 0.3}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Right Arm -->
        <rect x="${size * 0.7}" y="${size * 0.45}" width="${size * 0.1}" height="${size * 0.3}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Shield (left arm) -->
        <rect x="${size * 0.15}" y="${size * 0.5}" width="${size * 0.15}" height="${size * 0.2}" rx="${size * 0.02}" ry="${size * 0.02}" fill="url(#knightShield)" stroke="#2E7D32" stroke-width="1"/>
        <!-- Sword Hilt (right arm) -->
        <rect x="${size * 0.75}" y="${size * 0.5}" width="${size * 0.05}" height="${size * 0.1}" fill="#8B4513"/>
        <rect x="${size * 0.73}" y="${size * 0.53}" width="${size * 0.09}" height="${size * 0.04}" fill="#8B4513"/>
        <!-- Sword Blade -->
        <rect x="${size * 0.77}" y="${size * 0.4}" width="${size * 0.01}" height="${size * 0.1}" fill="#C0C0C0"/>
      </svg>
    `;
  }

  static getPlayerWalk2SpriteSVG(size: number): string {
    const legOffset = size * 0.03; // Smaller offset for subtle animation
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="knightBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#A9A9A9" />
            <stop offset="100%" stop-color="#696969" />
          </linearGradient>
          <linearGradient id="knightHelmet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C0C0C0" />
            <stop offset="100%" stop-color="#808080" />
          </linearGradient>
          <linearGradient id="knightShield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4CAF50" />
            <stop offset="100%" stop-color="#2E7D32" />
          </linearGradient>
        </defs>
        <!-- Body -->
        <rect x="${size * 0.3}" y="${size * 0.4}" width="${size * 0.4}" height="${size * 0.4}" rx="${size * 0.05}" ry="${size * 0.05}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Head -->
        <circle cx="${size / 2}" cy="${size * 0.35}" r="${size * 0.15}" fill="url(#knightHelmet)" stroke="#444" stroke-width="1"/>
        <!-- Plume -->
        <path d="M${size * 0.55},${size * 0.2} Q${size * 0.65},${size * 0.1} ${size * 0.7},${size * 0.25} Q${size * 0.6},${size * 0.15} ${size * 0.55},${size * 0.2} Z" fill="#FFD700"/>
        <!-- Visor slit -->
        <rect x="${size * 0.45}" y="${size * 0.32}" width="${size * 0.1}" height="${size * 0.03}" fill="#333"/>
        <!-- Legs (right forward, left back) -->
        <rect x="${size * 0.35 + legOffset}" y="${size * 0.8}" width="${size * 0.1}" height="${size * 0.2}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <rect x="${size * 0.55 - legOffset}" y="${size * 0.8}" width="${size * 0.1}" height="${size * 0.2}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Left Arm -->
        <rect x="${size * 0.2}" y="${size * 0.45}" width="${size * 0.1}" height="${size * 0.3}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Right Arm -->
        <rect x="${size * 0.7}" y="${size * 0.45}" width="${size * 0.1}" height="${size * 0.3}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Shield (left arm) -->
        <rect x="${size * 0.15}" y="${size * 0.5}" width="${size * 0.15}" height="${size * 0.2}" rx="${size * 0.02}" ry="${size * 0.02}" fill="url(#knightShield)" stroke="#2E7D32" stroke-width="1"/>
        <!-- Sword Hilt (right arm) -->
        <rect x="${size * 0.75}" y="${size * 0.5}" width="${size * 0.05}" height="${size * 0.1}" fill="#8B4513"/>
        <rect x="${size * 0.73}" y="${size * 0.53}" width="${size * 0.09}" height="${size * 0.04}" fill="#8B4513"/>
        <!-- Sword Blade -->
        <rect x="${size * 0.77}" y="${size * 0.4}" width="${size * 0.01}" height="${size * 0.1}" fill="#C0C0C0"/>
      </svg>
    `;
  }

  static getPlayerWalk3SpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="knightBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#A9A9A9" />
            <stop offset="100%" stop-color="#696969" />
          </linearGradient>
          <linearGradient id="knightHelmet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C0C0C0" />
            <stop offset="100%" stop-color="#808080" />
          </linearGradient>
          <linearGradient id="knightShield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4CAF50" />
            <stop offset="100%" stop-color="#2E7D32" />
          </linearGradient>
        </defs>
        <!-- Body -->
        <rect x="${size * 0.3}" y="${size * 0.4}" width="${size * 0.4}" height="${size * 0.4}" rx="${size * 0.05}" ry="${size * 0.05}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Head -->
        <circle cx="${size / 2}" cy="${size * 0.35}" r="${size * 0.15}" fill="url(#knightHelmet)" stroke="#444" stroke-width="1"/>
        <!-- Plume -->
        <path d="M${size * 0.55},${size * 0.2} Q${size * 0.65},${size * 0.1} ${size * 0.7},${size * 0.25} Q${size * 0.6},${size * 0.15} ${size * 0.55},${size * 0.2} Z" fill="#FFD700"/>
        <!-- Visor slit -->
        <rect x="${size * 0.45}" y="${size * 0.32}" width="${size * 0.1}" height="${size * 0.03}" fill="#333"/>
        <!-- Legs (neutral) -->
        <rect x="${size * 0.35}" y="${size * 0.8}" width="${size * 0.1}" height="${size * 0.2}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <rect x="${size * 0.55}" y="${size * 0.8}" width="${size * 0.1}" height="${size * 0.2}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Left Arm -->
        <rect x="${size * 0.2}" y="${size * 0.45}" width="${size * 0.1}" height="${size * 0.3}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Right Arm -->
        <rect x="${size * 0.7}" y="${size * 0.45}" width="${size * 0.1}" height="${size * 0.3}" fill="url(#knightBody)" stroke="#444" stroke-width="1"/>
        <!-- Shield (left arm) -->
        <rect x="${size * 0.15}" y="${size * 0.5}" width="${size * 0.15}" height="${size * 0.2}" rx="${size * 0.02}" ry="${size * 0.02}" fill="url(#knightShield)" stroke="#2E7D32" stroke-width="1"/>
        <!-- Sword Hilt (right arm) -->
        <rect x="${size * 0.75}" y="${size * 0.5}" width="${size * 0.05}" height="${size * 0.1}" fill="#8B4513"/>
        <rect x="${size * 0.73}" y="${size * 0.53}" width="${size * 0.09}" height="${size * 0.04}" fill="#8B4513"/>
        <!-- Sword Blade -->
        <rect x="${size * 0.77}" y="${size * 0.4}" width="${size * 0.01}" height="${size * 0.1}" fill="#C0C0C0"/>
      </svg>
    `;
  }

  // --- Other Sprites (unchanged) ---
  static getEnemyNormalSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="enemyNormalGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#EF5350" />
            <stop offset="100%" stop-color="#D32F2F" />
          </radialGradient>
        </defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="url(#enemyNormalGradient)" stroke="#B71C1C" stroke-width="2"/>
        <circle cx="${size / 2 - size / 6}" cy="${size / 2 - size / 6}" r="${size / 10}" fill="#FFFFFF"/>
        <circle cx="${size / 2 + size / 6}" cy="${size / 2 - size / 6}" r="${size / 10}" fill="#FFFFFF"/>
        <path d="M${size / 2 - size / 8},${size * 2 / 3} Q${size / 2},${size * 3 / 4} ${size / 2 + size / 8},${size * 2 / 3}" stroke="#FFFFFF" stroke-width="2" fill="none"/>
      </svg>
    `;
  }

  static getEnemyFastSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="enemyFastGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFEB3B" />
            <stop offset="100%" stop-color="#FFC107" />
          </linearGradient>
        </defs>
        <polygon points="${size / 2},0 0,${size} ${size},${size}" fill="url(#enemyFastGradient)" stroke="#FFA000" stroke-width="2"/>
        <circle cx="${size / 2}" cy="${size * 2 / 3}" r="${size / 8}" fill="#FFFFFF"/>
        <path d="M${size * 0.2},${size * 0.8} L${size * 0.3},${size * 0.7} L${size * 0.4},${size * 0.8}" stroke="#FFFFFF" stroke-width="1" fill="none"/>
        <path d="M${size * 0.8},${size * 0.8} L${size * 0.7},${size * 0.7} L${size * 0.6},${size * 0.8}" stroke="#FFFFFF" stroke-width="1" fill="none"/>
      </svg>
    `;
  }

  static getEnemyTankySpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="enemyTankyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#9C27B0" />
            <stop offset="100%" stop-color="#7B1FA2" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="${size - 4}" height="${size - 4}" fill="url(#enemyTankyGradient)" stroke="#6A1B9A" stroke-width="2"/>
        <rect x="${size / 4}" y="${size / 4}" width="${size / 2}" height="${size / 2}" fill="#FFFFFF" opacity="0.3"/>
        <line x1="${size / 4}" y1="${size / 2}" x2="${size * 3 / 4}" y2="${size / 2}" stroke="#FFFFFF" stroke-width="2"/>
        <line x1="${size / 2}" y1="${size / 4}" x2="${size / 2}" y2="${size * 3 / 4}" stroke="#FFFFFF" stroke-width="2"/>
      </svg>
    `;
  }

  static getEnemyShooterSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="enemyShooterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4DD0E1" />
            <stop offset="100%" stop-color="#00ACC1" />
          </linearGradient>
        </defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="url(#enemyShooterGradient)" stroke="#00838F" stroke-width="2"/>
        <rect x="${size * 0.4}" y="${size * 0.1}" width="${size * 0.2}" height="${size * 0.3}" fill="#FFFFFF"/>
        <circle cx="${size / 2}" cy="${size * 0.25}" r="${size * 0.08}" fill="#FF5722"/>
        <circle cx="${size * 0.3}" cy="${size * 0.6}" r="${size * 0.1}" fill="#FFFFFF"/>
        <circle cx="${size * 0.7}" cy="${size * 0.6}" r="${size * 0.1}" fill="#FFFFFF"/>
      </svg>
    `;
  }

  static getProjectileSpriteSVG(size: number): string {
    // Generic projectile for enemies
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="projectileGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#00BCD4" />
            <stop offset="100%" stop-color="#0097A7" />
          </radialGradient>
        </defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="url(#projectileGradient)" stroke="#006064" stroke-width="1"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 4}" fill="#FFFFFF" opacity="0.7"/>
      </svg>
    `;
  }

  static getPlayerProjectileSpriteSVG(size: number): string {
    // Distinct projectile for player (e.g., green/yellow)
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="playerProjectileGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#8BC34A" />
            <stop offset="100%" stop-color="#689F38" />
          </radialGradient>
        </defs>
        <polygon points="${size / 2},0 ${size},${size / 2} ${size / 2},${size} 0,${size / 2}" fill="url(#playerProjectileGradient)" stroke="#33691E" stroke-width="1"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 4}" fill="#FFEB3B" opacity="0.9"/>
      </svg>
    `;
  }

  static getHomingMissileSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="missileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF5722" />
            <stop offset="100%" stop-color="#E64A19" />
          </linearGradient>
        </defs>
        <path d="M${size / 2},0 L${size * 0.75},${size * 0.25} L${size * 0.75},${size * 0.75} L${size / 2},${size} L${size * 0.25},${size * 0.75} L${size * 0.25},${size * 0.25} Z" fill="url(#missileGradient)" stroke="#BF360C" stroke-width="1"/>
        <circle cx="${size / 2}" cy="${size * 0.25}" r="${size * 0.1}" fill="#FFEB3B"/>
        <rect x="${size * 0.4}" y="${size * 0.7}" width="${size * 0.2}" height="${size * 0.2}" fill="#FFFFFF" opacity="0.5"/>
      </svg>
    `;
  }

  static getLaserBeamSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="laserBeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00FFFF" />
            <stop offset="100%" stop-color="#00BFFF" />
          </linearGradient>
        </defs>
        <rect x="${size * 0.4}" y="0" width="${size * 0.2}" height="${size}" fill="url(#laserBeamGradient)" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.15}" fill="#FFFFFF" opacity="0.8"/>
        <path d="M${size * 0.4},${size * 0.1} L${size * 0.6},${size * 0.1} L${size * 0.55},${size * 0.2} L${size * 0.45},${size * 0.2} Z" fill="#FFD700"/>
        <path d="M${size * 0.4},${size * 0.9} L${size * 0.6},${size * 0.9} L${size * 0.55},${size * 0.8} L${size * 0.45},${size * 0.8} Z" fill="#FFD700"/>
      </svg>
    `;
  }

  static getExperienceGemSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFEB3B" />
            <stop offset="50%" stop-color="#FBC02D" />
            <stop offset="100%" stop-color="#FFEB3B" />
          </linearGradient>
        </defs>
        <polygon points="${size / 2},0 ${size * 0.8},${size * 0.35} ${size * 0.95},${size} ${size * 0.05},${size} ${size * 0.2},${size * 0.35}" fill="url(#gemGradient)" stroke="#FBC02D" stroke-width="1"/>
        <circle cx="${size / 2}" cy="${size * 0.5}" r="${size * 0.1}" fill="#FFFFFF" opacity="0.8"/>
      </svg>
    `;
  }

  static getMagnetPowerUpSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="magnetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2196F3" />
            <stop offset="100%" stop-color="#1976D2" />
          </linearGradient>
        </defs>
        <path d="M${size * 0.2},0 L${size * 0.2},${size * 0.6} A${size * 0.3},${size * 0.3} 0 0 0 ${size * 0.8},${size * 0.6} L${size * 0.8},0 L${size},0 L${size},${size * 0.6} A${size * 0.5},${size * 0.5} 0 0 1 ${size * 0.5},${size} A${size * 0.5},${size * 0.5} 0 0 1 0,${size * 0.6} L0,0 Z" fill="url(#magnetGradient)" stroke="#1565C0" stroke-width="2"/>
        <rect x="${size * 0.2}" y="${size * 0.7}" width="${size * 0.6}" height="${size * 0.1}" fill="#FFFFFF"/>
        <circle cx="${size * 0.3}" cy="${size * 0.15}" r="${size * 0.05}" fill="#FFFFFF"/>
        <circle cx="${size * 0.7}" cy="${size * 0.15}" r="${size * 0.05}" fill="#FFFFFF"/>
      </svg>
    `;
  }

  static getSpinningBladeSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bladeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#B0BEC5" />
            <stop offset="100%" stop-color="#78909C" />
          </linearGradient>
        </defs>
        <polygon points="${size / 2},0 ${size * 0.75},${size * 0.25} ${size},${size / 2} ${size * 0.75},${size * 0.75} ${size / 2},${size} ${size * 0.25},${size * 0.75} 0,${size / 2} ${size * 0.25},${size * 0.25}" fill="url(#bladeGradient)" stroke="#546E7A" stroke-width="1"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 8}" fill="#FFFFFF" opacity="0.8"/>
      </svg>
    `;
  }

  static getBackgroundTileSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="backgroundGradient" cx="50%" cy="50%" r="75%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#2a2a2a" />
            <stop offset="100%" stop-color="#1a1a1a" />
          </radialGradient>
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.08" numOctaves="3" seed="10" result="turbulence"/>
            <feDiffuseLighting in="turbulence" lighting-color="#444" surfaceScale="2" result="light">
              <fePointLight x="${size / 2}" y="${size / 2}" z="20"/>
            </feDiffuseLighting>
            <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
          </filter>
          <filter id="blurOverlay">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="20" result="turbulence2"/>
            <feGaussianBlur in="turbulence2" stdDeviation="2" result="blur"/>
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0
                                                            0 1 0 0 0
                                                            0 0 1 0 0
                                                            0 0 0 3 -0.5" result="coloredBlur"/>
            <feBlend in="SourceGraphic" in2="coloredBlur" mode="screen"/>
          </filter>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#backgroundGradient)" />
        <rect width="${size}" height="${size}" fill="#333" opacity="0.1" filter="url(#noiseFilter)"/>
        <rect width="${size}" height="${size}" fill="#555" opacity="0.05" filter="url(#blurOverlay)"/>
        <circle cx="${size * 0.1}" cy="${size * 0.9}" r="${size * 0.15}" fill="#444" opacity="0.2"/>
        <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.1}" fill="#444" opacity="0.15"/>
        <rect x="${size * 0.4}" y="${size * 0.6}" width="${size * 0.3}" height="${size * 0.05}" fill="#444" opacity="0.1" transform="rotate(20 ${size * 0.4} ${size * 0.6})"/>
      </svg>
    `;
  }

  static getVendorSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="vendorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFD700" />
            <stop offset="100%" stop-color="#DAA520" />
          </linearGradient>
        </defs>
        <rect x="${size * 0.1}" y="${size * 0.3}" width="${size * 0.8}" height="${size * 0.6}" rx="${size * 0.1}" ry="${size * 0.1}" fill="url(#vendorGradient)" stroke="#B8860B" stroke-width="2"/>
        <circle cx="${size / 2}" cy="${size * 0.25}" r="${size * 0.2}" fill="#8B4513" stroke="#5A2D0A" stroke-width="2"/>
        <path d="M${size * 0.4},${size * 0.25} L${size * 0.6},${size * 0.25} M${size / 2},${size * 0.15} L${size / 2},${size * 0.35}" stroke="#FFFFFF" stroke-width="2"/>
        <text x="${size / 2}" y="${size * 0.7}" font-family="Arial" font-size="${size * 0.25}" fill="#FFFFFF" text-anchor="middle" alignment-baseline="middle">$</text>
      </svg>
    `;
  }

  // Generic Boss Sprite (fallback)
  static getBossSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bossGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#FF0000" />
            <stop offset="100%" stop-color="#8B0000" />
          </radialGradient>
        </defs>
        <path d="M${size / 2},0 L${size},${size / 2} L${size / 2},${size} L0,${size / 2} Z" fill="url(#bossGradient)" stroke="#4B0000" stroke-width="3"/>
        <circle cx="${size * 0.3}" cy="${size * 0.3}" r="${size * 0.1}" fill="#FFFFFF"/>
        <circle cx="${size * 0.7}" cy="${size * 0.3}" r="${size * 0.1}" fill="#FFFFFF"/>
        <path d="M${size * 0.3},${size * 0.7} Q${size / 2},${size * 0.8} ${size * 0.7},${size * 0.7}" stroke="#FFFFFF" stroke-width="2" fill="none"/>
        <rect x="${size * 0.45}" y="${size * 0.1}" width="${size * 0.1}" height="${size * 0.2}" fill="#FFEB3B"/>
      </svg>
    `;
  }

  // New letter-specific boss sprites
  static getBossSSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sBossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF4500" />
            <stop offset="100%" stop-color="#B22222" />
          </linearGradient>
        </defs>
        <path d="M${size * 0.8},${size * 0.1} Q${size * 0.9},${size * 0.1} ${size * 0.9},${size * 0.2} L${size * 0.9},${size * 0.4} Q${size * 0.9},${size * 0.5} ${size * 0.8},${size * 0.5} L${size * 0.2},${size * 0.5} Q${size * 0.1},${size * 0.5} ${size * 0.1},${size * 0.6} L${size * 0.1},${size * 0.8} Q${size * 0.1},${size * 0.9} ${size * 0.2},${size * 0.9} L${size * 0.8},${size * 0.9} Q${size * 0.9},${size * 0.9} ${size * 0.9},${size * 0.8} L${size * 0.9},${size * 0.6} Q${size * 0.9},${size * 0.5} ${size * 0.8},${size * 0.5} L${size * 0.2},${size * 0.5} Q${size * 0.1},${size * 0.5} ${size * 0.1},${size * 0.4} L${size * 0.1},${size * 0.2} Q${size * 0.1},${size * 0.1} ${size * 0.2},${size * 0.1} Z" fill="url(#sBossGradient)" stroke="#8B0000" stroke-width="2"/>
        <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.1}" fill="#FFD700" opacity="0.7"/>
      </svg>
    `;
  }

  static getBossISpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="iBossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4CAF50" />
            <stop offset="100%" stop-color="#2E7D32" />
          </linearGradient>
        </defs>
        <rect x="${size * 0.4}" y="${size * 0.1}" width="${size * 0.2}" height="${size * 0.8}" fill="url(#iBossGradient)" stroke="#1B5E20" stroke-width="2"/>
        <rect x="${size * 0.3}" y="${size * 0.1}" width="${size * 0.4}" height="${size * 0.1}" fill="url(#iBossGradient)" stroke="#1B5E20" stroke-width="2"/>
        <rect x="${size * 0.3}" y="${size * 0.8}" width="${size * 0.4}" height="${size * 0.1}" fill="url(#iBossGradient)" stroke="#1B5E20" stroke-width="2"/>
        <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.08}" fill="#FFFFFF" opacity="0.8"/>
      </svg>
    `;
  }

  static getBossMSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mBossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6A1B9A" />
            <stop offset="100%" stop-color="#4A148C" />
          </linearGradient>
        </defs>
        <path d="M${size * 0.1},${size * 0.9} L${size * 0.1},${size * 0.1} L${size * 0.5},${size * 0.5} L${size * 0.9},${size * 0.1} L${size * 0.9},${size * 0.9} Z" fill="url(#mBossGradient)" stroke="#311B92" stroke-width="2"/>
        <circle cx="${size * 0.3}" cy="${size * 0.3}" r="${size * 0.07}" fill="#FFEB3B"/>
        <circle cx="${size * 0.7}" cy="${size * 0.3}" r="${size * 0.07}" fill="#FFEB3B"/>
      </svg>
    `;
  }

  static getBossGSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gBossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFC107" />
            <stop offset="100%" stop-color="#FF8F00" />
          </linearGradient>
        </defs>
        <path d="M${size * 0.9},${size * 0.7} A${size * 0.4},${size * 0.4} 0 1 1 ${size * 0.5},${size * 0.1} A${size * 0.4},${size * 0.4} 0 0 1 ${size * 0.9},${size * 0.5} L${size * 0.9},${size * 0.3} L${size * 0.7},${size * 0.3} L${size * 0.7},${size * 0.5} L${size * 0.5},${size * 0.5} L${size * 0.5},${size * 0.7} L${size * 0.7},${size * 0.7} Z" fill="url(#gBossGradient)" stroke="#FF6F00" stroke-width="2"/>
        <circle cx="${size * 0.7}" cy="${size * 0.4}" r="${size * 0.05}" fill="#FFFFFF"/>
      </svg>
    `;
  }

  static getBossESpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="eBossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00BCD4" />
            <stop offset="100%" stop-color="#00838F" />
          </linearGradient>
        </defs>
        <rect x="${size * 0.1}" y="${size * 0.1}" width="${size * 0.8}" height="${size * 0.15}" fill="url(#eBossGradient)" stroke="#006064" stroke-width="2"/>
        <rect x="${size * 0.1}" y="${size * 0.425}" width="${size * 0.6}" height="${size * 0.15}" fill="url(#eBossGradient)" stroke="#006064" stroke-width="2"/>
        <rect x="${size * 0.1}" y="${size * 0.75}" width="${size * 0.8}" height="${size * 0.15}" fill="url(#eBossGradient)" stroke="#006064" stroke-width="2"/>
        <circle cx="${size * 0.2}" cy="${size * 0.5}" r="${size * 0.05}" fill="#FFFFFF" opacity="0.7"/>
      </svg>
    `;
  }

  static getTimeSlowAbilitySpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="timeSlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#673AB7" />
            <stop offset="100%" stop-color="#512DA8" />
          </linearGradient>
        </defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="url(#timeSlowGradient)" stroke="#311B92" stroke-width="2"/>
        <path d="M${size * 0.5},${size * 0.2} L${size * 0.5},${size * 0.5} L${size * 0.7},${size * 0.7} M${size * 0.5},${size * 0.5} L${size * 0.3},${size * 0.7}" stroke="#FFFFFF" stroke-width="2" fill="none"/>
        <circle cx="${size * 0.5}" cy="${size * 0.2}" r="${size * 0.05}" fill="#FFFFFF"/>
        <text x="${size * 0.5}" y="${size * 0.85}" font-family="Arial" font-size="${size * 0.2}" fill="#FFFFFF" text-anchor="middle" alignment-baseline="middle">T</text>
      </svg>
    `;
  }
}