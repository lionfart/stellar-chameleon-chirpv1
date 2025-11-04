import React from 'react';
import { Progress } from '@/components/Progress';
import { Icon as LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CooldownDisplayProps {
  Icon: React.ElementType<any>;
  name: string;
  currentCooldown: number;
  maxCooldown: number;
  colorClass: string; // e.g., "text-purple-500"
  iconSizeClass?: string;
  progressBarHeightClass?: string;
}

const CooldownDisplay: React.FC<CooldownDisplayProps> = ({
  Icon,
  name,
  currentCooldown,
  maxCooldown,
  colorClass,
  iconSizeClass = 'h-5 w-5',
  progressBarHeightClass = 'h-5',
}) => {
  const isReady = currentCooldown <= 0;
  const cooldownPercentage = maxCooldown > 0 ? ((maxCooldown - currentCooldown) / maxCooldown) * 100 : 100;
  const cooldownText = isReady ? 'Ready' : `${currentCooldown.toFixed(1)}s`;

  // Extract base color from colorClass for shadow
  const shadowColorClass = colorClass.replace('text-', 'shadow-'); // e.g., "text-purple-500" -> "shadow-purple-500"

  return (
    <div className="flex items-center space-x-2">
      <Icon className={cn(
        iconSizeClass,
        colorClass, // Base color
        isReady && `text-white drop-shadow-lg ${shadowColorClass} animate-glow-icon` // Glow effect when ready, using dynamic shadow color
      )} />
      <div className="flex-1">
        <Progress
          value={cooldownPercentage}
          className={progressBarHeightClass}
          indicatorClassName={cn(
            isReady ? 'bg-green-500' : colorClass.replace('text-', 'bg-'), // Use green when ready, otherwise base color for indicator
            isReady && 'border border-green-300' // Add a subtle border when ready
          )}
          showText
          text={`${name}: ${cooldownText}`}
          isCooldown={!isReady} // Pass isCooldown prop
          isReady={isReady} // Pass isReady prop
        />
      </div>
    </div>
  );
};

export default CooldownDisplay;