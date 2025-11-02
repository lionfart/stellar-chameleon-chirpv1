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

  // Placeholder SVG definitions
  static getPlayerSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="#4CAF50" stroke="#2E7D32" stroke-width="2"/>
        <polygon points="${size / 2},${size / 4} ${size / 4},${size / 2} ${size * 3 / 4},${size / 2}" fill="#FFFFFF"/>
      </svg>
    `;
  }

  static getEnemyNormalSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="#F44336" stroke="#D32F2F" stroke-width="2"/>
        <circle cx="${size / 2 - size / 6}" cy="${size / 2 - size / 6}" r="${size / 10}" fill="#FFFFFF"/>
        <circle cx="${size / 2 + size / 6}" cy="${size / 2 - size / 6}" r="${size / 10}" fill="#FFFFFF"/>
        <path d="M${size / 2 - size / 8},${size * 2 / 3} Q${size / 2},${size * 3 / 4} ${size / 2 + size / 8},${size * 2 / 3}" stroke="#FFFFFF" stroke-width="2" fill="none"/>
      </svg>
    `;
  }

  static getEnemyFastSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <polygon points="${size / 2},0 0,${size} ${size},${size}" fill="#FFC107" stroke="#FFA000" stroke-width="2"/>
        <circle cx="${size / 2}" cy="${size * 2 / 3}" r="${size / 8}" fill="#FFFFFF"/>
      </svg>
    `;
  }

  static getEnemyTankySpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="${size - 4}" height="${size - 4}" fill="#9C27B0" stroke="#7B1FA2" stroke-width="2"/>
        <rect x="${size / 4}" y="${size / 4}" width="${size / 2}" height="${size / 2}" fill="#FFFFFF"/>
      </svg>
    `;
  }

  static getProjectileSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <polygon points="${size / 2},0 ${size},${size / 2} ${size / 2},${size} 0,${size / 2}" fill="#00BCD4" stroke="#0097A7" stroke-width="1"/>
      </svg>
    `;
  }

  static getExperienceGemSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <polygon points="${size / 2},0 ${size * 0.8},${size * 0.35} ${size * 0.95},${size} ${size * 0.05},${size} ${size * 0.2},${size * 0.35}" fill="#FFEB3B" stroke="#FBC02D" stroke-width="1"/>
      </svg>
    `;
  }

  static getMagnetPowerUpSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${size * 0.2},0 L${size * 0.2},${size * 0.6} A${size * 0.3},${size * 0.3} 0 0 0 ${size * 0.8},${size * 0.6} L${size * 0.8},0 L${size},0 L${size},${size * 0.6} A${size * 0.5},${size * 0.5} 0 0 1 ${size * 0.5},${size} A${size * 0.5},${size * 0.5} 0 0 1 0,${size * 0.6} L0,0 Z" fill="#2196F3" stroke="#1976D2" stroke-width="2"/>
        <rect x="${size * 0.2}" y="${size * 0.7}" width="${size * 0.6}" height="${size * 0.1}" fill="#FFFFFF"/>
      </svg>
    `;
  }

  static getSpinningBladeSpriteSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <polygon points="${size / 2},0 ${size * 0.75},${size * 0.25} ${size},${size / 2} ${size * 0.75},${size * 0.75} ${size / 2},${size} ${size * 0.25},${size * 0.75} 0,${size / 2} ${size * 0.25},${size * 0.25}" fill="#B0BEC5" stroke="#78909C" stroke-width="1"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 8}" fill="#FFFFFF"/>
      </svg>
    `;
  }

  static getBackgroundTileSVG(size: number): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#222"/>
        <line x1="0" y1="0" x2="${size}" y2="${size}" stroke="#333" stroke-width="1"/>
        <line x1="0" y1="${size}" x2="${size}" y2="0" stroke="#333" stroke-width="1"/>
      </svg>
    `;
  }
}