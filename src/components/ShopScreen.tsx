import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { X } from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'weapon' | 'ability' | 'consumable';
}

interface ShopScreenProps {
  items: ShopItem[];
  onPurchase: (itemId: string) => void;
  onClose: () => void;
  playerGold: number;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ items, onPurchase, onClose, playerGold }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <Card className="w-[600px] p-4 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Vendor Shop</CardTitle>
          <CardDescription className="text-muted-foreground">Current Gold: {playerGold}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground">No items available for purchase.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-md bg-secondary">
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Button
                  onClick={() => onPurchase(item.id)}
                  disabled={playerGold < item.cost}
                  className="ml-4"
                >
                  Buy ({item.cost} Gold)
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopScreen;