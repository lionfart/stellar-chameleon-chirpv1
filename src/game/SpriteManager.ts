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
          <pattern id="grid" width="${size / 5}" height="${size / 5}" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="#333"/>
          </pattern>
          <filter id="f1" x="0" y="0" width="200%" height="200%">
            <feOffset result="offOut" in="SourceGraphic" dx="2" dy="2" />
            <feGaussianBlur result="blurOut" in="offOut" stdDeviation="1" />
            <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
          </filter>
        </defs>
        <rect width="${size}" height="${size}" fill="#222"/>
        <rect width="${size}" height="${size}" fill="url(#grid)" opacity="0.1"/>
        <circle cx="${size / 4}" cy="${size / 4}" r="${size / 8}" fill="#444" opacity="0.7" filter="url(#f1)"/>
        <circle cx="${size * 3 / 4}" cy="${size / 2}" r="${size / 6}" fill="#444" opacity="0.6" filter="url(#f1)"/>
        <rect x="${size / 2}" y="${size / 8}" width="${size / 6}" height="${size / 10}" fill="#444" opacity="0.5" transform="rotate(15 ${size / 2} ${size / 8})" filter="url(#f1)"/>
        <path d="M${size * 0.1} ${size * 0.9} Q${size * 0.3} ${size * 0.7} ${size * 0.5} ${size * 0.9} T${size * 0.9} ${size * 0.7}" stroke="#555" stroke-width="1" fill="none" opacity="0.4"/>
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
}