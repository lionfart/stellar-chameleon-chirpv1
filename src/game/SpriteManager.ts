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

  // --- Enemy Sprites ---
  static getEnemyNormalSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="goblinBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#5cb85c" />
            <stop offset="100%" stop-color="#449d44" />
          </linearGradient>
          <linearGradient id="goblinEyes" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffeb3b" />
            <stop offset="100%" stop-color="#fbc02d" />
          </linearGradient>
        </defs>
        <!-- Body -->
        <ellipse cx="${size / 2}" cy="${size * 0.6}" rx="${size * 0.4}" ry="${size * 0.3}" fill="url(#goblinBody)" stroke="#398439" stroke-width="1.5"/>
        <!-- Head -->
        <circle cx="${size / 2}" cy="${size * 0.35}" r="${size * 0.25}" fill="url(#goblinBody)" stroke="#398439" stroke-width="1.5"/>
        <!-- Ears -->
        <path d="M${size * 0.25},${size * 0.2} Q${size * 0.2},${size * 0.1} ${size * 0.3},${size * 0.15}" fill="url(#goblinBody)" stroke="#398439" stroke-width="1"/>
        <path d="M${size * 0.75},${size * 0.2} Q${size * 0.8},${size * 0.1} ${size * 0.7},${size * 0.15}" fill="url(#goblinBody)" stroke="#398439" stroke-width="1"/>
        <!-- Eyes -->
        <circle cx="${size * 0.4}" cy="${size * 0.3}" r="${size * 0.08}" fill="url(#goblinEyes)"/>
        <circle cx="${size * 0.6}" cy="${size * 0.3}" r="${size * 0.08}" fill="url(#goblinEyes)"/>
        <!-- Pupils -->
        <circle cx="${size * 0.42}" cy="${size * 0.32}" r="${size * 0.03}" fill="#000"/>
        <circle cx="${size * 0.62}" cy="${size * 0.32}" r="${size * 0.03}" fill="#000"/>
        <!-- Mouth -->
        <path d="M${size * 0.4},${size * 0.45} Q${size / 2},${size * 0.5} ${size * 0.6},${size * 0.45}" stroke="#8B4513" stroke-width="1.5" fill="none"/>
        <!-- Simple Club (optional) -->
        <rect x="${size * 0.7}" y="${size * 0.5}" width="${size * 0.1}" height="${size * 0.3}" fill="#8B4513" transform="rotate(30 ${size * 0.7} ${size * 0.5})"/>
        <circle cx="${size * 0.75}" cy="${size * 0.45}" r="${size * 0.08}" fill="#A0522D"/>
      </svg>
    `;
  }

  static getEnemyFastSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wolfBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#757575" />
            <stop offset="100%" stop-color="#424242" />
          </linearGradient>
          <linearGradient id="wolfEyes" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffc107" />
            <stop offset="100%" stop-color="#ff9800" />
          </linearGradient>
        </defs>
        <!-- Body -->
        <ellipse cx="${size / 2}" cy="${size * 0.7}" rx="${size * 0.4}" ry="${size * 0.25}" fill="url(#wolfBody)" stroke="#212121" stroke-width="1.5"/>
        <!-- Head -->
        <path d="M${size * 0.3},${size * 0.4} Q${size * 0.5},${size * 0.2} ${size * 0.7},${size * 0.4} L${size * 0.6},${size * 0.5} L${size * 0.4},${size * 0.5} Z" fill="url(#wolfBody)" stroke="#212121" stroke-width="1.5"/>
        <!-- Ears -->
        <polygon points="${size * 0.35},${size * 0.3} ${size * 0.45},${size * 0.15} ${size * 0.4},${size * 0.25}" fill="url(#wolfBody)" stroke="#212121" stroke-width="1"/>
        <polygon points="${size * 0.65},${size * 0.3} ${size * 0.55},${size * 0.15} ${size * 0.6},${size * 0.25}" fill="url(#wolfBody)" stroke="#212121" stroke-width="1"/>
        <!-- Eyes -->
        <circle cx="${size * 0.45}" cy="${size * 0.35}" r="${size * 0.05}" fill="url(#wolfEyes)"/>
        <circle cx="${size * 0.55}" cy="${size * 0.35}" r="${size * 0.05}" fill="url(#wolfEyes)"/>
        <!-- Snout -->
        <path d="M${size * 0.48},${size * 0.45} Q${size * 0.5},${size * 0.48} ${size * 0.52},${size * 0.45}" fill="#000"/>
        <!-- Tail (simple) -->
        <path d="M${size * 0.15},${size * 0.6} Q${size * 0.05},${size * 0.5} ${size * 0.1},${size * 0.7}" stroke="url(#wolfBody)" stroke-width="2" fill="none"/>
      </svg>
    `;
  }

  static getEnemyTankySpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ogreBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8BC34A" />
            <stop offset="100%" stop-color="#689F38" />
          </linearGradient>
          <linearGradient id="ogreArmor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#B0BEC5" />
            <stop offset="100%" stop-color="#78909C" />
          </linearGradient>
        </defs>
        <!-- Body -->
        <ellipse cx="${size / 2}" cy="${size * 0.65}" rx="${size * 0.45}" ry="${size * 0.35}" fill="url(#ogreBody)" stroke="#33691E" stroke-width="2"/>
        <!-- Head -->
        <circle cx="${size / 2}" cy="${size * 0.3}" r="${size * 0.28}" fill="url(#ogreBody)" stroke="#33691E" stroke-width="2"/>
        <!-- Horns -->
        <path d="M${size * 0.3},${size * 0.15} Q${size * 0.2},${size * 0.05} ${size * 0.25},${size * 0.25}" fill="#8B4513" stroke="#5A2D0A" stroke-width="1"/>
        <path d="M${size * 0.7},${size * 0.15} Q${size * 0.8},${size * 0.05} ${size * 0.75},${size * 0.25}" fill="#8B4513" stroke="#5A2D0A" stroke-width="1"/>
        <!-- Eyes -->
        <circle cx="${size * 0.4}" cy="${size * 0.25}" r="${size * 0.06}" fill="#FF0000"/>
        <circle cx="${size * 0.6}" cy="${size * 0.25}" r="${size * 0.06}" fill="#FF0000"/>
        <!-- Mouth -->
        <path d="M${size * 0.4},${size * 0.4} Q${size / 2},${size * 0.45} ${size * 0.6},${size * 0.4}" stroke="#000" stroke-width="2" fill="none"/>
        <!-- Armor Plate (chest) -->
        <path d="M${size * 0.3},${size * 0.5} L${size * 0.7},${size * 0.5} L${size * 0.65},${size * 0.7} L${size * 0.35},${size * 0.7} Z" fill="url(#ogreArmor)" stroke="#546E7A" stroke-width="1.5"/>
        <!-- Club (optional) -->
        <rect x="${size * 0.7}" y="${size * 0.6}" width="${size * 0.15}" height="${size * 0.3}" fill="#8B4513" transform="rotate(45 ${size * 0.7} ${size * 0.6})"/>
        <circle cx="${size * 0.8}" cy="${size * 0.6}" r="${size * 0.1}" fill="#A0522D"/>
      </svg>
    `;
  }

  static getEnemyShooterSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="archerBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8B4513" />
            <stop offset="100%" stop-color="#5A2D0A" />
          </linearGradient>
          <linearGradient id="archerClothes" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#A0522D" />
            <stop offset="100%" stop-color="#8B4513" />
          </linearGradient>
          <linearGradient id="archerBow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C0C0C0" />
            <stop offset="100%" stop-color="#808080" />
          </linearGradient>
        </defs>
        <!-- Body -->
        <rect x="${size * 0.4}" y="${size * 0.4}" width="${size * 0.2}" height="${size * 0.4}" fill="url(#archerClothes)" stroke="#5A2D0A" stroke-width="1"/>
        <!-- Head -->
        <circle cx="${size / 2}" cy="${size * 0.35}" r="${size * 0.15}" fill="url(#archerBody)" stroke="#5A2D0A" stroke-width="1"/>
        <!-- Hood -->
        <path d="M${size * 0.3},${size * 0.25} Q${size * 0.2},${size * 0.15} ${size / 2},${size * 0.1} Q${size * 0.8},${size * 0.15} ${size * 0.7},${size * 0.25} Z" fill="url(#archerClothes)" stroke="#5A2D0A" stroke-width="1"/>
        <!-- Eyes -->
        <circle cx="${size * 0.45}" cy="${size * 0.32}" r="${size * 0.03}" fill="#000"/>
        <circle cx="${size * 0.55}" cy="${size * 0.32}" r="${size * 0.03}" fill="#000"/>
        <!-- Bow -->
        <path d="M${size * 0.2},${size * 0.5} Q${size * 0.25},${size * 0.3} ${size * 0.5},${size * 0.35} Q${size * 0.75},${size * 0.3} ${size * 0.8},${size * 0.5}" stroke="url(#archerBow)" stroke-width="2" fill="none"/>
        <line x1="${size * 0.2}" y1="${size * 0.5}" x2="${size * 0.8}" y2="${size * 0.5}" stroke="#000" stroke-width="1"/>
        <!-- Arrow (optional) -->
        <line x1="${size * 0.5}" y1="${size * 0.5}" x2="${size * 0.65}" y2="${size * 0.5}" stroke="#8B4513" stroke-width="1.5"/>
        <polygon points="${size * 0.65},${size * 0.48} ${size * 0.7},${size * 0.5} ${size * 0.65},${size * 0.52}" fill="#8B4513"/>
      </svg>
    `;
  }

  // --- Projectile Sprites ---
  static getProjectileSpriteSVG(size: number): string {
    // Enemy arrow
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="arrowShaft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8B4513" />
            <stop offset="100%" stop-color="#5A2D0A" />
          </linearGradient>
        </defs>
        <rect x="${size * 0.45}" y="0" width="${size * 0.1}" height="${size}" fill="url(#arrowShaft)"/>
        <polygon points="${size * 0.4},0 ${size * 0.6},0 ${size / 2},${size * 0.2}" fill="#C0C0C0"/>
        <polygon points="${size * 0.4},${size} ${size * 0.6},${size} ${size / 2},${size * 0.8}" fill="#FFFFFF"/>
      </svg>
    `;
  }

  static getPlayerProjectileSpriteSVG(size: number): string {
    // Player magic bolt
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="magicBoltGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#81D4FA" />
            <stop offset="100%" stop-color="#03A9F4" />
          </radialGradient>
        </defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="url(#magicBoltGradient)" stroke="#0288D1" stroke-width="1"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 4}" fill="#FFFFFF" opacity="0.8"/>
        <path d="M${size * 0.2},${size * 0.5} L${size * 0.8},${size * 0.5} M${size * 0.5},${size * 0.2} L${size * 0.5},${size * 0.8}" stroke="#FFFFFF" stroke-width="1"/>
      </svg>
    `;
  }

  static getHomingMissileSpriteSVG(size: number): string {
    // Homing magic orb
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="homingOrbGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#FF8A65" />
            <stop offset="100%" stop-color="#FF5722" />
          </radialGradient>
        </defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="url(#homingOrbGradient)" stroke="#E64A19" stroke-width="2"/>
        <path d="M${size * 0.3},${size * 0.4} L${size * 0.7},${size * 0.4} L${size * 0.5},${size * 0.6} Z" fill="#FFFFFF" opacity="0.7"/>
        <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.1}" fill="#FFEB3B"/>
      </svg>
    `;
  }

  static getLaserBeamSpriteSVG(size: number): string {
    // Laser beam (more magical/arcane)
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="arcaneBeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#EEFF41" />
            <stop offset="100%" stop-color="#C6FF00" />
          </linearGradient>
        </defs>
        <rect x="${size * 0.4}" y="0" width="${size * 0.2}" height="${size}" fill="url(#arcaneBeamGradient)" />
        <path d="M${size * 0.4},${size * 0.1} L${size * 0.6},${size * 0.1} L${size * 0.55},${size * 0.2} L${size * 0.45},${size * 0.2} Z" fill="#FFFFFF" opacity="0.8"/>
        <path d="M${size * 0.4},${size * 0.9} L${size * 0.6},${size * 0.9} L${size * 0.55},${size * 0.8} L${size * 0.45},${size * 0.8} Z" fill="#FFFFFF" opacity="0.8"/>
      </svg>
    `;
  }

  // --- Item/Power-up Sprites ---
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

  // --- Environment/NPC Sprites ---
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
          <linearGradient id="vendorRobe" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8B4513" />
            <stop offset="100%" stop-color="#5A2D0A" />
          </linearGradient>
          <linearGradient id="vendorSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFDAB9" />
            <stop offset="100%" stop-color="#E0BBE4" />
          </linearGradient>
          <linearGradient id="vendorCoin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFD700" />
            <stop offset="100%" stop-color="#DAA520" />
          </linearGradient>
        </defs>
        <!-- Body (Robe) -->
        <rect x="${size * 0.3}" y="${size * 0.4}" width="${size * 0.4}" height="${size * 0.5}" rx="${size * 0.05}" ry="${size * 0.05}" fill="url(#vendorRobe)" stroke="#444" stroke-width="1"/>
        <!-- Head -->
        <circle cx="${size / 2}" cy="${size * 0.35}" r="${size * 0.15}" fill="url(#vendorSkin)" stroke="#444" stroke-width="1"/>
        <!-- Hood -->
        <path d="M${size * 0.25},${size * 0.25} Q${size * 0.2},${size * 0.15} ${size / 2},${size * 0.1} Q${size * 0.8},${size * 0.15} ${size * 0.75},${size * 0.25} Z" fill="url(#vendorRobe)" stroke="#444" stroke-width="1"/>
        <!-- Eyes (simple) -->
        <circle cx="${size * 0.45}" cy="${size * 0.32}" r="${size * 0.02}" fill="#000"/>
        <circle cx="${size * 0.55}" cy="${size * 0.32}" r="${size * 0.02}" fill="#000"/>
        <!-- Arms (holding coin) -->
        <rect x="${size * 0.25}" y="${size * 0.5}" width="${size * 0.1}" height="${size * 0.2}" fill="url(#vendorRobe)" transform="rotate(-15 ${size * 0.25} ${size * 0.5})"/>
        <rect x="${size * 0.65}" y="${size * 0.5}" width="${size * 0.1}" height="${size * 0.2}" fill="url(#vendorRobe)" transform="rotate(15 ${size * 0.75} ${size * 0.5})"/>
        <!-- Coin -->
        <circle cx="${size / 2}" cy="${size * 0.6}" r="${size * 0.1}" fill="url(#vendorCoin)" stroke="#B8860B" stroke-width="1"/>
        <text x="${size / 2}" y="${size * 0.62}" font-family="Arial" font-size="${size * 0.1}" fill="#FFFFFF" text-anchor="middle" alignment-baseline="middle">$</text>
      </svg>
    `;
  }

  // --- Boss Sprites ---
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