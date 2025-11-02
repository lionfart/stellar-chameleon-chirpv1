import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LevelUpSelectionProps {
  onSelectUpgrade: (upgradeId: string) => void;
  options: { id: string; name: string; description: string }[];
}

const LevelUpSelection: React.FC<LevelUpSelectionProps> = ({ onSelectUpgrade, options }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <Card className="w-[400px] p-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Level Up!</CardTitle>
          <p className="text-muted-foreground">Choose an upgrade:</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {options.map((option) => (
            <Button
              key={option.id}
              className="w-full h-auto py-3 text-left flex flex-col items-start"
              variant="secondary"
              onClick={() => onSelectUpgrade(option.id)}
            >
              <span className="font-semibold text-lg">{option.name}</span>
              <span className="text-sm text-muted-foreground">{option.description}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default LevelUpSelection;