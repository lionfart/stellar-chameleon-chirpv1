import { GameState } from './GameState';
import { SpriteManager } from './SpriteManager';
import { SoundManager } from './SoundManager';
import { AuraWeapon } from './AuraWeapon';
import { ProjectileWeapon } from './ProjectileWeapon';
import { SpinningBladeWeapon } from './SpinningBladeWeapon';
import { ExplosionAbility } from './ExplosionAbility';
import { ShieldAbility } from './ShieldAbility';
import { showSuccess, showError } from '@/utils/toast';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'weapon' | 'ability' | 'consumable';
}

export class ShopManager {
  private gameState: GameState;
  private spriteManager: SpriteManager;
  private soundManager: SoundManager;
  private onOpenShopCallback: (items: ShopItem[], playerGold: number) => void;
  private onCloseShopCallback: () => void;

  private shopItems: ShopItem[] = [
    { id: 'buy_aura_weapon', name: 'Aura Weapon', description: 'A constant damage aura around you.', cost: 100, type: 'weapon' },
    { id: 'buy_projectile_weapon', name: 'Projectile Weapon', description: 'Fires projectiles at the closest enemy.', cost: 100, type: 'weapon' },
    { id: 'buy_spinning_blade_weapon', name: 'Spinning Blade Weapon', description: 'Blades orbit you, damaging enemies on contact.', cost: 100, type: 'weapon' },
    { id: 'buy_explosion_ability', name: 'Explosion Ability', description: 'Trigger an explosion around you (E key).', cost: 150, type: 'ability' },
    { id: 'buy_shield_ability', name: 'Shield Ability', description: 'Activate a protective shield (Q key).', cost: 150, type: 'ability' },
    { id: 'buy_health_potion', name: 'Health Potion', description: 'Instantly restores 50 health.', cost: 50, type: 'consumable' },
  ];

  constructor(
    gameState: GameState,
    spriteManager: SpriteManager,
    soundManager: SoundManager,
    onOpenShop: (items: ShopItem[], playerGold: number) => void,
    onCloseShop: () => void
  ) {
    this.gameState = gameState;
    this.spriteManager = spriteManager;
    this.soundManager = soundManager;
    this.onOpenShopCallback = onOpenShop;
    this.onCloseShopCallback = onCloseShop;
  }

  openShop() {
    if (this.gameState.showShop) return;
    console.log("ShopManager: Opening shop.");
    this.gameState.showShop = true;
    this.onOpenShopCallback(this.getAvailableShopItems(), this.gameState.player.gold);
  }

  closeShop() {
    if (!this.gameState.showShop) return;
    console.log("ShopManager: Closing shop.");
    this.gameState.showShop = false;
    this.onCloseShopCallback();
  }

  purchaseItem(itemId: string) {
    const item = this.shopItems.find(i => i.id === itemId);
    if (!item) {
      showError("Item not found!");
      return;
    }

    if (this.gameState.player.spendGold(item.cost)) {
      showSuccess(`Purchased ${item.name}!`);
      switch (itemId) {
        case 'buy_aura_weapon':
          this.gameState.auraWeapon = new AuraWeapon(10, 100, 0.5);
          break;
        case 'buy_projectile_weapon':
          this.gameState.projectileWeapon = new ProjectileWeapon(15, 300, 1.5, 8, 3, this.spriteManager.getSprite('projectile'), this.soundManager);
          break;
        case 'buy_spinning_blade_weapon':
          this.gameState.spinningBladeWeapon = new SpinningBladeWeapon(10, 60, 3, 10, 1, this.spriteManager.getSprite('spinning_blade'), this.soundManager);
          break;
        case 'buy_explosion_ability':
          this.gameState.explosionAbility = new ExplosionAbility(50, 150, 5, this.soundManager);
          break;
        case 'buy_shield_ability':
          this.gameState.shieldAbility = new ShieldAbility(40, 100, 10, 10, this.soundManager);
          this.gameState.player.setShieldAbility(this.gameState.shieldAbility);
          break;
        case 'buy_health_potion':
          this.gameState.player.currentHealth = Math.min(this.gameState.player.maxHealth, this.gameState.player.currentHealth + 50);
          break;
        default:
          console.warn(`Unknown item purchased: ${itemId}`);
      }
      this.onOpenShopCallback(this.getAvailableShopItems(), this.gameState.player.gold); // Refresh shop items after purchase
    } else {
      showError("Not enough gold!");
    }
  }

  private getAvailableShopItems(): ShopItem[] {
    return this.shopItems.filter(item => {
      if (item.id === 'buy_aura_weapon' && this.gameState.auraWeapon) return false;
      if (item.id === 'buy_projectile_weapon' && this.gameState.projectileWeapon) return false;
      if (item.id === 'buy_spinning_blade_weapon' && this.gameState.spinningBladeWeapon) return false;
      if (item.id === 'buy_explosion_ability' && this.gameState.explosionAbility) return false;
      if (item.id === 'buy_shield_ability' && this.gameState.shieldAbility) return false;
      return true;
    });
  }
}