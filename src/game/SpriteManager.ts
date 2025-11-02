export class SpriteManager {
  private sprites: Map<string, HTMLImageElement>;
  private loadedCount: number;
  private totalCount: number;
  private onAllLoadedCallback: () => void;

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

  // Updated SVG definitions for better sprites
  static getPlayerSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="playerGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#8BC34A" />
            <stop offset="100%" stop-color="#4CAF50" />
          </radialGradient>
        </defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="url(#playerGradient)" stroke="#2E7D32" stroke-width="2"/>
        <polygon points="${size / 2},${size * 0.2} ${size * 0.3},${size * 0.7} ${size * 0.7},${size * 0.7}" fill="#FFFFFF"/>
        <rect x="${size * 0.4}" y="${size * 0.7}" width="${size * 0.2}" height="${size * 0.1}" fill="#FFEB3B"/>
      </svg>
    `;
  }

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

  static getProjectileSpriteSVG(size: number): string {
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
        <rect width="${size}" height="${size}" fill="#1a1a1a"/>
        <line x1="0" y1="0" x2="${size}" y2="${size}" stroke="#333" stroke-width="1"/>
        <line x1="0" y1="${size}" x2="${size}" y2="0" stroke="#333" stroke-width="1"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="2" fill="#444"/>
      </svg>
    `;
  }
}